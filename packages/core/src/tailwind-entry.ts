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
 * Injects Tigercat's default light/dark CSS variables and `MODERN_BASE`
 * fallback tokens. To opt-in to the visual "modern" style instead, use
 * `@expcat/tigercat-core/tailwind/modern`.
 */
export { tigercatPlugin as default } from './tailwind-plugin'
