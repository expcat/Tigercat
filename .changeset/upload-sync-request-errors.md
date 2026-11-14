---
'@expcat/tigercat-core': patch
---

Settle synchronous Upload customRequest throws through the shared error handler so failed files emit onError once and can be retried.
