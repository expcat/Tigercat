---
name: tigercat-theme
description: Tigercat theme configuration for Tailwind CSS v4, CSS variables, dark mode, and motion
---

# Theme

Tigercat is Tailwind CSS v4-only. Theme integration lives in app CSS.

```css
@import 'tailwindcss';
@plugin "@expcat/tigercat-core/tailwind/modern";
```

Load `@expcat/tigercat-core/tokens.css` before app CSS when an app needs zero-flash theme variables on first paint.

```html
<link rel="preload" href="/node_modules/@expcat/tigercat-core/tokens.css" as="style" />
<link rel="stylesheet" href="/node_modules/@expcat/tigercat-core/tokens.css" />
```

## Runtime API

Use the framework-neutral core helpers for runtime theme changes.

```ts
import { ThemeManager, getThemeColor, setThemeColors } from '@expcat/tigercat-core'

ThemeManager.setTheme('high-contrast')
ThemeManager.setColorScheme('light') // 'light' | 'dark' | 'auto'
setThemeColors({ primary: '#2563eb' })
const primary = getThemeColor('primary')
```

## Switches

| Need           | How                                                               |
| -------------- | ----------------------------------------------------------------- |
| Dark mode      | Set `<html class="dark">` or call `ThemeManager.setColorScheme()` |
| Modern visuals | Add `data-tiger-style="modern"` on `<html>` or an ancestor        |
| High contrast  | Call `ThemeManager.setTheme('high-contrast')`                     |
| Reduced motion | Respect `prefers-reduced-motion`; built-in motion helpers do this |
| RTL            | Prefer locale `direction: 'rtl'`; see [i18n.md](i18n.md)          |

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

Component-level animation should use `getComponentMotionStyle()` or `getComponentMotionTransition()`. Multi-item entry uses `getStaggeredMotionStyle()`. Route/page transitions use `startTigercatViewTransition()` and must degrade when View Transitions or motion are unavailable.

## Token Files

Detailed token generation and Figma export notes live in [tokens.md](tokens.md). Props docs only list component-facing theme props.
