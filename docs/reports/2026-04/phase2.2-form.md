# Phase 2.2 — Form 组件剩余任务

> 本页只保留 Form 组件仍未完成的优化项。

| 任务                       | 对应组件 / 范围                                 | 优先级 | 完成标准                                                                  |
| -------------------------- | ----------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| Form 校验复杂度            | Form / FormItem                                 | P1     | 验证 item validate 不触发 O(N²) 全量遍历；必要时加入索引或依赖图缓存      |
| picker-utils 二期          | AutoComplete / Cascader / TreeSelect / Transfer | P1     | 按各自交互语义复用键盘、过滤、ARIA 公共逻辑                               |
| Radio / Checkbox icon 体积 | Radio / Checkbox                                | P2     | 评估 CSS mask 替代 inline SVG 的收益和兼容性                              |
| Form 命令式 API            | Form                                            | P2     | 设计 `useFormController` / `useTigerForm`，明确与现有 Form API 的兼容关系 |
