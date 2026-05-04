# Phase 2.1 — Basic 组件剩余任务

> 本页只保留 Basic 组件仍未完成的优化项。

| 任务                      | 优先级 | 完成标准                                                                                      |
| ------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| React Button spinner lazy | P1     | React Button 不再在模块顶层执行 `getSpinnerSVG('spinner')`；仅 loading 且无自定义 icon 时创建 |
| Group 类组件共享 util     | P1     | AvatarGroup / ImageGroup / ButtonGroup 复用 `core/utils/group-utils.ts` 或等价共享逻辑        |
| ImageCropper 交互测试     | P1     | 覆盖裁剪框移动、缩放、aspect ratio、键盘/触控边界，而不仅是基础渲染                           |
| ImagePreview 交互测试     | P1     | 覆盖 open/close、prev/next、zoom/rotate、键盘导航的实际交互                                   |
| Typography 合并评估       | P2     | 评估 Text / Code 是否需要合并为 Typography，不改变现有公开 API                                |
| Empty 默认插画体积        | P2     | 评估 CSS-only、可替换外部插画或按需插画策略                                                   |
| Divider 文件合并评估      | P2     | 评估是否与 Space 或 layout util 合并，保持子路径兼容                                          |
