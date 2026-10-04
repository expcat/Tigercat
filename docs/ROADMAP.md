# Tigercat 3.0 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v3.0 goals and plan index
verified-date: 2026-09-23
source: tigercat-review-v3/00-decisions.md（2026-09-23）
-->

3.0 把组件库做成一份 token、请求级主题与文案、core 里的一份逻辑、Vue 与 React 同一行为。审查里的 253 条优化和 132 条增强全部排进 [plan/](plan/00-scope.md)，按波次执行，不存在只索引、永不排期的条目。

版本变更史见 [CHANGELOG.md](../CHANGELOG.md)。2.x 迁移档案见 [MIGRATION.md](MIGRATION.md)。3.0 迁移文档怎么写见 [plan/14-migration.md](plan/14-migration.md)。组件维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。

## preview 后续任务（2026-10-04）

preview.9 的显示、hover、焦点和关闭回归已实现并通过本地行为测试、五包构建与 tarball 消费检查；已完成修复只记录在 Changelog。以下保留尚未完成的门禁治理与组件增强，不把发布候选的验收写成完整 `quality:release` 通过。

| 任务              | 当前事实与最小范围                                                                                                                                                              | 验收条件                                                                                    | 状态       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| 本地覆盖率治理    | Statements 81.52%、Branches 72.83%、Functions 84.96%、Lines 84.78%；优先核对数据 / 工作流错误分支、Vue TreeSelect / Cascader 异步与受控路径、时间选择器边界、菜单键盘与浮层分支 | 保持统计范围和 83% / 76% / 84% / 85% 阈值，测试实际可观察行为；对应分组收敛后再验证全局门禁 | 待实施     |
| 包体积治理        | 原 HEAD preview.8 与 preview.9 均有相同 7 项超限；本轮仅增 0–186 bytes。按实际依赖分析缩减 Core 完整输出、框架默认依赖、Menu 链、Tailwind 样式和 zh-CN 文案数据                 | 保持现有公开能力与原 size budget，五包打包、消费构建和 SSR 继续通过，7 项回到预算内         | 待实施     |
| Cron 中文范围摘要 | 当前说明为英文，分钟范围会展开全部值；复用既有 locale 与解析能力提供中文范围 / 步长摘要                                                                                         | 任意 / 指定 / 范围 / 步长含义准确，0–59 保留范围语义，320px 可读，Vue / React 一致          | 待组件增强 |

## 目标

- 公开面最小化，默认可访问，SSR 安全，扩展只走 token、class / style、组合与插槽。
- 已导出的复合组件在默认路径上写对。工作流的分支、动作归属、空意见、设计器阻塞和字段权限算进这一版，不因 2.5 已经发过而跳过。
- 公开组件只记在扩展后的 `scripts/lib/public-components.mjs`。CLI、文档 slug、测试分组和 exports 检查都读它。
- 计划全部完成后发布 `3.0.0-preview.1`。

## 非目标

- 正式 Release。引用方验证 preview 之后，由人工另发指令。
- BPMN、Flowable、Camunda，以及第二套 Menu / Timeline。
- 租户、组织、部门、字典组件进库。受理人选择器只消费调用方给的目录。
- 人机验证码组件、Dock、独立的 TimeSelect，以及把 React peer 下探到 18。
- 在 CI 或 workflow 里跑测试，或把全量 `quality:release` 接进 CI。

## 不兼容

3.0 不向前兼容。彻底重构，禁止补丁。组件按新 API 重写，不保留弃用别名，也不留「先能导入」的窗口。每个组件改完，同一批更新 skill 与 examples。迁移文档随各部分增量记录行为变化，全部完成后收成总结式终稿。做法见 [plan/14-migration.md](plan/14-migration.md)。

## 测试与 preview.1

测试只在本地执行。打 `v3.0.0-preview.1` 之前，本地跑完与改动相符的测试，并在本地通过四项静态检查：导出同步、基线 diff、文档 diff、`publish:check`。

发布脚本本身要满足安全条件：tag 经环境变量传入、整段匹配、不进 shell；删除和 CLI 写盘走白名单；Pages 的 `/mcp/` 与该 tag 同源。这些是脚本不变量，不是把测试接进 CI。

## 计划

| 篇                                             | 内容                              |
| ---------------------------------------------- | --------------------------------- |
| [00 范围](plan/00-scope.md)                    | 目标、编号、波次、验收、preview.1 |
| [01 地基与基础组件](plan/01-foundation.md)     | T01、T02                          |
| [02 表单](plan/02-forms.md)                    | T03、T04                          |
| [03 反馈](plan/03-feedback.md)                 | T05                               |
| [04 布局](plan/04-layout.md)                   | T06                               |
| [05 导航](plan/05-navigation.md)               | T07                               |
| [06 数据与表格](plan/06-data-table.md)         | T08                               |
| [07 虚拟窗口](plan/07-virtual.md)              | T10 的窗口算术，以及引用约定      |
| [08 图表](plan/08-charts.md)                   | T09                               |
| [09 编辑器与画布](plan/09-editors.md)          | T10 里窗口以外的部分              |
| [10 复合与中后台](plan/10-composite.md)        | T11，含工作流正确性               |
| [11 工具链与发布](plan/11-tooling.md)          | T12，本地测试与 preview.1         |
| [12 增强核对](plan/12-enhancements-backlog.md) | 132 条增强的落点                  |
| [13 波次](plan/13-waves.md)                    | 依赖与执行顺序                    |
| [14 迁移文档](plan/14-migration.md)            | 增量记录，终局改成总结            |

## 中台里尚未做完的部分

2.3 至 2.6 已经发布的 Viewer、MenuSchema、Designer、ActionBar、字段权限、DetailShell、粘底配方和纵向画布，不再写成可依赖的里程碑。审查看到默认路径仍会走错，这些项改由计划承接：

- 条件只进入选中分支（T11 O5）
- 动作属于当前操作者，空意见拒绝（T11 O6）
- 设计器的阻塞项留在提交结果里（T11 O7）
- 字段权限只有一个默认，详情提交走合并（T11 O18）
- 看板落点、评论树、工具条、向导和 Schema（T11 O3、O8–O12）

任务与验收在 [10 复合](plan/10-composite.md)。

## 执行

硬依赖和可并行的部分见 [13 波次](plan/13-waves.md)。后一波不必等前一波里彼此无关的条目全部结束。每条任务一次做成。
