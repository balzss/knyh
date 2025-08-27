# KNYH Recipe Manager

A modern, open-source recipe management application built with Next.js 15. KNYH (pronounced "KONYHA", meaning "kitchen" in Hungarian) is designed to help you organize, create, and share your recipes with a clean, intuitive interface.

## ✨ Features

### 📝 Recipe Management
- **Dual Input Modes**: Create recipes using a structured form or write them in markdown
- **Drag & Drop**: Reorder ingredients and instructions with intuitive drag-and-drop
- **Rich Metadata**: Track cooking time, servings, and custom tags
- **Archive System**: Archive recipes you no longer use without deleting them
- **Duplicate Recipes**: Quickly create variations of existing recipes

### 🏷️ Organization
- **Smart Tagging**: Create and manage tags to categorize your recipes
- **Advanced Filtering**: Filter recipes by multiple tags simultaneously
- **Search Functionality**: Find recipes quickly with integrated search
- **Random Recipe**: Get inspired with a random recipe suggestion

### 🛒 Shopping List
- **Integrated Shopping List**: Add ingredients directly from recipes
- **Interactive Checkboxes**: Mark items as completed while shopping
- **Drag & Drop Sorting**: Organize your shopping list by store layout

### 🌐 Deployment Flexibility
- **Dual Architecture**: Works with SQLite database or as a static site
- **Static Export**: Deploy to GitHub Pages, Netlify, or any static hosting
- **Self-Hosted**: Run with SQLite for full database functionality
- **Progressive Web App**: Install as a native app on mobile devices

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Themes**: Choose your preferred visual theme
- **Internationalization**: Currently supports English and Hungarian
- **Offline Support**: Service worker enables offline functionality
- **Bulk Operations**: Select multiple recipes for batch operations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/balzss/knyh.git
   cd knyh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 🌐 Demo

Try the live demo: [https://balzss.github.io/knyh/](https://balzss.github.io/knyh/)

## 📦 Deployment Options

### Static Deployment (GitHub Pages, Netlify, etc.)
Perfect for personal use or sharing with family/friends:

```bash
npm run export
```

This creates a static build in the `build/` directory that can be deployed to any static hosting service.

### Self-Hosted with Database
For full functionality with persistent storage:

```bash
npm run build
npm start
```

This runs the app with SQLite database support for multiple users and persistent data.

### Migration Between Modes
Switch between SQLite and static export:

```bash
# Convert SQLite database to JSON for static export
npm run export:json

# Convert JSON data to SQLite database
npm run migrate
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: SQLite (Better-SQLite3) with JSON fallback
- **State Management**: TanStack Query, Zustand
- **Animations**: Motion (Framer Motion successor)
- **Internationalization**: next-intl
- **PWA**: Serwist (Service Worker)
- **Drag & Drop**: DND Kit
- **Forms**: React Hook Form with Zod validation

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            
│   ├── ui/                # Reusable UI components (Radix-based)
│   ├── custom/            # Application-specific components
│   └── TopBarContent/     # Dynamic toolbar components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and core logic
│   ├── database.ts        # SQLite operations
│   ├── data-config.ts     # Environment detection
│   └── types.ts           # TypeScript definitions
├── providers/             # React context providers
└── i18n/                  # Internationalization setup
```

## 🔧 Configuration

### Environment Variables
- `NEXT_OUTPUT_MODE=export` - Enables static export mode
- `NEXT_PUBLIC_BASE_PATH` - Base path for deployment (set automatically)

### Data Storage
The app automatically detects the environment:
- **Development/Production**: Uses SQLite database (`data/recipes.db`)
- **Static Export**: Uses JSON file (`public/data/data.json`)

## 🧪 Testing

```bash
npm test          # Run tests with Vitest
npm run test:ci   # Run tests in CI mode
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Adding New Features
- Components should be added to `src/components/custom/` and exported from `index.ts`
- Use the existing hooks pattern for data management (`useRecipes`, `useTags`, etc.)
- Follow the dual-architecture pattern for data operations
- Add translations to `messages/{locale}.json`

## 📄 License

This project is open source and available under the [GNU General Public License v3.0](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Drag and drop functionality by [DND Kit](https://dndkit.com/)

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [existing issues](https://github.com/balzss/knyh/issues)
2. Create a new issue with a clear description
3. Include steps to reproduce the problem
4. Mention your environment (browser, OS, Node.js version)

---

Made with ❤️ for home cooks who love to organize their recipes digitally.
