---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
---

Align the exported Vue props types with runtime props. `VueTreeSelectProps` and `TreeSelectProps` no longer include `height`; use `listHeight`. Kbd `keys` accepts a readonly array. Core `PopoverProps` adds optional `closeOnScroll`.
