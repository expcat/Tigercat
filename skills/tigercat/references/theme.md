---
name: tigercat-theme
description: Tigercat theme configuration for Tailwind CSS v4, CSS variables, dark mode, and motion
---

# Theme

Tigercat is Tailwind CSS v4-only. Full app CSS lives in [getting-started.md](getting-started.md).
One plugin line: `@plugin "@expcat/tigercat-core/tailwind"`. `@plugin ".../tailwind/modern"` is the
CSS equivalent of `theme="modern"`.

The **runtime** variables components read (`--tiger-primary`, `--tiger-radius-md`,
`--tiger-transition-base`, …) are the public theme API. `tokens.json` generates the default preset
and those same names. Do not load `tokens.css` as a second palette. Layered Figma tokens:
[tokens.md](tokens.md).

First paint comes from the plugin (`:root` / `.dark`). That CSS uses the same `--tiger-*` names
`ThemeManager` writes later, so SSR and client stay aligned. The default plugin still honors
`data-tiger-style="modern"` for CSS-only opt-in.

## Runtime API

The app-layer entry is `ConfigProvider` (`theme` / `colorScheme`). It calls `ThemeManager` on the
**outermost** still-mounted provider and writes `document.documentElement`. Nested ConfigProviders
only change `useTigerConfig()`; they do not restyle a subtree.

```ts
import {
  ThemeManager,
  getThemeColor,
  setThemeColors,
  registerBuiltInThemes
} from '@expcat/tigercat-core'

registerBuiltInThemes() // optional; ThemeManager methods also register
ThemeManager.setTheme('high-contrast')
ThemeManager.setColorScheme('light') // 'light' | 'dark' | 'auto'
setThemeColors({ primary: '#2563eb' })
const primary = getThemeColor('primary')
```

`ThemeManager` merges each preset onto the default theme for that scheme, then writes the full
config (colors, radius, typography, motion, …). Switching to dark does not drop radius or motion.

`getThemeColor('textMuted' | 'fill' | 'bg')` returns the canonical token value (`textSecondary` /
`surfaceMuted` / `surface`), not the `var(--tiger-…)` wrapper. `setThemeColors` with those alias
keys writes the canonical token and keeps the alias as `var(...)`.

Solid fills use on-color tokens: `--tiger-primary-foreground`, `--tiger-secondary-foreground`,
`--tiger-error-foreground`.

## Switches

| Need           | How                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| Dark mode      | `<ConfigProvider colorScheme="dark">`, `<html class="dark">`, or `ThemeManager.setColorScheme()`                  |
| Modern visuals | `<ConfigProvider theme="modern">` **or** `@plugin ".../tailwind/modern"` **or** `ThemeManager.setTheme('modern')` |
| High contrast  | `<ConfigProvider theme="high-contrast">` or `ThemeManager.setTheme('high-contrast')`                              |
| Reduced motion | `prefers-reduced-motion` collapses `--tiger-transition-*` and `--tiger-motion-duration-*`                         |
| RTL            | Prefer locale `direction: 'rtl'`; see [i18n.md](i18n.md)                                                          |

`theme` / `dir` / `lang` are an application-level document singleton. `setTheme` always writes
`document.documentElement`. There is no subtree theme root.

## Motion API

Use core motion helpers instead of duplicating easing and duration logic in framework components.

```ts
import {
  createMotionSequence,
  getComponentMotionStyle,
  getComponentMotionTransition,
  getStaggeredMotionStyle,
  injectViewTransitionStyles,
  startTigercatViewTransition
} from '@expcat/tigercat-core'
```

Component-level animation should use `getComponentMotionStyle()` or
`getComponentMotionTransition()`, which read `--tiger-transition-*`. Multi-item entry uses
`getStaggeredMotionStyle()`. Route/page transitions use `startTigercatViewTransition()` and must
degrade when View Transitions or motion are unavailable.

Next: [getting-started.md](getting-started.md) · [tokens.md](tokens.md) · [i18n.md](i18n.md)
