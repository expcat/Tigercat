# 性能优化指南

Tigercat 组件库在设计上注重性能。本文档介绍关键的性能优化策略。

## Tree Shaking

所有包均配置了 `sideEffects: false`，支持完整的 tree shaking：

```ts
// ✅ 只引入 Button，其他组件不会打包
import { Button } from '@expcat/tigercat-vue'

// ✅ 子路径导入，进一步减小 bundle
import { Button } from '@expcat/tigercat-vue/Button'
```

## 虚拟滚动

对于大数据量场景，使用虚拟滚动组件：

| 场景     | 组件             | 适用数据量 |
| -------- | ---------------- | ---------- |
| 列表     | `VirtualList`    | 1000+ 项   |
| 表格     | `VirtualTable`   | 1000+ 行   |
| 无限加载 | `InfiniteScroll` | 分页加载   |

```tsx
// React
<VirtualList items={data} itemHeight={40} overscan={5}>
  {(item) => <div>{item.name}</div>}
</VirtualList>
```

## 图表性能

Tigercat 图表基于纯 SVG 实现，无第三方依赖：

- **数据量 < 1000 点**：直接使用，无需优化
- **数据量 1000-5000 点**：启用 `simplify` 以降采样
- **数据量 > 5000 点**：考虑服务端聚合后再渲染

## 主题切换

主题基于 CSS 变量实现，切换几乎零开销：

```ts
import { setThemeColors } from '@expcat/tigercat-core'

// 批量更新 CSS 变量，一次重绘
setThemeColors({ primary: '#2563eb', 'primary-hover': '#1d4ed8' })
```

## Bundle Size 预算

| 包                              | 限制 (gzip) |
| ------------------------------- | ----------- |
| `@expcat/tigercat-core`         | < 100 KB    |
| `@expcat/tigercat-vue` (full)   | < 250 KB    |
| `@expcat/tigercat-react` (full) | < 250 KB    |

使用 `pnpm size` 检查当前 bundle 大小。

## 懒加载

结合路由懒加载，按需加载组件页面：

```tsx
// React
const TablePage = React.lazy(() => import('./pages/TableDemo'))
```

```vue
<!-- Vue Router -->
{ path: '/table', component: () => import('./pages/TableDemo.vue') }
```
