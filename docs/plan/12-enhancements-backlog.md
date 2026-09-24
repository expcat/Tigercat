# 12 增强核对

彻底重构，禁止补丁。条目一次做到新结构：不留弃用别名、双写 prop、运行时兼容分支，或只改半边行为的收尾。每个改到的组件，同一批同步 `skills/tigercat` 与 `examples`。测试只在本地跑，不写入 CI / workflow。

## 目标

132 条增强每一条都能在 01–11 的任务表里找到编号、波次和验收。本篇只做核对，保证没有漏排。

## 非目标

不把增强再写一套与落点文件并行的实施说明。不把任何一条留成没有波次的索引。

132 条增强全部有可执行落点。下表是核对，不是第二份排期。正文、验收和 skill / examples 要求在落点文件的任务表里。

观察项改判另有 OBS-1（Inplace）和 OBS-2（CopyButton），落在 [01](01-foundation.md)，波次 W9，不计入下面的 132。

| 模块 | 增强条数 | 落点 |
| --- | ---: | --- |
| T01 | 13 | [01-foundation.md](01-foundation.md) |
| T02 | 10 | [01-foundation.md](01-foundation.md) |
| T03 | 8 | [02-forms.md](02-forms.md) |
| T04 | 12 | [02-forms.md](02-forms.md) |
| T05 | 10 | [03-feedback.md](03-feedback.md) |
| T06 | 13 | [04-layout.md](04-layout.md) |
| T07 | 14 | [05-navigation.md](05-navigation.md) |
| T08 | 16 | [06-data-table.md](06-data-table.md) |
| T09 | 13 | [08-charts.md](08-charts.md) |
| T10 | 8 | [07-virtual.md](07-virtual.md)（E6）、[09-editors.md](09-editors.md)（其余） |
| T11 | 9 | [10-composite.md](10-composite.md) |
| T12 | 6 | [11-tooling.md](11-tooling.md) |
| 合计 | 132 | |

## 全表

| 编号 | 落点 | 波次 | 条目 |
| --- | --- | --- | --- |
| T01 E1 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 可嵌套的主题根 |
| T01 E2 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 强调色阶梯，而不是七份预设 |
| T01 E3 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 从 seed 派生交互态，并在生成期查对比度 |
| T01 E4 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 首屏色方案脚本 |
| T01 E5 | [01-foundation.md](01-foundation.md) | W9 模块增强 | Tailwind 只映射语义工具类 |
| T01 E6 | [01-foundation.md](01-foundation.md) | W9 模块增强 | part / state 作为跨框架样式合同 |
| T01 E7 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 焦点栈、关闭层、方向键漫游作为 core 原语 |
| T01 E8 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 系统高对比与强制色彩 |
| T01 E9 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 标准 token 格式和多端产物 |
| T01 E10 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 容器查询断点 |
| T01 E11 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 不依赖颜色的状态通道 |
| T01 E12 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 导出之后的数据交换 |
| T01 E13 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 七套预设的观感走查（低优先级） |
| T02 E1 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 预览工具条补齐翻转、下载和原尺寸 |
| T02 E2 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 一组图的受控灯箱 |
| T02 E3 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 头像组溢出可以打开 |
| T02 E4 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 二维码的纠错等级和中心图标 |
| T02 E5 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 代码块的行号和语言标签 |
| T02 E6 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 裁剪的比例、旋转和圆形输出 |
| T02 E7 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 对比图的前后标题 |
| T02 E8 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 水印只作为视觉平铺 |
| T02 E9 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 跑马灯的边缘渐隐 |
| T02 E10 | [01-foundation.md](01-foundation.md) | W9 模块增强 | 缩略图画廊 |
| T03 E1 | [02-forms.md](02-forms.md) | W9 模块增强 | 多选的标签、全选和数量上限 |
| T03 E2 | [02-forms.md](02-forms.md) | W9 模块增强 | 选项模型和面板插槽 |
| T03 E3 | [02-forms.md](02-forms.md) | W9 模块增强 | 垂直滑块、可点刻度和旁边的数字 |
| T03 E4 | [02-forms.md](02-forms.md) | W9 模块增强 | 标签的排序、拒绝说明和自定义内容 |
| T03 E5 | [02-forms.md](02-forms.md) | W9 模块增强 | 可增删的字段数组 |
| T03 E6 | [02-forms.md](02-forms.md) | W9 模块增强 | 提交失败的错误摘要 |
| T03 E7 | [02-forms.md](02-forms.md) | W9 模块增强 | 只读贯穿基础字段 |
| T03 E8 | [02-forms.md](02-forms.md) | W9 模块增强 | 大整数用字符串进出 |
| T04 E1 | [02-forms.md](02-forms.md) | W9 模块增强 | 日期的值可以是周、月、季、年，也可以带时间 |
| T04 E2 | [02-forms.md](02-forms.md) | W9 模块增强 | 时间列吸附，并禁用整段不可选的上下午 |
| T04 E3 | [02-forms.md](02-forms.md) | W9 模块增强 | 取色器的吸管、最近使用和触发器上的文字 |
| T04 E4 | [02-forms.md](02-forms.md) | W9 模块增强 | Cron 的人话说明和下一轮时间 |
| T04 E5 | [02-forms.md](02-forms.md) | W9 模块增强 | 数字键盘的标题、功能键和按光标插入 |
| T04 E6 | [02-forms.md](02-forms.md) | W9 模块增强 | 自动完成的选项节点、分组和远程高亮 |
| T04 E7 | [02-forms.md](02-forms.md) | W9 模块增强 | 级联多选和按字段名读取选项 |
| T04 E8 | [02-forms.md](02-forms.md) | W9 模块增强 | 树选的可关闭标签 |
| T04 E9 | [02-forms.md](02-forms.md) | W9 模块增强 | 提及锚在光标上，已插入的一段可以整段删掉 |
| T04 E10 | [02-forms.md](02-forms.md) | W9 模块增强 | 穿梭的分页和单向移动 |
| T04 E11 | [02-forms.md](02-forms.md) | W9 模块增强 | 上传的目录、粘贴和列表内排序 |
| T04 E12 | [02-forms.md](02-forms.md) | W9 模块增强 | 签名的重做、笔画上限和按内容裁切 |
| T05 E1 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 命令式确认框 |
| T05 E2 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 多层模态的叠放 |
| T05 E3 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 抽屉把下一层推开，宽度可以拖 |
| T05 E4 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 底栏和抽屉跟手滑动 |
| T05 E5 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 同一条提示走完一个 Promise |
| T05 E6 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 提示里的自定义内容是节点 |
| T05 E7 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 引导的箭头、封面和「点这里」 |
| T05 E8 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 警报的操作区和不确定进度 |
| T05 E9 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 轻量浮层的箭头和共享延迟 |
| T05 E10 | [03-feedback.md](03-feedback.md) | W9 模块增强 | 顶栏进度的最短展示 |
| T06 E1 | [04-layout.md](04-layout.md) | W9 模块增强 | 侧栏可以自己折叠 |
| T06 E2 | [04-layout.md](04-layout.md) | W10 开箱壳与发布面 | 应用壳的跳转和顶栏开关 |
| T06 E3 | [04-layout.md](04-layout.md) | W9 模块增强 | 分栏可以收起一栏，并记住比例 |
| T06 E4 | [04-layout.md](04-layout.md) | W9 模块增强 | 单块缩放的辅助线和比例预设 |
| T06 E5 | [04-layout.md](04-layout.md) | W9 模块增强 | 滚动到标记，并可选保留原生条 |
| T06 E6 | [04-layout.md](04-layout.md) | W9 模块增强 | 源序瀑布流和显式的最短列 |
| T06 E7 | [04-layout.md](04-layout.md) | W9 模块增强 | 纵向轮播、一屏多张和缩略图 |
| T06 E8 | [04-layout.md](04-layout.md) | W9 模块增强 | 列表的项、元信息和操作区 |
| T06 E9 | [04-layout.md](04-layout.md) | W9 模块增强 | 骨架在占位和内容之间切换 |
| T06 E10 | [04-layout.md](04-layout.md) | W9 模块增强 | 描述列表的项可以是插槽 |
| T06 E11 | [04-layout.md](04-layout.md) | W9 模块增强 | 间距可以有分隔，栅格缝可以按断点变化 |
| T06 E12 | [04-layout.md](04-layout.md) | W9 模块增强 | 卡片标题级别 |
| T06 E13 | [04-layout.md](04-layout.md) | W9 模块增强 | 容器的默认阅读宽度 |
| T07 E1 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 弹出菜单共用一套项 |
| T07 E2 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 折叠应用菜单有提示，项上可以有徽标 |
| T07 E3 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 站点导航的富面板和当前页 |
| T07 E4 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 页签可以溢出，标题可以是节点 |
| T07 E5 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 树可以连选，标题点击可以展开 |
| T07 E6 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 字首跳转和弹出层提示是菜单族的标配 |
| T07 E7 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 面包屑把折起的项放进菜单 |
| T07 E8 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 页头可以带上已有的面包屑和页签 |
| T07 E9 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 浮动按钮可以是链接，并带上已有徽标 |
| T07 E10 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 分页的省略号可以跳页，调用方可以换一页的样子 |
| T07 E11 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 步骤可以是点状，错误步可以点 |
| T07 E12 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 聚光灯记住最近使用，并在页脚提示快捷键 |
| T07 E13 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 锚点和滚动监听共用一个活动项模型 |
| T07 E14 | [05-navigation.md](05-navigation.md) | W9 模块增强 | 固钉在钉住时通知调用方 |
| T08 E1 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 一张表，虚拟是一种策略 |
| T08 E2 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 表头菜单里做筛选、排序、隐藏和列宽 |
| T08 E3 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 选择可以是本页、已加载行，或从锚点连选 |
| T08 E4 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 分组可以收起，单元格可以合并 |
| T08 E5 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 需要时才变成网格键盘 |
| T08 E6 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 编辑格可以是数字或选择，并带校验 |
| T08 E7 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 导出范围可选，xlsx 仍走 DataExport |
| T08 E8 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 固定列和列虚拟可以同时开 |
| T08 E9 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 加载用骨架行，空态可以是节点 |
| T08 E10 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 窄屏卡片若虚拟，按卡片高度窗口化 |
| T08 E11 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 行和列的拖拽从把手开始，并可受控 |
| T08 E12 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 合计行可以按列计算，并在滚动时留在底部 |
| T08 E13 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 日历保持一颗卡片，日程用组合 |
| T08 E14 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 倒计时的暂停和环形进度放在外面 |
| T08 E15 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 时间线的对侧标签和横向轴 |
| T08 E16 | [06-data-table.md](06-data-table.md) | W9 模块增强 | 折叠可以嵌套，键盘规则不变 |
| T09 E1 | [08-charts.md](08-charts.md) | W9 模块增强 | 图例能把系列从比例尺里拿掉 |
| T09 E2 | [08-charts.md](08-charts.md) | W9 模块增强 | 柱可以分组或堆叠，线和柱可以在同一对轴上 |
| T09 E3 | [08-charts.md](08-charts.md) | W9 模块增强 | 时间轴、双轴、参考线和框选 |
| T09 E4 | [08-charts.md](08-charts.md) | W9 模块增强 | 提示是结构化的，导出是图上的一个动作 |
| T09 E5 | [08-charts.md](08-charts.md) | W9 模块增强 | 饼可以防标签重叠，玫瑰和嵌套是同一张图的模式 |
| T09 E6 | [08-charts.md](08-charts.md) | W9 模块增强 | 雷达的每个轴有自己的最大值 |
| T09 E7 | [08-charts.md](08-charts.md) | W9 模块增强 | 仪表可以是弧上的进度，刻度跟值域走 |
| T09 E8 | [08-charts.md](08-charts.md) | W9 模块增强 | 热力有一条色带，日历热力是同一布局的轴 |
| T09 E9 | [08-charts.md](08-charts.md) | W9 模块增强 | 漏斗标出相邻层的转化 |
| T09 E10 | [08-charts.md](08-charts.md) | W9 模块增强 | 旭日和矩形树可以下钻 |
| T09 E11 | [08-charts.md](08-charts.md) | W9 模块增强 | 甘特能标里程碑、依赖类型和可见时间窗 |
| T09 E12 | [08-charts.md](08-charts.md) | W9 模块增强 | 组织图可以收起、查找和缩放 |
| T09 E13 | [08-charts.md](08-charts.md) | W9 模块增强 | 瀑布和桑基是两张新图，其余图种先不进默认清单 |
| T10 E1 | [09-editors.md](09-editors.md) | W9 模块增强 | 代码编辑有查找、括号和大文件窗口 |
| T10 E2 | [09-editors.md](09-editors.md) | W9 模块增强 | Markdown 有任务列表、目录和分栏同步 |
| T10 E3 | [09-editors.md](09-editors.md) | W9 模块增强 | 富文本是结构化文档上的表格、图片和斜杠菜单 |
| T10 E4 | [09-editors.md](09-editors.md) | W9 模块增强 | 文件管理可以上传、重命名和预览 |
| T10 E5 | [09-editors.md](09-editors.md) | W9 模块增强 | 标注可以移动、改顶点，并导出一张图 |
| T10 E6 | [07-virtual.md](07-virtual.md) | W9 模块增强 | 虚拟列表能横向、成网格，并和无限滚动接在一起 |
| T10 E7 | [09-editors.md](09-editors.md) | W9 模块增强 | 拖拽有放置预览和实时说明 |
| T10 E8 | [09-editors.md](09-editors.md) | W9 模块增强 | 打印预览能看见自动分页 |
| T11 E1 | [10-composite.md](10-composite.md) | W10 开箱壳与发布面 | 应用壳是一页，零件仍是原来的那些 |
| T11 E2 | [10-composite.md](10-composite.md) | W10 开箱壳与发布面 | 列表页把可折叠查询和工具条放在一起 |
| T11 E3 | [10-composite.md](10-composite.md) | W9 模块增强 | 动态按日加载，新的一条说出来 |
| T11 E4 | [10-composite.md](10-composite.md) | W9 模块增强 | 评论可以编辑和删除，富文本先消毒 |
| T11 E5 | [10-composite.md](10-composite.md) | W9 模块增强 | 铃铛收件箱和命令式提示各是一条 |
| T11 E6 | [10-composite.md](10-composite.md) | W9 模块增强 | 向导离开未完成的步骤时先问一声 |
| T11 E7 | [10-composite.md](10-composite.md) | W9 模块增强 | Schema 的只读是展示，控件参数可以透传 |
| T11 E8 | [10-composite.md](10-composite.md) | W10 开箱壳与发布面 | 审批详情把表单、记录和动作条接成一次提交 |
| T11 E9 | [10-composite.md](10-composite.md) | W9 模块增强 | 受理人选择器只消费调用方给的目录 |
| T12 E1 | [11-tooling.md](11-tooling.md) | W10 开箱壳与发布面 | 创建项目时带上可运行的应用壳 |
| T12 E2 | [11-tooling.md](11-tooling.md) | W9 模块增强 | `add` 写入一块可运行的用法，而不是空标签 |
| T12 E3 | [11-tooling.md](11-tooling.md) | W10 开箱壳与发布面 | 文档站一组件一页 |
| T12 E4 | [11-tooling.md](11-tooling.md) | W10 开箱壳与发布面 | MCP 能按安装版本回答，并提供注册表式检索 |
| T12 E5 | [11-tooling.md](11-tooling.md) | W10 开箱壳与发布面 | 大版本提供一次迁移命令 |
| T12 E6 | [11-tooling.md](11-tooling.md) | W10 开箱壳与发布面 | 发布产物里带一份可核对的技能目录 |

## 不能降级成索引的几条

这些在审查讨论里曾被建议「只标候选」。拍板之后它们有波次、有落点：

| 编号 | 波次 | 说明 |
| --- | --- | --- |
| T11 E1 | W10 | 一页应用壳，零件仍是已有组件 |
| T11 E2 | W10 | 可折叠查询加工具条，依赖 T11 O9 |
| T11 E8 | W10 | 审批详情一次提交，依赖 O6、O11、O18 |
| T12 E1 | W10 | `create` 带上壳预设，依赖 T11 E1 |
| T12 E3 | W10 | 文档站一组件一页，依赖组件记录 |
| T01 E6 | W9 | part / state 样式合同，取代单独的 headless 模式 |
| T09 E13 | W9 | 瀑布图与桑基图 |
