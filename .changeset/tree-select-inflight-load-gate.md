---
'@expcat/tigercat-core': patch
'@expcat/tigercat-react': patch
'@expcat/tigercat-vue': patch
---

Reject in-flight lazy nodes in the shared branch gate, track Vue TreeSelect pending loads, and honor rejected gates in Tree and TreeSelect so repeated activation starts one request and loaded children remain visible.
