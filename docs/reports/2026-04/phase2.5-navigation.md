# Phase 2.5 — Navigation 组件剩余任务

> 本页只保留 Navigation 组件仍未完成的优化项。

| 任务                          | 优先级 | 完成标准                                                                                    |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| 父子组件同文件约定            | P1     | Menu、Dropdown、Anchor、Breadcrumb、Steps、Tabs 建立父子组件同文件模式，减少 chunk 与导出链 |
| Pagination idle / locale      | P1     | jumper 校验延迟到 idle 或稳定节流；locale 文案支持懒加载路径                                |
| Tabs indicator transform      | P1     | 滑动指示条用 transform 驱动，避免 left/width reflow                                         |
| Tree key 缓存复核             | P1     | 节点 key 与可见节点派生缓存有回归测试，避免每 render 重算                                   |
| Menu 展开动画                 | P1     | 使用 CSS height transition + rAF 测高，避免硬编码 max-height                                |
| FloatButton group memo        | P2     | 子按钮列表缓存，避免不必要重建                                                              |
| Steps vertical pseudo-element | P2     | vertical 连接线改用 CSS pseudo-element 或确认保留 inline div 的理由                         |
