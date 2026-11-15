---
'@expcat/tigercat-core': patch
'@expcat/tigercat-react': patch
'@expcat/tigercat-vue': patch
---

Clamp CSS color alpha to 0–1 instead of treating values above 1 as bytes, and reject malformed decimal or non-finite color values. Keep invalid ColorPicker text in an error draft with an empty hidden form value. Remove unsupported aria-readonly from ColorPicker buttons and CronEditor / NumberKeyboard group or dialog roots while preserving readOnly behavior in Vue and React.
