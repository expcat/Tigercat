# Tigercat v2.1.0 review fix plan

Source: [REVIEW-pages-source-v2.1.0.md](./REVIEW-pages-source-v2.1.0.md) section 5.

Branch: `fix/review-v2.1.0`. One numbered task per commit. Do not push from this plan.

## Phases

- **Phase A** (1 commit): A0 register `--tiger-text-muted` / `--tiger-fill` / `--tiger-bg`
- **Phase B** (1 commit each): A1 Segmented → A2 Kbd/Tag → A3 Loading mask → A4 Skeleton → A5 Layout/Container → A6 Tree → A7 OrgChart → A8 FileManager/editors/Print/Annotation → A9 VirtualList stripe → A10 ImageViewer toolbar
- **Phase C**: #2 Vue Slider → #3 Switch/Stepper/ColorSwatch → #4 Vue Transfer → #5 AutoComplete → #6 React Form → #7 React Upload → #8 Pagination example → #9 Table default pagination → #10 FileManager selection → #11 Kanban Add
- **Phase D**: remaining P1 from Review section 5.2.2 C table (#12–#40)
- **Phase E**: T5 sandbox
- **Phase F**: section 5.2.3 P2-1..20 (skip if T1 already covers)

## Progress

| ID | Task | Status | Commit | Date (Asia/Shanghai) |
| --- | --- | --- | --- | --- |
| A0 | Register `--tiger-text-muted` → text-secondary, `--tiger-fill` → surface-muted, `--tiger-bg` → surface | done | this commit | 2026-08-25 |
| A1 | Segmented track/indicator tokens | done | this commit | 2026-08-25 |
| A2 | Kbd / Tag default bg+text pair | done | this commit | 2026-08-25 |
| A3 | Loading fullscreen mask | done | this commit | 2026-08-25 |
| A4 | Skeleton surface-muted | done | this commit | 2026-08-25 |
| A5 | Layout / Container examples + Content fallback | done | this commit | 2026-08-25 |
| A6 | Tree root `bg-white` → `--tiger-surface` | done | this commit | 2026-08-25 |
| A7 | OrgChart node fill / title | done | this commit | 2026-08-25 |
| A8 | FileManager / Markdown / RTE / Print / ImageAnnotation chrome | pending | | |
| A9 | VirtualList example stripe | pending | | |
| A10 | ImageViewer toolbar/nav (same as #19) | pending | | |
| #2 | Vue Slider v-model | pending | | |
| #3 | Switch / Stepper / ColorSwatch uncontrolled | pending | | |
| #4 | Vue Transfer targetKeys | pending | | |
| #5 | AutoComplete write option.label | pending | | |
| #6 | React Form validate after updateValue | pending | | |
| #7 | React Upload controlled fileList | pending | | |
| #8 | Pagination React pageSize example | pending | | |
| #9 | Table default pagination uncontrolled | pending | | |
| #10 | FileManager selectedKeys inner state | pending | | |
| #11 | Kanban allowAddCard insert | pending | | |
| #12–#40 | Remaining P1 (Review 5.2.2 C) | pending | | |
| T5 | Pages sandbox viewport | pending | | |
| P2-1..20 | Review 5.2.3 (skip if T1 already covers) | pending | | |

## A0 notes

Registered in `THEME_CSS_VARS` as `textMuted` / `fill` / `bg`. Shared helper `semanticColorsToCssVars` emits:

- `--tiger-text-muted: var(--tiger-text-secondary)`
- `--tiger-fill: var(--tiger-surface-muted)`
- `--tiger-bg: var(--tiger-surface)`

ThemeManager and Tailwind `:root` / `.dark` both use the helper. Not required `ThemeSemanticColors` fields. Dark `--tiger-bg` follows dark `--tiger-surface` (`#111827`).

Next: A3 Loading fullscreen mask.

## A1 notes

Segmented chrome in `packages/core/src/utils/segmented-utils.ts`:

- Track: `--tiger-segmented-bg` -> `--tiger-surface-muted` (`#f9fafb` last-resort)
- Indicator: `--tiger-segmented-active-bg` -> `--tiger-surface-raised` (`#ffffff` last-resort)

`--tiger-segmented-*` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. Vue/React consume the core helpers. Dark default muted/raised are both `#1f2937` vs page surface `#111827`.

Next: A3 Loading fullscreen mask.

## A2 notes

Tag/Kbd default chrome in `packages/core/src/theme-runtime/colors.ts` `defaultTagThemeColors.default`:

- bg: `--tiger-tag-default-bg` -> `--tiger-surface-muted` (`#f9fafb` last-resort)
- text: `--tiger-text` (`#111827` last-resort)

`--tiger-tag-default-bg` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. Kbd default still reuses `getTagVariantClasses('default')`. Other Tag variants and Kbd subtle unchanged. Dark default muted is `#1f2937` + text `#f9fafb`.

Next: A3 Loading fullscreen mask.

## A3 notes

Loading fullscreen mask default in `packages/core/src/utils/loading-utils.ts` `DEFAULT_LOADING_BACKGROUND`:

- `var(--tiger-loading-mask, color-mix(in srgb, var(--tiger-surface, #ffffff) 90%, transparent))`

`--tiger-loading-mask` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. Vue/React consume the core constant. JSDoc `@default` matches. Dark veil follows `--tiger-surface` (`#111827`) at 90% mix. Example `bg-white/85` (loading/02) left for T5/A4.

Next: A4 Skeleton surface-muted.

## A4 notes

Skeleton chrome in `packages/core/src/utils/skeleton-utils.ts`:

- Bar / wave from-to: `--tiger-skeleton-bg` -> `--tiger-surface-muted` (`#f9fafb` last-resort)
- Wave via: `--tiger-skeleton-bg-alt` -> `--tiger-border` (`#e5e7eb` last-resort)

`--tiger-skeleton-*` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. Vue/React consume `getSkeletonClasses`. Dark default muted is `#1f2937` vs page surface `#111827`. Example `bg-white/85` (loading/02) left for T5.

Next: A5 Layout / Container examples + Content fallback.

## A5 notes

Layout Content chrome in `packages/core/src/utils/layout-utils.ts` `layoutContentClasses`:

- Content fill: `--tiger-layout-content-bg` -> `--tiger-surface-muted` (`#f9fafb` last-resort)

`--tiger-layout-content-bg` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. Vue/React consume `getLayoutContentClasses`. Dark default muted is `#1f2937` vs page surface `#111827`.

Examples:

- layout/01 Container (Vue+React): dropped `bg-white` (transparent over page surface)
- layout/02 Content (Vue+React): dropped `!bg-white`; inherits the Content chain (`!p-4` kept)
- layout/03 Content: still `!p-4` only; now inherits surface-muted instead of locked `#f9fafb`

`layoutRootClasses` `min-h-screen` / iframe height left for P2.

Next: A6 Tree root `bg-white` -> `--tiger-surface`.

## A6 notes

Tree chrome in `packages/core/src/utils/tree-utils.ts`:

- Root fill: `--tiger-tree-bg` -> `--tiger-surface` (`#ffffff` last-resort) plus `text-[var(--tiger-text,#111827)]`
- Node hover: `--tiger-tree-node-hover` -> `--tiger-surface-muted` (`#f9fafb` last-resort)
- Empty: `--tiger-text-secondary` (`#6b7280` last-resort)
- Line: `--tiger-border` (`#e5e7eb` last-resort)

`--tiger-tree-*` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. Vue/React consume the core constants / `getTreeNodeClasses`. Dark default surface is `#111827` + text `#f9fafb`. Checkbox `border-gray-300` left.

Next: A7 OrgChart node fill / title.

## A7 notes

OrgChart chrome in `packages/core/src/utils/org-chart-utils.ts`:

- Node fill: `--tiger-org-node-bg` -> `--tiger-surface` (`#ffffff` last-resort)
- Label: `--tiger-org-label` -> `--tiger-text` (`#111827` last-resort)
- Title: `--tiger-org-title` -> `--tiger-text-secondary` (`#6b7280` last-resort)
- Subtitle: `--tiger-org-subtitle` -> `--tiger-text-secondary` (`#6b7280` last-resort)

`--tiger-org-*` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. Vue/React consume the core constants. Dark default surface is `#111827` + text `#f9fafb`. Horizontal `flipLayoutNode` width/height swap left.

Next: A8 FileManager / Markdown / RTE / Print / ImageAnnotation chrome.
