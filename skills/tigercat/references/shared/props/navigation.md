---
name: tigercat-shared-props-navigation
description: Shared props definitions for navigation components - Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree
---

# Navigation Components - Props Reference

共享 Props 定义。

---

## Breadcrumb 面包屑

### Props

| Prop      | Type                                 | Default | Vue | React | Description |
| --------- | ------------------------------------ | ------- | :-: | :---: | ----------- |
| items     | `{ label: string, href?: string }[]` | `[]`    |  ✓  |   ✓   | 层级数据    |
| separator | `string`                             | `'/'`   |  ✓  |   ✓   | 分隔符      |

---

## Dropdown 下拉菜单

### Props

| Prop      | Type                                         | Default          | Vue | React | Description |
| --------- | -------------------------------------------- | ---------------- | :-: | :---: | ----------- |
| items     | `DropdownItem[]`                             | `[]`             |  ✓  |   ✓   | 菜单项      |
| trigger   | `'hover' \| 'click'`                         | `'hover'`        |  ✓  |   ✓   | 触发方式    |
| placement | `'bottom-start' \| 'bottom' \| 'bottom-end'` | `'bottom-start'` |  ✓  |   ✓   | 弹出位置    |
| disabled  | `boolean`                                    | `false`          |  ✓  |   ✓   | 禁用        |

### Events

| Vue Event | React Callback | Payload       | Description |
| --------- | -------------- | ------------- | ----------- |
| `@select` | `onSelect`     | `key: string` | 选中事件    |

---

## Menu 菜单

### Props

| Prop      | Type                         | Default      | Vue | React | Description |
| --------- | ---------------------------- | ------------ | :-: | :---: | ----------- |
| activeKey | `string`                     | -            |  ✓  |   ✓   | 当前选中项  |
| items     | `MenuItem[]`                 | `[]`         |  ✓  |   ✓   | 菜单数据    |
| mode      | `'vertical' \| 'horizontal'` | `'vertical'` |  ✓  |   ✓   | 模式        |
| collapsed | `boolean`                    | `false`      |  ✓  |   ✓   | 折叠状态    |

> **Vue**: 使用 `v-model:active-key` 绑定
> **React**: 使用 `activeKey` + `onChange` 控制

### Events

| Vue Event            | React Callback | Payload       | Description    |
| -------------------- | -------------- | ------------- | -------------- |
| `@select`            | `onSelect`     | `key: string` | 选中事件       |
| `@update:active-key` | `onChange`     | `key: string` | activeKey 变更 |

---

## Tabs 标签页

### Props

| Prop       | Type                                                   | Default  | Vue | React | Description            |
| ---------- | ------------------------------------------------------ | -------- | :-: | :---: | ---------------------- |
| modelValue | `string`                                               | -        |  ✓  |   -   | 当前激活 key (v-model) |
| activeKey  | `string`                                               | -        |  -  |   ✓   | 当前激活 key           |
| items      | `{ key: string, label: string, disabled?: boolean }[]` | `[]`     |  ✓  |   ✓   | 标签项                 |
| type       | `'line' \| 'card'`                                     | `'line'` |  ✓  |   ✓   | 样式类型               |
| closable   | `boolean`                                              | `false`  |  ✓  |   ✓   | 可关闭                 |

### Events

| Vue Event            | React Callback | Payload       | Description |
| -------------------- | -------------- | ------------- | ----------- |
| `@update:modelValue` | `onChange`     | `key: string` | 激活项变更  |
| `@close`             | `onClose`      | `key: string` | 关闭标签    |

---

## Pagination 分页

### Props

| Prop            | Type                               | Default          | Vue | React | Description  |
| --------------- | ---------------------------------- | ---------------- | :-: | :---: | ------------ |
| page            | `number`                           | `1`              |  ✓  |   ✓   | 当前页       |
| pageSize        | `number`                           | `10`             |  ✓  |   ✓   | 每页条数     |
| total           | `number`                           | `0`              |  ✓  |   ✓   | 总条数       |
| pageSizes       | `number[]`                         | `[10,20,50,100]` |  ✓  |   ✓   | 每页条数选项 |
| showSizeChanger | `boolean`                          | `false`          |  ✓  |   ✓   | 显示条数选择 |
| showQuickJumper | `boolean`                          | `false`          |  ✓  |   ✓   | 显示快速跳转 |
| locale          | `{ pagination: PaginationLocale }` | -                |  ✓  |   ✓   | 国际化       |

> **Vue**: 使用 `v-model:page` 和 `v-model:page-size` 绑定
> **React**: 使用 `page`/`pageSize` + `onChange`/`onPageSizeChange` 控制

---

## Steps 步骤条

### Props

| Prop      | Type                                         | Default        | Vue | React | Description  |
| --------- | -------------------------------------------- | -------------- | :-: | :---: | ------------ |
| current   | `number`                                     | `0`            |  ✓  |   ✓   | 当前步骤     |
| items     | `{ title: string, description?: string }[]`  | `[]`           |  ✓  |   ✓   | 步骤数据     |
| direction | `'horizontal' \| 'vertical'`                 | `'horizontal'` |  ✓  |   ✓   | 方向         |
| status    | `'wait' \| 'process' \| 'finish' \| 'error'` | -              |  ✓  |   ✓   | 当前步骤状态 |

---

## Tree 树形控件

### Props

| Prop             | Type         | Default | Vue | React | Description              |
| ---------------- | ------------ | ------- | :-: | :---: | ------------------------ |
| data             | `TreeNode[]` | `[]`    |  ✓  |   ✓   | 树数据                   |
| expandedKeys     | `string[]`   | `[]`    |  ✓  |   ✓   | 展开的节点               |
| checkedKeys      | `string[]`   | `[]`    |  ✓  |   ✓   | 选中的节点（checkable）  |
| selectedKeys     | `string[]`   | `[]`    |  ✓  |   ✓   | 选中的节点（selectable） |
| checkable        | `boolean`    | `false` |  ✓  |   ✓   | 显示复选框               |
| selectable       | `boolean`    | `false` |  ✓  |   ✓   | 可选择                   |
| defaultExpandAll | `boolean`    | `false` |  ✓  |   ✓   | 默认展开全部             |

> **Vue**: 使用 `v-model:expanded-keys`、`v-model:checked-keys`、`v-model:selected-keys` 绑定
> **React**: 使用对应 prop + `onExpand`/`onCheck`/`onSelect` 控制

### TreeNode

| Prop     | Type         | Description |
| -------- | ------------ | ----------- |
| key      | `string`     | 节点唯一键  |
| title    | `string`     | 节点标题    |
| children | `TreeNode[]` | 子节点      |
| disabled | `boolean`    | 禁用        |

---

> **See also**: [Vue examples](../vue/navigation.md) �� [React examples](../react/navigation.md)

---

> **See also**: [Vue examples](../vue/navigation.md) �� [React examples](../react/navigation.md)
