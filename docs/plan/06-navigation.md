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

- NavigationMenu：先 C102-F03，再做 Item、Link、List、Trigger 的条目。
- Affix 的 16 格没有任何浏览器证据，见 [13](13-evidence.md) 的 E03。

## 概览

本篇 45 条：P2 29、P3 16。
按波次：W4 29、W9 16。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C086-F03（S13）、C088-F05（S13）、C095-F02（S13）、C109-F06（S13）、C112-F01（S13）、C113-F01（S13）、C114-F04（S13）、C116-F05（S13）。

## 波及多个组件的条目

这些条目的行在下面各组件的表里。修的时候把右列的组件一起验。

| 条目                                                    | 归属           | 同验                                   |
| ------------------------------------------------------- | -------------- | -------------------------------------- |
| C102-F03 React 现有 axe 用例命中 menubar 必需子角色违规 | NavigationMenu | NavigationMenuLink、NavigationMenuList |

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

### C099 MenuItem

报告 `groups/navigation/MenuItem.md`，队列状态 needs-evidence。另受 S01、S02、C098-F04 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                      | 验收                                                                                            |
| -------- | ---- | ---- | ----- | ---- | ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C099-F01 | P2   | W4   | 双端  | 行为 | 调用方原生事件覆盖内部选择与键盘处理      | MenuItem 传调用方 click/keydown 后回调各触发 1 次，同时该项被选中、ArrowDown 仍移动焦点到下一项 |
| C099-F02 | P2   | W4   | React | 样式 | React 自定义 style 使 inline 子项丢失缩进 | React inline 子项传 margin:13px 后仍有 padding-inline-start:24px                                |
| C099-F03 | P2   | W4   | 双端  | 键盘 | typeahead 可聚焦已关闭子菜单的隐藏项      | inline 子菜单开后再关，在根项 Alpha 键入 b，焦点不进入隐藏子项 Beta                             |
| C099-F04 | P2   | W4   | 双端  | 键盘 | typeahead 移焦后 roving tab stop 留在原项 | 平面菜单 Alpha/Beta 在 Alpha 键入 b 后焦点在 Beta 且 tabIndexes 为 [「-1」,「0」]               |

### C100 MenuItemGroup

报告 `groups/navigation/MenuItemGroup.md`，队列状态 needs-evidence。另受 S01、S02、S07 影响。

| 编号     | 级别 | 波次 | 端  | 类别 | 条目                                         | 验收                                                                    |
| -------- | ---- | ---- | --- | ---- | -------------------------------------------- | ----------------------------------------------------------------------- |
| C100-F01 | P2   | W4   | Vue | 样式 | Vue 嵌套 inline 分组丢失第二层标题和叶项缩进 | Vue 嵌套 inline 分组的 Inner 标题与 Leaf 均为 padding-inline-start:24px |

### C101 SubMenu

报告 `groups/navigation/SubMenu.md`，队列状态 needs-evidence。另受 S01、S02、S07、C099-F01、C099-F02、C099-F03 影响。

| 编号     | 级别 | 波次 | 端  | 类别   | 条目                                        | 验收                                                                            |
| -------- | ---- | ---- | --- | ------ | ------------------------------------------- | ------------------------------------------------------------------------------- |
| C101-F01 | P2   | W4   | Vue | 无障碍 | Vue 自定义 id 使子列表命名引用失效          | Vue SubMenu 传 id=consumer-submenu-id 时，子列表 aria-labelledby 的目标元素存在 |
| C101-F02 | P2   | W4   | Vue | i18n   | Vue RTL 嵌套弹层仍请求 LTR 的右侧 placement | dir=rtl 下 Vue 水平菜单的嵌套 SubMenu 请求 left-start，与 React 一致            |

### C102 NavigationMenu

报告 `groups/navigation/NavigationMenu.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                           | 验收                                                                       |
| -------- | ---- | ---- | ----- | ------ | ---------------------------------------------- | -------------------------------------------------------------------------- |
| C102-F03 | P2   | W4   | React | 无障碍 | React 现有 axe 用例命中 menubar 必需子角色违规 | TIGER_A11Y=1 下 React NavigationMenu spec 的 axe 用例通过（现 29 过 1 败） |

### C104 NavigationMenuItem

报告 `groups/navigation/NavigationMenuItem.md`，队列状态 needs-evidence。另受 S01、S02、S07 影响。

| 编号     | 级别 | 波次 | 端          | 类别 | 条目                                                        | 验收                                                                         |
| -------- | ---- | ---- | ----------- | ---- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| C104-F01 | P2   | W4   | 双端        | 行为 | 根 disabled 不抑制已有 defaultValue 或受控 value 的面板打开 | 根 disabled 且 defaultValue 或受控 value 命中某 Item 时，双端 Content 不展开 |
| C104-F02 | P2   | W4   | 文档·生成器 | 文档 | Item 生成示例缺少 Content 或顶层 Link，不构成有效组合       | 重跑 pnpm docs:api 后 Item 的 Examples 与 MCP 片段含 Content 或顶层 Link     |

### C105 NavigationMenuLink

报告 `groups/navigation/NavigationMenuLink.md`，队列状态 needs-evidence。另受 S01、S02、C102-F03 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                  | 验收                                                                                    |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| C105-F01 | P2   | W4   | 双端 | 行为 | 根 disabled 不禁用已打开面板内的 Link | 根 disabled 且面板已打开时，面板内 Link 无 href、带 aria-disabled，点击不执行调用方回调 |

### C106 NavigationMenuList

报告 `groups/navigation/NavigationMenuList.md`，队列状态 needs-evidence。另受 S02、C102-F03、C104-F02 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                                 | 验收                                                                               |
| -------- | ---- | ---- | ----- | ---- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| C106-F01 | P2   | W4   | React | 样式 | React current 指示器缺少定位、高度与颜色，实际不可见 | React current 命中顶栏项时指示器有绝对定位、h-0.5 高度与主色背景，同 Vue           |
| C106-F02 | P2   | W4   | 双端  | 行为 | 双端 current 指示器在 resize / 布局变化后保留旧几何  | current 非空时改变视口或容器尺寸且无框架 render，指示器起点与宽度仍匹配 current 项 |

### C107 NavigationMenuTrigger

报告 `groups/navigation/NavigationMenuTrigger.md`，队列状态 needs-evidence。另受 S01、S02、S04 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                 | 验收                                                                                |
| -------- | ---- | ---- | ----- | ---- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| C107-F01 | P2   | W4   | React | 键盘 | React Trigger 不做 menubar typeahead | React 顶栏 Trigger 聚焦时键入字母前缀，焦点跳到匹配顶栏项并写 tab stop，与 Vue 一致 |

### C108 PageHeader

报告 `groups/navigation/PageHeader.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                   | 验收                                                                      |
| -------- | ---- | ---- | ---- | ------ | -------------------------------------- | ------------------------------------------------------------------------- |
| C108-F01 | P3   | W9   | 双端 | 无障碍 | 没有标题时清掉调用方的 aria-labelledby | 不传 title 且传 aria-labelledby=caller-label 时，双端 header 保留该属性值 |

### C109 Pagination

报告 `groups/navigation/Pagination.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                            | 验收                                                                                                |
| -------- | ---- | ---- | --------- | ---- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| C109-F01 | P2   | W4   | Vue       | 行为 | Vue 受控越界页只改显示，不通知父级              | current=999、total=50、pageSize=10 时 Vue 发出一次 update:current(5) 与 change(5,10)，与 React 一致 |
| C109-F02 | P2   | W4   | React     | 行为 | React 的 quickJumperValidation 被忽略           | React delay=50、total=100、pageSize=10，输入 99 前进 500ms 后变为 10；不传时仍为 99                 |
| C109-F03 | P2   | W4   | 双端      | 行为 | disabled 没有禁用两端省略号跳页控件             | 同时开 ellipsisJump 与 disabled 时，双端省略号按钮和跳页输入的 disabled 均为 true                   |
| C109-F04 | P2   | W4   | React     | i18n | React 组件级 RTL locale 不写 dir                | React 直接传 locale=arSA 且外层无 ConfigProvider 时，nav 的 dir 为 rtl                              |
| C109-F05 | P3   | W9   | React     | 行为 | React 非受控点击当前页仍触发 onChange           | React 不传 current 时点击当前第 1 页，onChange 调用 0 次，与 Vue 一致                               |
| C109-F07 | P3   | W9   | Core+Demo | 文档 | size 的注释和 Demo 说明写成 medium，运行值是 md | Core size 注释为 @default md，两端 pagination/03 demo.json 写 sm/md/lg                              |

### C110 ScrollSpy

报告 `groups/navigation/ScrollSpy.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                                 | 验收                                                                                    |
| -------- | ---- | ---- | ----- | ---- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| C110-F01 | P2   | W4   | React | 行为 | React 受控禁用键或不存在键被改成第一项，且不通知父级 | React activeKey=off（禁用项）且无 defaultActiveKey 时当前项为 Off，或夹取并通知父级一次 |
| C110-F02 | P3   | W9   | 双端  | 行为 | 嵌套当前项的 section 属性两端不一致                  | 嵌套 activeKey=child 时 React 的 data-tiger-section-active 为子项 href 而非空串         |
| C110-F03 | P3   | W9   | Demo  | 示例 | React Demo 02 的说明把回调写成 onChange              | React scroll-spy/02 demo.json 的说明改为 onActiveKeyChange，不含 onChange               |

### C111 Spotlight

报告 `groups/navigation/Spotlight.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                           | 验收                                                                                         |
| -------- | ---- | ---- | ----- | ---- | ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| C111-F01 | P2   | W4   | Vue   | 行为 | Vue 只在挂载时认领 hotkey，之后再打开开关无效  | Vue 以 hotkey=false 挂载后改为 true，Meta/Ctrl+K 能打开面板；再改回 false 后不再响应         |
| C111-F02 | P2   | W4   | Core  | 键盘 | 面板打开后，切换热键落在搜索框上就不能关闭     | hotkey=true 打开后焦点在搜索框，再按 Meta+K 时 dialog 关闭；其他可编辑目标上切换热键仍不触发 |
| C111-F03 | P2   | W4   | Demo  | 示例 | 示例把默认热键写成 Ctrl/⌘ K，02 也没有打开入口 | 01 的 Ctrl/⌘ K 能打开面板或文案不再称默认热键；02 页面能出现 dialog 并演示 ⌘ , 选中偏好设置  |
| C111-F04 | P2   | W4   | 双端  | 行为 | 已注册的图标名被当成文本，不画 svg             | 项 icon 为 search 时两端 option 内出现 svg 且不含文本 search；未注册字符串仍显示为文本       |
| C111-F05 | P3   | W9   | Core  | 行为 | recentIds 在有查询时不再排在其他结果前面       | recentIds 为 recent 且查询 docs 时顺序为 recent、exact；或 recentIds 注释明确只在空查询生效  |
| C111-F06 | P3   | W9   | React | SSR  | React SSR 首帧没有选中第一项                   | React 服务端渲染打开态时首项 aria-selected=true，输入框带 aria-activedescendant              |

### C114 Tabs

报告 `groups/navigation/Tabs.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端         | 类别 | 条目                                                   | 验收                                                                                               |
| -------- | ---- | ---- | ---------- | ---- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| C114-F01 | P2   | W4   | React+测试 | 行为 | React 的 lazy 默认值与 Core、Vue 相反                  | React 不传 lazy 时未访问的面板也挂载（与 Vue 一致）；显式 lazy 时才只有一个 tabpanel               |
| C114-F02 | P2   | W4   | 双端       | 行为 | Vue 的 tab id 把数字 1 和字符串「1」合成同一个         | tabKey 同时有数字 1 和字符串「1」时，两端 DOM id、React key 与溢出文案不相撞，关闭后焦点落到正确项 |
| C114-F03 | P3   | W9   | Core       | 行为 | 嵌套滚动只检查横向 overflow                            | 纵向标签的面板内有 overflow-y 滚动容器时，在其上滑动不切换标签                                     |
| C114-F05 | P3   | W9   | React      | i18n | Vue 把合并 locale 的方向写到 tablist，React 不写       | 只给 Tabs 传 rtl locale 时，React tablist 也带 dir=rtl，与 Vue 一致                                |
| C114-F06 | P3   | W9   | Demo       | 示例 | Demo 02 改写组件选出的下一项，Demo 04 把 sm 写成 small | Demo 02 关掉中间的当前项后选中后一项而非第一项；Demo 04 面板文字显示 size=sm                       |

### C115 TabPane

报告 `groups/navigation/TabPane.md`，队列状态 needs-evidence。另受 S01、S02、S04、S07、S08、C114-F01、C114-F02、C114-F05 影响。

| 编号     | 级别 | 波次 | 端  | 类别 | 条目                               | 验收                                                                                           |
| -------- | ---- | ---- | --- | ---- | ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| C115-F01 | P2   | W4   | Vue | 行为 | Vue 的 label slot 没有传给标签实例 | Tabs 内 TabPane label=概览 并写 #label「自定义」时，可见标题与读屏名称为「自定义」而非「概览」 |

### C116 Tree

报告 `groups/navigation/Tree.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                | 验收                                                                                      |
| -------- | ---- | ---- | ----- | ------ | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| C116-F01 | P2   | W4   | React | 键盘   | React 一次按键把 typeahead 推进两次 | React 树上按一次字母先停在首个匹配项而不跳到下一个；连续输入多字母前缀能命中对应节点      |
| C116-F02 | P2   | W4   | React | 无障碍 | React 丢掉原生 aria-label           | React tree/02 传 aria-label=懒加载树 时树的可访问名称为「懒加载树」而非「树」             |
| C116-F03 | P2   | W4   | 双端  | 行为   | selectable 和 multiple 不参与选择   | 只写 selectable={false} 时点击不选中、只写 multiple 时为多选；或两端类型已移除这两个 prop |
| C116-F04 | P3   | W9   | Core  | 文档   | 类型注释把 1 和「1」说成同一节点    | tree.ts 注释与重新生成的文档都写明数字 1 与字符串「1」是不同节点                          |
| C116-F06 | P3   | W9   | 双端  | 无障碍 | 内置搜索框没有可访问名称            | searchable 的树在两端渲染出的搜索 input 带 aria-label，zh-CN 下为中文文案                 |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件                  | 报告                                         | 并入的条目         |
| ---- | --------------------- | -------------------------------------------- | ------------------ |
| C090 | ContextMenuMenu       | `groups/navigation/ContextMenuMenu.md`       | S02                |
| C091 | ContextMenuSub        | `groups/navigation/ContextMenuSub.md`        | S02、S07           |
| C094 | DropdownMenu          | `groups/navigation/DropdownMenu.md`          | S02                |
| C103 | NavigationMenuContent | `groups/navigation/NavigationMenuContent.md` | S02、S07、C102-F01 |
| C112 | Steps                 | `groups/navigation/Steps.md`                 | S01、S04、S08      |
| C113 | StepsItem             | `groups/navigation/StepsItem.md`             | S01、S02、S04、S08 |
