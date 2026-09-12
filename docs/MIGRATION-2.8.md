# Tigercat 2.7.x → 2.8.0 迁移指南

v2.8.0 是内部内聚 minor：生成文档降格三别名、下载 Blob 单源、看图/看板类型与 utils 折进保留件、Line/Area 笛卡尔壳共用。无新必填 prop。**不删** `ImageViewer` / `Kanban` / `DonutChart` 公开名与子路径。不砍工作流 2.5/2.6 能力。不是 BPMN / Flowable / Camunda。完整条目见 [CHANGELOG.md](../CHANGELOG.md#v280)。索引见 [MIGRATION.md](MIGRATION.md#v280)。

## 兼容期（可先不改）

| 2.7.x 写法                                                       | 2.8.0 行为                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------- |
| `import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'` | 仍导出。`minZoom`/`maxZoom` 仍映射。                    |
| `import { Kanban } from '@expcat/tigercat-react/Kanban'`         | 仍导出。默认 `showCardCount`/`allowAddCard` 仍为 true。 |
| `import { DonutChart } from '@expcat/tigercat-vue/DonutChart'`   | 仍导出。默认 `innerRadiusRatio` 仍为 0.6。              |
| Vue `AreaChart` `onPointClick`                                   | 现在会调用（与 Line / React Area 对齐）。               |
| 工作流 Viewer / Timeline / ActionBar / Designer / DetailShell    | **不变**                                                |

无新必填 prop。不要依赖未文档化的 dist 文件名。

## 推荐改法（新代码）

与 2.7 相同：用 ImagePreview / TaskBoard / PieChart。生成文档与 examples 不再把三别名当一等用法。

```ts
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'
import { TaskBoard } from '@expcat/tigercat-vue/TaskBoard'
import { PieChart } from '@expcat/tigercat-vue/PieChart'
```

3.0 可能去掉独立别名子路径叙事；2.8 **不删**公开名。
