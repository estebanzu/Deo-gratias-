# Deo Gratias Catalog — Development Roadmap

> **Goal:** Build a luxury-grade jewelry digital catalog with a deep-black theme,
> refined animations, premium feel, and full PDF generation capabilities.
> Brand: Deo Gratias — Fine Jewelry.
> "Taking everything from the hands of Divine Providence."

---

## P0 — Critical Redesign Foundation

- [x] **Design token system** — Type scale (fluid `clamp()`), spacing scale (4px base), elevation (xs–xl), animation tokens, radius, 6 semantic colors
- [x] **WCAG AA contrast fix** — Light theme gold updated from `#b4823c` (3.2:1) to `#a67c2e` (4.6:1)
- [x] **CSS variable renames** — `--border-subtle` → `--border-default`, `--text-muted` → `--text-tertiary`, `--shadow-card` → elevation tokens
- [x] **Google Fonts** — Cormorant Garamond (display) + Inter (body), replacing local TTF files
- [x] **Accessibility** — Skip-to-content link, global `focus-visible` ring, `.sr-only` utility, ARIA roles on modals, `aria-live` on count
- [x] **Component tokenization** — All hardcoded values replaced with design tokens across header, hero, grid, cards, toolbar, lightbox, upload modal, PDF settings modal, selection mode, toast, footer, responsive breakpoints
- [x] **48/48 Playwright tests passing** — All features verified across all phases

## Phase 1 — Core Functionality

- [x] **.gitignore** — Properly ignore node_modules, output, uploads, .env, etc.
- [x] **.env support** — dotenv integration for environment configuration (PORT, brand, etc.)
- [x] **Product metadata system** — JSON-based CRUD for name, price, description, collection, category, material, gemstone per image
- [x] **Image upload API** — Multer-based upload endpoint with file type validation
- [x] **Upload drag-and-drop UI** — Drop zone with preview thumbnails and confirmation
- [x] **Lightbox with zoom** — Full-screen image viewer with zoom on hover and keyboard navigation
- [x] **Search and filter** — Text search across name/description/filename with instant filtering
- [x] **Sorting controls** — Sort by name, collection, price, or custom order
- [x] **Filter chips** — Filter by collection, category, material, gemstone with active state

## Phase 2 — Advanced Features

- [x] **Image reordering** — Drag-and-drop reorder with persistence via `/api/reorder`
- [x] **Collections grouping view** — When a collection filter is active, group cards under section headers
- [x] **Dark/light theme toggle** — CSS custom properties with `data-theme` attribute and localStorage persistence
- [x] **Image optimization pipeline** — Cloudinary auto-optimization with on-the-fly WebP thumbnails
- [x] **Caching headers** — Static assets: 1 hour; images: 7 days; API: 30s TTL with ETag
- [x] **Enhanced keyboard navigation** — Tab focus, Enter/Space to open lightbox, arrow keys in lightbox, Escape to close

## Phase 3 — PDF & Export

- [x] **Multi-template PDF support** — Catalog, Line Sheet, and Lookbook templates with distinct layouts
- [x] **Metadata in PDF output** — Descriptions, prices, collections, categories, materials, gemstones rendered per item
- [x] **Multi-page pagination** — Configurable products per page with page numbers
- [x] **PDF caching** — Content-hash-based caching to avoid regenerating identical PDFs
- [x] **PDF settings modal** — Template selector, columns, margins, format, products-per-page controls
- [x] **Selective PDF export** — Checkbox selection on cards to export a subset of products
- [x] **Export mode options** — Export all, selected, or currently filtered products
- [x] **Selection mode** — Toggle selection mode on product cards with visual selection indicators
- [x] **Phase 3 tests** — Playwright tests for PDF modal, selection mode, and export options (17 new tests)

## Phase 4 — Visual Polish & Animations

- [x] **Deep-black luxury palette** — Shift to true rich black (#0A0A0A) with warm undertones
- [x] **Noise/grain texture overlay** — Subtle CSS SVG noise texture at 3.5% opacity
- [x] **Gold gradient shimmer** — Animated gradient sweep on accent elements (brand name, gold buttons)
- [x] **Glassmorphism cards** — Frosted-glass effect with backdrop-filter blur(16px) + saturate
- [x] **Page-load entrance sequence** — Staggered choreographed reveal on catalog and footer
- [x] **Scroll-triggered card reveals** — IntersectionObserver fade-in and slide-up per card
- [x] **Magnetic hover on buttons** — Cursor-relative transform for magnetic micro-interaction
- [x] **Image hover parallax tilt** — 3D tilt based on cursor position within image wrapper
- [x] **Smooth lightbox transitions** — Crossfade between lightbox images with scale transition
- [x] **Hero text letter reveal** — Individual span animation for cinematic title reveal
- [x] **Animated product counter** — Count-up animation using requestAnimationFrame
- [x] **Gold underline draw on hover** — Animated underline from center-out on product names

## Phase 5 — Loading & Placeholders

- [x] **Skeleton loading cards** — Pulse-shimmer skeleton placeholders with glassmorphism
- [x] **Image blur-up placeholder** — Blur(8px) + opacity crossfade on image load

## Phase 6 — Layout & Structure

- [x] **Full-bleed hero with parallax** — Full-viewport hero with radial glow and 0.3x parallax scroll
- [x] **Back-to-top floating button** — Circular button appearing after 400px scroll with gold hover
- [x] **Sticky filter toolbar** — Pinned toolbar below header with backdrop-blur(16px) + semi-transparent bg
- [x] **Grid/list view toggle** — Toggle between grid and horizontal list layout

## Phase 7 — Micro-interactions & Polish

- [x] **Custom cursor on hover** — Luxury "view" circle following mouse on product cards
- [x] **Toast notification redesign** — Slide-in with gold accent bar and auto-dismiss countdown animation
- [x] **Keyboard shortcut hints** — Fade-out hints in lightbox for discoverability
- [x] **Smooth theme transition** — Flash wipe effect when toggling dark/light theme

## Phase 8 — Footer & Branding

- [x] **Redesigned footer** — Structured section with brand name, gold dividers, nav links, copyright
- [x] **Scroll progress indicator** — Thin gold gradient line at viewport top filling as user scrolls

## Phase 9 — Accessibility & UX

- [x] **Focus-visible ring redesign** — Custom 2px gold ring with offset on all interactive elements
- [x] **Reduced motion support** — `prefers-reduced-motion` media query for animation alternatives

---

## Test Coverage

| Phase | Tests |
|-------|-------|
| Phase 1 | Page structure, image catalog, search/filter, lightbox, upload, PDF, themes |
| Phase 2 | Reordering, collections, thumbnails, caching, keyboard navigation |
| Phase 3 | PDF modal (10 tests), selection mode (4 tests), export options (3 tests) |
| P0 | Accessibility (skip-link, focus-visible, ARIA), theme toggle/persistence, collection filters |
| Phase 4–9 | Visual polish, animations, loading, layout, micro-interactions, footer, accessibility (48 total tests) |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| Frontend | Vanilla JS + CSS Custom Properties |
| PDF | Puppeteer |
| Images | Cloudinary (hosting + transformations) |
| Upload | Multer |
| Config | dotenv |
| Tests | Playwright |
| Linting | ESLint + Prettier |
