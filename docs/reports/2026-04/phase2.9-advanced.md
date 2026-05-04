# Phase 2.9 — Advanced 组件剩余任务

> 本页只保留 Advanced 组件仍未完成的优化项。

| 任务                      | 优先级 | 完成标准                                                                                   |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| VirtualList 策略化        | P1     | fixed / variable / dynamic size 通过策略模式扩展，而不是在组件中继续增加分支               |
| InfiniteScroll IO         | P1     | 使用 IntersectionObserver sentinel，替代 scroll 事件方案或提供兼容 fallback                |
| FileManager 共享 model    | P1     | tree/grid/breadcrumb 视图复用同一 core model，拖拽逻辑接入共享 drag util                   |
| ImageViewer 手势 util     | P1     | pinch / pan / zoom 手势抽到 core util，并补触控边界测试                                    |
| TaskBoard 拖拽技术债      | P1     | 当前仍包含 HTML5 DnD + touch + keyboard；若要统一 pointer/useDrag，需单独方案与兼容测试    |
| VirtualTable 压测         | P1     | sticky header + sticky column 同时启用时测试 1000 列 / 10k 行性能                          |
| PrintLayout stylesheet 化 | P2     | 评估改为 stylesheet + class util，若保留组件需说明收益                                     |
| RichText toolbar 插件化   | P2     | toolbar 命令注册支持插件配置，并保持默认轻量 engine                                        |
| Advanced 交互测试补强     | P1     | FileManager / ImageViewer / InfiniteScroll / VirtualList / VirtualTable 增加边界与性能回归 |
