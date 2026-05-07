# Tigercat 后续优化路线图

<!-- LLM-INDEX
type: active-roadmap
scope: test audit and refinement work
verified-date: 2026-05-10
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

**P3 低覆盖组件补充**（2026-05-10）

变更内容：

1. **新增测试文件**：
   - `tests/vue/useDrag.spec.ts`：29 个测试（从 0% 覆盖新建），覆盖 startDrag/dragOver/drop/endDrag/reorder/moveBetween/getDragItemAttrs/getDropZoneAttrs

2. **增强现有测试**：
   - `tests/vue/Resizable.spec.ts`：新增 mouse interaction、min/max constraints、axis、aspect ratio、custom style 测试（28 tests）
   - `tests/react/Resizable.spec.tsx`：新增 min/max、axis、aspect ratio、custom style、resize callbacks 测试（29 tests）
   - `tests/vue/Mentions.spec.ts`：新增 keyboard navigation（ArrowDown/Up）、Enter selection、Escape close、click selection、filtering、custom prefix 测试（17 tests）
   - `tests/react/Mentions.spec.tsx`：新增 keyboard navigation、Enter/Escape、click selection、filtering、custom prefix、disabled options 测试（18 tests）
   - `tests/vue/Slider.spec.ts`：新增 mouse interaction、tooltip hover、range keyboard constraints、ARIA labels、track click 测试（61 tests）
   - `tests/vue/TaskBoard.spec.ts`：新增 filter/visibility、card count、add column、column description 测试（32 tests）
   - `tests/react/TaskBoard.spec.tsx`：新增 filter/visibility、card count、add column、column description 测试（39 tests）

3. **覆盖率提升**（v8 / threads pool）：
   - **All files**: Stmts 84.07% → 84.66% (+0.59%) | Branch 77.26% → 77.68% (+0.42%) | Funcs 85.54% → 86.06% (+0.52%) | Lines 86.07% → 86.64% (+0.57%)
   - useDrag composable: 0% → 85.36% Stmts / 96.15% Branch / 72.22% Funcs

4. **回归验证**：
   - `pnpm test`：309 文件 / 5812 用例 / 0 失败
   - `pnpm test:validate`：226/226 通过，458 warnings

## 后续步骤

| 优先级 | 项目 | 范围 | 说明 |
| ------ | ---- | ---- | ---- |
| P3 | E2E 视觉基准更新 | `e2e/*.spec.ts-snapshots/` | 更新本地截图基准，消除 14 个 visual diff 失败 |

## 当前基线

- 测试文件：309 个
- 测试用例：5812 个
- 全量耗时：~101s
- 覆盖率：Stmts 84.66% / Branch 77.68% / Funcs 86.06% / Lines 86.64%
- 既有 flaky：无
- test:validate：226/226 通过，458 warnings（改进建议）
- E2E visual：14 截图 diff（环境差异，非回归）
- 路线图统一维护在 `docs/ROADMAP.md`，根目录不再保留路线图文档。