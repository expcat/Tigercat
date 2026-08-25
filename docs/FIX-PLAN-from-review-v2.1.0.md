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
| #12 | ButtonGroup child selectors | done | this commit | 2026-08-25 |
| #13 | Rate half-star clip | done | this commit | 2026-08-25 |
| #14 | Avatar getInitials short token | done | this commit | 2026-08-25 |
| #15 | Empty 预设一览 preview grid | done | this commit | 2026-08-25 |
| #16 | Result 状态一览 preview grid | done | this commit | 2026-08-25 |
| #22 | Input Vue dual buttons | done | this commit | 2026-08-25 |
| #21 | InputGroup compact | done | this commit | 2026-08-25 |
| #23 | Input errorMessage below field | done | this commit | 2026-08-25 |
| #25 | Signature strokes setPointerCapture / document up | done | this commit | 2026-08-25 |
| #24 | MaskInput hidden raw submit | done | this commit | 2026-08-25 |
| #26 | InputNumber attrs onto spinbutton | done | this commit | 2026-08-25 |
| #27 | Vue Radio group disabled | done | this commit | 2026-08-25 |
| #17 | QRCode drop dead `level` / decorative | done | this commit | 2026-08-25 |
| #18 | ImagePreview maskClosable mask click | done | this commit | 2026-08-25 |
| #28 | ColorPicker 初值/alpha | done | this commit | 2026-08-25 |
| #29 | Splitter sizes parse + init min | done | this commit | 2026-08-25 |
| #34 | Calendar mode=year month emit + disabledDate | done | this commit | 2026-08-25 |
| #36 | OrgChart direction=horizontal keep node size | done | this commit | 2026-08-25 |
| #37 | Scatter animated non-circle keep translate | done | this commit | 2026-08-25 |
| #39 | ChatWindow Vue drop onUpdated scroll | done | this commit | 2026-08-25 |
| #40 | TaskBoard 过滤下落点 | done | this commit | 2026-08-25 |
| #30 | Affix offsetBottom relative to target | done | this commit | 2026-08-25 |
| #31 | DropdownItem close-on-click | done | this commit | 2026-08-25 |
| #32 | Anchor / ScrollSpy current item | done | this commit | 2026-08-25 |
| #33 | FloatButton default plus + Group placement/offset/portal | done | this commit | 2026-08-25 |
| #35 | Table virtual scroll box overflow only around body | done | this commit | 2026-08-25 |
| #38 | Sunburst showLabels midAngle labels | done | this commit | 2026-08-25 |
| #20 | ImagePreview/ImageViewer iframe (Phase E T5) | done | this commit | 2026-08-25 |
| T5 | Pages sandbox viewport | done | this commit | 2026-08-25 |
| P2-1 | Pages sandbox viewport (T5 leftover overlays) | done | this commit | 2026-08-25 |
| P2-2 | Message / Alert token | done | this commit | 2026-08-25 |
| P2-3 | Menu theme=light | done | this commit | 2026-08-25 |
| P2-4 | Collapse a11y inert/aria-hidden + extra stopPropagation | done | this commit | 2026-08-25 |
| P2-5 | parseDate YYYY-MM-DD local calendar day | done | this commit | 2026-08-25 |
| P2-6 | Cascader / TreeSelect keyboard | done | this commit | 2026-08-25 |
| P2-7 | Tour mask close + Vue last-step onClose | done | this commit | 2026-08-25 |
| P2-8 | Table sort keyboard + dataKey | done | this commit | 2026-08-25 |
| P2-9 | Gantt drag (wire bar drag to dates) | done | this commit | 2026-08-25 |
| P2-10 | Chart showTooltip / hoverable | done | this commit | 2026-08-25 |
| P2-11 | Chart responsive scale | done | this commit | 2026-08-25 |
| P2-12 | Chat / Comment / Activity / Notification copy to locale | done | this commit | 2026-08-25 |
| P2-13 | FormWizard skipCondition handleStepChange | done | this commit | 2026-08-25 |
| P2-14 | Pagination Chinese-English mix (showTotal through locale) | done | this commit | 2026-08-25 |
| P2-15..20 | Review 5.2.3 remaining (skip if T1 already covers) | pending | | |

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

Next: Phase D #13 Rate half-star.


## #12 notes

ButtonGroup child seams in `packages/core/src/utils/button-utils.ts`:

- Horizontal `buttonGroupItemClasses`: `[&>*:first-child]:!rounded-r-none` / last `!rounded-l-none` / middle `!rounded-none` / `[&>*:not(:first-child)]:-ml-px` / `[&>*:focus]:z-10 relative`
- Vertical `buttonGroupItemVerticalClasses`: first `!rounded-b-none` / last `!rounded-t-none` / `-mt-px` / same focus
- Self-selectors `[&:first-child]` removed so classes on the group root (via `getButtonGroupClasses`) style child buttons, aligned with InputGroup compact
- `!` overrides Button `rounded-[var(--tiger-radius-md)]`. Vue/React wrappers and examples unchanged

Public visual/behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #13 Rate half-star (clip layer keeps full-star width; do not squash the SVG).

## #13 notes

Rate half-star clip in Vue `Rate.ts` / React `Rate.tsx` via core `rateHalfStarInnerClasses`:

- Clip wrapper stays `absolute inset-0 overflow-hidden` + inline `width: 50%` (scissors)
- Inner glyph (default SVG and custom character) is `w-[200%] h-full` so 200% of the 50% clip equals the parent star box
- Inactive underlay stays a full unclipped star; full/empty stars still `w-full h-full`
- Click/hover half hit-test and keyboard 0.5 step unchanged; examples / Avatar / ButtonGroup untouched

Pages `/rate` 只读 `4.5` 5th star is a left-half clip, not a squashed SVG. Public visual/behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #14 Avatar getInitials (no-space and <=2 chars as-is; `TC` -> `TC`).

## #14 notes

Avatar getInitials short token in core `avatar-utils.ts`:

- No-space token of length <= 2 is returned uppercased (`TC` -> `TC`, `tc` -> `TC`, `A` -> `A`, `张三` -> `张三`)
- Longer single ASCII token still first letter (`Alice` -> `A`); longer CJK still first 2 (`张三丰` -> `张三`)
- Two or more words still first letters of the first two (`John Doe` -> `JD`)
- Vue/React Avatar still call the shared helper; no `name` prop; examples untouched

Pages `/avatar` 代表外观 `text="TC"` shows TC, not T. Public visual/behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #15 Empty 预设一览 (preview shell min-h / overflow-auto so the 5th card is not clipped).


## #17 notes

QRCode public `level` removed; matrix stays hash-based decorative:

- core `QRCodeProps` drops `level`; `QRCodeLevel` type removed
- Vue/React drop the unused `level` prop / `_level` binding
- `generateQRMatrix` algorithm unchanged; JSDoc marks decorative / not scannable
- examples 01 drop `level="H"`; 02 drop the L/M/Q/H row; demo.json no longer claims ECC
- CHANGELOG unpublished records the public API removal

Pages `/qrcode` no longer advertises L/M/Q/H. Refresh a11y / overlay / quiet zone / ImagePreview left.

Next: Phase D #18 ImagePreview maskClosable (click mask closes, align ImageViewer).

## #18 notes

ImagePreview maskClosable closes from the dedicated mask child (Vue + React):

- mask node (`imagePreviewMaskClasses`, `aria-hidden`) owns `onClick` / `handleMaskClick`
- `maskClosable` true (default): mask click calls existing `handleClose` (`update:open` false / `onOpenChange(false)`)
- wrapper no longer uses `e.target === e.currentTarget` (that check never held because the mask sibling ate the click)
- image / toolbar / nav / close are siblings of the mask, so they do not take the mask path
- `maskClosable={false}` ignores mask clicks; close button and Escape still close
- classes / ImageViewer / ImageGroup / #20 img max-h untouched

Pages `/image` ImageGroup / ImagePreview dark area can dismiss. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #28 ColorPicker (`parseColorInput` accepts rgba/hsla; `showAlpha` must emit).


## #28 notes

ColorPicker parse + showAlpha emit (Vue + React) via core `parseColorParts` / `parseColorInput`:

- `parseColorInput` accepts hex, `rgb()`/`rgba()`, `hsl()`/`hsla()`; return type stays `string | null`
- alpha < 1 keeps an alpha-bearing string (`rgba`/`hsla`); hex / opaque rgb/hsl still normalize to `#rrggbb`
- Vue/React derive RGB from `parseColorParts`, not `hexToRgb(raw)`; seed/sync local `alpha` from explicit `rgba`/`hsla`
- `showAlpha` slider emits `formatColorString` with rgb/hsl + alpha (`update:modelValue` / `onChange`)
- hue / presets / typed hex still emit hex; `format` still drives panel preview only
- examples untouched (already rgba 37 99 235 0.8 + show-alpha + format rgb)

Pages /color-picker representative config is the blue 0.8 swatch, not a black block. Public behavior fix recorded in CHANGELOG unpublished.

## #29 notes

Splitter sizes parse + init min (Vue + React) via core `resolveInitialPaneSizes`:

- Public `sizes` widened to `(number | string)[]`: numbers stay px; `'30%'` is percent of available space (container minus gutters); `'200px'` / bare `'250'` are px
- `resolveInitialPaneSizes` → `calculateInitialSizes` → `parsePaneSize`, then `clampPaneSize(min, max)` before style
- `[30,70]` + `min={100}` → `[100,100]` on mount (not a 30px strip); first drag no longer collapses to `[0,100]`
- examples 01-03 use `['30%','70%']` / `['40%','60%']` / `['25%','75%']` / nested `['60%','40%']`; 01 keeps min 100
- gutter token / gutterSize visual / controlled sizes overwrite left for P2

Pages `/splitter` 水平/垂直/嵌套 show ratios. Public API widening + behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #34 Calendar mode=year (click month emits that month 1st or switches back to month).


## #34 notes

Calendar year-mode month chips emit + disabledDate (Vue + React) via core isCalendarMonthDisabled:

- Year-mode month click / Enter / Space emits that month 1st (local Date(viewYear, monthIdx, 1)) via update:modelValue + change / onChange
- Still emits panel-change / onPanelChange (second arg month; mode prop stays parent-controlled)
- disabledDate disables a month iff every local day 1..last of that month is disabled; weekend-only does not disable any month
- Disabled chips: disabled + getCalendarMonthClasses selected, true (opacity-30 cursor-not-allowed); selectMonth is a no-op
- example 02 is fullscreen month view + weekend disabledDate; demo.json title 禁用日期

Pages /calendar second block shows Sat/Sun disabled. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #36 OrgChart direction=horizontal (flipLayoutNode only swap x/y, keep nodeWidth x nodeHeight).

## #36 notes

OrgChart direction=horizontal keeps landscape cards (Vue + React via core flipLayoutNode):

- flipLayoutNode only swaps x/y; width/height stay nodeWidth x nodeHeight
- Default 160x72 is not swapped into 72x160 bars; custom 100x40 stays 100x40
- Existing horizontal coords still hold (ceo x=0 y=90, eng x=100 y=0 with 100x40)
- Vertical layout unchanged; A7 node fill/title tokens untouched
- flipLayoutLink still coordinate-only (attachments may sit on the short side)

Pages /org-chart combination demo shows landscape cards. Public visual/behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #37 Scatter animated non-circle (translate(cx,cy) scale, or CSS scale only on circle).

## #37 notes

Scatter `animated` + non-circle keeps data positions (Vue + React wrap-in-g):

- square / triangle / diamond sit in `<g transform="translate(cx,cy)">`
- CSS entrance `transform:scale()` applies only to the inner `<path>` (geometry still centered at 0,0)
- `.tiger-scatter-entrance` also sets `transform-box:fill-box; transform-origin:center`
- Circles still use `cx`/`cy`; getScatterPointPath geometry unchanged
- prefers-reduced-motion still zeroes duration/delay

Pages /scatter-chart 01 diamonds stay at mapped (cx,cy), not piled at the plot origin. Public visual/behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #39 ChatWindow onUpdated (Vue drop onUpdated scroll-to-bottom; only watch messages.length).

## #39 notes

Vue ChatWindow auto-scroll no longer runs on every re-render:

- onUpdated(scrollToBottom) and the onUpdated import are gone
- onMounted(scrollToBottom) still pins the first paint to the latest message
- post-mount auto-scroll watches messages.length only (not modelValue / input)
- stickToBottom flag from the log (and VirtualList) scroll event; threshold 32px
- new message while pinned still snaps; user left the bottom then skip
- autoScrollToBottom === false still no-ops
- React already keyed off messages.length; left unchanged

Pages /chat-window 02: typing after scrolling history no longer jumps to the latest bubble. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #40 TaskBoard filter drop index (map filtered drop index back to source column).

## #40 notes

TaskBoard filter drop index maps back to the source column (Vue + React via core helper):

- visibleColumns = filterColumns(...) still paints matching cards (not CSS hide)
- getDropIndex still reads visible card DOMRects; drop indicator stays a visible index
- applyCardMove remaps with mapVisibleCardIndexToSource(source.cards, filterCards(...), toIdx) before moveCard
- visible last (visible.length) → sourceIndex(lastVisible) + 1, not a hidden sibling slot
- fixture [a 发布设计, b 开发, c 发布文档, d 测试] filter「发布」 then drop e at last → todo [a,b,c,e,d]
- Kanban Add / appendDefaultTaskBoardCard untouched

Pages /task-board 02「列拖拽与自定义卡片」filter「发布」drop-to-last no longer inserts into a hidden card slot. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #15 Empty preset grid clip (same demo-container class as #16 Result).

## #15 notes

Empty 预设一览 (empty/02, Vue + React) no longer clips the 5th `error` card:

- Grid: `sm:grid-cols-2 lg:grid-cols-3` -> `sm:grid-cols-3` plus `min-h-full overflow-auto` on the example root
- Typical Pages iframe is < 1024, so lg never applied; from 640px the gallery is 3 columns / 2 rows (`error` sits on row 2)
- empty-02 viewport: `{ mode: "auto", minHeight: 540, maxHeight: 720 }` (no `height`, so DemoBlock still auto-resizes)
- Empty component, DemoBlock, sandbox, Result examples, and CHANGELOG left alone (example-only, same as #8)

Pages /empty 「预设一览」 shows all five presets. Shared DemoBlock overflow-hidden / default 180 left for T5; #16 Result will reuse this example-level recipe.

Next: Phase D #16 Result 状态一览 (same preview-height class; raise Result 02 viewport / change 403/500 grid; do not touch iframe/T5).

## #16 notes

Result 状态一览 (result/02, Vue + React) no longer clips the last-row 403/500 cards:

- Grid: `sm:grid-cols-2 lg:grid-cols-3` -> `sm:grid-cols-3` plus `min-h-full overflow-auto` on the example root
- Typical Pages iframe is < 1024, so lg never applied; from 640px the gallery is 3 columns / 2 rows (`404 403 500` sit on row 2)
- result-02 viewport: `{ mode: "auto", minHeight: 560, maxHeight: 720 }` (no `height`, so DemoBlock still auto-resizes)
- Result component, DemoBlock, sandbox, Empty examples, and CHANGELOG left alone (example-only, same as #8 / #15)

Pages /result 「状态一览」 shows all six statuses. Shared DemoBlock overflow-hidden / default 180 left for T5.

Next: Phase D #22 Input Vue dual buttons (clearable + showPassword overlap; do not touch iframe/T5).

## #22 notes

Vue Input clearable + showPassword no longer stack on the same right-0:

- Password toggle stays `right-0` + size `pr-2`/`pr-3`/`pr-4`
- Clear shifts one affix slot: `right-8` sm / `right-10` md / `right-12` lg (`getInputClearButtonClasses(size, { offset: true })`)
- Both visible → field uses double-slot `pr-16`/`pr-20`/`pr-24` via `getInputClasses({ hasDualSuffix: true })`
- Single visible button (empty value hides clear; type !== password hides eye) stays `right-0` + one-slot `pr-*`
- React still mutexes (clear preferred); InputGroup compact and in-field errorMessage left for #21 / #23

Pages callers that set both flags can click either control. Public visual/behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #21 InputGroup compact (border/radius on Input root or compact `:focus-within`; do not touch iframe/T5).

## #21 notes

InputGroup compact joins Input/Textarea with adjacent addons/buttons (Vue + React via core class strings):

- compact: `[&>*:focus]` -> `[&>*:focus-within]:z-10 [&>*:focus-within]:relative`; radius uses `!` (`!rounded-r-none` / `!rounded-l-none` / `!rounded-none`) so token radius does not win
- Input path A: border / radius / surface / status / `focus-within` ring on the existing wrapper (`getInputWrapperClasses(status)` + `getInputChromeClasses`); native input is `getInputFieldClasses` (no border/radius/ring)
- Textarea without showCount is the chrome root (dropped extra `div.w-full`); showCount stays outside the border box
- InputNumber already a border-box root; left alone
- #22 dual-suffix offsets and #23 in-field errorMessage untouched

Pages `/input-group` 01 Input+Button no longer look like separate capsules. Public visual/behavior fix recorded in CHANGELOG unpublished. New helpers `getInputChromeClasses` / `getInputFieldClasses` from the existing input-styles barrel.

Next: Phase D #23 Input errorMessage (move below the field + aria-live/aria-describedby; do not touch iframe/T5).

## #23 notes

Input `errorMessage` sits below the chrome field (Vue + React via core class string):

- `getInputErrorClasses` is `text-red-500 text-sm mt-1 text-left break-words` (no `absolute inset-y-0 right-0`)
- Error is a sibling of the chrome wrapper inside a `w-full` shell (order: error then count); no-error/no-count root stays the chrome wrapper
- Error node has `aria-live="polite"`; input keeps `aria-describedby` and `aria-invalid`
- Clear / password / suffix stay when an error is shown; Vue `#22` dual-suffix offsets unchanged
- MaskInput only shared helper + `aria-live` (still mutexes clear; no #24 raw submit)

Pages callers with a long `errorMessage` no longer cover the value. Public visual/a11y fix recorded in CHANGELOG unpublished.

Next: Phase D #25 Signature strokes (`setPointerCapture` / document up; do not touch iframe/T5).

## #25 notes

Signature (Vue + React) finishes a stroke after the pointer leaves the pad:

- pointerdown (not disabled/readonly) calls `canvas.setPointerCapture(pointerId)` when the method exists (try/catch for happy-dom)
- canvas still owns pointermove / pointerup / pointercancel; `lostpointercapture` also calls `finishStroke`
- while a stroke is active, document listens for pointerup / pointercancel; removed in finishStroke and on unmount
- `finishStroke` nulls activeStroke first, emits change + end once, then detaches listeners and `releasePointerCapture` if still held
- React maps points from `canvasRef.getBoundingClientRect()` (Vue already did), so document events stay on-pad coordinates
- default penColor, modelValue empty-string reset, Backspace/Delete, JPEG/WebP background, MaskInput raw submit, iframe/T5 left alone

Pages `/signature` drag-off no longer leaves `activeStroke` stuck. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #24 MaskInput raw submit (hidden raw when `name` is set; do not touch iframe/T5).

## #24 notes

MaskInput (Vue + React) submits raw when `name` is set:

- When `name` is a non-empty string, a sibling `<input type="hidden" name={name} value={rawValue}>` is rendered (OTP/TagsInput pattern)
- The visible textbox still shows `maskedValue` and has no `name`, so native form POST is raw (`12345678`) not `12/34/5678`
- Empty / omitted `name` renders no hidden input
- Hidden tracks controlled `modelValue`/`value` and uncontrolled inner/`defaultValue`; input / paste / clear (including `''`) update it
- Disabled / readonly still render the enabled hidden field (same as OTP/Tags)
- No new public prop; core `name` JSDoc tightened. #23 error layout, mask algorithm, caret, IME, Signature, iframe/T5 left alone

Pages callers that put MaskInput in a named form now submit raw. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #26 InputNumber attrs (`aria-label`/`data-*` onto `role="spinbutton"`; do not touch iframe/T5).

## #26 notes

InputNumber leftover attrs land on `role="spinbutton"` (Vue + React):

- Vue `inheritAttrs:false` peels `class`/`style`; `restAttrs` spread onto the spinbutton first, then owned role / aria-valuemin/max/now / value / handlers
- React `...rest` after known props; `InputNumberProps` widened with `Omit<InputHTMLAttributes, size|value|defaultValue|onChange|onFocus|onBlur|min|max|step|readOnly>`
- `class` / `className` (and `style`) stay on the wrapper chrome
- Field `aria-label` / `data-*` do not land on the wrapper or replace Increase/Decrease button names
- No new named `ariaLabel` prop. Stepping / clamp / precision / keyboard / controls / #27 Radio / iframe/T5 left alone

Pages callers can label the spinbutton with `aria-label`. Public a11y/attr-forwarding fix recorded in CHANGELOG unpublished.

Next: Phase D #30 Affix offsetBottom (relative to `target` container bottom, or sticky; do not touch iframe/T5).


## #27 notes

Vue Radio inherits RadioGroup `disabled` with Checkbox-style OR:

- `actualDisabled` is `props.disabled || groupContext.value?.disabled || false`
- Vue Boolean omitted is `false`, so the old `!== undefined` never inherited the group; radios stayed focusable while group `onChange` bailed
- Native `input[type=radio]` is actually `disabled` (not only group onChange bail)
- Child `disabled=true` in a live group still disables that child; standalone omitted stays enabled
- React already inherited correctly (`disabled !== undefined` is valid there) and was not changed
- RadioGroup / Checkbox / InputNumber / iframe/T5 left alone

Pages callers that wrap radios in `<RadioGroup disabled>` now disable and skip the native inputs. Public behavior / a11y fix recorded in CHANGELOG unpublished.

Next: Phase D #30 Affix `offsetBottom` (relative to `target` container bottom, or sticky; do not touch iframe/T5).


## #30 notes

Affix offsetBottom pins to the target container bottom (Vue + React via core calculateAffixState):

- Affixed bottom style is `innerHeight - containerRect.bottom + offset` (not viewport `bottom: offset`)
- Window target: containerRect.bottom === innerHeight, so bottom stays `${offset}px`
- Custom target: e.g. innerHeight 200, container bottom 180, offset 8 → bottom 28px (not 8px)
- offsetTop still `containerRect.top + offset`
- offsetBottom sentinel sits after the wrapper (after placeholder when affixed); offsetTop sentinel stays before content
- example 02 dropped mt-auto so first screen is no longer parked below the h-40 clip
- iframe/T5, DemoBlock, #31+ left alone

Pages /affix 「固定到底部」no longer nails the iframe floor. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #32 Anchor / ScrollSpy current item (last intersecting at the offset line, lock after click until scroll ends; do not touch iframe/T5).


## #31 notes

DropdownItem item-level closeOnClick (Vue + React):

- Core `DropdownItemProps` adds optional `closeOnClick?: boolean`
- Resolve is `item.closeOnClick ?? parent.closeOnClick ?? true`
- Vue item prop is Boolean with `default: undefined` so omitted inherits the parent
- Parent `handleItemClick` always `setVisible(false)` (item already decided; item-true can override parent-false)
- Vue example 02 keeps `:close-on-click="false"` on 「保持展开」
- React example 02 aligned to `closeOnClick={false}` + 「保持展开」
- iframe/T5, DemoBlock, #32+ left alone

Pages /dropdown 「受控开关」「保持展开」 now stays open. Public API addition recorded in CHANGELOG unpublished.

Next: Phase D #32 Anchor / ScrollSpy current item (last intersecting at the offset line, lock after click until scroll ends; do not touch iframe/T5).

## #32 notes

Anchor / ScrollSpy current item is last-at-offset-line (Vue + React via core helpers):

- Active href is the last link in document order whose section top is at or above `rootTop + offsetTop/targetOffset + bounds` (default bounds 5)
- Shared `findActiveAnchorAtOffsetLine` used by `findActiveAnchor` and `createAnchorObserver.computeActive`
- IO is only the change trigger; first-in-top-40%-band (`visible` + `rootMargin: -60%`) is gone
- Public `bounds` is passed into `createAnchorObserver` (React no longer discards `_bounds`)
- Click locks via `createProgrammaticScrollLock` until `scrollend` / scroll idle ~150ms / safety 2s; Vue/React Anchor no longer use a 500ms timeout; ScrollSpy now locks too
- iframe/T5, DemoBlock, #20, #33+ left alone

Pages /anchor 「容器滚动」点「发布」and /scroll-spy last item keep the highlight. Public behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #33 FloatButton (default plus icon; Group placement/offset, optional portal; do not touch iframe/T5).

## #33 notes

FloatButton default plus + Group placement/offset/portal (Vue + React via core helpers):

- Empty default slot / children render `floatButtonPlusIconPath` (`M12 5v14M5 12h14`) in an `aria-hidden` SVG sized by `floatButtonIconSizeClasses`
- Explicit children / default slot still win; last-resort `aria-label` is `ariaLabel ?? tooltip ?? 'Add'` only on the default-icon path
- Group public `placement` (default `bottom-right`) / `offset` (default 24) use `viewportPlacementClasses` + `getViewportOffsetStyle`
- Group public `portal` (default true) still Teleports / createPortals to body as `fixed`; `portal={false}` is in-place `absolute`
- `floatButtonGroupClasses` no longer hardcodes `fixed right-6 bottom-6`; `getFloatButtonGroupClasses` keeps Vue/React aligned
- float-button/01 Vue+React set `portal={false}` inside the existing `relative h-56` shell
- iframe/T5, DemoBlock, Vue aria-label-vs-tooltip P2, #20, #35, #38 left alone

Pages /float-button 「悬浮按钮组」 stays in the h-56 box; empty circle/square is no longer icon-less. Public API addition + behavior fix recorded in CHANGELOG unpublished.

Next: Phase D #35 Table virtual scroll box (React overflow only around the table body, not export/Pagination; do not touch iframe/T5).

## #35 notes

React Table virtual / autoVirtual scroll box now matches Vue:

- Inner scroller (height + overflow:auto, onScroll) wraps only the table (colgroup/header/body/summary)
- Outer wrapper wrapperStyle is maxHeight only; no virtual height/overflow
- getTableWrapperClasses(bordered, maxHeight) -- no raw virtual / virtualHeight
- Export button, card list, loading overlay, and Pagination stay siblings outside the scroller
- Vue Table source untouched (already correct); Vue spec got a contrast case
- iframe/T5, DemoBlock, VirtualTable, #19 leftover, #20, #38 left alone

Public behavior fix recorded in CHANGELOG unpublished.

## #38 notes

SunburstChart Vue + React `showLabels` (default true) now paints SVG text at each arc midAngle / ring midpoint:

- Core `SunburstArc` keeps `innerRadius` / `outerRadius`; `getSunburstLabelPoint` uses `polarToCartesian(cx, cy, (inner+outer)/2, midAngle)`
- Vue reads `props.showLabels`; React uses `showLabels = true` (no `_showLabels`)
- Labels after paths, white `text-xs`, `pointer-events: none`, `aria-hidden`
- `showLabels={false}` still has no svg texts
- iframe/T5, DemoBlock, #20, tooltipFormatter, keyboard Enter left alone

Public behavior fix (dead API now live) recorded in CHANGELOG unpublished.

## #20 notes

ImagePreview / ImageViewer iframe first cut (Phase E T5 / C table #20):

- Core `imagePreviewImgClasses` is now `max-h-[90vh] max-w-[90vw] select-none …` (dropped `max-w-none`)
- Vue/React ImagePreview already consume the core string; no component rewrite
- `imageViewerImgClasses` already had the 90vh/90vw constraint; toolbar/nav/counter (#19 / A10) left alone
- image/04, image/05, image-viewer/01, image-viewer/02 (Vue+React) `viewport.minHeight` 560, `mode: auto`, `maxHeight` 720, no frozen `height`
- DemoBlock, sandbox.ts, allow-same-origin, srcdoc dark: sync, other overlay demos left for T5 leftover / P2-1 / P2-15

Public visual fix recorded in CHANGELOG unpublished.

Next: leftover T5 / P2-1 landed in this T5 second cut. Phase F starts at P2-2 Message / Alert token (T1 did not cover message/alert chrome). P2-15 clipboard / allow-same-origin and srcdoc dark: sync stay later leftover T5 slices, not a third viewport knife.


## T5 notes

Pages sandbox viewport second cut (Phase E T5 leftover / P2-1 overlay demos):

- datepicker/01-03, timepicker/01-02, cascader/01-02, modal/01-04, drawer/01-03, tour/01-02, loading/02-03, spotlight/01-02, dropdown/01-02, crop-upload/01-02 (Vue+React) `viewport.minHeight` 560, `mode: auto`, `maxHeight` 720, no frozen `height`
- tour/02 had no viewport; the auto 560/720 object was added
- loading/01 inline stays 120; loading-bar / message / notification / context-menu / navigation-menu / #20 image demos not bulk-bumped
- DemoBlock, sandbox.ts, allow-same-origin, srcdoc dark: sync, /container, /back-top left alone
- #20 ImagePreview 90vh/90vw + preview demo floors already landed

Viewport-raising for preview + named overlays is complete. No third T5 viewport knife. Leftover T5 theme slices (not this row): srcdoc `dark:` sync; P2-15 clipboard / `allow-same-origin`; P3 `/container` and `/back-top` → `/backtop`.

Example-only / Pages visual fix recorded in CHANGELOG unpublished.

Next: Phase F Review 5.2.3 P2-2 Message / Alert token (write `--tiger-message-*` / `--tiger-alert-*` or bg follow surface). T1 A0-A10 did not cover Message/Alert chrome, so do not skip P2-2. Then P2-3 Menu `theme="light"` (skip later P2 rows only if T1 already covers that row).


## P2-2 notes

Message / Alert chrome in `packages/core/src/utils/message-utils.ts` `defaultMessageThemeColors` and `packages/core/src/theme-runtime/colors.ts` `defaultAlertThemeColors`:

- Message info/success/warning/error bg: `--tiger-message-*-bg` -> `--tiger-surface` (`#ffffff` last-resort)
- Message text/icon: `--tiger-message-*-text/icon` -> `--tiger-info` / `--tiger-success` / `--tiger-warning` / `--tiger-error`
- Message border: `--tiger-message-*-border` -> `--tiger-border` (`#e5e7eb` last-resort)
- Message loading bg last-resort aligned `#f3f4f6` -> `#f9fafb` (still `--tiger-surface-muted`)
- Alert bg: `--tiger-alert-*-bg` -> `--tiger-surface` (`#ffffff` last-resort)
- Alert title/icon/close/focus: registered status tokens
- Alert description: `--tiger-text-secondary` (`#6b7280` last-resort)
- Alert closeButtonHover: `--tiger-surface-muted` (`#f9fafb` last-resort)

`--tiger-message-*` / `--tiger-alert-*` stay optional first `var()` overrides only; not registered in `THEME_CSS_VARS`. Vue/React consume the core maps. Dark default surface is `#111827` + status ink (`#4ade80` / `#fbbf24` / `#f87171` / `#60a5fa`).

Next: P2-3 Menu `theme="light"` landed in this commit. Then P2-4 Collapse a11y (`inert`+`aria-hidden`; `extra` stopPropagation). T1 A0-A10 did not cover Collapse a11y, so do not skip.

## P2-3 notes

Menu default `theme="light"` in `packages/core/src/utils/menu-utils.ts`:

- `menuLightThemeClasses` is now `''` (no `[--tiger-surface:#ffffff]` or sibling light hex locks)
- `getMenuClasses` skips the empty light class token; root keeps `menuBaseClasses` `var(--tiger-surface,#ffffff)` last-resort
- `html.dark` inherited `--tiger-surface` / `--tiger-text` / `--tiger-border` win on Pages `/menu` 01/03
- Explicit `theme="dark"` still pushes `menuDarkThemeClasses` (`[--tiger-surface:#111827]` and siblings)

No `--tiger-menu-*` in `THEME_CSS_VARS`. Vue/React consume `getMenuClasses`. No new public prop. Hover/selected light pair still token+last-resort.

Next: P2-4 Collapse a11y landed in this commit. Then P2-5 `parseDate` UTC (`YYYY-MM-DD` as local calendar day, not `new Date(string)`). T1 A0-A10 did not cover parseDate, so do not skip.

## P2-4 notes

Collapse panel a11y in Vue/React `CollapsePanel`:

- Collapsed `[data-tiger-collapse-content]` gets HTML `inert` + `aria-hidden="true"` (omitted when expanded; no `inert="false"`)
- Children stay mounted so the max-height transition still runs
- Extra wrapper (`span.ml-auto`, Vue slot / React `extra`) `stopPropagation` on click so Pages `/collapse` 03 「已更新」 no longer toggles
- Header click / Enter / Space still toggle

No new public prop. Transition controller / `panelKey` equality / accordion initial keys / `parseDate` untouched.

Next: P2-5 `parseDate` UTC landed in this commit. Then P2-6 Cascader / TreeSelect keyboard (non-virtual Arrow/Enter to select; clear button as trigger sibling, align Select). T1 A0-A10 did not cover Cascader/TreeSelect keyboard, so do not skip.

## P2-5 notes

`parseDate` in `packages/core/src/utils/date-utils.ts`:

- Date-only `YYYY-MM-DD` (optional surrounding whitespace) uses local `Date(year, monthIndex, day)` midnight, not `new Date(string)` UTC midnight
- Impossible calendar days (`2024-02-30`, `2024-13-01`, non-leap `2023-02-29`) return null; leap `2024-02-29` is valid
- Date instances / null / invalid strings and ISO datetimes with time or offset keep the previous fallback
- DatePicker / Calendar already call the helper for min/max/value and `moveDayFocus` `data-date` keys (no component fork)
- datepicker/03 Vue+React min/max are date-only strings so they go through `parseDate`

No new public prop. Cascader / TreeSelect keyboard and Calendar year-view month chip width left for later P2 rows.

Next: P2-6 Cascader / TreeSelect keyboard landed in this commit. Then P2-7 Tour mask close (click mask closes when a target exists; Vue last step calls onClose like React). T1 A0-A10 did not cover Tour mask close, so do not skip.

## P2-6 notes

Cascader / TreeSelect keyboard and sibling clear (Vue + React):

- When closed, trigger still uses `getPickerTriggerKeyAction` (Enter/Space open, ArrowDown open, Escape none)
- When open, a trigger/dropdown interceptor runs first: ArrowDown/Up/Home/End via `getPickerNavigationIndex`; Enter/Space commit on the same path as a click
- Cascader columns: Arrow stays in the current column; ArrowRight / Enter on a parent expands; ArrowLeft pops `activePath`; leaf Enter commits and closes
- TreeSelect: arrows walk `visibleNodes`; ArrowRight/Left expand/collapse; Enter selects (single closes, multiple stays open)
- Clear is a real `<button type="button">` sibling of the combobox (`data-tiger-cascader-clear` / `data-tiger-treeselect-clear`), icon row `pointer-events-none` like Select
- `getPickerTriggerKeyAction` contract unchanged; no new public prop

Next: P2-7 Tour mask close (click mask closes when a target exists; Vue last step calls onClose like React). T1 A0-A10 did not cover Tour mask close, so do not skip.

## P2-7 notes

Tour mask close and Vue last-step `close` (Vue + React):

- Target-case veil is one full-screen `tourMaskClasses` node (`data-tiger-tour-mask`) with `onClick: close`
- `getTourMaskHoleStyle` punches an evenodd clip-path hole (same 4px padding as the old spotlight) so the target stays visible and is not on the mask hit region
- No-target fallback still closes; `step.mask === false` still has no mask; popover stays `z-[1001]`
- Vue last-step Finish emits `finish` then `close` then `update:open` false (align React `onFinish` + `onClose` + `onOpenChange(false)`)
- `getTourSpotlightStyle` kept in core unused by Vue/React; no new public component prop

Next: P2-8 Table sort keyboard + `dataKey` (header is a button; `sortData`/`filterTableData` read `dataKey` else `key`). T1 A0-A10 did not cover Table sort keyboard, so do not skip.

## P2-8 notes

Table sort keyboard + `dataKey` (Vue + React):

- Sortable `<th>` keeps `aria-sort` and `data-tiger-table-column-key`; title + SortIcon live in `<button type="button" data-tiger-table-sort>`
- Shared chrome `tableSortButtonClasses`; `th` has no `onClick` (no double-toggle)
- Lock stays a sibling button; filter input/select stay outside the sort button
- `getTableColumnDataKey` is `dataKey || key`; `sortData` optional 5th arg `columns` (4-arg still looks up `key`); `filterTableData` uses the helper for the matching column
- Filter/sort state keys stay `column.key`; no new public Table prop

Next: P2-9 Gantt drag (wire bar drag to dates; row fill `surface-muted`). T1 A0 aliased `--tiger-fill` so the zebra token may already follow surface-muted — do not skip the drag wiring.

## P2-9 notes

Gantt bar drag wires to dates (Vue + React):

- Core `ganttPxToMs` / `shiftGanttTaskDates` / `moveGanttTaskByPx`: pixel delta → local calendar days, duration kept, clamp to min/max; `YYYY-MM-DD` / Date / number kinds preserved
- Non-disabled bars: pointerdown + `setPointerCapture` / document up; preview `translate(deltaX)`; drop writes overlay + Vue `task-change`/`update:data` + React `onTaskChange`/`onDataChange`
- Unbound static `data` (Pages `/gantt` 01/02) keeps new dates via `applyGanttTaskDateOverlay` so bar `x` moves without parent write-back
- Tiny move / 0-day snap still select + `task-click`; real drag does not toggle selectedId
- No new `draggable` prop; no zoom / resize handles

Row fill / axis tokens: T1 A0 already aliases `--tiger-fill` → `--tiger-surface-muted` and `--tiger-text-muted` → `--tiger-text-secondary`. `ganttRowClasses` stays `fill-[var(--tiger-fill,#f9fafb)]`; last-resort hex not restyled (not a drag blocker).

Next: P2-10 Chart `showTooltip` / `hoverable` (default tooltip without requiring `hoverable`). T1 A0-A10 did not cover Chart tooltip gating, so do not skip.

## P2-10 notes

Chart `showTooltip` default tooltip without `hoverable` (Vue + React):

- `useChartInteraction`: track `localHoveredIndex` + tooltip position when `hoverable || showTooltip` (showTooltip default true)
- Public hover events (`onHoveredIndexChange` / `onBarHover` / Vue `update:hoveredIndex` / `bar-hover` / `onPointHover`) and `activeIndex` highlight stay `hoverable`-only
- ChartTooltip mount/open is `showTooltip` only — no `showTooltip && hoverable`
- Heatmap canvas overlay receives pointer events when `showTooltip` even if not hoverable
- Line/Area mouse tooltip when `showTooltip || hoverable`; `role` / tabindex stay `hoverable || pointClickable`
- Radar mouse tooltip without hoverable; cursor/role/tabIndex stay `showTooltip && hoverable`

T1 A0-A10 did not cover Chart tooltip gating. No new public prop. `responsive` not changed.

Next: P2-11 Chart `responsive` scale (recompute scale after observing parent; do not only stretch SVG). T1 A0-A10 did not cover ChartCanvas resize vs prop scale, so do not skip.

## P2-11 notes

Chart `responsive` recomputes plot scale / innerRect after observing the parent (Vue + React):

- ChartCanvas keeps the single ResizeObserver + rAF + `resolveResponsiveChartSize`; reports `{ width, height }` via React `onResolvedSizeChange` / Vue `resolved-size-change` (slot also gets resolved width/height)
- Bar / Line / Area / Scatter `useResponsiveChartSize` (internal): `plotSize` then `getChartInnerRect(plotSize, padding)` — auto band/point/linear ranges use that innerRect, not the prop 420×240
- Custom `xScale` / `yScale` still win (range not rewritten). `responsive` default stays false
- Pages `/bar-chart` 01: after parent ~926×688, last bar sits near the right of the plot instead of a 420×240 pocket

T1 A0-A10 did not cover ChartCanvas resize vs prop scale. Optional ChartCanvas callback is public; no new required chart prop.

Next: P2-12 Chat / Comment / Activity / Notification copy to locale (FormWizard/TaskBoard already do). T1 A0-A10 did not cover these default Chinese strings, so do not skip.


## P2-12 notes

Chat / Comment / Activity / Notification default copy goes through locale (Vue + React), same path as FormWizard / TaskBoard:

- New TigerLocaleChatWindow / CommentThread / ActivityFeed / NotificationCenter blocks; TIGER_LOCALE_KEYS + mergeTigerLocale + get*Labels
- Components: useTigerConfig -> mergeTigerLocale -> getXxxLabels -> resolveLocaleText; existing string props still override
- No locale / non-zh fallback is English; zh-CN keeps 发送 / 暂无消息 / 已送达 / 点赞 / 收起回复 / 展开 n 条回复 / 暂无动态 / 通知中心 / 全部标记已读
- Chat status texts via buildChatMessageStatusInfo(labels); Comment expand/collapse uses {count} labels
- T1 A0-A10 did not cover these strings. No new required prop. skipCondition / like write-back / manageReadState not in this commit

Next: P2-13 FormWizard skipCondition (handleStepChange should use findNextUnskippedStep like Next). T1 A0-A10 did not cover skipCondition, so do not skip.


## P2-13 notes

FormWizard clickable handleStepChange uses findNextUnskippedStep like Next/Prev (Vue + React):

- direction is +1 when the clicked index is ahead, else -1
- forward still runs beforeNext / runStepValidation
- landing is findNextUnskippedStep(clickedIndex, direction, steps, current); no-op if that is current
- skipCondition and disabled both walk past; disabled-only early-return is gone
- clickable default stays false; Next/Prev unchanged
- T1 A0-A10 did not cover skipCondition. No new public prop.

Next: P2-14 Pagination Chinese-English mix (共 N 条 through locale; showTotal default must not hardcode Chinese). T1 A0-A10 did not cover Pagination copy, so do not skip.

## P2-14 notes

Pagination showTotal default copy goes through getPaginationLabels / formatPaginationTotal (Vue + React):

- no more labelsOverride / locale.pagination.totalText gate falling back to Chinese defaultTotalText
- labels.totalText always formatted; custom totalText function still wins
- no-locale / non-zh is English Total {total} items; zh-CN keeps 共 {total} 条
- defaultTotalText now formats English DEFAULT_PAGINATION_LABELS.totalText
- T1 A0-A10 did not cover Pagination copy. No new public prop.

Next: P2-15 Code clipboard (sandbox allow-same-origin or failure state; copy through locale). T1 A0-A10 did not cover clipboard / allow-same-origin, so do not skip.

