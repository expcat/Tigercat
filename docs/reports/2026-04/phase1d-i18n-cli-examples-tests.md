# Phase 1D-G — i18n / CLI / Examples / Tests 剩余任务

> 本页只保留仍未完成的 i18n、CLI、examples 与测试任务。

## i18n

| 任务                            | 优先级 | 状态               | 完成标准 / 结果                                                                                                                                                                                                                  |
| ------------------------------- | ------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 根入口 locale tree-shaking 方案 | P1     | Pending            | 当前根入口仍会经 `utils/i18n` re-export 全部 locale；需决定是否保留兼容 barrel，或引入更轻的 locale-only 默认导出策略                                                                                                            |
| `defineLocale`                  | P2     | ✅ Done 2026-05-04 | 新增 `packages/core/src/utils/i18n/define-locale.ts`：`defineLocale(partial)` 在 `enUS` 基线上深度合并，跳过 `undefined`、保留 `null`、不变更源；从 `@expcat/tigercat-core` 导出；新增 8 用例全通过；core CJS/ESM/DTS 构建均通过 |
| ConfigProvider 异步 locale      | P2     | Pending            | Vue/React 支持 `locale={() => import(...)}` 或等价 loader，并处理 loading/error/fallback                                                                                                                                         |

## CLI

| 任务                     | 优先级   | 完成标准                                                    |
| ------------------------ | -------- | ----------------------------------------------------------- |
| commander 14             | Deferred | Node 20+ 工具链就绪后升级并补 CLI 回归                      |
| Windows `.cmd` shim 验证 | P1       | 在 README 或测试中覆盖 pnpm/npm/bun 的 Windows bin 路径行为 |
| 模板版本策略             | P1       | 模板依赖范围改为 catalog/lockfile 对齐策略，避免长期漂移    |
| `tigercat doctor`        | P2       | 检查 Tailwind 版本、peer deps、Node/pnpm 与模板兼容性       |
| CLI Windows 路径测试     | P1       | `tests/core/cli.spec.ts` 覆盖路径分隔符和 bin 调用边界      |

## Examples / Tests

| 任务             | 优先级 | 完成标准                                                                         |
| ---------------- | ------ | -------------------------------------------------------------------------------- |
| lazy route       | P1     | Vue 使用 `defineAsyncComponent`、React 使用 `React.lazy`，降低 examples 首屏负担 |
| 刷新覆盖率       | P0     | 重新生成当前覆盖率报告，替换旧 baseline 的执行判断                               |
| a11y 扫描扩展    | P1     | 交互组件至少有一条 axe 回归；overlay 与 form 类优先                              |
| modern 样式测试  | P1     | 覆盖 `data-tiger-style="modern"` 对关键组件的 token/class 触发                   |
| sideEffects 回归 | P1     | Message/Notification imperative API mount 后 DOM 结果不被 tree-shaking 破坏      |
| 视觉回归         | P2     | Playwright 对 Modal/Drawer/Popover 做跨浏览器截图对比                            |
| benchmark 场景   | P2     | `benchmarks/core-utils.bench.ts` 增加 chart-utils 与 virtual-list-utils 场景     |
