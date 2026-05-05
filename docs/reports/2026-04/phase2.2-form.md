# Phase 2.2 — Form 组件剩余任务

> 2026-05-05 执行：完成 picker-utils 二期。`picker-utils` 现在提供启用项初始定位、Arrow/Home/End 导航、combobox/listbox/option ARIA props 与触发器按键动作归一化；AutoComplete / Cascader / TreeSelect / Transfer 的 Vue 与 React 实现已接入共享键盘/ARIA 逻辑，AutoComplete 补充首项禁用时键盘选择首个启用项的回归测试。

> 2026-05-05 执行：完成 Form 校验复杂度。Form context 新增按字段索引的错误 map，FormItem 不再对共享 errors 数组逐项线性扫描；单字段 validateField 保持只解析/执行目标字段规则，并新增 Vue / React 多字段回归测试验证不会触发全表规则遍历。

> 本页只保留 Form 组件仍未完成的优化项。

| 任务                       | 对应组件 / 范围                                 | 优先级 | 状态 | 完成标准                                                                  |
| -------------------------- | ----------------------------------------------- | ------ | ---- | ------------------------------------------------------------------------- |
| Form 校验复杂度            | Form / FormItem                                 | P1     | Done | 验证 item validate 不触发 O(N²) 全量遍历；必要时加入索引或依赖图缓存      |
| picker-utils 二期          | AutoComplete / Cascader / TreeSelect / Transfer | P1     | Done | 按各自交互语义复用键盘、过滤、ARIA 公共逻辑                               |
| Radio / Checkbox icon 体积 | Radio / Checkbox                                | P2     | Todo | 评估 CSS mask 替代 inline SVG 的收益和兼容性                              |
| Form 命令式 API            | Form                                            | P2     | Todo | 设计 `useFormController` / `useTigerForm`，明确与现有 Form API 的兼容关系 |
