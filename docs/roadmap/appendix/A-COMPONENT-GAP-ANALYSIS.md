# 附录 A：竞品组件对标分析

<!-- LLM-INDEX
type: 竞品研究 / 组件缺口分析
scope: v0.5.0 - v1.0.0
对标库: Ant Design, Element Plus, shadcn/ui, Chakra UI, Radix UI, Naive UI
-->

## 1. 对标竞品

| 库名         | 框架             | 参考意义                   |
| ------------ | ---------------- | -------------------------- |
| Ant Design   | React            | 功能完整性、企业组件丰富度 |
| Element Plus | Vue 3            | Vue 3 生态参考             |
| shadcn/ui    | React + Tailwind | Tailwind 集成、极简哲学    |
| Chakra UI    | React            | 易用性、a11y、主题系统     |
| Radix UI     | React            | 无样式设计、a11y 标准      |
| Naive UI     | Vue 3            | Vue 3 完整性对标           |

---

## 2. 完整对标矩阵

### 2.1 基础组件

| 组件名    | Ant | Elem+ | shadcn | Chakra | Radix | Naive | Tigercat  | 分配版本 |
| --------- | --- | ----- | ------ | ------ | ----- | ----- | --------- | -------- |
| Button    | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Icon      | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Link      | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Text      | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Divider   | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Badge     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Avatar    | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Code      | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Tag       | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Space     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Flex/Grid | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Container | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Image     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |

### 2.2 表单组件

| 组件名       | Ant | Elem+ | shadcn | Chakra | Radix | Naive | Tigercat  | 分配版本   |
| ------------ | --- | ----- | ------ | ------ | ----- | ----- | --------- | ---------- |
| Form         | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -          |
| Input        | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -          |
| Textarea     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -          |
| Select       | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -          |
| Checkbox     | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -          |
| Radio        | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -          |
| Switch       | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -          |
| InputNumber  | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -          |
| Slider       | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -          |
| DatePicker   | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -          |
| TimePicker   | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -          |
| Upload       | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -          |
| Cascader     | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ❌        | **v0.6.0** |
| TreeSelect   | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ❌        | **v0.6.0** |
| AutoComplete | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ❌        | **v0.6.0** |
| Transfer     | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ❌        | **v0.6.0** |
| ColorPicker  | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ❌        | v0.6.0     |
| Rate         | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ❌        | v0.6.0     |
| Mentions     | ✅  | ✅    | ❌     | ❌     | ❌    | ✅    | ❌        | v0.7.0     |
| InputGroup   | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ❌        | v0.9.0     |

### 2.3 反馈组件

| 组件名       | Ant | Elem+ | shadcn | Chakra | Radix | Naive | Tigercat  | 分配版本 |
| ------------ | --- | ----- | ------ | ------ | ----- | ----- | --------- | -------- |
| Modal        | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Drawer       | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Popconfirm   | ✅  | ✅    | ❌     | ❌     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Popover      | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Tooltip      | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Message      | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Notification | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Toast        | ❌  | ❌    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Alert        | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Progress     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Loading/Spin | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Result       | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ❌        | v0.7.0   |
| Empty        | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ❌        | v0.7.0   |

### 2.4 导航组件

| 组件名     | Ant | Elem+ | shadcn | Chakra | Radix | Naive | Tigercat  | 分配版本 |
| ---------- | --- | ----- | ------ | ------ | ----- | ----- | --------- | -------- |
| Menu       | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Tabs       | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Breadcrumb | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Pagination | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Dropdown   | ✅  | ✅    | ✅     | ✅     | ✅    | ✅    | ✅ v0.4.3 | -        |
| Steps      | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Tree       | ✅  | ✅    | ❌     | ❌     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Anchor     | ✅  | ✅    | ✅     | ❌     | ❌    | ✅    | ✅ v0.4.3 | -        |
| BackTop    | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |

### 2.5 数据展示组件

| 组件名       | Ant | Elem+ | shadcn | Chakra | Radix | Naive | Tigercat  | 分配版本 |
| ------------ | --- | ----- | ------ | ------ | ----- | ----- | --------- | -------- |
| Table        | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| List         | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Card         | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Descriptions | ✅  | ✅    | ❌     | ❌     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Timeline     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Skeleton     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Calendar     | ✅  | ✅    | ✅     | ❌     | ❌    | ✅    | ❌        | v0.6.0   |
| Collapse     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Carousel     | ✅  | ✅    | ✅     | ✅     | ❌    | ✅    | ✅ v0.4.3 | -        |
| Statistic    | ✅  | ✅    | ❌     | ✅     | ❌    | ✅    | ❌        | v0.6.0   |

### 2.6 业务/高级组件

| 组件名         | Ant Pro | Elem+ | shadcn | Chakra | Tigercat | 分配版本 |
| -------------- | ------- | ----- | ------ | ------ | -------- | -------- |
| RichTextEditor | ✅      | ✅    | ❌     | ❌     | ❌       | v0.8.0   |
| CodeEditor     | ✅      | ✅    | ❌     | ❌     | ❌       | v0.8.0   |
| FileManager    | ❌      | ❌    | ❌     | ❌     | ❌       | v0.8.0   |
| Kanban         | ❌      | ❌    | ❌     | ❌     | ❌       | v0.8.0   |
| Splitter       | ✅      | ✅    | ✅     | ✅     | ❌       | v0.8.0   |
| VirtualList    | ✅      | ✅    | ❌     | ✅     | ❌       | v0.6.0   |

---

## 3. 缺失组件版本分配总表

| 组件名         | 优先级 | 分配版本   |
| -------------- | ------ | ---------- |
| Cascader       | **P0** | **v0.6.0** |
| TreeSelect     | **P0** | **v0.6.0** |
| AutoComplete   | **P0** | **v0.6.0** |
| Transfer       | **P0** | **v0.6.0** |
| VirtualList    | **P0** | **v0.6.0** |
| ColorPicker    | P1     | v0.6.0     |
| Rate           | P1     | v0.6.0     |
| Calendar       | P1     | v0.6.0     |
| Statistic      | P1     | v0.6.0     |
| Segmented      | P1     | v0.6.0     |
| Stepper        | P1     | v0.6.0     |
| Result         | **P0** | v0.7.0     |
| Empty          | **P0** | v0.7.0     |
| Mentions       | P1     | v0.7.0     |
| Watermark      | P1     | v0.7.0     |
| Tour           | P1     | v0.7.0     |
| FloatButton    | P1     | v0.7.0     |
| QRCode         | P2     | v0.7.0     |
| RichTextEditor | P0     | v0.8.0     |
| CodeEditor     | P0     | v0.8.0     |
| Splitter       | P0     | v0.8.0     |
| Resizable      | P1     | v0.8.0     |
| Kanban         | P1     | v0.8.0     |
| VirtualTable   | P1     | v0.8.0     |
| InfiniteScroll | P1     | v0.8.0     |
| FileManager    | P2     | v0.8.0     |
| InputGroup     | P1     | v0.9.0     |

> **注**：Collapse、Carousel、Anchor、BackTop 在 v0.4.3 中已实现。对标矩阵已更新以反映实际状态。
