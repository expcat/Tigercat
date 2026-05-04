# Phase 2.8 — Composite 组件剩余任务

> 本页只保留 Composite 组件仍未完成的优化项。

| 任务                         | 优先级 | 完成标准                                                                                         |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| DataTableWithToolbar 边界    | P0     | 确认内部完全代理 Table 行为，只保留 toolbar 编排；必要时删掉重复状态逻辑                         |
| CommentThread 深度限制       | P1     | 嵌套回复限制最大深度，超过折叠，避免无限递归或深树性能问题                                       |
| NotificationCenter 缓存      | P1     | 分组、标签、已读未读派生数据使用 useMemo/computed，并有测试覆盖                                  |
| ActivityFeed / Timeline 复用 | P1     | ActivityFeed 与 Timeline 共用渲染/样式逻辑，避免重复实现                                         |
| Composite a11y 角色          | P1     | feed/group/dialog/list 等整体 ARIA 角色明确，并补回归测试                                        |
| Composite 配方化             | P2     | 评估 DataTableWithToolbar、CropUpload、FormWizard 是否转 cookbook 配方；若保留组件，说明体积边界 |
