---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

- Added `Card` `padding` and `Drawer` `bodyPadding` props (`boolean | string`) so built-in spacing can be overridden without `!important`.
- Added `Table` `cardFieldGap` to configure the gap between fields in the default card grid.
- Added a built-in `Icon` icon set: `Icon` now accepts a `name` prop, backed by a curated `iconRegistry` (exported from `@expcat/tigercat-core` and `@expcat/tigercat-core/icons/registry`).
- Added `Image` `previewTrigger="hover"` for an enlarged floating hover-preview overlay (default remains click-to-fullscreen).
- `Dropdown` triggers now expose a stable `data-state="open" | "closed"` attribute alongside `aria-expanded`.
- Extracted a shared `devWarn` / `warnUnsupportedColorProp` core helper (replacing the duplicated Button/Tag color-prop warnings).
