# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: 3.0.0 之后的修复阶段；本文件是入口，任务表在 docs/plan/
input: .local/review/2026-11-05（全项目 Review，不进 git）
tasks: 378 条 Review 发现 + 11 条证据任务
verified-date: 2026-11-16
-->

当前正式版本是 `3.0.0`。这一阶段不加新组件，只做两件事：修掉 2026-11-05 全项目 Review 查出的问题，补上当时没采到的浏览器证据。

本文件是目录和入口，任务在 [plan/](plan/00-scope.md) 下。完成记录在 [CHANGELOG.md](../CHANGELOG.md)。从 2.x 改到 3.0 的调用点在 [MIGRATION-3.0.md](MIGRATION-3.0.md)，预览版间迁移与历史档案在 [MIGRATION.md](MIGRATION.md)。组件维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。

## 现状

- Review 覆盖 185 个公开组件、841 个 Demo 和 7 份项目专题，共 564 条发现。已完成条目移入 [CHANGELOG.md](../CHANGELOG.md)，剩 378 条：P1 0、P2 279、P3 99。
- 审查的总状态是 needs-evidence。3364 个视口格里，视觉 2772 格、键盘 2832 格没有浏览器证据。很多条目的依据只有源码和 happy-dom，动手前要先复现。

## 计划

一条发现只出现在一张任务表里。先读 [00](plan/00-scope.md) 的编号和验收总则。

| 文档                                                    | 内容                                                          | 条数 |
| ------------------------------------------------------- | ------------------------------------------------------------- | ---: |
| [00 范围与口径](plan/00-scope.md)                       | 输入、目标与非目标、编号、验收总则、证据口径                  |    — |
| [02 共享 Core、主题与 i18n](plan/02-core-theme-i18n.md) | X01、X02：表单引擎、浮层触发器、工作流权限、菜单 schema、文案 |    1 |
| [03 基础组件](plan/03-basic.md)                         | C001–C032                                                     |   87 |
| [04 布局组件](plan/04-layout.md)                        | C033–C051                                                     |   43 |
| [05 表单组件](plan/05-form.md)                          | C052–C081                                                     |    2 |
| [06 导航组件](plan/06-navigation.md)                    | C082–C116                                                     |   51 |
| [07 反馈组件](plan/07-feedback.md)                      | C117–C130                                                     |   24 |
| [08 数据展示组件](plan/08-data.md)                      | C131–C137                                                     |   14 |
| [09 图表组件](plan/09-charts.md)                        | C138–C158                                                     |   57 |
| [10 高级组件](plan/10-advanced.md)                      | C159–C169                                                     |   30 |
| [11 组合组件](plan/11-composite.md)                     | C170–C185                                                     |   58 |
| [12 工具链、文档与示例平台](plan/12-tooling-docs.md)    | X03–X07：CLI、MCP、生成器、Example、发布配置、项目文档        |   11 |
| [13 证据补采与复验](plan/13-evidence.md)                | E01–E11：blocked 格重跑、RTL、图源、断链、未立项观察          |   11 |
| [14 波次与执行顺序](plan/14-waves.md)                   | 各波条数、硬依赖、开工前要先定方向的条目                      |    — |

## 波次

波次是派工标签，不是全局锁。硬依赖和每一波的说明在 [14](plan/14-waves.md)。

| 波次 | 内容                             | 条数 | 文档       |
| ---- | -------------------------------- | ---: | ---------- |
| W1   | 安全类条目                       |    0 | 12         |
| W2   | 共享 Core、主题与 i18n 的 P2     |    0 | 02         |
| W3   | 表单的 P2                        |    0 | 05         |
| W4   | 导航与反馈的 P2                  |   50 | 06、07     |
| W5   | 基础与布局的 P2                  |  118 | 03、04     |
| W6   | 数据、图表与高级的 P2            |   65 | 08、09、10 |
| W7   | 组合组件的 P2                    |   39 | 11         |
| W8   | 工具链、文档与示例平台的 P2      |    7 | 12         |
| W9   | 各篇的 P3                        |   99 | 02–12      |
| W10  | 证据补采与复验，随浏览器环境并行 |   11 | 13         |

## 边界

- 公开面最小化，默认可访问，SSR 安全。扩展只走 token、class / style、组合与插槽。
- 公开组件只记在 `scripts/lib/public-components.mjs`。CLI、文档 slug、测试分组和 exports 检查都读它。
- 3.0 不向前兼容。不保留弃用别名，也不留两套实现。行为变化写进 `docs/MIGRATION.md` 或 `docs/MIGRATION-3.0.md`。
- 正式 Release 由人工另发指令。引用方验证 preview 之前不发正式版。
- 不做 BPMN、Flowable、Camunda，以及第二套 Menu / Timeline。
- 租户、组织、部门、字典组件不进库。受理人选择器只消费调用方给的目录。
- 不做人机验证码、Dock、独立的 TimeSelect，也不把 React peer 下探到 18。
- 测试只在本地执行。不在 CI 或 workflow 里跑测试，也不把全量 `quality:release` 接进 CI。

## 登记

- 任务登记在 `plan/` 对应文档的任务表里，本文件只留目录和条数。
- 新任务写清当前事实、最小范围和可观察的验收。来自 Review 的沿用原编号；不是的用 `T` 加序号，放进最相关的那一篇。
- 做完的行从任务表里删掉，记录写进 `CHANGELOG.md`。这里和 `plan/` 都不留完成史。表里的条数跟着改。
- 一篇的任务表清空之后，删掉那一篇，并从上面的目录里去掉。
