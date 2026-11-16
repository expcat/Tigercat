# 06 导航组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

navigation 组 35 个组件（C082–C116）。审查时这一组同样没有浏览器证据。

## 目标

- 菜单类组件有唯一的 Tab 入口，方向键只在当前层移动，子菜单能用键盘开合。
- 现有的 axe 用例通过，不关规则。

## 非目标

- 不做第二套 Menu。
- 不为了对齐两端而改 ARIA 角色以外的公开 API。

## 依赖与顺序

- Affix 的 16 格没有任何浏览器证据，见 [13](13-evidence.md) 的 E03。

## 概览

本篇 16 条：P2 0、P3 16。
按波次：W4 0、W9 16。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C086-F03（S13）、C088-F05（S13）、C095-F02（S13）、C109-F06（S13）、C111-F01、C111-F02、C111-F03、C111-F04、C112-F01（S13）、C113-F01（S13）、C114-F04（S13）、C116-F05（S13）、C114-F01、C114-F02、C115-F01、C116-F01、C116-F02、C116-F03。

## 条目

### C085 BackTop

报告 `groups/navigation/BackTop.md`，队列状态 needs-evidence。另受 S01、S02、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                      | 验收                                                                      |
| -------- | ---- | ---- | ---- | ---- | ----------------------------------------- | ------------------------------------------------------------------------- |
| C085-F01 | P3   | W9   | Core | 行为 | `update()` 使待执行帧脱离 `cancel()` 管理 | 阈值 400、scrollTop=450 时 schedule→update→cancel 后 pendingAfterCancel=0 |

### C089 ContextMenuItem

报告 `groups/navigation/ContextMenuItem.md`，队列状态 needs-evidence。另受 S02 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                     | 验收                                                                             |
| -------- | ---- | ---- | ----- | ---- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| C089-F02 | P3   | W9   | React | 行为 | React 将公开 itemKey 下传为未知 DOM 属性 | React 渲染 itemKey=stable-id 的 Item，输出不含 itemKey 属性且无未知 DOM 属性告警 |

### C093 DropdownItem

报告 `groups/navigation/DropdownItem.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                                | 验收                                                                              |
| -------- | ---- | ---- | ----- | ---- | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| C093-F01 | P3   | W9   | React | 行为 | React itemKey 未消费，泄漏为小写 DOM 属性并触发警告 | React DropdownItem 传 itemKey=「identity-7」后 DOM 无 itemkey 属性且无 React 警告 |

### C098 Menu

报告 `groups/navigation/Menu.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                    | 验收                                                                                |
| -------- | ---- | ---- | --------- | ---- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| C098-F04 | P3   | W9   | Core+测试 | 文档 | 数字 key 的注释与测试名反向描述实际契约 | menu-utils.ts 注释与 menu-controller.spec.ts 测试名均写明 1 与「1」不相等，断言不变 |

### C108 PageHeader

报告 `groups/navigation/PageHeader.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                   | 验收                                                                      |
| -------- | ---- | ---- | ---- | ------ | -------------------------------------- | ------------------------------------------------------------------------- |
| C108-F01 | P3   | W9   | 双端 | 无障碍 | 没有标题时清掉调用方的 aria-labelledby | 不传 title 且传 aria-labelledby=caller-label 时，双端 header 保留该属性值 |

### C109 Pagination

报告 `groups/navigation/Pagination.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                            | 验收                                                                   |
| -------- | ---- | ---- | --------- | ---- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| C109-F05 | P3   | W9   | React     | 行为 | React 非受控点击当前页仍触发 onChange           | React 不传 current 时点击当前第 1 页，onChange 调用 0 次，与 Vue 一致  |
| C109-F07 | P3   | W9   | Core+Demo | 文档 | size 的注释和 Demo 说明写成 medium，运行值是 md | Core size 注释为 @default md，两端 pagination/03 demo.json 写 sm/md/lg |

### C110 ScrollSpy

报告 `groups/navigation/ScrollSpy.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                    | 验收                                                                            |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------- | ------------------------------------------------------------------------------- |
| C110-F02 | P3   | W9   | 双端 | 行为 | 嵌套当前项的 section 属性两端不一致     | 嵌套 activeKey=child 时 React 的 data-tiger-section-active 为子项 href 而非空串 |
| C110-F03 | P3   | W9   | Demo | 示例 | React Demo 02 的说明把回调写成 onChange | React scroll-spy/02 demo.json 的说明改为 onActiveKeyChange，不含 onChange       |

### C111 Spotlight

报告 `groups/navigation/Spotlight.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                     | 验收                                                                                        |
| -------- | ---- | ---- | ----- | ---- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| C111-F05 | P3   | W9   | Core  | 行为 | recentIds 在有查询时不再排在其他结果前面 | recentIds 为 recent 且查询 docs 时顺序为 recent、exact；或 recentIds 注释明确只在空查询生效 |
| C111-F06 | P3   | W9   | React | SSR  | React SSR 首帧没有选中第一项             | React 服务端渲染打开态时首项 aria-selected=true，输入框带 aria-activedescendant             |

### C114 Tabs

报告 `groups/navigation/Tabs.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                                   | 验收                                                                         |
| -------- | ---- | ---- | ----- | ---- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| C114-F03 | P3   | W9   | Core  | 行为 | 嵌套滚动只检查横向 overflow                            | 纵向标签的面板内有 overflow-y 滚动容器时，在其上滑动不切换标签               |
| C114-F05 | P3   | W9   | React | i18n | Vue 把合并 locale 的方向写到 tablist，React 不写       | 只给 Tabs 传 rtl locale 时，React tablist 也带 dir=rtl，与 Vue 一致          |
| C114-F06 | P3   | W9   | Demo  | 示例 | Demo 02 改写组件选出的下一项，Demo 04 把 sm 写成 small | Demo 02 关掉中间的当前项后选中后一项而非第一项；Demo 04 面板文字显示 size=sm |

### C116 Tree

报告 `groups/navigation/Tree.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                             | 验收                                                                      |
| -------- | ---- | ---- | ---- | ------ | -------------------------------- | ------------------------------------------------------------------------- |
| C116-F04 | P3   | W9   | Core | 文档   | 类型注释把 1 和「1」说成同一节点 | tree.ts 注释与重新生成的文档都写明数字 1 与字符串「1」是不同节点          |
| C116-F06 | P3   | W9   | 双端 | 无障碍 | 内置搜索框没有可访问名称         | searchable 的树在两端渲染出的搜索 input 带 aria-label，zh-CN 下为中文文案 |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件                  | 报告                                         | 并入的条目         |
| ---- | --------------------- | -------------------------------------------- | ------------------ |
| C090 | ContextMenuMenu       | `groups/navigation/ContextMenuMenu.md`       | S02                |
| C091 | ContextMenuSub        | `groups/navigation/ContextMenuSub.md`        | S02、S07           |
| C094 | DropdownMenu          | `groups/navigation/DropdownMenu.md`          | S02                |
| C103 | NavigationMenuContent | `groups/navigation/NavigationMenuContent.md` | S02、S07           |
| C112 | Steps                 | `groups/navigation/Steps.md`                 | S01、S04、S08      |
| C113 | StepsItem             | `groups/navigation/StepsItem.md`             | S01、S02、S04、S08 |
