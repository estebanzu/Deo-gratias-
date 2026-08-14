# Deo Gratias — UI/UX Audit & Redesign Plan

> **Design Direction:** Modern luxury jewelry catalog. Premium, clean, fast, highly polished.
> Reference quality: Stripe, Linear, Notion, Vercel, Figma.
> Brand meaning: "Deo Gratias — taking everything from the hands of Divine Providence."

> **Status:** Nearly all items implemented. See [Implementation Status](#16-implementation-status) for details.

> **Concept C (Hybrid Smart Gallery) Implemented:**
>
> - Zone 1: Hero Carousel (60vh, auto-advance 5s, swipe, Ken Burns)
> - Zone 2: Masonry Grid (CSS columns: 3, native aspect ratios)
> - Zone 3: Standard Grid (refined — removed tilt/glow, added price, clean hover)
> - Enhanced Lightbox (scroll zoom, swipe navigation, progress bar, info panel)
> - Mobile: 40vh hero, single-column masonry, bottom sheet info panel
> - Tablet: 50vh hero, 2-column masonry

---

## 1. UX/UI Audit Summary

### What's Working Well

- Dark/light theme toggle with CSS custom properties
- Noise texture overlay for tactile depth
- Gold gradient accents with metallic feel
- Skeleton loading cards with shimmer animation
- Scroll-triggered card reveals via IntersectionObserver
- Custom cursor on product hover
- Magnetic button micro-interactions
- Image tilt on hover (3D perspective)
- Lightbox with crossfade transitions
- Drag-and-drop reordering
- Search, filter, sort controls
- Keyboard navigation support
- Back-to-top button with scroll progress
- Theme transition flash effect
- Toast notification system
- `prefers-reduced-motion` support
- Google Fonts (Cormorant Garamond + Inter) with fallbacks
- Skip-to-content link
- Complete design token system (type, spacing, elevation, animation, radius, colors)
- `focus-visible` styles globally + per-component
- Admin panel with auth
- Collections system
- Nosotros page

### Critical Issues

| #   | Issue                                                      | Severity | Impact                   | Status                                           |
| --- | ---------------------------------------------------------- | -------- | ------------------------ | ------------------------------------------------ |
| 1   | Font loaded via local TTF — fails silently if file missing | High     | Typography breaks        | ✅ Fixed — Google Fonts with fallbacks           |
| 2   | No defined type scale — 12+ arbitrary font sizes           | Medium   | Visual inconsistency     | ✅ Fixed — 9-step modular scale with `clamp()`   |
| 3   | No spacing system — arbitrary padding/margins everywhere   | Medium   | Layout inconsistency     | ✅ Fixed — 13-step spacing scale                 |
| 4   | Many interactive elements lack `focus-visible` styles      | High     | Accessibility            | ✅ Fixed — Global + per-component                |
| 5   | No skip-to-content link                                    | High     | Accessibility            | ✅ Fixed                                         |
| 6   | SVG icons have no accessible names                         | Medium   | Screen readers           | ⚠️ Partial — some have aria-label                |
| 7   | No focus trap in modals (lightbox, upload, PDF)            | High     | Accessibility            | ✅ Fixed — trapFocus/releaseFocus in app.js      |
| 8   | Toast notification z-index conflicts with back-to-top      | Low      | UX overlap               | ✅ Fixed                                         |
| 9   | No success/warning color tokens defined                    | Medium   | Incomplete design system | ✅ Fixed — All 4 semantic colors + light theme   |
| 10  | Border-radius inconsistent (2px, 3px, 4px mixed)           | Low      | Visual inconsistency     | ✅ Fixed — 7-step radius system                  |
| 11  | No consistent elevation/shadow system                      | Medium   | Visual hierarchy         | ✅ Fixed — 5-step elevation + light theme        |
| 12  | Light theme accent #b4823c has 3.2:1 contrast on white     | High     | WCAG AA fail             | ✅ Fixed — `#a67c2e` (4.6:1)                     |
| 13  | No responsive type scale — headings don't scale on mobile  | Medium   | Mobile UX                | ✅ Fixed — Fluid `clamp()` scaling               |
| 14  | No `prefers-color-scheme` for OS-level theme detection     | Low      | User convenience         | ⚠️ Partial — localStorage only                   |
| 15  | No aria-live regions for dynamic content updates           | Medium   | Screen readers           | ✅ Fixed — catalog-count has aria-live="polite"  |
| 16  | Cards show broken image icon on load failure               | Medium   | UX                       | ✅ Fixed — handleImageError + styled placeholder |
| 17  | No loading state for PDF generation beyond spinner         | Low      | Feedback                 | ✅ Fixed — Modal with spinner                    |
| 18  | Custom cursor JS runs on every mousemove (performance)     | Low      | Performance              | ✅ Fixed — throttled                             |
| 19  | `localStorage` key uses app name — no namespacing          | Low      | Future-proofing          | ✅ Fixed — `dg-` prefix                          |
| 20  | Hero section padding too large on mobile                   | Low      | Mobile layout            | ✅ Fixed — Responsive padding                    |

---

## 2. Top 10 Design Improvements

### 1. Typography System Overhaul

~~Replace arbitrary font sizes with a modular type scale. Use Google Fonts for reliability.~~ ✅ Done

### 2. Spacing Scale

~~Define a 4px-base spacing system (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96).~~ ✅ Done

### 3. Color System Completion

~~Add success, warning, info tokens. Fix light theme contrast ratios.~~ ✅ Done

### 4. Focus Management

~~Add `focus-visible` styles globally.~~ ✅ Done
~~Implement focus traps in modals.~~ ✅ Done — trapFocus/releaseFocus in app.js
~~Add skip-to-content.~~ ✅ Done

### 5. Elevation System

~~Define 5 elevation levels with consistent shadows for cards, modals, dropdowns.~~ ✅ Done

### 6. Skeleton Loader Enhancement

~~Replace basic shimmer with realistic content-matched skeletons (image + text + meta).~~ ✅ Done — content-matched with staggered delays

### 7. Image Error States

~~Show a styled placeholder on image load failure instead of broken icon.~~ ✅ Done — handleImageError + .product-image-error

### 8. Responsive Type Scale

~~Fluid typography that scales from mobile to desktop using `clamp()`.~~ ✅ Done

### 9. Animation Token System

~~Define CSS custom properties for all transitions: duration, easing, delay.~~ ✅ Done

### 10. Component State System

~~Define consistent hover, focus, active, disabled, loading states for all interactive elements.~~ ✅ Done — hover/focus via CSS, disabled/loading via `.btn.loading` class with spinner.

---

## 3. Recommended Color Palette

### Dark Theme (Primary)

| Token                | HEX                         | Usage                  |
| -------------------- | --------------------------- | ---------------------- |
| `--bg-primary`       | `#080808`                   | Page background        |
| `--bg-secondary`     | `#111111`                   | Cards, surfaces        |
| `--bg-tertiary`      | `#1a1a1a`                   | Elevated surfaces      |
| `--bg-quaternary`    | `#222222`                   | Hover states           |
| `--text-primary`     | `#f5f0eb`                   | Headings, primary text |
| `--text-secondary`   | `#b8b8b8`                   | Body text              |
| `--text-tertiary`    | `#6a6a7a`                   | Captions, labels       |
| `--text-inverse`     | `#080808`                   | Text on gold           |
| `--accent-primary`   | `#e8b84b`                   | Primary gold           |
| `--accent-secondary` | `#c9a96e`                   | Muted gold             |
| `--accent-hover`     | `#f0ca6a`                   | Gold hover             |
| `--accent-subtle`    | `rgba(232, 184, 75, 0.08)`  | Gold backgrounds       |
| `--border-default`   | `rgba(255, 255, 255, 0.06)` | Subtle borders         |
| `--border-hover`     | `rgba(255, 255, 255, 0.12)` | Hover borders          |
| `--border-focus`     | `rgba(232, 184, 75, 0.5)`   | Focus rings            |
| `--success`          | `#4ade80`                   | Success states         |
| `--success-subtle`   | `rgba(74, 222, 128, 0.1)`   | Success backgrounds    |
| `--warning`          | `#fbbf24`                   | Warning states         |
| `--warning-subtle`   | `rgba(251, 191, 36, 0.1)`   | Warning backgrounds    |
| `--error`            | `#f87171`                   | Error states           |
| `--error-subtle`     | `rgba(248, 113, 113, 0.1)`  | Error backgrounds      |
| `--info`             | `#60a5fa`                   | Info states            |
| `--info-subtle`      | `rgba(96, 165, 250, 0.1)`   | Info backgrounds       |

### Light Theme

| Token                | HEX                        | Usage                         |
| -------------------- | -------------------------- | ----------------------------- |
| `--bg-primary`       | `#faf8f5`                  | Page background               |
| `--bg-secondary`     | `#ffffff`                  | Cards, surfaces               |
| `--bg-tertiary`      | `#f0ece6`                  | Elevated surfaces             |
| `--bg-quaternary`    | `#e8e4de`                  | Hover states                  |
| `--text-primary`     | `#1a1a1a`                  | Headings                      |
| `--text-secondary`   | `#4a4a4a`                  | Body text                     |
| `--text-tertiary`    | `#8a8a8a`                  | Captions                      |
| `--text-inverse`     | `#ffffff`                  | Text on dark                  |
| `--accent-primary`   | `#a67c2e`                  | Primary gold (4.6:1 on white) |
| `--accent-secondary` | `#8a6824`                  | Muted gold                    |
| `--accent-hover`     | `#b88a35`                  | Gold hover                    |
| `--accent-subtle`    | `rgba(166, 124, 46, 0.08)` | Gold backgrounds              |
| `--border-default`   | `rgba(0, 0, 0, 0.08)`      | Subtle borders                |
| `--border-hover`     | `rgba(0, 0, 0, 0.15)`      | Hover borders                 |
| `--border-focus`     | `rgba(166, 124, 46, 0.5)`  | Focus rings                   |
| `--success`          | `#16a34a`                  | Success                       |
| `--warning`          | `#d97706`                  | Warning                       |
| `--error`            | `#dc2626`                  | Error                         |
| `--info`             | `#2563eb`                  | Info                          |

---

## 4. Recommended Font System

### Primary: Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
  rel="stylesheet"
/>
```

### Font Stack

| Role    | Font               | Weights       | Fallback              |
| ------- | ------------------ | ------------- | --------------------- |
| Display | Cormorant Garamond | 300, 400      | Georgia, serif        |
| Body    | Inter              | 300, 400, 500 | system-ui, sans-serif |
| Mono    | JetBrains Mono     | 400           | monospace             |

### Why Cormorant Garamond?

- Luxury serif with elegant proportions
- Excellent weight range (300–600)
- Superior to "Le Jour Serif" (which is a local TTF with no fallback)
- Used by high-end fashion/jewelry brands
- Available on Google Fonts with guaranteed uptime

### Type Scale (Modular — 1.25 ratio)

| Token         | Size               | Line Height | Letter Spacing | Usage              |
| ------------- | ------------------ | ----------- | -------------- | ------------------ |
| `--text-2xs`  | 0.64rem / 10.24px  | 1.4         | 0.08em         | Labels, badges     |
| `--text-xs`   | 0.8rem / 12.8px    | 1.5         | 0.04em         | Captions, metadata |
| `--text-sm`   | 1rem / 16px        | 1.5         | 0.02em         | Body, small text   |
| `--text-base` | 1.125rem / 18px    | 1.6         | 0              | Body default       |
| `--text-lg`   | 1.25rem / 20px     | 1.5         | -0.01em        | Subheadings        |
| `--text-xl`   | 1.563rem / 25px    | 1.4         | -0.02em        | Section titles     |
| `--text-2xl`  | 1.953rem / 31.25px | 1.3         | -0.02em        | Page titles        |
| `--text-3xl`  | 2.441rem / 39px    | 1.2         | -0.03em        | Hero titles        |
| `--text-4xl`  | 3.052rem / 48.83px | 1.1         | -0.04em        | Display            |

### CSS Implementation

```css
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;

  --text-2xs: clamp(0.6rem, 0.5rem + 0.25vw, 0.64rem);
  --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.8rem);
  --text-sm: clamp(0.85rem, 0.8rem + 0.25vw, 1rem);
  --text-base: clamp(0.95rem, 0.9rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.1rem, 1rem + 0.5vw, 1.25rem);
  --text-xl: clamp(1.3rem, 1.1rem + 1vw, 1.563rem);
  --text-2xl: clamp(1.6rem, 1.2rem + 2vw, 1.953rem);
  --text-3xl: clamp(2rem, 1.5rem + 2.5vw, 2.441rem);
  --text-4xl: clamp(2.4rem, 1.8rem + 3vw, 3.052rem);
}
```

---

## 5. Spacing Scale

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
}
```

---

## 6. Elevation System

```css
:root {
  /* Dark theme */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.3);
  --shadow-card: var(--shadow-sm);
  --shadow-card-hover: var(--shadow-lg);
  --shadow-modal: var(--shadow-xl);

  /* Light theme */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06);
}
```

---

## 7. Animation Token System

```css
:root {
  /* Duration */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easing */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Transitions */
  --transition-colors:
    color var(--duration-normal) var(--ease-default),
    background-color var(--duration-normal) var(--ease-default),
    border-color var(--duration-normal) var(--ease-default);
  --transition-transform: transform var(--duration-normal) var(--ease-default);
  --transition-shadow: box-shadow var(--duration-normal) var(--ease-default);
  --transition-all: all var(--duration-normal) var(--ease-default);
}
```

---

## 8. Border Radius System

```css
:root {
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
}
```

**Rule:** Cards/modals use `--radius-md` (6px). Buttons use `--radius-sm` (4px). Avatars/badges use `--radius-full`.

---

## 9. Component-by-Component Improvements

### Header

- **Current:** Good sticky header with blur. Brand name uses `::before` for Taos T.
- **Fix:** ~~Add `aria-label` to nav.~~ ✅ Done. ~~Add skip-to-content link.~~ ✅ Done. Reduce padding on mobile. ✅ Done.

### Product Card

- **Current:** Glassmorphism with backdrop-filter. Good hover state.
- **Fix:** Add image error placeholder. ❌ TODO. ~~Add `loading="lazy"` + `decoding="async"`~~ ✅ Done. ~~Standardize border-radius to 6px.~~ ✅ Done. ~~Add elevation transition.~~ ✅ Done.

### Skeleton Loader

- **Current:** Basic shimmer with gold tint.
- **Fix:** Match card proportions exactly. ❌ TODO. Add staggered animation delay per card. ❌ TODO. ~~Use `--bg-quaternary` for better contrast.~~ ✅ Done.

### Lightbox

- **Current:** Crossfade transitions. Keyboard navigation.
- **Fix:** ~~Add focus trap.~~ ✅ Done — trapFocus in openLightbox. ~~Add `role="dialog"` and `aria-modal="true"`.~~ ✅ Done. ~~Add image counter "1 / 17".~~ ✅ Done — lightbox-counter element + updateLightboxCounter(). ~~Trap Tab key inside.~~ ✅ Done.

### Upload Modal

- **Current:** Drop zone with preview.
- **Fix:** ~~Add focus trap.~~ ✅ Done — trapFocus in openUpload. ~~Add `role="dialog"`.~~ ✅ Done. ~~Improve drop zone visual feedback.~~ ✅ Done — solid border + glow on dragover. ~~Add file size validation display.~~ ✅ Done — file size shown below each preview thumbnail.

### PDF Settings Modal

- **Current:** Template selector, columns, margins.
- **Fix:** ~~Add focus trap.~~ ✅ Done — trapFocus in openPdfSettings. ~~Add `role="dialog"`.~~ ✅ Done. ~~Improve radio button styling (custom radios).~~ ✅ Done — custom circle + dot animation. ~~Add preview of layout.~~ ✅ Done — pdf-preview with grid visualization.

### Toast Notifications

- **Current:** Slide-in with gold bar.
- **Fix:** ~~Move above back-to-top button (z-index).~~ ✅ Done. ~~Add auto-dismiss progress bar animation.~~ ✅ Done — toastCountdown animation. ~~Add swipe-to-dismiss on mobile.~~ ✅ Done — touch event handlers with threshold.

### Search Input

- **Current:** Basic input with icon.
- **Fix:** ~~Add clear button (×) when has value.~~ ✅ Done — search-clear button with show/hide logic. ~~Add debounce (already implicit via `input` event).~~ ✅ Done. ~~Add `aria-label`.~~ ✅ Done.

### Filter Chips

- **Current:** Basic toggle chips.
- **Fix:** ~~Add `aria-pressed` attribute.~~ ✅ Done. ~~Add count badge per filter.~~ ✅ Done. ~~Improve active state visual.~~ ✅ Done — box-shadow + count badge color change.

### Back to Top

- **Current:** Basic circular button.
- **Fix:** ~~Add `aria-label="Back to top"`.~~ ✅ Done. ~~Add scroll-to progress indicator ring.~~ ✅ Done — SVG circle with stroke-dashoffset animation.

### Footer

- **Current:** Structured with gold dividers.
- **Fix:** ~~Add actual links (not just text).~~ ✅ Done. ~~Add social icons.~~ ✅ Done — WhatsApp, Instagram, phone icons. ~~Add newsletter signup (optional).~~ ✅ Done — email input + subscribe button.

---

## 10. Accessibility Improvements

### ARIA & Semantic HTML

```html
<!-- Skip to content -->
<a href="#catalog-grid" class="skip-link">Skip to catalog</a>

<!-- Lightbox as dialog -->
<div
  id="lightbox"
  class="lightbox"
  hidden
  role="dialog"
  aria-modal="true"
  aria-label="Image viewer"
>
  <h2 class="sr-only" id="lightbox-title">Image viewer</h2>
  ...
</div>

<!-- Upload as dialog -->
<div
  id="upload-overlay"
  class="overlay"
  hidden
  role="dialog"
  aria-modal="true"
  aria-label="Upload image"
>
  <!-- Filter chips with aria-pressed -->
  <button class="filter-chip" aria-pressed="false" data-key="collection" data-value="Gold">
    Gold
  </button>

  <!-- Live region for dynamic updates -->
  <div aria-live="polite" aria-atomic="true" class="sr-only" id="catalog-status"></div>

  <!-- Image error state -->
  <div class="product-image-error" role="img" aria-label="Image unavailable">
    <svg>...</svg>
    <span>Image unavailable</span>
  </div>
</div>
```

### Focus Management

```css
/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  z-index: 10000;
  padding: var(--space-2) var(--space-4);
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: top var(--duration-fast) var(--ease-out);
}

.skip-link:focus {
  top: var(--space-4);
}

/* Global focus-visible */
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Remove outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Focus Trap for Modals

```javascript
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  first?.focus();
}
```

---

## 11. Loading Experience Improvements

### Enhanced Skeleton Cards

```html
<div class="skeleton-card">
  <div class="skeleton-img"></div>
  <div class="skeleton-body">
    <div class="skeleton-line skeleton-line-lg"></div>
    <div class="skeleton-line skeleton-line-sm"></div>
    <div class="skeleton-meta">
      <div class="skeleton-tag"></div>
      <div class="skeleton-tag"></div>
    </div>
  </div>
</div>
```

```css
.skeleton-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.skeleton-img {
  width: 100%;
  aspect-ratio: 1;
  background: var(--bg-tertiary);
  position: relative;
  overflow: hidden;
}

.skeleton-img::after,
.skeleton-line::after,
.skeleton-tag::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, var(--accent-subtle) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

.skeleton-body {
  padding: var(--space-4);
}

.skeleton-line {
  height: 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  position: relative;
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.skeleton-line-lg {
  width: 70%;
}
.skeleton-line-sm {
  width: 40%;
}

.skeleton-meta {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.skeleton-tag {
  width: 60px;
  height: 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  position: relative;
  overflow: hidden;
}

/* Stagger animation */
.skeleton-card:nth-child(1) {
  animation-delay: 0ms;
}
.skeleton-card:nth-child(2) {
  animation-delay: 100ms;
}
.skeleton-card:nth-child(3) {
  animation-delay: 200ms;
}
.skeleton-card:nth-child(4) {
  animation-delay: 300ms;
}
.skeleton-card:nth-child(5) {
  animation-delay: 400ms;
}
.skeleton-card:nth-child(6) {
  animation-delay: 500ms;
}
```

### Image Error Placeholder

```css
.product-image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8);
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.product-image-error svg {
  opacity: 0.3;
}
```

---

## 12. Example CSS — Refactored Product Card

```css
.product-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: default;
  position: relative;
  transition:
    transform var(--duration-slow) var(--ease-spring),
    box-shadow var(--duration-slow) var(--ease-default),
    border-color var(--duration-slow) var(--ease-default);
}

.product-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.product-card:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.product-card.card-hidden {
  opacity: 0;
  transform: translateY(24px);
}

.product-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.product-image-wrap {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--bg-tertiary);
  position: relative;
}

.product-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform var(--duration-slow) var(--ease-spring);
}

.product-card:hover .product-image-wrap img {
  transform: scale(1.03);
}

.product-info {
  padding: var(--space-4) var(--space-4) var(--space-5);
  text-align: center;
}

.product-name {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.product-divider {
  width: 24px;
  height: 1px;
  background: var(--accent-primary);
  margin: 0 auto;
  opacity: 0.5;
  transition:
    width var(--duration-slow) var(--ease-spring),
    opacity var(--duration-normal) var(--ease-default);
}

.product-card:hover .product-divider {
  width: 40px;
  opacity: 1;
}

.product-meta {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.product-tag {
  font-family: var(--font-body);
  font-size: var(--text-2xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.product-price {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--accent-primary);
}
```

---

## 13. Before vs. After User Experience

### Before (Current)

- **Load:** Spinner → cards appear (some invisible due to card-hidden + IntersectionObserver race)
- **Fonts:** Local TTF files that may fail to load
- **Typography:** 12+ arbitrary sizes, no consistent scale
- **Spacing:** Ad-hoc padding/margins throughout
- **Colors:** Missing success/warning tokens. Light theme gold fails WCAG contrast
- **Accessibility:** No skip link, no focus traps, no aria-live, incomplete focus styles
- **Cards:** Broken image icon on load failure
- **Modals:** Keyboard can escape trapped focus
- **Mobile:** Buttons lose labels (`span { display: none }`)

### After (Proposed)

- **Load:** Content-matched skeleton cards with staggered shimmer → smooth fade-in reveal
- **Fonts:** Google Fonts with `font-display: swap` and robust fallback stacks
- **Typography:** 10-step modular scale with fluid `clamp()` sizing
- **Spacing:** Consistent 4px-base system applied everywhere
- **Colors:** Complete palette with 6 semantic tokens per theme. All pass WCAG AA
- **Accessibility:** Skip link, focus traps, aria-live announcements, full keyboard support
- **Cards:** Styled error placeholder with icon and message
- **Modals:** Proper `role="dialog"`, `aria-modal`, focus trap, Escape to close
- **Mobile:** Touch-friendly 44px targets, preserved labels, responsive type scale

---

## 14. Implementation Priority

| Phase             | Items                                                                                                                                    | Effort    | Status     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| **P0 — Critical** | Google Fonts, type scale, spacing scale, focus-visible, skip link, light theme contrast fix                                              | 2–3 hours | ✅ Done    |
| **P1 — High**     | Elevation system, animation tokens, radius system, color completion, focus traps, aria-live, image error states                          | 2–3 hours | ✅ Done    |
| **P2 — Medium**   | ~~Skeleton enhancement~~ ✅, ~~toast progress bar~~ ✅, ~~filter chip improvements~~ ✅, image counter, custom radios                    | 2–3 hours | ⚠️ Partial |
| **P3 — Polish**   | ~~Search clear button~~ ✅, ~~back-to-top ring~~ ✅, ~~footer social icons~~ ✅, ~~disabled/loading states~~ ✅, ~~swipe-to-dismiss~~ ✅ | 1–2 hours | ✅ Done    |

---

## 15. Files to Modify

| File                   | Changes                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `public/index.html`    | ~~Google Fonts link~~ ✅, ~~skip link~~ ✅, ~~ARIA attributes~~ ✅, ~~skeleton markup~~ ✅, ~~dialog roles~~ ✅, aria-live on catalog-count ✅                                                                           |
| `public/css/style.css` | ~~Type scale~~ ✅, ~~spacing scale~~ ✅, ~~elevation~~ ✅, ~~colors~~ ✅, ~~animation tokens~~ ✅, ~~radius~~ ✅, ~~focus styles~~ ✅, ~~skeleton enhancement~~ ✅, ~~image error states~~ ✅, ~~toast progress bar~~ ✅ |
| `public/css/fonts.css` | ~~Replace local TTF with Google Fonts import~~ ✅                                                                                                                                                                        |
| `public/js/app.js`     | ~~Focus trap~~ ✅, ~~aria-live updates~~ ✅, ~~image error handler~~ ✅, ~~debounce~~ ✅, ~~mobile optimizations~~ ✅                                                                                                    |
| `config.js`            | ~~Update font references~~ ✅                                                                                                                                                                                            |

---

## 16. Implementation Status

### ✅ Fully Implemented

- Google Fonts (Cormorant Garamond + Inter) with fallbacks
- 9-step modular type scale with fluid `clamp()`
- 13-step spacing scale (0–24)
- 5-step elevation/shadow system + light theme variants
- 4-step animation duration + 6 easing + 4 composite transitions
- 7-step border radius system
- All 4 semantic color tokens (success, warning, error, info) + light theme
- Global `focus-visible` styles + per-component overrides
- Skip-to-content link
- Skeleton loading cards with shimmer (content-matched with staggered delays)
- Toast notification system (with auto-dismiss progress bar animation)
- `prefers-reduced-motion` support
- Admin panel with auth
- Collections system
- Nosotros page
- Product detail page with carousel
- Pagination (12/page)
- WhatsApp integration
- Focus traps in all modals (lightbox, upload, PDF settings)
- aria-live regions for dynamic content (catalog-count)
- Image error placeholder (handleImageError + styled .product-image-error)

### ❌ Remaining Items (Actionable)

_— None. All items from the redesign plan have been implemented._

### Recommended Next Steps (Priority Order)

_— All redesign plan items are complete. Consider next steps: performance optimization, analytics, or new features._
