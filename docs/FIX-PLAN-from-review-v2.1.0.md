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
| A8 | FileManager / Markdown / RTE / Print / ImageAnnotation chrome | done | this commit | 2026-08-25 |
| A9 | VirtualList example stripe | done | this commit | 2026-08-25 |
| A10 | ImageViewer toolbar/nav (same as #19) | done | this commit | 2026-08-25 |
| #2 | Vue Slider v-model | done | this commit | 2026-08-25 |
| #3 | Switch / Stepper / ColorSwatch uncontrolled | done | this commit | 2026-08-25 |
| #4 | Vue Transfer targetKeys | done | this commit | 2026-08-25 |
| #5 | AutoComplete write option.label | done | this commit | 2026-08-25 |
| #6 | React Form validate after updateValue | done | this commit | 2026-08-25 |
| #7 | React Upload controlled fileList | done | this commit | 2026-08-25 |
| #8 | Pagination React pageSize example | done | this commit | 2026-08-25 |
| #9 | Table default pagination uncontrolled | done | this commit | 2026-08-25 |
| #10 | FileManager selectedKeys inner state | done | this commit | 2026-08-25 |
| #11 | Kanban allowAddCard insert | done | this commit | 2026-08-25 |
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

Next: A9 VirtualList example stripe.

## A8 notes

FileManager / Markdown / RTE / Print / ImageAnnotation chrome in the five core utils:

- FileManager container / loading / search: `--tiger-file-manager-bg` -> `--tiger-surface` (`#ffffff` last-resort)
- FileManager toolbar: `--tiger-file-manager-toolbar-bg` -> `--tiger-surface-muted` (`#f9fafb` last-resort)
- Markdown container / body: `--tiger-md-bg` -> `--tiger-surface` (`#ffffff` last-resort); text stays `--tiger-text`
- Markdown toolbar: `--tiger-md-toolbar-bg` -> `--tiger-surface-muted` (`#f9fafb` last-resort)
- RTE container: `--tiger-rte-bg` -> `--tiger-surface` (`#ffffff` last-resort)
- RTE toolbar: `--tiger-rte-toolbar-bg` -> `--tiger-surface-muted` (`#f9fafb` last-resort)
- Print paper: keep `bg-white`; ink `--tiger-print-ink` -> `#111827` (not `--tiger-text`)
- ImageAnnotation unselected tool: `--tiger-annotation-tool-bg` -> `--tiger-surface`; text `--tiger-annotation-tool-text` -> `--tiger-text`; hover `--tiger-surface-muted`

`--tiger-file-manager-*` / `--tiger-md-*` / `--tiger-rte-*` / `--tiger-print-ink` / `--tiger-annotation-tool-*` stay optional first `var()` overrides only; not registered in `THEME_CSS_VARS`. Vue/React consume the core constants. Dark default surface is `#111827` + text `#f9fafb`. Print header/footer `hidden print:block`, FileManager `selectedKeys` inner state, VirtualList stripe, and ImageViewer toolbar left.

Next: A9 VirtualList example stripe.


## A9 notes

VirtualList example stripe in `examples/example/{vue3,react}/src/examples/virtual-list/01`:

- Even rows (`index % 2 === 0`, displayed 第 1/3/5 行): `--tiger-virtuallist-stripe` -> `--tiger-surface-muted` (`#f9fafb` last-resort)
- Odd rows stay transparent over container `--tiger-surface`
- Row text still inherits `--tiger-text`

`--tiger-virtuallist-stripe` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. No new public export (`virtualListContainerClasses` unchanged). Dark default muted is `#1f2937` vs page surface `#111827`.

Next: A10 ImageViewer toolbar/nav.


## A10 notes

ImageViewer chrome in `packages/core/src/utils/image-viewer-utils.ts`:

- Toolbar: `--tiger-image-toolbar-bg` -> `rgba(0,0,0,0.6)` last-resort (no `--tiger-surface`)
- Nav: same fill + `text-white` + `hover:bg-white/20` (ImagePreview nav)
- Counter: same fill + `text-white`

`--tiger-image-toolbar-bg` stays an optional first `var()` override only; not registered in `THEME_CSS_VARS`. Vue/React consume the core constants. Aligns with ImagePreview `--tiger-image-toolbar-bg, rgba(0,0,0,0.6)`. iframe trap left for T5.

Next: Phase C #2 Vue Slider v-model.

## #2 notes

Vue Slider default v-model in `packages/vue/src/components/Slider.ts`:

- Accept optional `modelValue` (same type as `value`; no default, so it does not force controlled mode)
- `updateValue` dual-emits `update:value` + `update:modelValue` + existing `change`
- Resolve bound value: defined `value` first (`v-model:value`), else defined `modelValue` (default `v-model`), else `defaultValue`, else range `[min,max]` / scalar `min`
- Watch both props; an undefined sibling does not wipe a defined one

Examples still use `<Slider v-model>`. React Slider and core `SliderProps` unchanged. Public API addition recorded in CHANGELOG unpublished.

Next: Phase C #3 Switch / Stepper / ColorSwatch uncontrolled.

## #3 notes

Switch / Stepper (Vue+React) and Vue ColorSwatch keep uncontrolled inner state:

- Vue Switch: `modelValue` is `[Boolean, null]` default `null` (not Boolean `false`); `defaultValue` seeds `internalChecked`; controlled when `modelValue !== null`
- React Switch: no `checked = false` destructure; `useControlledState(checked, defaultChecked ?? false, onChange)`
- Vue Stepper: `modelValue` has no default; `defaultValue` (default 0) seeds `inner`; display / step / atMin / atMax use resolved value
- React Stepper: no `value = 0` destructure; `useControlledState(value, defaultValue ?? 0, onChange)`
- Vue ColorSwatch: optional `defaultValue` + `innerValue`; selected mark uses `modelValue ?? inner` (React ColorSwatch already had this)

Bare click / plus / swatch pick updates UI when the parent does not write back. Controlled `v-model` / `checked` / `value` still require parent write-back. Examples unchanged. Public API addition recorded in CHANGELOG unpublished.

Next: Phase C #4 Vue Transfer targetKeys.

## #4 notes

Vue Transfer dual-emits `update:targetKeys` so Pages `v-model:target-keys` binds:

- `moveRight` / `moveLeft` go through `updateTargetKeys` (Slider-style helper)
- Same payload: `update:modelValue` + `update:targetKeys` + existing `change`
- `resolvedTargetKeys` stays `modelValue ?? targetKeys ?? []` (`modelValue` wins)
- No inner target state; no example rewrite (01 still `v-model:target-keys`, 02 still `v-model`)
- React Transfer untouched

Public API addition recorded in CHANGELOG unpublished.

Next: Phase C #5 AutoComplete write option.label.

## #5 notes

AutoComplete (Vue + React) resolves `option.label` on controlled value writeback:

- Core `resolveAutoCompleteDisplayValue(value, options, fallback)`: nullish → fallback; first `String(option.value) === String(value)` → `option.label`; else `String(value)` (numeric `0` is a real value)
- Vue seeds `uncontrolledSearchValue` and `watch([modelValue, options])` through the helper when `searchValue` is undefined
- React seeds `useState` and `useEffect` the same way (`[defaultSearchValue, options, searchValue, value]`)
- `handleSelect` still writes `option.label` and still emits / `onChange`s `option.value`
- Controlled `searchValue` still owns the input
- No example rewrite (02 still `北京 Beijing` / `beijing` + v-model / value+onChange)

Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase C #6 React Form validate after updateValue.


## #6 notes

React FormItem writes the new field value into Form `formValuesRef` before change-triggered validation:

- `extractFormChangeValue`: change event with a target → checkbox/radio `checked`, else `target.value`; bare values (including `0` and `''`) used as-is; no argument / `undefined` skips `updateValue` so the field is not wiped
- Cloned child `onChange` still calls the child's handler, then `updateValue` then `validateField(..., 'change')`
- Existing context `updateValue` writes `formValuesRef` first, then optional Form `onChange`
- Blur path unchanged; Vue Form / FormItem unchanged; examples not rewritten

Pages `/form` React「内置校验」first keystroke no longer keeps the required error. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase C #7 React Upload controlled fileList.

## #7 notes

React Upload controlled `fileList` progress/success/error now `onChange(file, nextList)` with a new array:

- `notifyFileList` copies `[...nextFileList]`, `updateFileList` (uncontrolled), then `onChange?.(file, nextList)`
- Used for non-queue, queue, no-`customRequest` instant success, and chunked completion
- `useControlledState` still has no Upload `onChange` (hook is `(fileList) => void`; Upload stays `(file, fileList) => void`)
- Same-object mutation of the accumulator `uploadFile` kept (Vue-style); array identity is the writeback
- Vue Upload, examples, CropUpload, Pagination untouched

Pages `/upload` React custom upload (fileList + onChange + customRequest) can redraw success. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase C #8 Pagination React pageSize example.

## #8 notes

React pagination/01 controlled `pageSize` now writes back through `onPageSizeChange`:

- Example `examples/example/react/src/examples/pagination/01/App.tsx` keeps `current` + `pageSize` state and `onChange` for page navigation
- Added `onPageSizeChange={(page, size) => { setCurrent(page); setPageSize(size) }}` so the size `<select>` no longer snaps back to 20
- Signature is `(current, pageSize)`; do not pass `setPageSize` directly (first arg is the page)
- Pagination component (React/Vue) unchanged: size changes still fire only `onPageSizeChange`, not `onChange`
- Vue 01 still `v-model:pageSize`; Table left for #9

Pages `/pagination` React「受控分页」can change 20 → 10. Example-only; no CHANGELOG unpublished bullet.

Next: Phase C #9 Table default pagination uncontrolled.

## #9 notes

Table (Vue + React) default pagination is uncontrolled:

- Vue `tableProps.pagination` factory and React `DEFAULT_TABLE_PAGINATION` use `defaultCurrent: 1` / `defaultPageSize: 10` (no `current` / `pageSize`)
- Controlled only when the caller explicitly passes `pagination.current` (and `pageSize` independently)
- Vue still resolves `paginationConfig.current ?? uncontrolled`; React still `isCurrentPageControlled = current !== undefined`
- Bare `<Table>` (omit pagination) Next now changes rows; explicit bound `current` still needs parent writeback
- table/04 stays bound; other table examples stay `pagination={false}`; Pagination component / pagination examples (#8) untouched

Pages `/table` bound demo still works. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase C #10 FileManager selectedKeys inner state.

## #10 notes

FileManager (Vue + React) keeps uncontrolled selectedKeys inner state:

- Vue: selectedKeys has no default (undefined when omitted); defaultSelectedKeys defaults to []; inner is a copy; resolved = selectedKeys !== undefined ? selectedKeys : inner
- React: no selectedKeys = [] destructure; useControlledState(selectedKeys, defaultSelectedKeys ?? [], onSelectedKeysChange)
- deriveFileManagerModel / aria-selected / handleSelect use resolved keys; click writes inner when uncontrolled and always emits
- Bare FileManager (Pages /file-manager 01 unbound) click now sets aria-selected; explicit selectedKeys stays controlled
- file-manager/01 stays unbound; 02 stays bound; handleDrop / update:files and Kanban #11 untouched

Public API addition (defaultSelectedKeys) recorded in CHANGELOG unpublished.

Next: Phase C #11 Kanban allowAddCard insert.

## #11 notes

TaskBoard / Kanban insert a default card when allowAddCard is on and the consumer has no card-add handler:

- Core `appendDefaultTaskBoardCard(columns, columnId, title='New task')` copies columns/cards and appends `{ id: card-N, title }` (ids do not collide with demo `'1'|'2'|'3'`). Unknown columnId returns columns unchanged.
- Vue TaskBoard: click / Enter / Space always emit `card-add`; if `props.onCardAdd == null`, insert via the helper and `updateColumns` (inner + `update:columns`). Does not call `props.onCardAdd`. Vue `@card-add` folds onto the declared prop, so task-board/01 does not double-insert.
- React TaskBoard: parent wrapper inserts only when consumer `onCardAdd` is missing, then `onCardAdd?.(columnId)`. Visibility uses the consumer handler, not the wrapper.
- Vue Kanban still injects a synthetic `onCardAdd` to re-emit `card-add` (prop/listener collision). That would block TaskBoard insert, so the wrapper inserts when `!props.onCardAdd`, emits `update:columns`, and keeps `pendingColumns` for uncontrolled `defaultColumns`. React Kanban is pass-through.
- kanban/01 stays unbound (no `@card-add` / `onCardAdd`); click 3 → 4 via component insert + existing v-model / onColumnsChange. task-board/01 left alone.

Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D remaining P1 from Review 5.2.2 C (#12–#40).
