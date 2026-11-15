---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
---

Preserve pending form validation when the debounce delay is unchanged. Initialize external Vue Form controller options on mount, and move state subscriptions to the current controller when it changes.
