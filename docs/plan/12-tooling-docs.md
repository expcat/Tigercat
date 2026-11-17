# 12 工具链、文档与示例平台

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

X03 到 X07 五份专题：CLI 与 MCP、API 文档与生成器、Example 平台与 SSR、构建测试与发布配置、项目级文档。X04-F02（S01）已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)。X07-F04（路线图文件头过期）在重写路线图时已经处理，不再排期。

## 目标

- 发布流程在发出去之前校验版本，`latest` 不会被写回旧版本。
- 示例沙箱碰不到父页面。
- 文档里的版本、命令和迁移说明与 3.0.0 一致。

## 非目标

- 不把测试或 `quality:release` 接进 CI。发布 Action 不跑测试是 `tests/README.md` 的既定约定，X06 的报告也不建议改。

## 依赖与顺序

- 本篇 P2 与 P3 已完成，记录在 CHANGELOG。

## 概览

本篇 0 条：P1 0、P2 0、P3 0。
按波次：W1 0、W8 0、W9 0、W10 0。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：T02（W10）、X03-F01、X03-F02、X04-F01、X04-F02（S01）、X06-F01、X06-F02、X06-F03、X06-F04、X06-F05、X07-F01、X07-F02、X07-F03。

## 条目

### X03 CLI 与 MCP

报告 `project/cli-mcp.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### X04 API 文档与生成器

报告 `project/api-docs-generators.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### X05 Example 平台与 SSR

报告 `project/example-platform-ssr.md`，队列状态 needs-evidence。C025-F05 已在共享 ScrollSpy 的页尾判定修复。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### X06 构建、测试与发布配置

报告 `project/build-test-release.md`，队列状态 needs-evidence。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### X07 项目级文档

报告 `project/project-documentation.md`，队列状态 needs-evidence。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |
