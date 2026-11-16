---
'@expcat/tigercat-core': patch
'@expcat/tigercat-react': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-mcp': patch
---

Localize the query reset button, keep a controlled React query reset on the same value as the input and rows, and rebind Vue query.api when the query object is replaced. Pass SchemaForm maxLength and prefix through to Input, and warn separately for each unknown widget param.
