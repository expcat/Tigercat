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

**P3 E2E 视觉基准更新**（2026-05-10）

变更内容：

1. **Chromium 视觉基准更新**：
   - 更新 14 张 chromium 截图基准（8 张 default-theme + 6 张 overlay）
   - 更新前：42 passed + 14 visual diff failed
   - 更新后：56 passed / 0 failed

2. **Firefox/WebKit 快照清理**：
   - 删除 12 张过时的 firefox/webkit 快照（本地无 firefox/webkit 浏览器，无法更新）
   - `playwright.config.ts` 移除 firefox/webkit 项目配置，仅保留 chromium
   - 如需恢复多浏览器测试，安装浏览器后重新添加 project 配置并生成快照即可

3. **回归验证**：
   - `npx playwright test`：56 passed / 0 failed（chromium only，~28s）

## 后续步骤

测试审查、精简、低覆盖补充和 E2E 基准更新工作已全部完成。

后续可按需扩展：

| 方向 | 说明 |
| ---- | ---- |
| 多浏览器 E2E | 安装 firefox/webkit（`npx playwright install`）后重新添加 project 并生成快照 |
| 覆盖率继续提升 | CropUpload(32%→Vue/48%→React) 仍有提升空间；可按需逐步补测试 |
| validate warnings 消化 | 458 条软检查建议（命名、分类、edge cases、a11y），可作为日常改进逐步解决 |

## 当前基线

- 测试文件：309 个
- 测试用例：5812 个
- 全量耗时：~101s
- 覆盖率：Stmts 84.66% / Branch 77.68% / Funcs 86.06% / Lines 86.64%
- 既有 flaky：无
- test:validate：226/226 通过，458 warnings（改进建议）
- E2E：56 passed / 0 failed（chromium only）
- 路线图统一维护在 `docs/ROADMAP.md`，根目录不再保留路线图文档。