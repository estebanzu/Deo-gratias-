# Deo Gratias Catalog — Roadmap v2

> **Status:** Phases 1–9 complete (48/48 tests passing).
> **Next:** Phase 10 — Multi-User & Authentication.

---

## Phase 10 — Multi-User & Authentication

- [ ] **User model** — email, password (bcrypt), role (admin/editor/viewer), createdAt
- [ ] **JWT auth** — login/register endpoints, httpOnly cookie tokens
- [ ] **Auth middleware** — protect write endpoints, allow public read
- [ ] **Role-based access** — admin: full access, editor: upload/edit, viewer: read-only
- [ ] **User management UI** — admin panel to invite/remove users
- [ ] **Session persistence** — refresh tokens, auto-logout after inactivity
- [ ] **Rate limiting** — express-rate-limit on auth endpoints

## Phase 11 — CMS & Content Editing

- [ ] **Inline editing** — click-to-edit product names, descriptions, prices on cards
- [ ] **Rich text descriptions** — Markdown or TipTap editor for product descriptions
- [ ] **Bulk edit** — select multiple products to update collection/category/material
- [ ] **Drag-and-drop reorder persistence** — already exists, add visual reorder handle
- [ ] **Undo/redo** — local history stack for metadata changes
- [ ] **Image crop/rotate** — client-side image editing before upload (Cropper.js)
- [ ] **Batch upload** — multi-file upload with progress bars

## Phase 12 — Collections & Catalog Management

- [ ] **Collection CRUD API** — create/rename/delete collections with metadata
- [ ] **Collection cover images** — assign a hero image per collection
- [ ] **Nested collections** — sub-collections (e.g., "Aurora > Rings")
- [ ] **Catalog presets** — save filter/sort/view configurations as named presets
- [ ] **Product comparison** — side-by-side view for 2–4 products
- [ ] **Favorites/wishlist** — star products for quick access

## Phase 13 — Export & Integration

- [ ] **Multi-format export** — CSV, Excel (xlsx), JSON product data
- [ ] **Print-ready PDF** — CMYK color profile, bleed marks, crop marks
- [ ] **Email catalog** — send product links via email (Nodemailer)
- [ ] **Embeddable widget** — iframe/snippet for embedding catalog on external sites
- [ ] **Webhook notifications** — notify on upload, metadata change, PDF generation
- [ ] **Zapier/Make integration** — trigger workflows on catalog events

## Phase 14 — Analytics & Insights

- [ ] **View tracking** — count product views, lightbox opens, PDF downloads
- [ ] **Dashboard** — admin dashboard with charts (views, uploads, popular products)
- [ ] **Search analytics** — what users search for, zero-result queries
- [ ] **Export usage** — track PDF/CSV export frequency
- [ ] **Heatmap integration** — optional Hotjar/Microsoft Clarity snippet

## Phase 15 — PWA & Mobile

- [ ] **Service worker** — offline catalog browsing with cached assets
- [ ] **Manifest.json** — installable as PWA on mobile/desktop
- [ ] **Touch gestures** — swipe navigation in lightbox, pinch-to-zoom
- [ ] **Responsive images** — `srcset` for optimal loading per viewport
- [ ] **Mobile upload** — camera capture directly from mobile browser
- [ ] **Push notifications** — new product alerts for subscribed users

## Phase 16 — Performance & Scale

- [ ] **Image CDN** — serve images via CDN with on-the-fly resizing (imgproxy/Cloudinary)
- [ ] **Database migration** — move from JSON to PostgreSQL with Prisma ORM
- [ ] **GraphQL API** — optional GraphQL layer for flexible queries
- [ ] **Virtual scrolling** — lazy-load cards for catalogs with 500+ products
- [ ] **Background jobs** — Bull/BullMQ for PDF generation, thumbnail creation
- [ ] **WebSocket updates** — real-time collaboration, live cursor positions

## Phase 17 — Internationalization

- [ ] **i18n framework** — next-intl or custom JSON translation system
- [ ] **Multi-language UI** — English, Spanish, French toggle
- [ ] **Localized PDF** — product names/descriptions in selected language
- [ ] **RTL support** — right-to-left layout for Arabic/Hebrew
- [ ] **Currency formatting** — locale-aware price display (USD, EUR, GBP)

## Phase 18 — Security & Compliance

- [ ] **CSRF protection** — csurf middleware for state-changing endpoints
- [ ] **Input sanitization** — DOMPurify for user-generated HTML
- [ ] **File upload scanning** — validate image headers, reject non-image files
- [ ] **Audit log** — track who changed what, when
- [ ] **GDPR tools** — data export, account deletion, consent management
- [ ] **Content Security Policy** — strict CSP headers

---

## Test Coverage Plan

| Phase | Tests |
|-------|-------|
| Phase 10 | Auth flows, role enforcement, session management |
| Phase 11 | Inline editing, bulk operations, image editing |
| Phase 12 | Collection CRUD, presets, comparison |
| Phase 13 | Export formats, email, webhooks |
| Phase 14 | Analytics tracking, dashboard data |
| Phase 15 | PWA offline, service worker, touch gestures |
| Phase 16 | Database queries, CDN integration, WebSockets |
| Phase 17 | Translation loading, RTL layout, currency |
| Phase 18 | Security headers, input validation, audit logging |

## Tech Stack (Additions)

| Layer | New Technology |
|-------|---------------|
| Auth | bcrypt, jsonwebtoken, express-rate-limit |
| Database | PostgreSQL + Prisma (Phase 16) |
| Realtime | Socket.io (Phase 16) |
| PWA | Workbox (Phase 15) |
| i18n | next-intl or custom (Phase 17) |
| Email | Nodemailer (Phase 13) |
| Analytics | Custom + Chart.js (Phase 14) |
