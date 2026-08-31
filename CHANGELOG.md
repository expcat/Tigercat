# Changelog

本文档记录 Tigercat UI 组件库的所有版本变更。

## 未发布

- **Upload**：选文件 / 校验 / 请求 / 中止下沉 core。不传 `action` 且不传 `customRequest` 时列表停在 `ready`，不再假成功。`autoUpload={false}` 必须 `submit()`。进行中 Remove 不会把项写回。FormItem 写入 `UploadFile[]`。`picture` 是带缩略图的文本行。Vue 导出 `UploadProps`，React `UploadRef` 含 `submit` / `abort`。
- **Transfer**：勾选 / 全选 / 移动下沉 core。补非受控 `defaultValue`；右侧按 `targetKeys` 顺序。面板是 checkbox 组（带头上全选），不再是 listbox 套 checkbox。默认渲染并过滤 `description`。读 FormItem。假 `--tiger-transfer-*` 删掉。Vue 导出 `TransferProps`。
- **CropUpload**：object URL + generation，确认钮等 cropper `onReady`。`CropResult.file` 带原名。触发器是 `<label>`；有可见 children 时不再盖英文 `aria-label`。footer 只留 Modal 一层 chrome。
- **Mentions**：省略 `value` 能打字（`undefined` 非受控，`''` 是空正文）。过滤/插入/开合下沉 core；插入用 textarea 当前值。读 FormItem；textarea 是 combobox；弹层 overlay-host + `fullscreen-sm`。默认过滤匹配 label 和 value。删除假 `--tiger-mentions-*`。
- **MaskInput**：chrome 与 Input 同层（clear 在内、error 在下，可同时有）。`/g` token 不跳字。`disabled` 时 hidden 不提交。读 FormItem；React `forwardRef`。Clear 走 `locale.input`。
- **InputOTP**：一个 Tab 停；方向键读 `dir`。多字只在第一格/autofill 时整段覆盖。读 FormItem；id/aria 在当前格。`pattern` 改 `inputMode`。
- **TagsInput**：一个 Tab 停（关闭钮 `tabIndex=-1`）。重复/满员留下 pending。粘贴先带上正在打的字。读 FormItem；id 在 textbox。`name` 每个 tag 一个 hidden。
- **Signature**：笔迹会话下沉 core（pointerId、一次 finish）。受控值是 SVG data URL 或 `''`，能回灌；光栅从离屏逻辑尺寸导出，不再吃显示 canvas 的 DPR。空签不发空白图。读 FormItem；画板是可聚焦 widget；Undo + locale；假 `--tiger-signature-*` 删掉。React `forwardRef` / Vue `expose({ focus, clear, undo, toDataURL, toSVG, isEmpty })`。
- **NumberKeyboard**：`applyNumberKeyboardKey` 一份。Confirm 的颜色单独解析，不再和普通键对打。假 `--tiger-number-keyboard-*` 删掉。组是一个 Tab 停，方向键和物理数字走同一份 apply。`open` 经 overlay-host 挂底栏。empty 是 spacer。读 FormItem。`phone`/`id-card` 写进 JSDoc。Confirm 走 `common.okText`。
- **ColorPicker / ColorSwatch**：HSV 在拖动期间当事实源，面板有 SV 平面和光谱色相轨；所有操作按 `format` emit（hex+alpha 用 8 位）。未选是 `undefined`，Clear 是 `''`。补 `defaultValue` / `open` / `placement`。预设复用 ColorSwatch。读 FormItem；trigger 是 native button；弹层 dialog + trap + `fullscreen-sm` + Done。假 `--tiger-colorpicker-*` / `--tiger-colorswatch-*` 删掉。方向键读 `dir` 并环绕。勾按亮度选 on-color。
- **CronEditor**：方言是 5 段数字 unix（0/7 周日，不认名字和 Quartz）。空值是 `''` 不是每分钟。段数不对时不把原文改写成 `* * * * *`。Custom 模式是状态。数字不每键 clamp。读 FormItem；出错写 `aria-invalid`。假 `--tiger-croneditor-*` / `--tiger-danger` 删掉。
- **TimePicker**：open / 草稿 / range 两步 / Now 下沉 core。列点不立刻 `onChange`，OK 才提交；空值是 `null`。`minTime="09:30"` 能选 09 再选 30。12 小时制小时列含 12；`parseTime` 认 `02:30 PM` / locale dayPeriod。locale 只收官方对象，13 套包带 `timePicker.period`。读 FormItem；打开不当 blur。弹层 dialog + trap + DatePicker 同一套 sheet 遮罩。按断点只挂桌面 listbox 或小屏原生 select。chrome 复用 Input。React `forwardRef` / Vue `expose({ focus, open, close })`。
- **Cascader**：open / 选中 path / 搜索 / 列焦点下沉 core。非受控 `defaultValue`，未选是 `undefined`。读 FormItem；combobox 在焦点节点上。列导航读 `dir`。`listHeight` 管每一列。小屏全屏有 Done。空态走 `empty.noResults`。React `forwardRef` / Vue `expose({ focus, open, close })`。
- **TreeSelect**：open / 选中 / 搜索 / expandedKeys 下沉 core，flatten 复用 `tree-utils`。下拉是 tree。键盘走 `getTreeKeyboardAction`（含 `dir`）。读 FormItem。多选 checkbox + `checkStrictly` / `checkStrategy`。空态走 `empty.noResults`。React `forwardRef` / Vue `expose({ focus, open, close })`。
- **AutoComplete**：`value` 只表示已提交值，输入框走 `searchValue`；打字不再每键 `onChange`。未选是 `undefined`，`''` 是合法值。补 `defaultValue` / `open` / `defaultOpen` / `onOpenChange`（Vue `v-model:open`）。失焦离开 input+listbox 关层。`allowFreeInput={false}` 只在点选、Enter 高亮或 blur 匹配成功时提交。读 FormItem；id/aria/`name` 在 combobox input。弹层复用 Select overlay（`fullscreen-sm`、host 链、`listHeight`）。空态走 `empty.noResults`。React `forwardRef` 到 input；Vue `expose({ focus, open, close, input })`。
- **Select**：open / 选中 / 搜索 / activeIndex 下沉 core。非受控 `defaultValue`，`open` 真受控。`''` 是合法值，未选是 `undefined` / `[]`。读 FormItem；combobox 语义在焦点节点上，选项走 `aria-activedescendant`。搜索即时、`onSearchChange` 才 debounce。虚拟列表把组头和选项放进同一窗口。`listHeight` 管面板。文案走 `locale.select`。React `forwardRef` / Vue `expose({ focus, open, close })`。
- **Input 族（Input / InputGroup / Textarea / InputNumber）**：React 把 ref 转到原生控件，Vue expose `focus`/`input`。`readOnly` 与 `readonly` 同一属性。clear 与密码钮并排，文案走 `locale.input`，点完还焦。error/count 不再把组接缝打到 `w-full` 空壳；组内 `flex-1 min-w-0`。InputGroup compact 复用 chrome 选择器（`data-tiger-chrome`），单直子保留四角；无名不加 `role="group"`；删除未实现的 `type`/`addonType`。Textarea 有 `status`/`errorMessage`、读 FormItem，autoResize 按 border-box 算高。InputNumber 步进用十进制整数加减；聚焦时保持裸数字；读 FormItem；步进钮 locale + Home/End；逻辑 padding。
- **Splitter**：`sizes` 按值受控（同一组百分数/像素的新数组不会把拖拽弹回）；未传或拿掉 `sizes` 停在最后比例。百分比和均分跟容器走（ResizeObserver）。水平指针和方向键读 `dir`，gutter 跟着指针。键盘也发 `resize-end`。gutter 是带 `aria-valuenow` 和 locale 名的 window splitter；命中区 24px。pane 数以摊平后的子节点为准。删除未实现的 `SplitterPaneConfig`。
- **Resizable**：从被抓的边改尺寸并平移原点（左/上不再往反方向长）。`lockAspectRatio` 按手柄选主轴，clamp 保比例。`axis` 不渲空操作手柄。角手柄不进 Tab。`width`/`height` 传入即受控；未传 default 时从 bounding box 起拖。手柄名走 `locale.resizable`。水平定位用逻辑 inset。
- **Carousel**：`infinite` 的 scroll 轨道用首尾 clone + 关 transition 瞬移，末张再 next 不再整段倒带。水平几何走逻辑方向（transform 符号、箭头 `start`/`end`、swipe 读 `dir`）。圆点是真 tab（`role="tab"` + `aria-selected` + 方向键，只有当前项进 Tab）。非当前页和 clone 同时 `inert` + `aria-hidden`。无名不是 landmark。开 autoplay 时有可聚焦暂停；hover/focus 暂停拆开；`autoplaySpeed<=0` 和 `prefers-reduced-motion` 都不自动播。手势只走 pointer（capture / cancel）。控件色走 surface/text token；`overflow-hidden` 只在视口。Vue 导出 `CarouselProps` / `CarouselMethods`。文案走 locale（含 `roleDescription` / 暂停），不再启发式「图片轮播」。
- **布局原语 B（Descriptions / List / ScrollArea / Masonry / PrintLayout）**：Descriptions 竖向也按 `column`/`span` 排格，冒号走 locale，标题绑表，列数跟容器。List 外框/分割线拆开，分页受控，拖拽用数据源下标和手柄，loading 不卸项，空态不是 live region。ScrollArea 滚轮落到视口、键盘滚动、逻辑横轴、双轴让角、不溢出不进 Tab。Masonry 跟容器宽、换列不卸子树、全 0 高度保持 round-robin。PrintLayout 写入 `@page`、屏幕看得见页眉页脚、断页节点打印仍在。
- **布局原语 A（Space / Divider / AspectRatio / Skeleton / Card）**：AspectRatio 根默认裁切媒体，不必调用方再写 `overflow-hidden`。Skeleton `wave` 真扫光并进 reduced-motion；默认尺寸走 class，用户 `style.height` / `h-*` 生效；`custom` 无默认几何。Card `hoverable` 不再假装按钮，`onClick`/`href` 才进 Tab；封面自己裁圆角，根不 `overflow-hidden`。竖 Divider 在默认 Space 里 `self-stretch`；gradient 吃 `color`/`thickness`。Vue Space/Divider 声明 `className`。
- **Layout 壳 + Grid**：有 Sidebar 直子（或 `hasSider` / `direction="horizontal"`）时根横排，嵌套内层不再贴一份 `min-h-screen`。`fullHeight` 才是视口壳，Content 吃剩余高度并自己滚。Header / Footer 未传 `height` 不写 inline；玻璃变体替换不透明底并 sticky。Sidebar 逻辑边框、`collapsedWidth="0px"` 时 inert 离 Tab，未传名走 locale，内层 Menu 跟随折叠。Content / Footer 有 `as`。Row 缝改为 CSS gap，数字 gutter 只开横缝；Col 传入 `flex` 即走 flex 项，`span={0}` 隐藏，offset 逻辑边。删除 `getGutterStyles` 与负 margin 链。Container `full` 与 `false` 分道，宽度读 `--tiger-breakpoint-*`。React 壳与栅格转发 ref。
- **Avatar / AvatarGroup**：`src` 变化清 error，不必换 `key`。图片名落在 `img alt`（`text` / `aria-label` 也算）。`onLoad` / `srcSet` 绑 img；React 转发根 span ref。未传 `bgColor` 且有 `text` 时 `generateAvatarColor` 同名同色（canonical token）。`#`/`rgb()`/`var()` 走 style。CJK 才双字，`José` 是 `J`。组叠缝逻辑 margin；`shape` 进 context；overflow `role="img"`；`max` 只计 Avatar；`max={0}` 无负边距。Vue 只摊 Fragment、丢掉 Comment。
- **Badge**：按 `type` 决议内容（text 不被 `max` 封顶；非法数字隐藏）。默认不是 live region。叠放 class/ref 在包装上，隐藏计数包装仍在。`right`/`left` 跟阅读方向。实心字混向 `--tiger-text` 过 AA。
- **Tag**：去掉 `role="status"`。关闭只通知父级，不内部隐藏；`visible={false}` 才不渲染。关闭名走 locale。React 转发 ref；关闭钮 `focus-visible`。`pill` 全圆角。尺寸读 `--tiger-component-tag-*`。浅底状态字混向 `--tiger-text` 过 AA。删除 `formatBadgeContent` / `shouldHideBadge`（改 `resolveBadgeContent`）。
- **ImagePreview / ImageViewer 一套全屏看图**：同一棵 overlay dialog（portal host 链、滚锁、焦点陷阱、Escape 栈、`OVERLAY_Z_INDEX.modal`）。ImageViewer 是配置别名（`minZoom`/`maxZoom` → `minScale`/`maxScale`，`onClose` 仍在关时触发）。指针手势一份（capture + document pointermove）；滚轮 `applyWheelZoom` 且 `{ passive: false }`。`currentIndex` 夹紧；空 `images` emit 关闭；切图/重开清变换；到头 disable 不循环。`images` 支持 `{ src, alt? }`；chrome 走 `locale.imageViewer`；导航/关闭用逻辑 inset。删除第二套 DOM、`ImagePreviewToolbarAction`、`clampZoom`、假 `--tiger-image-mask` token。
- **Image / ImageGroup**：默认 preview 是可聚焦 `<button>`，读屏名走 `locale.image`（不再写死 Preview image）。preview 开启时内层 img `alt=""`。`onLoad` / `srcSet` / `sizes` 落在 `<img>`，React `forwardRef` 指向 img。fallback 二次失败走 error 槽；加载中用 spinner 叠在 img 上，不再画损坏图标。`previewTrigger="hover"` 仍可用 focus 和 click。ImageGroup 按实例 id 登记（重复 src 合法），登记表走 state；`getImageGroupClasses` 合并而非替换；组 `preview={false}` 时子图不是按钮。
- **Marquee**：clone 同时 `inert` + `aria-hidden`，Tab 只落在第一份。无名默认不是 landmark（删硬编码 `Scrolling content` / `DEFAULT_MARQUEE_ARIA_LABEL`，短语在 `locale.marquee.ariaLabel`）。横向 `left`/`right` 走逻辑方向；纵向视口吃第一份，repeat 不再撑高。`repeat < 2`（含 0）静态一份；短内容不自动铺满。`pauseOnHover` 只管指针，焦点暂停是 `pauseOnFocus`（默认开）；受控 `paused`。style inject 以 DOM 节点为准，React `useLayoutEffect` / Vue `onMounted`。
- **排版 + Icon**：Icon fill 不再描边；SVG 构造与 1.5 线宽在 core。Link `_blank` 合并安全 rel、disabled 保留 href、静止态下划线。Text `align` 用 start/end，非法 tag 回退 `p`。Code 复制状态、live region、逻辑 end。Kbd 组合键可读名；Highlight 保树，`global={false}` 是每个 keyword 一次。
- **Button / ButtonGroup**：变体 class 只在 core `resolveButtonClasses` 决议，非法 variant 回退 primary；实心字走 on-color，键盘环只留 `focus-visible`。`htmlType` 与原生 `type` 同一属性（冲突时 htmlType 胜出）；React 转发 button ref。loading 不再设原生 `disabled`（可聚焦、`aria-busy`、吞掉 click）。图标按 `iconPosition` 改 DOM 顺序。组圆角 `first-child:not(:last-child)` + 逻辑属性，InputGroup compact 共用 `getJoinedGroupItemClasses`；直子必须是 Button。
- **Form 一份引擎 + FormItem 接管显示**：校验、依赖重验、debounce、history 收成 `createFormEngine`；Vue/React `<Form>` 与 `useFormController` 共用。`<Form controller={ctrl}>` 真的绑同一份值。`setValueByPath` 与 get 成对；`fieldDependencies` 收 `Map | Record`。`undoable` 每次提交自动 snapshot，history 深拷贝。隐藏/禁用字段清 error 仍拓扑重验；环 visited 切断。`type: 'number'` 拒绝 boolean/array；`Invalid Date` 失败；`/g` 不再吃 lastIndex。debounce `cancel()` 改为 reject。FormItem 注入 `value`/`modelValue` + change，不绑 Input 时 `resetFields` 仍清空。错误只从 FormItem 出；`inlineMessage={false}` 关行内红字。`<form noValidate>`、`aria-busy`、`fieldset disabled`、提交失败 focus 第一项 invalid。`labelPosition` 默认 `'left'`（label 在控件前）；`'right'` 把 label 放到控件后。删死 `dynamicFields`。根入口导出 `useFormItemControlContext` / `FORM_ITEM_CONTROL_INJECTION_KEY`。
- **指针会话 + 列表拖拽原语**：`createDocumentDragSession` 改为 pointer（含 cancel / Escape / 阈值 / 锁轴 / capture）。Splitter、Resizable、ScrollArea、Modal 共用这一份，不再手写 `mousemove`。List / Tree / FileManager / `useDrag` 共用 `createListReorderController`（`setData`、项上 drop、跨容器共享会话）。删除未实现的 `ghostClass` / `scrollSpeed` / `scrollMargin` 和 `applyFileDragReorder`；越界 `moveItemBetweenContainers` 返回 `null`。子路径 `./useDrag`。
- **`useControlledState`**：options 对象（`value` / `defaultValue` / `onChange` / `postState`）。同拍 updater 累加；同值不发 `onChange`；受控切省略保留最后展示值。`undefined` 非受控，`null` 合法空。Vue `modelValue` 默认改为 `undefined`。根入口导出 `SetControlledState` / `UseControlledStateOptions`，子路径 `./useControlledState`。
- **Overlay 基础设施**：Vue `placement` / `offset` 打开后仍跟 props。Portal 目标链为最近 overlay-host → ConfigProvider 根 → `document.body`；body portal 也包 layer+host。一份 focus trap（空列表仍拦 Tab）+ 全屏 `inert`。ID 可重置或走 `useId`。scroll lock 按 Document 并补偿滚动条。`OVERLAY_Z_INDEX` 一层尺度（viewport < overlay < modal < message < loading-bar）。删除未使用的 `applyFloatingStyles`；Vue `useFloatingPopup` 与 React 对齐为 `usePopup`。
- **ConfigProvider 文档所有权**：`TigerConfig` 与方向决议下沉 core（显式 `direction` → 本层 locale.direction → 按本层 locale id 推断 → 父级）。只有最外层仍挂着的 ConfigProvider 写 `html` 的 `dir` / `lang` / 主题；内层只改 context；卸载 restore 含停掉 `colorScheme="auto"` 的 media 监听。React 在 render / `useLayoutEffect` 对齐 Vue immediate。失败暴露 `localeLoadError`。`theme="modern"` 与 F-001 开关等价。
- **Locale / i18n 一条事实源**：内置 13 套语言包都是与 en-US 同叶子的完整对象，不再经 `defineLocale` 用英文填洞。`get*Labels` 只读 `overrides ?? locale.section ?? en-US`，禁止 `startsWith('zh')` / 中文句子启发式；zh-TW 缺键不再灌简体。`mergeTigerLocale` 与 `TIGER_LOCALE_KEYS` 从 `TigerLocale` 对齐（含 `dataExport`），`undefined` 不擦基值。`createTigerLocaleScope` 下沉 core，Node 默认不装进程全局栈。删除成对 `DEFAULT_*` / `ZH_CN_*` 文案常量；Rate `{plural}` 走 `Intl.PluralRules`。`common` 增补 `closeMessageAriaLabel` / `closeNotificationAriaLabel`。
- **Theme / tokens 一条事实源**：`tokens.json` 生成 default 预设与组件正在读的 `--tiger-*` 别名（primary 统一为 `#2563eb`）。`ThemeManager` 按类型注释 merge default 段，切 dark 不再丢掉 radius/motion。Tailwind plugin 写入完整预设（含非颜色）。`setTheme('modern')` 与 `@plugin ".../tailwind/modern"` 是同一开关。运动只留 `--tiger-transition-*` / `--tiger-motion-duration-*`。新增 on-color 与 error hover token；删从未写入的 `--tiger-tag-*` / `--tiger-alert-*` 假名。内置主题改为 `registerBuiltInThemes()` / ThemeManager 惰性注册。生成物不再包含 `tailwind-tokens.js`。

## v2.1.2

v2.1.2 patch：下游 Tigercat_Admin 上游建议 4–6 的 locale/labels 补齐（ColorPicker、Select、富文本/Markdown 工具条）。本版本无 breaking change。建议 1–3（Notification `actions`、BackTop `position`、FloatButton `floating`）已在 v2.1.0 / v2.1.1 落地。

- **同步 `.size-limit.json` 预算（v2.1.2 实测）**：`Core (full)` 140→142 kB（实测 141.01）、`Vue (full)` 315→316 kB（实测 315.55）、`React (full)` 351→352 kB（实测 351.52）、`Core locale (zh-CN)` 4→5 kB（实测 4.03）；若干含子路径因 locale-utils 增补略超，一并按实测上调。
- **ColorPicker `labels` / locale（触发器 / 面板标题 / 清空）**：Vue / React 经 `getColorPickerLabels` + ConfigProvider locale 解析触发器 `aria-label`/`title`、面板标题、清空钮以及 Hue / Alpha / 色值 / 预览 / 预设 chrome。无 locale 回落英文 `Pick color` / `Color` / `Clear`；`locale=zh-CN` 为「选择颜色 / 颜色 / 清空」。可选 `labels` 覆盖。清空发出空字符串。13 套内置 locale 增补 `colorPicker` 分区。公开 API 增补，无新必填 prop。
- **Select locale `placeholder` / `emptyText`**：`TigerLocaleSelect` 增补占位与空选项文案键。未传 `placeholder` / `emptyText` 时走 ConfigProvider locale；无 locale 仍为 `Select an option` / `No options found`；`locale=zh-CN` 为「请选择 / 暂无选项」。显式 prop 与 `labels` 仍优先。13 套内置 locale 同步。公开 API 增补，无新必填 prop。
- **RichTextEditor / MarkdownEditor 工具条 labels**：内置工具条 Bold / Italic / 标题 / 列表等走 `getRichTextEditorLabels` / `getMarkdownEditorLabels`。无 locale 仍为英文；`locale=zh-CN` 为「加粗 / 斜体」等。自定义 `toolbar` 仍用调用方文案；可选 `labels` 覆盖。公开 API 增补，无新必填 prop。

## v2.1.1

v2.1.1 patch：v2.1.0 之后的 Pages + source 审查修复（暗色 chrome、受控绑定、overlay 视口、无障碍/行为修复）。本版本无 breaking change。

- **同步 `.size-limit.json` 预算（v2.1.1 实测）**：`Core (full)` 136→140 kB（实测 139.79）、`Vue (full)` 308→315 kB（实测 314.74）、`React (full)` 344→351 kB（实测 350.67）、`React Menu` 33→34 kB（实测 33.14）。
- **Tooltip / Popover hover 关层加 delay，指针可移入浮层**：默认 hover 的 Tooltip 与 `trigger="hover"` 的 Popover（Vue/React）离开 trigger 后延迟 100ms 再关，并把 trigger + Teleport/portal 浮层当作同一 hover 组；指针穿过默认 8px 间隙进入浮层会取消关闭。Click / Esc / focus / manual 仍立即开关。公开行为修复。无新必填 prop。
- **CommentThread 内部 liked/likes overlay**：裸 CommentThread（Pages `/comment-thread` 01，无 `@like` / `onLike`）点「点赞 3」变为「已赞 4」/ Like 3 → Liked 4，仍发出 `like` / `onLike`，不改 `nodes`。绑定示例 02 的父级回写仍可用且不重复计数。Vue/React。公开行为修复。无新必填 prop。
- **RadarChart splitArea 不再用 `var(--tiger-bg,#fff)` 挖洞**：内外环改成 evenodd 透明环路径（`createPolygonRingPath` / `createCircleRingPath`），暗色页不再露出白/薄荷盘。默认 `RADAR_SPLIT_AREA_COLORS` 不再用 `rgba(0,0,0,0.02/0.05)`，改走 `color-mix` + `--tiger-text`（可选 `--tiger-chart-split-*` 覆写），暗色跟主题。Vue/React。公开视觉修复。无新必填 prop。自定义 `splitAreaColors` 未改。
- **Splitter gutter chrome 走 token，`gutterSize` 接到视觉宽度**：gutter 不再硬编码 `bg-gray-200`，把手不再硬编码 `bg-gray-400`，改走已注册 `--tiger-border` / `--tiger-text-muted`。公开 `gutterSize`（默认仍 4）写入 `--tiger-splitter-gutter`，水平 gutter 宽 / 垂直 gutter 高跟随该值，不再锁死未赋值的 `4px` fallback。Vue/React。公开视觉 + 行为修复。无新必填 prop。受控 `sizes` 覆盖拖拽未改。
- **Upload drag 模式尊重默认插槽 / children**：`drag` 为 true 且提供默认插槽 / children 时，拖拽区内只渲染该内容（Pages `/upload` 02「点击或拖拽文档到此处」可见），不再叠 locale「Click to upload / or drag and drop」；无插槽时仍回落 SVG + locale 提示 + accept/maxSize。拖拽区 / 上传按钮 chrome 不再硬编码 `bg-white` / `border-gray-300`，改走已注册 `--tiger-surface` / `--tiger-border`。Vue/React。公开行为 + 视觉修复。无新必填 prop。未绘制 `file.progress` 进度条。
- **Code copy / copied / failed 走 `getCodeLabels`，剪贴板失败可见**：无 locale 回落英文 Copy / Copied / Copy failed；zh-CN / ConfigProvider zhCN 仍为「复制 / 已复制 / 复制失败」。剪贴板失败显示 failed 态（error token + Copy failed），不再停在 idle 也不看起来像成功；成功仍只在写入成功时发 `copy` / `onCopy`。显式 `copyLabel` / `copiedLabel` / `copyFailedLabel` 仍优先。Vue/React。公开行为修复。无新必填 prop。
- **Pagination `showTotal` 默认文案走 `getPaginationLabels` / `formatPaginationTotal`**：未传自定义 `totalText` 时始终格式化 `labels.totalText`，不再在无 `locale.pagination.totalText` 块时回落硬编码中文 `defaultTotalText`。无 locale 回落英文 `Total N items`；zh-CN / ConfigProvider zhCN 仍为「共 N 条」；自定义 `totalText` 函数仍优先。`defaultTotalText` 改为英文 DEFAULT 模板。Vue/React。公开行为修复。无新必填 prop。
- **FormWizard clickable clicks resolve via findNextUnskippedStep so skipCondition/disabled cannot be landed on**：`handleStepChange` 与 Next/Prev 一样走 `findNextUnskippedStep`（从被点索引沿方向走），不再只拦 `disabled` 后直接落地。Vue/React。公开行为修复。无新 prop。
- **ChatWindow / CommentThread / ActivityFeed / NotificationCenter 默认文案走 ConfigProvider locale**：与 FormWizard / TaskBoard 相同，经 `mergeTigerLocale` + `getXxxLabels` + `resolveLocaleText` 解析；可选 `locale` / `labels` 覆盖。无 locale 时回落英文（Send / Like / No activity / Mark all as read）。zh-CN 仍为原来的中文（发送 / 点赞 / 暂无动态 / 全部标记已读）。Pages Lang=English 时 Chat 发送钮不再停在中文。既有 string props 仍优先。Vue/React。公开 API 增补 + 行为修复。无新必填 prop。
- **Chart `responsive` 观察父级后重算 plot scale / innerRect**：Bar / Line / Area / Scatter 用 ChartCanvas 解析后的宽高（ResizeObserver + rAF）重建 band/point/linear scale 与网格/轴，而不只是拉大 SVG `width`/`height`/`viewBox`。Pages `/bar-chart` 01 不再把 420×240 的柱子留在约 926×688 SVG 的左上角。自定义 `xScale`/`yScale` 仍按传入 range 使用。ChartCanvas 通过 React `onResolvedSizeChange` / Vue `resolved-size-change` 报告解析尺寸。`responsive` 默认仍为 false；观察前仍用 `width`/`height` fallback。Vue/React。公开行为修复。无新必填 prop。
- **Chart `showTooltip` 默认悬停出框，不再要求 `hoverable`**：`showTooltip`（默认 true）悬停数据点即打开 ChartTooltip；`hoverable`（默认仍 false）只控制高亮 / 透明度 / 公开 hover 事件。`showTooltip={false}` 仍不出现浮层。Pages `/bar-chart` 02、`/heatmap-chart` 02 悬停可见 `A: 10` / 格值框。Vue/React。公开行为修复。无新公开 prop。`responsive` / tooltip chrome 未改。
- **Gantt 拖条改 `start`/`end`（保时长、本地日吸附、夹到 min/max）**：非 disabled 条 pointer 拖动；松手按像素换算日期（`ganttPxToMs` / `shiftGanttTaskDates` / `moveGanttTaskByPx`）。Vue `update:data` + `task-change`；React `onDataChange` + `onTaskChange`。未回写的 `data`（Pages `/gantt` 01/02 静态数组）用内部 overlay 保住新日期，条 `x` 会动。零位移仍走原 click/select。无新 `draggable` prop。行斑马/轴文案未改（A0 已把 `--tiger-fill` / `--tiger-text-muted` 别名到 surface-muted / text-secondary）。Vue/React。公开 API 增补 + 行为修复。
- **Table 排序键盘可达，`sortData` / `filterTableData` 读 `dataKey`**：可排序表头改为真实 `<button type="button">`（`data-tiger-table-sort`，Tab/Enter/Space），`aria-sort` 仍在 `<th>`；`sortData`（可选第 5 参 `columns`）与 `filterTableData` 按 `dataKey` 否则 `key` 取值，对齐单元格/导出。Vue/React。公开行为修复。无新公开 Table prop。
- **Tour 有 target 时点遮罩可关，Vue 最后一步也发 `close`**：dimmed mask 改为全屏可点节点（`data-tiger-tour-mask`）并用 clip-path 挖洞露出 target，不再靠 `pointer-events:none` 的 box-shadow spotlight；无 target 的 fallback 与 `step.mask === false` 不变。Vue 最后一步 Finish 在 `finish` 之外兼发 `close`（对齐 React `onClose`）。Vue/React。公开行为修复。无新公开 prop。
- **Cascader / TreeSelect 非虚拟列表键盘选值，清空钮为 trigger 兄弟**：打开后面板 Arrow/Enter（及 Space）可移动并提交当前项；清空控件改为 combobox trigger 的兄弟 `<button>`（`data-tiger-cascader-clear` / `data-tiger-treeselect-clear`，对齐 Select）。Vue/React。公开无障碍/行为修复。无新公开 prop。
- **`parseDate` 将 `YYYY-MM-DD` 按本地日历日解析**：date-only ISO（可带首尾空白）用本地 `Date(year, monthIndex, day)` 午夜，不再走 `new Date(string)` 的 UTC 午夜；西时区下 DatePicker min/max/value 字符串与 Calendar/DatePicker 键盘 `data-date` 不再少一天。非法日历日（`2024-02-30`、非闰年 `02-29`）返回 null。Vue/React 消费共享 helper。公开行为修复。无新公开 prop。
- **Collapse 折叠面板 `inert` + `aria-hidden`，extra 点击不再切换**：折叠态内容包装层（`data-tiger-collapse-content`）带 HTML `inert` 与 `aria-hidden="true"`，关闭面板正文离开 a11y / 焦点树；展开时两者都不写。header 内 extra（Pages `/collapse` 03「已更新」）点击 `stopPropagation`，不再切换面板。Vue/React。公开无障碍/行为修复。无新公开 prop。
- **Menu 默认 `theme="light"` 跟随 `html.dark`**：不再把 `--tiger-surface`（及 `--tiger-text` / `--tiger-text-muted` / `--tiger-border` / `--tiger-surface-muted`）锁成浅色 hex；默认继承页面 token。Pages `/menu` 01/03 暗色跟 surface。显式 `theme="dark"` 仍强制深色 chrome。Vue/React 消费 core helpers。公开视觉/主题 chrome 修复。无新公开 prop。
- **Message / Alert 暗色 chrome 跟 surface + status**：info/success/warning/error 的 bg fallback 改为已注册 `--tiger-surface`，字/图标走已注册 `--tiger-info` / `--tiger-success` / `--tiger-warning` / `--tiger-error`（或 `--tiger-text`），边框走 `--tiger-border`；Alert description 走 `--tiger-text-secondary`，关闭钮 hover 走 `--tiger-surface-muted`。暗色 Pages `/message` / `/alert` 不再锁浅粉彩卡片。可选 `--tiger-message-*` / `--tiger-alert-*` 仍只作一层覆写，不注册进 `THEME_CSS_VARS`。Vue/React 消费 core maps。公开视觉/主题 chrome 修复。无新公开 prop。
- **Pages overlay 示例 iframe 加高**：DatePicker / TimePicker / Cascader、Tour、Loading 区域+全屏、Spotlight / Dropdown、CropUpload 的 Vue / React `demo.json` 把 `viewport.minHeight` 提到 560；Modal / Drawer 提到 720（仍 `mode: auto`，不设冻结 `height`），弹出日历 / 级联列 / 对话框 / 抽屉 / 引导 / Spotlight / 裁剪 Modal 不再困在 120–180px iframe 里。loading/01 内联、loading-bar / message / notification、DemoBlock chrome、sandbox `allow-same-origin`、srcdoc `dark:` 未改。仅示例 / Pages 视觉修复。无公开组件 API 变化，无主题变量变化。
- **ImagePreview 预览图 90vh/90vw 约束，Pages 预览 iframe 加高**：Vue / React 预览 `<img>` 由 `max-w-none` 改为 `max-h-[90vh] max-w-[90vw]`，组图/独立预览不再被裁成无限宽横条。Pages `/image` ImageGroup / ImagePreview 与 `/image-viewer` 示例把 `viewport.minHeight` 提到 560（仍 `mode: auto`，不设冻结 `height`），iframe 底足以放下该 90vh 盒。ImageViewer img 类本就有该约束；工具条未改。公开视觉修复。无主题变量变化，无新公开 prop。
- **SunburstChart `showLabels` 在弧中点绘制标签**：Vue / React 默认 `showLabels`（true）在每段弧的 `midAngle` 与环中径处绘制 SVG `<text>`，Pages `/sunburst-chart` 外环可见中国/日本/印度等子层名称，不再只有 path。React 不再把 prop 绑成 `_showLabels`。`showLabels={false}` 仍无文字。公开行为修复（死 API 现已生效）。无主题变量变化，无新公开 prop。
- **React Table `virtual` / `autoVirtual` 滚动盒对齐 Vue**：`height` + `overflow:auto` 只包表体（colgroup/header/body/summary），导出钮与 Pagination 留在外层 wrapper、不进滚动盒。公开行为修复。无主题变量变化，无新公开 prop。
- **FloatButton 默认 plus 图标与 Group placement/offset/portal**：无 children / 默认插槽时渲染 plus SVG。FloatButton.Group 接受 `placement` / `offset`（与独立 FloatButton / BackTop 同一套 viewport helpers，默认 `bottom-right` / 24）以及 `portal`（默认 true；`false` 时就地 `absolute` 定位，相对祖先可装下）。Pages `/float-button`「悬浮按钮组」留在 `h-56` 盒内，空圆/空方不再无图标。公开 API 增补 + 行为修复。无主题变量变化。
- **Anchor / ScrollSpy 当前项按 offset 线取最后一项**：Vue / React 的 active href 是文档序中最后一个 section top 位于 offset 线（`rootTop + offsetTop/targetOffset + bounds`，默认 5）之上或正好压线的项，不再取顶部 40% 带里第一个相交项。点击后锁住当前项直到程序化滚动结束（`scrollend`，否则 scroll idle + 安全超时）。公开 `bounds` 接到 IntersectionObserver 路径。Pages `/anchor`「容器滚动」点「发布」与 `/scroll-spy` 末项保持高亮。公开行为修复。无主题变量变化，无新公开 prop。
- **DropdownItem `closeOnClick`**：Vue / React 的 DropdownItem 现接受可选 `closeOnClick`（Vue `:close-on-click`）。设置后覆盖父级 Dropdown `closeOnClick`；省略则继承父级（默认 true）。Vue 示例 02「保持展开」现在保持展开；React 示例 02 对齐为同一 item 级 API。公开 API 增补。无主题变量变化。
- **Affix `offsetBottom` 相对 target 容器底钉住**：Vue / React 经 core `calculateAffixState` 把已固定的 `bottom` 写成 `innerHeight - containerRect.bottom + offset`，钉在 `target` 容器底边上方 `offset` px，不再钉视口/iframe 底。Window target 时 `containerRect.bottom === innerHeight`，`bottom` 仍是 `${offset}px`。`offsetBottom` 的 sentinel 放在内容底（affixed 时在 placeholder 后）。公开行为修复。无主题变量变化，无新 prop。
- **Vue Radio group `disabled` 继承**：Vue Radio 将 `disabled` 视为 true 或继承 RadioGroup `disabled`（OR，对齐 Checkbox）。Boolean 省略是 `false`，旧的 `!== undefined` 永不继承 group，radio 仍可聚焦而 group onChange 会 bail。React 本就正确继承，未改。公开行为/无障碍修复。无主题变量变化，无新 prop。
- **InputNumber leftover attrs 落到 spinbutton**：Vue / React 把未声明的 HTML attrs（`aria-label`、`data-*` 等）转发到 `role="spinbutton"` 的 input 上。Vue `inheritAttrs:false` 原先只把 `class` 合到 wrapper；React 丢掉未声明 attrs。`class` / `className` 仍作用在 wrapper。公开无障碍/属性转发修复。React props 类型放宽为可接受原生 input 属性（`size`/`value`/`onChange`/`min`/`max`/`step` 等已 Omit）。无主题变量变化，无新具名 prop。
- **MaskInput `name` 提交 raw**：Vue / React 在设置 `name` 时渲染隐藏 input 提交 raw 值，可见框只展示掩码且不带 `name`，原生 form 提交 `12345678` 而不是 `12/34/5678`。公开行为修复，对齐既有 `name` JSDoc；无主题变量变化，无新公开 prop。
- **Signature 拖出垫面结束笔画**：Vue / React 在 pointerdown 时对 canvas 调用 `setPointerCapture`，并在 `lostpointercapture` 与 document `pointerup`/`pointercancel` 上走同一条 `finishStroke`，拖出垫面不再把 `activeStroke` 卡住。公开行为修复，无主题变量变化，无新公开 prop。
- **Input `errorMessage` 移到字段下方**：Vue / React 不再用 `absolute inset-y-0 right-0` 把错误文案叠在值区里；错误节点作为 chrome 边框盒的兄弟（`w-full` 外壳内，顺序为 error 再 count）渲染在字段下方，并带 `aria-live="polite"`，输入框仍用 `aria-describedby` 指向该节点。Clear / 密码显隐 / suffix 在有错误时仍可用。MaskInput 共用 `getInputErrorClasses`，错误节点同样改为块级并加 `aria-live`。公开视觉/无障碍修复，无主题变量变化，无新公开 prop。
- **InputGroup compact 拼合 Input/Textarea**：Vue / React 经 core 类串把 compact 从 `[&>*:focus]` 改为 `[&>*:focus-within]`，并用 `!rounded-*` 压过 token 半径。Input 把边框/圆角/表面/状态边框/`focus-within` 焦点环提到现有 wrapper（原生 input 为无边框字段）；Textarea 在无 `showCount` 时以 textarea 自身为根（字数仍在边框盒外）。Pages `/input-group` 01 的 Input+Button 不再各自胶囊。InputNumber 根本就是边框盒，未改。公开视觉/行为修复，无主题变量变化，无新公开 prop。
- **Vue Input `clearable` + `showPassword` 双钮错开**：Vue 两钮同时可见时清除钮左移一档图标槽（`right-8`/`right-10`/`right-12`），密码显隐仍在 `right-0`，字段改用双槽 `pr-16`/`pr-20`/`pr-24`，不再叠在同一像素。仅单钮时仍 `right-0` + 一档 `pr-*`。React 本就只渲染一个（clear 优先），未改。公开视觉/行为修复，无主题变量变化，无新公开 prop。
- **TaskBoard 过滤下落点映射回源列**：Vue / React 在 `moveCard` 前把 `filterText` 可见卡的 drop index 映射回未过滤列（core `mapVisibleCardIndexToSource`）；Pages `/task-board` 02「列拖拽与自定义卡片」过滤「发布」后再拖到可见末位，不再插进隐藏卡槽。`getDropIndex` 仍读可见卡 rect（指示条位置不变）。公开行为修复，无主题变量变化，无新公开 TaskBoard prop；core 增补该 helper。
- **Vue ChatWindow 去掉 onUpdated 滚底**：auto-scroll 只跟 `messages.length`（加首次 `onMounted`），用户离开底部后跳过；受控 `v-model` 逐字输入不再把 Pages `/chat-window` 02 历史拽回最新气泡。React 本就只跟 `messages.length`。公开行为修复，无主题变量变化，无新公开 prop。
- **ScatterChart `animated` 非 circle 入场保留 translate(cx,cy)**：Vue / React 把 square / triangle / diamond 的 `translate(cx,cy)` 放在包裹 `<g>` 上，入场 CSS `transform:scale()` 只作用在内部 `<path>`（路径以 (0,0) 为中心），不再覆盖 SVG 位移。Pages `/scatter-chart` 01 菱形停在数据映射位置，不再堆在绘图区左上；circle 仍用 `cx`/`cy` 入场。公开视觉/行为修复，无主题变量变化，无新公开 prop。
- **OrgChart `direction=horizontal` 保持 nodeWidth × nodeHeight**：Vue / React 经 core `flipLayoutNode` 横向布局只交换 x/y，节点盒保持 `nodeWidth` × `nodeHeight`（默认 160×72），不再把卡片拧成 72×160 竖条。Pages `/org-chart`「组合展示」横卡可完整显示姓名与职称。公开视觉/行为修复，无主题变量变化，无新公开 prop。
- **Calendar 年视图月份芯片 emit 该月 1 日并按 disabledDate 禁月**：Vue / React `mode="year"` 点击（及 Enter/Space）月份芯片会通过 `update:modelValue` / `change` / `onChange` 写出该月 1 日（本地 Date），并仍发出 `panel-change` / `onPanelChange`。`disabledDate` 在该月每一天都被禁时禁用该芯片（周末-only 不会禁任何月）。示例 02 改为全屏月视图以展示周末禁日。Pages `/calendar` 禁用日期块可见周六/周日不可选。公开行为修复，无主题变量变化，无新公开 prop。
- **Splitter `sizes` 解析与初始化 min**：Vue / React 的 `sizes` 现接受像素数字与 `'30%'` / `'200px'` 字符串（经 core `parsePaneSize` / `calculateInitialSizes`）；挂载时对每格 `clampPaneSize(min, max)`，`[30,70]` + `min={100}` 不再是 30px 细条，首次拖拽也不会塌成 `[0,100]`。示例 01–03 改为百分比字符串。Pages `/splitter` 水平/垂直/嵌套展示比例。公开 API 放宽 + 行为修复，无主题变量变化。
- **ColorPicker rgba/hsla 解析与 showAlpha emit**：`parseColorInput` 现接受 `rgba`/`hsla`（及 `hsl`）；Vue / React 用解析后的 RGB+alpha 画触发色块，不再把 rgba 交给 `hexToRgb`。`showAlpha` 滑条会发出带 alpha 的字符串（`update:modelValue` / `onChange`）。Pages `/color-picker`「代表配置」不再是黑块。公开行为修复，无主题变量变化。
- **ImagePreview maskClosable 暗区关闭**：Vue / React 把关闭绑到独立 mask 子节点（`imagePreviewMaskClasses` / `aria-hidden`），点击暗区发出 `update:open` false / `onOpenChange(false)`；独立 mask 不再吞掉点击。`maskClosable={false}` 仍不关。Pages `/image` ImageGroup / ImagePreview 暗区可关闭。公开行为修复，无主题变量变化，无新公开 prop。
- **QRCode 移除未使用的 level**：Vue / React / core 去掉未使用的 `level` prop 与 `QRCodeLevel` 类型；剩余 QRCode 是装饰性哈希矩阵（不可扫描）；Pages `/qrcode` 不再宣传 L/M/Q/H 纠错级别。移除从未生效的死 API，调用方若传 `level` 会被忽略，无主题变量变化。
- **Avatar getInitials 短 token 原样显示**：Vue / React 经 core `getInitials` 对无空格且长度 ≤2 的 `text` 原样（再 `toUpperCase`）显示，`text="TC"` 不再只剩 **T**。Pages `/avatar`「代表外观」方块 logo 与示例一致。公开视觉/行为修复，无主题变量变化。
- **Rate 半星左半裁剪**：Vue / React 半星层保持 `overflow-hidden` 宽 50%，内部 glyph 使用 `w-[200%] h-full`（core `rateHalfStarInnerClasses`），裁出满宽星的左半而不是把 SVG 压进半宽盒。Pages `/rate` 只读 4.5 第 5 颗星不再变瘦。公开视觉/行为修复，无主题变量变化。
- **ButtonGroup 子按钮组选择器**：Vue / React 经 core `buttonGroupItemClasses` / `buttonGroupItemVerticalClasses` 把组根上的 `[&:first-child]` 自选择器改为 `[&>*:first-child]` / last / middle（对齐 InputGroup compact），并用 `!` 覆盖 Button 的 `rounded-[var(--tiger-radius-md)]`，相邻按钮共享直边与 `-ml-px` / `-mt-px` 叠缝，不再各自胶囊。公开视觉/行为修复，无主题变量变化。
- **TaskBoard / Kanban 无 handler 时插入默认卡片**：Vue / React 在 `allowAddCard` 开启且调用方未传 `onCardAdd` / `@card-add` 时插入默认卡并回写 columns（内部态 + `update:columns` / `onColumnsChange`），Pages `/kanban` 01 由 3 张变为 4 张；已提供 handler 时仍由调用方插入（task-board/01 不变）。公开行为修复，无主题变量变化。
- **FileManager 非受控 selectedKeys 内部态**：Vue / React 通过 `defaultSelectedKeys` 保留非受控选择，裸 FileManager（Pages 01）点击会更新 `aria-selected`；只有显式传入 `selectedKeys` 才受控。公开 API 增补，无主题变量变化。
- **Table 默认分页非受控**：Vue / React 默认 pagination 改用 `defaultCurrent` / `defaultPageSize`，裸表（不传 pagination）点 Next 会换行；只有调用方显式传 `current`（及 `pageSize`）才受控。公开行为修复，无主题变量变化。
- **React Upload 受控 fileList 进度回写**：受控时 `customRequest` 的 progress/success/error 经 `notify` 以新数组调用 `onChange(file, nextList)`，Pages `/upload` 自定义上传能绘成功态。Vue 已 `emit('update:file-list')`。公开行为修复，无主题变量变化。
- **React FormItem change 校验先 updateValue**：change 触发 `validateField` 前先把子控件新值写入 `formValuesRef`，同拍读到新值，必填错误不再在第一字后残留。Vue 不变。公开行为修复，无主题变量变化。
- **AutoComplete 受控回写显示 option.label**：Vue / React 在 `searchValue` 未受控时，用 core `resolveAutoCompleteDisplayValue` 把匹配选项的 `label` 同步进输入框，不再把 raw `value` 盖上去；`label !== value`（如 `北京 Beijing` / `beijing`）选中后仍显示 label。`modelValue` / `value` / `onChange` 仍使用 `option.value`。公开行为修复，无主题变量变化。
- **Vue Transfer 兼发 `update:targetKeys`**：`moveRight` / `moveLeft` 同时发出 `update:modelValue` 与 `update:targetKeys`，Pages/示例里的 `v-model:target-keys` 不再停在初始目标项；默认 `v-model` / `update:modelValue` 保持不变。公开 API 增补，无主题变量变化。
- **Switch / Stepper / ColorSwatch 非受控内部态**：两端 Switch、Stepper 与 Vue ColorSwatch 通过 `defaultValue` / `defaultChecked` 保留非受控内部状态，点击后即使父级不回写也会更新 UI；受控 `v-model` / `checked` / `value` 仍可用。公开 API 增补，无主题变量变化。
- **Vue Slider 支持默认 v-model**：同时接受 `modelValue` 并兼发 `update:modelValue`，Pages/示例里的 `<Slider v-model>` 不再停在 min；原有 `v-model:value` / `update:value` 保持不变。公开 API 增补，无主题变量变化。
- **ImageViewer 亮色工具条/导航白底白字**：工具条、左右导航与计数去掉已注册 `--tiger-surface`，改走未注册 `--tiger-image-toolbar-bg` 并以 `rgba(0,0,0,0.6)` 为 last-resort，与 ImagePreview 深色半透明 chrome 对齐。不注册进 `THEME_CSS_VARS`。
- **VirtualList 示例暗色斑马**：virtual-list/01 偶数行去掉锁死的 `bg-gray-50`，改走已注册 `--tiger-surface-muted`，避免暗色页白条浅字。可选 `--tiger-virtuallist-stripe` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **FileManager / Markdown / RTE / Print / ImageAnnotation 暗色 chrome**：FileManager 容器/加载/搜索、Markdown 容器/正文、RTE 容器 fallback 改为已注册 `--tiger-surface`，工具条走 `--tiger-surface-muted`；Print 纸面保持 `bg-white` 并强制深色墨；ImageAnnotation 未选工具钮 bg/text 成对走 `--tiger-surface` / `--tiger-text`，hover 走 `--tiger-surface-muted`。可选 `--tiger-file-manager-*` / `--tiger-md-*` / `--tiger-rte-*` / `--tiger-print-ink` / `--tiger-annotation-tool-*` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **OrgChart 暗色节点填色 / 职称**：节点 fill fallback 改为已注册 `--tiger-surface`，职称与副标题走 `--tiger-text-secondary`，姓名保持 `--tiger-text`，避免暗色页白卡浅字。可选 `--tiger-org-node-bg` / `--tiger-org-label` / `--tiger-org-title` / `--tiger-org-subtitle` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Tree 暗色白底 chrome**：根背景 fallback 改为已注册 `--tiger-surface` 并继承 `--tiger-text`，节点 hover 走 `--tiger-surface-muted`，空态/连线走 `--tiger-text-secondary` / `--tiger-border`，避免暗色页白卡白字。可选 `--tiger-tree-bg` / `--tiger-tree-node-hover` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Layout Content / Container 示例暗色白底**：Content 默认背景 fallback 改为已注册 `--tiger-surface-muted`，layout/01 Container 与 layout/02 Content 去掉锁死的 `bg-white` / `!bg-white`，避免暗色页白底白字。可选 `--tiger-layout-content-bg` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Skeleton 暗色占位条**：条背景 fallback 改为已注册 `--tiger-surface-muted`，wave from/to 同一链，via 走 `--tiger-border`，避免暗色页上浅灰白杠。可选 `--tiger-skeleton-bg` / `--tiger-skeleton-bg-alt` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Loading 全屏遮罩暗色**：fullscreen 默认背景从硬编码 `rgba(255, 255, 255, 0.9)` 改为跟随 `--tiger-surface` 的 90% `color-mix`，暗色页不再盖白布。可选 `--tiger-loading-mask` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Kbd / Tag default 暗色 chrome**：default 背景 fallback 改为已注册 `--tiger-surface-muted`，文字保持 `--tiger-text`，避免暗色页上浅底浅字。不新增 `--tiger-tag-*` theme 变量。
- **Segmented 暗色轨道/指示器**：轨道 fallback 改为已注册 `--tiger-surface-muted`，指示器改为 `--tiger-surface-raised`，避免暗色页上浅轨+深滑块。不新增 `--tiger-segmented-*` theme 变量。
- **主题 CSS 变量别名**：公开 `THEME_CSS_VARS` 增补 `--tiger-text-muted` / `--tiger-fill` / `--tiger-bg`，分别以 `var()` alias 到已有 `--tiger-text-secondary` / `--tiger-surface-muted` / `--tiger-surface`。ThemeManager 与 Tailwind `:root` / `.dark` 共用同一转换 helper，暗色 `--tiger-bg` 跟随 `--tiger-surface`，不新增第三套颜色字段。

## v2.1.0

v2.1.0 minor：完成 Roadmap 批次 1–5。本版本无 breaking change，组件用户无需迁移。公开组件入口现为 172（相对 v2.0.19 基线 149，含批次 1–4 新增入口与子组件）。

- **TreeSelect 虚拟化**：新增可选非破坏 props `virtual`（默认 `false`）、`height`（默认 `400`）与 `itemHeight`（默认 `32`），与 Tree 对齐而非 Select `listHeight`。`virtual` 为 true 时，下拉树的可见扁平行经 Tree 的 `VirtualList` 固定行高路径只渲染可视窗口；展开/折叠、搜索过滤、单选/多选与键盘把焦点行滚进窗口均可用。Vue/React API 对称，默认非虚拟渲染不变。
- **Cascader 虚拟化**：新增可选非破坏 props `virtual`（默认 `false`）与 `listHeight`（默认 `256`，与 Select 一致）。`virtual` 为 true 时，每一列选项面板与可搜索扁平路径列表按 Select 的 fixed-size 策略（`fixedSizeStrategy` / `getRange` + overscan）只渲染可视行；键盘导航时把 active/selected 行滚进窗口。Vue/React API 对称，默认非虚拟渲染不变。
- 新增 **LoadingBar** 反馈组件（批次 4）：顶部加载条（Naive/nprogress 类），命令式离散 API `start()` / `finish()` / `error()` / `clear()`；懒加载 Root facade 与 `ensureContainer` 宿主挂载与 Message/Notification 一致，SSR 安全（无顶层 `window`，`isBrowser` 守卫）；`start` 显示并 trickle 递增，`finish` 拉满后隐藏，`error` 进入错误色后隐藏；`LoadingBarContainer` 为 `progressbar`（polite、`aria-busy`，不抢焦点）；支持 `color`/`height`/`className`/`style` 与可选挂载容器；Vue/React API 对称，不改动现有 Loading/Progress。
- **同步 `.size-limit.json` 预算**：`Core (full)` 131→135 kB、`Vue (full)` 293→305 kB、`React (full)` 328→340 kB，并新增 LoadingBar 子路径预算。
- **同步 `.size-limit.json` 全量包预算（v2.1.0 实测）**：`Core (full)` 135→136 kB、`Vue (full)` 305→308 kB、`React (full)` 340→344 kB，`Vue Highlight` 19→20 kB、`Vue ImageCompare` 26→27 kB。
- **发布检查**：`publish:check` 对 Nuxt 示例的 npm install 使用 `--legacy-peer-deps`，规避 npm 10 arborist 在 Nuxt 4 peer 树上的 `edgesOut` 崩溃。
- 新增 **ImageCompare** 基础组件（批次 4）：before/after 图片对比滑块，支持指针拖动与键盘调整手柄位置；`orientation` 横向或纵向，`position`/`defaultPosition` 受控与非受控，`beforeSrc`/`afterSrc` 或 Vue `before`/`after` 插槽 / React `before`/`after` 节点；复用 Image 家族 `ImageFit` 与 `toCSSSize`；手柄为可聚焦 `slider`（`aria-valuenow` 0–100），图片带 alt；Vue/React API 对称、SSR 安全。
- 新增 **Marquee** 基础组件（批次 4）：循环滚动子内容，默认水平向左，无缝复制轨道；`pauseOnHover` 默认在悬停与 focus-within 时暂停；`prefers-reduced-motion` 下停用动画并隐藏复制段，改为静态可滚动内容；支持 `direction`/`duration`/`gap`/`repeat`，Vue/React API 对称、SSR 安全。
- 新增 **SplitButton** 基础组件（批次 4）：主操作按钮 + 相邻 chevron 触发下拉扩展；复用 Button 与 Dropdown，不另起菜单栈；共用 `variant`/`size`/`disabled`/`loading`/`danger`，菜单项走现有 `DropdownMenu`/`DropdownItem` API，主按钮 click 与菜单开关分离；chevron 触发器带可覆盖的 `triggerAriaLabel`（默认 More options）与 `aria-expanded`；Vue/React API 对称、SSR 安全。
- 新增 **Highlight** 基础组件（批次 4）：关键词/正则文本高亮，将匹配片段包在语义化 `mark` 中并保留非匹配文本；支持 `keywords` 字符串、字符串数组与 `RegExp`，可选 `caseSensitive`/`global`，字符串关键词自动转义；匹配范围由 core helper 计算（无 DOM 依赖），Vue/React API 对称、SSR 安全，无交互角色。
- 新增 **Kbd** 基础组件（批次 4）：语义化 `kbd` 按键标识（不是按钮），支持默认插槽/`children` 与 `keys` 单键或组合键，可选 `separator`、`size`（sm/md/lg）与 `variant`（default/subtle）；样式复用 Tag 尺寸与 default 色板，Vue/React API 对称、SSR 安全，无交互角色。
- 新增 **PageHeader** 导航组件（批次 3）：页面级页头（`header` landmark，不是 Layout 顶栏），可选 `showBack`/`onBack`/`@back` 返回控件与 `backHref`；默认返回复用 Button，带链接时复用 Link，也可用 back 插槽覆盖；提供 breadcrumb/title/subTitle/actions 插槽与右侧操作区弹性布局；Vue/React API 对称、SSR 安全，无 menubar 角色。
- 新增 **NavigationMenu** 导航组件（批次 3）：水平 `menubar` 站点导航，悬停/聚焦展开下拉或 MegaMenu 面板；复用 Dropdown 菜单样式与 anchored-overlay / floating-ui 碰撞定位，默认 portal 到 `document.body`；顶栏左右方向键、Enter/Space/ArrowDown 打开、Escape 关闭并还原焦点；支持受控 `value`/`open` 与非受控 `defaultValue`/`defaultOpen`；提供 Vue/React 双端实现、示例、单测与键盘 E2E。
- 新增 **ContextMenu** 导航组件（批次 3）：右键（`contextmenu`）触发并阻止浏览器默认菜单，用 1px 虚拟参考点把菜单定位在 `clientX/clientY`；复用 Dropdown 菜单样式与 anchored-overlay / floating-ui 碰撞定位，默认 portal 到 `document.body`；支持嵌套 `ContextMenuSub`（悬停与 ArrowRight/Enter 展开、ArrowLeft/Escape 逐层关闭）、方向键/Home/End 导航、Esc 与外部点击关闭、关闭后焦点还原；受控 `open` 与非受控 `defaultOpen` 与 Dropdown 对齐；提供 Vue/React 双端实现、示例、单测与键盘 E2E。
- 新增 **InputOTP** 表单组件（批次 1）：分格输入一次性验证码/PIN，支持粘贴分发、自动聚焦推进、掩码模式（`masked`/`maskChar`）、分组显示（`groups`/`separator`）、`numeric`/`alphanumeric` 字符集与自定义 `pattern`；填满触发 `complete`；提供 Vue/React 双端实现、示例、单测与 E2E，新增 `inputOtp` locale 分区（13 套语言）。
- 新增 **TagsInput** 表单组件（批次 1）：输入创建标签，支持回车/分隔符提交、粘贴多值批量拆分、去重、最大数量、两段式退格删除、`beforeAdd` 校验/转换钩子与 `clearable` 清空，受控与非受控；chip 复用 Tag 组件；提供双端实现、示例、单测与 E2E，新增 `tagsInput` locale 分区（13 套语言）。
- 新增 **MaskInput** 表单组件（批次 1）：模板掩码输入（`#` 数字、`a` 字母、`*` 字母数字、`!` 转义），支持自定义 `tokens` 与 `transform`、固定字符 eager 插入、IME 组合输入与 `clearable`；同时输出原始值（`v-model`/`onChange` 第一参）与格式化值（`change` payload 的 `maskedValue`）；提供双端实现、示例、单测与 E2E。
- 新增 **ScrollArea** 布局组件（批次 2）：样式化滚动条容器，隐藏原生滚动条并渲染自绘轨道与滑块，支持 `direction`（`vertical`/`horizontal`/`both`）、`scrollbar` 显示策略（`auto`/`hover`/`always`/`hidden`）、`scrollbarSize` 粗细、`shadow` 滚动阴影、`minThumbSize` 与 `height`/`maxHeight`/`width`/`maxWidth` 尺寸；滑块支持拖拽、轨道支持点击跳转；`scroll` 事件回传滚动偏移与推导状态，ref 暴露 `scrollTo`/`scrollToTop`/`scrollToBottom`/`getViewport`/`getState`；提供双端实现、示例、单测与 E2E。
- 新增 **Masonry** 布局组件（批次 2）：瀑布流布局，`columns`/`gap` 支持按响应式断点配置（`xs`–`xxxl`），条目按实测高度贪心装入最短列，动态插入/移除自动重排，测量完成前回退轮询分布保证 SSR/首帧不丢条目；`layout` 事件回传列数与各列高度，ref 暴露 `relayout`/`getColumnCount`；提供 Vue/React 双端实现、示例与单测。
- 新增 **AspectRatio** 布局组件（批次 2）：宽高比容器，`ratio` 支持数字与 `'16/9'`、`'16 / 9'`、`'1.5/2'` 等分数字符串，非法值回退默认 `16/9`；基于 CSS `aspect-ratio` 与绝对定位内容包装层实现子内容铺满，纯 CSS 计算、SSR 天然安全；提供 Vue/React 双端实现、示例与单测。
- **同步 `.size-limit.json` 全量包预算**：`Core (full)` 125→131 kB、`Vue (full)` 284→293 kB、`React (full)` 320→328 kB。批次 1 的三个表单组件已让三个全量包超出旧预算（`pnpm size` 在本次改动前即为红），本次连同 ScrollArea 的增量一并按实测重设，并同步 `scripts/check-release-readiness.mjs` 的期望值。
- **格式化漂移收敛并纳入门禁**：`pnpm format` 收敛全仓库 108 个漂移文件，`pnpm format:check` 加入 `quality:static`（此前不在任何门禁里，是漂移积累的根因）。同时修掉两处生成器与 prettier 打架的根因：`packages/core/scripts/generate-tokens.mjs` 原先手写 prettier 配置子集、漏掉 `printWidth: 100`，产物停在默认 80 列；`context7.json` 原先由 `JSON.stringify(…, null, 2)` 直接写出，从不过 prettier。两者改为经 `resolveConfig` 复用 `.prettierrc.json`，`pnpm tokens:build` 与 `pnpm docs:api` 的产物现已与 `format:check` 一致且可重复生成。Next.js 自己重写的 `examples/nextjs/next-env.d.ts` 加入 `.prettierignore`。纯格式化改动，无公开 API 变化。

## v2.0.19

补记版本：v2.0.19 于 2026-07-17 打 tag 并发布，但当时未切分发布文档，条目一直留在「未发布」节。本节内容按 tag 区间（`v2.0.4..v2.0.19`）的实际提交归属整理，MCP 五条为当时原文。该版本虽为 patch 号，但 `@expcat/tigercat-mcp` 存在语义与响应契约变化，详见 [docs/MIGRATION.md](docs/MIGRATION.md#v2019)。

- **`@expcat/tigercat-mcp` 默认远程读取 skills**：裸 `npx tigercat-mcp` 不再要求本地仓库 checkout，默认从 GitHub Pages `https://expcat.github.io/Tigercat/mcp/` 拉取 `context7.json` 与 skill references；`--root` 保留本地模式（仓库开发/离线），新增 `--base-url` 与环境变量 `TIGERCAT_MCP_BASE_URL` 用于镜像站。无参调用语义变化：不再从当前目录向上查找仓库根（内部 `findTigercatRoot` 移除），库调用 `loadSkillIndex()` / `diagnoseTigercatMcp()` 无参时同样默认远程。
- **MCP 路由与引用响应瘦身**：`readReferenceSource` 支持按 markdown 小节抽取，`routeTigercatTask` 内联 sources 并去重，新增 `createReferencePointer` 以会话级背景文档形式返回指针而非全文；`createComponentRoute` 支持小节级引用。响应体积显著下降，但 MCP 工具返回结构随之变化（契约变化）。同时归一化保留 CJK 字符，组件路由扩充中文别名，中文查询匹配率提升。
- **GitHub Pages 新增 `/mcp/` 路由**：随 `vue/`、`react/` 一起发布 skills 静态文件（`context7.json`、`skills/tigercat/**.md`）、部署版本 `version.json` 与说明页；示例首页新增 MCP 入口卡片。
- **`context7.json` 新增 `skill_files` 清单**：`pnpm docs:api` 生成全部 skill markdown 的仓库相对路径，作为远程模式 allow-list 契约；`pnpm api:validate` 与磁盘双向校验。
- **修复 MCP server 版本硬编码**：`createTigercatMcpServer` 上报的 server version 由写死的 `2.0.0-rc.1` 改为运行时读取包版本；`--doctor` 输出增加 `mode: local|remote`，远程模式报告 base URL 与部署版本。
- **修复 CodeEditor 光标不可见与行高错位**：textarea 用 `text-transparent` 露出下层高亮，导致 `caret-current` 的光标同样透明、完全看不见；新增 `getCodeEditorCaretClasses(theme)` 按主题显式给出 `caret-gray-900` / `caret-gray-100`。同时把容器、textarea 与高亮层的 `leading-relaxed` 统一为固定 `leading-[1.625rem]`，消除两层文本行高不一致造成的错位。
- **文档维护入口收敛**：Roadmap 只保留当前任务与登记规则；删除已实施的 Playground 编译器提案；测试说明合并到 `tests/README.md`，移除重复且已过时的测试质量清单，并同步修正版本、SSR 与验证文档中的旧引用。
- **示例与 playground（仅仓库内，不影响发布包）**：playground 编译器由 esbuild-wasm 换为 sucrase，Vue SFC 编译拆到 `vue-sfc.ts`，新增 `scripts/validate-example-compile.mjs` 编译校验；补充 R31–R35 示例覆盖（ConfigProvider、Menu、Message/Notification 容器、Tour、Transfer、chart 交互与多种图表类型）以及 Pagination `simple`/`disabled`、InputGroup 尺寸与 compact 示例。

## v2.0.0

v2.0.0 正式版。本版本相对 v1.5.0 完成破坏性升级：ESM-only 发布面、显式 component exports、React / Vue tree-shaking 副作用收敛、compat API 删除、legacy token / icon path 兼容层清理、按需加载文档迁移、size / publish artifact gate 收口、Basic / Layout 轻量组件 API 清理、Feedback / overlay open、portal、focus 与 close lifecycle 收敛，Form primitives 和 composite selectors 的受控模型、搜索、空态和尺寸类型收敛，Navigation 组件受控回调与子组件 subpath 产物收敛，Data/table stack 数据、选择与虚拟滚动入口统一，Charts/visualization 类型拆分与 tooltip 命名收敛，以及 Advanced/media viewer 与 editor runtime guard 收敛。完整迁移路径见 [docs/MIGRATION.md](docs/MIGRATION.md)。

### 相对 rc.2 的变更

- **统一锚点浮层架构**：Dropdown、Menu/SubMenu、Tooltip、Popover、Popconfirm、Image hover preview、Select、DatePicker、TimePicker、TreeSelect、Cascader、AutoComplete、ColorPicker、Mentions 与 FormItem popup error 统一经 core anchored-overlay contract 和 React/Vue 对称适配层挂载、碰撞定位与关闭；Modal/Drawer 提供最近 layer host 与完整焦点边界，浮层不再被 dialog overflow 裁剪，也不会改变 dialog 布局。表单组件没有新增 workaround prop；Dropdown `portal` 与 Menu `popupPortal` 继续兼容。
- 公开 API 与 rc.2 完全一致，无新增功能与破坏性变更。preview.1 → rc.2 期间的增量（`@expcat/tigercat-mcp` MCP 包、DataExport 组件、Table / List 远程与简洁分页、Icon `icon` 属性与扩展图标集、Pagination 页容量事件语义、DatePicker locale 回退修复等）见下方对应预发布条目。
- **`@expcat/tigercat-mcp` bin 修复**：通过 npm `.bin` 软链（`npx tigercat-mcp`）或其他符号链接路径调用时，直接运行判定因未 realpath `argv[1]` 而失败，进程静默退出、stdio 服务器不启动；现对 `argv[1]` realpath 后再比较（rc.2 及更早预发布版本受此影响）。
- 测试确定性收口：Drawer / Form / Popover 测试的硬等待改为 fake timers / `waitFor`；移除已被 `tests/TEST_QUALITY_GUIDELINES.md` 取代的旧测试清单文档。
- 清理 `.changeset/` 中 16 个内容已随既有版本发布面消化的暂存 changeset 文件。
- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli`、`@expcat/tigercat-mcp` 统一为 `2.0.0`，同步运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板依赖范围与示例首页版本。

### Breaking Changes

- **core anchored overlay utilities**：删除只服务旧组件私有定位路径的 `positionMentionsDropdown`、`PositionMentionsDropdownOptions` 与 `getSubmenuPopupZIndex`；Mentions 与 Menu/SubMenu 已统一使用框架 anchored-overlay adapter，业务代码不应直接编排组件浮层定位。
- **core**：移除已废弃的 `getResultHttpLabel(status)`。请改用 `isHttpResultStatus(status) ? status : undefined`。
- **React ImageGroup**：移除旧回调 `onPreviewVisibleChange`，统一为 `onPreviewOpenChange(open)`。
- **Vue ImageGroup**：移除旧事件 `preview-visible-change`，统一为 `preview-open-change`。
- **design tokens**：`@expcat/tigercat-core/tokens.css` 不再生成旧 `--tiger-color-*`、`--tiger-space-*`、`--tiger-button-*` 和 pre-0.5.0 `--tiger-primary` 等兼容变量；请改用 `--tiger-primitive-*`、`--tiger-semantic-*` 或 `--tiger-component-*` 三层 token。
- **core token exports**：移除 `globalColors` / `globalSpace` / `globalRadius` / `globalShadow` / `globalFont` / `globalDuration` / `globalEasing`、`aliasTokens` 及对应 `Global*` 类型别名；请改用 `primitive*` 和 `semanticTokens`。
- **core icon path aliases**：移除 DatePicker / TimePicker 旧 icon path 别名 `CalendarIconPath`、`CloseIconPath`、`ChevronLeftIconPath`、`ChevronRightIconPath`、`ClockIconPath`、`TimePickerCloseIconPath`，并删除 `common-icons` 兼容 barrel；请改用 `calendarSolidIcon20PathD`、`closeSolidIcon20PathD`、`chevron*SolidIcon20PathD`、`clockSolidIcon20PathD` 或分组 icon 子路径。
- **core DatePicker i18n helper**：`getDatePickerLabels(string)` 不再默认查找 13 个内置 DatePicker locale，以避免默认 bundle 拉入全量语言表；按运行时字符串解析内置 DatePicker 文案请改用 `@expcat/tigercat-core/datepicker-locales/registry` 的 `getDatePickerLabelsFromLocale(locale)`。
- **core `defineText`**：`defineText(...)` 不再作为 `defineLocale(...)` 的别名补齐 en-US 基线，而是返回纯自定义文本 overlay；需要完整 en-US 基线时请改用 `defineLocale(...)`，需要 DatePicker 翻译时请显式传入对应 DatePicker preset。
- **core Basic / Layout type aliases**：移除等同 shared contracts 的 `SpaceDirection`、`SpaceAlign`、`CardDirection`、`StatisticSize`、`DescriptionsSize`、`ListSize`；请分别改用 `BaseLayoutProps['direction']`、`BaseLayoutProps['align']` 或 `ComponentSize`。
- **Carousel**：移除仅初始化语义的 `initialSlide`，统一为受控索引模型；React 使用 `currentIndex` / `defaultCurrentIndex` / `onCurrentIndexChange`，Vue 使用 `currentIndex` / `defaultCurrentIndex` / `update:currentIndex`。
- **React hooks**：移除旧 source hook `usePopup` 及其 hooks barrel re-export；它只暴露 `visible` / `defaultVisible` / `onVisibleChange` 合约。Tooltip、Popover、Popconfirm 等 overlay 请直接使用组件级 `open` / `defaultOpen` / `onOpenChange`。
- **Drawer close lifecycle**：`destroyOnCloseAfterLeave` 重命名为 `deferDestroyOnClose`；React `onAfterLeave` 重命名为 `onAfterClose`；Vue `after-leave` 重命名为 `after-close`。
- **Modal close lifecycle**：React Modal 新增 `onAfterClose`，Vue Modal 新增 `after-close`；外部 `open=false` 不再触发 close intent（React `onClose` / Vue `close`），用户取消、确认、遮罩、关闭按钮和 Escape 仍触发对应 intent。
- **Vue Modal / Drawer teleport**：移除测试逃生口 `disableTeleport`，Modal 和 Drawer 始终 teleport 到 `document.body`；测试或样式选择器应查询 body 中的 overlay DOM。
- **core Form primitive size aliases**：移除等同 shared contract 的 `InputSize`、`TextareaSize`、`CheckboxSize`、`RadioSize`、`SwitchSize`、`SliderSize`、`SegmentedSize`、`StepperSize`、`ColorSwatchSize`；请统一改用 `ComponentSize`。
- **Vue Form primitives controlled model**：Checkbox、Radio、Switch 单体受控状态统一为默认 `v-model`（`modelValue` / `update:modelValue`）与 `default-value`；RadioGroup 也从 `v-model:value` 切换为默认 `v-model`。React Checkbox、Radio、Switch 继续使用 `checked` / `defaultChecked` / `onChange`。
- **core Form composite size aliases**：移除等同 shared contract 的 `SelectSize`、`TreeSelectSize`、`CascaderSize`、`AutoCompleteSize`、`DatePickerSize`、`TimePickerSize`、`TransferSize`、`ColorPickerSize`、`InputGroupSize`、`FormSize`；请统一改用 `ComponentSize`。
- **DatePicker / TimePicker model aliases**：移除重复的 `DatePickerSingleModelValue`、`DatePickerRangeModelValue`、`DatePickerSingleValue`、`DatePickerRangeValue`、`TimePickerSingleValue`、`TimePickerRangeValue`；请分别使用 `DatePickerModelValue` 与 `TimePickerModelValue`。
- **Form composite search API**：Select、TreeSelect、Cascader、AutoComplete、Transfer 的搜索受控量统一为 `searchValue` / `defaultSearchValue`；React 回调统一为 `onSearchChange`，Vue 统一为 `update:searchValue` / `search-change`。TreeSelect、Cascader、Transfer 的旧 `showSearch` 改为 `searchable`。
- **Form composite empty text API**：Select、TreeSelect、Cascader、AutoComplete、Transfer 的组件级空态文案统一为 `emptyText`；旧 `notFoundText`、`noOptionsText`、`noDataText` 不再保留，未显式传入时继续从 locale / custom text 解析默认空态。
- **Upload queue helper split**：上传队列、分片与断点续传 helper 拆入 `upload-queue-utils`，普通选择、拖拽与样式 helper 继续保留在 `upload-utils`；根入口仍导出对应工具，但直接导入时应选择更小的 helper 模块。
- **React Navigation controlled callbacks**：Tabs / ScrollSpy 的受控 active key 回调从 `onChange` 改为 `onActiveKeyChange`；Menu 搜索回调从 `onSearch` 改为 `onSearchChange`；Menu / Tree 的受控 key 变化分别使用 `onSelectedKeysChange`、`onOpenKeysChange`、`onExpandedKeysChange`、`onCheckedKeysChange`。`onSelect` / `onOpenChange` / `onExpand` / `onCheck` 仍作为携带交互上下文的事件回调。
- **Navigation 子组件 subpath 产物收敛**：`AnchorLink`、`BreadcrumbItem`、`DropdownItem`、`DropdownMenu`、`MenuItem`、`MenuItemGroup`、`StepsItem`、`SubMenu`、`TabPane` 的 PascalCase package subpath 保持可用，但发布 exports 现在指向父组件产物（如 `./MenuItem` → `Menu`），源码层不再保留独立子组件 shim 文件。
- **VirtualTable 数据与选择 API**：VirtualTable 删除 `data`、`rowHeight`、`height`、`selectable`、`selectedKeys`、`onSelect` 公共入口；请改用 `dataSource`、`virtualItemHeight`、`virtualHeight`、`rowSelection`，React 使用 `onSelectionChange`，Vue 使用 `selection-change` / `update:rowSelection`。
- **Table 虚拟化阈值 API**：Table / DataTableWithToolbar 删除 `autoVirtualThreshold`；自动虚拟化启用和推荐态统一由 `virtualThreshold` 控制，`virtual=true` 仍强制启用。
- **core table 泛型类型**：移除重复的 `GenericTableColumn`、`GenericRowSelection`、`GenericExpandable`、`GenericTableProps`；请改用 `TableColumn<T>`、`RowSelectionConfig<T>`、`ExpandableConfig<T>`、`TableProps<T>`。
- **Kanban 数据模型类型别名**：移除 `KanbanCard`、`KanbanColumn`、`KanbanCardMoveEvent`、`KanbanColumnMoveEvent` 公共别名；Kanban 复用 TaskBoard 数据模型，请直接使用 `TaskBoardCard`、`TaskBoardColumn`、`TaskBoardCardMoveEvent`、`TaskBoardColumnMoveEvent`。`KanbanProps` 与 `KanbanSwimlane` 保留。
- **DataTableWithToolbar 业务回调收敛**：移除组件顶层 `onSearchChange`、`onSearch`、`onFiltersChange`、`onBulkAction`，业务回调统一从 `toolbar` 配置发出——React 使用 `toolbar.onSearchChange` / `toolbar.onSearch` / `toolbar.onFiltersChange` / `toolbar.onBulkAction`，Vue 继续使用 `@search-change` / `@search` / `@filters-change` / `@bulk-action` 事件。`onPageChange` / `onPageSizeChange` / `onSelectionChange` 等分页与表格回调仍为组件顶层 API。
- **Charts 类型拆分与重复别名删除**：`chart.ts` 拆分为 `chart-core`、`chart-cartesian`、`chart-radial`、`chart-visualization` 分组类型，根入口仍继续导出所有 chart 类型；删除重复的 `AreaChartDatum` 与 `DonutChartDatum`，请分别改用 `LineChartDatum` 与 `PieChartDatum`。
- **ChartTooltip 可见性命名**：独立 `ChartTooltip` 的可见性 prop 从 `visible` 改为 `open`；高阶图表组件继续使用 `showTooltip` 控制内置 tooltip。
- **core NumberKeyboard 受控值命名**：`NumberKeyboardProps` 删除 Vue 专属的 `modelValue` core prop，跨框架 shared contract 统一为 `value` / `defaultValue`。React 继续使用 `value` / `defaultValue` / `onChange`；Vue 组件仍保留本地 `modelValue` / `update:modelValue` 作为默认 `v-model` 入口。
- **ImagePreview / ImageViewer viewer 合约收敛**：core 新增 `ImageViewerBaseProps` 作为 `locale`、`images`、`open`、`currentIndex`、`maskClosable` 的共享 viewer contract；`ImagePreviewProps` 与 `ImageViewerProps` 继续作为两个 public surface 保留，不重新引入 `visible`、`defaultIndex` 或 `onIndexChange`。

### Added

- **Viewport positioning contracts**：BackTop 新增 `position` / `placement` / `offset`，FloatButton 新增 `floating` / `placement` / `offset`，并公开 `BackTopPosition`、`ViewportPlacement`、`ViewportOffset`、`getViewportOffsetStyle` 与相关 viewport/floating class helpers，用于统一 fixed/sticky 视口定位。
- **Notification actions**：通知命令式 API 支持内联 actions；core 新增 `NotificationAction` / `NotificationActionContext` 与 action button class helpers，action 点击可通过 `closeOnClick` 或 callback context 的 `close()` 关闭对应 toast。
- **Select labels and locale helpers**：Select 新增 `labels` / `locale` 支持，core 新增 `TigerLocaleSelect`、`DEFAULT_SELECT_LABELS`、`ZH_CN_SELECT_LABELS` 与 `getSelectLabels`，空态和选择完成按钮文案可继续从组件 locale / ConfigProvider locale 回退。
- **Picker and selector helper contracts**：core 新增 `DATEPICKER_LOCALES`、`getDatePickerLocalePreset`、`getDatePickerLabelsFromLocale` 与 `CascaderSearchConfig`，运行时字符串查找 DatePicker locale 需显式走 registry，Cascader 搜索配置使用具名 public contract。
- **ImagePreview touch gestures**：ImagePreview 新增 `touchSwipeable` 与 `touchSwipeThreshold`，用于移动端滑动切换预览图片。

### Infrastructure

- `publish:check` 纳入 `@expcat/tigercat-mcp`：与其余四包一同参与 pack、tarball 无 CJS 产物校验与 clean install，并新增导出、bin `--help` 与版本一致性 smoke；MCP 服务器包不参与组件库专属的 tree-shaking / 体积断言。
- `scripts/sync-version.mjs` 不再写入旧版 Roadmap 发布表格字段，避免当前 Rxx 路线图结构下的版本同步脚本在最后一步失败。
- core / React / Vue 构建统一为 ESM-only，不再生成 CJS 产物；core package exports 移除 `require` 条件和 `.cjs` 目标。
- 发布体积随之约减半（相比 v1.5.0，gzip 压缩包与解包体积、文件数均下降约 50%）：

  | 包                       | v1.5.0（gzip / 解包 / 文件） | v2.0.0（gzip / 解包 / 文件） |
  | ------------------------ | ---------------------------- | ---------------------------- |
  | `@expcat/tigercat-core`  | 766 kB / 3.61 MB / 155       | 380 kB / 1.84 MB / 83        |
  | `@expcat/tigercat-react` | 503 kB / 2.44 MB / 869       | 259 kB / 1.22 MB / 440       |
  | `@expcat/tigercat-vue`   | 622 kB / 3.76 MB / 863       | 316 kB / 1.89 MB / 436       |
  | `@expcat/tigercat-cli`   | 16 kB / 60 kB / 5            | 15 kB / 60 kB / 5            |

- React / Vue package exports 移除 `./*` 通配入口，改为由 `scripts/lib/public-components.mjs` 事实源生成的 148 个 PascalCase 显式组件子路径；`exports:check` 与 `release:check` 会阻止清单漂移。
- React / Vue package `sideEffects` 收敛为 `false`，不再用 `dist/chunk-*` 或 `dist/components/*` 全量副作用兜底；`MessageContainer` 与 `NotificationContainer` 拆为独立纯容器入口，命令式 `Message` / `notification` 单例挂载逻辑保留在对应 imperative 入口中。
- `api:validate` 会直接阻止 core / React / Vue 公开源码重新引入 `@deprecated`，v2 不再新增过渡废弃层。
- `api:validate` 会阻止 Feedback 示例与 React hook source 重新引入 overlay `visible` / `defaultVisible` / `onVisibleChange` 用法，Feedback 当前示例统一使用 `open` 命名。
- `api:validate` 会阻止 Vue Checkbox / Radio / Switch 及对应 Vue examples 回退到旧 `checked` / `defaultChecked` / `update:checked` / `v-model:checked` 受控模型。
- `api:validate` 会阻止 Form composite selectors 回退到已删除的尺寸别名、DatePicker / TimePicker 旧模型别名、旧搜索 props/events 或重复空态命名。
- `api:validate` 会阻止 Navigation 子组件 subpath 重新指向独立 shim、React Tabs / ScrollSpy 回退到 `onChange`，或 React Menu 回退到旧 `onSearch`。
- `api:validate` 会阻止 Data/Table stack 回退到 VirtualTable 旧数据/选择 props、Table `autoVirtualThreshold` 或重复 `GenericTable*` public interfaces。
- `api:validate` 会阻止 Kanban 重新导出 `KanbanCard` / `KanbanColumn` / `KanbanCardMoveEvent` / `KanbanColumnMoveEvent` 别名，以及 DataTableWithToolbar 重新引入顶层 `onSearchChange` / `onSearch` / `onFiltersChange` / `onBulkAction` 业务回调。
- core composite 巨型类型文件 `composite.ts` 按组件拆分为 `chat.ts`、`activity-feed.ts`、`comment-thread.ts`、`notification-center.ts`、`table-toolbar.ts`、`form-wizard.ts`、`task-board.ts`，`composite.ts` 改为薄 barrel；公共类型导出经 `@expcat/tigercat-core` 根入口保持不变。
- `api:validate` 会阻止 Charts 回退到重复 datum aliases 或独立 `ChartTooltip visible` prop；generated chart references 由拆分后的类型文件重新生成。
- `api:validate` 会阻止 Advanced/media 回退到 core `NumberKeyboardProps.modelValue`、viewer `visible` / `defaultIndex` / `onIndexChange` / `update:index` 旧命名；`browser-only-guards` 覆盖 RichTextEditor 内置 engine 在 Node/SSR 下对 `document.execCommand` / `window.prompt` 的 no-op 行为。
- `tokens:build` / `tokens:check` 的生成面收敛为 canonical token 输出，移除 legacy CSS 变量和 token alias API 生成。
- `release:check` 和 `publish:check` 增加 ESM-only 断言，发布 smoke 使用临时安装目录中的 bare ESM import 验证包入口，并阻止 `.cjs` 文件混入 tarball 或安装产物。
- `release:check` 会阻止 React / Vue 恢复宽泛 sideEffects 声明；`publish:check` 会对安装后的 React / Vue root Button named import 和 Button 子路径 import 做 bundler smoke，确保普通 Button bundle 不拉入 Message / notification 命令式挂载代码。
- `publish:check` 的 Button 子路径 smoke 增加 charts、editors 和全量 locale barrel 隔离断言，并将 React / Vue Button 子路径 bundle 上限固定为 6 kB / 8 kB；`quality:release` 现在包含 `publish:check`，发布 workflow 在现有触发面内改为执行完整 release gate。
- i18n 默认路径更利于裁剪：`defineText` 不再导入内置 locale，DatePicker 默认 helper 不再导入全量 DatePicker locale；新增 `@expcat/tigercat-core/datepicker-locales/registry` 作为显式 opt-in 的运行时字符串查表入口，`publish:check` 会防止默认 DatePicker 子路径和 `defineText` bundle 回退到全量 locale。

## v2.0.0-rc.2

v2.0.0 rc.2 验证 rc.1 之后的 MCP package 与 LLM reference routing 更新，并同步当前依赖目录。

### Features

- **Tigercat MCP package**：新增 `@expcat/tigercat-mcp` 本地 MCP 服务，用于将 LLM 查询路由到 Tigercat skill references，并提供组件元数据、组件分类、参考文档路径和诊断信息。
- **组件元数据与诊断增强**：扩展 public component facts / Context7 生成内容，MCP 查询可返回更完整的组件匹配、建议 reference 和缺失配置诊断。

### Fixed

- **响应式图表与 VirtualTable**：React/Vue Bar、Line、Area、Scatter 的响应式外层不再保留固有宽度；VirtualTable 兑现既有 `TableColumn.render` / `renderHeader` 契约，并保持 React `renderCell` 优先级。
- **React Table 测量稳定性**：普通表格不再安装无用的 ResizeObserver；只在固定列、可锁列或虚拟表真正需要几何数据时观察，减少多 Table 页面冷启动时的并发状态更新。
- **Upload 与裁剪资源生命周期**：本地文件预览 URL 在替换、移除和卸载时正确撤销；CropUpload/ImageCropper 只在图像与容器尺寸为正且有限时计算裁剪几何。
- **复合组件视觉一致性**：ActivityFeed、NotificationCenter 与 CommentThread 的共享视觉 recipe 收敛为包内实现，React/Vue 使用相同 token 与 reduced-motion 规则，不增加 public API。
- **Example 体验收口**：React/Vue 示例补齐关键操作状态、移动端说明和窄屏布局，避免演示操作无可见反馈。

### Quality and release preparation

- 本地测试入口去重并清理重复断言；当前 canonical suite 为 383 files / 6,840 tests，public API baseline、generated Skill references 与 package exports 保持零漂移。
- 删除跨系统不稳定的 Playwright 图片对比 spec 和全部 PNG 基线；保留 Chromium、Firefox、WebKit 与移动 Chromium 的功能 E2E。
- 删除 CI、E2E、benchmark 与 security audit 的 Actions workflow；发布前验证统一在本地完成，Actions 只保留 tag、npm publish 与 Pages 部署流程。
- `docs/` 收敛为当前 `ROADMAP.md` 与用户需要的 `MIGRATION.md`；完成日志、临时 Example backlog 与重复 API 审计文档不再长期维护。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli`、`@expcat/tigercat-mcp` 统一为 `2.0.0-rc.2`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 更新 workspace catalog / lockfile 中的依赖版本，并将 MCP 包纳入 release readiness 的 fixed-version 检查。
- `React Table subpath` size 预算 40 kB → 41 kB，以覆盖 rc.1 后依赖 / 构建面更新后的稳定 gzip 体积（实测 40.52 kB）。
- `publish:check` 的 clean npm install 不再使用 `--prefer-offline`，避免本机旧 npm metadata 将当前 registry 已存在的 catalog 版本误判为 ETARGET。
- 本次 rc 无新增破坏性变更；迁移路径沿用当前 v2.0.0 条目。

## v2.0.0-rc.1

v2.0.0 rc.1 冻结当前 v2.0.0 发布面，收敛 Pagination 样式与页容量变更事件语义，并记录候选版本相对 preview.6 的 core helper 清理。

### Breaking Changes

- **移除 simple pagination 样式 helpers**：core 根入口不再导出 `getSimplePaginationContainerClasses`、`getSimplePaginationTotalClasses`、`getSimplePaginationControlsClasses`、`getSimplePaginationSelectClasses`、`getSimplePaginationButtonClasses`、`getSimplePaginationPageIndicatorClasses` 与 `getSimplePaginationButtonsWrapperClasses`。Table/List 内置分页已统一复用 Pagination；自定义分页应直接使用 React/Vue `Pagination`，或改用仍公开的通用 pagination 样式 helpers。

### Fixed

- **Pagination 激活态样式**：页码按钮激活态统一由 core 样式 helper 生成，React / Vue 不再各自拼接重复状态类。
- **Pagination 页容量事件**：变更 `pageSize` 时只触发 React `onPageSizeChange` / Vue `page-size-change`，并携带调整后的页码；即使当前页因总页数减少而被收敛，也不再额外触发页面导航 `onChange` / `change`。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-rc.1`，并同步运行时版本、CLI 与示例首页元数据。
- 迁移和破坏性变更已同步到 `docs/MIGRATION.md`；RC 阶段不再引入未明确记录的 breaking public API。

## v2.0.0-preview.6

v2.0.0 preview 6 延续 v2.0.0 预览发布面，新增 DataExport 数据导出组件，并增强 Table / List 分页交互。

### Features

- **DataExport 数据导出组件**：Vue / React 新增 `DataExport` 组件（Data 分类，子路径 `@expcat/tigercat-react/DataExport` / `@expcat/tigercat-vue/DataExport`），支持将表格数据导出为 XLSX 或 Markdown。`columns` 复用 `TableColumn`，Table / DataTableWithToolbar 的列配置可直接透传；`formats` 单一格式渲染普通按钮、多格式渲染下拉菜单（默认 `['xlsx', 'markdown']`），另支持 `fileName`、`sheetName`、`cellFormatter`、`disabled`。序列化实现位于 core 新增子路径 `@expcat/tigercat-core/utils/data-export`，组件按需 lazy import，不使用导出功能时不进入 bundle。导出按钮文案随 locale（zh-CN / en-US）同步新增。
- **Table / List 分页增强**：`PaginationConfig` 与 `ListPaginationConfig` 新增 `simple?: boolean`（强制简洁模式：上一页/下一页 + 页码指示，默认 ≤3 页自动简洁、>3 页显示页码按钮）与 `showQuickJumper?: boolean`（快速跳页输入框，默认 >3 页自动出现）；`pageIndicatorText?: (current, totalPages) => string` 可自定义简洁模式页码指示文案（缺省 `{current} / {totalPages}`）。同时改进分页可访问性。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.6`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 公开组件数 148 → 149（新增 DataExport），README 与示例首页统计同步更新。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.5

v2.0.0 preview 5 延续 v2.0.0 预览发布面，新增 Table / List 远程（服务端）分页模式。

### Features

- **Table / List 远程分页 `pagination.remote`**：`PaginationConfig` 与 `ListPaginationConfig` 新增 `remote?: boolean`（默认 `false`，完全向后兼容）。`remote: true` 语义：`dataSource` 即当前页数据，组件跳过内部切片原样渲染，总页数与 `showTotal` 范围文案全部由 `pagination.total` 计算；`current` / `pageSize` 仍为受控属性，`page-change` / `page-size-change` 事件行为不变，业务侧收到事件后按新页码重新请求。Vue / React 两端 Table 与 List 同步支持；`DataTableWithToolbar` 原样透传 `pagination`，无需额外配置。注意：remote 模式下组件内置排序/筛选仅作用于当前页数据，排序/筛选应由服务端完成。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.5`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.4

v2.0.0 preview 4 延续 v2.0.0 预览发布面，合入 Icon 组件 `icon` 属性与可 tree-shake 的扩展图标集。

### Features

- **Icon `icon` 属性**：Vue / React `Icon` 组件新增 `icon` 属性，接受 `IconDefinition`（viewBox + path 数据 + stroke/fill 模式），可将自定义图标（如品牌 logo）定义为常量复用，无需全局注册。优先级：自定义 SVG children > `icon` > `name`。
- **core 扩展图标集**：新增约 60 个 Heroicons outline 风格扩展图标（排序、视图、操作、通信媒体、状态反馈、商务、数据技术、场景等），以独立 `IconDefinition` 常量从 `@expcat/tigercat-core` 导出（如 `rocketIcon`、`sortAscendingIcon`），配合 `icon` 属性使用。常量带 `/*#__PURE__*/` 标注且包声明 `sideEffects: false`，未使用的图标可被 bundler tree-shake，不进入组件包体积；`iconRegistry` / `IconName` 保持原集合不变。`extendedIcons`（`Record<ExtendedIconName, IconDefinition>`）提供全量集合用于图标画廊等场景。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.4`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- `Core (full)` size 预算 118 kB → 125 kB（core 全量入口包含全部扩展图标定义；组件子路径与按需引入体积不受影响，仍由原有预算约束）。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.3

v2.0.0 preview 3 延续 v2.0.0 预览发布面，在 preview.2 之后合入 DatePicker locale 文案回退修复，以及 release 门禁维护更新。

### Bug Fixes

- **core DatePicker i18n**：`getDatePickerLabelsFromLocale(locale, overrides)` 现以 en-US 文案为基线合并，locale preset 缺失的键回退到 en-US，而非产生 `undefined`。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.3`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 移除 `FormItemContext` 未使用的 React 默认导入以通过 lint 门禁；将 `Core locale (zh-CN)` size 预算从 3 kB 提升至 4 kB 以容纳持续扩充的 i18n 文案。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.2

v2.0.0 preview 2 延续 v2.0.0 预览发布面，用于验证 preview.1 之后已合入的示例、测试和文档收口提交。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.2`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.1

v2.0.0 preview 1 对齐 v2.0.0 破坏性升级当前发布面，用于预览验证已完成的版本号、运行时 version 导出、ESM-only package surface、显式 component exports、tree-shaking 护栏、API 删除与文档 / 示例迁移收口。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.1`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v1.5.0

本版本汇总 v1.4.0 记录之后截至 2026-06-28 的主分支变更，重点标出升级后使用者需要留意的属性、行为与迁移点。

### Upgrade Notes

- **开发/发布环境要求提高**：根工程 `packageManager` 更新为 `pnpm@11.9.0`，`engines` 更新为 Node `>=22.13.0`、pnpm `>=11.9.0`。本地开发、示例构建和发布检查请先升级工具链。
- **Result 工具函数迁移建议**：`getResultHttpLabel(status)` 标记为弃用；新代码请改用 `isHttpResultStatus(status)` 判断 HTTP 状态，再按需直接使用原始 `status`。旧函数仍保留，现有导入不会立即失效。
- **Message 类型导出修正**：React `MessageProps` / Vue `VueMessageProps` 现在表示命令式 Message API 接受的 `MessageOptions`；容器组件 props 保持为单独的 `MessageContainerProps` / `VueMessageContainerProps`。如果业务侧曾把容器 props 当作全局 `message.*()` 配置类型使用，请改用新的容器 props 名称。

### Added

- **Locale 命名空间继续扩展**：`TigerLocale` 新增 `empty`、`tour`、`calendar`、`fileManager`、`imageViewer`、`imageEditor`、`status`、`qrcode`、`timeline` 等文案段，并补齐 en-US / zh-CN 及 13 个 locale preset 中的相关默认文案。新增 core helpers / 常量包括 `getTourLabels`、`getCalendarLabels`、`getFileManagerLabels`、`getImageViewerLabels`、`getImageEditorLabels`、`getStatusLabels`、`DEFAULT_*_LABELS` 与 `ZH_CN_*_LABELS`。
- **更多组件支持 `locale` 覆盖**：`AutoComplete`、`Badge`、`Calendar`、`CropUpload` / `ImageCropper`、`Empty`、`FileManager`、`ImageAnnotation`、`ImagePreview`、`ImageViewer`、`Loading`、`Tag` 等双端组件新增可选 `locale` prop，解析顺序为显式 prop / 组件 locale / ConfigProvider locale / 英文 fallback。
- **Calendar 受控能力补齐**：React `Calendar` 新增 `value`、`onChange`、`onPanelChange` 与 `locale`；Vue 侧对应行为通过既有 emits / `v-model` 对齐。
- **DataTableWithToolbar 工具栏能力补齐**：新增/公开 `onSearchChange`、`onSearch`、`onFiltersChange`、`onBulkAction`、`selectedKeys`、`tableClassName` 等属性，并把 toolbar 回调、搜索、筛选、批量操作和表格 class 传递纳入公开契约。
- **FileManager 受控与拖拽回调补齐**：新增 `onCurrentPathChange`、`onNavigate`、`onOpen`、`onSelect`、`onSelectedKeysChange`、`onSearchTextChange`、`onReorder` 等回调，支持选择、路径、搜索与重排状态外置。
- **VirtualTable 横向虚拟化与行定制**：新增 `width`、`virtualizeColumns`、`rowClassName`，core 新增 `calculateVirtualColumnRange` / `TableVirtualWindow` 等工具，用于大列数表格的横向窗口化渲染。
- **图表与编辑器能力补齐**：`GaugeChart` 新增 `tooltipFormatter`；`RichTextEditor` 的 `mode` 现在传入底层 engine；`CodeEditor` 新增 active-line 相关 core class/helper；图表 tooltip、downsample、Donut 入场动画等 core helper 纳入公开导出。
- **主题与 token 检查能力**：core 新增 `defaultThemeLightColors` / `defaultThemeDarkColors`、`THEME_CONFIG_CSS_VARS`、`themeConfigToCssVars`，Tailwind 默认主题变量改由默认主题色派生；新增 `pnpm tokens:check` 检查生成产物是否过期。

### Changed

- **DatePicker 文案来源收敛**：DatePicker labels 统一以 `datepicker-locales/*` preset 作为来源，`getDatePickerLabels(string)` 支持内置 13 个 locale id，未知 locale 自动回退 `en-US`。
- **公开但此前未完整生效的 props 落地**：Select、Table、VirtualTable、VirtualList、Kanban、RichTextEditor、图表、FileManager、Transfer、AutoComplete、Slider、Splitter、CodeEditor、ChatWindow、CropUpload、Cascader、FloatButton、Steps、Tabs、Calendar、InputNumber、CommentThread、DataTableWithToolbar 等组件完成“已声明/已透传但运行时未完全承接”的属性实现与双端对齐。
- **可访问性与键盘交互收敛**：Table / VirtualTable 行选择、展开行、筛选/导出控件、Tabs 关闭按钮、Rate、Segmented、Resizable、ImageAnnotation、Calendar、ChartLegend 等补齐 ARIA、键盘激活或可访问名称；折叠/交互场景更接近真实控件语义。
- **InputGroup 尺寸继承补齐**：React / Vue `InputNumber` 现在会继承 `InputGroup` size；Vue `InputNumber` 同时补齐 `defaultValue` 与 `className`。
- **质量脚本收敛**：`quality:ssr` 改走 `scripts/check-ssr-examples.mjs`，新增 `e2e` / `e2e:smoke` 脚本；CLI / 发布 / 校验脚本复用 `scripts/utils/files.mjs`、`scripts/utils/strings.mjs` 与 CLI `utils/exec.ts`。

### Fixed

- 修复 **MarkdownEditor** 空预览态把 `placeholder` 直接写入 `innerHTML` 的 XSS 风险：空态占位文案现在作为文本节点渲染，非空预览仍经 `sanitizeHtml`。
- 修复 **Message** 多位置渲染与类型契约：全局消息按 `top` / `top-left` / `top-right` / `bottom` / `bottom-left` / `bottom-right` 分组渲染，导出的 API options 类型不再与容器 props 混淆。
- 修复 **BackTop** 默认 `target` 在 SSR / 非浏览器环境直接访问 `window` 的问题。
- 修复 **Modal** 关闭回调顺序，避免受控关闭、确认、取消路径中 `onClose` / `onOpenChange` 语义混乱或重复触发。
- 修复 **TimePicker** 在存在秒值与 `minTime` / `maxTime` 时的禁用判断，秒列现在参与范围校验。
- 修复 **Form** 动态字段、reset、undo/redo 等路径中的内部值同步问题，减少受控 model 与内部 ref 脱节。
- 修复 **Vue** Anchor / AvatarGroup / Breadcrumb / Dropdown / DatePicker 等组件在响应式上下文、快捷日期和事件透传上的边缘问题。

### Infrastructure

- 依赖与工具链更新：Playwright、ESLint、Vitest、happy-dom、jiti、Prettier 等开发依赖升级；workspace 从 pnpm 10 迁移到 pnpm 11。
- API 基线生成与 release readiness 校验继续收敛，`api-reports/public-api-baseline.json` 纳入新增 locale/helper/props 契约，`skills/tigercat/references` 同步刷新到新的组件属性说明。
- Roadmap 文档从扫描日志整理为执行队列，历史 `docs/ROADMAP_CHECK.md` 内容已合并进 `docs/ROADMAP.md` 后删除。

## v1.4.0

本版本包含新增组件、表格列显隐、i18n 扩展、跨端逻辑收敛、发布门禁强化，以及需要迁移的 Breaking changes。迁移路径集中于 [迁移指南](docs/MIGRATION.md)。

### Added

- 新增 **MarkdownEditor** 高级组件：支持 Markdown 编辑、编辑/分屏/预览模式、内置工具栏、快捷键、预览渲染与自定义 renderer 扩展点，提供 Vue/React 双端实现、示例与测试。
- **Table 列显隐控制**：新增 `hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控），React 提供 `onHiddenColumnKeysChange`，Vue 支持 `v-model:hidden-column-keys` 与 `hidden-column-keys-change` 事件；`TableColumn` 新增 `hideable`（默认 `true`，`false` 时列设置面板中不可隐藏）。固定列偏移、卡片字段、导出与列拖拽只作用于可见列，隐藏列上已生效的筛选仍继续过滤数据。**DataTableWithToolbar** 工具栏新增列设置入口：`toolbar.showColumnSettings` 开启内置 Popover + Checkbox 面板，`toolbar.columnSettings.lockedColumnKeys` 可锁定不可隐藏列，标题支持 `toolbar.columnSettings.title` 与 locale（`table.columnSettingsText` / `columnSettingsAriaLabel`，13 语言预设已补齐）。core 新增 `filterHiddenColumns` 工具与 `FLOATING_OVERLAY_Z_INDEX`（1000）常量。
- **i18n 本地化扩展**：未配置 ConfigProvider 时英文渲染一律不变，无需逐实例传文案。
  - **Form** 内置校验消息本地化——新增 core `TigerLocaleFormValidation`、`getFormValidationLabels` 与 `DEFAULT_FORM_VALIDATION_LABELS` / `ZH_CN_FORM_VALIDATION_LABELS`，`TigerLocale` 新增 `formValidation` 段；双端 `Form` 新增可选 `locale` prop 并接入 ConfigProvider locale，`<ConfigProvider :locale="zhCN">` 下必填/类型/范围等内置报错自动中文，单条规则 `message` 仍为最高优先级；`validateRule` / `validateField` / `validateForm` / `validateFormFields` 新增可选 `messages` 末参（向后兼容）。
  - **内置文案接入 ConfigProvider locale**——`TigerLocaleCommon` 新增 `searchPlaceholder` / `clearText` / `noMoreText`（en-US / zh-CN 及多语言预设已补齐）。双端 `Select` / `Tree` / `TreeSelect` / `Transfer` / `Cascader` / `FileManager`（及 Vue `VirtualTable` / `QRCode` / `Timeline` / `Loading` / `ImageViewer` / `AutoComplete`）不再硬编码 `'Search...'` / `'Loading...'` / `'Close'` / `'Clear'`，改读 `mergeTigerLocale(ConfigProvider locale, props.locale)` 并新增可选 `locale` prop 作最高优先级覆盖。
  - **空态 / 加载 / 清除 / 终态默认文案回退 locale**——双端 `List` / `Tree` / `TreeSelect` / `Transfer` / `VirtualTable`（`emptyText` / `notFoundText`）、`InfiniteScroll`（`loadingText` / `endText` → `common.noMoreText`）、`Signature`（`clearText`）、`Spotlight`（`placeholder` / `emptyText`）、`Cascader`（`notFoundText`）、`Tour`（`nextText` / `prevText` / `finishText` → `formWizard`）、`NumberKeyboard`（`confirmText` → `common.okText`）、`Select`（`noOptionsText` / `noDataText` → `common.emptyText`）、`FileManager`（`emptyText` → `common.emptyText`）与 React `Loading`（aria 回退 → `common.loadingText`）的英文默认值改为「未传时回退 `mergeTigerLocale(...)` 的 `common.*` / `formWizard.*`」，显式 prop 仍为最高优先级；`List` / `InfiniteScroll` / `Signature` / `Spotlight` / `Tour` / `NumberKeyboard`（含 React `VirtualTable`）新增可选 `locale` prop。同时修复 Vue `Cascader` 空态此前直接渲染 `notFoundText`、未接 locale 的漏改（React 端早已正确）。
- **core 工具新增**：`date-utils` 新增不可变日期算术 `addDays` / `addMonths` / `addYears`（`addMonths` / `addYears` 按目标月长度裁剪日期，如 1 月 31 日 +1 月 → 2 月 28/29 日）；新增命令式实例 id 计数器工厂 `createInstanceCounter`（`imperative-api`，每实例从 1 起单调自增、互相隔离）与 InputNumber 显示/解析工具 `formatInputNumberDisplay` / `parseInputNumberValue`（`input-number-utils`，`formatter` / `precision` / `parser` 以参数注入），供双端复用。
- React **Signature** 新增 `onClear` 回调：清除（工具栏按钮或 ref `clear()`）时触发，与 Vue 端 `clear` 事件对齐。

### Changed

- **跨端纯逻辑下沉 core（行为不变）**：公共组件 API、props 与 a11y 键盘行为均不变。
  - **DatePicker** 移除各自实现的 `addDays`、手写月/年步进 wraparound，改用 `date-utils` 的 `addDays` / `addMonths`。
  - **键盘导航**——core 新增 `getTreeKeyboardAction` / `getFirstVisibleChildKey`（`tree-utils`）、`getCyclicIndex`（`picker-utils`）、`focusTimePickerOption` / `TimePickerFocusUnit` / `TimePickerFocusAction`（`timepicker-utils`）、`getMenuNavigationKeys`（`menu-utils`）；双端 **Tree**（方向键/Home/End 走查与展开收起/聚焦父子/选择/勾选）、**Mentions**（环绕列表导航）、**TimePicker**（列内 roving 焦点）、**Menu**（方向键映射）改调同一份 core 实现，消除两端内联重复。
  - **命令式 API 与 InputNumber**——**Message** / **Notification** 的实例自增 id 计数器（原各自内联，双端共 4 份）改用 `createInstanceCounter()`；**InputNumber** 的显示格式化与字符串解析改调 `formatInputNumberDisplay` / `parseInputNumberValue`。core 保留 `createInstanceIdGenerator` / `parseInputNumberInput` 兼容别名。
- **SSR 守卫统一（行为不变）**：浏览器端渲染不变，统一改用 core `isBrowser()`。
  - core 端——`a11y-utils`（`createFocusTrap` / `announceToScreenReader` / live-region）/ `anchor-utils` / `chart-export-utils` / `table-export-utils` / `focus-utils` / `image-utils` 中的浏览器端命令式助手统一加 `isBrowser()` 非浏览器早退、稳定 fallback 或明确 browser-only 错误，新增 `tests/core/browser-only-guards.spec.ts` 在 Node 环境回归；`rich-text-editor-utils` 为纯函数、无运行时 DOM 副作用，保持原样。
  - Vue 端——`ConfigProvider` / `Signature` / `ImageAnnotation` 的内联 `typeof window/document === 'undefined'` 改用 core `isBrowser()`（`ImageAnnotation` 保留 `window.Image` 特性检测）。
  - React 端——**ImagePreview** 门户挂载改用 `utils/overlay` 的 `renderBodyPortal`（内含 `isBrowser()` 守卫）替代直接 `createPortal(…, document.body)`，与 Tour / FloatButton / ChartTooltip 一致；测试基建 `tests/setup.ts` 的 `matchMedia` mock 加 `typeof window` 守卫，使 SSR spec 可共用同一 setup。
- **React 受控/非受控样板收敛**：升级版 `useControlledState`（合并 `onChange`、稳定 setter、支持 updater 形式）接入 `Checkbox` / `Input` / `InputNumber` / `Radio` / `RadioGroup` / `CheckboxGroup` / `Textarea` / `MarkdownEditor` / `RichTextEditor` / `Upload` / `Spotlight`，移除各组件手写受控样板；新增 hook 单测覆盖受控 / 非受控 / updater / extra-args / 稳定 setter identity。`ScrollSpy` 与 `NumberKeyboard` 不属纯样板，暂不迁移。组件公共 API 与行为不变。
- **React 单文件巨石按 `Table/` 子模块范式拆分（行为不变）**：**Select** / **DatePicker** / **TimePicker** / **Menu** / **Tree** 各保留瘦 wrapper（公共导出与 props 类型不变），状态、渲染、图标、类型和上下文逻辑拆入子模块。框架无关纯逻辑继续调 core，无新增抽取；**DatePicker** / **TimePicker** 的内部受控值接入 `useControlledState`。公共 API、props、渲染 / a11y 行为及 `api-reports` 基线快照不变。
- **TimePicker / Upload 文案收敛与深度 i18n**：默认文案表收敛到 `locale-utils` 单一来源（新增 `DEFAULT_TIME_PICKER_LABELS` / `ZH_CN_TIME_PICKER_LABELS` / `DEFAULT_UPLOAD_LABELS` / `ZH_CN_UPLOAD_LABELS`），消除标签分散；TimePicker 标签并入 `TigerLocale`（新增 `timePicker` 区块），双端 TimePicker 接入 ConfigProvider locale 且保留字符串 locale 兼容；en-US / zh-CN locale pack 补 `upload` + `timePicker` 区块。公共 `getTimePickerLabels` / `getUploadLabels` 签名不变。
- **杂项收敛（行为不变）**：
  - `shouldLoadMore` 撤销 `@deprecated`——它是 InfiniteScroll 在 IntersectionObserver 不可用时的有意滚动回退路径，并非待移除 API。
  - core 内部 `src/theme/` 重命名为 `src/theme-runtime/`，与命名预设主题目录 `src/themes/`（预设 + `ThemeManager` + modern token）区分；`THEME_CSS_VARS` / `setThemeColors` / `getThemeColor` 及各 `*Classes` 仍经主入口 `@expcat/tigercat-core` 导出，公共 API 不变。
  - 收窄双端组件中冗余 / 脆弱的非空断言（`!`）：`Image` / `QRCode` / `Mentions` / `Alert` 去除带默认值 prop 的断言，`Tree` / `CommentThread` / `Menu` 守卫分支内改用局部 const 收窄 `node.children`。
  - **CLI** 参数校验更严格、反馈更可预测：`tigercat create` 对非法 npm 包名（含大写 / 空格 / 非法字符）直接报错退出并给出建议名；`create` / `playground` 对非法 `--template` 立即失败并列出可选值；`add` 对显式非法 `--framework` 立即失败；非空目录确认文案改为「Overwrite conflicting template files? (other files are kept)」；新增内部工具 `cli/src/utils/validate.ts`。
  - **CLI** `tigercat doctor` 诊断更深：`Version compatibility matrix` 升级为对已检测 framework 的 peer 主版本实际校验（Vue `^3`、React 与 react-dom `^19`，过旧即失败）；新增 `Core exports` 检查，当 `@expcat/tigercat-core` 已安装且可解析时校验其 `exports` 暴露 `.` / `./tailwind` / `./tailwind/modern` / `./tokens.css` / `./figma-variables.json`（未安装 / 不可解析则跳过）。

### Breaking Changes

- **React hook**：公共 hook `useControlledState` 升级为回调透传版——返回值由 `[value, setValue, isControlled]` 收敛为 `[value, setValue]`，新增可选第三参 `onChange`；`setValue(next, ...args)` 在非受控时写内部 state 并在两种模式下始终调用 `onChange?.(next, ...args)`，受控模式不再写内部 state，且支持 updater 形式与稳定 identity。仅消费 `value` 与 setter 者无需改动；此前读取第三个返回值 `isControlled` 或手写受控样板者请见 [迁移指南](docs/MIGRATION.md)。
- **core**：移除废弃别名 `kanbanAddCardClasses`。自 v0.9.0 起它仅作为 `taskBoardAddCardClasses` 的向后兼容别名，现已删除；请改用 `taskBoardAddCardClasses`（详见 [迁移指南](docs/MIGRATION.md)）。
- **Dropdown**：菜单默认渲染到 `document.body`（React portal / Vue Teleport，zIndex 1000），解决表格固定列（sticky）遮挡与 overflow 容器裁剪；新增 `portal` prop（默认 `true`），`portal: false` 可恢复原位渲染的旧 DOM 结构。包装层新增 `data-tiger-dropdown-menu` 属性便于查询，依赖原 DOM 层级的样式选择器或测试需相应调整。
- **跨端 API 对称**：统一受控量 / 事件回调的双端命名（详见 [迁移指南](docs/MIGRATION.md)）。
  - **ImageViewer (React)**：`onIndexChange` 重命名为 `onCurrentIndexChange`，与受控 prop `currentIndex` 及 Vue `update:currentIndex` 对齐。
  - **CommentThread (Vue)**：展开事件由 `expand-change` 改为 `update:expandedKeys`（支持 `v-model:expanded-keys`），与受控 prop `expandedKeys` 及 React `onExpandedChange` 对齐。
  - **Spotlight (Vue)**：移除冗余的 `close` 事件，统一改用 `open-change`（`open-change(false)` 即关闭），与 React `onOpenChange` 对齐。

### Fixed

- 修复 React **Alert** 自动关闭时强制伪造 `MouseEvent` 的不安全类型转换：`onClose` 事件参数改为可选，自动关闭时不再传入伪造事件对象。
- 修复 React **Notification** 入场动画 `setTimeout` 缺少清理函数的问题，组件在动画前卸载不再触发对已卸载组件的状态更新。
- 修复 React **Splitter** 拖拽时分隔条高亮失效的问题：拖拽状态改用 state 追踪（与 Vue 端及 React Resizable 保持一致），按下分隔条即可正确显示拖拽高亮。
- 修复 **VirtualList** 固定高度列表在 `itemHeight` 为 0（或非正值）时可见范围计算产生 `Infinity` / `NaN` 的问题：`getFixedVirtualRange` 现对非正项高与空数据返回安全的空范围。
- 修复 **CLI** `tigercat generate test` / `generate doc-template` 在目标文件已存在时因 `logWarn` 未导入而抛 `ReferenceError` 崩溃的问题：现正确告警并跳过；同时将 CLI 源级 `tsc --noEmit` 类型检查纳入验证，避免仅靠 tsup 转译漏掉此类未定义引用。
- 修复 React 示例 `UseControlledStateDemo.tsx` 仍按旧 3-tuple 解构 `useControlledState` 导致 `pnpm example:build` 类型报错的问题：demo 与展示 snippet 改用新签名 `useControlledState(value, defaultValue, onChange)`，恢复 example 构建绿。

### Infrastructure

- **质量门禁体系**：新增分层门禁 `pnpm quality:quick` / `quality:size` / `quality:examples` / `quality:release`；新增 `pnpm release:check`（校验包版本、运行时 `version` 导出、公开 package exports、Changesets fixed group 与发布文档入口）；新增 SSR 门禁 `pnpm quality:ssr`（覆盖 Nuxt 与 Next.js 示例构建）并纳入 `quality:release`。接入测试覆盖率门禁——`vitest.config.ts` 新增 `coverage.thresholds`（lines 85 / statements 83 / functions 84 / branches 76，取实测基线略低值留漂移余量），`test:coverage` 改为 `vitest run --coverage`。覆盖率阈值（`test:coverage`）、公共 API 基线漂移（`api:baseline:check`）、references 漂移（`docs:api:check`）三道闸此前仅接 `ci.yml`，现一并纳入 `quality:release` 使本地发布链可达（与 CI 改回手动 `workflow_dispatch` 解耦），`release:check` 的必含步骤校验同步登记此三项固化为发布前红门禁。`ci.yml` 维持手动 `workflow_dispatch`（控 GitHub Actions 成本），`publish.yml` / `publish-on-tag.yml` 在发布前插入 `pnpm release:check`。
- **Tailwind v4 基线与体积预算**：新增 Tailwind v4-only 基线检查，覆盖 workspace catalog、CLI 模板版本、core peer dependency 与示例项目依赖入口。重设 size-limit 基线并扩展覆盖——随 MarkdownEditor、Table 列显隐与多组件 i18n 等新功能，full bundle 体积自然增长（已核对增量来自新功能源码而非依赖膨胀，运行时仅依赖 `@floating-ui/dom`），按实测上调三个主入口与 Button 子路径预算（Core 118 kB、Vue 284 kB、React 320 kB、Vue Button 22 kB、React Button 20 kB），并新增重组件子路径（Menu/DatePicker/Table/Tree/TimePicker 双端）与 core 子路径（`tailwind/modern`、`locales/zh-CN`、`icons/common`）的体积回归护栏。
- **API / references 漂移护栏**：新增公共 API 基线快照 `scripts/generate-api-baseline.mjs`（`pnpm api:baseline`）产出确定性的 `api-reports/public-api-baseline.json`（156 个 `*Props` 接口的 props / extends、core 导出名、双端公开组件与命名导出），CI 经「生成 + `git diff --exit-code api-reports`」捕捉删导出 / 删 prop / 改名 / 改 extends 等版本间回归——与 `validate-api.mjs`（当下双端一致性）层次互补。`validate-api.mjs` 新增「受控量双端对称（controlled-parity）」护栏：把 overlay 的 `open → update:open / onOpenChange` 规则推广为显式 parity 表（`currentIndex` / `expandedKeys` / `query` / `hiddenColumnKeys` …），校验 Vue `update:<prop>` 与 React `on<Prop>Change` 成对一致（可按条目以白名单登记有意非对称），读取主文件 + `<Comp>/` 子目录以兼容拆分组件。修复 skill references 漂移：`generate-api-docs.mjs` 的 `formatMarkdown` 改经 `prettier.resolveConfig` 加载仓库配置（`printWidth` 100），生成物即 prettier-clean 且幂等；漂移闸由仅校验 `shared/api-summary.md` 扩展为校验整个 `skills/tigercat/references` 目录；`references/cli.md` 命令表转义未转义的 `|`、`references/performance.md` 补运行时基准段。
- **依赖 / CVE 扫描**：`.github/workflows/security.yml`（周度 + 手动触发，`pnpm audit --audit-level=high`）。发布包运行时仅依赖 `@floating-ui/dom`，现存 high 级告警均来自 example/dev 工具链（Nuxt / Vite / Playwright 等，不随产物分发），故 audit 取报告式（`continue-on-error` + step summary），暴露告警集供人工分诊。`.github/dependabot.yml` 自动升级当前已停用（保留为 `.github/dependabot.yml.disabled`，控 Actions / PR 成本），故现阶段无自动补救机制，依赖升级走人工。
- **运行时基准工作流** `.github/workflows/bench.yml`（周度 + 手动触发，`pnpm bench --run --outputJson` 并上传结果 JSON 产物供人工对比）：刻意非 PR 门禁、无硬回归阈值（micro-bench 在共享 runner 抖动大，硬阈值易误红）。
- **包导出与产物清理**：收敛 `@expcat/tigercat-core` 导出——移除失效冗余的 `./types` / `./theme` 子路径导出（目标文件从未由 tsup 产出、内容已由主入口导出且无消费者），`module` 字段由不存在的 `./dist/index.mjs` 修正为实际 ESM 产物 `./dist/index.js`，`release:check` 必需导出清单同步更新。修正 `@expcat/tigercat-cli` 发布 `files`——移除不存在的 `templates` 目录（实际模板内联进 `dist/index.js`），发布包稳定提供 bin/root 入口。清理 Vue 包内 7 个未使用的内部 composable（`usePopup` / `useDateNavigation` / `useDateSelection` / `useTimeSelection` / `useTimePanelKeyboard` / `useSelectOptions` / `useSelectKeyboard`，约 1,529 LOC）及其 barrel——属死代码移除，公共 composable `useChartInteraction` / `useFormController` / `useDrag` 不受影响。
- **CLI 模板单一来源与文档职责边界**：workspace catalog 补 `@vitejs/plugin-react` / `@vue/tsconfig` / `vue-tsc`，example 项目对应依赖改用 `catalog:`，使 catalog 成为全部模板 toolchain 依赖的单一来源；`tests/core/cli.spec.ts` 扩展为「全部 13 个可 catalog 化的 `TEMPLATE_VERSIONS` ↔ catalog 对齐表」并新增 example `catalog:` 断言，把模板版本漂移变为红色测试（`tigercat` 版本仍由 `release:check` 守护）。新增 [迁移指南](docs/MIGRATION.md) 作为 Breaking change 与迁移路径集中入口；明确 Roadmap、CHANGELOG、脚本文档与 API 文档的职责边界，避免完成历史长期堆回 Roadmap。

## v1.2.0 — Breaking Changes

### Removed

- **ImagePreview**: 移除已废弃的 `visible` prop，请使用 `open`。
- **Image (Vue)**: 移除已废弃的 `preview-visible-change` 事件，请使用 `preview-open-change`。
- **Image (React)**: 移除已废弃的 `onPreviewVisibleChange` prop，请使用 `onPreviewOpenChange`。

## v1.0.0 — 正式发布 🎉

Tigercat 首个正式版本，标志着从实验阶段进入稳定阶段。从 v1.0.0 起遵循 SemVer 语义化版本：
patch — Bug 修复；minor — 新特性/新组件；major — 破坏性变更。

### 亮点

- **133+ 组件** — Vue 3 + React 双端完整实现
- **4619+ 测试** — 237 test files，覆盖单元/集成/a11y
- **WCAG 2.1 AA** — 全组件无障碍达标
- **8 语言国际化** — zh-CN/en-US/zh-TW/ja/ko/th/vi/id
- **5 套预设主题** — Default/Vibrant/Professional/Minimal/Natural + 暗色模式
- **纯 SVG 图表** — 12 种图表类型，零第三方依赖
- **CLI 脚手架** — `@expcat/tigercat-cli` 项目初始化/组件生成
- **E2E 浏览器测试** — Playwright 覆盖 Chrome/Firefox/Safari
- **Bundle Size 监控** — size-limit CI 集成，核心 < 100KB gzip
- **CI/CD 完善** — lint/build/test/size-limit/e2e 全自动化

### 自 v0.8.0 以来的变更

#### 视觉样式升级

- **圆角体系升级** — 控件级 `rounded-md→rounded-lg` (4px→8px)，容器级 `rounded-lg→rounded-xl` (8px→12px)，Modal `rounded-2xl`
- **交互动效优化** — 过渡时长 150ms→200ms，新增 `ease-out` 缓动，slide 动画距离缩短 (translate-y-4→2)
- **Focus Ring 柔化** — 聚焦环从硬色改为 `/40` 半透明，视觉更柔和
- **叠加层模糊** — Modal/Drawer 遮罩新增 `backdrop-blur-[2px]` 毛玻璃效果
- **Card 悬浮** — hover 效果从 `scale-[1.02]` 改为 `-translate-y-1 + shadow-lg`，更自然
- **Token 同步** — tokens.ts / tokens.css / 5 套主题预设圆角值全部对齐
- **新增缓动常量** — `EASING_SPRING` (弹性) / `EASING_SMOOTH` (平滑) + 对应 CSS 变量
- 涉及 40+ 组件工具文件，所有 4619 测试通过

#### 新增组件

- **InputGroup** — 输入框组合容器，支持前后缀、嵌套 Input/Select/Button
- **PrintLayout** — 打印布局组件，支持纸张尺寸、页眉/页脚、分页控制
- **ImageViewer** — 全功能图片查看器，支持缩放/旋转/翻页/键盘导航

#### 组件增强

- **Alert** — 新增 `banner` 模式、`action` 插槽/prop
- **Steps** — 新增 `labelPlacement`、`progressDot` 属性
- **Breadcrumb** — 新增 `maxItems` 折叠显示、自定义分隔符

#### API 一致性改进

- **ImagePreview**: `visible` → `open`（向后兼容，`visible` 标记为 `@deprecated`）
- **Image**: `preview-visible-change` → `preview-open-change`（Vue，向后兼容）
- **Image**: `onPreviewVisibleChange` → `onPreviewOpenChange`（React，向后兼容）
- **Calendar**: `panelChange` → `panel-change`（Vue，**不向后兼容**）
- **Rate**: `hoverChange` → `hover-change`（Vue，**不向后兼容**）

#### a11y 改进

- 新增 `createFocusTrap()` — 焦点陷阱工具，支持 Tab/Shift+Tab 循环、Escape 回调
- 新增 `announceToScreenReader()` — 屏幕阅读器公告工具（aria-live region）
- 新增 `manageLiveRegion()` — 可管理的 live region 实例
- 所有新组件通过 axe-core a11y 自动化测试

#### 测试

- 测试总量: 4619 tests / 237 test files
- 新增 ButtonGroup Vue/React 测试（23 tests）
- 增强 Dropdown Vue/React 测试（+8 tests）
- 增强 Tag Vue/React 测试（+8 tests）
- 新增 a11y-utils 测试（11 new tests）

#### 基础设施

- **E2E 测试** — Playwright 跨浏览器测试（Chromium/Firefox/WebKit）
- **Bundle Size 监控** — size-limit 集成，CI 自动检查
- **性能基准** — Vitest bench 模式，关键组件渲染性能基线
- **CI/CD** — 新增 ci.yml（PR 自动检查）、e2e.yml（浏览器测试）
- **API 一致性扫描器** `scripts/validate-api.mjs` — 全量组件 API 命名检查
- **CLI 脚手架** `@expcat/tigercat-cli` v1.0.0 — 项目初始化、组件生成

#### 文档

- 迁移说明合并到 Changelog，减少根目录历史文档数量
- 文档站升级：客户端搜索、主题切换预览
- 更新 Skills 文档（shared/props、vue/react 代码示例）

### 迁移摘要

从 v0.8.0 升级到 v1.0.0 时，Vue 侧需要注意两个事件名变更：

```diff
- <Calendar @panelChange="handler" />
+ <Calendar @panel-change="handler" />

- <Rate @hoverChange="handler" />
+ <Rate @hover-change="handler" />
```

以下 API 仍可用但已标记为弃用，建议改用 `open` 命名：

```diff
- <ImagePreview :visible="show" />
+ <ImagePreview :open="show" />

- <Image @preview-visible-change="handler" />
+ <Image @preview-open-change="handler" />
```

v0.5.0 的早期破坏性变更仍需留意：弹出层组件统一使用 `open` / `update:open`，Button 原生按钮类型使用 `htmlType` 而不是 `type`。

---

## v0.8.0 — 高级交互与业务组件

新增统一拖拽系统、Splitter、Resizable、CodeEditor、RichTextEditor、Kanban、VirtualTable、InfiniteScroll、FileManager，以及 CLI 脚手架能力；该版本主要为增量功能，无破坏性变更。

## v0.5.0 — 架构筑基

统一弹出层可见性 API（`visible` → `open`），Button 原生类型 API（`type` → `htmlType`），并引入泛型类型、类型安全事件/插槽、设计 Token 与菜单键盘导航等基础能力。
