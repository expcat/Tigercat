# Phase 1B — Core Utils 治理（已完成）

> 2026-05-04 完成全部 5 项任务。

| 任务                 | 优先级 | 状态 | 结果                                                                                                                           |
| -------------------- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| 精简/治理根 barrel   | P1     | Done | `utils/index.ts` 新增推荐导入文档注释；animation/transition 改由 `motion/` 统一转发；barrel 层级已清理                        |
| 抽基础 Props 类型    | P1     | Done | 新增 `types/base.ts`：`ComponentSize`、`BaseInteractiveProps`、`BaseFormControlProps<T>`、`BaseLayoutProps`；已从 types/ 导出 |
| 合并 motion 工具目录 | P2     | Done | 新建 `utils/motion/index.ts`，统一导出 `animation.ts` + `transition.ts`；`utils/index.ts` 改用 `motion/` 转发                 |
| 细分 helpers 目录    | P2     | Done | `helpers/index.ts` 按 Class / DOM / Motion / Component 四组重新分类，保留兼容性 re-export                                    |
| 死代码扫描           | P2     | Done | knip 扫描：core 仅 4 个未消费导出（均为有意保留的公共 API）；React 1 个（`useFocusTrap`）；无需移除                           |
