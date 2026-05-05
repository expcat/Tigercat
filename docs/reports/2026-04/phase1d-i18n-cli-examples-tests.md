# Phase 1D-G — i18n / CLI / Examples / Tests 剩余任务

> 本页只保留仍未完成的 i18n、CLI、examples 与测试任务。

## i18n

| 任务                            | 对应组件 / 范围                           | 优先级 | 状态    | 完成标准                                                                                                              |
| ------------------------------- | ----------------------------------------- | ------ | ------- | --------------------------------------------------------------------------------------------------------------------- |
| 根入口 locale tree-shaking 方案 | Core i18n barrel / locale presets         | P1     | Pending | 当前根入口仍会经 `utils/i18n` re-export 全部 locale；需决定是否保留兼容 barrel，或引入更轻的 locale-only 默认导出策略 |
| ConfigProvider 异步 locale      | React ConfigProvider / Vue ConfigProvider | P2     | Pending | Vue/React 支持 `locale={() => import(...)}` 或等价 loader，并处理 loading/error/fallback                              |

## CLI

| 任务                     | 对应组件 / 范围                    | 优先级   | 状态     | 完成标准                                                    |
| ------------------------ | ---------------------------------- | -------- | -------- | ----------------------------------------------------------- |
| commander 14             | CLI                                | Deferred | Deferred | Node 20+ 工具链就绪后升级并补 CLI 回归                      |
| Windows `.cmd` shim 验证 | CLI bin / package manager shims    | P1       | Pending  | 在 README 或测试中覆盖 pnpm/npm/bun 的 Windows bin 路径行为 |
| 模板版本策略             | CLI React/Vue 模板                 | P1       | Pending  | 模板依赖范围改为 catalog/lockfile 对齐策略，避免长期漂移    |
| CLI Windows 路径测试     | CLI bin / `tests/core/cli.spec.ts` | P1       | Pending  | `tests/core/cli.spec.ts` 覆盖路径分隔符和 bin 调用边界      |
