import { render } from '@cf-wasm/og/workerd'
import type { Env } from './env'
import { formatTotalTime } from '../shared/time'

// The card has no viewer locale, so it uses the language the recipes are written in.
const TIME_LABELS = { hours: 'óra', minutes: 'perc' }

type Card = {
  id: string
  title: string
  totalTime: string | null
  yield: string | null
  tags: { id: string; displayName: string }[]
}

// The app's dark theme: near-black background, warm off-white text, peach accent.
const COLORS = { bg: '#101010', fg: '#f7f5fb', muted: '#a0a0a0', accent: '#ffcba3' }

let fonts: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer; logo: string }> | undefined

function loadAssets(env: Env, origin: string) {
  fonts ??= (async () => {
    const get = (path: string) =>
      env.ASSETS.fetch(new URL(path, origin)).then((r) => r.arrayBuffer())
    const [regular, bold, logo] = await Promise.all([
      get('/fonts/noto-sans-latin-400-normal.woff'),
      get('/fonts/noto-sans-latin-700-normal.woff'),
      get('/cooking-pot-192.png'),
    ])
    return { regular, bold, logo: `data:image/png;base64,${toBase64(logo)}` }
  })()
  fonts.catch(() => (fonts = undefined))
  return fonts
}

function toBase64(buffer: ArrayBuffer) {
  let binary = ''
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

// The same Lucide icons the recipe page uses next to the yield and the time.
const ICONS = {
  yield:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  time: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
}

function icon(name: keyof typeof ICONS, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

type Node = { type: string; props: Record<string, unknown> }
function h(type: string, style: Record<string, unknown>, children?: unknown, extra = {}): Node {
  return { type, props: { style: { display: 'flex', ...style }, children, ...extra } }
}

function titleSize(title: string) {
  if (title.length <= 24) return 104
  if (title.length <= 48) return 84
  return 68
}

export async function renderCard(env: Env, origin: string, recipe: Card) {
  const { regular, bold, logo } = await loadAssets(env, origin)
  const colors = COLORS

  // Same order as the recipe page: yield first, then time.
  const time = formatTotalTime(recipe.totalTime, TIME_LABELS)
  const facts = [
    recipe.yield ? { icon: icon('yield', colors.muted), text: recipe.yield } : null,
    time ? { icon: icon('time', colors.muted), text: time } : null,
  ].filter((fact): fact is { icon: string; text: string } => !!fact)
  const tags = recipe.tags.slice(0, 6)

  const tree = h(
    'div',
    {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      background: colors.bg,
      color: colors.fg,
      fontFamily: 'Noto Sans',
    },
    [
      h('div', { flexDirection: 'column' }, [
        h(
          'div',
          {
            fontSize: titleSize(recipe.title),
            fontWeight: 700,
            lineHeight: 1.1,
            lineClamp: 3,
          },
          recipe.title
        ),
        facts.length
          ? h(
              'div',
              { marginTop: 28, gap: 36, fontSize: 34, color: colors.muted },
              facts.map((fact) =>
                h('div', { alignItems: 'center', gap: 12 }, [
                  h('img', { width: 36, height: 36 }, undefined, {
                    src: fact.icon,
                    width: 36,
                    height: 36,
                  }),
                  h('div', {}, fact.text),
                ])
              )
            )
          : null,
        tags.length
          ? h(
              'div',
              { marginTop: 40, gap: 16, flexWrap: 'wrap' },
              tags.map((tag) =>
                h(
                  'div',
                  {
                    fontSize: 30,
                    padding: '6px 22px',
                    borderRadius: 999,
                    border: `3px solid ${colors.accent}`,
                    color: colors.accent,
                  },
                  tag.displayName
                )
              )
            )
          : null,
      ]),
      h('div', { alignItems: 'center', gap: 20 }, [
        h('img', { width: 56, height: 56 }, undefined, { src: logo, width: 56, height: 56 }),
        h(
          'div',
          { fontSize: 32, fontWeight: 700, letterSpacing: 4, color: colors.accent },
          'KONYHA'
        ),
      ]),
    ]
  )

  const { image } = await render(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Noto Sans', data: regular, weight: 400, style: 'normal' },
      { name: 'Noto Sans', data: bold, weight: 700, style: 'normal' },
    ],
  }).asPng()
  return image
}
