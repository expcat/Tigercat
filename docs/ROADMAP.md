# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: competitor-gap conclusions, long-term observations, publish/verify boundaries, task registration
verified-date: 2026-09-03
source: current repository state after v2.1.4
-->

本文记录竞品缺口结论、长期观察项与任务边界，不保存完成历史或一次性审查记录。

- 版本变更与完成历史见 [CHANGELOG.md](../CHANGELOG.md)。
- breaking change 与迁移路径见 [MIGRATION.md](MIGRATION.md)。
- 组件 API、示例与维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。
- 公开组件权威清单见 [component-index.md](../skills/tigercat/references/component-index.md)（生成物）。

## 竞品缺口结论

2026-07-19 对照 Ant Design、Element Plus、Naive UI、PrimeVue、Mantine、shadcn/ui、HeroUI 列出的缺口（当时基线 v2.0.19）已随 [CHANGELOG.md](../CHANGELOG.md) v2.1.0 全部落地，不再作为可执行清单。不要按旧数字登记任务。

### 已验证非缺口

登记任务前先核对，避免把已有 API 当缺口：DatePicker/TimePicker 范围选择、Select 多选与虚拟化、Tree 虚拟化、Progress 环形、Text ellipsis、Input password、Statistic 数字动画、Table 树形/可展开/可编辑、Spotlight、Tour、Watermark、QRCode、Signature、CronEditor、NumberKeyboard、RTL、内置 locale/主题、SSR、a11y 门禁；以及 Notification `actions`、BackTop `position`、FloatButton `floating`/`placement`/`offset`。v2.1.0 批次 1–5 交付项也不是缺口。

## 当前任务

当前没有绑定版本号的可执行批次。完成历史见 [CHANGELOG.md](../CHANGELOG.md)。新任务遵循 [AGENTS.md](../AGENTS.md) 组件交付管线，不在此展开。

## 长期观察项（不绑定版本）

- headless/unstyled 模式：需先评估与 Tailwind 插件、token 体系的关系。
- React peer 依赖下探（^18）：收益与测试矩阵成本权衡。
- 低频候选：TimeSelect、Inplace 就地编辑、CopyButton、Dock；出现真实下游需求时再登记。

## 发布与验证边界

- `.github/workflows/` 只保留打 tag、发布包和部署 Pages；测试在本地执行，不要接到 CI。
- E2E 只验证跨浏览器功能行为，不维护图片对比基线。按改动范围选择命令见 [tests/README.md](../tests/README.md#按改动范围验证)。
- 发布前本地执行 `pnpm quality:release`，再按需 `pnpm e2e:full`。
- public API 变化时同步 CHANGELOG、MIGRATION、API baseline、Skill references、examples 与测试。生成产物只能重跑生成器，不得手改。

## 任务登记规则

- 只登记有复现路径、影响范围和验收条件的新事实，不恢复已完成批次或旧审查清单。
- P0/P1 拆成独立或小批任务；P2/P3 仅在同一根因和同一验证范围内合并。
- 每项任务必须写明允许修改范围、本地验证命令和完成后的文档/生成物回写范围。
