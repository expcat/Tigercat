---
name: tigercat-shared-props-navigation
description: Shared props definitions for navigation components - Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree
---

# Navigation Components - Props Reference

共享 Props 定义。

---

## Breadcrumb 面包屑

### Breadcrumb Props

| Prop      | Type                                           | Default | Vue | React | Description        |
| --------- | ---------------------------------------------- | ------- | :-: | :---: | ------------------ |
| separator | `'slash' \| 'arrow' \| 'chevron' \| string`    | `'/'`   |  ✓  |   ✓   | 分隔符             |
| extra     | `VNode \| ReactNode`                            | -       |  ✓  |   ✓   | 末尾扩展区         |
| className | `string`                                        | -       |  ✓  |   ✓   | 自定义 CSS 类名    |
| style     | `Record<string, unknown> \| React.CSSProperties` | -       |  ✓  |   ✓   | 内联样式           |

> **Vue**: `extra` 支持 slot 和 prop 两种方式（slot 优先）
> **React**: `extra` 仅通过 prop 传入

### BreadcrumbItem Props

| Prop      | Type                                           | Default | Vue | React | Description                        |
| --------- | ---------------------------------------------- | ------- | :-: | :---: | ---------------------------------- |
| href      | `string`                                        | -       |  ✓  |   ✓   | 导航链接 URL                     |
| target    | `'_blank' \| '_self' \| '_parent' \| '_top'`    | -       |  ✓  |   ✓   | 链接 target 属性                  |
| current   | `boolean`                                       | `false` |  ✓  |   ✓   | 是否当前页（末尾项不可点击）       |
| separator | `'slash' \| 'arrow' \| 'chevron' \| string`    | -       |  ✓  |   ✓   | 覆盖全局分隔符                   |
| icon      | `VNode \| ReactNode`                            | -       |  ✓  |   ✓   | 图标                               |
| className | `string`                                        | -       |  ✓  |   ✓   | 自定义 CSS 类名                |
| style     | `Record<string, unknown> \| React.CSSProperties` | -       |  ✓  |   ✓   | 内联样式                       |

### Events

| Vue Event | React Callback | Payload      | Description              |
| --------- | -------------- | ------------ | ------------------------ |
| `@click`  | `onClick`      | `MouseEvent` | 点击项时触发（current 不触发） |

### Slots / Children

| Vue Slot  | React Prop | Description      |
| --------- | ---------- | ---------------- |
| `default` | `children` | 面包屑项内容       |
| `extra`   | `extra`    | 末尾扩展区内容     |

---

## Dropdown 下拉菜单

组合式组件，由 `Dropdown`、`DropdownMenu`、`DropdownItem` 组成。

### Dropdown Props

| Prop           | Type                  | Default          | Vue | React | Description                |
| -------------- | --------------------- | ---------------- | :-: | :---: | -------------------------- |
| trigger        | `'hover' \| 'click'`  | `'hover'`        |  ✓  |   ✓   | 触发方式                   |
| placement      | `FloatingPlacement`   | `'bottom-start'` |  ✓  |   ✓   | 弹出位置（12 方向）        |
| offset         | `number`              | `4`              |  ✓  |   ✓   | 与触发器的间距（px）       |
| disabled       | `boolean`             | `false`          |  ✓  |   ✓   | 禁用                       |
| visible        | `boolean`             | -                |  ✓  |   ✓   | 显示状态（受控）           |
| defaultVisible | `boolean`             | `false`          |  ✓  |   ✓   | 默认显示状态               |
| closeOnClick   | `boolean`             | `true`           |  ✓  |   ✓   | 点击菜单项后关闭           |
| showArrow      | `boolean`             | `true`           |  ✓  |   ✓   | 显示下拉箭头指示器         |
| className      | `string`              | -                |  ✓  |   ✓   | 自定义 CSS 类名            |

### DropdownMenu Props

| Prop      | Type                                           | Default | Vue | React | Description     |
| --------- | ---------------------------------------------- | ------- | :-: | :---: | --------------- |
| className | `string`                                        | -       |  ✓  |   ✓   | 自定义 CSS 类名 |
| style     | `Record<string, unknown> \| React.CSSProperties` | -       |  ✓  |   ✓   | 内联样式        |

### DropdownItem Props

| Prop     | Type               | Default | Vue | React | Description      |
| -------- | ------------------ | ------- | :-: | :---: | ---------------- |
| disabled | `boolean`          | `false` |  ✓  |   ✓   | 禁用             |
| divided  | `boolean`          | `false` |  ✓  |   ✓   | 与上方项分割     |
| itemKey  | `string \| number` | -       |  ✓  |   -   | 唯一标识（Vue）  |

### Events

| Vue Event          | React Callback    | Payload             | Description  |
| ------------------ | ----------------- | ------------------- | ------------ |
| `@visible-change`  | `onVisibleChange` | `visible: boolean`  | 显示状态变化 |
| `@update:visible`  | -                 | `visible: boolean`  | v-model 更新 |
| `@click` (Item)    | `onClick` (Item)  | `MouseEvent`        | 点击菜单项   |

### Slots / Children

| Vue Slot  | React Prop | Description           |
| --------- | ---------- | --------------------- |
| `default` | `children` | 触发器 + DropdownMenu |

---

## Menu 菜单

### Menu Props

| Prop                | Type                                        | Default      | Vue | React | Description                    |
| ------------------- | ------------------------------------------- | ------------ | :-: | :---: | ------------------------------ |
| mode                | `'horizontal' \| 'vertical' \| 'inline'`    | `'vertical'` |  ✓  |   ✓   | 菜单模式                       |
| theme               | `'light' \| 'dark'`                          | `'light'`    |  ✓  |   ✓   | 主题                           |
| selectedKeys        | `(string \| number)[]`                       | -            |  ✓  |   ✓   | 当前选中项（受控）             |
| defaultSelectedKeys | `(string \| number)[]`                       | `[]`         |  ✓  |   ✓   | 默认选中项                     |
| openKeys            | `(string \| number)[]`                       | -            |  ✓  |   ✓   | 当前展开子菜单（受控）         |
| defaultOpenKeys     | `(string \| number)[]`                       | `[]`         |  ✓  |   ✓   | 默认展开子菜单                 |
| collapsed           | `boolean`                                    | `false`      |  ✓  |   ✓   | 折叠状态（vertical 模式）      |
| multiple            | `boolean`                                    | `true`       |  ✓  |   ✓   | 是否同时展开多个子菜单         |
| inlineIndent        | `number`                                     | `24`         |  ✓  |   ✓   | inline 模式缩进量（px）        |

> **Vue**: 使用 `v-model:selected-keys` / `v-model:open-keys` 双向绑定
> **React**: 使用 `selectedKeys` + `onSelect` / `openKeys` + `onOpenChange` 控制

### MenuItem Props

| Prop     | Type               | Default | Vue | React | Description |
| -------- | ------------------ | ------- | :-: | :---: | ----------- |
| itemKey  | `string \| number` | -       |  ✓  |   ✓   | 唯一标识    |
| disabled | `boolean`          | `false` |  ✓  |   ✓   | 禁用        |
| icon     | `string \| VNode \| ReactNode` | -  |  ✓  |   ✓   | 图标       |

### SubMenu Props

| Prop     | Type               | Default | Vue | React | Description |
| -------- | ------------------ | ------- | :-: | :---: | ----------- |
| itemKey  | `string \| number` | -       |  ✓  |   ✓   | 唯一标识    |
| title    | `string`           | `''`    |  ✓  |   ✓   | 标题        |
| icon     | `string \| VNode \| ReactNode` | -  |  ✓  |   ✓   | 图标       |
| disabled | `boolean`          | `false` |  ✓  |   ✓   | 禁用        |

### MenuItemGroup Props

| Prop  | Type     | Default | Vue | React | Description |
| ----- | -------- | ------- | :-: | :---: | ----------- |
| title | `string` | `''`    |  ✓  |   ✓   | 分组标题    |

### Events

| Vue Event              | React Callback | Payload                                              | Description     |
| ---------------------- | -------------- | ---------------------------------------------------- | --------------- |
| `@select`              | `onSelect`     | `(key, { selectedKeys })`                             | 选中菜单项      |
| `@open-change`         | `onOpenChange` | `(key, { openKeys })`                                 | 子菜单展开/收起 |
| `@update:selectedKeys` | -              | `selectedKeys`                                        | v-model 更新    |
| `@update:openKeys`     | -              | `openKeys`                                            | v-model 更新    |

---

## Tabs 标签页

### Tabs Props

| Prop                    | Type                                    | Default    | Vue | React | Description                        |
| ----------------------- | --------------------------------------- | ---------- | :-: | :---: | ---------------------------------- |
| activeKey               | `string \| number`                     | -          |  ✓  |   ✓   | 当前激活 key（受控）               |
| defaultActiveKey        | `string \| number`                     | -          |  ✓  |   ✓   | 默认激活 key（非受控）             |
| type                    | `'line' \| 'card' \| 'editable-card'` | `'line'`   |  ✓  |   ✓   | 样式类型                           |
| tabPosition             | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` |  ✓  |   ✓   | 标签位置                           |
| size                    | `'small' \| 'medium' \| 'large'`      | `'medium'` |  ✓  |   ✓   | 尺寸                               |
| closable                | `boolean`                               | `false`    |  ✓  |   ✓   | 标签可关闭（仅 editable-card）     |
| centered                | `boolean`                               | `false`    |  ✓  |   ✓   | 标签居中                           |
| destroyInactiveTabPane  | `boolean`                               | `false`    |  ✓  |   ✓   | 销毁非激活面板                     |

### TabPane Props

| Prop     | Type               | Default | Vue | React | Description              |
| -------- | ------------------ | ------- | :-: | :---: | ------------------------ |
| tabKey   | `string \| number` | -       |  ✓  |   ✓   | 唯一标识（必填）         |
| label    | `string`           | -       |  ✓  |   ✓   | 标签标题（必填）         |
| disabled | `boolean`          | `false` |  ✓  |   ✓   | 禁用                     |
| closable | `boolean`          | -       |  ✓  |   ✓   | 覆盖父级 closable 设置   |
| icon     | 组件/VNode         | -       |  ✓  |   ✓   | 图标                     |

> **Vue**: 使用 `v-model:activeKey` 绑定激活 key，子组件用 `<TabPane>` slot 渲染内容
> **React**: 使用 `activeKey` + `onChange` 受控，或 `defaultActiveKey` 非受控

### Events

| Vue Event            | React Callback | Payload                                    | Description      |
| -------------------- | -------------- | ------------------------------------------ | ---------------- |
| `@update:activeKey`  | `onChange`     | `key: string \| number`                   | 激活项变更       |
| `@change`            | `onChange`     | `key: string \| number`                   | 激活项变更       |
| `@tab-click`         | `onTabClick`   | `key: string \| number`                   | 标签点击         |
| `@edit`              | `onEdit`       | `{ targetKey?, action: 'add' \| 'remove' }` | 新增/删除标签 |

---

## Pagination 分页

### Props

| Prop            | Type                                              | Default          | Vue | React | Description  |
| --------------- | ------------------------------------------------- | ---------------- | :-: | :---: | ------------ |
| current         | `number`                                          | `1`              |  ✓  |   ✓   | 当前页       |
| pageSize        | `number`                                          | `10`             |  ✓  |   ✓   | 每页条数     |
| total           | `number`                                          | `0`              |  ✓  |   ✓   | 总条数       |
| pageSizeOptions | `(number \| { value: number, label?: string })[]` | `[10,20,50,100]` |  ✓  |   ✓   | 每页条数选项 |
| showSizeChanger | `boolean`                                         | `false`          |  ✓  |   ✓   | 显示条数选择 |
| showQuickJumper | `boolean`                                         | `false`          |  ✓  |   ✓   | 显示快速跳转 |
| locale          | `{ pagination: PaginationLocale }`                | -                |  ✓  |   ✓   | 国际化       |

> **Vue**: 使用 `v-model:current` 和 `v-model:page-size` 绑定
> **React**: 使用 `current`/`pageSize` + `onChange`/`onPageSizeChange` 控制

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

## BackTop 回到顶部

### Props

| Prop             | Type                          | Default        | Vue | React | Description                |
| ---------------- | ----------------------------- | -------------- | :-: | :---: | -------------------------- |
| visibilityHeight | `number`                      | `400`          |  ✓  |   ✓   | 滚动高度达到此值显示       |
| target           | `() => HTMLElement \| Window` | `() => window` |  ✓  |   ✓   | 监听滚动的目标元素         |
| duration         | `number`                      | `450`          |  ✓  |   ✓   | 滚动到顶部的动画时长（ms） |

### Events

| Vue Event | React Callback | Payload      | Description |
| --------- | -------------- | ------------ | ----------- |
| `@click`  | `onClick`      | `MouseEvent` | 点击时触发  |

### Slots / Children

| Vue Slot  | React Prop | Description    |
| --------- | ---------- | -------------- |
| `default` | `children` | 自定义按钮内容 |

---

## Anchor 锚点导航

### Anchor Props

| Prop             | Type                             | Default        | Vue | React | Description          |
| ---------------- | -------------------------------- | -------------- | :-: | :---: | -------------------- |
| affix            | `boolean`                        | `true`         |  ✓  |   ✓   | 是否固定定位         |
| bounds           | `number`                         | `5`            |  ✓  |   ✓   | 锚点区域边界（px）   |
| offsetTop        | `number`                         | `0`            |  ✓  |   ✓   | 距窗口顶部偏移量     |
| showInkInFixed   | `boolean`                        | `false`        |  ✓  |   ✓   | 固定时是否显示小圆点 |
| targetOffset     | `number`                         | -              |  ✓  |   ✓   | 锚点滚动偏移量       |
| getCurrentAnchor | `(activeLink: string) => string` | -              |  ✓  |   ✓   | 自定义高亮锚点       |
| getContainer     | `() => HTMLElement \| Window`    | `() => window` |  ✓  |   ✓   | 滚动容器             |
| direction        | `'vertical' \| 'horizontal'`     | `'vertical'`   |  ✓  |   ✓   | 导航方向             |

### Anchor Events

| Vue Event | React Callback | Payload                     | Description    |
| --------- | -------------- | --------------------------- | -------------- |
| `@click`  | `onClick`      | `(event, href)`             | 点击链接时触发 |
| `@change` | `onChange`     | `currentActiveLink: string` | 锚点变化时触发 |

### AnchorLink Props

| Prop   | Type     | Default | Vue | React | Description |
| ------ | -------- | ------- | :-: | :---: | ----------- |
| href   | `string` | -       |  ✓  |   ✓   | 锚点链接    |
| title  | `string` | -       |  ✓  |   ✓   | 文字内容    |
| target | `string` | -       |  ✓  |   ✓   | 链接 target |

### Slots / Children

| Vue Slot  | React Prop | Description    |
| --------- | ---------- | -------------- |
| `default` | `children` | 自定义链接内容 |

---

> **See also**: [Vue examples](../vue/navigation.md) · [React examples](../react/navigation.md)
