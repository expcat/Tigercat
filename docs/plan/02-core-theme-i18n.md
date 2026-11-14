# 02 共享 Core、主题与 i18n

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

X01（共享 Core 与框架基础）和 X02（主题、样式与 i18n）两份专题的未完成条目都在本篇。这两份专题没有主责 Demo，证据是源码执行、happy-dom 和 Chromium 计算样式。

## 目标

- 表单引擎、浮层触发器、工作流权限、菜单 schema 这几处共享层的错在源头修掉，组件层不各自绕。
- 主题和 i18n 的剩余项补齐，生成物由生成器重出。

## 非目标

- 不为单个组件在框架层加分支。

## 依赖与顺序

- X01-F017 先于 06 里 ContextMenu、Dropdown 的 `items` 分支条目（C088-F03、C088-F06）。

## 概览

本篇 11 条：P1 0、P2 10、P3 1。
按波次：W2 10、W9 1。

## 波及多个组件的条目

这些条目的行在下面各组件的表里。修的时候把右列的组件一起验。

| 条目                                                         | 归属                 | 同验                              |
| ------------------------------------------------------------ | -------------------- | --------------------------------- |
| X01-F017 React popup typeahead 的数据索引与 DOM 索引错位     | 共享 Core 与框架基础 | ContextMenu、Dropdown             |
| X01-F022 React FeedbackHost 在未提交 render 后残留活动作用域 | 共享 Core 与框架基础 | ConfigProvider、主题、样式与 i18n |

## 条目

### X01 共享 Core 与框架基础

报告 `project/shared-core.md`，队列状态 complete。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                                | 验收                                                                                       |
| -------- | ---- | ---- | ----- | ---- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| X01-F009 | P2   | W2   | Core  | 行为 | customRequest 同步抛错后上传状态无法重试            | Upload 的 customRequest 同步抛错后状态为 error、onError 触发一次，retry 能再次发起请求     |
| X01-F010 | P2   | W2   | Core  | 行为 | 表格重复对象引用行丢失各自源索引                    | 同一无 id 对象出现在 dataSource 两处且开启本地处理时，Table 源索引为 [0,1]                 |
| X01-F011 | P2   | W2   | Vue   | 行为 | Vue Table 排序复位页码时漏发 page-change            | Vue Table 非受控第 2 页排序复位到第 1 页时发出一次 page-change，与 React 一致              |
| X01-F012 | P2   | W2   | Core  | 行为 | 工作流成功 action 的结果共享旧实例嵌套数据          | 新实例 amount 改 999 后旧实例仍为 100（WorkflowDetailShell/WorkflowTimeline 宿主）         |
| X01-F013 | P2   | W2   | React | 键盘 | React Select 关闭时把 Tab 已移出的焦点拉回          | 打开 React Select 后按 Tab，下拉关闭且等帧后焦点仍停在后续控件 After                       |
| X01-F014 | P2   | W2   | React | 键盘 | React TreeSelect 可用 Enter 选中禁用节点            | defaultOpen 且首节点 disabled:true 时按 Enter 不触发 onChange，显示值不变                  |
| X01-F017 | P2   | W2   | React | 键盘 | React popup typeahead 的数据索引与 DOM 索引错位     | React Dropdown items 为 Alpha、separator、Zulu 时，聚焦 Alpha 输入 z 后焦点移到 Zulu       |
| X01-F018 | P2   | W2   | React | 行为 | React Tree 的 loaded keys 回调丢失先前完成项        | React Tree 先后完成 A、B 加载，第二次 onLoadedKeysChange 含 a 与 b；受控同批完成回写不丢键 |
| X01-F022 | P2   | W2   | React | 行为 | React FeedbackHost 在未提交 render 后残留活动作用域 | Suspense 中 FeedbackHost 执行后子节点挂起再卸载，无残留活动 scope，通知不进无渲染者队列    |

### X02 主题、样式与 i18n

报告 `project/themes-styling-i18n.md`，队列状态 complete。另受 X01-F022 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                                        | 验收                                                                              |
| -------- | ---- | ---- | ---- | ---- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| X02-F005 | P3   | W9   | Core | 样式 | Figma 的 4 个 lineHeight CSS 变量名不存在                   | Figma 4 个行高变量名为 --tiger-primitive-font-lh-\*，167 个变量都在 tokens.css 中 |
| X02-F006 | P2   | W2   | Core | i18n | 公开 DatePicker 文案 helper 缺少兜底且 undefined 覆盖有效值 | getDatePickerLabels() 返回完整英语文案；zhCN 加 {today:undefined} 仍得「今天」    |
