---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-react': patch
---

Move Vue context-menu focus into the first submenu item after the overlay is positioned, and open schema dropdown submenus with ArrowRight while keeping a non-portal submenu inside the menu. Ignore InfiniteScroll retries while disabled, and keep an empty PageHeader back label from replacing the locale name. Accept CodeEditor theme auto and bind, RichTextEditor bind, and a ColorPicker ref with focus, open, and close.
