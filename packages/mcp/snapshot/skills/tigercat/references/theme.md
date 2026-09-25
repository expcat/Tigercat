---
name: tigercat-theme
description: Tigercat theme configuration for Tailwind CSS v4, CSS variables, dark mode, and motion
---

# Theme

Tigercat is Tailwind CSS v4-only. Full app CSS lives in [getting-started.md](getting-started.md).
One plugin line: `@plugin "@expcat/tigercat-core/tailwind"`.

The runtime variables components read (`--tiger-primary`, `--tiger-radius-md`,
`--tiger-transition-base`, …) are the public theme API. `tokens.json` generates those names.
Do not load a second palette, alias variables, or a `data-tiger-style` layer.

First paint comes from the plugin (`:root` / `.dark`). `colorScheme="auto"` does not stamp
`.dark`; it follows the class or `data-tiger-color-scheme` already on `<html>`.

## Runtime API

`ConfigProvider` (`theme` / `colorScheme` / `dir`) is the app entry. The outermost mounted
provider owns `<html>`: theme, color scheme, `dir`, and `lang`. Nested providers only change
`useTigerConfig()`. Each root keeps its own scope. An earlier root unmounting does not clear a
later sibling's `dir`.

`lang` on `<html>` is this layer's locale id (`locale.locale`). A locale overlay with no id
does not replace an existing `lang`.

```ts
import {
  createTigerThemeScope,
  readTigerDocumentTheme,
  setThemeColors,
  getThemeColor
} from '@expcat/tigercat-core'

const scope = createTigerThemeScope()
scope.setTheme('high-contrast')
scope.setColorScheme('light') // 'light' | 'dark' | 'auto'
setThemeColors({ primary: '#2563eb' })
const primary = getThemeColor('primary')
readTigerDocumentTheme() // { theme, colorScheme: 'light' | 'dark' }
scope.dispose()
```

A scope merges the preset onto the default theme for that scheme, then writes colors, radius,
typography, motion, and spacing. Switching scheme does not drop radius or motion.

`getThemeColor` reads canonical keys (`textSecondary`, `surfaceMuted`, `surface`). There is no
`textMuted` / `fill` / `bg` alias.

Solid fills use on-color tokens: `--tiger-primary-foreground`, `--tiger-secondary-foreground`,
`--tiger-error-foreground`.

## Switches

| Need           | How                                                                                  |
| -------------- | ------------------------------------------------------------------------------------ |
| Dark mode      | `<ConfigProvider colorScheme="dark">` or `<html class="dark">` before paint          |
| Modern visuals | `<ConfigProvider theme="modern">` or `createTigercatPlugin({ preset: modernTheme })` |
| High contrast  | `<ConfigProvider theme="high-contrast">`                                             |
| Reduced motion | One `prefers-reduced-motion` switch sets duration variables to `0ms`                 |
| RTL            | `dir` on ConfigProvider, or locale `direction`. See [i18n.md](i18n.md)               |

`theme` on the document is `data-tiger-theme`. The scope root paints
`background-color: var(--tiger-surface)` and `color: var(--tiger-text)` with the active scheme.

A nested provider that sets `theme` restyles that subtree. It uses its own `colorScheme`, or the
parent scheme when it does not set one. `document={false}` supplies context only and lets a
descendant own `<html>`.

## Motion

Durations are `--tiger-motion-duration-quick`, `--tiger-motion-duration-base`, and
`--tiger-motion-duration-slow`. Easing is `--tiger-motion-ease-standard`. Transitions list
properties; they do not use `all`.

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

Component motion should read those variables. Route transitions use `startTigercatViewTransition()`
and degrade when View Transitions or reduced motion are unavailable.

Next: [getting-started.md](getting-started.md) · [tokens.md](tokens.md) · [i18n.md](i18n.md)
