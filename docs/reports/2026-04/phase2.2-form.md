# Phase 2.2 — Form 组件剩余任务

> 本页只保留 Form 组件仍未完成的优化项。

| 任务                       | 优先级 | 完成标准                                                                                    |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| DatePicker locale 子路径   | P1     | 日期面板文案支持按需 locale 导入，不通过主入口拉取全部语言                                  |
| Upload 拖拽复用            | P1     | Upload 的 drag over / leave / drop 逻辑复用 core drag helper 或明确保留差异原因             |
| Form 校验复杂度            | P1     | 验证 item validate 不触发 O(N²) 全量遍历；必要时加入索引或依赖图缓存                        |
| picker-utils 二期          | P1     | AutoComplete / Cascader / TreeSelect / Transfer 按各自交互语义复用键盘、过滤、ARIA 公共逻辑 |
| Mentions 定位复核          | P1     | 确认触发器定位复用 floating popup 工具，避免自维护 offset 逻辑                              |
| InputNumber / Stepper 长按 | P1     | 长按 +/- 使用 rAF 或稳定节流策略，避免 `setInterval` 漂移                                   |
| Switch class composer      | P2     | 尺寸、颜色、文本样式收敛到 `composeComponentClasses` 或组件级 class composer                |
| Radio / Checkbox icon 体积 | P2     | 评估 CSS mask 替代 inline SVG 的收益和兼容性                                                |
| Form 命令式 API            | P2     | 设计 `useFormController` / `useTigerForm`，明确与现有 Form API 的兼容关系                   |
