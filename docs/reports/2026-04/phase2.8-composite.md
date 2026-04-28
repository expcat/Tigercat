# Phase 2.8 — Composite 组件审查 (2026-04)

> 范围：7 个组件 — ActivityFeed, ChatWindow, CommentThread, CropUpload, DataTableWithToolbar, FormWizard, NotificationCenter
> 共享 utils：`activity-feed-utils.ts`、`chat-window-utils.ts`、`comment-thread-utils.ts`、`notification-center-utils.ts`

## 1. 体积现状

| 组件                 | Vue dts | 备注                   |
| -------------------- | ------- | ---------------------- |
| DataTableWithToolbar | 7.8 KB  | Table 包装 + toolbar   |
| NotificationCenter   | 5.9 KB  | 列表 + 分组 + 已读标记 |
| CommentThread        | 5.5 KB  | 嵌套回复               |
| FormWizard           | 4.8 KB  | 多步表单               |
| CropUpload           | 2.6 KB  | Upload + Cropper 组合  |
| ActivityFeed         | —       | timeline 风            |
| ChatWindow           | —       | 消息列表 + 输入框      |

> Composite 组件本质是**编排现有组件**，职责单一，体积不应膨胀。

## 2. 代码层优化

| #   | 优化项                                                                                                                                          | 优先级     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| K1  | **DataTableWithToolbar**：检查是否在内部重新实现了 Table 行为，应该完全代理给 `Table` + 加 toolbar                                              | **P0**     |
| K2  | **CropUpload**：应直接组合 `Upload` + `ImageCropper`，禁止内嵌裁剪逻辑                                                                          | **P0**     |
| K3  | **FormWizard**：应组合 `Form` + `Steps` + `Button`；步骤校验复用 form-validation                                                                | **P0**     |
| K4  | **CommentThread**：嵌套渲染应限制最大深度，超过用 `<details>` 折叠避免无限递归性能问题                                                          | P1         |
| K5  | **ChatWindow**：消息列表必须用 `VirtualList`（>100 条）；自动滚动用 `requestAnimationFrame`                                                     | **P0**     |
| K6  | **NotificationCenter**：分组 / 标签 / 已读未读应使用 `useMemo`/`computed` 缓存                                                                  | P1         |
| K7  | **ActivityFeed**：与 Timeline 共用渲染逻辑，避免重复                                                                                            | P1         |
| K8  | **CropUpload / FormWizard 等**：本质是预设组合，建议提供"配方文档"指导用户**自己拼装**，对体积不敏感场景下不打包 composite，移到示例 / cookbook | P2（讨论） |
| K9  | a11y：Composite 的整体 ARIA 角色（feed/group/dialog/list）需明确                                                                                | P1         |

## 3. 样式现代化清单

| 组件                     | 现代化方案                                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **DataTableWithToolbar** | toolbar 玻璃 sticky + 微渐变；filter chip 圆角 pill；search input 玻璃                                                     |
| **NotificationCenter**   | 弹层玻璃 + `--tiger-radius-lg`；item 未读用左侧 primary bar + 渐变背景；hover spring 抬升                                  |
| **CommentThread**        | 评论卡片圆角 `--tiger-radius-md`；嵌套缩进改为玻璃竖线 (`linear-gradient`); 操作按钮 ghost + spring                        |
| **FormWizard**           | step indicator 玻璃化；切换步骤 emphasized easing slide；进度条用渐变                                                      |
| **CropUpload**           | dropzone 同 Upload；裁剪面板玻璃 + 圆形 mask 提供                                                                          |
| **ActivityFeed**         | 时间线节点用渐变；事件卡片玻璃；emoji / icon spring 进入                                                                   |
| **ChatWindow**           | 消息气泡圆角 `--tiger-radius-lg` 不对称；own 消息用 `--tiger-gradient-primary`；输入框玻璃 sticky；typing indicator spring |

## 4. 演示案例改进

| 组件                         | 缺失/可强化                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| **DataTableWithToolbarDemo** | 加完整 CRUD 后台示例（toolbar + filter + bulk action + export） |
| **NotificationCenterDemo**   | 加分类 tab + 标记已读 + 实时推送（mock）                        |
| **CommentThreadDemo**        | 加嵌套 + reply + edit + delete + reactions                      |
| **FormWizardDemo**           | 加跨步骤校验 + 异步提交 + 草稿保存                              |
| **CropUploadDemo**           | 加圆形 + 16:9 + 自由比例对比                                    |
| **ActivityFeedDemo**         | 加多类型事件混合（评论/点赞/系统通知）                          |
| **ChatWindowDemo**           | 加 typing / read receipt / 表情 / 长列表 virtual 演示           |

## 5. 风险与依赖

- K1-K3 是 P0：composite 内部不应重复造轮子；若已实现需重构（向后兼容 props）
- K5 ChatWindow virtual 是性能 P0
- 样式现代化依赖 Phase 1C
- K8 是讨论项：将 composite 改为"配方"会减体积，但需文档支持
