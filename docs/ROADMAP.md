# Tigercat 后续优化路线图

<!-- LLM-INDEX
type: active-roadmap
scope: test audit and refinement work
verified-date: 2026-05-08
source: user-requested test suite optimization plan
-->

本文档只记录下一轮可执行规划。已完成的历史任务、阶段报告说明和旧评估结论不再保留；后续 Agent 完成条目后，应直接删除对应条目或将剩余工作合并到新的待办中。

## 执行原则

1. 以 `tests/core`、`tests/vue`、`tests/react`、`tests/utils` 和 `e2e` 为测试审查范围；必要时同步检查 `vitest.config.ts`、`playwright.config.ts` 与测试清单。
2. 优先保留能覆盖公共 API、跨框架一致性、a11y、交互边界、回归风险和真实用户路径的测试。
3. 对重复断言、仅验证实现细节、低价值快照、过度拆分的同质用例，优先合并为参数化测试或删除。
4. 测试精简必须保持语义覆盖清晰；删除或合并前记录被替代的覆盖点，避免用测试数量下降换取风险上升。
5. 每批调整后运行对应分组测试；跨目录改动后运行 `pnpm test` 或等价完整回归，并记录剩余风险。

## 上次完成

**P1 测试合并与精简 — Charts/Table/Form/Overlay/Image/Drag 热区审查 + ButtonSpinnerLazy 修复**（2026-05-08）

变更内容：

1. **Charts 热区第二批审查**：Vue/React `useChartInteraction` 中 `createLegendItems`（label 提取逻辑：x/label/index fallback + 自定义 formatter）和 `wrapperClasses`（框架特有布局类）与 Core `buildChartLegendItems` 不构成语义重复，保留不动。
2. **Table 热区审查**：Core 5 文件（39 tests，纯函数：filter/export/group/resize/rowKey）与 Vue/React Table/DataTableWithToolbar/VirtualTable（59+6+29 = 94 tests/框架，组件渲染/交互/a11y）分属不同测试层面，无冗余可删。
3. **Form/Overlay/Image/Drag 热区审查**：Core 测工具函数（form-validation 54、image-utils 48、drag 58 等），Vue/React 测组件行为，各自独立无重叠。
4. **修复 ButtonSpinnerLazy flaky tests**：`vi.mock` 中用轻量直接 stub 替代 `vi.importActual('@expcat/tigercat-core')`（加载整个 core 包导致 worker 超时），消除 3 个 timeout 失败。

验证结果：
- 精简后：308 文件 / 5729 用例 / ~119s
- 失败：0（ButtonSpinnerLazy 3 timeout 已修复）
- 文件变更：1（ButtonSpinnerLazy.spec.tsx mock 重写）

## 后续步骤

| 优先级 | 项目 | 范围 | 完成标准 | 状态 |
| ------ | ---- | ---- | -------- | ---- |
| P1 | 测试工具整理 | `tests/utils`、重复 mock、render helper | 抽取或复用统一 helper，减少样板代码 | ⬜ 未开始 |
| P2 | 回归与覆盖校验 | Vitest、Playwright、覆盖率报告 | 精简后完整测试通过；覆盖率无明显下降 | ⬜ 未开始 |
| P2 | 清单与文档同步 | `tests/*CHECKLIST*.md`、`tests/README.md` | 测试清单与实际策略一致 | ⬜ 未开始 |

## 下一步推荐

开始 **P1 测试工具整理**：

1. 审查 `tests/utils/` 目录中所有 helper 文件，识别重复的 mock 模式（如 MockResizeObserver、installFrameScheduler 等在多个 spec 文件中重复定义）。
2. 将高频 mock/helper 提升到 `tests/utils/` 统一导出，删除各 spec 文件中的内联重复定义。
3. 审查 Vue/React render helper（`render-helpers.ts` / `render-helpers-react.ts`）是否有可进一步精简的样板。
4. 每组改完后运行 `pnpm test` 验证。

## 当前基线

- 测试文件：308 个（Core 83 / Vue 114 / React 115 / E2E 5）（含 2 个 .template）
- 测试用例：5729 个
- 全量耗时：~119s
- 既有 flaky：无
- 路线图统一维护在 `docs/ROADMAP.md`，根目录不再保留路线图文档。