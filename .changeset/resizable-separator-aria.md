---
'@expcat/tigercat-core': patch
'@expcat/tigercat-react': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-mcp': patch
---

Document that enabled resizable corner handles are in the tab order. Separators without a maximum now expose the current size as aria-valuemax, inline px sizes are reported on the handles, and a root aria-labelledby no longer clears handle names.
