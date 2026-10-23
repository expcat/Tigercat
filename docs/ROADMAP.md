# Tigercat 3.0 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: remaining preview tasks
verified-date: 2026-10-24
-->

3.0 波次已经做完，当前版本是 `3.0.0-rc.2`。完成记录在 [CHANGELOG.md](../CHANGELOG.md)。从 2.x 改到 3.0 的调用点在 [MIGRATION-3.0.md](MIGRATION-3.0.md)，2.x 档案在 [MIGRATION.md](MIGRATION.md)。组件维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。

本文件只登记还没做的事。做完后从这里删掉，不在这里留完成史。

## 尚未完成

| 任务                    | 当前事实与最小范围                                                                                   | 验收条件                                                                                        | 状态              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| Cron 中文范围摘要       | 当前说明为英文，分钟范围会展开全部值；复用既有 locale 与解析能力提供中文范围 / 步长摘要              | 任意 / 指定 / 范围 / 步长含义准确，0–59 保留范围语义，320px 可读，Vue / React 一致              | 待组件增强        |
| Example 视觉验收与 rc.3 | 按[活动验收计划](RC3-VISUAL-VALIDATION.md)完成三阶段总控模型视觉验收，准备 `3.0.0-rc.3` 本地候选版本 | 视觉证据完整、本地发布门禁通过；口令确认后 tag Action 发布及消费验证成功，再交接 Tigercat_Admin | RELEASE-01 执行中 |

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

新任务写进「尚未完成」，写清当前事实、最小范围和可观察的验收。一次只做一条，做完就从本文件删掉。
