---
'@expcat/tigercat-core': patch
---

Skip empty advanced Table filter rules before combining AND/OR clauses, including incomplete between bounds, so adding an empty OR rule does not include every row. Preserve isEmpty and existing boolean precedence.
