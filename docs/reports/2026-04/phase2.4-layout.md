# Phase 2.4 — Layout 组件审查 (2026-04)

> 范围：14 类 — Card, Carousel, Container, Descriptions, Row/Col (Grid), Layout (Header/Sidebar/Content/Footer), List, Resizable, Skeleton, Space, Splitter, Statistic
> 共享 utils：`grid.ts`、`space.ts`、`splitter-utils.ts`、`resizable-utils.ts`、`skeleton-utils.ts`、`statistic-utils.ts`、`card-utils.ts`、`list-utils.ts`、`descriptions-utils.ts`、`carousel-utils.ts`、`container-utils.ts`、`layout-utils.ts`

## 1. 体积现状

| 组件            | Vue dts | 备注                        |
| --------------- | ------- | --------------------------- |
| Table → 见 Data | —       | —                           |
| List            | 6 KB    | virtual + pagination 集成   |
| Descriptions    | 5 KB    | columns layout              |
| Carousel        | 中      | autoplay + indicator + 触摸 |
| Splitter        | 2.7 KB  | 多面板拖拽                  |
| Resizable       | 3.6 KB  | 8 方向                      |
| Skeleton        | 2.5 KB  | shape + rows + animated     |

## 2. 代码层优化

| #   | 优化项                                                                                                                                                                 | 优先级             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| L1  | **Row / Col**：使用 CSS Grid 还是 Flexbox？若用 12 grid + gutter，应避免在每个 col 里读 props 计算 inline style，改用 `grid-cols-12` + arbitrary `col-span-[var(...)]` | P1                 |
| L2  | **Layout 系列**（Header/Sidebar/Content/Footer）：5 个 thin wrapper，可考虑合并为 `Layout.tsx` 单文件多导出                                                            | P2                 |
| L3  | **Splitter / Resizable**：拖拽都用 `useDrag` hook（已有），确认无重复                                                                                                  | P1                 |
| L4  | **Carousel**：autoplay 用 `setInterval` 还是 `requestAnimationFrame`？后者更省电                                                                                       | P1                 |
| L5  | **Carousel**：触摸事件应被动注册 `{ passive: true }` 避免 jank                                                                                                         | P1                 |
| L6  | **Skeleton**：动画 shimmer 应使用纯 CSS（`background-position`），避免 JS 控制                                                                                         | P1                 |
| L7  | **Statistic**：数字滚动动画应用 `requestAnimationFrame` + easing；当前若用 setInterval 需替换                                                                          | P1                 |
| L8  | **List virtual mode**：应直接复用 `VirtualList` 组件，不应内嵌一份虚拟逻辑                                                                                             | **P0**（如有重复） |
| L9  | **Card**：hoverable 状态过渡应使用新 `--tiger-transition-emphasized`                                                                                                   | P2                 |
| L10 | **Descriptions**：columns × rows 的合并算法 O(N×M)，对 100+ items 列表需要测一下                                                                                       | P2                 |
| L11 | **Container**：仅做 responsive 宽度限制，可改为 CSS class util 不需 component                                                                                          | P2                 |

## 3. 样式现代化清单

| 组件                                   | 现代化方案                                                                                                                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Card**                               | `rounded-[var(--tiger-radius-lg,12px)]` + `--tiger-shadow-md`；hover 升级到 `--tiger-shadow-lg` + 微抬升 `translateY(-2px)`；提供 `glass` 形态用 `--tiger-shadow-glass`；提供 `gradient` head 形态 |
| **Carousel**                           | indicator 用 pill 形态；切换用 spring easing；进入新增 `fade + zoom` 预设                                                                                                                          |
| **List**                               | item hover 显示左侧 2px primary indicator；virtual 滚动 thumb 玻璃化                                                                                                                               |
| **Descriptions**                       | 表格描边用 `--tiger-border` 微化；row hover 高亮 `color-mix(...primary, transparent 95%)`                                                                                                          |
| **Skeleton**                           | shimmer 改用 `linear-gradient(110deg, transparent 0%, color-mix(...) 50%, transparent 100%)` 配合 spring easing；shape 圆角对齐目标组件的 `--tiger-radius-*`                                       |
| **Space**                              | 增加 `gap-fluid` (`clamp()` 响应式)                                                                                                                                                                |
| **Splitter / Resizable**               | drag handle 玻璃化 + hover 时 primary 描边；拖动时 ghost 元素 spring 跟随                                                                                                                          |
| **Statistic**                          | value 数字使用 `font-variant-numeric: tabular-nums`；图标 + value 间距用 `--tiger-spacing-md`                                                                                                      |
| **Layout / Header / Sidebar / Footer** | Header 提供 `glass + sticky` 预设；Sidebar 折叠用 spring 宽度过渡                                                                                                                                  |
| **Container**                          | 加 `glass` 包装预设                                                                                                                                                                                |

## 4. 演示案例改进

| 组件                         | 缺失/可强化                                                                |
| ---------------------------- | -------------------------------------------------------------------------- |
| CardDemo                     | 加 glass / gradient head / hover lift 演示                                 |
| CarouselDemo                 | 加 fade / zoom / 3D-coverflow 多预设演示                                   |
| ListDemo                     | 加 virtual + 行内编辑 + 拖拽排序综合 demo                                  |
| DescriptionsDemo             | 加 column responsive + 内联编辑                                            |
| LayoutDemo                   | 加完整后台模板（Header sticky-glass + Sidebar 折叠 + Breadcrumb + Footer） |
| SkeletonDemo                 | 加 shimmer + dark mode 切换                                                |
| SpaceDemo                    | 加 gap-fluid 响应式                                                        |
| SplitterDemo / ResizableDemo | 加复杂多面板（IDE 风格）演示                                               |
| StatisticDemo                | 加 countTo 动画 + group dashboard 演示                                     |
| GridDemo                     | 加 12 列响应式 + offset / push / pull 完整展示                             |
| ContainerDemo                | 加 fluid + max-width + glass 包装                                          |

## 5. 风险与依赖

- L8 是 P0：若 List 自带 virtual 重复实现，移到 VirtualList 后体积可下降
- 样式现代化依赖 Phase 1C 主题 token；Skeleton 与新 motion easing 强绑定
- Splitter / Resizable 的玻璃化在拖动时需注意 backdrop-blur 性能（建议拖动中临时关闭 blur）
