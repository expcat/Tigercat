# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2 release state and example coverage follow-up
verified-date: 2026-07-16
source: current repository state
-->

本文只保留当前状态、发布边界和下一项可执行工作，不再保存已完成批次的逐次执行日志。

- 版本变更与发布历史以 [CHANGELOG.md](../CHANGELOG.md) 为准。
- breaking change 与唯一迁移路径以 [MIGRATION.md](MIGRATION.md) 为准。
- 组件 API、示例与维护规则以 [Tigercat Skill](../skills/tigercat/SKILL.md) 为准。
- 已完成任务的命令输出、浏览器审查和中间计划由 Git 历史追溯，不再复制到 `docs/`。

## 当前状态

- 当前版本：`2.0.4`（正式版）。
- v2.0.0 R01-R30 已完成；已登记的 P0/P1 组件、Example、i18n、a11y、构建与发布门禁问题均已解决。
- R30 后的旧演示 polish 建议已移除；2026-07-16 根据最新 Example 覆盖审查和用户确认，新增 R31-R35 作为独立的非发布阻塞任务。
- 149 个公开组件均已有有效展示入口；R31-R34 已补齐 10 个高优先级和 4 个中优先级组件后，剩余 4 个中优先级组件建议扩展功能展示。
- 发布前清理已完成：Actions 不再运行测试、coverage、benchmark 或依赖审计；Playwright 只保留功能 E2E，图片对比 spec 与 PNG 基线已删除。
- v2.0.0 正式版发布准备与发布流程已完成；当前代码与三个公开包均已同步到 v2.0.4，`v2.0.0` / `v2.0.4` tag 均已推送到 `origin`。
- 当前可执行任务：R35；完成后恢复为“当前无实现任务”，并回写本节和对应批次状态。

## Example 展示完善计划

### 执行口径

- 只为具有明显不同渲染、状态或交互分支的能力增加示例，不按 props 数量机械拆分 Demo。
- React 与 Vue 必须展示对等能力；短、中型示例继续使用同模块 `?raw` 源码，较长的 Advanced 示例可使用紧凑 fixture sidecar。
- 状态可能互相污染、需要独立触发或依赖焦点的交互保留独立 Demo；其余能力优先在一个可读示例中组合展示。
- 默认允许修改 `examples/example/react/src/examples/**`、`examples/example/vue3/src/examples/**` 及必要的 Example 页面注册；不修改组件实现、公开 API 或生成型 Skill/API 文档。
- 如果实现示例时发现组件缺陷，单独登记复现路径和影响范围，不在 Example 批次中顺带扩大修复范围。

### 批次

| ID  | 状态   | 组件                                               | 必须补充的展示能力                                                                                       |
| --- | ------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| R31 | 已完成 | FileManager、FormWizard、ChatWindow、CommentThread | 网格与受控文件操作；异步校验/跳步；虚拟消息与输入模式；点赞、回复、展开及加载事件                        |
| R32 | 已完成 | ImageAnnotation、InfiniteScroll、MarkdownEditor    | 受控工具/选区与只读；反向或横向加载；edit/preview 模式、自定义 renderer/toolbar                          |
| R33 | 已完成 | NotificationCenter、RichTextEditor、TaskBoard      | 受控分组/已读筛选与状态页；只读/禁用及自定义工具栏；列拖拽、过滤与自定义卡片                             |
| R34 | 已完成 | ActivityFeed、CodeEditor、Gantt、ImageViewer       | 平铺分组与加载/空态；只读/禁用状态；时间刻度和受控选择回调；受控图片索引、缩放边界与关闭行为             |
| R35 | 待执行 | InputNumber、OrgChart、Spotlight、VirtualTable     | formatter/parser 与控件布局；纵向/头像及受控选择；自定义过滤、快捷键和禁用项；受控选择、列虚拟化及状态页 |

R31-R33 为高优先级 10 个组件，R34-R35 为中优先级 8 个组件。每批完成后必须：

1. 将对应状态改为“已完成”，并把“当前可执行任务”推进到下一批；R35 完成后恢复为“当前无实现任务”。
2. 运行 `pnpm example:sources:check`、`pnpm example:compile:check`、`pnpm example:build`。
3. 按组件分类运行相关 `pnpm test:group:<group>`；R31-R35 涉及的分组为 `advanced`、`composite`、`charts`、`form` 和 `navigation`，只运行当批实际涉及的分组。
4. 运行 changed-file Prettier check 与 `git diff --check`；仅在按需导入、懒加载或 SSR 边界发生变化时追加 `pnpm example:ssr:check`。

## 发布与验证边界

- `.github/workflows/` 只保留打 tag、发布 npm 包和部署 Pages 所需流程；测试全部在本地执行。
- 不重新引入 CI/E2E/benchmark/security 测试 workflow，不在发布 workflow 中增加 `quality:release`、coverage、SSR、E2E 或 publish smoke。
- E2E 只验证跨浏览器功能行为；不使用 `toHaveScreenshot`，不维护 `*-snapshots` 图片目录。
- 发布前本地执行 `pnpm quality:release` 与 `pnpm e2e`。按改动范围可先运行 focused/group checks，最终只运行一次完整门禁。
- public API、shared contract、props、events、methods、type aliases 或 helper exports 发生变化时，同步更新 `CHANGELOG.md`、`docs/MIGRATION.md`、API baseline、generated Skill references、examples 与对应测试。
- 生成产物只能通过事实源或生成器重建，不得手改 `skills/tigercat/references/*` 或 `api-reports/*` 掩盖漂移。

## 发布准备检查

| 检查项                        | 当前结果                                                  |
| ----------------------------- | --------------------------------------------------------- |
| 静态类型、lint、API 一致性    | 通过                                                      |
| 单元/组件测试                 | 383 files / 6,840 tests 通过                              |
| API baseline、exports、Skill  | 通过，生成物零漂移                                        |
| packages 与 React/Vue Example | 通过                                                      |
| coverage、size、publish、SSR  | 通过                                                      |
| 功能 E2E                      | 136 tests 跨四个 project 通过（40 项按 project 条件跳过） |

## 后续任务登记规则

- 只登记有复现路径、影响范围和验收条件的新事实，不恢复已完成批次或旧审查清单。
- P0/P1 拆成独立或小批任务；P2/P3 仅在同一根因和同一验证范围内合并。
- 每项任务必须写明允许修改范围、本地验证命令和完成后的文档/生成物回写范围。
