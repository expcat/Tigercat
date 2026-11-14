---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-react': patch
---

Keep schema-disabled and schema read-only workflow fields locked. Initiate mode no longer clears `disabled: true`, and submit keeps the original value for both disabled and read-only fields.
