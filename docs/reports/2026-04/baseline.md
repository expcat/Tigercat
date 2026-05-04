# Phase 0 — 剩余基线任务

> 本页只保留仍需重新建立或补齐的基线。

| 任务                 | 完成标准                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 刷新覆盖率基线       | 运行 `pnpm test:coverage`，用当前代码生成新的覆盖率摘要；旧 [coverage-baseline.json](coverage-baseline.json) 只作为历史输入 |
| 刷新体积基线         | 运行 `pnpm size:check`，记录 sideEffects 修复后的当前 gzip size 与 limit 余量                                               |
| 补 lint / bench 基线 | 运行 `pnpm lint` 与 `pnpm bench`，为剩余性能优化建立对照值                                                                  |
| 同步外部全局 SKILL   | 用户全局 skill 若仍写旧组件数量，需要另行同步                                                                               |
