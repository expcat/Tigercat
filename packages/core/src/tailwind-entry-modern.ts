/**
 * Tailwind v4 `@plugin` entry — modern preset.
 *
 * Usage in `style.css`:
 *
 * ```css
 * @import "tailwindcss";
 * @plugin "@expcat/tigercat-core/tailwind/modern";
 * ```
 *
 * Writes the modern preset to `:root` (same visual as
 * `ThemeManager.setTheme('modern')`). `prefers-reduced-motion` collapses
 * the `--tiger-transition-*` / `--tiger-motion-duration-*` tokens
 * components actually read.
 */
import { createTigercatPlugin } from './tailwind-plugin'

const modernPlugin = createTigercatPlugin({ modern: true })

export default modernPlugin
