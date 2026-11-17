# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: 3.0.0 之后的修复阶段；本文件是入口，任务表在 docs/plan/
input: .local/review/2026-11-05（全项目 Review，不进 git）
tasks: 0 条 Review 发现 + 0 条证据任务
verified-date: 2026-11-17
-->

当前正式版本是 `3.0.1`。这一阶段不加新组件，只做两件事：修掉 2026-11-05 全项目 Review 查出的问题，补上当时没采到的浏览器证据。

本文件是目录和入口，任务在 [plan/](plan/00-scope.md) 下。完成记录在 [CHANGELOG.md](../CHANGELOG.md)。从 2.x 改到 3.0 的调用点在 [MIGRATION-3.0.md](MIGRATION-3.0.md)，预览版间迁移与历史档案在 [MIGRATION.md](MIGRATION.md)。组件维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。

## 现状

- Review 覆盖 185 个公开组件、841 个 Demo 和 7 份项目专题，共 564 条发现。已完成条目移入 [CHANGELOG.md](../CHANGELOG.md)，剩 0 条：P1 0、P2 0、P3 0。W10-FIX1 已补齐 React SplitButton 与 Vue TimePicker 的键盘修复，定向自动门禁与双端无头 Chromium 复验通过。W10-FIX2 已关闭 T05、T06、T07、T08、T14、T15、T19、T21、T22、T25。W10-FIX3 已关闭 T03、T04、T09、T17、T20、T23、T26。W10-FIX4 已关闭 T10、T11、T12、T13、T16、T18、T24。
- 审查不再等待证据。3364 个视口格在 W10-G7 后没有 blocked。视觉 pass 3070、finding 174、fail 19、partial 101；键盘 pass 3042、finding 144、fail 24、partial 130、not-applicable 24。E06 已于 2026-11-17 关闭：用户接受读屏证据缺口。最佳可得证据是 hover 96 格 248 图，以及 17 个 P1 的 AX / 键盘证据；真实 VoiceOver / NVDA 输出仍缺，缺口保留登记。

## 计划

一条发现只出现在一张任务表里。先读 [00](plan/00-scope.md) 的编号和验收总则。

| 文档                                                    | 内容                                                          | 条数 |
| ------------------------------------------------------- | ------------------------------------------------------------- | ---: |
| [00 范围与口径](plan/00-scope.md)                       | 输入、目标与非目标、编号、验收总则、证据口径                  |    — |
| [02 共享 Core、主题与 i18n](plan/02-core-theme-i18n.md) | X01、X02：表单引擎、浮层触发器、工作流权限、菜单 schema、文案 |    0 |
| [03 基础组件](plan/03-basic.md)                         | C001–C032                                                     |    0 |
| [04 布局组件](plan/04-layout.md)                        | C033–C051                                                     |    0 |
| [05 表单组件](plan/05-form.md)                          | C052–C081                                                     |    0 |
| [06 导航组件](plan/06-navigation.md)                    | C082–C116                                                     |    0 |
| [07 反馈组件](plan/07-feedback.md)                      | C117–C130                                                     |    0 |
| [08 数据展示组件](plan/08-data.md)                      | C131–C137                                                     |    0 |
| [09 图表组件](plan/09-charts.md)                        | C138–C158                                                     |    0 |
| [10 高级组件](plan/10-advanced.md)                      | C159–C169                                                     |    0 |
| [11 组合组件](plan/11-composite.md)                     | C170–C185                                                     |    0 |
| [12 工具链、文档与示例平台](plan/12-tooling-docs.md)    | X03–X07：CLI、MCP、生成器、Example、发布配置、项目文档        |    0 |
| [13 证据补采与复验](plan/13-evidence.md)                | E06 已关闭：用户接受读屏缺口                                  |    0 |
| [14 波次与执行顺序](plan/14-waves.md)                   | 各波条数、硬依赖、开工前要先定方向的条目                      |    — |

## 波次

波次是派工标签，不是全局锁。硬依赖和每一波的说明在 [14](plan/14-waves.md)。

| 波次 | 内容                             | 条数 | 文档                   |
| ---- | -------------------------------- | ---: | ---------------------- |
| W1   | P1 键盘修复                      |    0 | 02、03                 |
| W2   | 共享 Core、主题与 i18n 的 P2     |    0 | 02                     |
| W3   | 表单的 P2                        |    0 | 05                     |
| W4   | 导航与反馈的 P2                  |    0 | 06、07                 |
| W5   | 基础与布局的 P2                  |    0 | 03、04                 |
| W6   | 数据、图表与高级的 P2            |    0 | 08、09、10             |
| W7   | 组合组件的 P2                    |    0 | 11                     |
| W8   | 工具链、文档与示例平台的 P2      |    0 | 12                     |
| W9   | 各篇的 P3                        |    0 | 03、04、06、09、10、11 |
| W10  | 证据补采与复验，随浏览器环境并行 |    0 | 13                     |

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
