# 01 共性根因

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [共性根因](01-shared-root-causes.md) · [波次](14-waves.md) · [证据](13-evidence.md)

同一个根因在很多组件的报告里重复出现。这里把它们收成 2 个任务（S12–S13），共 24 条发现，全部排在 W0。修一处，再按并入清单逐个组件验，不在各组件里分别打补丁。

## 目标

- 每个根因只改一处源头：生成器、Core helper，或两端共用的写法。
- 并入清单里的组件全部验过才算做完。

## 非目标

- 不在这一波处理各组件自己的条目，那些在 02–12。
- 不手改生成物。

## 依赖与顺序

- 「并入」的意思是那份组件报告确认了同一个问题。清单来自各报告的归并记录，个别组件只是部分适用，以报告原文为准。

## 总表

| 任务 | 根因                                    | 主发现                                | 波及组件数 |
| ---- | --------------------------------------- | ------------------------------------- | ---------- |
| S12  | Vue 动态 class 停在初始值               | C089-F01                              | 6          |
| S13  | Vue 手写导出的 Props 类型与运行时不一致 | C022-F03、C034-F04、C048-F02 等 23 条 | 23         |

## S12 Vue 动态 class 停在初始值

**现状。** `setup` 里保存了第一次的 `attrs.class`，computed 一直合并旧值，render 又把当前 class 剔掉。

**做法。** 每次 render 读当前 `attrs.class`，再用现有 helper 合并。

**做完的标准。** 见下表；ContextMenuMenu、ContextMenuSub、Dropdown、DropdownItem、DropdownMenu 同样通过。

| 编号     | 级别 | 波次 | 端  | 类别 | 条目                        | 验收                                                                   |
| -------- | ---- | ---- | --- | ---- | --------------------------- | ---------------------------------------------------------------------- |
| C089-F01 | P2   | W0   | Vue | 行为 | Vue 的动态 class 保留初始值 | Item 的 class 由 attr-before 改为 attr-after 后，DOM 类名为 attr-after |

并入的组件（5）：ContextMenuMenu、ContextMenuSub、Dropdown、DropdownItem、DropdownMenu。

## S13 Vue 手写导出的 Props 类型与运行时不一致

**现状。** Vue 组件的运行时 props 和导出的 `Vue*Props` 接口是两份手写声明。运行时加了字段，接口没跟上；也有接口还留着已删除的字段，或者把 Core 的类型收窄了。

**做法。** 逐个补齐只是止血。同一批加一道能发现漂移的检查（类型测试或 API 基线），形式开工时定；不新增第二套 Props 类型。

**做完的标准。** 下表每条通过；新加的检查在任一接口少字段时失败。

| 编号     | 级别 | 波次 | 端       | 类别 | 条目                                                            | 验收                                                                                               |
| -------- | ---- | ---- | -------- | ---- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| C022-F03 | P2   | W0   | Vue      | 类型 | Vue keys 类型拒绝 Core/React 支持的只读数组                     | ['Ctrl','K'] as const 赋给 VueKbdProps 与 Vue 组件 $props 不再报 TS2322                            |
| C034-F04 | P2   | W0   | Vue      | 类型 | VueCardProps 缺少已支持的 titleLevel                            | const props: VueCardProps = { titleLevel: 4 } 不再报 TS2353                                        |
| C048-F02 | P2   | W0   | Vue      | 类型 | Vue 公开 Props 类型遗漏运行时支持的 collapsible                 | const props: VueSidebarProps = { collapsible: true } 通过类型检查，不再报 TS2561                   |
| C050-F02 | P2   | W0   | Vue      | 类型 | VueSpaceProps 遗漏运行时公开支持的三个字段                      | 用 VueSpaceProps 声明含 split、className 或 style 的对象不再报 TS2353                              |
| C051-F03 | P2   | W0   | Vue      | 类型 | VueSplitterProps 漏掉运行时支持的 collapsible                   | const vueProps: VueSplitterProps = { collapsible: true } 不再报 TS2353                             |
| C060-F04 | P3   | W0   | Vue      | 类型 | VueFormProps 漏导出 showErrorSummary 类型                       | 公开导出的 VueFormProps 含可选 showErrorSummary 字段，TypeScript 消费者可从该接口获得              |
| C061-F05 | P3   | W0   | Vue      | 类型 | VueFormItemProps 漏导出 disabled                                | 导出的 VueFormItemProps 接口含可选 disabled 字段                                                   |
| C072-F02 | P2   | W0   | Vue      | 类型 | Vue 导出的 VueSelectProps 缺少三个已实现的公开字段              | 从包入口引入 VueSelectProps 可表达 maxCount、readOnly、optionFields 三个字段且类型检查通过         |
| C074-F04 | P2   | W0   | Vue      | 类型 | VueSliderProps 漏掉四个已实现的公开字段                         | 显式 VueSliderProps 可表达 readOnly、pushApart、showRange、formatTooltip                           |
| C080-F03 | P2   | W0   | Vue      | 类型 | Vue 导出 Props 仍声明已经移除的 height                          | VueTreeSelectProps/TreeSelectProps 不再声明 height；listHeight=80 时 tree 内联 maxHeight 仍为 80px |
| C086-F03 | P2   | W0   | Vue      | 类型 | Vue 公开 BreadcrumbProps 缺少 runtime 已支持的 locale/labels    | 用 VueBreadcrumbProps 声明带 locale、labels 的对象时不再触发超额属性检查                           |
| C088-F05 | P2   | W0   | Vue      | 类型 | Vue 公开 ContextMenuProps 没有覆盖 runtime 的 items             | 用 VueContextMenuProps 或 ContextMenuProps 声明含 items 的配置对象时类型检查通过                   |
| C095-F02 | P2   | W0   | Vue      | 类型 | Vue 导出 FloatButtonProps 漏掉运行时 href 与 badge              | 以 Vue FloatButtonProps 类型声明含 href 与 badge 的对象可通过类型检查                              |
| C109-F06 | P3   | W0   | Vue      | 类型 | 导出的 VuePaginationProps 缺少运行时已有的两个 prop             | 导出的 VuePaginationProps 含 ellipsisJump 与 itemRender，传这两项能过类型检查                      |
| C112-F01 | P3   | W0   | Vue      | 类型 | Vue 导出的 StepsProps 少了三个运行时 prop                       | 按 Vue 包导出的 StepsProps 标注含 progressDot: true、locale、labels 的对象时类型检查不报错         |
| C113-F01 | P3   | W0   | Vue      | 类型 | Vue 导出的 StepsItemProps 少了 stepIndex 和 isLast              | 按 Vue 包导出的 StepsItemProps 标注含 stepIndex、isLast 的对象时类型检查不报错                     |
| C114-F04 | P3   | W0   | Vue      | 类型 | Vue 导出的 TabsProps 少了 locale 和 labels                      | 按 Vue 包导出的 TabsProps 标注含 locale、labels 的对象时类型检查不报错                             |
| C116-F05 | P3   | W0   | Vue      | 类型 | Vue 导出的 TreeProps 没有 expandOnClick                         | 按 Vue 包导出的 TreeProps 标注含 expandOnClick 的对象时类型检查不报错                              |
| C118-F04 | P3   | W0   | Vue      | 类型 | Vue 导出的 DrawerProps 没有 resizable                           | 用导出的 Vue DrawerProps 注解含 resizable: true 的 props 对象不再报类型错误                        |
| C124-F03 | P3   | W0   | Vue      | 类型 | 导出的 VueModalProps 没有运行时存在的 showCancel                | 用导出的 Vue ModalProps 注解含 showCancel: false 的 props 对象不再报类型错误                       |
| C127-F01 | P3   | W0   | Vue+Core | 类型 | Vue 导出类型漏了运行时 prop                                     | 导出的 Vue PopoverProps 接受这四个字段；重新生成的 props 计数含 closeOnScroll                      |
| C129-F01 | P3   | W0   | Vue      | 类型 | Vue 导出的 TooltipProps 漏了运行时存在的 showDelay 和 hideDelay | 用导出的 Vue TooltipProps 注解含 showDelay、hideDelay 的对象不再报类型错误                         |
| C135-F03 | P3   | W0   | Vue      | 类型 | Vue 导出类型缺 customExport                                     | 从 Vue 包入口导入的 VueDataExportProps 含 customExport，与运行时和 React 一致                      |
