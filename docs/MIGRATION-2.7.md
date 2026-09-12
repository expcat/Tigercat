# Tigercat 2.6.1 → 2.7.0 迁移指南

v2.7.0 是组件瘦身 minor：把三组已存在的薄别名收进保留件的同一文件，并把 package 子路径指到保留件 dist。无新必填 prop。不砍工作流 2.5/2.6 能力。不是 BPMN / Flowable / Camunda。完整条目见 [CHANGELOG.md](../CHANGELOG.md#v270)。索引见 [MIGRATION.md](MIGRATION.md#v270)。

## 兼容期（可先不改）

| 2.6.x 写法                                                       | 2.7.0 行为                                                                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'` | 仍导出 `ImageViewer`。实现与 `ImagePreview` 同文件；子路径指向 `ImagePreview` dist。`minZoom`/`maxZoom` 仍映射到 `minScale`/`maxScale`。 |
| `import { Kanban } from '@expcat/tigercat-react/Kanban'`         | 仍导出 `Kanban`。默认 `showCardCount`/`allowAddCard` 仍为 `true`。子路径指向 `TaskBoard` dist。                                          |
| `import { DonutChart } from '@expcat/tigercat-vue/DonutChart'`   | 仍导出 `DonutChart`。默认 `innerRadiusRatio` 仍为 0.6。子路径指向 `PieChart` dist。                                                      |
| 工作流 Viewer / Timeline / ActionBar / Designer                  | **不变**                                                                                                                                 |
| DetailShell header / action 槽                                   | 仍粘底。节点从 `header`/`footer` 改为 `div[data-slot]`（壳已是 `role="region"`）。class 不变。                                           |

无新必填 prop。不要依赖未文档化的 `dist/components/ImageViewer.mjs`（以及 `Kanban.mjs` / `DonutChart.mjs`）文件名；请用 package `exports` 子路径。

## 推荐改法（新代码）

```ts
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'
import { TaskBoard } from '@expcat/tigercat-vue/TaskBoard'
import { PieChart } from '@expcat/tigercat-vue/PieChart'
```

- 看图：`minScale` / `maxScale`，不要新写 `minZoom`。
- 看板：需要张数/加卡时显式传 `showCardCount` / `allowAddCard`。
- 环形图：`PieChart` + `innerRadiusRatio`（默认实心；0.6 即原 Donut）。

3.0 可能去掉独立别名子路径叙事；2.7 **不删**公开名。
