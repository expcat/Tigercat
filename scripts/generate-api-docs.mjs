#!/usr/bin/env node

/**
 * generate-api-docs.mjs
 *
 * Scans packages/core/src/types/*.ts and generates compact skill references:
 * - skills/tigercat/references/shared/api-summary.md for type lookup
 * - skills/tigercat/references/component-index.md as the canonical component route map
 * - skills/tigercat/references/shared/props/*.md as compact props references
 * - skills/tigercat/references/examples/*.md as shared Vue/React example routes
 *
 * Usage: node scripts/generate-api-docs.mjs
 */

import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join, relative, sep } from 'node:path'
import prettier from 'prettier'
import ts from 'typescript'
import {
  buildRequiredPropSnippet,
  collectPublicHookExports,
  getVisiblePropRows,
  isEmptyComponentSnippet,
  mergeHeritageMembers,
  resolveUsageSnippet,
  shouldUseFrameworkRuntimeProps,
  uniqueMembers
} from './lib/docs-api.mjs'
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  buildTigercatContext7,
  buildPublicComponentEntries,
  formatComponentIndexType,
  getComponentPackageSubpath,
  loadPublicComponentExports
} from './lib/public-components.mjs'
import { collectFiles } from './utils/files.mjs'

const ROOT_DIR = join(import.meta.dirname, '..')
const TYPES_DIR = join(ROOT_DIR, 'packages', 'core', 'src', 'types')
const SKILL_DIR = join(ROOT_DIR, 'skills', 'tigercat')
const SKILL_REFERENCES_DIR = join(ROOT_DIR, 'skills', 'tigercat', 'references')
const SHARED_DIR = join(SKILL_REFERENCES_DIR, 'shared')
const PROPS_DIR = join(SHARED_DIR, 'props')
const EXAMPLES_DIR = join(SKILL_REFERENCES_DIR, 'examples')
const LLM_API_SUMMARY = join(SHARED_DIR, 'api-summary.md')
const COMPONENT_INDEX = join(SKILL_REFERENCES_DIR, 'component-index.md')
const CONTEXT7_JSON = join(ROOT_DIR, 'context7.json')

const CATEGORY_DESCRIPTIONS = {
  Basic: '基础展示与低级交互组件。',
  Form: '表单输入、选择、校验和上传相关组件。',
  Feedback: '覆盖层、提示、加载、结果和进度反馈组件。',
  Layout: '布局容器、栅格、列表、分割和尺寸控制组件。',
  Navigation: '导航、菜单、分页、步骤、锚点和树形导航组件。',
  Data: '数据展示、表格、时间线、日历和折叠面板组件。',
  Charts: '图表画布、图例、工具提示和可视化组件。',
  Advanced: '编辑器、虚拟化、文件、拖拽、看板和高级工具组件。',
  Composite: '由基础组件组合出的业务型组件。',
  Core: '核心类型、事件、主题、locale、slot 和泛型工具。'
}

const EXAMPLE_NOTES = {
  Basic: 'Vue/React API 基本同名；React 使用 `className`，Vue 使用 `class` 或透传 attrs。',
  Form: 'Vue 优先使用 `v-model`；React 使用 `value`/`checked` 搭配 `onChange`。',
  Feedback: '弹层类组件通常使用 `open`/`update:open` 或 `open`/`onOpenChange`。',
  Layout: '布局组件通常组合使用，先确定容器，再选择 Space/Grid/List 等局部排版组件。',
  Navigation: '受控导航组件优先维护当前项、页码或展开状态，再传给组件。',
  Data: '表格和复杂数据组件先定义列、数据和 key，再处理分页、选择、展开等增强项。',
  Charts: '图表组件共享数据、series、legend、tooltip 和 axes 模式，细节看 chart 类型源。',
  Advanced: '高级组件通常需要受控数据、回调和性能边界，先看 props 再写示例。',
  Composite: '组合组件面向业务场景，优先按现有 props 接口配置，而不是拆开重写内部结构。'
}

const COMPONENT_USAGE_NOTES = {
  DataExport: {
    uses: ['Dropdown', 'DropdownMenu', 'DropdownItem'],
    notes:
      "将 columns + dataSource 导出为真正的 .xlsx（零依赖、STORED zip）或 GFM Markdown 表格；序列化逻辑在点击导出时才通过 `import('@expcat/tigercat-core/utils/data-export')` 按需加载。`formats` 单个值渲染普通按钮，多个值渲染下拉菜单；列复用 `TableColumn`（取 `title` 与 `dataKey || key`），可直接透传 Table/DataTableWithToolbar 的列定义，`cellFormatter` 用于单元格取值转换。"
  },
  Dropdown: {
    uses: ['DropdownMenu', 'DropdownItem'],
    notes:
      '菜单沿 overlay 目标链挂载（最近 overlay-host → ConfigProvider 根 → `document.body`，zIndex 用 `OVERLAY_Z_INDEX.overlay`），不会被 overflow 容器裁剪或表格固定列遮挡；设置 `portal: false` 可回退到原位渲染。依赖菜单 DOM 层级的选择器可改用 `[data-tiger-dropdown-menu]` 查询。触发器（trigger）上会暴露稳定的 `data-state="open" | "closed"` 属性（与 `aria-expanded` 同步），可用于自定义样式联动或无障碍钩子（此约定对所有浮层触发器统一适用，详见 patterns/common 的“浮层触发器状态属性”）。需要在渲染自定义触发器时拿到开启状态，可用 Vue `#trigger="{ open }"` 作用域插槽 / React `renderTrigger={({ open }) => …}` prop。'
  },
  Button: {
    notes:
      '`htmlType` 与原生 `type` 是同一属性（`htmlType ?? type ?? "button"`，冲突时 htmlType 胜出）。`size` 未设时：组 size → `md`。icon-only 必须 `aria-label`。loading 可聚焦并设 `aria-busy`，不设原生 disabled。'
  },
  ButtonGroup: {
    notes:
      '直子必须是 Button，组和 Button 之间不能插节点。需要 `aria-label` 或 `aria-labelledby`。子 `size` 覆盖组 size。SplitButton 不要塞进组。'
  },
  Icon: {
    notes:
      '内置图标集通过 `name` 属性指定；自定义 SVG 子元素仍享有更高优先级；图标注册表由 `@expcat/tigercat-core` 及其子路径 `@expcat/tigercat-core/icons/registry` 导出。未传 `color` 时继承 CSS `color`（含 `style.color`）；显式 `color` 胜出。`mode: "fill"` 为 `fill="currentColor"` + `stroke="none"`。'
  },
  Link: {
    notes:
      '`href` 在 disabled 时仍保留。`target="_blank"` 始终把 `noopener noreferrer` 并入 `rel`。`underline` 默认在静止态显示，不是 hover 才出现。'
  },
  Text: {
    notes:
      '`tag` 只允许 TextTag 白名单（p/span/div/h1–h6/label/strong/em/small），非法回退 `p`。`align` 用 `start`/`end`（`left`/`right` 映射到它们）。`label` 需自备 `htmlFor`。'
  },
  Code: {
    notes: '`code` 必填。`copyable` 默认 true。复制文案走 ConfigProvider locale / `labels`。'
  },
  Kbd: {
    notes:
      '由 `keys` 生成的组合键把 `aria-label` 设成 `Ctrl + K` 这种可读名。`variant` 的 default 是 Kbd 自己的底/边/字色，不是可点 Tag。'
  },
  Highlight: {
    notes:
      '需要 `keywords`。`global={false}` 是每个 keyword 的首次匹配，不是整段只亮一次。children/slot 里的元素节点会保留，匹配的文本包在 `mark` 里。'
  },
  Marquee: {
    notes:
      '`repeat=1` 或 `< 2`（含 0）静态一份。纵向不设高时视口吃第一份内容。clone 再挂一份子树，inert 且不可聚焦。无 ariaLabel / aria-label / aria-labelledby 时不是 landmark。pauseOnHover 只管指针；焦点暂停是 pauseOnFocus（默认开）。受控 paused 停动画。短内容不够铺满时加大 repeat。`left`/`right` 走逻辑方向。'
  },
  Carousel: {
    notes:
      '子节点才是 slides。`infinite` 在 scroll 下走首尾 clone，不会整段倒带。无名不是 landmark。非当前页 `inert`。开 autoplay 时有可聚焦暂停；`autoplaySpeed<=0` 和 reduced-motion 都不自动播。'
  },
  Image: {
    notes:
      '默认 `preview=true` 时宿主是可聚焦 `<button>`，读屏名走 `locale.image.previewAriaLabel`。`previewTrigger="hover"` 仍可用 focus / 点击打开；组内由 ImageGroup 统一全屏预览。`onLoad` / `srcSet` 落在内层 `<img>`。'
  },
  ImageGroup: {
    notes:
      '只收集子 Image 的 URL 与 alt。组 `preview={false}` 时子图不再是按钮。重复 src 按实例登记。'
  },
  ImagePreview: {
    notes:
      '`images` 必填（`string | { src, alt? }`）。未传 `open` 视为关。与 ImageViewer 同一 dialog。到头 disable；空列表关闭。'
  },
  ImageViewer: {
    notes:
      'ImagePreview 别名。`minZoom`/`maxZoom` 映射 `minScale`/`maxScale`。`showNav={false}` 键盘也不切图。'
  },
  ImageCompare: {
    notes:
      '受控 `position` / `v-model:position`。滑块名走 `locale.imageCompare`。不传宽高且 after 无内容时高度为 0。'
  },
  ImageCropper: {
    notes: '`src` 必填。产出 `getCropResult()`。坏图错误态。`aspectRatio` 只重算选区。'
  },
  Avatar: {
    notes:
      '`text` 既是破图回退也是缺 `alt` 时的名字。未传 `bgColor` 且有 `text` 时 `generateAvatarColor` 同名同色。`#`/`rgb()`/`var()` 走 style。组未传的 size/shape 跟组。'
  },
  AvatarGroup: {
    notes:
      '`max` 是可见 Avatar 数，overflow 额外；`max={0}` 只出 +N。只计 Avatar 子节点。未传 `aria-label` 时组名来自 locale，可覆盖。'
  },
  Badge: {
    notes:
      '无 content 的 number/text 不渲染。`type="text"` 不被 `max` 封顶。叠放必须 `standalone={false}`，计数写进宿主名字。默认不是 live region。`right`/`left` 跟阅读方向。'
  },
  Empty: {
    notes:
      '`preset` 只换默认文案和内置插图（`simple` 无图，`error` / `no-results` 各自有标）。自定义 `image` / 插槽不被 `showImage={false}` 丢掉。无 ConfigProvider 时默认英文。默认插图是装饰，`aria-hidden`。'
  },
  Result: {
    notes:
      '默认不是 live region。有 `title` 时用 heading（默认 h2）。HTTP 状态画数字，不自动补 “Not Found”。无 title 时只有装饰图标或 HTTP 数字。需要播报时自己写 `role` / `aria-live`。'
  },
  QRCode: {
    notes:
      '`value` 必填，编码为可扫描 QR（byte mode，ECC M）。过期 Refresh 仅在绑定 `onRefresh` / `@refresh` 时是 button。默认色走 `--tiger-text` / `--tiger-surface`。'
  },
  Statistic: {
    notes:
      '`title` 是指标名，不是 HTML tooltip。分组走 `Intl.NumberFormat` + ConfigProvider locale。`animated` 在 mount 之后播；`prefers-reduced-motion` 直接终值。SSR 始终终值。'
  },
  Rate: {
    notes:
      '`readOnly` 可聚焦不改值；`disabled` 才出 Tab。半星与方向键跟阅读方向。`valueText` 只替换 `{value}`。需要组名时传 `aria-label`。'
  },
  Segmented: {
    notes:
      '选项是 `button role="radio"`。必须给组 `aria-label` / `aria-labelledby`。空 `options` 不是完整控件。`icon` 渲染为装饰 SVG。指示条走逻辑边。'
  },
  Watermark: {
    notes:
      '`gapX`/`gapY` 是透明间距。默认墨水跟 `--tiger-text`，暗色表面仍可见。`image` 失败回退 `content`。需要打印时 overlay 带 print-color-adjust。'
  },
  Layout: {
    notes:
      '默认列方向、没有 `min-h-screen`。直子有 Sidebar（或 `hasSider` / `direction="horizontal"`）时改横排。嵌套内层 `flex-1 min-h-0`，`fullHeight` 只作用在最外层。'
  },
  Header: {
    notes:
      '未传 `height` 时默认 `h-16`，不写 inline height。`translucent` / `blur` 替换不透明底并 `sticky`，z 走 `OVERLAY_Z_INDEX.viewport`。'
  },
  Sidebar: {
    notes:
      '`collapsedWidth="0px"` 时 `inert` + `aria-hidden`，里面的控件离开 Tab。边框是 `border-inline-end`。未传 `width` 时默认宽走 class。未传名时 landmark 走 locale。内层未传 `collapsed` 的 Menu 跟随侧栏。'
  },
  Content: {
    notes:
      '默认 `<main>`，一页只留一个。嵌套/预览用 `as="div"`。作为 Layout 直子时自己滚动（`flex-1 min-h-0 overflow-auto`）。React `ref` 是滚动根。'
  },
  Footer: {
    notes: '未传 `height` 不写 inline height。预览/嵌套用 `as="div"`，避免多个 `contentinfo`。'
  },
  Container: {
    notes:
      '`maxWidth={false}` 没有 max-width；`"full"` 是 `max-width: 100%`；命名尺寸读 `--tiger-breakpoint-*`。Vue 声明 `className`，不会盖掉基类。'
  },
  Row: {
    notes:
      '数字 `gutter` 只开横缝，双轴传 `[h, v]`。缝是 CSS gap，不是负 margin。`wrap={false}` 不折行。'
  },
  Col: {
    notes:
      '传入 `flex` 即走 flex 项，不必 `span={0}`。`span={0}` 是该断点隐藏。`order` 只改视觉，不改 Tab / 读屏顺序。offset 走逻辑边。'
  },
  Tag: {
    notes:
      '默认不是 live region。`closable` 只发 close；组件不自己藏，父级卸载或 `visible={false}`。关闭名走 locale。`pill` 全圆角。'
  },
  Space: {
    notes: '`wrap` 只在窄容器里折行。Vue 声明 `className`，不会盖掉基类。'
  },
  Divider: {
    notes:
      '竖线 `self-stretch`，不要外挂高度。`color`/`thickness` 对 gradient 也生效。子节点是居中标签。'
  },
  AspectRatio: {
    notes: '根默认裁切；直系 `img`/`video`/`iframe` 铺满。不必再写 `overflow-hidden`。'
  },
  Skeleton: {
    notes:
      '`wave` 是扫光，不是 pulse。未传宽高用 class 默认值。装饰默认 `aria-hidden`；有名字时是 `status`。加载态也可由父级 `aria-busy` 负责。'
  },
  Card: {
    notes:
      '`hoverable` 只抬起。`onClick`/`href` 才是控件；有 actions 时根不再当按钮。有封面时 padding 在内容列。`coverAlt` 默认空（装饰）。'
  },
  Drawer: {
    notes: '`bodyPadding`（`boolean | string`）可覆写抽屉主体的默认内边距 `px-6 py-4`。'
  },
  ChatWindow: {
    uses: ['Avatar', 'Textarea/Input', 'Button', 'VirtualList', 'Empty'],
    notes:
      '`virtual` 开启后消息列表走 `VirtualList`；输入区根据 `inputType` 选择 `Textarea` 或 `Input`。'
  },
  ActivityFeed: {
    uses: ['Timeline', 'Avatar', 'Tag', 'Card', 'Text', 'Link', 'Loading'],
    notes: '时间线、头像、状态标签和动作链接由组件内部组合，业务侧优先传 `items` 或 `groups`。'
  },
  CommentThread: {
    uses: ['Avatar', 'Tag', 'Button', 'Textarea', 'Text'],
    notes:
      '评论树、回复框和 action 文案通过自身 props 控制；`items` 可作为扁平数据输入。展开状态受控量为 `expandedKeys`：Vue 使用 `update:expandedKeys` / `v-model:expanded-keys`，React 对应历史回调名 `onExpandedChange`。'
  },
  NotificationCenter: {
    uses: ['Card', 'Tabs/TabPane', 'List', 'Text', 'Button', 'Loading'],
    notes: '传 `groups` 时使用 Tabs 分组；平铺通知列表走 List。'
  },
  List: {
    notes:
      '内置分页由 Pagination 组件统一渲染：页数大于 3 时自动展示可点击页码与跳页输入框，3 页及以内为上一页/下一页加页码指示的简洁模式，可用 `pagination.simple` / `pagination.showQuickJumper` 显式覆盖。服务端分页用 `pagination.remote: true`：此时 `dataSource` 即当前页数据，组件跳过内部切片原样渲染，总页数与总数文案由 `pagination.total` 计算，`current`/`pageSize` 变为受控属性，业务侧监听 `page-change`（React `onPageChange`）后按新页码重新请求。'
  },
  TableToolbar: {
    uses: ['Input', 'Select', 'Button', 'Popover', 'Checkbox'],
    notes:
      '这是 `DataTableWithToolbar` 的 toolbar 配置接口，框架实现中不作为独立组件导出。`filters` 默认渲染 Select；需要 Input、DatePicker、年龄段等复合控件时用 `filters[].render(context)`，或在尾部注入 Vue `#filters-extra` / React `toolbar.filtersExtra`。`showColumnSettings` 开启列设置面板（Popover + Checkbox），可用 `columnSettings.lockedColumnKeys` 或列级 `hideable: false` 锁定不可隐藏的列——这是「可见性锁定」，与 Table 的 `columnLockable` / `column.fixed`（横向滚动钉列的「位置锁定」）是两个不同概念。'
  },
  DataTableWithToolbar: {
    uses: ['Table', 'Input', 'Select', 'Button', 'Popover', 'Checkbox'],
    notes:
      '透传 Table props（含 `columnLockable`、列级 `column.fixed` 钉列与 `tableLayout`）：开启 `columnLockable` 后表头出现锁定按钮，锁定列会进入左侧固定区，未锁定列向右排列，可与列级 `column.fixed` 配合实现横向滚动钉列，注意这与 `toolbar.columnSettings.lockedColumnKeys`（列设置面板中不可隐藏的可见性锁定）是两个不同概念。卡片模式同样通过 `responsiveMode="card"` / `responsive-mode="card"`、`cardBreakpoint` 和列级 `hideInCard` / `cardTitle` / `cardPriority` 配置；自定义网格可用列级 `cardGrid` 或表级 `cardLayout`，`cardLayout` 优先于 `cardGrid`，最窄屏默认单列，`sm` 及以上按 `colSpan` 混排；默认卡片可用 `cardSelectionPosition`、`cardPadding`、`divider`、`labelClassName` 和 `valueClassName` 做轻量布局调整。`pagination` 沿用 Table 的 `PaginationConfig`、`ConfigProvider` locale 和 `pagination.locale` 覆盖规则（含 `pagination.remote` 服务端分页模式，原样透传给内部 Table）；分页由内部 Table 交给 Pagination 组件渲染，页数大于 3 时自动展示可点击页码与跳页输入框（`pagination.simple` / `pagination.showQuickJumper` 可覆盖）。`toolbar.filters[].render`、Vue `#filters-extra` 和 React `toolbar.filtersExtra` 可在工具栏过滤区放入自定义控件。`toolbar.showColumnSettings` 开启列设置入口，列显隐通过 `hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控）驱动，React 用 `onHiddenColumnKeysChange` 回调，Vue 支持 `v-model:hidden-column-keys`。'
  },
  Table: {
    uses: ['TableColumn', 'Pagination', 'row selection', 'expandable rows'],
    notes:
      '固定列通过 `column.fixed`（`left` / `right`）开启；开启 `columnLockable` 后表头会出现锁定按钮，点击可交互切换该列进入左侧固定区，按钮的 `aria-label` 走 i18n，可用 `lockColumnAriaLabel` / `unlockColumnAriaLabel`（模板支持 `{column}`）自定义。推荐在列定义上用 `fixedClassName` / `fixedHeaderClassName` 自定义 sticky 背景，而不是依赖全局 sticky CSS 覆盖。当存在固定列或开启 `columnLockable` 时，表格会渲染 `<colgroup>` + `<col>` 钉死每列宽度（有声明 `width` 的列用声明值，无声明宽度的列冻结首次实测宽度），使列宽与 `fixed`/锁定状态解耦——切换锁定不会改变任何列宽，sticky 偏移保持准确；代价是这类表格的自适应列在首次测量后宽度被冻结、不再随容器宽度回流（普通表格不受影响）。`tableLayout`（默认 `"auto"`，可设为 `"fixed"`）切换底层 `table-layout`，固定列/钉列场景配合列 `width` 时 `"fixed"` 列宽更稳定。卡片模式默认关闭，需显式设置 `responsiveMode="card"` / `responsive-mode="card"`；窄屏断点由 `cardBreakpoint` 控制，卡片字段由列级 `hideInCard`、`cardTitle`、`cardPriority` 控制，自定义网格用列级 `cardGrid` 或表级 `cardLayout`（优先级更高），最窄屏默认单列，`sm` 及以上按 `colSpan` 混排；默认卡片可用 `cardSelectionPosition`、`cardPadding`、`divider`、`labelClassName`、`valueClassName` 做轻量布局调整，且 `cardFieldGap`（默认 "gap-3"，需传完整 Tailwind gap 类以便 Tailwind JIT 静态识别）可调整字段间的间距。列显隐通过 `hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控）控制，React 用 `onHiddenColumnKeysChange` 回调，Vue 支持 `v-model:hidden-column-keys`；固定列偏移、卡片字段、导出与列拖拽都只作用于可见列（隐藏列上已生效的筛选仍会继续过滤数据）。为保证锁定/固定列在横向滚动时 `position: sticky` 稳定钉住，表格根使用 `border-separate` + `border-spacing-0`，行/表头分隔线落在单元格（`<td>`/`<th>`）而非 `<tr>`/`<thead>`。内置分页由 Pagination 组件统一渲染：页数大于 3 时自动展示可点击页码与跳页输入框，3 页及以内为上一页/下一页加页码指示的简洁模式，可用 `pagination.simple` / `pagination.showQuickJumper` 显式覆盖。服务端分页用 `pagination.remote: true`：此时 `dataSource` 即当前页数据，组件跳过内部切片原样渲染，总页数和 `showTotal` 范围文案全部由 `pagination.total` 计算，`current`/`pageSize` 仍为受控属性，业务侧监听 `page-change`（React `onPageChange`）后按新页码重新请求；注意 remote 模式下组件内置排序/筛选仅作用于当前页数据，排序/筛选应由服务端完成。'
  },
  VirtualTable: {
    uses: ['TableColumn', 'virtual scroll range', 'fixed column offsets'],
    notes:
      '复用 `TableColumn` 类型；固定列同样支持 `fixedClassName` / `fixedHeaderClassName`，用于跟随 striped、selected 和 hover 状态定制 sticky 单元格样式。'
  },
  FormWizard: {
    uses: ['Steps/StepsItem', 'Button', 'ConfigProvider'],
    notes: '按钮文案优先使用显式 props，其次组件 `locale`，再回退到 `ConfigProvider` locale。'
  },
  TaskBoard: {
    uses: ['ConfigProvider', 'task-board drag utilities', 'kanban utilities'],
    notes: '拖拽、WIP、过滤和空状态文案由 core 工具和 locale helpers 共同驱动。'
  },
  Kanban: {
    uses: ['TaskBoard'],
    notes:
      'Kanban 是 `TaskBoard` 的薄封装，默认启用 `showCardCount` 和 `allowAddCard`，类型扩展来自 `kanban.ts`。'
  }
}

const COMPONENT_PROPS_EXTRA = {
  Icon: `
### Built-in icon set

内置图标支持通过 \`name\` 属性直接渲染。所有内置图标均注册在图标注册表中，可以通过 \`@expcat/tigercat-core/icons/registry\` 导出相关 API 和定义。

**内置图标名称列表 (\`IconName\`):**
- \`close\` / \`success\` / \`warning\` / \`error\` / \`info\` / \`check\`
- \`chevron-up\` / \`chevron-down\` / \`chevron-left\` / \`chevron-right\`
- \`arrow-up\` / \`arrow-down\` / \`arrow-left\` / \`arrow-right\`
- \`search\` / \`plus\` / \`minus\` / \`edit\` / \`trash\`
- \`user\` / \`users\` / \`settings\` / \`eye\` / \`eye-off\` / \`calendar\` / \`clock\`
- \`menu\` / \`more-horizontal\` / \`more-vertical\` / \`external-link\`
- \`home\` / \`bell\` / \`mail\` / \`phone\` / \`download\` / \`upload\` / \`filter\` / \`refresh\` / \`logout\` / \`lock\`
- \`star\` / \`heart\` / \`copy\` / \`link\` / \`document\` / \`folder\` / \`image\` / \`map-pin\` / \`check-circle\` / \`x-circle\` / \`dashboard\`

完整列表以 \`iconNames\` 运行时导出为准。注册表刻意保持精简——每个内部用到 Icon 的组件都会打包整个注册表，新增全局图标会增加所有相关子路径的体积。

### Extended icons（按需导入）

扩展图标集（排序、媒体、商务、数据等约 60 个 Heroicons outline 图标）不注册全局名称，因此不进入组件包体积。按需导入 \`IconDefinition\` 常量，通过 \`icon\` 属性使用；常量带 \`/*#__PURE__*/\` 标注且包声明 \`sideEffects: false\`，bundler 可逐个 tree-shake 未使用的图标：

\`\`\`ts
import { rocketIcon, sortAscendingIcon } from '@expcat/tigercat-core'
\`\`\`

\`\`\`tsx
<Icon icon={rocketIcon} />
\`\`\`

命名规则：kebab-case 图标名 → camelCase + \`Icon\` 后缀（\`sort-ascending\` → \`sortAscendingIcon\`）。全量集合可通过 \`extendedIcons\`（\`Record<ExtendedIconName, IconDefinition>\`）导入用于图标画廊等场景（导入该对象会打包全部扩展图标）。

### Custom logo via \`icon\` prop

自定义图标（如品牌 logo）可定义为 \`IconDefinition\` 常量，定义一次、处处复用，无需全局注册：

\`\`\`ts
import type { IconDefinition } from '@expcat/tigercat-core'

const myLogo: IconDefinition = { viewBox: '0 0 32 32', paths: ['…'], mode: 'fill' }
\`\`\`

\`\`\`tsx
<Icon icon={myLogo} />
\`\`\`

优先级：自定义 SVG children > \`icon\` > \`name\`。\`IconDefinition\` 仅支持 path 数据 + 单色 stroke/fill；多色、含 circle/rect/渐变的复杂 logo 请使用 children 方式内嵌完整 SVG。

**图标注册表导出的辅助函数与类型:**
- \`iconRegistry\`: 图标定义全局注册表对象。
- \`iconNames\`: 包含所有内置图标名称的只读数组。
- \`getIconDefinition(name: string)\`: 根据名称获取图标定义的方法。
- \`IconDefinition\`: 图标定义接口类型。
- \`IconName\`: 包含所有内置图标名称的联合类型。
- \`IconRenderMode\`: 图标渲染模式联合类型 (\`'stroke' | 'fill'\`)。

导入路径示例：
\`\`\`ts
import { iconRegistry, iconNames, getIconDefinition } from '@expcat/tigercat-core/icons/registry'
\`\`\`
`,
  TableToolbar: `
Custom filter context: \`filters[].render({ filter, value, filters, setValue, setFilter })\`. Use \`setValue(value)\` to update the current filter key, or \`setFilter(key, value)\` when one custom control updates another key. \`TableToolbarFilterValue\` accepts \`string | number | Record<string, unknown> | null\`, so range filters can emit \`{ ageRange: { min, max } }\`.

### Per-filter container styling

\`filters[].itemClass\` 和 \`filters[].itemStyle\` 可逐项定制 filter 容器样式。 \`itemClass\` 使用**替换语义**——提供时整体替换默认宽度类，不追加。默认宽度类：

- Select 型 filter：\`w-full sm:w-auto sm:min-w-[120px] sm:max-w-[180px]\`
- 自定义 render 型 filter：\`w-full sm:w-auto\`

如需保留部分默认类，请在 \`itemClass\` 中手动包含。

### Toolbar container and search styling

| Prop | Semantics | Default classes |
| ---- | --------- | --------------- |
| \`className?\` | **追加** | 追加到 \`flex flex-wrap items-center gap-3 p-4\` 之后 |
| \`style?\` | 内联样式 | 作为 CSS 内联样式确定性覆盖间距等 |
| \`searchClassName?\` | **替换** | 替换默认 \`w-full sm:w-auto sm:min-w-[220px] sm:max-w-[320px]\`，结构类 \`flex items-center gap-2\` 保留 |

### Full toolbar replacement

Vue 通过 \`#toolbar\` 作用域插槽，React 通过 \`toolbar.render\`（函数或 ReactNode），完全替换内置工具栏区域（含 \`role="toolbar"\` 容器）。

\`TableToolbarRenderContext\` 字段：\`searchValue\`, \`setSearch\`, \`submitSearch\`, \`filters\`, \`setFilter\`, \`selectedKeys\`, \`selectedCount\`, \`hiddenColumnKeys\`, \`setHiddenColumnKeys\`。

> **a11y 注意**：使用自定义 toolbar 时，内置 \`role="toolbar"\` 容器不再渲染，调用方应自行在自定义 toolbar 根元素上添加 \`role="toolbar"\` 和 \`aria-label\`。
`,
  DataTableWithToolbar: `
卡片自定义（公开 API）：\`renderCard(context)\` / \`cardClassName\`（\`string\` 或 \`(record, index) => string\`）已在 \`DataTableWithToolbar\` 显式声明并转发给内部 Table；Vue 侧另有 \`#card="{ record, index, columns, selected, expanded, toggleExpand, selectRow }"\` 作用域插槽，**插槽优先于 \`renderCard\` prop**。
`,
  NotificationContainer: `
Imperative notification API supports inline toast actions via \`notification.info({ title, actions: [{ label, type, closeOnClick, onClick }] })\`. Action clicks do not trigger the whole-toast \`onClick\`; use \`closeOnClick\` or the callback context \`close()\` to dismiss that toast.
`,
  Menu: `
### Collapsed mode behavior

当 \`collapsed\` 为 \`true\` 时（仅 vertical 模式），菜单项呈现以下行为：

- **图标居中**：折叠态图标去除 \`mr-2\` 右间距，仅保留 \`flex-shrink-0\`，确保图标在容器内视觉居中。
- **标签 sr-only 保留**：完整标签文本以 \`sr-only\` 元素保留在 DOM 中，对视觉用户不可见但屏幕阅读器可读。折叠菜单项的可访问名称为完整标签（如 \`name: 'alpha'\`），而非首字母。
- **首字母回退**：无图标的菜单项显示首字母（大写），该 span 附带 \`aria-hidden="true"\` 避免可访问名称出现 "A alpha" 的重复拼接。
- **子菜单箭头隐藏**：折叠态下 SubMenu 的展开箭头（ExpandIcon）不渲染。
- **SubMenu 标题**：同样遵循上述图标/标签/首字母/箭头规则。
`
}

const COMPONENT_EXAMPLE_EXTRA = {
  Composite: `
## DataTableWithToolbar Custom Filters

Use \`toolbar.filters[].render(context)\` when the custom control belongs to a filter definition. Use the extra area when app code already owns the control state or needs to append several controls after configured Select filters.

Vue \`filters-extra\` age range:

\`\`\`vue
<script setup lang="ts">
const getAgeRange = (value: unknown) =>
  value && typeof value === 'object' ? (value as { min?: string; max?: string }) : {}
</script>

<DataTableWithToolbar
  :columns="columns"
  :data-source="rows"
  :toolbar="{
    filters: [
      { key: 'status', label: '状态', options: statusOptions }
    ]
  }"
  @filters-change="filters = $event">
  <template #filters-extra="{ filters, setFilter }">
    <div class="flex items-center gap-2">
      <span>年龄段</span>
      <Input
        :model-value="getAgeRange(filters.ageRange).min ?? ''"
        placeholder="最小"
        @update:model-value="(min) =>
          setFilter('ageRange', { ...getAgeRange(filters.ageRange), min })" />
      <span>-</span>
      <Input
        :model-value="getAgeRange(filters.ageRange).max ?? ''"
        placeholder="最大"
        @update:model-value="(max) =>
          setFilter('ageRange', { ...getAgeRange(filters.ageRange), max })" />
    </div>
  </template>
</DataTableWithToolbar>
\`\`\`

React \`filtersExtra\` age range:

\`\`\`tsx
<DataTableWithToolbar
  columns={columns}
  dataSource={rows}
  toolbar={{
    filters: [{ key: 'status', label: '状态', options: statusOptions }],
    filtersExtra: ({ filters, setFilter }) => {
      const ageRange =
        filters.ageRange && typeof filters.ageRange === 'object'
          ? (filters.ageRange as { min?: string; max?: string })
          : {}

      return (
        <div className="flex items-center gap-2">
          <span>年龄段</span>
          <Input
            value={ageRange.min ?? ''}
            placeholder="最小"
            onChange={(event) =>
              setFilter('ageRange', { ...ageRange, min: event.currentTarget.value })
            }
          />
          <span>-</span>
          <Input
            value={ageRange.max ?? ''}
            placeholder="最大"
            onChange={(event) =>
              setFilter('ageRange', { ...ageRange, max: event.currentTarget.value })
            }
          />
        </div>
      )
    }
  }}
  onFiltersChange={setFilters}
/>
\`\`\`

\`filters[].render\` receives \`{ filter, value, filters, setValue, setFilter }\`; call \`setValue({ min, max })\` to emit an object value for the current filter key.
`
}

const COMPONENT_SNIPPETS = {
  Vue: {
    Button: '<Button html-type="submit">Save</Button>',
    ButtonGroup:
      '<ButtonGroup aria-label="Pages" size="sm"><Button>Prev</Button><Button>Next</Button></ButtonGroup>',
    Icon: '<Icon name="search" />',
    Link: '<Link href="/docs" target="_blank" rel="nofollow">Docs</Link>',
    Text: '<Text tag="h1" align="start">Title</Text>',
    Code: '<Code code="const n = 1" />',
    Kbd: "<Kbd :keys=\"['Ctrl', 'K']\" />",
    Highlight: '<Highlight keywords="Vue">Learn Vue</Highlight>',
    Marquee: '<Marquee aria-label="News"><span>Item</span></Marquee>',
    ImageCompare:
      '<ImageCompare :before-src="beforeSrc" :after-src="afterSrc" :width="480" :height="280" />',
    ImageCropper: '<ImageCropper :src="src" />',
    Avatar: '<Avatar text="Jane" />',
    AvatarGroup:
      '<AvatarGroup :max="3"><Avatar text="A" /><Avatar text="B" /><Avatar text="C" /></AvatarGroup>',
    Badge: '<Badge :content="5" />',
    Tag: '<Tag closable>标签</Tag>',
    ChatWindow: '<ChatWindow :messages="messages" />',
    ActivityFeed: '<ActivityFeed :items="items" />',
    CommentThread: '<CommentThread :nodes="nodes" />',
    NotificationCenter: '<NotificationCenter :items="items" />',
    DataExport: '<DataExport :columns="columns" :data-source="rows" file-name="users" />',
    TableToolbar:
      '<DataTableWithToolbar :columns="columns" :data-source="rows" :toolbar="toolbar" />',
    DataTableWithToolbar:
      '<DataTableWithToolbar :columns="cardColumns" :data-source="rows" responsive-mode="card" card-breakpoint="lg" :card-layout="cardLayout" :toolbar="toolbar" />',
    Table:
      '<Table :columns="cardColumns" :data-source="rows" responsive-mode="card" card-breakpoint="lg" :card-layout="cardLayout" :pagination="false" />',
    FormWizard: '<FormWizard :steps="steps" />',
    TaskBoard: '<TaskBoard :columns="columns" />',
    Kanban: '<Kanban :columns="columns" />',
    VirtualTable:
      '<VirtualTable :data-source="rows" :columns="fixedColumns" :virtual-item-height="40" :virtual-height="320" />',
    AreaChart: '<AreaChart :data="data" />',
    BarChart: '<BarChart :data="data" />',
    ChartAxis: '<ChartAxis :scale="xScale" />',
    ChartCanvas: '<ChartCanvas :width="320" :height="200" />',
    ChartGrid: '<ChartGrid :x-scale="xScale" :y-scale="yScale" />',
    ChartLegend: '<ChartLegend :items="items" />',
    ChartSeries: '<ChartSeries :data="data" />',
    DonutChart: '<DonutChart :data="data" />',
    FunnelChart: '<FunnelChart :data="data" />',
    Gantt: '<Gantt :data="tasks" />',
    GaugeChart: '<GaugeChart :value="72" />',
    HeatmapChart: '<HeatmapChart :data="data" :x-labels="xLabels" :y-labels="yLabels" />',
    LineChart: '<LineChart :data="data" />',
    OrgChart: '<OrgChart :data="nodes" />',
    PieChart: '<PieChart :data="data" />',
    RadarChart: '<RadarChart :data="data" />',
    ScatterChart: '<ScatterChart :data="data" />',
    SunburstChart: '<SunburstChart :data="data" />',
    TreeMapChart: '<TreeMapChart :data="data" />',
    Layout:
      '<Layout><Header>Title</Header><Layout><Sidebar /><Content as="div">Body</Content></Layout></Layout>',
    Header: '<Header>Title</Header>',
    Sidebar: '<Sidebar :collapsed="collapsed">Nav</Sidebar>',
    Content: '<Content as="div">Body</Content>',
    Footer: '<Footer>©</Footer>',
    Container: '<Container max-width="lg">Body</Container>',
    Row: '<Row :gutter="16"><Col :span="12">A</Col><Col :span="12">B</Col></Row>',
    Col: '<Col :span="12">A</Col>'
  },
  React: {
    Button: '<Button htmlType="submit">Save</Button>',
    ButtonGroup:
      '<ButtonGroup aria-label="Pages" size="sm"><Button>Prev</Button><Button>Next</Button></ButtonGroup>',
    Icon: '<Icon name="search" />',
    Link: '<Link href="/docs" target="_blank" rel="nofollow">Docs</Link>',
    Text: '<Text tag="h1" align="start">Title</Text>',
    Code: '<Code code="const n = 1" />',
    Kbd: "<Kbd keys={['Ctrl', 'K']} />",
    Highlight: '<Highlight keywords="Vue">Learn Vue</Highlight>',
    Marquee: '<Marquee aria-label="News"><span>Item</span></Marquee>',
    ImageCompare:
      '<ImageCompare beforeSrc={beforeSrc} afterSrc={afterSrc} width={480} height={280} />',
    ImageCropper: '<ImageCropper src={src} />',
    Avatar: '<Avatar text="Jane" />',
    AvatarGroup:
      '<AvatarGroup max={3}><Avatar text="A" /><Avatar text="B" /><Avatar text="C" /></AvatarGroup>',
    Badge: '<Badge content={5} />',
    Tag: '<Tag closable>标签</Tag>',
    ChatWindow: '<ChatWindow messages={messages} />',
    ActivityFeed: '<ActivityFeed items={items} />',
    CommentThread: '<CommentThread nodes={nodes} />',
    NotificationCenter: '<NotificationCenter items={items} />',
    DataExport: '<DataExport columns={columns} dataSource={rows} fileName="users" />',
    TableToolbar: '<DataTableWithToolbar columns={columns} dataSource={rows} toolbar={toolbar} />',
    DataTableWithToolbar:
      '<DataTableWithToolbar columns={cardColumns} dataSource={rows} responsiveMode="card" cardBreakpoint="lg" cardLayout={cardLayout} toolbar={toolbar} />',
    Table:
      '<Table columns={cardColumns} dataSource={rows} responsiveMode="card" cardBreakpoint="lg" cardLayout={cardLayout} pagination={false} />',
    FormWizard: '<FormWizard steps={steps} />',
    TaskBoard: '<TaskBoard columns={columns} />',
    Kanban: '<Kanban columns={columns} />',
    VirtualTable:
      '<VirtualTable dataSource={rows} columns={fixedColumns} virtualItemHeight={40} virtualHeight={320} />',
    AreaChart: '<AreaChart data={data} />',
    BarChart: '<BarChart data={data} />',
    ChartAxis: '<ChartAxis scale={xScale} />',
    ChartCanvas: '<ChartCanvas width={320} height={200} />',
    ChartGrid: '<ChartGrid xScale={xScale} yScale={yScale} />',
    ChartLegend: '<ChartLegend items={items} />',
    ChartSeries: '<ChartSeries data={data} />',
    DonutChart: '<DonutChart data={data} />',
    FunnelChart: '<FunnelChart data={data} />',
    Gantt: '<Gantt data={tasks} />',
    GaugeChart: '<GaugeChart value={72} />',
    HeatmapChart: '<HeatmapChart data={data} xLabels={xLabels} yLabels={yLabels} />',
    LineChart: '<LineChart data={data} />',
    OrgChart: '<OrgChart data={nodes} />',
    PieChart: '<PieChart data={data} />',
    RadarChart: '<RadarChart data={data} />',
    ScatterChart: '<ScatterChart data={data} />',
    SunburstChart: '<SunburstChart data={data} />',
    TreeMapChart: '<TreeMapChart data={data} />',
    Layout:
      '<Layout><Header>Title</Header><Layout><Sidebar /><Content as="div">Body</Content></Layout></Layout>',
    Header: '<Header>Title</Header>',
    Sidebar: '<Sidebar collapsed={collapsed}>Nav</Sidebar>',
    Content: '<Content as="div">Body</Content>',
    Footer: '<Footer>©</Footer>',
    Container: '<Container maxWidth="lg">Body</Container>',
    Row: '<Row gutter={16}><Col span={12}>A</Col><Col span={12}>B</Col></Row>',
    Col: '<Col span={12}>A</Col>'
  }
}

const MAX_EVENTS_PER_COMPONENT = 6

let prettierConfigPromise
async function formatWithPrettier(content, parser) {
  prettierConfigPromise ??= prettier.resolveConfig(SKILL_REFERENCES_DIR)
  const config = await prettierConfigPromise
  return prettier.format(content, { ...config, parser })
}

function formatMarkdown(content) {
  return formatWithPrettier(content, 'markdown')
}

function hasExportModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
}

function getDeclarationName(node) {
  return node.name && ts.isIdentifier(node.name) ? node.name.text : null
}

function getJsDocText(node) {
  const docs = ts.getJSDocCommentsAndTags(node)
  const comments = []

  for (const doc of docs) {
    if (ts.isJSDoc(doc)) {
      if (typeof doc.comment === 'string') comments.push(doc.comment)
      if (doc.tags) {
        for (const tag of doc.tags) {
          if (tag.tagName.text === 'deprecated') comments.push('Deprecated.')
        }
      }
    }
  }

  return comments.join(' ').replace(/\s+/g, ' ').trim()
}

function getJsDocTag(node, tagName) {
  for (const tag of ts.getJSDocTags(node)) {
    if (tag.tagName.text !== tagName) continue
    return typeof tag.comment === 'string' ? tag.comment.trim() : ''
  }
  return ''
}

function cleanTypeText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s*=>\s*/g, ' => ')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s*&\s*/g, ' & ')
    .trim()
}

function compactDescription(text) {
  const value = text.replace(/\|/g, '\\|').trim()
  if (value.length <= 90) return value
  return `${value.slice(0, 87).trim()}...`
}

function tableText(text) {
  return String(text).replace(/\|/g, '\\|')
}

function codeText(text) {
  return tableText(String(text).replace(/`/g, '\\`'))
}

function collectHeritageIdentifiers(node, names) {
  if (ts.isIdentifier(node)) {
    names.push(node.text)
    return
  }

  if (ts.isExpressionWithTypeArguments(node)) {
    collectHeritageIdentifiers(node.expression, names)
    node.typeArguments?.forEach((argument) => collectHeritageIdentifiers(argument, names))
    return
  }

  if (ts.isTypeReferenceNode(node)) {
    collectHeritageIdentifiers(node.typeName, names)
    node.typeArguments?.forEach((argument) => collectHeritageIdentifiers(argument, names))
    return
  }

  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
    node.types.forEach((part) => collectHeritageIdentifiers(part, names))
    return
  }

  if (ts.isQualifiedName(node)) {
    collectHeritageIdentifiers(node.right, names)
    return
  }

  ts.forEachChild(node, (child) => collectHeritageIdentifiers(child, names))
}

function getHeritageTypeNames(node) {
  const names = []
  for (const clause of node.heritageClauses || []) {
    if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue
    for (const typeNode of clause.types) collectHeritageIdentifiers(typeNode, names)
  }
  return names
}

function extractMembers(node, sourceFile) {
  if (!node.members) return []

  return node.members
    .filter((member) => ts.isPropertySignature(member) || ts.isMethodSignature(member))
    .map((member) => {
      const name = member.name?.getText(sourceFile) ?? ''
      const optional = Boolean(member.questionToken)
      const rawType = ts.isMethodSignature(member)
        ? member.getText(sourceFile).replace(/^\s*[\w$]+\??\s*/, '')
        : member.type?.getText(sourceFile) || 'unknown'
      return {
        name: `${name}${optional ? '?' : ''}`,
        type: cleanTypeText(rawType),
        defaultValue: getJsDocTag(member, 'default') || '-',
        description: compactDescription(getJsDocText(member) || '-'),
        kind: /^on[A-Z]/.test(name) ? 'event' : ts.isMethodSignature(member) ? 'method' : 'prop'
      }
    })
}

function extractFileInfo(fileName, content, sourcePath = fileName) {
  const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true)
  const exports = []
  const propsInterfaces = []
  const interfaceDetails = []

  function visit(node) {
    if (
      (ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node) ||
        ts.isFunctionDeclaration(node)) &&
      hasExportModifier(node)
    ) {
      const name = getDeclarationName(node)
      if (name) exports.push(name)
    }

    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) exports.push(declaration.name.text)
      }
    }

    if (
      ts.isInterfaceDeclaration(node) &&
      hasExportModifier(node) &&
      node.name.text.endsWith('Props')
    ) {
      propsInterfaces.push(node.name.text)
      interfaceDetails.push({
        name: node.name.text,
        description: compactDescription(getJsDocText(node) || `${node.name.text} definition`),
        members: extractMembers(node, sourceFile),
        heritage: getHeritageTypeNames(node),
        sourcePath
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return {
    fileName,
    sourcePath,
    typeName: basename(fileName).replace(/\.(tsx?|mts|cts)$/, ''),
    exports,
    propsInterfaces,
    interfaceDetails
  }
}

function getCategorizedFiles(fileInfoByName) {
  const categorized = []
  const used = new Set()

  for (const [category, typeFiles] of Object.entries(CATEGORIES)) {
    const files = typeFiles.map((typeFile) => fileInfoByName.get(typeFile)).filter(Boolean)
    files.forEach((fileInfo) => used.add(fileInfo.typeName))
    categorized.push({ category, files })
  }

  const otherFiles = [...fileInfoByName.values()].filter((fileInfo) => !used.has(fileInfo.typeName))
  if (otherFiles.length > 0) categorized.push({ category: 'Other', files: otherFiles })

  return categorized
}

function countExportedTypes(categorizedFiles) {
  return categorizedFiles.reduce(
    (totalTypes, { files }) =>
      totalTypes + files.reduce((fileTotal, fileInfo) => fileTotal + fileInfo.exports.length, 0),
    0
  )
}

function generatePublicHooksSection(publicHooks) {
  if (publicHooks.length === 0) return ''

  const items = publicHooks.map((hook) => `\`${hook.name}\` (${hook.packages.join(', ')})`)
  let markdownText = '## Public hooks\n\n'
  markdownText += `${items.join('; ')}. \`undefined\` is uncontrolled; \`null\` is a legal empty value. React \`useControlledState({ value, defaultValue, onChange, postState })\`; T cannot be a function. \`useDrag({ config, containerId, onDragStart, onDragOver, onDrop, onDragEnd })\`: wrap items with \`getDragItemProps\` / \`getDragItemAttrs\` and the parent with the drop-zone bindings; merge extra \`className\`/\`class\`. Cross-container needs \`config.crossContainer\` and distinct \`containerId\`s. Pointer reorder; keyboard via move buttons or your own keys. Types: \`packages/core/src/types/drag.ts\`.\n\n`
  return markdownText
}

function generateLlmApiSummary(categorizedFiles, publicHooks = []) {
  let markdownText = '---\n'
  markdownText += 'name: tigercat-api-summary\n'
  markdownText += 'description: Compact generated route map for Tigercat core type files\n'
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += '# Tigercat API Summary\n\n'
  markdownText +=
    '> 自动生成。只用于定位类型文件、Props 接口和公开 hook；组件路由看 component-index，字段细节看分类 props 文档或源码。\n\n'
  markdownText += generatePublicHooksSection(publicHooks)

  for (const { category, files } of categorizedFiles) {
    markdownText += `## ${category}\n\n`
    markdownText += '| Type File | Props Interfaces |\n'
    markdownText += '| --------- | ---------------- |\n'
    for (const fileInfo of files) {
      markdownText += `| ${fileInfo.fileName} | ${fileInfo.propsInterfaces.join(', ') || '-'} |\n`
    }
    markdownText += '\n'
  }

  return markdownText
}

function generateComponentIndex(componentRows) {
  let markdownText = '---\n'
  markdownText += 'name: tigercat-component-index\n'
  markdownText +=
    'description: Canonical Tigercat component route map for props, examples, and type source files\n'
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += '# Component Index\n\n'
  markdownText +=
    '每个公开组件只在这里路由一次。定位组件后按以下规则打开文档（`{cat}` = Category 列小写，`{Component}` = 组件名）：\n\n'
  markdownText += '- Props：在 `shared/props/{cat}.md` 内找 `## {Component}` 段。\n'
  markdownText += '- Examples：在 `examples/{cat}.md` 内找 `## {Component}` 段或同名片段。\n'
  markdownText +=
    '- 类型源码：`packages/core/src/types/` + Type 列；个别跨包组件（如 ConfigProvider）以各框架包内同名文件为准，详见其 props 段。\n\n'
  markdownText +=
    '- Test group：组件批次优先运行 `pnpm test:group:{group}`；需要限定框架时使用 `pnpm test:group -- --group {group} --framework react|vue`。\n\n'
  markdownText +=
    '- Package subpath：React/Vue 组件按需使用均优先走 PascalCase 显式入口，例如 `@expcat/tigercat-react/Button` 或 `@expcat/tigercat-vue/Button`；根入口 named exports 仅作为小应用便利入口与非组件 API 入口。\n\n'
  markdownText += '| Component | Category | Test Group | Type | Package Subpath |\n'
  markdownText += '| --------- | -------- | ---------- | ---- | --------------- |\n'

  for (const row of componentRows) {
    const typeFile = formatComponentIndexType(row.typeSource)
    const testGroup = CATEGORY_SLUGS[row.category] || row.category.toLowerCase()
    markdownText += `| ${row.component} | ${row.category} | \`${testGroup}\` | ${typeFile} | ${getComponentPackageSubpath(row.component)} |\n`
  }

  return markdownText
}

function getComponentUsageText(component) {
  const usage = COMPONENT_USAGE_NOTES[component]
  if (!usage) return ''

  let markdownText = ''
  if (usage.uses?.length) {
    markdownText += `Uses: ${usage.uses.map((item) => `\`${codeText(item)}\``).join(', ')}.\n\n`
  }
  if (usage.notes) {
    markdownText += `Note: ${usage.notes}\n\n`
  }
  return markdownText
}

function generateComponentNotesTable(components) {
  const rows = components
    .map((component) => ({ component, usage: COMPONENT_USAGE_NOTES[component] }))
    .filter((row) => row.usage)

  if (rows.length === 0) return ''

  let markdownText = '## Component Notes\n\n'
  markdownText += '| Component | Uses | Notes |\n'
  markdownText += '| --------- | ---- | ----- |\n'
  for (const row of rows) {
    const uses = row.usage.uses?.map((item) => `\`${codeText(item)}\``).join(', ') || '-'
    markdownText += `| ${row.component} | ${uses} | ${tableText(row.usage.notes || '-')} |\n`
  }
  markdownText += '\n'
  return markdownText
}

function collectInterfaceDetails(fileInfos) {
  const details = new Map()
  for (const fileInfo of fileInfos) {
    for (const detail of fileInfo.interfaceDetails) {
      const list = details.get(detail.name) || []
      list.push(detail)
      details.set(detail.name, list)
    }
  }
  return details
}

function isCoreTypePath(sourcePath) {
  return String(sourcePath).includes('packages/core/src/types/')
}

function isFrameworkComponentPath(sourcePath, component) {
  const path = String(sourcePath).replaceAll('\\', '/')
  return (
    path.endsWith(`/components/${component}.tsx`) || path.endsWith(`/components/${component}.ts`)
  )
}

function pickCoreDetail(interfaceDetails, name) {
  const list = interfaceDetails.get(name) || []
  return list.find((detail) => isCoreTypePath(detail.sourcePath)) || list[0]
}

function pickFrameworkDetail(interfaceDetails, name, component) {
  const list = interfaceDetails.get(name) || []
  return (
    list.find((detail) => isFrameworkComponentPath(detail.sourcePath, component)) ||
    list.find((detail) => !isCoreTypePath(detail.sourcePath))
  )
}

function coreDetailsByName(interfaceDetails) {
  const coreByName = new Map()
  for (const name of interfaceDetails.keys()) {
    const detail = pickCoreDetail(interfaceDetails, name)
    if (detail) coreByName.set(name, detail)
  }
  return coreByName
}

function getComponentDetails(entry, interfaceDetails) {
  return (entry.propsInterfaces || [])
    .map((name) => pickCoreDetail(interfaceDetails, name))
    .filter(Boolean)
}

function mergeMembers(details, kind) {
  const members = []
  const seen = new Set()

  for (const detail of details) {
    for (const member of (detail.members || []).filter((item) => item.kind === kind)) {
      if (seen.has(member.name)) continue
      seen.add(member.name)
      members.push(member)
    }
  }

  return members
}

function getResolvedComponentRows(entry, interfaceDetails, coreByName) {
  const component = entry.component
  const coreName = entry.propsInterfaces?.[0]
  const vueName = `Vue${component}Props`
  const reactName = `${component}Props`
  const frameworkReact = pickFrameworkDetail(interfaceDetails, reactName, component)
  const frameworkVue = pickFrameworkDetail(interfaceDetails, vueName, component)
  const frameworkRuntime = frameworkReact || frameworkVue
  const useFrameworkRuntime = shouldUseFrameworkRuntimeProps(
    coreName,
    coreByName,
    frameworkRuntime?.heritage
  )

  if (useFrameworkRuntime && frameworkRuntime) {
    const runtimeDetails = [frameworkReact, frameworkVue].filter(Boolean)
    const sourcePaths = [
      ...new Set(runtimeDetails.map((detail) => detail.sourcePath).filter(Boolean))
    ]
    return {
      details: runtimeDetails,
      typeSource: sourcePaths.join(' and '),
      propRows: uniqueMembers(runtimeDetails.map((detail) => detail.members || [])).filter(
        (member) => member.kind === 'prop'
      ),
      eventRows: uniqueMembers(runtimeDetails.map((detail) => detail.members || [])).filter(
        (member) => member.kind === 'event'
      ),
      methodRows: uniqueMembers(runtimeDetails.map((detail) => detail.members || [])).filter(
        (member) => member.kind === 'method'
      )
    }
  }

  const coreDetails = getComponentDetails(entry, interfaceDetails)
  const mergedCore = uniqueMembers(
    coreDetails.map((detail) => mergeHeritageMembers(detail.name, coreByName))
  )
  const frameworkOwn = uniqueMembers(
    [frameworkReact, frameworkVue]
      .filter(Boolean)
      .map((detail) => (detail.members || []).filter((member) => member.kind === 'prop'))
  )
  const members = uniqueMembers([mergedCore, frameworkOwn])

  return {
    details: coreDetails,
    propRows: members.filter((member) => member.kind === 'prop'),
    eventRows: members.filter((member) => member.kind === 'event'),
    methodRows: members.filter((member) => member.kind === 'method')
  }
}

function getPropsExtra(component) {
  const extras = [COMPONENT_PROPS_EXTRA[component]]
  if (component === 'DataTableWithToolbar') extras.push(COMPONENT_PROPS_EXTRA.TableToolbar)
  return extras.filter(Boolean).join('\n\n')
}

function generatePublicPropsReference(category, componentEntries, interfaceDetails) {
  const slug = CATEGORY_SLUGS[category] || category.toLowerCase()
  const coreByName = coreDetailsByName(interfaceDetails)
  let markdownText = '---\n'
  markdownText += `name: tigercat-props-${slug}\n`
  markdownText += `description: Compact generated Tigercat ${category} props reference\n`
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += `# ${category} Props\n\n`
  markdownText += `${CATEGORY_DESCRIPTIONS[category] || 'Tigercat component props.'} 共 ${componentEntries.length} 个组件。字段细节以 \`packages/core/src/types/*.ts\` 为准；跨包组件以本段列出的源码为准。\n\n`

  for (const entry of componentEntries) {
    const component = entry.component
    const resolved = entry.propsRows
      ? {
          details: getComponentDetails(entry, interfaceDetails),
          typeSource: entry.typeSource,
          propRows: entry.propsRows,
          eventRows: mergeMembers(getComponentDetails(entry, interfaceDetails), 'event'),
          methodRows: mergeMembers(getComponentDetails(entry, interfaceDetails), 'method')
        }
      : getResolvedComponentRows(entry, interfaceDetails, coreByName)
    const { details, propRows, eventRows, methodRows } = resolved
    const typeSource = resolved.typeSource || entry.typeSource
    const visiblePropRows = getVisiblePropRows(component, propRows)
    const shownCount = visiblePropRows.length
    const propsMeta =
      propRows.length > shownCount ? ` · ${shownCount}/${propRows.length} props` : ''
    const interfaceNames =
      details.map((detail) => detail.name).join(' / ') || entry.propsInterfaces?.join(' / ') || '-'

    markdownText += `## ${component}\n\n`
    markdownText += `\`${typeSource}\` · \`${interfaceNames}\`${propsMeta}\n\n`
    markdownText += getComponentUsageText(component)

    if (propRows.length > 0) {
      markdownText += '| Prop | Type | Default | Notes |\n'
      markdownText += '| ---- | ---- | ------- | ----- |\n'
      for (const member of visiblePropRows) {
        markdownText += `| \`${codeText(member.name)}\` | \`${codeText(member.type)}\` | \`${codeText(member.defaultValue)}\` | ${tableText(member.description)} |\n`
      }
      markdownText += '\n'
    }

    if (entry.passThroughNote) markdownText += `${entry.passThroughNote}\n\n`

    if (eventRows.length > 0) {
      markdownText += 'Events/callback props: '
      markdownText += eventRows
        .slice(0, MAX_EVENTS_PER_COMPONENT)
        .map((member) => `\`${member.name}\``)
        .join(', ')
      if (eventRows.length > MAX_EVENTS_PER_COMPONENT) markdownText += ', ...'
      markdownText += '.\n\n'
    }

    if (methodRows.length > 0) {
      markdownText += 'Method signatures: '
      markdownText += methodRows.map((member) => `\`${member.name}\``).join(', ')
      markdownText += '.\n\n'
    }

    const propsExtra = getPropsExtra(component)
    if (propsExtra) markdownText += `${propsExtra.trim()}\n\n`
  }

  return markdownText
}

function getRequiredPropNames(entry, interfaceDetails, coreByName) {
  if (!entry) return []
  const propRows = entry.propsRows
    ? entry.propsRows
    : getResolvedComponentRows(entry, interfaceDetails, coreByName).propRows
  return propRows
    .filter((member) => !String(member.name).endsWith('?'))
    .map((member) => member.name)
}

function getVueSnippet(component, category, requiredNames) {
  const resolved = resolveUsageSnippet(
    component,
    'Vue',
    requiredNames,
    COMPONENT_SNIPPETS.Vue[component]
  )
  if (resolved) return resolved
  if (
    category === 'Form' &&
    ['Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Textarea'].includes(component)
  ) {
    return `<${component} v-model=\"value\" />`
  }
  if (component === 'Form')
    return '<Form :model=\"form\"><FormItem name=\"name\" label=\"Name\"><Input /></FormItem></Form>'
  if (component === 'Table')
    return '<Table :columns=\"columns\" :data-source=\"rows\" row-key=\"id\" />'
  const requiredSnippet = buildRequiredPropSnippet(component, requiredNames, 'Vue')
  if (requiredSnippet) return requiredSnippet
  if (category === 'Charts') return `<${component} :data=\"data\" />`
  return `<${component} />`
}

function getReactSnippet(component, category, requiredNames) {
  const resolved = resolveUsageSnippet(
    component,
    'React',
    requiredNames,
    COMPONENT_SNIPPETS.React[component]
  )
  if (resolved) return resolved
  if (
    category === 'Form' &&
    ['Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Textarea'].includes(component)
  ) {
    return `<${component} value={value} onChange={setValue} />`
  }
  if (component === 'Form')
    return '<Form model={form} onChange={setForm}><FormItem name=\"name\" label=\"Name\"><Input /></FormItem></Form>'
  if (component === 'Table') return '<Table columns={columns} dataSource={rows} rowKey=\"id\" />'
  const requiredSnippet = buildRequiredPropSnippet(component, requiredNames, 'React')
  if (requiredSnippet) return requiredSnippet
  if (category === 'Charts') return `<${component} data={data} />`
  return `<${component} />`
}

function generateExamples(category, componentEntries, interfaceDetails) {
  const slug = CATEGORY_SLUGS[category] || category.toLowerCase()
  const coreByName = coreDetailsByName(interfaceDetails)
  const components = componentEntries.map((entry) => entry.component)
  const entriesByComponent = new Map(componentEntries.map((entry) => [entry.component, entry]))
  let markdownText = '---\n'
  markdownText += `name: tigercat-examples-${slug}\n`
  markdownText += `description: Compact Tigercat ${category} Vue and React usage routes\n`
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += `# ${category} Examples\n\n`
  markdownText += `${EXAMPLE_NOTES[category] || 'Use the props reference for exact field names.'}\n\n`
  markdownText += generateComponentNotesTable(components)

  const snippetRows = components
    .map((component) => {
      const requiredNames = getRequiredPropNames(
        entriesByComponent.get(component),
        interfaceDetails,
        coreByName
      )
      return {
        component,
        vue: getVueSnippet(component, category, requiredNames),
        react: getReactSnippet(component, category, requiredNames)
      }
    })
    .filter(
      (row) =>
        !isEmptyComponentSnippet(row.component, row.vue) ||
        !isEmptyComponentSnippet(row.component, row.react)
    )
  const trivialComponents = components.filter(
    (component) => !snippetRows.some((row) => row.component === component)
  )

  if (snippetRows.length > 0) {
    markdownText += '只列出绑定/配置非平凡的组件；其余为标准 `<Component />`。\n\n'
    markdownText += '| Component | Vue | React |\n'
    markdownText += '| --------- | --- | ----- |\n'
    for (const row of snippetRows) {
      markdownText += `| ${row.component} | \`${codeText(row.vue)}\` | \`${codeText(row.react)}\` |\n`
    }
    markdownText += '\n'
  }

  if (trivialComponents.length > 0) {
    markdownText += `标准用法 \`<Component />\`（Vue/React 同名，绑定差异见 \`shared/patterns/common.md\`）：${trivialComponents.join(', ')}.\n\n`
  }

  markdownText +=
    'Imports: prefer PascalCase component subpaths such as `@expcat/tigercat-vue/Button` and `@expcat/tigercat-react/Button`; keep root named exports for convenience-only usage, hooks/composables, `Message` / `notification` command APIs, and shared types.\n'
  if (COMPONENT_EXAMPLE_EXTRA[category]) {
    markdownText += `\n${COMPONENT_EXAMPLE_EXTRA[category].trim()}\n`
  }
  return markdownText
}

function generateFrameworkIndex(framework) {
  const packageName = framework === 'vue' ? '@expcat/tigercat-vue' : '@expcat/tigercat-react'
  const bindingNote =
    framework === 'vue'
      ? 'Vue examples use `v-model`, kebab-case events, and template syntax.'
      : 'React examples use controlled props, camelCase callbacks, and JSX syntax.'

  let markdownText = '---\n'
  markdownText += `name: tigercat-${framework}\n`
  markdownText += `description: Tigercat ${framework === 'vue' ? 'Vue 3' : 'React'} routing page for generated examples\n`
  markdownText += '---\n\n'
  markdownText += `# Tigercat ${framework === 'vue' ? 'Vue 3' : 'React'}\n\n`
  markdownText += `${bindingNote} Install from \`${packageName}\`; import components from PascalCase subpaths for on-demand usage.\n\n`
  markdownText +=
    '查组件用法：先开 [component-index.md](../component-index.md) 定位组件、Category 与 PascalCase Package Subpath，再按其规则打开 `shared/props/{cat}.md` 与 `examples/{cat}.md`。跨框架绑定差异见 [shared/patterns/common.md](../shared/patterns/common.md) 与 [shared/glossary.md](../shared/glossary.md)。\n'
  return markdownText
}

async function main() {
  const typeFiles = (await readdir(TYPES_DIR)).filter(
    (fileName) => fileName.endsWith('.ts') && fileName !== 'index.ts'
  )

  const fileInfoByName = new Map()
  for (const fileName of typeFiles) {
    const sourcePath = `packages/core/src/types/${fileName}`
    const content = await readFile(join(TYPES_DIR, fileName), 'utf8')
    const fileInfo = extractFileInfo(fileName, content, sourcePath)
    fileInfoByName.set(fileInfo.typeName, fileInfo)
  }

  const categorizedFiles = getCategorizedFiles(fileInfoByName)
  const totalTypes = countExportedTypes(categorizedFiles)
  const publicExports = loadPublicComponentExports(ROOT_DIR)
  const publicComponentNames = new Set(publicExports.all)
  const componentRows = buildPublicComponentEntries(ROOT_DIR, fileInfoByName, publicExports)
  const frameworkSourceFiles = new Set(
    componentRows
      .flatMap((entry) => entry.sourceFiles || [])
      .filter((fileName) => !fileName.startsWith('packages/core/src/types/'))
  )
  for (const row of componentRows) {
    const react = `packages/react/src/components/${row.component}.tsx`
    const vue = `packages/vue/src/components/${row.component}.ts`
    if (existsSync(join(ROOT_DIR, react))) frameworkSourceFiles.add(react)
    if (existsSync(join(ROOT_DIR, vue))) frameworkSourceFiles.add(vue)
  }
  const frameworkFileInfos = []
  for (const fileName of frameworkSourceFiles) {
    const content = await readFile(join(ROOT_DIR, fileName), 'utf8')
    frameworkFileInfos.push(extractFileInfo(fileName, content, fileName))
  }
  const interfaceDetails = collectInterfaceDetails([
    ...[...fileInfoByName.values()],
    ...frameworkFileInfos
  ])
  const entriesByCategory = new Map()
  for (const entry of componentRows) {
    if (!entriesByCategory.has(entry.category)) {
      entriesByCategory.set(entry.category, [])
    }
    entriesByCategory.get(entry.category).push(entry)
  }

  await mkdir(SHARED_DIR, { recursive: true })
  await mkdir(PROPS_DIR, { recursive: true })
  await mkdir(EXAMPLES_DIR, { recursive: true })
  await rm(PROPS_DIR, { recursive: true, force: true })
  await rm(EXAMPLES_DIR, { recursive: true, force: true })
  await mkdir(PROPS_DIR, { recursive: true })
  await mkdir(EXAMPLES_DIR, { recursive: true })

  const reactHooks = collectPublicHookExports(
    await readFile(join(ROOT_DIR, 'packages', 'react', 'src', 'index.tsx'), 'utf8')
  )
  const vueHooks = collectPublicHookExports(
    await readFile(join(ROOT_DIR, 'packages', 'vue', 'src', 'index.ts'), 'utf8')
  )
  const publicHooks = [...new Set([...reactHooks, ...vueHooks])]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      packages: [
        ...(reactHooks.includes(name) ? ['react'] : []),
        ...(vueHooks.includes(name) ? ['vue'] : [])
      ]
    }))

  await writeFile(
    LLM_API_SUMMARY,
    await formatMarkdown(generateLlmApiSummary(categorizedFiles, publicHooks)),
    'utf8'
  )
  await writeFile(
    COMPONENT_INDEX,
    await formatMarkdown(generateComponentIndex(componentRows)),
    'utf8'
  )

  for (const category of Object.keys(CATEGORIES)) {
    if (category === 'Core') continue
    const entries = entriesByCategory.get(category) || []
    if (entries.length === 0) continue
    const slug = CATEGORY_SLUGS[category]
    await writeFile(
      join(PROPS_DIR, `${slug}.md`),
      await formatMarkdown(generatePublicPropsReference(category, entries, interfaceDetails)),
      'utf8'
    )
    await writeFile(
      join(EXAMPLES_DIR, `${slug}.md`),
      await formatMarkdown(generateExamples(category, entries, interfaceDetails)),
      'utf8'
    )
  }

  await writeFile(
    join(SKILL_REFERENCES_DIR, 'vue', 'index.md'),
    await formatMarkdown(generateFrameworkIndex('vue')),
    'utf8'
  )
  await writeFile(
    join(SKILL_REFERENCES_DIR, 'react', 'index.md'),
    await formatMarkdown(generateFrameworkIndex('react')),
    'utf8'
  )

  // context7.json 最后写出：skill_files 清单必须在所有 markdown 落盘之后收集。
  // 走 prettier 而非 JSON.stringify 缩进，否则产物与 `pnpm format:check` 互相打架。
  await writeFile(
    CONTEXT7_JSON,
    await formatWithPrettier(
      JSON.stringify(buildTigercatContext7(componentRows, collectSkillFiles())),
      'json'
    ),
    'utf8'
  )

  console.log(`Skill references generated under: ${SKILL_REFERENCES_DIR}`)
  console.log(`Total exported types: ${totalTypes}`)
  console.log(`Indexed components: ${componentRows.length}`)
}

// skill markdown 清单（仓库相对 POSIX 路径，码位序）。排除维护者专用的
// ROADMAP.md：它不属于 MCP allow-list，纳入会反向扩大可读范围。
function collectSkillFiles() {
  return collectFiles(SKILL_DIR, ['.md'])
    .map((file) => relative(ROOT_DIR, file).split(sep).join('/'))
    .filter((path) => path !== 'skills/tigercat/ROADMAP.md')
    .sort()
}

main().catch((error) => {
  console.error('Failed to generate API docs:', error)
  process.exit(1)
})
