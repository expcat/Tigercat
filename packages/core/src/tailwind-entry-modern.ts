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
 * Activates the opt-in "modern" visual style. Then any subtree marked
 * with `data-tiger-style="modern"` (e.g. on `<html>`) picks up the
 * modern radius / shadow / glass / gradient / motion overrides; an
 * additional `prefers-reduced-motion` rule collapses motion durations.
 */
import { createTigercatPlugin } from './tailwind-plugin'

const modernPlugin = createTigercatPlugin({ modern: true })

export default modernPlugin
