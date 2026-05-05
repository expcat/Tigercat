# Phase 2.8 — Composite 组件剩余任务

> 本页只保留 Composite 组件仍未完成的优化项。

| 任务                         | 对应组件 / 范围                                                          | 优先级 | 完成标准                                                            |
| ---------------------------- | ------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------- |
| DataTableWithToolbar 边界    | DataTableWithToolbar / Table                                             | P0     | Done：内部分页回交 Table，组件只保留 toolbar 搜索/筛选/批量操作编排 |
| NotificationCenter 缓存      | NotificationCenter                                                       | P1     | 分组、标签、已读未读派生数据使用 useMemo/computed，并有测试覆盖     |
| ActivityFeed / Timeline 复用 | ActivityFeed / Timeline                                                  | P1     | ActivityFeed 与 Timeline 共用渲染/样式逻辑，避免重复实现            |
| Composite a11y 角色          | DataTableWithToolbar / NotificationCenter / ActivityFeed / CommentThread | P1     | feed/group/dialog/list 等整体 ARIA 角色明确，并补回归测试           |
| Composite 配方化             | DataTableWithToolbar / CropUpload / FormWizard                           | P2     | 评估是否转 cookbook 配方；若保留组件，说明体积边界                  |
