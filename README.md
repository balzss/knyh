## Getting Started

Install dependencies:

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## TODO

- [x] create popover for filters
- [x] add layout selector for filter popover
- [x] create separate component for text input with icons
- [x] make it so the search input after clearing focuses the input
- [x] decouple the "content" part from the topnav
- [x] make tags on recipe cards clickable
- [x] create "selection mode" for the topnav
- [x] create 'selection mode' for recipe cards
- [x] add tooltips for recipe card bottom buttons
- [x] create popover for user menu
- [x] add log out button for user avatar popup
- [x] make brandname in topbar clickable (and navigate to home)
- [x] add archive option for selection mode
- [x] make avatar icon focusable
- [x] make recipe cards focusable
- [x] make the filter button in the search bar a Toggle
- [x] create IconButton component with tooltip
- [x] make the brand button/text focusring color primary
- [x] make selection close button and icon button
- [x] create archived route
- [x] add layout for archive page
- [x] create unarchive option for the archive screen
- [x] modify recipecard so it can be used in the archive screen
- [x] indicate if the user is on the archive screen (title + highlight sidebar option)
- [x] add tooltip for filter options (make it IconButton?)
- [x] add tooltip for search clear button
- [x] create PageLayout component
- [x] move search and select topbar content to separate components
- [x] create settings screen
- [x] add setting for dark/light mode
- [x] create compose/edit page
- [x] add sidebar menuitem for main page (Recipes)
- [x] basic layout for create page
- [x] improve sortable input component
- [x] always add empty bottom ingredient item with disable moving until it's filled out
- [x] make new bottom ingredient item sortable after adding value
- [x] make sortible input components removable (with X btn or backspace when empty)
- [x] after removing an item, jump focus to prev? (maybe only when removing with backspace)
- [x] after pressing enter, jump to next ingredient item
- [x] make ingredient list items and title input the same height
- [x] add animation when deleting ingredients
- [x] sidebar on mobile opens when changing page
- [x] deploy to gh pages
- [x] configure eslint and prettier
- [x] fix gh pages deployment
- [x] fine tune prettier/eslint rules
- [x] create better favicon
- [x] tooltips on mobile are acting weird -> https://github.com/shadcn-ui/ui/issues/86
- [x] create subfolder for my custom components
- [x] extract sortable list to separate component
- [x] rename create route to `add`
- [x] `add` route on mobile should have a "close" btn instead of the sidebar toggle (or "back", on desktop the sidebar should stay)
- [x] add animations for recipe card buttons (fade in/out)
- [x] hide layout select on mobile
- [x] add animation when changing search bar content (search -> selection)
- [x] make theme switch a select
- [x] only show sortable item "X" button on hover or focus

- [ ] allow to create ingredient groups
- [ ] jump with up/down arrows between ingredient inputs
- [ ] make sortable drag and drop work with keyboard
