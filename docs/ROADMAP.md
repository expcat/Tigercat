# Tigercat 3.0 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: remaining preview tasks
verified-date: 2026-10-04
-->

3.0 波次已经做完，当前版本是 `3.0.0-rc.1`。完成记录在 [CHANGELOG.md](../CHANGELOG.md)。从 2.x 改到 3.0 的调用点在 [MIGRATION-3.0.md](MIGRATION-3.0.md)，2.x 档案在 [MIGRATION.md](MIGRATION.md)。组件维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。

本文件只登记还没做的事。做完后从这里删掉，不在这里留完成史。

## 尚未完成

| 任务              | 当前事实与最小范围                                                                                                                                                              | 验收条件                                                                                    | 状态       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| 本地覆盖率治理    | Statements 81.52%、Branches 72.83%、Functions 84.96%、Lines 84.78%；优先核对数据 / 工作流错误分支、Vue TreeSelect / Cascader 异步与受控路径、时间选择器边界、菜单键盘与浮层分支 | 保持统计范围和 83% / 76% / 84% / 85% 阈值，测试实际可观察行为；对应分组收敛后再验证全局门禁 | 待实施     |
| 包体积治理        | 原 HEAD preview.8 与 preview.9 均有相同 7 项超限；本轮仅增 0–186 bytes。按实际依赖分析缩减 Core 完整输出、框架默认依赖、Menu 链、Tailwind 样式和 zh-CN 文案数据                 | 保持现有公开能力与原 size budget，五包打包、消费构建和 SSR 继续通过，7 项回到预算内         | 待实施     |
| Cron 中文范围摘要 | 当前说明为英文，分钟范围会展开全部值；复用既有 locale 与解析能力提供中文范围 / 步长摘要                                                                                         | 任意 / 指定 / 范围 / 步长含义准确，0–59 保留范围语义，320px 可读，Vue / React 一致          | 待组件增强 |

这三项都还没做。不要把它们写成完整 `quality:release` 已经通过。

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
