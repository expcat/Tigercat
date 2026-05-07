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

**P1 测试工具整理 — 共享 mock/scheduler 提取**（2026-05-08）

变更内容：

1. **新增 `tests/utils/mock-observers.ts`**：提取 `MockResizeObserver`（含 callback + trigger 全功能版）和 `MockIntersectionObserver`，替代 4 个文件中的 4 个 `MockResizeObserver` 内联定义 + 2 个文件中的 `MockIntersectionObserver` 内联定义。
2. **新增 `tests/utils/frame-scheduler.ts`**：提取 `createFrameScheduler()`（DI 模式，requestFrame/cancelFrame，flush ALL）和 `installFrameScheduler()`（global stub 模式，requestAnimationFrame/cancelAnimationFrame，flush ALL），替代 11 个文件中的内联定义。
3. **更新 `tests/utils/index.ts`**：统一导出新模块。
4. **修改文件清单**（11 个 spec 文件）：
   - Observers：`Affix.spec.ts`、`Affix.spec.tsx`、`ChartSubComponents.spec.ts`、`ChartSubComponents.spec.tsx`
   - installFrameScheduler：`useChartInteraction.spec.ts`、`useChartInteraction.spec.tsx`
   - createFrameScheduler：`back-top-utils.spec.ts`、`chart-interaction.spec.ts`、`carousel-utils.spec.ts`、`chart-resize-utils.spec.ts`、`notification-utils.spec.ts`、`watermark-utils.spec.ts`、`repeat-action-utils.spec.ts`

未处理：`collapse-utils`/`menu-utils`/`statistic-utils` 及 Vue/React Collapse/Statistic 中的 `createFrameScheduler` 采用 flush-ONE-by-frame-ID 语义，与共享版 flush-ALL 不兼容，保留内联。

验证结果：
- 精简后：308 文件（+2 新增 helper）/ 5729 用例 / ~108s
- 失败：0
- 样板代码净减少：~300 行（18 个内联定义 → 2 个共享模块，其中 11 个已替换、7 个保留）

## 后续步骤

| 优先级 | 项目 | 范围 | 完成标准 | 状态 |
| ------ | ---- | ---- | -------- | ---- |
| P2 | 回归与覆盖校验 | Vitest、Playwright、覆盖率报告 | 精简后完整测试通过；覆盖率无明显下降 | ⬜ 未开始 |
| P2 | 清单与文档同步 | `tests/*CHECKLIST*.md`、`tests/README.md` | 测试清单与实际策略一致 | ⬜ 未开始 |

## 下一步推荐

开始 **P2 回归与覆盖校验**：

1. 运行 `pnpm test -- --coverage` 生成覆盖率报告，与精简前基线对比。
2. 运行 `pnpm build` + `npx playwright test` 验证 E2E 仍通过。
3. 运行 `pnpm test:validate` 确认测试结构完整性。
4. 如覆盖率有明显下降，定位缺失覆盖点并补充。

## 当前基线

- 测试文件：308 个（含 2 个新增 helper 和 2 个 .template）
- 测试用例：5729 个
- 全量耗时：~108s
- 既有 flaky：无
- 路线图统一维护在 `docs/ROADMAP.md`，根目录不再保留路线图文档。