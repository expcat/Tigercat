# Phase 1B — Core Utils 剩余任务

> 本页只保留仍未完成的 core utils 治理任务。

| 任务                 | 优先级 | 完成标准                                                                                                    |
| -------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| 精简/治理根 barrel   | P1     | 扫描 vue/react 实际使用符号，减少新增根级 `export *`；文档明确推荐分组子路径导入                            |
| 抽基础 Props 类型    | P1     | 在 core 提供 `BaseInteractiveProps`、`BaseFormControlProps`、`BaseLayoutProps`，逐步让 Vue/React props 继承 |
| 合并 motion 工具目录 | P2     | 将 `animation.ts` / `transition.ts` 收敛到 `utils/motion/`，并规划 Vue/React motion helper                  |
| 细分 helpers 目录    | P2     | 将 helpers 按 dom/class/motion 等职责拆分，保留兼容 re-export                                               |
| 死代码扫描           | P2     | 运行 `knip` / `ts-prune` 或等价工具，确认并移除未被消费的旧 helper                                          |
