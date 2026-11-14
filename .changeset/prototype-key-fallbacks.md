---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-react': patch
---

Ignore inherited prototype keys in runtime style and icon lookups. Unknown names such as `toString`, `constructor`, and `__proto__` use the existing fallback instead of emitting function text or throwing. Icon names equal to those keys can now be registered as custom icons.
