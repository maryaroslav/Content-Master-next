# 0020. @cm/ui: Material UI themed from the design-system tokens

Status: Accepted

## Context

The design system exists (the "Content Master" Design System artifact on claude.ai: tokens for a light and a dark theme, components, layouts). The app still has 21 global CSS files with hard-coded colours. Phase 10 moves the screens onto a component package; the styling approach and the component base were left open in the plan (D3). A first take with CSS Modules and React Aria Components was dropped before it was committed: a ready component library saves writing buttons, fields, dialogs and menus ourselves.

## Decision

- **Material UI 9 with Emotion** is the component base. Its components are restyled to the design system through the theme (palette, typography, spacing, shape, shadows, and per-component overrides), not used with the Material look.
- **Tokens.** `packages/ui/src/tokens/tokens.json` is the source, in the same shape as the design system's `tokens.json`. `src/theme/` turns it into the MUI theme at runtime: `primary` is the blue accent (MUI paints links, focus, selection and tab indicators with it), the ink of the main action button is the custom `ink` colour, every other design-system colour and the per-scheme shadows are under `palette.cm`. A test fails when a text, mark or control colour misses its WCAG contrast in either theme (`src/tokens/contrast.ts`).
- **CSS variables only from MUI** (`cssVariables`, `--mui-palette-*`, `theme.vars`); no second set of our own. Colour schemes switch on `[data-theme="light|dark"]`.
- **The app is assembled from `@cm/ui` only (a construction kit).** Screens in `apps/web` import no `@mui/*` or `@emotion/*` and write no `sx` or `style`; ESLint rejects both. `@cm/ui` exposes its own API with design-system props (`Typography variant/color/align/truncate`, `Stack direction/gap/align/justify` on the 4px scale, `Button variant="primary|accent|secondary|outline|ghost|danger"`, `IconButton icon/label/dot`, icons by name) and the patterns the screens repeat (`EntityList`/`EntityRow`, `ActionMenu`, `ConfirmDialog`, `WizardDialog`, `LoadingState`, `ErrorState`, `ChoiceCard`, `RadioList`, `ImagePicker`, `Form`, `Card`, `Tag`, `TextLink`, layouts and composites). Inside `@cm/ui`, MUI, `styled()` and `sx` are the implementation; its public props never take `sx`, `style` or `className`. Something missing is added to `@cm/ui` as a prop or a component, with a story.
- **Build: Vite library mode** to `dist/index.js` with a `'use client'` banner and the React Compiler applied; MUI and Emotion stay peer dependencies; types from `tsc`.
- **In the app:** `AppRouterCacheProvider` (`@mui/material-nextjs`) with `enableCssLayer`, so MUI's styles sit in a cascade layer and the unlayered CSS of screens not yet migrated still wins; `UiProvider` (theme and `CssBaseline`). Poppins 400/500/600 through `next/font` (`--font-poppins`, Latin and Latin Extended for Czech).
- **Storybook 10** (`@storybook/react-vite`) with the same `UiProvider`, a light/dark toolbar and addon-a11y set to fail on violations.

Rejected: using MUI components directly on screens with wrappers only where the API differs (tried in 10b: screens filled with `sx` and the same dialogs and rows assembled by hand in several places); CSS Modules with React Aria Components (behaviour and look written by us), Material UI with Pigment CSS (zero runtime, but its Next.js integration is still experimental), Base UI (headless: the look would again be ours to write).

## Consequences

- One source for every value: the app, Storybook and the design system read the same tokens; a change that breaks contrast fails the tests.
- MUI components are client components and Emotion computes styles at runtime; server components render them as client boundaries.
- The Material defaults (ripple, floating labels, elevation, uppercase buttons) have to be overridden component by component in the theme (phase 10b).
- `UiProvider` stays on the light scheme until every screen is on `@cm/ui`; the dark scheme by `prefers-color-scheme` and the theme switch in Settings (cookie, like the locale) come with the last screen, so old screens with fixed colours never mix with dark tokens.
