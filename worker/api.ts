import { Hono } from 'hono'
import { z, ZodError } from 'zod'
import { isEditor, requireEditor, sameOriginWrites } from './auth'
import type { Env } from './env'
import * as db from './db'
import {
  isValidDatabaseSchema,
  normalizeImportData,
  validateUniqueIds,
} from '../src/lib/import-validation'

const groupSchema = z.object({ label: z.string(), items: z.array(z.string()) })

const recipeSchema = z.object({
  title: z.string().trim().min(1).max(500),
  ingredients: z.array(groupSchema).default([]),
  instructions: z.array(z.string()).default([]),
  tags: z.array(z.object({ id: z.string() })).default([]),
  totalTime: z.string().nullable().optional(),
  yield: z.string().nullable().optional(),
  archived: z.boolean().optional(),
})

const recipePatchSchema = recipeSchema.partial()
const bulkPatchSchema = z.object({ ids: z.array(z.string()).min(1), data: recipePatchSchema })
const tagNameSchema = z.object({ displayName: z.string().trim().min(1).max(100) })
const configSchema = z
  .object({
    name: z.string().max(100),
    language: z.enum(['en', 'hu']),
  })
  .partial()
const shoppingListSchema = z.array(z.object({ text: z.string().max(500), checked: z.boolean() }))

export const api = new Hono<{ Bindings: Env }>()

api.use('*', sameOriginWrites)

// Everything that changes data, and the shopping list, needs a valid Access token.
api.use('*', async (c, next) => {
  const method = c.req.method
  const isRead = method === 'GET' || method === 'HEAD'
  if (
    isRead &&
    !c.req.path.startsWith('/api/shopping-list') &&
    !c.req.path.startsWith('/api/export')
  ) {
    return next()
  }
  return requireEditor(c, next)
})

api.onError((error, c) => {
  if (error instanceof ZodError) {
    const detail = error.issues.map((issue) => [...issue.path, issue.message].join(': ')).join('; ')
    return c.json({ message: `Invalid request (${detail})`, issues: error.issues }, 400)
  }
  if (error instanceof SyntaxError) {
    return c.json({ message: 'Invalid JSON body' }, 400)
  }
  if (error instanceof Error && /FOREIGN KEY/i.test(error.message)) {
    return c.json({ message: 'Unknown tag reference' }, 400)
  }
  console.error(error)
  return c.json({ message: 'Internal Server Error' }, 500)
})

// Public: tells the UI whether to show edit controls.
api.get('/session', async (c) => c.json({ editor: await isEditor(c.env, c.req.raw) }))

// ---------- Recipes ----------

api.get('/recipes', async (c) => {
  const archived = c.req.query('archived')
  const wantsArchived = archived === undefined ? undefined : archived === 'true'

  // Archived recipes are private. Visitors only ever get the live ones.
  if (!(await isEditor(c.env, c.req.raw))) {
    if (wantsArchived) return c.json({ message: 'Unauthorized' }, 401)
    return c.json(await db.listRecipes(c.env.DB, false))
  }

  return c.json(await db.listRecipes(c.env.DB, wantsArchived))
})

api.post('/recipes', async (c) => {
  const body = await c.req.json()
  if (!Array.isArray(body) || body.length === 0) {
    return c.json({ message: 'Request body must be a non-empty array of recipes.' }, 400)
  }
  const recipes = z.array(recipeSchema).parse(body)
  return c.json(await db.createRecipes(c.env.DB, recipes), 201)
})

api.patch('/recipes', async (c) => {
  const { ids, data } = bulkPatchSchema.parse(await c.req.json())
  const updated = []
  for (const id of ids) {
    const recipe = await db.updateRecipe(c.env.DB, id, data)
    if (recipe) updated.push(recipe)
  }
  return c.json(updated)
})

api.put('/recipes/:id', async (c) => {
  const data = recipeSchema.parse(await c.req.json())
  const recipe = await db.updateRecipe(c.env.DB, c.req.param('id'), data)
  return recipe ? c.json(recipe) : c.json({ message: 'Recipe not found' }, 404)
})

api.delete('/recipes/:id', async (c) => {
  const deleted = await db.deleteRecipe(c.env.DB, c.req.param('id'))
  return deleted
    ? c.json({ message: 'Recipe deleted successfully' })
    : c.json({ message: 'Recipe not found' }, 404)
})

// ---------- Tags ----------

api.get('/tags', async (c) => c.json(await db.listTags(c.env.DB)))

api.post('/tags', async (c) => {
  const { displayName } = tagNameSchema.parse(await c.req.json())
  if (await db.tagNameTaken(c.env.DB, displayName)) {
    return c.json({ message: `Tag '${displayName}' already exists.` }, 409)
  }
  return c.json(await db.createTag(c.env.DB, displayName), 201)
})

api.patch('/tags/:id', async (c) => {
  const id = c.req.param('id')
  const { displayName } = tagNameSchema.parse(await c.req.json())
  if (await db.tagNameTaken(c.env.DB, displayName, id)) {
    return c.json({ message: 'Tag name already exists' }, 409)
  }
  const tag = await db.renameTag(c.env.DB, id, displayName)
  return tag ? c.json(tag) : c.json({ message: 'Tag not found' }, 404)
})

api.delete('/tags/:id', async (c) => {
  const deleted = await db.deleteTag(c.env.DB, c.req.param('id'))
  return deleted ? c.json({ message: 'Tag deleted' }) : c.json({ message: 'Tag not found' }, 404)
})

// ---------- Config ----------

api.get('/config', async (c) => c.json(await db.getConfig(c.env.DB)))

api.patch('/config', async (c) => {
  const updates = configSchema.parse(await c.req.json())
  return c.json(await db.updateConfig(c.env.DB, updates))
})

// ---------- Shopping list (editor only) ----------

api.get('/shopping-list', async (c) => c.json(await db.getShoppingList(c.env.DB)))

api.put('/shopping-list', async (c) => {
  const items = shoppingListSchema.parse(await c.req.json())
  await db.replaceShoppingList(c.env.DB, items)
  return c.json({ message: 'Shopping list updated successfully' })
})

// ---------- Import / export (editor only) ----------

api.get('/export', async (c) => c.json(await db.exportAll(c.env.DB)))

api.post('/import', async (c) => {
  const body = await c.req.json()
  if (!isValidDatabaseSchema(body)) {
    return c.json({ message: 'Invalid data format - please check your JSON structure' }, 400)
  }
  const data = normalizeImportData(body)
  const uniqueCheck = validateUniqueIds(data)
  if (!uniqueCheck.valid) return c.json({ message: uniqueCheck.error }, 400)

  await db.importAll(c.env.DB, data)
  return c.json({
    message: 'Import successful',
    imported: { recipes: data.recipes.length, tags: data.tags.length },
  })
})
