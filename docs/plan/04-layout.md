# 04 布局组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

layout 组 19 个组件（C033–C051）。只有 AspectRatio、Card、Carousel 补采过浏览器证据，其余 16 个的视觉与键盘全部 blocked。

## 目标

- 布局计算在 Fragment、空节点、RTL 下结果一致。

## 非目标

- 不改栅格和断点的公开契约。

## 依赖与顺序

- Card、Carousel 的 RTL 渲染和方向键没有实测，Card 03/04 封面被图源挡住，见 [13](13-evidence.md) 的 E04、E05。

## 概览

本篇 36 条：P1 0、P2 35、P3 1。
按波次：W5 35、W9 1。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C034-F04（S13）、C037-F01（S11）、C039-F03（S08）、C040-F01（S01）、C048-F02（S13）、C050-F02（S13）、C051-F03（S13）。

## 条目

### C034 Card

报告 `groups/layout/Card.md`，队列状态 complete。另受 S11 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                    | 验收                                                                          |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------- | ----------------------------------------------------------------------------- |
| C034-F07 | P3   | W9   | 双端 | 类型 | 键盘路径给 onClick 的事件与公开类型不同 | Enter/Space 激活 Card 时 onClick 收到的事件符合声明的点击类型，不再是 keydown |

### C035 Carousel

报告 `groups/layout/Carousel.md`，队列状态 complete。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                                 | 验收                                                                                     |
| -------- | ---- | ---- | --------- | ---- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| C035-F01 | P2   | W5   | Demo+测试 | 示例 | 两端 Demo01 把普通圆点按钮写成真正的 tab             | 两端 carousel/01 demo.json 与 React 测试标题不再称 tab，改述为按钮导航加 aria-current    |
| C035-F02 | P2   | W5   | Vue       | 行为 | Vue 释放初次受控索引时重置当前页语义，窗口顺序未同步 | 首挂 currentIndex=1 后撤掉该 prop，Vue 仍停在第二页，DOM 顺序与 transform 同步           |
| C035-F03 | P2   | W5   | Vue       | 行为 | Vue 缓存旧 slot 闭包，父渲染函数替换内容后仍留旧页   | 父 render 函数把 items 由 2 项换成 3 项后，Vue Carousel 显示新 3 页与 3 个圆点，同 React |

### C036 Col

报告 `groups/layout/Col.md`，队列状态 needs-evidence。另受 S02 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                              | 验收                                                                                    |
| -------- | ---- | ---- | ---- | ---- | --------------------------------- | --------------------------------------------------------------------------------------- |
| C036-F01 | P2   | W5   | Core | 行为 | flex 与 span=0 同用时丢失隐藏语义 | flex 与 span=0（含响应式 0）同用时双端输出 --tiger-col-display-\* 为 none，对应断点隐藏 |

### C038 Content

报告 `groups/layout/Content.md`，队列状态 needs-evidence。另受 S02 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                 | 验收                                                                          |
| -------- | ---- | ---- | --------- | ---- | ------------------------------------ | ----------------------------------------------------------------------------- |
| C038-F01 | P2   | W5   | Core+双端 | 行为 | 含空白 id 使跳转链接与实际 main 脱节 | id 带首尾空格时 href 与 main.id 均为 custom-main；纯空格 id 时均为 tiger-main |

### C039 Descriptions

报告 `groups/layout/Descriptions.md`，队列状态 needs-evidence。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                | 验收                                                                               |
| -------- | ---- | ---- | ---- | ------ | ----------------------------------- | ---------------------------------------------------------------------------------- |
| C039-F01 | P2   | W5   | 双端 | 行为   | children 分支丢失调用方属性         | children/default slot 模式根节点保留 id、data-probe、aria-label 与 style           |
| C039-F02 | P2   | W5   | Vue  | 无障碍 | Vue title slot 未关联可访问名称     | Vue 只提供 title slot 且 items 非空时，table 或 dl 的 aria-labelledby 指向 titleId |
| C039-F04 | P2   | W5   | 双端 | 行为   | 空 items 的默认水平布局丢失标题     | 默认水平布局、items=[]、title 为 Empty title 时双端 SSR 仍输出该标题               |
| C039-F05 | P2   | W5   | 双端 | 无障碍 | 组合子组件产生无效的 dt/dd 父级结构 | Descriptions 包裹 DescriptionsItem 的双端静态 DOM 经 axe 扫描不再报 dlitem         |

### C041 Header

报告 `groups/layout/Header.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                | 验收                                                                               |
| -------- | ---- | ---- | ---- | ---- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| C041-F01 | P2   | W5   | Demo | 示例 | Demo01 把未启用的 sticky 写成已生效 | layout/01 描述不再称 sticky，或 blur Header 显式传 sticky 并带 tiger-header-sticky |

### C042 Layout

报告 `groups/layout/Layout.md`，队列状态 needs-evidence。另受 S01、C038-F01、C041-F01 影响。

| 编号     | 级别 | 波次 | 端          | 类别 | 条目                             | 验收                                                                              |
| -------- | ---- | ---- | ----------- | ---- | -------------------------------- | --------------------------------------------------------------------------------- |
| C042-F01 | P2   | W5   | 文档·生成器 | 文档 | 文档把公开 mode 错写成 direction | Layout 文档与 MCP 写 mode=horizontal，不再出现 direction=horizontal，生成物无漂移 |

### C043 List

报告 `groups/layout/List.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                       | 验收                                                                              |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| C043-F04 | P2   | W5   | Demo | 示例 | 两端 Demo01 宣称悬停效果但未启用 hoverable | 两端 list/01 传入 hoverable 后行有 hover class，或 demo.json 不再出现「悬停效果」 |
| C043-F05 | P2   | W5   | Demo | 示例 | Demo03 页大小选择器无法持久改变 pageSize   | list/03 选择新页大小后列表条数与选择器保持新值，或页大小选择器不再显示            |

### C044 Masonry

报告 `groups/layout/Masonry.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                         | 验收                                                                                   |
| -------- | ---- | ---- | ---- | ---- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| C044-F01 | P2   | W5   | Core | 行为 | 最短列分配忽略间距，会选择实际更高的列       | heights=[100,1,1,1]、columns=2、gap=100 时第 4 项落入第 1 列，列高不再是 [100,203]     |
| C044-F02 | P2   | W5   | Demo | 示例 | Demo01/03 宣称最短列但未启用 shortest        | masonry/01、03 的 App 传入 shortest，或 demo.json 改为描述 source 多列，不再宣称最短列 |
| C044-F03 | P2   | W5   | Demo | 示例 | Demo02 的宽度上限使 md/lg 与响应式间距不可达 | 宽屏下 masonry/02 能达到 4 列与 16/24px 间距，或映射只使用 672px 内可达的断点          |

### C045 Resizable

报告 `groups/layout/Resizable.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端               | 类别   | 条目                                                                | 验收                                                                                |
| -------- | ---- | ---- | ---------------- | ------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| C045-F01 | P2   | W5   | 文档·生成器+测试 | 文档   | 文档称角手柄不进 Tab，实际双端角手柄均可聚焦                        | resizable 文档与 MCP 不再写「角手柄不进 Tab」，或角手柄 tabIndex 改为 -1 并同步断言 |
| C045-F02 | P2   | W5   | 双端             | 无障碍 | 未配置最大尺寸时 separator 使用隐式上限 100，与实际值和交互范围冲突 | 默认尺寸未传最大值时，aria-valuenow=300 的手柄带显式 aria-valuemax 且不小于当前值   |
| C045-F03 | P2   | W5   | 双端             | 无障碍 | 仅由 CSS 提供尺寸时，手柄把未解析尺寸报告为 0                       | 仅 style 设 320×180 时，挂载后 right 手柄 aria-valuenow=320、bottom=180，不再为 0   |
| C045-F04 | P2   | W5   | 双端             | 无障碍 | 根节点 aria-labelledby 会清空所有手柄自身的可访问名称               | 根节点设 aria-labelledby 时，right/bottom/bottom-right 手柄仍各有非空 aria-label    |

### C047 ScrollArea

报告 `groups/layout/ScrollArea.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                             | 验收                                                                                 |
| -------- | ---- | ---- | ---- | ------ | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| C047-F01 | P2   | W5   | 双端 | 无障碍 | 自定义条的可见性错误地控制默认焦点和名称         | 溢出且 scrollbar=hidden 或 nativeBars 时两端 viewport 有 tabindex=0、region 与名称   |
| C047-F02 | P2   | W5   | 双端 | 无障碍 | 除名称外的 aria-\* 属性被两端吞掉                | 传 aria-describedby=explanation、aria-busy=true 时，两端 viewport 输出这两个属性     |
| C047-F03 | P2   | W5   | Vue  | 键盘   | Vue 忽略普通静态字符串 tabindex                  | Vue 模板写静态字符串 tabindex -1 且溢出时 viewport 输出 -1，与数字绑定和 React 一致  |
| C047-F04 | P2   | W5   | Core | i18n   | RTL 以瞬时 scrollLeft 的符号猜模型，零点产生跳变 | RTL 负值模型、scrollWidth=400、clientWidth=200 下 scrollLeft 从 -1 到 0 进度不跳到 1 |
| C047-F05 | P2   | W5   | Core | 样式   | 隐藏原生滚动条的类定义后从未接到 viewport        | 默认 auto、已测量且溢出时两端 viewport 带隐藏原生条的类，nativeBars 时不带           |
| C047-F06 | P2   | W5   | Demo | 示例   | 两端 Demo02 描述使用不存在的 direction 属性      | 两端 scroll-area/02/demo.json 的描述写 axis 为 both，不再出现 direction              |

### C048 Sidebar

报告 `groups/layout/Sidebar.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                     | 验收                                                                        |
| -------- | ---- | ---- | ----- | ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| C048-F01 | P2   | W5   | React | 无障碍 | React 调用方属性可覆盖零宽侧栏的隔离属性 | 零宽折叠且调用方传冲突属性时，根仍输出 inert、aria-hidden=true、tabindex=-1 |
| C048-F03 | P2   | W5   | Vue   | 键盘   | Vue 展开态丢弃调用方的 tabindex          | Vue Sidebar 传 tabindex 0 且展开时 SSR 输出 tabindex=0，与 React 一致       |

### C049 Skeleton

报告 `groups/layout/Skeleton.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                       | 验收                                                                                    |
| -------- | ---- | ---- | --------- | ---- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| C049-F01 | P2   | W5   | Core+双端 | 类型 | 公开 preset 没有接入渲染                   | 只传 preset=avatar 时两端输出 rounded-full w-10 h-10；或公开类型不再含 preset           |
| C049-F02 | P2   | W5   | 双端      | 行为 | 行数归一化未接线，边界值直接进入循环       | rows=8 渲染 6 条；rows=2.5 且 paragraph 渲染 2 条、末行 60%；rows=Infinity 不会无限循环 |
| C049-F03 | P2   | W5   | 双端      | 行为 | loading=false 丢弃调用方根属性、样式与事件 | loading 由 true 改 false 后根仍保留 id、class、padding、aria-describedby 和点击         |

### C050 Space

报告 `groups/layout/Space.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                                      | 验收                                                                                        |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C050-F01 | P2   | W5   | 双端 | 行为 | 分隔符按未归一化节点计数，Fragment 漏分隔、空节点多出分隔 | split 下 Vue v-for 三项出 2 个分隔符，v-if=false 只剩 B 时无前导分隔符；React Fragment 同理 |
| C050-F03 | P2   | W5   | Core | 文档 | verticalSize 注释把数值 size 的默认行为写成仅水平方向     | verticalSize 注释不再写 horizontal-only，并说明数值 size 输出 gap 简写                      |

### C051 Splitter

报告 `groups/layout/Splitter.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                        | 验收                                                                                        |
| -------- | ---- | ---- | --------- | ---- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C051-F01 | P2   | W5   | 双端+测试 | 行为 | 内部尺寸覆盖状态丢失受控释放与百分比连续性  | 容器 804、sizes=[200,600] 经 ArrowRight 后移除 sizes 仍为 210/590；百分比不回写时随容器缩放 |
| C051-F02 | P2   | W5   | Core+双端 | 行为 | 部分 sizes 声明的剩余面板折叠后无法恢复尺寸 | sizes=['30%']、collapsible=true 时第二 pane 折叠再展开后恢复为 560px，而不是 0px            |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件      | 报告                         | 并入的条目 |
| ---- | --------- | ---------------------------- | ---------- |
| C037 | Container | `groups/layout/Container.md` | S02        |
| C040 | Footer    | `groups/layout/Footer.md`    | S02        |
| C046 | Row       | `groups/layout/Row.md`       | S02        |
