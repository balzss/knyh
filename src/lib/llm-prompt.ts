/**
 * Instructions to paste into an LLM so that its answer imports cleanly in markdown mode.
 * The rules mirror parseMarkdown in recipe-utils.ts. Change them together.
 */
export const LLM_RECIPE_PROMPT = `Convert the recipe text I give you into the plain text format my recipe app imports. Reply with the converted recipe only, with no code fence, introduction or commentary.

Rules for each recipe:
1. The first line is the title, written as a level-one heading: a hash sign, a space, then the title. Never use any other heading.
2. Optionally, right after the title, add a metadata block: a line with three dashes, then a "yield:" line and a "time:" line, then a closing line with three dashes. Yield is free text, usually the number of servings. Time is the total time from start to finish, written like 1:30, 1h 30m or 45m. Include only the lines the source supports, and leave the whole block out if the source gives neither.
3. Next come the ingredients, one per line, each line starting with a dash and a space. Keep the quantity, unit and name together on the same line. Put every ingredient in a single list, with no sub-headings and no groups.
4. Then a blank line, then the steps in order, one per line. Each step is one or more complete sentences on a single line, with no line breaks inside it. Numbering the steps is optional, because the app numbers them.
5. Write nothing after the last step. Every remaining line is read as a step, so leave out notes, tips, nutrition facts, sources and extra headings.

To give me several recipes in one reply, start each next recipe with its own title heading.

Keep the language and wording of the source recipe. Do not invent quantities, times or steps that the source does not state. If the source has no ingredients or no steps, ask me for them instead of guessing.

The recipe text to convert:`
