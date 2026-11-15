# 02 共享 Core、主题与 i18n

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

X02（主题、样式与 i18n）专题的未完成条目在本篇。该专题没有主责 Demo，证据是源码执行、happy-dom 和 Chromium 计算样式。

## 目标

- 表单引擎、浮层触发器、工作流权限、菜单 schema 这几处共享层的错在源头修掉，组件层不各自绕。
- 主题和 i18n 的剩余项补齐，生成物由生成器重出。

## 非目标

- 不为单个组件在框架层加分支。

## 概览

本篇 2 条：P1 0、P2 1、P3 1。
按波次：W2 1、W9 1。

## 条目

### X02 主题、样式与 i18n

报告 `project/themes-styling-i18n.md`，队列状态 complete。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                                        | 验收                                                                              |
| -------- | ---- | ---- | ---- | ---- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| X02-F005 | P3   | W9   | Core | 样式 | Figma 的 4 个 lineHeight CSS 变量名不存在                   | Figma 4 个行高变量名为 --tiger-primitive-font-lh-\*，167 个变量都在 tokens.css 中 |
| X02-F006 | P2   | W2   | Core | i18n | 公开 DatePicker 文案 helper 缺少兜底且 undefined 覆盖有效值 | getDatePickerLabels() 返回完整英语文案；zhCN 加 {today:undefined} 仍得「今天」    |
