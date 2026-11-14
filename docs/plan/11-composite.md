# 11 组合组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

composite 组 16 个组件（C170–C185），视觉与键盘全部 blocked。

## 目标

- 满 40 行自动开窗之后，键盘仍能到后续条目，列表语义还在。
- 工作流组件的权限、校验和文案与类型注释一致。

## 非目标

- 不做 BPMN、Flowable、Camunda。
- 租户、组织、部门、字典组件不进库。

## 依赖与顺序

- action 结果共享旧数据（X01-F012）在 [02](02-core-theme-i18n.md)，先做。
- 多份 composite 示例文档从第 26–28 行起混进了 DataTableWithToolbar 的 Custom Filters 一节，报告没有编号，见 [13](13-evidence.md) 的未立项观察。

## 概览

本篇 58 条：P1 0、P2 39、P3 19。
按波次：W1 0、W7 39、W9 19。

## 波及多个组件的条目

这些条目的行在下面各组件的表里。修的时候把右列的组件一起验。

| 条目                                            | 归属       | 同验                                  |
| ----------------------------------------------- | ---------- | ------------------------------------- |
| C179-F04 React 调用方 aria-label 被默认文案盖掉 | SchemaForm | WorkflowDesigner、WorkflowDetailShell |

## 条目

### C170 ActivityFeed

报告 `groups/composite/ActivityFeed.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端          | 类别 | 条目                                        | 验收                                                                                        |
| -------- | ---- | ---- | ----------- | ---- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C170-F02 | P2   | W7   | 双端        | 行为 | 开窗后自定义分组头消失，只渲染 group.title  | 自定义头 CUSTOM-HEADER 在渲染 2 条与 45 条时两端都显示                                      |
| C170-F03 | P2   | W7   | Core+双端   | 行为 | groupByDate 忽略时区，section 不含条目      | UTC 下 2024-05-02T20:00:00.000Z（主机上海）归到 2024-05-02，section 含 Evening              |
| C170-F04 | P2   | W7   | 双端+Core   | 行为 | loadError 重试两端不一致且文案写死          | zh-CN、hasMore 且 loadError 时两端有本地化重试控件，点一次 onLoadMore 调 1 次，失败说明可读 |
| C170-F05 | P3   | W9   | 文档·生成器 | 文档 | 生成说明不实，示例混入数据表 Custom Filters | 重跑后说明不提 #dot/renderDot、uses 含 VirtualList 与 Button，示例文件无数据表一节          |

### C171 AppShell

报告 `groups/composite/AppShell.md`，队列状态 needs-evidence。另受 S01、S07 影响。

| 编号     | 级别 | 波次 | 端               | 类别   | 条目                                            | 验收                                                                                     |
| -------- | ---- | ---- | ---------------- | ------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| C171-F01 | P2   | W7   | 双端             | 无障碍 | 传 tabs 时生成空 tabpanel，正文在面板之外       | tabs 为 Home、List、正文 PAGE-BODY 时，正文在选中的 tabpanel 内，或不再有空 tabpanel     |
| C171-F02 | P2   | W7   | 双端             | 行为   | 自定义面包屑/页签区两端命名不一致，且被数组挤掉 | 同时传 breadcrumb 数组与自定义节点时两端结果一致且与文档相符；空数组时两端认同一个名字   |
| C171-F03 | P3   | W9   | 文档·生成器+Demo | 文档   | 默认整页高度下 headerSticky 不生效且无说明      | 重跑后说明含 fullHeight=false 前提；Demo 的 Header 带 tiger-header-sticky 或不再写该属性 |

### C172 AssigneePicker

报告 `groups/composite/AssigneePicker.md`，队列状态 needs-evidence。另受 S04、S07 影响。

| 编号     | 级别 | 波次 | 端          | 类别 | 条目                                            | 验收                                                                                   |
| -------- | ---- | ---- | ----------- | ---- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| C172-F01 | P2   | W7   | 双端        | 键盘 | 搜索框不响应方向键，与列表同名且各占一个 Tab 位 | 焦点在搜索框按 ArrowDown，活动项从 Ada 变成 Bea；搜索框与 listbox 不再同名             |
| C172-F02 | P2   | W7   | 双端        | 行为 | 点击选项不更新活动项，Enter 作用在旧活动项      | ArrowDown 停在 Bea 后点击 Cy，活动项变成 Cy；再按 Enter 不会把 Bea 加进已选            |
| C172-F03 | P2   | W7   | Core+双端   | i18n | 搜索无命中时显示「目录为空」                    | 三人名单搜索 zzz 显示无匹配文案而非 The directory is empty；options 为空仍显示目录为空 |
| C172-F04 | P2   | W7   | 双端        | 行为 | 过滤后已选的人消失，没有已选摘要或数量          | 选中 Cy 和 Bea 后搜索 Design，Cy 仍可见，或有不随过滤消失的已选摘要/数量               |
| C172-F05 | P2   | W7   | 双端        | 键盘 | 长名单列表不可滚动，活动项移动后不滚入视野      | 30 人、焦点在 listbox 按 End，列表类含 overflow-auto 和最大高度，最后一人滚进容器      |
| C172-F06 | P2   | W7   | 文档·生成器 | 文档 | 生成 Props 与 MCP 没有回写事件，示例只有空标签  | 重跑后 Props 节与 MCP 回包能看出 Vue v-model:selected-ids、React onChange 回写         |
| C172-F07 | P3   | W9   | Core        | 类型 | 公开选项类型有两个名字，文档与组件各用一个      | 文档、Demo、组件引用同一个选项类型名，只剩一份 id/name/department 字段定义             |

### C173 ChatWindow

报告 `groups/composite/ChatWindow.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端        | 类别   | 条目                                         | 验收                                                                                 |
| -------- | ---- | ---- | --------- | ------ | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| C173-F01 | P2   | W7   | Core+双端 | 行为   | virtual 默认值不实：满 40 条自动开窗         | 不传 virtual 放 40 条时，scroller 是否仍是 role=log 与类型注释、生成表写的默认值一致 |
| C173-F02 | P2   | W7   | Vue       | 行为   | Vue 关掉自动滚动后挂载时仍滚到底             | 关自动滚动、scrollHeight 1000、clientHeight 400，挂载一帧后 Vue scrollTop 为 0       |
| C173-F03 | P2   | W7   | React     | 无障碍 | React 虚拟模式下同一条改正文不进礼貌区       | virtual 下 id 为 1 的正文从 hello 改成 hello world，React 礼貌区文本是 hello world   |
| C173-F04 | P3   | W9   | Demo      | 示例   | 02 Demo 说明写固定行高，实际是估计高度动态量 | 两端 chat-window/02/demo.json 不再写「固定行高」，与生成说明的「行高动态量」一致     |

### C174 CommentThread

报告 `groups/composite/CommentThread.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端             | 类别   | 条目                                        | 验收                                                                                     |
| -------- | ---- | ---- | -------------- | ------ | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| C174-F01 | P2   | W7   | 双端           | 无障碍 | 行内回复框可访问名称不跟随 replyPlaceholder | replyPlaceholder 设为「写下回复」，点 Reply 后两端行内框 aria-label 都是「写下回复」     |
| C174-F02 | P2   | W7   | Vue            | 行为   | Vue 的 onReply 同步抛错时草稿被清空         | Vue 根输入框写 top 发送、监听同步抛错后，输入框仍是 top，与 React 一致                   |
| C174-F03 | P2   | W7   | Demo           | 示例   | 02 Demo 的根评论发不出去，草稿却被清空      | 两端 02 根输入框写 top 发送后列表出现 top 且无 TypeError；或根输入框已关、demo.json 同步 |
| C174-F04 | P2   | W7   | Core+双端+Demo | 行为   | 只传 onMore 不显示更多按钮，与类型注释矛盾  | 只传 onMore 时 More actions 是否出现，与类型注释和 02 demo.json 的说法一致               |
| C174-F05 | P2   | W7   | Core           | 行为   | nodes 不检查重复 id 和环，无 alert          | nodes 放两个 id 为 a 的根时有 Duplicate comment id a 的 alert，且没有相同的 article id   |
| C174-F06 | P3   | W9   | 双端           | i18n   | 管理按钮写死英文，Vue 类型缺 editable/rich  | zh-CN 下开 editable，按钮不再是 edit/delete；Vue 导出类型含 editable 与 rich             |

### C175 DataTableWithToolbar

报告 `groups/composite/DataTableWithToolbar.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端          | 类别 | 条目                                         | 验收                                                                                     |
| -------- | ---- | ---- | ----------- | ---- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| C175-F01 | P2   | W7   | Core+双端   | i18n | 查询区重置按钮写死 Reset，不走 locale        | zhCN 的 ConfigProvider 下、query 有一个字段时，查询区按钮依次是搜索、重置、收起          |
| C175-F02 | P2   | W7   | React       | 行为 | React 受控查询字段重置后显示与实际筛选不一致 | name 受控为 Ann、数据 Ann 和 Bob，点 Reset 后 React 输入框、onReset、行集都是 Ann        |
| C175-F03 | P2   | W7   | Vue         | 行为 | Vue 后传入或替换的 query 拿不到 api          | 先不传 query、下一拍传入再替换，Vue 两个对象的 query.api.getQueryValues 都是 function    |
| C175-F04 | P3   | W9   | React       | 行为 | 空 query 对象：React 画查询区，Vue 不画      | query 传 {} 时两端都没有 data-tiger-table-query 和 Reset，或两端都有                     |
| C175-F05 | P2   | W7   | Demo        | 示例 | 02 Demo 多出一个不筛表的搜索框               | 两端 02 不再出现搜索框；或输入 Ann 后表格只剩 Ann 且 demo.json 写明远程搜索              |
| C175-F06 | P2   | W7   | 文档·生成器 | 文档 | React 生成示例误把 onChange 当 DOM 事件      | 照生成的 Custom Filters 示例把 Input 放进 filtersExtra 输入 5，不抛错，ageRange 写入该值 |

### C176 FormWizard

报告 `groups/composite/FormWizard.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端               | 类别   | 条目                                      | 验收                                                                                     |
| -------- | ---- | ---- | ---------------- | ------ | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| C176-F01 | P2   | W7   | 文档·生成器+Demo | 文档   | 文档和 vue 02 用了组件没有的 change 事件  | 走完 vue 02 出现「流程已完成」后点上一步，完成标记消失；说明不再写 onChange              |
| C176-F02 | P3   | W9   | 文档·生成器      | 文档   | size 取值文档写错（应为 sm\|md\|lg）      | 重跑后 FormWizard 说明写 size 为 sm\|md\|lg、默认 md，不再出现 small\|default            |
| C176-F03 | P2   | W7   | Core             | 行为   | disabled 步被当成已跳过并被 Next 跨过     | 第二步描述为 Later 且 disabled：仍显示 Later 而非 Skipped，Next 后不被标成已跳过         |
| C176-F04 | P2   | W7   | 双端             | 行为   | 父级改 current 不重拍快照，误弹离开框     | model 的 name 从 a 改成 b、父级把 current 从 0 改成 1 后 requestClose，两端不弹离开框    |
| C176-F05 | P2   | W7   | 双端             | 行为   | Finish 整表校验失败时静默停住，无任何提示 | 规则要 name 和 email、只填 name、确认步只有文字，点 Finish 后 alert 含 Email is required |
| C176-F06 | P3   | W9   | 双端             | 无障碍 | 根节点 role 与 aria-label 优先级两端相反  | 传 aria-label 和 role 时两端根节点结果相同；React 传 aria-label={undefined} 仍有向导名   |

### C177 NotificationBell

报告 `groups/composite/NotificationBell.md`，队列状态 needs-evidence。另受 S04、S07 影响。

| 编号     | 级别 | 波次 | 端               | 类别   | 条目                                           | 验收                                                                                     |
| -------- | ---- | ---- | ---------------- | ------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| C177-F01 | P2   | W7   | 双端             | 无障碍 | 未读数或 locale 变化后 live 文案不更新         | 1 条未读改成 3 条后 live 文案是 3 unread，全部已读后是 0 unread，zh-CN 时是「1 条未读」  |
| C177-F02 | P2   | W7   | 双端             | 键盘   | 打开时聚焦选择器会命中禁用按钮和别的铃铛面板   | 条目全部已读时点开铃铛，焦点落在本实例面板内可聚焦的控件，而不是禁用的 Mark all as read  |
| C177-F03 | P2   | W7   | Core+文档·生成器 | 类型   | Core 类型和生成 Props 缺已读回调与真实条目类型 | Core NotificationBellProps 含已读回调和 NotificationItem 条目；重跑后生成 Props 有事件行 |
| C177-F04 | P3   | W9   | 双端             | 行为   | Vue 有 update:open 却无 open prop              | Vue 传 open 并点开后父级设回 false，浮层关闭；或不再发 update:open 且根上无 open 属性    |

### C178 NotificationCenter

报告 `groups/composite/NotificationCenter.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端        | 类别   | 条目                                             | 验收                                                                                           |
| -------- | ---- | ---- | --------- | ------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| C178-F01 | P2   | W7   | 双端      | 行为   | groups 为空时角标与全部已读仍回落 items          | items 含 1 条未读且 groups=[] 时无角标、全部已读禁用；loading 时走居中 Loading、无遮罩与 inert |
| C178-F02 | P2   | W7   | 双端      | 无障碍 | 单条已读变化的礼貌播报两端不一致，标回未读不更新 | 不传 manageReadState 点 Mark as read 时两端都播报；标回未读后礼貌区域不再是 Marked 1 as read   |
| C178-F03 | P3   | W9   | 双端+Core | 行为   | 全部已读回调的 groupKey 恒为 undefined           | 两个分组各 1 条未读点 Mark all as read，首参为当前分组键且条目只含该组，或签名不再含 groupKey  |

### C179 SchemaForm

报告 `groups/composite/SchemaForm.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端          | 类别   | 条目                                          | 验收                                                                        |
| -------- | ---- | ---- | ----------- | ------ | --------------------------------------------- | --------------------------------------------------------------------------- |
| C179-F01 | P2   | W7   | 双端+Core   | 行为   | widgetParams 允许键未传给控件，未知键警告被吞 | input 写 maxLength:4、prefix:'YEN' 后有 maxlength 并显示 YEN；rows 触发警告 |
| C179-F02 | P2   | W7   | 文档·生成器 | 文档   | 生成示例与优先列表使用不存在的 model 绑定     | 生成示例用 modelValue / value，不再出现 :model 或 model={model}             |
| C179-F03 | P3   | W9   | 双端        | 行为   | Reset 时模型更新通知多发一次                  | 改成 Grace 后点 Reset，update:modelValue 与 onChange 各只收一次 Ada         |
| C179-F04 | P3   | W9   | React       | 无障碍 | React 调用方 aria-label 被默认文案盖掉        | React 只传 aria-label=From attr 时根上保留 From attr；ariaLabel prop 仍优先 |

### C180 TaskBoard

报告 `groups/composite/TaskBoard.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                       | 验收                                                                                 |
| -------- | ---- | ---- | --------- | ---- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| C180-F01 | P2   | W7   | 双端      | 行为 | 有 onSwimlaneCollapse 时点击泳道不再折叠   | 传 onSwimlaneCollapse 且父级不回写时，点泳道 bug 后 aria-expanded 变 false，事件照发 |
| C180-F02 | P3   | W9   | 双端+Core | 行为 | 数字与字符串同值的泳道 id 折叠互串         | 泳道 id 为 1 与 '1' 时点 Num 只收起 Alpha，Beta 仍在，React 无重复 key 警告          |
| C180-F03 | P3   | W9   | 双端      | 键盘 | 键盘抓取列无可见状态，同 id 卡片误带抓取环 | 列头按 Enter 后列有 opacity-50；列与卡片 id 同为 same 时卡片不出现 ring-2            |

### C181 WorkflowDesigner

报告 `groups/composite/WorkflowDesigner.md`，队列状态 needs-evidence。另受 S01、C179-F04 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                    | 验收                                                                                 |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| C181-F01 | P3   | W9   | 双端 | 行为 | 点击摘要按钮触发两次 select             | 点标题为 Submit 的开始节点摘要按钮，select 只收到一次 start                          |
| C181-F02 | P3   | W9   | 双端 | i18n | 分支运算符 aria-label 写死英语 Operator | 传 labels.branchOperatorLabel 为「比较符」时运算符 select 的 aria-label 含「比较符」 |
| C181-F03 | P3   | W9   | 双端 | 行为 | level / upTo 改成 0 被存成 1            | 部门领导 level 或上级链 upTo 由 2 改成 0 后发出 0；或类型写明下限 1 且显示与提交一致 |
| C181-F04 | P3   | W9   | Core | 行为 | 审批人 id 为 0 时误报 empty_approvers   | 审批人只有 { id: 0 } 时校验不返回 empty_approvers；id 为 '0' 与带名字的 0 仍通过     |

### C182 WorkflowDetailShell

报告 `groups/composite/WorkflowDetailShell.md`，队列状态 needs-evidence。另受 S01、S03、C179-F04 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                         | 验收                                                                                    |
| -------- | ---- | ---- | ---- | ---- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| C182-F01 | P2   | W7   | 双端 | 行为 | 空槽、注释或空白节点仍被当成有内容并渲染区域 | Vue 槽只返回 Comment、React 槽为空串时不渲染 form/tabs/action，header 显示默认 Approval |

### C183 WorkflowTimeline

报告 `groups/composite/WorkflowTimeline.md`，队列状态 needs-evidence。另受 S01、S03 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                       | 验收                                                                                   |
| -------- | ---- | ---- | --------- | ---- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| C183-F01 | P2   | W7   | Core+双端 | 行为 | 停放的后加签只显示位置词，不写加签人与意见 | 会签节点带 pendingAfterAddsign（专家、稍后补签）时时间线出现这两段文字，不只显示后加签 |

### C184 WorkflowActionBar

报告 `groups/composite/WorkflowActionBar.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                      | 验收                                                                              |
| -------- | ---- | ---- | ---- | ---- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| C184-F01 | P2   | W7   | 双端 | 行为 | 加签 multiple 为 true 但提交只剩最后一人  | 加签先点 Lin 再点 Expert 后确认，assignees 含两人；或选人上下文 multiple 为 false |
| C184-F02 | P3   | W9   | Core | 行为 | permission 数组任一命中即可见，与注释不符 | permission ['approver','finance'] 对 approver 的可见性与类型注释一致              |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件           | 报告                                 | 并入的条目    |
| ---- | -------------- | ------------------------------------ | ------------- |
| C185 | WorkflowViewer | `groups/composite/WorkflowViewer.md` | S01、C183-F01 |
