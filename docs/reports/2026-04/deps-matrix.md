# Phase 1A — 剩余依赖与工具链任务

> 本页只保留仍未完成的依赖与工具链任务。

| 任务                        | 状态     | 完成标准                                                                                     |
| --------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| commander 14                | Deferred | 根 `engines.node` 提升到 Node 20+ 后再升级 CLI，并跑模板生成回归                             |
| Node engines bump           | Pending  | 评估根包、packages、examples、CI、发布 workflow 的 Node 20+ 影响                             |
| workspace catalog/overrides | Pending  | 在 `pnpm-workspace.yaml` 增加 catalog 或 overrides，统一 Vue/React/TS/Tailwind/tsup 版本来源 |
| CLI 模板依赖范围            | Pending  | 模板 `package.json` 仍写固定范围；切到 catalog 或与根 lockfile 对齐的版本策略                |
