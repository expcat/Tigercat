---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

- `Header` `variant="translucent"/"blur"` now renders backdrop blur out of the box: the base `--tiger-blur-glass` / `--tiger-blur-glass-strong` tokens default to `16px` / `24px` (previously `0px`, which required consumers to set the tokens themselves). Override to `0px` to disable.
- `Header` blur/translucent variants gain overridable tuning tokens: `--tiger-header-saturate` (adds `backdrop-saturate`), `--tiger-header-shadow` (drives the `blur` variant's shadow), and `--tiger-header-border` (scopes the header border color, falling back to the global `--tiger-border`), so custom shadow/saturation/border can be applied via low-specificity tokens without `!important`.
- `Form` top labels now default to left alignment in `getFormItemLabelClasses` when `labelPosition="top"` and no `labelAlign` is given, matching the `Form` component's resolved behavior.
- `Icon` built-in set expanded with common app glyphs: `home`, `bell`, `mail`, `phone`, `download`, `upload`, `filter`, `refresh`, `logout`, `lock`, `star`, `heart`, `copy`, `link`, `document`, `folder`, `image`, `map-pin`, `check-circle`, `x-circle`, `users`, `dashboard`.
