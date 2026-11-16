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

- X06-F01、X06-F02 在下一次发版之前做完。
- S01、S02、S03 改的是同一个生成器，X04-F01 与它们同批，生成器只重跑一次。

## 概览

本篇 11 条：P1 0、P2 7、P3 4。
按波次：W1 0、W8 7、W9 4。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：X04-F02（S01）。

## 条目

### X03 CLI 与 MCP

报告 `project/cli-mcp.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号    | 级别 | 波次 | 端  | 类别   | 条目                                    | 验收                                                                                 |
| ------- | ---- | ---- | --- | ------ | --------------------------------------- | ------------------------------------------------------------------------------------ |
| X03-F01 | P3   | W9   | CLI | 工具链 | dry-run 在示例不存在时仍预告会创建      | ConfigProvider 的 add --dry-run 打印 Skipped；Button 仍预告 Would create             |
| X03-F02 | P3   | W9   | MCP | 文档   | `tigercat_example` 描述与实际文本不一致 | tigercat_example 描述改为返回文档小节，不再称与 tigercat add 同一文本（Button 对照） |

### X04 API 文档与生成器

报告 `project/api-docs-generators.md`，队列状态 needs-evidence。另受 S01、S02、X03-F02 影响。

| 编号    | 级别 | 波次 | 端          | 类别 | 条目                                   | 验收                                                                               |
| ------- | ---- | ---- | ----------- | ---- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| X04-F01 | P2   | W8   | 文档·生成器 | 文档 | 索引入口仍指向分类页里不存在的组件标题 | 索引所指文件都含 ## {Component}；Message/LoadingBar/NotificationContainer 指向拆页 |

### X05 Example 平台与 SSR

报告 `project/example-platform-ssr.md`，队列状态 needs-evidence。另受 C013-V01、C017-V01、C025-F05 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### X06 构建、测试与发布配置

报告 `project/build-test-release.md`，队列状态 needs-evidence。

| 编号    | 级别 | 波次 | 端     | 类别   | 条目                                 | 验收                                                                                      |
| ------- | ---- | ---- | ------ | ------ | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| X06-F01 | P2   | W8   | 工具链 | 工具链 | 预发布修复把 latest 设回写死的 2.9.4 | 预发布 tag 修复后五个包的 latest 指向 3.0.0 而非 2.9.4，workflow 无硬编码 STABLE=2.9.4    |
| X06-F02 | P2   | W8   | 工具链 | 工具链 | tag 工作流先发布、之后才核对标签版本 | 标签为 v3.0.1 而五包仍是 3.0.0 时，workflow 在 changeset publish 之前失败退出，不发生发布 |
| X06-F03 | P2   | W8   | 测试   | 工具链 | Vitest 别名缺三条已发布子路径        | Vitest 能加载 React useFullscreen 与两端 notification（NotificationRoot）子路径源码       |
| X06-F04 | P3   | W9   | 工具链 | 工具链 | check-env 漏检 CLI/MCP 入口产物      | CLI 或 MCP 的 dist/index.js 缺失时 pnpm dev:check 报缺产物；产物存在时仍通过              |
| X06-F05 | P3   | W9   | 工具链 | 工具链 | --published 分支遗留外层临时目录     | publish:check --published 返回后，临时目录不残留 tigercat-publish-check- 目录             |

### X07 项目级文档

报告 `project/project-documentation.md`，队列状态 needs-evidence。

| 编号    | 级别 | 波次 | 端          | 类别 | 条目                                       | 验收                                                                               |
| ------- | ---- | ---- | ----------- | ---- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| X07-F01 | P2   | W8   | 文档·生成器 | 文档 | README 仍称当前文档为 rc.3 并用 @next      | 根与 Vue/React 包 README 写当前版本 3.0.0，安装、CLI、MCP 命令不带 @next           |
| X07-F02 | P2   | W8   | 文档·生成器 | 文档 | 3.0 迁移指南称 Carousel 位移不随方向改符号 | 指南写明 Carousel 水平位移随 dir 改符号、RTL 为正，与 getScrollTransform 一致      |
| X07-F03 | P2   | W8   | 文档·生成器 | 文档 | CHANGELOG 缺 3.0 preview.1–6 标题          | CHANGELOG 有 3.0.0-preview.1–6 独立标题，或 preview.7 开头写明并链到对应 changeset |
