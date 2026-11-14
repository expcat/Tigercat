---
'@expcat/tigercat-core': patch
---

Skip occupied numeric keys when automatically assigning toast IDs so messages and notifications with explicit numeric keys remain in the queue. Explicit calls with the same key continue to update the existing item.
