---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

完成 T06 locale namespace rollout：扩展 `TigerLocale` 的 empty、tour、calendar、fileManager、imageViewer、imageEditor、table、taskBoard、status 等默认文案命名空间，并让 React/Vue 组件优先按显式 prop、组件 locale、ConfigProvider locale、英文 fallback 解析默认 labels。

DatePicker 现在以 `datepicker-locales/*` preset 作为 labels 单一来源，`getDatePickerLabels(string)` 覆盖内置 13 个 locale id，未知 locale 回退 `en-US`。
