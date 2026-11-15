---
'@expcat/tigercat-react': patch
'@expcat/tigercat-vue': patch
---

Move FormItem field registration to the current Form controller and clear disabled registration when Vue field names change. Preserve checked props on unbound native checkbox and radio inputs, and link extra help text through aria-describedby while retaining error and consumer descriptions.
