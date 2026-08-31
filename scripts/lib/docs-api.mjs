/**
 * Compact skill-doc helpers for `scripts/generate-api-docs.mjs`.
 *
 * Compact tables keep required + behavior-changing fields instead of slicing
 * the type file's first N members. Full fields stay in `packages/core/src/types`.
 */

import { pascalToKebab } from './public-components.mjs'

export const MIN_COMPACT_PROPS = 3
export const MAX_COMPACT_PROPS = 8
/** Own fields kept in full only for small `extends` leaves (Donut, not ImagePreview). */
export const MAX_THIN_OWN_PROPS = 4

/** Prop stems that change runtime behavior if omitted from Agent compact tables. */
export const BEHAVIOR_PROP_STEMS = new Set([
  'open',
  'locale',
  'data',
  'dataSource',
  'items',
  'options',
  'steps',
  'src',
  'content',
  'value',
  'model',
  'checked',
  'closable',
  'disabled',
  'loading',
  'columns',
  'pagination',
  'sort',
  'filters',
  'rowSelection',
  'expandable',
  'rowKey',
  'virtual',
  'conditions',
  'rules',
  'name',
  'animated',
  'collapsed',
  'wrap',
  'flex',
  'gutter',
  'hasSider',
  'fullHeight'
])

export const COMPONENT_PROP_PRIORITY = {
  Icon: ['name?', 'size?', 'color?'],
  Link: ['href?', 'target?', 'variant?', 'underline?', 'disabled?'],
  Text: ['tag?', 'align?', 'color?', 'truncate?', 'size?'],
  Code: ['copyable?', 'locale?', 'labels?', 'copiedLabel?', 'copyFailedLabel?'],
  Kbd: ['keys?', 'separator?', 'size?', 'variant?'],
  Highlight: ['keywords?', 'global?', 'highlightClassName?', 'text?'],
  Marquee: [
    'direction?',
    'duration?',
    'pauseOnHover?',
    'pauseOnFocus?',
    'paused?',
    'gap?',
    'repeat?',
    'ariaLabel?'
  ],
  Image: [
    'src?',
    'alt?',
    'preview?',
    'previewTrigger?',
    'lazy?',
    'fallbackSrc?',
    'fit?',
    'height?'
  ],
  ImagePreview: ['images', 'open?', 'currentIndex?', 'maskClosable?', 'minScale?', 'locale?'],
  ImageViewer: ['images', 'open?', 'currentIndex?', 'showNav?', 'minZoom?', 'locale?'],
  ImageCompare: [
    'beforeSrc?',
    'afterSrc?',
    'position?',
    'orientation?',
    'disabled?',
    'step?',
    'ariaLabel?',
    'width?'
  ],
  ImageCropper: ['src', 'aspectRatio?', 'minWidth?', 'outputType?', 'guides?', 'locale?'],
  Avatar: ['src?', 'alt?', 'text?', 'bgColor?', 'size?', 'shape?'],
  AvatarGroup: ['max?', 'size?', 'shape?', 'locale?', 'labels?'],
  Badge: ['content?', 'type?', 'standalone?', 'max?', 'showZero?', 'position?', 'variant?'],
  Tag: ['closable?', 'visible?', 'pill?', 'variant?', 'size?', 'closeAriaLabel?'],
  Empty: ['preset?', 'description?', 'showImage?'],
  Result: ['status?', 'title?', 'subTitle?', 'headingLevel?'],
  QRCode: ['value', 'status?', 'size?', 'color?', 'bgColor?'],
  Statistic: ['title?', 'value?', 'groupSeparator?', 'animated?', 'prefix?', 'suffix?'],
  Rate: ['allowHalf?', 'allowClear?', 'character?', 'readOnly?', 'disabled?', 'size?', 'count?'],
  Segmented: ['options?', 'block?', 'disabled?', 'size?', 'name?'],
  Watermark: ['content?', 'font?', 'gapX?', 'gapY?', 'image?', 'rotate?'],
  Layout: ['hasSider?', 'fullHeight?', 'direction?'],
  Header: ['variant?', 'height?'],
  Sidebar: ['collapsed?', 'width?', 'collapsedWidth?', 'side?'],
  Content: ['as?', 'padding?'],
  Footer: ['as?', 'height?'],
  Container: ['maxWidth?', 'center?', 'padding?', 'as?'],
  Row: ['gutter?', 'wrap?', 'align?', 'justify?'],
  Col: ['span?', 'flex?', 'offset?', 'order?'],
  Space: ['wrap?', 'direction?', 'size?', 'align?'],
  Divider: ['orientation?', 'lineStyle?', 'color?', 'thickness?', 'spacing?'],
  AspectRatio: ['ratio?'],
  Skeleton: ['rows?', 'paragraph?', 'height?', 'shape?', 'variant?', 'animation?', 'width?'],
  Card: [
    'hoverable?',
    'direction?',
    'cover?',
    'coverAlt?',
    'href?',
    'variant?',
    'size?',
    'padding?'
  ],
  Descriptions: ['items?', 'column?', 'layout?', 'colon?', 'bordered?', 'size?', 'title?'],
  List: [
    'dataSource?',
    'pagination?',
    'grid?',
    'itemLayout?',
    'emptyText?',
    'split?',
    'draggable?',
    'virtual?'
  ],
  ScrollArea: ['maxHeight?', 'height?', 'shadow?', 'ariaLabel?', 'direction?', 'scrollbar?'],
  Masonry: ['columns?', 'gap?', 'columnClassName?', 'itemClassName?'],
  PrintLayout: [
    'pageSize?',
    'orientation?',
    'showHeader?',
    'showFooter?',
    'headerText?',
    'footerText?',
    'showPageBreaks?'
  ],
  Carousel: [
    'autoplay?',
    'autoplaySpeed?',
    'dots?',
    'arrows?',
    'effect?',
    'infinite?',
    'currentIndex?',
    'pauseOnHover?',
    'pauseOnFocus?',
    'dotPosition?',
    'speed?'
  ],
  Collapse: ['activeKey?', 'accordion?', 'expandIconPosition?', 'bordered?', 'ghost?'],
  CollapsePanel: ['panelKey', 'header?', 'extra?', 'showArrow?', 'disabled?'],
  Timeline: ['items?', 'mode?', 'pending?', 'reverse?'],
  Countdown: ['value?', 'now?', 'format?', 'interval?', 'title?'],
  Progress: ['percentage?', 'status?', 'showText?', 'type?', 'striped?'],
  Splitter: ['direction?', 'sizes?', 'min?', 'gutterSize?', 'disabled?', 'max?'],
  Input: ['type?', 'clearable?', 'showPassword?', 'showCount?', 'disabled?', 'readonly?'],
  Textarea: ['rows?', 'autoResize?', 'showCount?', 'status?'],
  InputNumber: [
    'min?',
    'max?',
    'step?',
    'precision?',
    'controls?',
    'controlsPosition?',
    'disabled?'
  ],
  InputGroup: ['size?', 'compact?'],
  InputGroupAddon: ['className?'],
  Resizable: [
    'width?',
    'height?',
    'defaultWidth?',
    'defaultHeight?',
    'lockAspectRatio?',
    'handles?',
    'axis?',
    'disabled?',
    'minWidth?',
    'minHeight?'
  ],
  Button: [
    'variant?',
    'size?',
    'disabled?',
    'loading?',
    'htmlType?',
    'danger?',
    'iconPosition?',
    'block?'
  ],
  SplitButton: [
    'variant?',
    'size?',
    'disabled?',
    'loading?',
    'htmlType?',
    'open?',
    'portal?',
    'placement?',
    'triggerAriaLabel?'
  ],
  Dropdown: [
    'trigger?',
    'open?',
    'disabled?',
    'portal?',
    'closeOnClick?',
    'placement?',
    'asChild?'
  ],
  DropdownItem: ['disabled?', 'divided?', 'closeOnClick?', 'href?', 'itemKey?'],
  ContextMenu: ['open?', 'disabled?', 'portal?', 'closeOnClick?', 'placement?', 'asChild?'],
  ContextMenuItem: ['disabled?', 'divided?', 'href?', 'itemKey?'],
  ContextMenuSub: ['title?', 'disabled?'],
  Menu: ['items?', 'selectedKeys?', 'openKeys?', 'collapsed?', 'searchable?', 'mode?'],
  MenuItem: ['itemKey', 'href?', 'disabled?'],
  MenuItemGroup: ['title?'],
  SubMenu: ['itemKey', 'title?', 'disabled?'],
  NavigationMenu: [
    'value?',
    'open?',
    'portal?',
    'closeOnClick?',
    'disabled?',
    'placement?',
    'openOnHover?'
  ],
  NavigationMenuLink: ['href?', 'disabled?', 'active?', 'target?'],
  NavigationMenuTrigger: ['disabled?', 'showArrow?'],
  NavigationMenuContent: ['mega?'],
  NavigationMenuList: ['className?'],
  NavigationMenuItem: ['value?', 'disabled?'],
  Tabs: [
    'activeKey?',
    'tabPosition?',
    'closable?',
    'destroyInactiveTabPane?',
    'lazy?',
    'swipeable?',
    'type?'
  ],
  TabPane: ['tabKey', 'label', 'disabled?', 'closable?'],
  Breadcrumb: ['separator?', 'maxItems?', 'extra?'],
  BreadcrumbItem: ['href?', 'current?', 'separator?', 'icon?'],
  PageHeader: ['title?', 'subTitle?', 'showBack?', 'backHref?', 'backAriaLabel?'],
  Steps: ['current?', 'clickable?', 'status?', 'direction?', 'simple?', 'size?'],
  StepsItem: ['title', 'status?', 'disabled?', 'description?'],
  Pagination: [
    'total?',
    'current?',
    'pageSize?',
    'simple?',
    'showQuickJumper?',
    'showSizeChanger?',
    'disabled?',
    'hideOnSinglePage?',
    'locale?'
  ],
  Popover: ['trigger?', 'content?', 'placement?', 'open?', 'width?', 'asChild?'],
  Tooltip: ['content?', 'trigger?', 'placement?', 'open?', 'asChild?'],
  Popconfirm: [
    'title?',
    'description?',
    'okText?',
    'cancelText?',
    'okType?',
    'placement?',
    'open?',
    'asChild?'
  ],
  ConfigProvider: ['locale?', 'theme?', 'colorScheme?', 'direction?'],
  Affix: ['offsetTop?', 'offsetBottom?', 'target?', 'zIndex?'],
  Anchor: ['getContainer?', 'direction?', 'targetOffset?', 'affix?', 'offsetTop?'],
  AnchorLink: ['href', 'title?', 'target?'],
  BackTop: ['visibilityHeight?', 'target?', 'placement?', 'offset?'],
  FloatButton: ['floating?', 'placement?', 'offset?'],
  Notification: ['actions?', 'type?', 'position?'],
  Table: [
    'dataSource?',
    'pagination?',
    'sort?',
    'filters?',
    'rowSelection?',
    'expandable?',
    'rowKey?',
    'virtual?'
  ],
  DataExport: [
    'columns',
    'dataSource?',
    'formats?',
    'fileName?',
    'sheetName?',
    'cellFormatter?',
    'disabled?'
  ],
  VirtualTable: [
    'dataSource?',
    'columns?',
    'virtualHeight?',
    'virtualItemHeight?',
    'rowKey?',
    'rowSelection?',
    'virtualizeColumns?',
    'width?'
  ],
  Message: ['type?', 'content?', 'closable?', 'position?', 'closeAriaLabel?'],
  Form: ['model?', 'rules?', 'conditions?', 'disabled?', 'loading?', 'locale?', 'controller?'],
  FormItem: ['name?', 'label?', 'required?', 'rules?', 'error?', 'errorDisplayMode?'],
  Checkbox: ['checked?', 'indeterminate?', 'disabled?', 'size?'],
  CheckboxGroup: ['value?', 'defaultValue?', 'disabled?', 'size?', 'direction?'],
  Radio: ['value', 'checked?', 'name?', 'disabled?'],
  RadioGroup: ['value?', 'defaultValue?', 'name?', 'disabled?', 'size?', 'direction?'],
  Switch: ['checked?', 'defaultChecked?', 'disabled?', 'size?'],
  Slider: ['value?', 'defaultValue?', 'min?', 'max?', 'step?', 'range?', 'marks?', 'disabled?'],
  Stepper: ['value?', 'defaultValue?', 'min?', 'max?', 'step?', 'disabled?', 'size?', 'precision?'],
  Select: [
    'options?',
    'value?',
    'defaultValue?',
    'multiple?',
    'searchable?',
    'clearable?',
    'virtual?',
    'creatable?',
    'remote?',
    'open?'
  ],
  AutoComplete: [
    'options?',
    'value?',
    'defaultValue?',
    'searchValue?',
    'filterOption?',
    'allowFreeInput?',
    'clearable?',
    'open?',
    'loading?'
  ],
  Cascader: [
    'options?',
    'value?',
    'defaultValue?',
    'searchable?',
    'changeOnSelect?',
    'expandTrigger?',
    'clearable?',
    'virtual?',
    'open?'
  ],
  Calendar: [
    'value?',
    'defaultValue?',
    'mode?',
    'fullscreen?',
    'disabledDate?',
    'weekStartsOn?',
    'now?',
    'locale?'
  ],
  DatePicker: [
    'value?',
    'defaultValue?',
    'range?',
    'format?',
    'open?',
    'placeholder?',
    'disabled?',
    'clearable?',
    'minDate?',
    'maxDate?',
    'disabledDate?',
    'weekStartsOn?',
    'locale?'
  ],
  TimePicker: [
    'value?',
    'defaultValue?',
    'range?',
    'format?',
    'showSeconds?',
    'open?',
    'placeholder?',
    'disabled?',
    'clearable?',
    'minTime?',
    'maxTime?',
    'disabledTime?',
    'locale?'
  ],
  ColorPicker: [
    'value?',
    'defaultValue?',
    'format?',
    'showAlpha?',
    'presets?',
    'open?',
    'clearable?',
    'disabled?'
  ],
  Signature: [
    'value?',
    'defaultValue?',
    'exportType?',
    'readonly?',
    'clearable?',
    'disabled?',
    'penColor?',
    'width?',
    'height?'
  ],
  NumberKeyboard: [
    'value?',
    'defaultValue?',
    'mode?',
    'open?',
    'maxLength?',
    'precision?',
    'showConfirm?',
    'disabled?',
    'readonly?'
  ],
  Mentions: ['options?', 'value?', 'prefix?', 'filterOption?', 'open?', 'disabled?', 'loading?'],
  MaskInput: ['mask', 'value?', 'tokens?', 'clearable?', 'disabled?', 'name?'],
  InputOTP: ['length?', 'value?', 'type?', 'masked?', 'groups?', 'disabled?'],
  TagsInput: ['value?', 'max?', 'delimiters?', 'allowDuplicates?', 'addOnBlur?', 'clearable?'],
  Upload: [
    'fileList?',
    'drag?',
    'listType?',
    'customRequest?',
    'action?',
    'autoUpload?',
    'disabled?',
    'maxSize?'
  ],
  Transfer: ['dataSource?', 'value?', 'targetKeys?', 'searchable?', 'disabled?'],
  CropUpload: ['accept?', 'maxSize?', 'cropperProps?', 'onCropComplete?', 'disabled?'],
  VirtualList: [
    'itemCount?',
    'itemHeight?',
    'height?',
    'overscan?',
    'getItemHeight?',
    'estimatedItemHeight?',
    'sizeStrategy?'
  ],
  InfiniteScroll: [
    'hasMore?',
    'loading?',
    'onLoadMore?',
    'direction?',
    'inverse?',
    'disabled?',
    'threshold?',
    'height?',
    'loadingText?',
    'endText?',
    'locale?'
  ],
  ColorSwatch: [
    'value?',
    'defaultValue?',
    'colors?',
    'groups?',
    'columns?',
    'disabled?',
    'ariaLabel?'
  ],
  CronEditor: ['value?', 'defaultValue?', 'presets?', 'disabled?', 'readonly?', 'size?', 'locale?'],
  TreeSelect: [
    'treeData?',
    'value?',
    'defaultValue?',
    'multiple?',
    'searchable?',
    'clearable?',
    'virtual?',
    'defaultExpandAll?',
    'open?'
  ],
  Tree: [
    'treeData?',
    'expandedKeys?',
    'selectedKeys?',
    'checkedKeys?',
    'loadData?',
    'virtual?',
    'filterValue?',
    'searchable?'
  ]
}

export function propStem(name) {
  return String(name).replace(/\?$/, '')
}

export function isRequiredProp(member) {
  return Boolean(member?.name) && !member.name.endsWith('?')
}

export function isBehaviorProp(member) {
  return BEHAVIOR_PROP_STEMS.has(propStem(member.name))
}

export function uniqueMembers(lists) {
  const seen = new Set()
  const members = []

  for (const list of lists) {
    if (!list) continue
    for (const member of list) {
      if (!member?.name || seen.has(member.name)) continue
      seen.add(member.name)
      members.push(member)
    }
  }

  return members
}

export function collectMixinInterfaceNames(detailsByName) {
  const mixins = new Set()

  for (const detail of detailsByName.values()) {
    for (const parent of detail.heritage || []) {
      if (detailsByName.has(parent)) mixins.add(parent)
    }
  }

  return mixins
}

export function isDistinctRuntimeProps(frameworkHeritage, coreName) {
  return !(frameworkHeritage || []).some(
    (name) => name === coreName || name === `Core${coreName}` || name.endsWith(coreName)
  )
}

export function shouldUseFrameworkRuntimeProps(coreName, coreByName, frameworkHeritage) {
  if (!coreName || !coreByName.has(coreName)) return false

  const usedAsParent = [...coreByName.values()].some(
    (detail) => detail.name !== coreName && (detail.heritage || []).includes(coreName)
  )

  return usedAsParent && isDistinctRuntimeProps(frameworkHeritage, coreName)
}

export function mergeHeritageMembers(name, detailsByName, seen = new Set()) {
  if (!name || seen.has(name)) return []
  seen.add(name)

  const detail = detailsByName.get(name)
  if (!detail) return []

  const inherited = []
  for (const parent of detail.heritage || []) {
    inherited.push(
      ...mergeHeritageMembers(parent, detailsByName, seen).map((member) => ({
        ...member,
        origin: 'inherited'
      }))
    )
  }

  const own = (detail.members || []).map((member) => ({ ...member, origin: 'own' }))
  return uniqueMembers([own, inherited])
}

export function getVisiblePropRows(component, propRows) {
  const rows = Array.isArray(propRows) ? propRows : []
  if (rows.length === 0) return []

  const required = rows.filter(isRequiredProp)
  const priorityNames = COMPONENT_PROP_PRIORITY[component] || []
  const priority = uniqueMembers([
    priorityNames.map((name) => rows.find((member) => member.name === name)).filter(Boolean)
  ])
  const behavior = rows.filter(isBehaviorProp)
  const own = rows.filter((member) => member.origin === 'own')
  const inheritedCount = rows.filter((member) => member.origin === 'inherited').length
  const thinOwn =
    inheritedCount > 0 && own.length > 0 && own.length <= MAX_THIN_OWN_PROPS ? own : []

  const requiredNames = new Set(required.map((member) => member.name))
  const extras = uniqueMembers([priority, thinOwn, behavior]).filter(
    (member) => !requiredNames.has(member.name)
  )
  const extraBudget = Math.max(0, MAX_COMPACT_PROPS - required.length)
  const mustKeep = uniqueMembers([required, extras.slice(0, extraBudget)])

  if (mustKeep.length >= MIN_COMPACT_PROPS) return mustKeep

  const rest = rows.filter((member) => !mustKeep.some((kept) => kept.name === member.name))
  return uniqueMembers([mustKeep, rest]).slice(0, MIN_COMPACT_PROPS)
}

export const COMMAND_API_USAGE = {
  Message: { Vue: "Message.info('Saved')", React: "Message.info('Saved')" },
  LoadingBar: { Vue: 'LoadingBar.start()', React: 'LoadingBar.start()' }
}

export const REQUIRED_USAGE_SNIPPETS = {
  Vue: {
    Image: '<Image src="..." alt="..." />',
    Calendar: '<Calendar :value="date" />',
    FormItem: '<FormItem name="name" label="Name"><Input /></FormItem>',
    QRCode: '<QRCode value="..." />',
    Result: '<Result status="success" title="提交成功" />',
    Statistic: '<Statistic title="Users" :value="1234" />',
    Rate: '<Rate :default-value="3" />',
    Segmented: '<Segmented :options="options" aria-label="View" />',
    Watermark: '<Watermark content="机密" />',
    Tour: '<Tour :steps="steps" />',
    List: '<List :data-source="items" />',
    Descriptions: '<Descriptions :items="items" />',
    ScrollArea: '<ScrollArea max-height="200" aria-label="Log"><slot /></ScrollArea>',
    Masonry: '<Masonry :columns="3"><slot /></Masonry>',
    PrintLayout:
      '<PrintLayout page-size="A4" show-header header-text="Report"><slot /></PrintLayout>',
    Carousel: '<Carousel><div>One</div><div>Two</div></Carousel>',
    Collapse:
      '<Collapse :active-key="keys"><CollapsePanel panel-key="1" header="FAQ">Answer</CollapsePanel></Collapse>',
    CollapsePanel: '<CollapsePanel panel-key="1" header="FAQ">Answer</CollapsePanel>',
    Timeline: '<Timeline :items="items" />',
    Countdown: '<Countdown :value="deadline" />',
    Progress: '<Progress :percentage="64" />',
    Splitter: '<Splitter :sizes="sizes"><div>A</div><div>B</div></Splitter>',
    Resizable: '<Resizable :default-width="300" :default-height="150"><slot /></Resizable>',
    Input: '<Input v-model="value" />',
    Textarea: '<Textarea v-model="value" :rows="4" />',
    InputNumber: '<InputNumber v-model="value" />',
    InputGroup:
      '<InputGroup compact aria-label="Search"><InputGroupAddon>https://</InputGroupAddon><Input /></InputGroup>',
    InputGroupAddon: '<InputGroupAddon>https://</InputGroupAddon>',
    Checkbox: '<Checkbox v-model="checked">Label</Checkbox>',
    CheckboxGroup:
      '<CheckboxGroup v-model="values"><Checkbox value="a">A</Checkbox></CheckboxGroup>',
    Radio: '<Radio v-model="checked" value="a">A</Radio>',
    RadioGroup: '<RadioGroup v-model="value"><Radio value="a">A</Radio></RadioGroup>',
    Switch: '<Switch v-model="checked">Label</Switch>',
    Slider: '<Slider v-model="value" />',
    Stepper: '<Stepper v-model="value" />',
    Select: '<Select v-model="value" :options="options" />',
    AutoComplete: '<AutoComplete v-model="value" :options="options" />',
    Cascader: '<Cascader v-model="value" :options="options" />',
    TreeSelect: '<TreeSelect v-model="value" :tree-data="treeData" />',
    Tree: '<Tree :tree-data="treeData" />',
    DatePicker: '<DatePicker v-model="value" />',
    TimePicker: '<TimePicker v-model="value" />',
    ColorPicker: '<ColorPicker v-model="value" />',
    ColorSwatch: '<ColorSwatch v-model="value" :colors="colors" />',
    CronEditor: '<CronEditor v-model="value" />',
    Signature: '<Signature v-model="value" />',
    NumberKeyboard: '<NumberKeyboard v-model="value" />',
    Mentions: '<Mentions v-model="value" :options="options" />',
    MaskInput: '<MaskInput v-model="value" mask="##/##/####" />',
    InputOTP: '<InputOTP v-model="value" />',
    TagsInput: '<TagsInput v-model="tags" />',
    Upload: '<Upload v-model:file-list="fileList" />',
    Transfer: '<Transfer v-model="targetKeys" :data-source="dataSource" />',
    CropUpload: '<CropUpload @crop-complete="onCropComplete" />',
    VirtualList:
      '<VirtualList :item-count="count" :item-height="40"><template #default="{ index }">{{ index }}</template></VirtualList>',
    InfiniteScroll:
      '<InfiniteScroll :has-more="hasMore" :height="288" @load-more="loadMore">{{ items }}</InfiniteScroll>',
    Dropdown:
      '<Dropdown><template #trigger>Open</template><DropdownMenu><DropdownItem>Item</DropdownItem></DropdownMenu></Dropdown>',
    ContextMenu:
      '<ContextMenu><button>Surface</button><ContextMenuMenu><ContextMenuItem>Copy</ContextMenuItem></ContextMenuMenu></ContextMenu>',
    Popover: '<Popover content="Note"><button>Trigger</button></Popover>',
    Tooltip: '<Tooltip content="Hint"><button>Save</button></Tooltip>',
    Popconfirm: '<Popconfirm @confirm="onConfirm"><button>Delete</button></Popconfirm>',
    SplitButton:
      '<SplitButton @click="onSave">Save<DropdownItem>Save as</DropdownItem></SplitButton>',
    DropdownMenu: '<DropdownMenu><DropdownItem>Item</DropdownItem></DropdownMenu>',
    DropdownItem: '<DropdownItem>Item</DropdownItem>',
    ContextMenuMenu: '<ContextMenuMenu><ContextMenuItem>Copy</ContextMenuItem></ContextMenuMenu>',
    ContextMenuItem: '<ContextMenuItem>Copy</ContextMenuItem>',
    ContextMenuSub:
      '<ContextMenuSub title="More"><ContextMenuItem>Share</ContextMenuItem></ContextMenuSub>',
    Menu: '<Menu :items="items" />',
    MenuItem: '<Menu><MenuItem :item-key="itemKey">Home</MenuItem></Menu>',
    MenuItemGroup:
      '<Menu><MenuItemGroup title="Team"><MenuItem :item-key="a">A</MenuItem></MenuItemGroup></Menu>',
    SubMenu:
      '<Menu><SubMenu :item-key="itemKey" title="More"><MenuItem :item-key="a">A</MenuItem></SubMenu></Menu>',
    NavigationMenu:
      '<NavigationMenu><NavigationMenuList><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/guide">Guide</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>',
    NavigationMenuList:
      '<NavigationMenu><NavigationMenuList><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger></NavigationMenuItem></NavigationMenuList></NavigationMenu>',
    NavigationMenuItem:
      '<NavigationMenu><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger></NavigationMenuItem></NavigationMenu>',
    NavigationMenuTrigger:
      '<NavigationMenu><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/guide">Guide</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenu>',
    NavigationMenuContent:
      '<NavigationMenu><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/guide">Guide</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenu>',
    NavigationMenuLink:
      '<NavigationMenu><NavigationMenuItem><NavigationMenuLink href="/about">About</NavigationMenuLink></NavigationMenuItem></NavigationMenu>',
    Tabs: '<Tabs v-model:active-key="activeKey"><TabPane :tab-key="1" label="Overview">Panel</TabPane></Tabs>',
    TabPane: '<Tabs><TabPane tab-key="1" label="Overview">Panel</TabPane></Tabs>',
    Breadcrumb:
      '<Breadcrumb><BreadcrumbItem href="/">Home</BreadcrumbItem><BreadcrumbItem>Here</BreadcrumbItem></Breadcrumb>',
    BreadcrumbItem:
      '<Breadcrumb><BreadcrumbItem href="/" current>Home</BreadcrumbItem></Breadcrumb>',
    PageHeader: '<PageHeader title="订单详情" />',
    Steps: '<Steps :current="1"><StepsItem title="填写" /><StepsItem title="确认" /></Steps>',
    StepsItem: '<Steps><StepsItem title="填写" /></Steps>',
    Pagination: '<Pagination :total="100" :current="1" />',
    Affix: '<Affix :offset-top="0"><div>Header</div></Affix>',
    Anchor: '<Anchor><AnchorLink href="#intro" title="Intro" /></Anchor>',
    AnchorLink: '<AnchorLink href="#intro" title="Intro" />',
    BackTop: '<BackTop :visibility-height="400" />'
  },
  React: {
    Image: '<Image src="..." alt="..." />',
    Calendar: '<Calendar value={date} />',
    FormItem: '<FormItem name="name" label="Name"><Input /></FormItem>',
    QRCode: '<QRCode value="..." />',
    Result: '<Result status="success" title="提交成功" />',
    Statistic: '<Statistic title="Users" value={1234} />',
    Rate: '<Rate defaultValue={3} />',
    Segmented: '<Segmented options={options} aria-label="View" />',
    Watermark: '<Watermark content="机密" />',
    Tour: '<Tour steps={steps} />',
    List: '<List dataSource={items} />',
    Descriptions: '<Descriptions items={items} />',
    ScrollArea: '<ScrollArea maxHeight={200} ariaLabel="Log">{children}</ScrollArea>',
    Masonry: '<Masonry columns={3}>{children}</Masonry>',
    PrintLayout:
      '<PrintLayout pageSize="A4" showHeader headerText="Report">{children}</PrintLayout>',
    Carousel: '<Carousel><div>One</div><div>Two</div></Carousel>',
    Collapse:
      '<Collapse activeKey={keys}><CollapsePanel panelKey="1" header="FAQ">Answer</CollapsePanel></Collapse>',
    CollapsePanel: '<CollapsePanel panelKey="1" header="FAQ">Answer</CollapsePanel>',
    Timeline: '<Timeline items={items} />',
    Countdown: '<Countdown value={deadline} />',
    Progress: '<Progress percentage={64} />',
    Splitter: '<Splitter sizes={sizes}><div>A</div><div>B</div></Splitter>',
    Resizable: '<Resizable defaultWidth={300} defaultHeight={150}>{children}</Resizable>',
    Input: '<Input value={value} onChange={(event) => setValue(event.target.value)} />',
    Textarea: '<Textarea value={value} onChange={(event) => setValue(event.target.value)} />',
    InputNumber: '<InputNumber value={value} onChange={setValue} />',
    InputGroup:
      '<InputGroup compact aria-label="Search"><InputGroupAddon>https://</InputGroupAddon><Input /></InputGroup>',
    InputGroupAddon: '<InputGroupAddon>https://</InputGroupAddon>',
    Checkbox: '<Checkbox checked={checked} onChange={setChecked}>Label</Checkbox>',
    CheckboxGroup:
      '<CheckboxGroup value={values} onChange={setValues}><Checkbox value="a">A</Checkbox></CheckboxGroup>',
    Radio: '<Radio checked={checked} onChange={setChecked} value="a">A</Radio>',
    RadioGroup:
      '<RadioGroup value={value} onChange={setValue}><Radio value="a">A</Radio></RadioGroup>',
    Switch: '<Switch checked={checked} onChange={setChecked}>Label</Switch>',
    Slider: '<Slider value={value} onChange={setValue} />',
    Stepper: '<Stepper value={value} onChange={setValue} />',
    Select: '<Select value={value} options={options} onChange={(next) => setValue(next)} />',
    AutoComplete:
      '<AutoComplete value={value} options={options} onChange={(next) => setValue(next)} />',
    Cascader: '<Cascader value={value} options={options} onChange={(next) => setValue(next)} />',
    TreeSelect:
      '<TreeSelect value={value} treeData={treeData} onChange={(next) => setValue(next)} />',
    Tree: '<Tree treeData={treeData} />',
    DatePicker: '<DatePicker value={date} onChange={setDate} />',
    TimePicker: '<TimePicker value={value} onChange={setValue} />',
    ColorPicker: '<ColorPicker value={value} onChange={setValue} />',
    ColorSwatch: '<ColorSwatch value={value} colors={colors} onChange={setValue} />',
    CronEditor: '<CronEditor value={value} onChange={setValue} />',
    Signature: '<Signature value={value} onChange={setValue} />',
    NumberKeyboard: '<NumberKeyboard value={value} onChange={setValue} />',
    Mentions: '<Mentions value={value} options={options} onChange={setValue} />',
    MaskInput: '<MaskInput value={value} mask="##/##/####" onChange={(raw) => setValue(raw)} />',
    InputOTP: '<InputOTP value={value} onChange={setValue} />',
    TagsInput: '<TagsInput value={tags} onChange={setTags} />',
    Upload: '<Upload fileList={fileList} onChange={(file, next) => setFileList(next)} />',
    Transfer: '<Transfer value={targetKeys} dataSource={dataSource} onChange={setTargetKeys} />',
    CropUpload: '<CropUpload onCropComplete={onCropComplete} />',
    VirtualList:
      '<VirtualList itemCount={count} itemHeight={40} renderItem={({ index }) => <div>{index}</div>} />',
    InfiniteScroll:
      '<InfiniteScroll hasMore={hasMore} height={288} onLoadMore={loadMore}>{items}</InfiniteScroll>',
    Dropdown:
      '<Dropdown renderTrigger={() => <button>Open</button>}><DropdownMenu><DropdownItem>Item</DropdownItem></DropdownMenu></Dropdown>',
    ContextMenu:
      '<ContextMenu><button>Surface</button><ContextMenuMenu><ContextMenuItem>Copy</ContextMenuItem></ContextMenuMenu></ContextMenu>',
    Popover: '<Popover content="Note"><button>Trigger</button></Popover>',
    Tooltip: '<Tooltip content="Hint"><button>Save</button></Tooltip>',
    Popconfirm: '<Popconfirm onConfirm={onConfirm}><button>Delete</button></Popconfirm>',
    SplitButton:
      '<SplitButton onClick={onSave}>Save<DropdownItem>Save as</DropdownItem></SplitButton>',
    DropdownMenu: '<DropdownMenu><DropdownItem>Item</DropdownItem></DropdownMenu>',
    DropdownItem: '<DropdownItem>Item</DropdownItem>',
    ContextMenuMenu: '<ContextMenuMenu><ContextMenuItem>Copy</ContextMenuItem></ContextMenuMenu>',
    ContextMenuItem: '<ContextMenuItem>Copy</ContextMenuItem>',
    ContextMenuSub:
      '<ContextMenuSub title="More"><ContextMenuItem>Share</ContextMenuItem></ContextMenuSub>',
    Menu: '<Menu items={items} />',
    MenuItem: '<Menu><MenuItem itemKey={itemKey}>Home</MenuItem></Menu>',
    MenuItemGroup:
      '<Menu><MenuItemGroup title="Team"><MenuItem itemKey="a">A</MenuItem></MenuItemGroup></Menu>',
    SubMenu:
      '<Menu><SubMenu itemKey={itemKey} title="More"><MenuItem itemKey="a">A</MenuItem></SubMenu></Menu>',
    NavigationMenu:
      '<NavigationMenu><NavigationMenuList><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/guide">Guide</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>',
    NavigationMenuList:
      '<NavigationMenu><NavigationMenuList><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger></NavigationMenuItem></NavigationMenuList></NavigationMenu>',
    NavigationMenuItem:
      '<NavigationMenu><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger></NavigationMenuItem></NavigationMenu>',
    NavigationMenuTrigger:
      '<NavigationMenu><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/guide">Guide</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenu>',
    NavigationMenuContent:
      '<NavigationMenu><NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/guide">Guide</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenu>',
    NavigationMenuLink:
      '<NavigationMenu><NavigationMenuItem><NavigationMenuLink href="/about">About</NavigationMenuLink></NavigationMenuItem></NavigationMenu>',
    Tabs: '<Tabs activeKey={activeKey}><TabPane tabKey={1} label="Overview">Panel</TabPane></Tabs>',
    TabPane: '<Tabs><TabPane tabKey="1" label="Overview">Panel</TabPane></Tabs>',
    Breadcrumb:
      '<Breadcrumb><BreadcrumbItem href="/">Home</BreadcrumbItem><BreadcrumbItem>Here</BreadcrumbItem></Breadcrumb>',
    BreadcrumbItem:
      '<Breadcrumb><BreadcrumbItem href="/" current>Home</BreadcrumbItem></Breadcrumb>',
    PageHeader: '<PageHeader title="订单详情" />',
    Steps: '<Steps current={1}><StepsItem title="填写" /><StepsItem title="确认" /></Steps>',
    StepsItem: '<Steps><StepsItem title="填写" /></Steps>',
    Pagination: '<Pagination total={100} current={1} />',
    Affix: '<Affix offsetTop={0}><div>Header</div></Affix>',
    Anchor: '<Anchor><AnchorLink href="#intro" title="Intro" /></Anchor>',
    AnchorLink: '<AnchorLink href="#intro" title="Intro" />',
    BackTop: '<BackTop visibilityHeight={400} />'
  }
}

export function isCommandApiComponent(component) {
  return Object.hasOwn(COMMAND_API_USAGE, component)
}

function vuePropBinding(name) {
  const stem = propStem(name)
  return `:${pascalToKebab(stem)}="${stem}"`
}

function reactPropBinding(name) {
  const stem = propStem(name)
  return `${stem}={${stem}}`
}

export function buildRequiredPropSnippet(component, requiredNames, framework) {
  if (!component || !requiredNames?.length) return null
  const attrs = requiredNames.map((name) =>
    framework === 'Vue' ? vuePropBinding(name) : reactPropBinding(name)
  )
  return `<${component} ${attrs.join(' ')} />`
}

export function isEmptyComponentSnippet(component, snippet) {
  return snippet === `<${component} />`
}

export function resolveUsageSnippet(component, framework, requiredNames, explicitSnippet) {
  const command = COMMAND_API_USAGE[component]?.[framework]
  if (command) return command
  const requiredUsage = REQUIRED_USAGE_SNIPPETS[framework]?.[component]
  if (requiredUsage) return requiredUsage
  if (explicitSnippet && !isEmptyComponentSnippet(component, explicitSnippet)) {
    return explicitSnippet
  }
  return null
}

export function collectPublicHookExports(indexContent) {
  const hooks = new Set()
  const exportRegex = /export\s+\{([^}]+)\}\s+from\s+['"](\.\/(?:hooks|composables)\/[^'"]+)['"]/g
  let match

  while ((match = exportRegex.exec(indexContent)) !== null) {
    for (const specifier of match[1].split(',')) {
      const name = specifier.split(/\s+as\s+/)[0].trim()
      if (/^use[A-Z]/.test(name)) hooks.add(name)
    }
  }

  return [...hooks].sort((a, b) => a.localeCompare(b))
}
