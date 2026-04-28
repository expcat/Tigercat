# Phase 2.5 — Navigation 组件审查 (2026-04)

> 范围：13 个组件 — Affix, Anchor, BackTop, Breadcrumb, Dropdown, FloatButton, Menu, Pagination, Segmented, Steps, Tabs, Tree
> 共享 utils：`affix-utils.ts`、`anchor-utils.ts`、`back-top-utils.ts`、`menu-utils.ts`、`pagination-utils.ts`、`tabs-utils.ts`、`tree-utils.ts`、`steps-utils.ts`、`dropdown-utils.ts`、`breadcrumb-utils.ts`、`segmented-utils.ts`、`float-button-utils.ts`

## 1. 体积现状

| 组件                      | Vue dts            | 备注                                   |
| ------------------------- | ------------------ | -------------------------------------- |
| **Tree**                  | 9.7 KB             | 展开/选择/拖拽/虚拟化                  |
| **Pagination**            | 8.3 KB             | 较大，i18n 文案 + jumper               |
| **Menu** + Sub/Item/Group | 5.3+2.6+2.3+1.5 KB | 多文件，可整合                         |
| **Tabs** + TabPane        | 5.5+3.8 KB         | 滑动条 + 关闭 + 拖拽                   |
| **Pagination**            | 8.3 KB             | quickJumper / showSizeChanger / locale |
| **Steps** + Item          | 3.8+3.2 KB         | line/dot                               |
| **Dropdown** + Menu/Item  | 4.6+1.1+2.2 KB     | 含 Popover                             |
| **FloatButton**           | 4.3 KB             | group + tooltip                        |
| **Tour** → Feedback       | —                  | —                                      |

## 2. 代码层优化

| #   | 优化项                                                                                                                                                                      | 优先级 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| N1  | **Tree**：虚拟滚动应直接用 `VirtualList`，避免重复实现；拖拽用 `useDrag`                                                                                                    | **P0** |
| N2  | **Menu / SubMenu / MenuItem / MenuItemGroup**：4 文件可合并为 `Menu.ts`（同文件多导出），减少 chunk 数                                                                      | P1     |
| N3  | **Dropdown / DropdownMenu / DropdownItem**：同上，3 → 1 文件                                                                                                                | P1     |
| N4  | **Anchor / AnchorLink**、**Breadcrumb / BreadcrumbItem**、**Steps / StepsItem**、**Tabs / TabPane**：父子组件文件合并模式重复，建立**约定**：上下文+父+子+ITEM 都放同一文件 | P1     |
| N5  | **Pagination**：jumper 输入应用 `requestIdleCallback` 延迟校验；`locale` 文案应支持懒加载                                                                                   | P1     |
| N6  | **Tabs**：滑动指示条位置使用 `transform` 而非 `left/width`（GPU 加速）                                                                                                      | P1     |
| N7  | **Affix**：使用 `IntersectionObserver` 而非 scroll 事件监听                                                                                                                 | **P0** |
| N8  | **BackTop**：scroll 监听用 `requestAnimationFrame` throttle（已有 responsive util）；点击滚动用 `behavior: 'smooth'` 原生                                                   | P1     |
| N9  | **Anchor**：active link 检测应用 `IntersectionObserver`                                                                                                                     | **P0** |
| N10 | **Tree**：节点 key 计算缓存（避免每次 render 重算）                                                                                                                         | P1     |
| N11 | **Menu**：折叠 / 展开动画用 CSS height transition + `requestAnimationFrame` 测高（避免硬编码 max-height）                                                                   | P1     |
| N12 | **Segmented**：滑块过渡用 `transform`                                                                                                                                       | P1     |
| N13 | **FloatButton**：group 内按钮列表应使用 `useMemo` 缓存                                                                                                                      | P2     |
| N14 | **Steps**：vertical 布局连接线建议用 CSS pseudo-element 而非 inline div                                                                                                     | P2     |

## 3. 样式现代化清单

| 组件                    | 现代化方案                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Menu**                | 选中项用渐变背景 `color-mix(...primary, transparent 88%)` + 左侧 3px primary bar；展开/折叠 spring；icon 单独动效（hover 时微旋转） |
| **SubMenu** 弹层        | 玻璃 + `--tiger-radius-md`                                                                                                          |
| **Dropdown**            | 同 SubMenu；item hover 圆角 `pill` 形态可选                                                                                         |
| **Pagination**          | 当前页玻璃强调 + 渐变；箭头按钮改为 ghost + spring scale                                                                            |
| **Tabs**                | indicator 改为渐变 + 玻璃微高光；切换 spring；关闭 X 改为 hover 时旋转 90° 的优雅过渡                                               |
| **Steps**               | 圆点改为渐变填充 + 进度条玻璃化；当前 step 加 4px halo                                                                              |
| **Tree**                | 行 hover 圆角块；选中行渐变背景 + 左侧 bar；展开箭头 spring 旋转                                                                    |
| **Breadcrumb**          | 分隔符可选 `chevron / slash / dot / arrow`；末项加微渐变背景 pill                                                                   |
| **Anchor / AnchorLink** | active 项左侧 2px gradient bar；track 玻璃化                                                                                        |
| **Affix**               | 切换到 fixed 时整个容器加 `--tiger-shadow-md` 平滑过渡                                                                              |
| **BackTop**             | 圆形玻璃按钮，hover 时微弹跳                                                                                                        |
| **FloatButton**         | 主按钮玻璃 + 渐变；group 子项 spring 展开                                                                                           |
| **Segmented**           | 滑块玻璃 + 微高光；切换 spring                                                                                                      |

## 4. 演示案例改进

| 组件            | 缺失/可强化                                            |
| --------------- | ------------------------------------------------------ |
| MenuDemo        | 加水平 + 垂直 + inline + 折叠 4 模式对比；加 i18n 切换 |
| TreeDemo        | 加大数据 (10k 节点) 虚拟滚动 + 拖拽排序综合            |
| TabsDemo        | 加 pin / closable / drag-reorder 完整 demo             |
| PaginationDemo  | 加 simple / 完整 / mini 三种形态对比                   |
| StepsDemo       | 加 vertical + dot + clickable progress                 |
| DropdownDemo    | 加 hover trigger + nested submenu                      |
| BreadcrumbDemo  | 加自动路由集成（vue-router/react-router）演示          |
| AnchorDemo      | 加 affix + 高亮联动                                    |
| BackTopDemo     | 加 visibilityHeight 控制                               |
| AffixDemo       | 加 horizontal scroll affix 演示                        |
| SegmentedDemo   | 加 icon-only / pill 形态                               |
| FloatButtonDemo | 加 menu 子按钮 spring 展开                             |

## 5. 风险与依赖

- N1/N7/N9 (Tree virtual + Affix/Anchor 用 IntersectionObserver) 是性能 P0
- N2-N4 文件合并需要更新 tsup 入口 + index.ts 导出（不破坏 API）
- 样式现代化依赖 Phase 1C
