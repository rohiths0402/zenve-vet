# Zenve Vet: frontend starter (React + JSX + plain CSS)

```bash
npm install
npm run dev      # http://localhost:5173  (proxies /api and /ws to :8000)
npm run build    # must pass before every PR
```

Put the real logo at `public/zenve-logo.png`. Until then a placeholder is shown.

## Who edits what

| Path | Owner | Others |
|---|---|---|
| `src/shared/layout/*` (AppShell, Topbar, Sidebar, menus, navConfig) | Pavitra | request changes via PR comment |
| `src/app/router.jsx`, `vite.config.js`, `package.json` | Rohith | never edit |
| `src/features/feed/**` | Ponnaarthi | |
| `src/features/network/**` (DoctorCard, Search, Profile) | Muzzamil | |
| `src/features/messaging/**` | Chandra Soodan | |
| `src/features/reels/**`, `src/features/auth/**` | Pavitra | |
| `src/features/extras/**` | stretch, unassigned | |

## Rules
- Replace the body of your own `*Page.jsx`; keep the file name and default export.
- The shell already supplies page padding and the cream background. Do not add outer page padding.
- Colours are CSS variables in `src/index.css` (`var(--brand)`, `var(--surface)`, `var(--line)`, `var(--muted)`). Put your own page styles in a CSS file inside your feature folder and import it from your page.
- Cross-feature imports go only through `src/shared/**`.
- Sidebar links live in `navConfig.js`. Unread badge: pass `badges={{ messages: n }}` from AppShell.
