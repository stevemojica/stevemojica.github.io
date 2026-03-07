# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build locally
- `npm test` — Run all tests once (vitest)
- `npm run test:watch` — Run tests in watch mode
- `npx vitest run src/components/FeedbackButton.test.jsx` — Run a single test file

## Architecture

Personal portfolio site built with React 19 + Vite 7. Tests use Vitest + React Testing Library with jsdom.

### Entry Points & Routing

- `src/main.jsx` — App entry point, renders into `#root` with BrowserRouter and ThemeProvider
- `src/App.jsx` — Root component with route definitions (lazy-loads ZendeskDashboard)
- Routes: `/` (home), `/post/:id` (blog), `/tools` and `/tools/:slug` (tools), `/social` (social post generator), `/zendesk` (dashboard)

### Directory Structure

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Root component with routing
├── ThemeContext.jsx           # Dark/light theme provider (localStorage + system preference)
├── styles.css                # Global styles (CSS custom properties, cyberpunk/glassmorphism theme)
├── test-setup.js             # Vitest setup (mocks for CSS.supports, IntersectionObserver, matchMedia)
├── components/               # React components with co-located .test.jsx files
│   ├── Hero.jsx, Navbar.jsx, About.jsx, Blog.jsx, BlogPost.jsx
│   ├── Projects.jsx, Skills.jsx, Contact.jsx, Journey.jsx
│   ├── ClaudePlugins.jsx, Tools.jsx, ToolDetail.jsx
│   ├── FeedbackButton.jsx, ThemeToggle.jsx, CursorGlow.jsx, ContribGraph.jsx
│   ├── SocialPostGenerator.jsx
│   └── zendesk/              # Zendesk ticket dashboard (9 chart components using Recharts)
├── hooks/
│   └── useZendeskData.js     # Custom hook for Zendesk API (parallel fetches, auto-refresh, caching)
├── services/
│   ├── zendeskApi.js         # Zendesk API client (credential management, rate limiting, 5-min cache)
│   └── zendeskTransform.js   # Pure data transformation functions for dashboard charts
├── tools/
│   └── social-post-generator.js  # Tool registry entry
└── posts/                    # Markdown blog posts with front-matter metadata
```

### Secondary Project

`reminders-app/` — Cross-platform reminders app (React + Electron + Capacitor) with its own package.json, vite config, and test suite. Independent from the main portfolio site.

## Key Configuration

- `vite.config.js` — Vite + React plugin + custom Zendesk CORS proxy (dev only) + Vitest config (globals enabled, jsdom environment)
- `index.html` — SPA redirect handler for GitHub Pages
- `public/404.html` — Custom 404 that redirects to index for client-side routing
- `.github/workflows/deploy.yml` — CI/CD: install → test → build → deploy to GitHub Pages (triggers on push to `master`)

## Conventions

- **Component files**: PascalCase `.jsx` in `src/components/`
- **Tests**: Co-located as `ComponentName.test.jsx` next to the component; service tests as `serviceName.test.js`
- **Styling**: CSS custom properties defined in `src/styles.css` with dark (default) and light theme variants via `[data-theme="light"]`
- **Theme**: Managed via React Context (`ThemeContext.jsx`), persisted to localStorage, respects `prefers-color-scheme`
- **Blog posts**: Markdown files in `src/posts/` with YAML front-matter (title, date, tags, excerpt)
- **Module system**: `"type": "commonjs"` in package.json; Vite handles ESM for source files
- **Branch workflow**: `master` is the deploy branch; feature branches use `claude/` prefix

## Dependencies

- **UI**: React 19, React Router 6, Recharts 3, react-markdown, react-github-calendar
- **Markdown**: remark-gfm, rehype-raw for GitHub-flavored markdown with raw HTML
- **Dev**: Vite 7, @vitejs/plugin-react, Vitest 4, @testing-library/react + jest-dom + user-event, jsdom
