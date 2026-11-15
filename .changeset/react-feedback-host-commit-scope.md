---
'@expcat/tigercat-react': patch
---

Activate React FeedbackHost scopes only during the commit lifecycle so abandoned Suspense renders cannot leave active scopes or receive notifications without a renderer.
