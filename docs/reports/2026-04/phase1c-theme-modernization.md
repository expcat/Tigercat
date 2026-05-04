# Phase 1C — 主题现代化剩余验收

> 本页只保留仍需验证或补测的主题现代化内容。

| 任务                | 优先级 | 状态               | 完成标准 / 结果                                                                                                                                                                                                                      |
| ------------------- | ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 默认主题像素回归    | P1     | Pending            | 默认配置与 v1.0.x 视觉保持一致，完成核心组件截图/像素差验证                                                                                                                                                                          |
| modern 主题交互测试 | P1     | ✅ Done 2026-05-04 | 新增 `tests/core/modern-theme-interaction.spec.ts`：注入 plugin CSS 后验证 `data-tiger-style="modern"` 在 `<html>` / 子树上的 token 翻转、round-trip、`.dark` 叠加，以及组件 className 路径稳定（仅 token 值变化）；6 个用例全部通过 |
| a11y 对比度验证     | P1     | Pending            | Modal/Drawer/Popover/Tooltip 等玻璃表面与正文文本 contrast ratio 符合要求                                                                                                                                                            |
| reduced motion 验证 | P2     | Pending            | `prefers-reduced-motion` 下 motion duration 覆盖为 0ms 的测试纳入回归集                                                                                                                                                              |
