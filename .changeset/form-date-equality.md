---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-react': patch
---

Compare form Date values by time. Replacing a field's Date with a different instant now updates the model and notifies `onValuesChange` and form subscribers. Identical instants still count as unchanged.
