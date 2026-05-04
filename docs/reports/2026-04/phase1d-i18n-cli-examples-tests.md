# Phase 1D-G — i18n / CLI / Examples / Tests 剩余任务

> 本页只保留仍未完成的 i18n、CLI、examples 与测试任务。

## i18n

| 任务                            | 优先级 | 状态               | 完成标准 / 结果                                                                                                                                                                                                                  |
| ------------------------------- | ------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 根入口 locale tree-shaking 方案 | P1     | Pending            | 当前根入口仍会经 `utils/i18n` re-export 全部 locale；需决定是否保留兼容 barrel，或引入更轻的 locale-only 默认导出策略                                                                                                            |
| `defineLocale`                  | P2     | ✅ Done 2026-05-04 | 新增 `packages/core/src/utils/i18n/define-locale.ts`：`defineLocale(partial)` 在 `enUS` 基线上深度合并，跳过 `undefined`、保留 `null`、不变更源；从 `@expcat/tigercat-core` 导出；新增 8 用例全通过；core CJS/ESM/DTS 构建均通过 |
| ConfigProvider 异步 locale      | P2     | Pending            | Vue/React 支持 `locale={() => import(...)}` 或等价 loader，并处理 loading/error/fallback                                                                                                                                         |

## CLI

| 任务                     | 优先级   | 状态               | 完成标准 / 结果                                                                                                                                                                         |
| ------------------------ | -------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| commander 14             | Deferred | Deferred           | Node 20+ 工具链就绪后升级并补 CLI 回归                                                                                                                                                  |
| Windows `.cmd` shim 验证 | P1       | Pending            | 在 README 或测试中覆盖 pnpm/npm/bun 的 Windows bin 路径行为                                                                                                                             |
| 模板版本策略             | P1       | Pending            | 模板依赖范围改为 catalog/lockfile 对齐策略，避免长期漂移                                                                                                                                |
| `tigercat doctor`        | P2       | ✅ Done 2026-05-04 | 新增 `packages/cli/src/commands/doctor.ts`，检查 `package.json`、Node、pnpm、Tailwind 4、Tigercat peer deps 与模板依赖；修正 CLI package 入口指向实际 tsup 产物；CLI 聚焦测试与构建通过 |
| CLI Windows 路径测试     | P1       | Pending            | `tests/core/cli.spec.ts` 覆盖路径分隔符和 bin 调用边界                                                                                                                                  |

## Examples / Tests

| 任务             | 优先级 | 状态               | 完成标准 / 结果                                                                                                                                                           |
| ---------------- | ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lazy route       | P1     | ✅ Done 2026-05-04 | React `Home` 与所有 demo 页均使用 `React.lazy`；Vue `Home` 与所有 demo 页均通过 `defineAsyncComponent` 懒加载；新增静态回归测试；React/Vue example build 通过             |
| 刷新覆盖率       | P0     | ✅ Done 2026-05-04 | 重新生成当前覆盖率报告，替换旧 baseline 的执行判断                                                                                                                        |
| a11y 扫描扩展    | P1     | ✅ Done 2026-05-04 | 新增 `tests/core/a11y-interactive-regression.spec.tsx`：React/Vue Modal 打开态与 Form 校验错误态均跑 axe；修复 FormItem wrapper `aria-required` 非法下发                  |
| modern 样式测试  | P1     | ✅ Done 2026-05-04 | 新增 `tests/core/modern-style-components.spec.tsx`：React/Vue Button、Input、Card 在 `data-tiger-style="modern"` 子树内验证 token 翻转与 class 变量消费                   |
| sideEffects 回归 | P1     | ✅ Done 2026-05-04 | 新增 `tests/core/imperative-side-effects.spec.ts`：校验 React/Vue package `sideEffects` 保留 chunk/components 产物，并从包根入口调用 Message/Notification 后验证 DOM 挂载 |
| 视觉回归         | P2     | Pending            | Playwright 对 Modal/Drawer/Popover 做跨浏览器截图对比                                                                                                                     |
| benchmark 场景   | P2     | ✅ Done 2026-05-04 | `benchmarks/core-utils.bench.ts` 增加 chart extent/ticks、Pie arc cache、Line/Area/Radar path 与 VirtualList range 场景；`vitest bench` 验证通过                          |
