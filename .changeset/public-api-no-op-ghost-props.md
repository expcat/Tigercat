---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

Implement public no-op and ghost-prop API surface across React/Vue.

- Implement previously declared props and helpers for Select/Table/VirtualTable/VirtualList/Kanban/RichTextEditor, charts, FileManager, Transfer, AutoComplete, Slider, Splitter, CodeEditor, ChatWindow, CropUpload, Cascader, FloatButton, Steps, Tabs, Calendar, InputNumber, CommentThread and DataTableWithToolbar.
- Align Vue/React public prop declarations where runtime support already existed, including `targetKeys`, `defaultValue`, `className`, toolbar callbacks and virtual/table capabilities.
- Deprecate core `getResultHttpLabel` in favor of `isHttpResultStatus`; behavior is unchanged for existing imports.
