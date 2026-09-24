/**
 * Tailwind v4 `@plugin` entry — basic preset.
 *
 * Usage in `style.css`:
 *
 * ```css
 * @import "tailwindcss";
 * @plugin "@expcat/tigercat-core/tailwind";
 * ```
 *
 * Injects the default preset's light and dark CSS variables.
 * Pass `createTigercatPlugin({ preset })` for another built-in preset.
 */
export { tigercatPlugin as default, createTigercatPlugin } from './tailwind-plugin'
