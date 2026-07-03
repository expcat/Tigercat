# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.0.0 follow-up planning for example user-story requirement execution
verified-date: 2026-07-01
source: docs/EXAMPLE_USER_STORY_REQUIREMENTS.md
-->

本文只记录下一阶段要实施的任务。v1.5.0 以前的扫描取证、T01-T14 执行细节、R01-R28 已完成批次细节与发布收口记录不再保留在路线图中；详细执行摘要、实际验证命令和状态回写记录统一归档到 [V2_COMPLETED.md](V2_COMPLETED.md)，public API 删除/合并证据归档到 [V2_API_AUDIT.md](V2_API_AUDIT.md)。

## 当前状态

截至 2026-07-01，T01-T14 与 v2.0.0 R01-R28 已完成；R20 不作为 v2.0 发布收口批次，后续发布收口按维护决定单独追加。

R28 的 React/Vue Example 用户故事审查已完成，E01-E21 的体验入口、用户故事、问题证据、影响、组件能力建议和优先级已合并到 [EXAMPLE_USER_STORY_REQUIREMENTS.md](EXAMPLE_USER_STORY_REQUIREMENTS.md)。该文档是后续 Example 体验修复、组件能力补齐和文档示例优化的唯一需求入口。

## 阶段进度

- 已完成阶段：阶段 0-22 已完成 R01-R28；细节见 [V2_COMPLETED.md](V2_COMPLETED.md)。
- 当前阶段：阶段 23，Example 用户故事需求执行中；源码/构建首批 S1-S10、Example 错误修复 EX1-EX11 与示例歧义/中文站文案批次 EX12-EX16 已完成。
- 当前可执行任务：从 [EXAMPLE_USER_STORY_REQUIREMENTS.md](EXAMPLE_USER_STORY_REQUIREMENTS.md) 继续拆分 EX17+ 或 P2/P3 修复批次，优先处理示例可复制性、业务状态回显、移动端说明和低风险 polish。
- 后续阶段：P2/P3 示例可复制性、组合使用、移动端、状态回显和 polish 批次，按同源组件或同一根因继续追加。

## 执行原则

- 每个任务独立执行并单独更新状态；不要把未声明的源码修复或新功能混入相邻任务。
- 执行任一后续 Rxx 前，必须先读取 [EXAMPLE_USER_STORY_REQUIREMENTS.md](EXAMPLE_USER_STORY_REQUIREMENTS.md) 中对应 E 组的 Routes、背景和任务项（每项含优先级、类型、动作与验收）。
- P0/P1 必须优先拆成独立或小批量 Rxx；P2/P3 只按同源组件、同一体验根因或相邻页面改动合并。
- v2.0.0 是破坏性版本，不新增 `@deprecated` 过渡层，不保留向后兼容分支。
- 生成产物只能通过修改事实源或生成器后重生成；不得手改 `skills/tigercat/references/*`、`api-reports/*` 或发布快照来掩盖漂移。
- Example 更新必须优先使用组件子路径 import，避免重新引入 root value imports 或 heavy dependency leakage。
- 发布验证必须在本地手动完成，发布 Action 只负责发布动作；不要再向 `.github/workflows/publish*.yml` 添加 `quality:release`、测试、coverage、SSR 或 publish smoke 等发布前验证门禁。
- 涉及 public API、shared contract、props、events、methods、type aliases 或 helper exports 删除/合并的任务，必须在 [V2_API_AUDIT.md](V2_API_AUDIT.md) 追加或更新对应批次记录。

## 阶段与依赖

| 阶段  | 阶段状态             | 任务    | 执行规则                                                                                                                                                       |
| ----- | -------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0-14  | 已完成（2026-06-30） | R01-R20 | 已完成组件级 API 清理，细节归档到 `V2_COMPLETED.md` / `V2_API_AUDIT.md`                                                                                        |
| 15-21 | 已完成（2026-07-01） | R21-R27 | 已完成分组验证、Skill 路由压缩、Example raw-source 护栏与展示合并维护                                                                                          |
| 22    | 已完成（2026-07-01） | R28     | 已完成 E01-E21 用户故事审查，需求已合并到 `EXAMPLE_USER_STORY_REQUIREMENTS.md`                                                                                 |
| 23    | 进行中（2026-07-02） | R29+    | 已完成 `EXAMPLE_USER_STORY_REQUIREMENTS.md` 第一节源码/构建 S1-S10、第二节错误修复 EX1-EX11 与示例歧义/中文站文案 EX12-EX16；后续继续执行 Example 必要修改批次 |

## 后续任务规划

### R29 Example P0/P1 修复拆分与首批执行

**状态**：进行中（2026-07-02 已完成源码/构建 S1-S10、Example 错误修复 EX1-EX11 与示例歧义/中文站文案 EX12-EX16）。

**目标**：从 [EXAMPLE_USER_STORY_REQUIREMENTS.md](EXAMPLE_USER_STORY_REQUIREMENTS.md) 提取 P0/P1 项，按组件族和根因拆成可独立验证的小批次，并优先修复会阻断示例体验或造成 React/Vue 明显不一致的问题。

**优先范围**：ImageCropper/CropUpload 可体验性，QRCode locale/refresh，Grid responsive，Splitter 示例空白与单位错误，Affix/Anchor 体验失效，Tabs/Tree/Alert/Progress/Modal/Drawer/Message/Notification 中文站 a11y/i18n，Form/Input/InputNumber/ColorPicker/Transfer/DatePicker/CronEditor/Upload/VirtualTable/Chart/Heatmap/MarkdownEditor/RichTextEditor/TaskBoard/useFormController 等 P1。

**允许修改**：对应 Example 页面、演示 fixture、本地示例资源、组件源码、locale/i18n、a11y 文案、生成器事实源和必要测试。

**不得修改**：与所选批次无关的组件行为、发布工作流门禁、旧迁移历史或 generated refs 的手写内容。

**完成验证**：每个批次至少复查对应 React/Vue hash route、记录浏览器操作路径，运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构时运行 `npx -y pnpm@11.9.0 example:build`；涉及源码/API 时补充 focused tests、`pnpm types:check`、`pnpm api:validate` 或对应 group validation。

**最近执行记录（2026-07-02）**：EX12-EX16 已完成，覆盖 AvatarGroup overflow、Splitter 单位文案、Watermark 图片水印、Descriptions 响应式列，以及 QRCode/Alert/Switch/Slider/Progress/Signature/InputNumber/Stepper/NumberKeyboard/InfiniteScroll/Loading/Skeleton/Table/Timeline 中文站文案与可访问名。为示例层中文覆写新增 InputNumber/Stepper `incrementAriaLabel` / `decrementAriaLabel` public props，API baseline 与 skill references 已重生成。验证已通过 focused tests、`types:check`、`api:validate`、`api:baseline`、`docs:api`、`example:sources:check`、`example:build`，并浏览器复查相关 React/Vue hash route。

### R30 Example P2/P3 体验补齐批次

**状态**：未开始，依赖 R29 至少完成首批 P0/P1。

**目标**：按同源主题补齐 P2/P3：示例可复制性、业务状态回显、移动端说明、本地 fixture、组合使用、文档示例和低风险文案 polish。

**完成验证**：按改动范围复查对应 Example route，并同步更新 [EXAMPLE_USER_STORY_REQUIREMENTS.md](EXAMPLE_USER_STORY_REQUIREMENTS.md) 中对应 E 组的完成状态、验证命令和剩余风险。

## 路线图维护验证

- 文档整理后运行 `npx -y pnpm@11.9.0 exec prettier --check docs/ROADMAP.md docs/EXAMPLE_USER_STORY_REQUIREMENTS.md`。
- 确认路线图仍包含 `type: active-roadmap`，避免 `release:check` 失效。
- 文档类改动至少运行 `git diff --check -- docs/ROADMAP.md docs/EXAMPLE_USER_STORY_REQUIREMENTS.md`。
- 合并或重写路线图后运行 `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md docs/EXAMPLE_USER_STORY_REQUIREMENTS.md`，确认没有冲突标记。
- Example 展示或代码来源变更后运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时同时运行 `npx -y pnpm@11.9.0 example:build`。
- 如 `corepack pnpm docs:api:check` 命中 ambient pnpm engine mismatch，可改用 `npx -y pnpm@11.9.0 docs:api:check` 复跑同一门禁。
