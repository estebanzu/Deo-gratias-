# Temoin Catalog — Frontend Improvement Plan

> **Goal:** Transform the current functional catalog into a polished, luxury-grade
> jewelry experience with a deep-black theme, refined animations, and premium feel.

---

## Current State Summary

The catalog works: dark/light theme, search, sort, filter, lightbox, upload, PDF,
drag-reorder, keyboard shortcuts. But the visual experience feels like a well-coded
template — not a luxury jewelry brand. Animations are minimal (just hover lifts),
there's no scroll reveals, no loading skeletons, no texture, and the overall feel
lacks the atmospheric depth of a high-end atelier.

---

## Improvements

### Theme & Color

- [ ] **1. Deep-black luxury palette** — Shift from navy (#1A1A2E) to true rich black
      (#0A0A0A) with subtle warm undertones. Use #111111 for cards, #1A1A1A for
      surfaces. Gold accent stays (#EFC07B) but add a secondary muted gold (#C9A96E)
      for secondary elements. This creates the "black box jewelry store" feel.

- [ ] **2. Noise/grain texture overlay** — Add a subtle CSS noise texture (SVG
      filter or tiny PNG) over the body at low opacity (2-4%). This breaks the
      flat digital look and adds tactile depth associated with luxury print.

- [ ] **3. Gold gradient shimmer on accent elements** — Replace flat gold on the
      brand name, dividers, and buttons with a subtle linear gradient
      (#C9A96E → #EFC07B → #C9A96E) that gives a metallic sheen feel.

- [ ] **4. Glassmorphism cards** — Give product cards a frosted-glass effect:
      `backdrop-filter: blur(12px)` with a semi-transparent background
      (`rgba(255,255,255,0.03)`) and a 1px border with `rgba(255,255,255,0.06)`.
      Hover reveals a soft gold glow border.

### Animations & Motion

- [ ] **5. Page-load entrance sequence** — On initial load, stagger-animate the
      header → hero title → subtitle → hero lines → toolbar → cards. Use CSS
      `@keyframes` with `animation-delay` for a choreographed reveal. Each element
      fades up from 20px below with opacity 0→1 over 600ms.

- [ ] **6. Scroll-triggered card reveals** — Use `IntersectionObserver` to fade-in
      and slide-up each product card as it enters the viewport. Cards start at
      `opacity: 0; transform: translateY(30px)` and animate to full visibility.
      Stagger by 80ms per card for a cascade effect.

- [ ] **7. Magnetic hover on buttons** — On mouseenter, calculate cursor position
      relative to button center and apply a subtle `transform: translate(dx, dy)`
      (max 3-4px). On mouseleave, spring back. This creates the "magnetic"
      micro-interaction common in luxury sites.

- [ ] **8. Image hover parallax tilt** — On card hover, apply a subtle 3D tilt
      based on cursor position within the image wrapper. Use CSS `perspective`
      and `transform: rotateX() rotateY()` with 2-3 degree max rotation.
      Creates a "jewelry display case" feel.

- [ ] **9. Smooth lightbox transitions** — When navigating between lightbox images,
      fade the current image out (opacity 0, slight scale down), swap source, then
      fade in (opacity 1, scale 1). 300ms crossfade instead of instant swap.

- [ ] **10. Hero text letter reveal** — Split "The Collection" into individual
      `<span>` elements per letter. On load, each letter animates in with a
      staggered fade-up (40ms delay per letter). Creates a cinematic title
      reveal.

- [ ] **11. Animated product counter** — When the catalog loads or filters change,
      animate the count number from 0 to final value using `requestAnimationFrame`.
      Gives a premium "counting up" feel.

- [ ] **12. Gold underline draw on hover** — For the brand name and section titles,
      animate a gold underline from center-out on hover using `scaleX(0 → 1)`
      with `transform-origin: center`.

### Loading & Placeholders

- [ ] **13. Skeleton loading cards** — Replace the spinner with 6 skeleton cards
      that pulse with a subtle shimmer animation. Each skeleton mimics the real
      card layout (image placeholder + two text lines). Uses CSS gradient
      animation for the "shimmer sweep" effect.

- [ ] **14. Image blur-up placeholder** — Before each image loads, show a tiny
      inline blurred version (or a solid color from the card background) that
      crossfades into the full image once loaded. Use `<img>` with
      `opacity: 0 → 1` transition on `load` event.

### Layout & Structure

- [ ] **15. Full-bleed hero with parallax** — Make the hero section full-width
      with a subtle background gradient or texture. Add a scroll-based parallax
      effect where the hero content moves slower than the scroll speed (0.5x
      rate). Fades out as you scroll past.

- [ ] **16. Back-to-top floating button** — A small circular button with a gold
      chevron that appears after scrolling 400px. Smooth-scrolls to top on
      click. Fades in/out with a subtle scale animation.

- [ ] **17. Sticky filter toolbar** — When scrolling past the toolbar, pin it to
      the top (below the header) with a subtle backdrop-blur. Shows active filter
      count as a badge. Smooth transition from static to sticky.

- [ ] **18. Grid/list view toggle** — Add a toggle button (grid icon / list icon)
      next to the sort dropdown. Grid view shows the current card layout. List
      view shows a horizontal card with image on left, details on right. Animate
      the transition between views with a FLIP animation.

### Micro-interactions & Polish

- [ ] **19. Custom cursor on hover** — When hovering over product cards, change
      the cursor to a custom "view" circle (CSS `cursor: none` + a positioned
      `<div>` that follows the mouse with "View" text inside). Luxury sites
      often use this for immersive browsing.

- [ ] **20. Toast notification redesign** — Replace the basic toast with a
      slide-in from the right edge, with a gold left-border accent and a
      subtle progress bar that counts down the auto-dismiss timer. Add a
      manual close button.

- [ ] **21. Keyboard shortcut hints** — Show subtle keyboard shortcut hints in
      the lightbox (← → to navigate, Esc to close) that fade out after 2
      seconds. Helps users discover shortcuts without cluttering the UI.

- [ ] **22. Smooth theme transition** — When toggling dark/light, add a brief
      (200ms) screen flash or wipe effect using a `::before` pseudo-element
      that scales from the toggle button position. Makes the theme switch
      feel intentional, not jarring.

### Footer & Branding

- [ ] **23. Redesigned footer** — Transform the single-line footer into a
      structured section: brand name (large, serif), a row of gold divider
      lines, navigation links (if applicable), social placeholders, and a
      "© 2026 Temoin" copyright. Add a subtle top border with gold gradient.

- [ ] **24. Scroll progress indicator** — A thin gold line at the very top of
      the viewport (below the header) that fills from left to right as the
      user scrolls. Indicates reading/catalog position. Uses a fixed
      `<div>` with `scaleX()` driven by scroll position.

### Accessibility & UX

- [ ] **25. Focus-visible ring redesign** — Replace the default browser outline
      with a custom 2px gold ring with 2px offset on all interactive elements.
      Ensure it's visible on both dark and light themes.

- [ ] **26. Reduced motion support** — Wrap all animations in
      `@media (prefers-reduced-motion: no-preference)` so users who prefer
      reduced motion see instant state changes instead of animations.

---

## Implementation Priority

| Phase | Items | Effort |
|-------|-------|--------|
| **P0 — Core Feel** | 1, 2, 3, 5, 6, 13 | High impact, moderate effort |
| **P1 — Interactions** | 7, 8, 9, 10, 11, 12 | Medium impact, moderate effort |
| **P2 — Layout** | 15, 16, 17, 18 | Medium impact, lower effort |
| **P3 — Polish** | 4, 14, 19, 20, 21, 22 | Lower impact, varied effort |
| **P4 — Final** | 23, 24, 25, 26 | Lower impact, low effort |

---

## Files to Modify

| File | Changes |
|------|---------|
| `public/css/style.css` | Palette, textures, animations, skeleton, glassmorphism, cursor, scroll progress |
| `public/css/fonts.css` | No changes needed |
| `public/js/app.js` | IntersectionObserver, lightbox transitions, animated counter, magnetic buttons, tilt, skeleton, blur-up, back-to-top, scroll progress, custom cursor |
| `public/index.html` | Skeleton markup, back-to-top button, scroll progress bar, footer restructure, letter spans for hero |
| `config.js` | Updated color values |

---

## Estimated Total Effort

~26 tasks across 4 files. Approximately 3-4 hours of focused implementation.
