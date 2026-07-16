# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: current executable work only
verified-date: 2026-07-16
source: current repository state
-->

本文只记录当前可执行任务及其边界，不保存完成历史或一次性审查记录。

- 版本变更与完成历史见 [CHANGELOG.md](../CHANGELOG.md)。
- breaking change 与迁移路径见 [MIGRATION.md](MIGRATION.md)。
- 组件 API、示例与维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。
- 命令输出、浏览器审查和中间计划由 Git 历史追溯。

## 当前任务

当前没有已登记的实现任务。

## 发布与验证边界

- `.github/workflows/` 只保留打 tag、发布 npm 包和部署 Pages 所需流程；测试在本地执行。
- E2E 只验证跨浏览器功能行为，不维护图片对比基线。
- 发布前本地执行 `pnpm quality:release` 与 `pnpm e2e`。按改动范围可先运行 focused/group checks，最终只运行一次完整门禁。
- public API、shared contract、props、events、methods、type aliases 或 helper exports 发生变化时，同步更新 `CHANGELOG.md`、`docs/MIGRATION.md`、API baseline、generated Skill references、examples 与对应测试。
- 生成产物只能通过事实源或生成器重建，不得手改 `skills/tigercat/references/*` 或 `api-reports/*` 掩盖漂移。

## 任务登记规则

- 只登记有复现路径、影响范围和验收条件的新事实，不恢复已完成批次或旧审查清单。
- P0/P1 拆成独立或小批任务；P2/P3 仅在同一根因和同一验证范围内合并。
- 每项任务必须写明允许修改范围、本地验证命令和完成后的文档/生成物回写范围。
