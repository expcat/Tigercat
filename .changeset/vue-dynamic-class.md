---
'@expcat/tigercat-vue': patch
---

Read the current Vue `class` on each render for ContextMenuItem, ContextMenuMenu, ContextMenuSub, Dropdown, DropdownItem, and DropdownMenu. Updating class on the same instance now changes the DOM class instead of keeping the first value.
