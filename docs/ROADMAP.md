# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: competitor-gap conclusions, long-term observations, publish/verify boundaries, task registration
verified-date: 2026-08-25
source: current repository state after v2.1.1 review-fix patch
-->

本文记录竞品缺口结论、长期观察项与任务边界,不保存完成历史或一次性审查记录。

- 版本变更与完成历史见 [CHANGELOG.md](../CHANGELOG.md)。
- breaking change 与迁移路径见 [MIGRATION.md](MIGRATION.md)。
- 组件 API、示例与维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。
- 命令输出、浏览器审查和中间计划由 Git 历史追溯。

## 竞品基准与缺口结论

2026-07-19 核查。对比对象:Ant Design、Element Plus、Naive UI、PrimeVue、Mantine、shadcn/ui、HeroUI。核查时基线为 v2.0.19 的 149 个公共组件入口。该次核查列出的缺口组件与功能已在 v2.1.0 落地,公开组件入口现为 172(权威清单见 `skills/tigercat/references/component-index.md`,生成物)。

该次核查的缺口结论(均已随 v2.1.0 发布,不再作为可执行清单):

- 表单:InputOTP、TagsInput、MaskInput。
- 布局:ScrollArea、Masonry、AspectRatio。
- 导航:ContextMenu(覆盖 Dropdown 无 contextmenu 触发)、NavigationMenu、PageHeader。
- 展示与反馈:Kbd、Highlight、SplitButton、Marquee、ImageCompare、LoadingBar。
- 既有组件增强:Cascader 与 TreeSelect 大数据量虚拟化。

### 已验证非缺口

以下能力已存在,竞品对比时易误判为缺失,登记任务前先核对:DatePicker/TimePicker 范围选择、Select 多选与虚拟化、Tree 虚拟化、Progress 环形(circle/ring)、Text ellipsis、Input password、Statistic 数字动画、Table 树形/可展开/可编辑、命令面板(Spotlight)、Tour、Watermark、QRCode、Signature、CronEditor、NumberKeyboard、RTL(ar-SA + dir 同步)、13 套内置 locale、7 套内置主题、SSR、a11y 门禁。下游 Tigercat_Admin 的 3 条上游建议(Notification `actions`、BackTop `position`、FloatButton `floating`/`placement`/`offset`)已全部实现。v2.1.0 批次 1-5 交付的组件与可选虚拟化也不再是缺口。

## 当前任务

当前没有绑定版本号的可执行批次。v2.1.0 批次 1-5 与随后的 Pages/source 审查修复已分别随 v2.1.0 / v2.1.1 发布,完成历史见 [CHANGELOG.md](../CHANGELOG.md)。

新任务登记时遵循 AGENTS.md 组件交付管线,不在此重复展开。

## 长期观察项(不绑定版本)

- headless/unstyled 模式:架构级方向,需先评估与 Tailwind 插件、token 体系的关系。
- React peer 依赖下探(^18)评估:收益与测试矩阵成本权衡。
- 低频候选组件:TimeSelect、Inplace 就地编辑、CopyButton、Dock;出现真实下游需求时再登记。

## 发布与验证边界

- `.github/workflows/` 只保留打 tag、发布包和部署 Pages 所需流程;测试在本地执行（`pnpm test` / `pnpm e2e`，全浏览器用 `pnpm e2e:full`）。不要把测试接到 CI。
- E2E 只验证跨浏览器功能行为,不维护图片对比基线。
- 发布前本地执行完整门禁 quality:release，再按需 `pnpm e2e:full`。按改动范围可先运行 focused/group checks，最终只运行一次完整门禁。日常 e2e 用 Chromium：`pnpm e2e`。
- public API、shared contract、props、events、methods、type aliases 或 helper exports 发生变化时,同步更新 CHANGELOG.md、docs/MIGRATION.md、API baseline、generated Skill references、examples 与对应测试。
- 生成产物只能通过事实源或生成器重建,不得手改 skills/tigercat/references 生成物或 api-reports 掩盖漂移。

## 任务登记规则

- 只登记有复现路径、影响范围和验收条件的新事实,不恢复已完成批次或旧审查清单。
- P0/P1 拆成独立或小批任务;P2/P3 仅在同一根因和同一验证范围内合并。
- 每项任务必须写明允许修改范围、本地验证命令和完成后的文档/生成物回写范围。
