# Contributing to Deo Gratias Catalog

## Prerequisites

- Node.js >= 18.0.0
- npm
- Playwright (for tests)

## Setup

```bash
git clone <repo-url>
cd deo-gratias-catalog
npm install
cp .env.example .env
```

## Development

```bash
npm run dev
```

Server runs at `http://localhost:3015`. Place jewelry images in `./images/`.

## Project Structure

```
deo-gratias-catalog/
├── server.js              # Express server, API routes
├── config.js              # Environment + defaults
├── lib/
│   ├── pdf-generator.js   # Puppeteer PDF generation
│   ├── metadata.js        # JSON product metadata CRUD
│   └── thumbnails.js      # Sharp WebP thumbnail pipeline
├── public/
│   ├── index.html         # Single-page app
│   ├── css/
│   │   ├── style.css      # All styles (design tokens, components)
│   │   └── fonts.css      # Local font-face declarations
│   └── js/
│       └── app.js         # Frontend logic (vanilla JS)
├── data/
│   └── products.json      # Product metadata store
├── images/                # User-provided jewelry images
├── output/                # Generated PDFs
├── tests/
│   └── catalog.spec.js    # Playwright test suite
└── docs/
    └── API.md             # API reference
```

## Code Style

- **Formatter:** Prettier (single quotes, trailing commas, 100 width, semicolons)
- **Linter:** ESLint
- **CSS:** Custom properties (design tokens), no hardcoded values
- **JS:** Vanilla ES6+, no frameworks, IIFE module pattern

```bash
npx eslint .
npx prettier --check .
```

## Design Tokens

All colors, spacing, typography, and animations use CSS custom properties defined in `:root` and `[data-theme]`. Never hardcode values — always reference tokens:

```css
/* Good */
color: var(--text-primary);
padding: var(--space-4);

/* Bad */
color: #f5f0eb;
padding: 1rem;
```

## Testing

```bash
npm test
```

Playwright tests run against a live server. Tests use `state: 'attached'` for cards because IntersectionObserver doesn't fire in headless mode. After `page.reload()`, force grid visible:

```js
await page.evaluate(() => {
  const grid = document.getElementById('catalog-grid');
  if (grid) grid.hidden = false;
  document.querySelectorAll('.product-card').forEach((c) => {
    c.classList.add('visible');
    c.classList.remove('card-hidden');
    c.style.opacity = '1';
    c.style.transform = 'none';
  });
});
```

## Branching

- `main` — stable, all tests pass
- `feature/*` — new features
- `fix/*` — bug fixes

## Commit Messages

Use present tense: "Add lightbox zoom", not "Added lightbox zoom".

## Pull Requests

1. All 48+ tests must pass
2. ESLint + Prettier clean
3. No hardcoded values (use design tokens)
4. Update roadmap.md if adding features
