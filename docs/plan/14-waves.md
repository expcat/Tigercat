# 14 波次与执行顺序

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

波次是派工标签，不是全局锁。硬依赖满足就可以开工，不必等前一波里无关的条目做完。条数和各篇任务表一起生成，以任务表为准。

## 条数

| 波次 | 名称                   | 条数 |  P1 |  P2 |  P3 | 文档                                       |
| ---- | ---------------------- | ---: | --: | --: | --: | ------------------------------------------ |
| W1   | 安全                   |    0 |   0 |   0 |   0 | 12                                         |
| W2   | 共享 Core、主题与 i18n |    2 |   0 |   2 |   0 | 02                                         |
| W3   | 表单                   |   74 |   0 |  74 |   0 | 05                                         |
| W4   | 导航与反馈             |   69 |   0 |  69 |   0 | 06、07                                     |
| W5   | 基础与布局             |  118 |   0 | 118 |   0 | 03、04                                     |
| W6   | 数据、图表与高级       |   65 |   0 |  65 |   0 | 08、09、10                                 |
| W7   | 组合组件               |   39 |   0 |  39 |   0 | 11                                         |
| W8   | 工具链、文档与示例平台 |    7 |   0 |   7 |   0 | 12                                         |
| W9   | P3 收尾                |  100 |   0 |   0 | 100 | 02、03、04、05、06、07、08、09、10、11、12 |
| W10  | 证据补采与复验         |   11 |   — |   — |   — | 13                                         |

W1–W9 合计 474 条 Review 发现（P2 374、P3 100）。W10 的 11 条是 E01–E11。已完成条目见 [CHANGELOG.md](../../CHANGELOG.md)。

## 各波在收什么

- **W1 安全。** 当前无待办条目。
- **W2 共享 Core、主题与 i18n。** [02](02-core-theme-i18n.md) 里 X01、X02 剩下的 P2。
- **W3 表单。** [05](05-form.md) 的 P2。
- **W4 导航与反馈。** [06](06-navigation.md)、[07](07-feedback.md) 的 P2。
- **W5 基础与布局。** [03](03-basic.md)、[04](04-layout.md) 的 P2。
- **W6 数据、图表与高级。** [08](08-data.md)、[09](09-charts.md)、[10](10-advanced.md) 的 P2。
- **W7 组合组件。** [11](11-composite.md) 的 P2。排在后面，是因为它们消费前面各组的组件。
- **W8 工具链、文档与示例平台。** [12](12-tooling-docs.md) 的 P2。X06-F01、X06-F02 不受波次限制，下一次发版之前必须做完。
- **W9 P3 收尾。** 各篇的 P3。同一个组件的 P2 在做的时候，顺手能带掉的 P3 可以一起做。
- **W10 证据补采与复验。** [13](13-evidence.md) 的 E01–E11。取决于浏览器环境什么时候可用，和 W1–W9 并行。

## 硬依赖

| 先做                                   | 后做                            | 原因                                      |
| -------------------------------------- | ------------------------------- | ----------------------------------------- |
| C102-F03                               | NavigationMenu 五个子组件的条目 | menubar 结构先定                          |
| C145-F01、C145-F03、C138-F01、C138-F02 | 各张图自己的条目                | ChartTooltip 和笛卡尔系列的共享层         |
| E09 对应条目的浏览器复现               | 该条目的修复                    | 证据只有源码或 happy-dom 的，先确认能复现 |

## 开工前要先定方向的条目

这些条目的报告给了两种改法，或者指出契约还没定。选哪一种会改变验收，要先由维护者定。

| 发现      | 组件                  | 落点                   | 报告给出的改法                                                                                   |
| --------- | --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| C001-F003 | ConfigProvider        | [03](03-basic.md)      | 对齐文档、共享 resolver 与测试；若保留文档承诺，在共享计算中纳入父层 loading                     |
| C016-F002 | Image                 | [03](03-basic.md)      | 把 alt 改为图片内容或准确的激活说明；若要展示悬停/聚焦浮层则显式启用 zoomOnHover                 |
| C017-F02  | ImageCompare          | [03](03-basic.md)      | Vue 发事件前比较归一化位置，或先明确并统一无变化输入语义；不扩大到其他组件                       |
| C021-F03  | Inplace               | [03](03-basic.md)      | 文案改为「Escape 退出编辑，保留当前输入」，或 Demo 自存草稿并明确提交/放弃；不新增组件事件 API   |
| C043-F04  | List                  | [04](04-layout.md)     | 给两端 App 显式传 hoverable，或删除描述中的悬停承诺，二者择一                                    |
| C049-F01  | Skeleton              | [04](04-layout.md)     | 先确定 preset 与 variant 的公开关系，再接入一处共享解析，或在获准的 API 调整中撤销该未实现字段   |
| C057-F05  | ColorSwatch           | [05](05-form.md)       | 接受后输出有效规范 CSS，或让接受范围与 CSS paint 一致，不另造颜色解析器                          |
| C058-F01  | CronEditor            | [05](05-form.md)       | 统一 validate/parse 的步长契约并复用同一展开结果：支持则按步长展开，不支持则在统一校验入口拒绝   |
| C076-F04  | TagsInput             | [05](05-form.md)       | 先明确排序是否属公开能力；若属于，React 复用 Core moveTag 补齐同一提交流程并记录文档，不另造算法 |
| C081-F03  | Upload                | [05](05-form.md)       | 保留分片完成结果的可用 URL/响应，复用整体上传的文件结果结算；最终合并回调需先定义 API 契约       |
| C097-F02  | FullscreenButton      | [06](06-navigation.md) | 先确认非禁用 SSR 是有意契约，再同步 Demo/说明；不为对齐文案引入 hydration 属性变化               |
| C111-F05  | Spotlight             | [06](06-navigation.md) | 有查询时仍让命中的 recentIds 排在其余命中前，或把注释改为只约束空查询；未命中的 recent 不硬插回  |
| C116-F03  | Tree                  | [06](06-navigation.md) | 删掉这两个公开 prop，或让 resolveTreeSelection 在未写 selectionMode 时读它们；测试标题对齐       |
| C117-F04  | Alert                 | [07](07-feedback.md)   | defaultPrevented 时停止关闭，或不再把事件标成 cancelable                                         |
| C118-F01  | Drawer                | [07](07-feedback.md)   | 松手判定使用与 getDrawerSwipeCloseDirection 相同的轴；或改文档与 helper，只保留物理边            |
| C118-F06  | Drawer                | [07](07-feedback.md)   | 让分隔条可聚焦并响应方向键；做到之前不要把它标成可操作的 separator                               |
| C125-F01  | NotificationContainer | [07](07-feedback.md)   | Vue 不用 else，把 actionNode 放进同一个 actions 容器；若本意互斥则改 React 并在类型里写明        |
| C147-F05  | Gantt                 | [09](09-charts.md)     | React 02 加上 draggable，或去掉无效的 onDataChange，并让 demo.json 与源码一致                    |
| C151-F01  | OrgChart              | [09](09-charts.md)     | Demo 改用允许的 https 或站内路径，或不再把这页叫成头像演示；不为这个 Demo 放行 data:             |
| C169-F03  | VirtualTable          | [10](10-advanced.md)   | 要么包装层把 virtualItemHeight 缺省写成 48，要么把类型注释和生成文档改成 40；不要两处各写一个数  |
| C173-F01  | ChatWindow            | [11](11-composite.md)  | 二选一：改类型注释与生成说明写明传 false 才关并重跑 docs:api；或删两端 ?? 阈值判断               |
| C174-F03  | CommentThread         | [11](11-composite.md)  | node 为空时插入新的根节点；若只演示回复，就关掉根输入框并改 demo.json                            |
| C174-F04  | CommentThread         | [11](11-composite.md)  | 二选一：改类型注释和两份 demo.json 写明必须传 showMore；或删掉两端的 showMore 条件               |
| C175-F05  | DataTableWithToolbar  | [11](11-composite.md)  | 两个 02 的 toolbar 加 search: false；若要演示远程搜索，就接 onSearch 并改 demo.json              |
| C177-F04  | NotificationBell      | [11](11-composite.md)  | 两端都做成真正的受控 open，或删掉 Vue 的 update:open；不让 open 留在根节点属性上                 |
| C181-F03  | WorkflowDesigner      | [11](11-composite.md)  | 用 Number.isFinite 区分空串与 0，空串才回落 1；若下限为 1 则显示与提交同规则并写进类型           |
| C184-F01  | WorkflowActionBar     | [11](11-composite.md)  | 多人加签就让 onChange 或另一回调能增删数组；若只支持单人，加签时 multiple 保持 false             |
| C184-F02  | WorkflowActionBar     | [11](11-composite.md)  | 按注释接权限判断且数组须全部通过，或改注释写明字符串是 viewerRole、命中一个即可                  |

## 每条怎么算做完

口径在 [00](00-scope.md#验收总则)。做完的行从任务表里删掉，完成记录写进 `CHANGELOG.md`。
