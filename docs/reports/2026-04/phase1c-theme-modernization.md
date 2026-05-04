# Phase 1C — 主题现代化剩余验收

> 本页只保留仍需验证或补测的主题现代化内容。

| 任务                | 优先级 | 完成标准                                                                  |
| ------------------- | ------ | ------------------------------------------------------------------------- |
| 默认主题像素回归    | P1     | 默认配置与 v1.0.x 视觉保持一致，完成核心组件截图/像素差验证               |
| modern 主题交互测试 | P1     | 覆盖 `data-tiger-style="modern"` 对典型组件 class/token 的触发路径        |
| a11y 对比度验证     | P1     | Modal/Drawer/Popover/Tooltip 等玻璃表面与正文文本 contrast ratio 符合要求 |
| reduced motion 验证 | P2     | `prefers-reduced-motion` 下 motion duration 覆盖为 0ms 的测试纳入回归集   |
