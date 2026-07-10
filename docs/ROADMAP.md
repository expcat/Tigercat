# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.0.0 release preparation and evidence-driven follow-up
verified-date: 2026-07-10
source: current repository state
-->

本文只保留当前状态、发布边界和下一项可执行工作，不再保存已完成批次的逐次执行日志。

- 版本变更与发布历史以 [CHANGELOG.md](../CHANGELOG.md) 为准。
- breaking change 与唯一迁移路径以 [MIGRATION.md](MIGRATION.md) 为准。
- 组件 API、示例与维护规则以 [Tigercat Skill](../skills/tigercat/SKILL.md) 为准。
- 已完成任务的命令输出、浏览器审查和中间计划由 Git 历史追溯，不再复制到 `docs/`。

## 当前状态

- 当前版本：`2.0.0-rc.2`。
- v2.0.0 R01-R30 已完成；已登记的 P0/P1 组件、Example、i18n、a11y、构建与发布门禁问题均已解决。
- R30 后保留的新增演示和纯 polish 建议不构成 RC 发布要求，已从路线图移除；如以后有新的用户证据，再作为独立任务登记。
- 发布前清理已完成：Actions 不再运行测试、coverage、benchmark 或依赖审计；Playwright 只保留功能 E2E，图片对比 spec 与 PNG 基线已删除。
- 当前无实现任务。下一步仅在收到明确发布指令后执行稳定版版本同步、tag、publish 与 Pages 部署。

## 发布与验证边界

- `.github/workflows/` 只保留打 tag、发布 npm 包和部署 Pages 所需流程；测试全部在本地执行。
- 不重新引入 CI/E2E/benchmark/security 测试 workflow，不在发布 workflow 中增加 `quality:release`、coverage、SSR、E2E 或 publish smoke。
- E2E 只验证跨浏览器功能行为；不使用 `toHaveScreenshot`，不维护 `*-snapshots` 图片目录。
- 发布前本地执行 `pnpm quality:release` 与 `pnpm e2e`。按改动范围可先运行 focused/group checks，最终只运行一次完整门禁。
- public API、shared contract、props、events、methods、type aliases 或 helper exports 发生变化时，同步更新 `CHANGELOG.md`、`docs/MIGRATION.md`、API baseline、generated Skill references、examples 与对应测试。
- 生成产物只能通过事实源或生成器重建，不得手改 `skills/tigercat/references/*` 或 `api-reports/*` 掩盖漂移。

## 发布准备检查

| 检查项                        | 当前结果                      |
| ----------------------------- | ----------------------------- |
| 静态类型、lint、API 一致性    | 通过                          |
| 单元/组件测试                 | 383 files / 6,840 tests 通过  |
| API baseline、exports、Skill  | 通过，生成物零漂移            |
| packages 与 React/Vue Example | 通过                          |
| coverage、size、publish、SSR  | 通过                          |
| 功能 E2E                      | 152 tests 跨四个 project 通过 |

## 后续任务登记规则

- 只登记有复现路径、影响范围和验收条件的新事实，不恢复已完成批次或旧审查清单。
- P0/P1 拆成独立或小批任务；P2/P3 仅在同一根因和同一验证范围内合并。
- 每项任务必须写明允许修改范围、本地验证命令和完成后的文档/生成物回写范围。
