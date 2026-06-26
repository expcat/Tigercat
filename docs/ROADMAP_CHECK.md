# Tigercat 路线图扫描记录

<!-- LLM-INDEX
type: roadmap-scan
scope: ROADMAP「最新一轮全代码扫描」任务 A-B；任务 C 组件分组扫描 C01「基础动作与文本」（C01-1~C01-8）、C02「头像与状态展示」（C02-1~C02-5）、C03「布局骨架」（C03-1~C03-2）、C04「内容容器」（C04-1~C04-8）、C05「导航轻量组」（C05-1~C05-5）、C06「Steps/Tabs」（C06-1~C06-6）、C07「Menu 单组」（C07-1~C07-8）、C08「Overlay 触发器」（C08-1~C08-7）、C09「Feedback 容器」（C09-1~C09-7）、C10「消息通知」（C10-1~C10-7）、C11「Form 单组」（C11-1~C11-6）、C12「输入基础组」（C12-1~C12-6）、C13「选择/切换基础组」（C13-1~C13-4）、C14「Select 单组」（C14-1~C14-8）、C15「层级选择组」（C15-1~C15-5）、C16「日期组」（C16-1~C16-8）、C17「时间组」（C17-1~C17-3）、C18「Upload 单组」（C18-1~C18-8）、C19「图片展示组」（C19-1~C19-6）、C20「图片编辑组」（C20-1~C20-6）、C21「Table 单组」（C21-1~C21-6）、C22「DataTableWithToolbar 单组」（C22-1~C22-4）、C23「VirtualTable 单组」（C23-1~C23-5）、C24「虚拟列表组」（C24-1~C24-5）、C28「专用图表组」（C28-1~C28-5）
verified-date: 2026-06-27
source: 任务 A：实读 packages/{core,react,vue,cli}/src/index* 与 package.json；scripts/{validate-api,check-public-types,generate-api-docs,generate-api-baseline}.mjs；根 package.json scripts；api-reports/public-api-baseline.json（含 git show HEAD 对照）；skills/tigercat/references/component-index.md；.prettierignore/.prettierrc.json。实跑 pnpm api:validate / types:check（均通过）、pnpm api:baseline / docs:api（生成后 git diff 取证再 git checkout 还原）。Grep packages/*/src 的 @deprecated（0 命中）。任务 B：实读 packages/core/src/{types,utils,themes,theme-runtime,tokens}、tailwind entry/plugin、packages/core/tokens、packages/core/package.json、packages/core/tsup.config.ts、React/Vue DatePicker 与 ConfigProvider、相关 tests/core；复核时直接 pnpm 因本机 11.7.0 低于 engines.pnpm >=11.9.0 被拦截，改用 packageManager 指定的 corepack pnpm 11.9.0 实跑 types:check / api:validate / 目标 vitest（均通过）。任务 C/C01：实读 8 组件（Button/ButtonGroup/Link/Text/Code/Icon/Tag/Badge）的 core 类型 types/{button,link,tag,badge,icon,text,code}.ts、core 工具 utils/{button,badge,tag,text,link,icon,group}-utils.ts 与 class-names/compose-classes/coerce-class-value/svg-attrs/dev-warn/common-icons、theme-runtime/colors.ts，packages/{react,vue}/src/components 的 8 组件实现，tests/{react,vue} 对应 spec，component-index.md；静态实读取证（含 grep 取证 role/label/helper 用法），C01 为仅文档变更未跑门禁命令。任务 C/C02：实读 packages/{core,react,vue}/src/components/{Avatar,AvatarGroup,Empty,Result,Statistic,QRCode,Watermark}.{tsx,ts} 与对应 core/src/utils/{avatar,empty,result,statistic,qrcode,watermark}-utils.ts 及 core/src/types/*。任务 C/C03：实读 packages/core/src/types/{layout,container,grid,space,divider}.ts、packages/core/src/utils/{layout-utils,container-utils,grid,space,divider}.ts、React/Vue 对应布局组件实现、tests/{core,react,vue} 定向测试、examples/example/{react,vue3} 布局示例、skills/tigercat/references 相关 generated references。任务 C/C04：实读 packages/core/src/types/{card,list,descriptions,skeleton,collapse,timeline}.ts 与 locale.ts、packages/core/src/utils/{card,list,descriptions,skeleton,collapse,timeline}-utils.ts（对照 grid.ts/table-utils.ts/markdown-editor-utils.ts 安全 class 写法）、React/Vue 对应七组件实现、tests/{react,vue} 定向 spec、examples/example/{react,vue3} 内容容器示例、skills/tigercat/references；实跑 C04 定向 vitest（12 files/210 tests 通过）+ validate-api/check-public-types 通过，未改动任何源码。任务 C/C05：实读 packages/core/src/types/{affix,anchor,back-top,breadcrumb,float-button,scroll-spy}.ts、packages/core/src/utils/{affix-utils,anchor-utils,back-top-utils,breadcrumb-utils,float-button-utils,scroll-spy-utils}.ts、React/Vue 对应导航组件实现、tests/{core,react,vue} 定向测试、skills/tigercat/references/shared/props/navigation.md 与 examples/navigation.md；实跑本地 vitest/API/type 验证通过；未改动任何源码。任务 C/C06：实读 Steps/StepsItem/Tabs/TabPane 的 core 类型 types/{steps,tabs}.ts、core 工具 utils/{steps,tabs}-utils.ts、packages/{react,vue}/src/components/{Steps,StepsItem,Tabs,TabPane}、tests/{react,vue}/{Steps,Tabs}.spec 与 tests/core/tabs-utils.spec.ts、skills/tigercat/references/{component-index.md,shared/props/navigation.md,examples/navigation.md}；实跑 C06 目标 vitest、pnpm api:validate、pnpm types:check（均通过）。任务 C/C07：实读 Menu/MenuItem/MenuItemGroup/SubMenu 的 core 类型 types/menu.ts、core 工具 utils/menu-utils.ts（并对照 utils/focus-utils.ts）、packages/react/src/components/Menu.tsx 与 Menu/{context,state,types,menu-item,submenu,menu-item-group,icons}、packages/vue/src/components/Menu.ts 单文件与 {MenuItem,MenuItemGroup,SubMenu}.ts re-export、tests/{react,vue}/Menu.spec.ts* 与 tests/core/menu-utils.spec.ts、skills/tigercat/references/component-index.md；grep 取证 focus-utils 菜单函数消费者仅 Dropdown、React Menu 子组件无 displayName、Vue {class,style,...rest} 透传样板（7 处）；实跑 C07 目标 vitest（tests/react/Menu.spec.tsx + tests/vue/Menu.spec.ts + tests/core/menu-utils.spec.ts，3 文件 119 测试通过）、pnpm api:validate、pnpm types:check（均通过）。任务 C/C08：实读 Dropdown/DropdownMenu/DropdownItem/Popover/Popconfirm/Tooltip 的 core 类型、floating/overlay/focus 工具、React/Vue 实现、双端 usePopup/useFloatingPopup 与 overlay 封装、4 个 popup 双端 spec、core floating/focus/overlay spec、generated references；grep 取证 BaseFloatingPopupProps/PopoverTrigger/TooltipTrigger/defer/focus-utils 菜单消费者；实跑 C08 目标 vitest（12 文件 225 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。任务 C/C09：实读 Modal/Drawer/Loading/Progress/Tour 的 core 类型与工具、React/Vue 实现、overlay helper、feedback props/examples references、双端 spec 与 core overlay/tour-utils spec；grep 取证 open callback、mask=false、locale、portal/Teleport、focus/scroll/Escape/aria；实跑 C09 目标 vitest（13 文件 243 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。任务 C/C10：实读 Message/Notification/NotificationCenter 的 core 类型 types/{message,notification}.ts、core 工具 utils/{message-utils,notification-utils,notification-center-utils}.ts、React/Vue 三组件实现与 packages/{react,vue}/src/index 导出、tests/{core,react,vue} 8 个定向 spec、generated references（component-index.md、shared/props/feedback.md、shared/api-summary.md）；grep 取证 Message position 未被 addMessage 读取（双端单例恒 top）、NotificationCenter `_currentGroup` 双端死代码、imperative 共享 helper（normalizeStringOption/createInstanceCounter/ANIMATION_DURATION_MS/isBrowser）与 `Message`/`notification` 导出命名、core 回退不对称；实跑 C10 目标 vitest（8 文件 112 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。任务 C/C11：实读 Form/FormItem/useFormController 的 core 类型 types/form.ts、core 工具 utils/{form-validation,form-dependency-utils,form-item-styles,form-history-utils}.ts、React 实现 components/{Form,FormItem}.tsx 与 hooks/useFormController.ts、Vue 实现 components/{Form,FormItem}.ts 与 composables/useFormController.ts、tests/{core,react,vue} 8 个定向 spec、generated references（component-index.md、shared/props/form.md、shared/api-summary.md、examples/form.md）；FormWizard（C30）排除；grep 取证 useFormContext 消费者与 context.model/updateValue 无人读、8 个 core 表单 helper 无生产消费者、addField/resetFields/undo 双端契约差异、getValueByPath 数组段限制；实跑 C11 目标 vitest（8 文件 248 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。任务 C/C12：实读 Input/Textarea/InputGroup/InputGroupAddon/InputNumber/NumberKeyboard/Mentions 的 core 类型 types/{input,textarea,input-group,input-number,number-keyboard,mentions}.ts、core 工具 utils/{input-styles,textarea-auto-resize,input-group-utils,input-number-utils,number-keyboard-utils,mentions-utils}.ts、React/Vue 对应组件实现、tests/{core,react,vue} 16 个定向 spec、generated references（component-index.md、shared/props/form.md、shared/patterns/common.md、examples/form.md）；grep 取证 InputGroup size 上下文消费者、React Input/Textarea reference onChange 示例、Vue InputNumber defaultValue/className props、Mentions filteredOptions 打开/渲染分支、InputNumber 重复 spec、NumberKeyboard delete/confirm locale；实跑 C12 目标 vitest（16 文件 473 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。
source-c13: 实读 Checkbox/CheckboxGroup、Radio/RadioGroup、Switch、Slider、Stepper、Rate、Segmented 的 core 类型 types/{checkbox,radio,switch,slider,stepper,rate,segmented}.ts、core 工具 utils/{radio-utils,radio-group-utils,rate-utils,stepper-utils,segmented-utils}.ts 与 utils/helpers/slider-utils.ts，双端组件实现、双端定向 spec、tests/core/{segmented-utils,switch-theme}.spec.ts，以及 component-index、shared/props/{form,basic}.md、examples/form.md；grep 取证 ARIA/键盘事件、marks 布局、slider/stepper 数值 helper 消费者与测试覆盖。
source-c14: 实读 Select/AutoComplete 全链路——core 类型 types/{select,auto-complete}.ts、core 工具 utils/{select-utils,auto-complete-utils,picker-utils}.ts、React 实现 components/Select.tsx 与 Select/{state,render-option,types,icons}、components/AutoComplete.tsx、Vue 实现 components/{Select,AutoComplete}.ts、tests/{react,vue}/{Select,AutoComplete}.spec.* 与 tests/core/{picker-utils,select-utils}.spec.ts、examples SelectDemo/AutoCompleteDemo、generated component-index；grep 取证 allowFreeInput 双端零消费、Select virtual/listHeight 双端零消费、getPickerTriggerKeyAction 仅 TreeSelect/Cascader 消费而 Select 未用；以 packageManager pnpm 11.9.0 实跑 C14 目标 vitest（6 文件 190 测试通过）与 api:validate / types:check（均通过），未改动源码。
source-c15: 实读 Tree/TreeSelect/Cascader/Transfer 全链路——core 类型 types/{tree,tree-select,cascader,transfer}.ts、core 工具 utils/{tree-utils,tree-select-utils,cascader-utils,transfer-utils,picker-utils}.ts、React 实现 components/Tree.tsx 与 Tree/{state,render-node,render-row,types,icons}、components/{TreeSelect,Cascader,Transfer}.tsx、Vue 实现 components/{Tree,TreeSelect,Cascader,Transfer}.ts、tests/{react,vue}/{Tree,TreeSelect,Cascader,Transfer}.spec.* 与 tests/core/{tree-utils,picker-utils}.spec.ts、examples Tree/TreeSelect/Cascader/Transfer demo、generated component-index/shared props/api-summary；grep 取证 virtual/VirtualList、showSearch/filter、clear aria、Transfer split/filter、core direct spec 覆盖；实跑 C15 目标 vitest（10 文件 285 测试通过）、api:validate、types:check（均通过），未改动源码。
source-c16: 实读 DatePicker/Calendar 全链路——core 类型 types/{datepicker,calendar}.ts、core 工具 utils/{date-utils,calendar-utils,datepicker-i18n,datepicker-styles}.ts 与 utils/i18n/datepicker-locales/*、React 实现 components/DatePicker.tsx + DatePicker/{state,render-calendar,render-mobile,types}.ts(x)、components/Calendar.tsx、Vue 实现 components/{DatePicker,Calendar}.ts、tests/{core/date-utils,core/datepicker-i18n,react/DatePicker,vue/DatePicker,react/Calendar,vue/Calendar}.spec.*、examples DatePickerDemo/CalendarDemo、generated component-index/i18n；grep 取证 core CalendarProps 双端零消费、WEEKDAYS/MONTHS/getMonthDays 仅 Calendar 消费、getDatePickerLabels 仅 DatePicker 消费、getIntlOptionsFromDateFormat 五分支全等、datepicker-i18n 7 语言 inline map vs 13 preset 的 6 个 preset-only 语言回落英文；以本机 pnpm 11.9.0 实跑 C16 目标 vitest（6 文件 117 测试通过）、api:validate（一致性 0 问题）、types:check（全部 props 类型导出），均通过，未改动源码。
source-c17: 实读 TimePicker/Countdown/CronEditor 全链路——core 类型 types/{timepicker,countdown,cron-editor}.ts、core 工具 utils/{time-utils,timepicker-utils,countdown-utils,cron-editor-utils}.ts、React 实现 components/TimePicker.tsx 与 TimePicker/{state,render-desktop,render-mobile,types,icons}、components/{Countdown,CronEditor}.tsx、Vue 实现 components/{TimePicker,Countdown,CronEditor}.ts、tests/{core,react,vue} 9 个定向 spec、examples TimePickerDemo/CountdownDemo/CronEditorDemo、generated component-index 与 shared/props/{form,data}.md；grep 取证 TimePicker 秒级范围判断、秒列禁用逻辑、CronEditor className 透传、Countdown now/tick 测试契约；实跑 C17 目标 vitest（9 文件 174 测试通过）、pnpm run api:validate、pnpm run types:check（均通过），未改动源码。
source-c18: 实读 Upload/FileManager/Signature 全链路——core 类型 types/{upload,signature,file-manager}.ts、core 工具 utils/{upload-utils,upload-labels,signature-utils,file-manager-utils}.ts（对照 locale-utils 的 DEFAULT_UPLOAD_LABELS/ZH_CN_UPLOAD_LABELS、tailwind-entry）、React components/{Upload,FileManager,Signature}.tsx 与 index.tsx 导出、Vue components/{Upload,FileManager,Signature}.ts 与 index.ts 导出、tests/{core,react,vue} 9 个定向 spec、examples {Upload,FileManager,Signature}Demo、generated component-index；grep 取证 Tailwind v4（core/package.json tailwindcss ^4.0.0）下 Upload 4 处 bg-opacity-* 失效、applyFileDragReorder 零组件消费、FileManager draggable 半接线、React FileManager Loading 硬编码 vs Vue locale、core FileManagerProps/columns 漂移死字段、formatFileSize vs formatFileSizeLabel 双实现、getFileExtension 重名异义；以 packageManager pnpm 11.9.0 实跑 C18 目标 vitest（9 文件 238 测试通过）与 api:validate / types:check（均通过），未改动源码。CropUpload 属 C20 排除。
source-c19: 实读 Image/ImagePreview/ImageGroup/ImageViewer 全链路——core 类型 types/{image,image-viewer}.ts、core 工具 utils/{image-utils,image-viewer-utils,group-utils}.ts、React components/{Image,ImagePreview,ImageGroup,ImageViewer}.tsx 与 index 导出、Vue components/{Image,ImagePreview,ImageGroup,ImageViewer}.ts 与 index 导出、tests/core/{image-utils,image-viewer-gesture,group-utils}.spec.ts 与 tests/{react,vue} 9 个组件 spec（含 ImagePreview.ssr）、examples {Image,ImageViewer}Demo、generated component-index；grep 取证 ImagePreview/ImageViewer 两套近重复全屏查看器（ImageViewer 双端无 portal/无 body 滚动锁/nav 环绕 vs ImagePreview 夹紧）、image-utils vs image-viewer-utils 手势/图标重复（clampScale≡clampZoom、calculateTransform⊂getImageTransformStyle、5/7 图标 path 字节相同）、getTouchDistance 零组件消费、Vue ImageViewer locale prop 未声明在 VueImageViewerProps/core 且 React 无 locale、core ImageGroupProps 仅 preview 漂移、getImageGroupClasses 替换语义、previewTrigger='hover' 在 ImageGroup 内预览失效（latent）；以 packageManager pnpm 11.9.0 实跑 C19 目标 vitest（12 文件 244 测试通过）与 api:validate / types:check（均通过），未改动源码。ImageCropper/ImageAnnotation/CropUpload 属 C20 排除。
source-c20: 实读 ImageCropper/ImageAnnotation/CropUpload 全链路——core 类型 types/{image,image-annotation}.ts、core 工具 utils/{image-utils,image-annotation-utils,crop-upload-utils}.ts、React components/{ImageCropper,ImageAnnotation,CropUpload}.tsx、Vue components/{ImageCropper,ImageAnnotation,CropUpload}.ts、tests/{core,react,vue} 9 个定向 spec、examples {ImageCropper,ImageAnnotation,CropUpload}Demo、generated component-index/shared props/api-summary；grep 取证 ImageCropper 静态 SVG mask id、CropUpload modalWidth 零消费、ImageAnnotation SVG role=button 键盘激活缺口、Vue selectedId/tool 无 update 事件、ImageAnnotationChangeMeta 未实现分支、硬编码编辑文案/aria；以 packageManager pnpm 11.9.0 实跑 C20 目标 vitest（9 文件 187 测试通过）与 api:validate / types:check（均通过），未改动源码。
source-c22: 实读 DataTableWithToolbar / TableToolbar 全链路——core 类型 composite.ts（TableToolbar* 系列 + DataTableWithToolbarProps）与 types/table.ts 的 TableProps（共享边界对照）、React components/DataTableWithToolbar.tsx（569 行，extends Omit<TableProps,'className'|'onPageChange'> 全量透传）、Vue components/DataTableWithToolbar.ts（854 行，VueDataTableWithToolbarProps 手维子集 + inheritAttrs:false restAttrs 透传）、双端 index 导出、tests/{react,vue}/DataTableWithToolbar.spec.*（812/877 行）、examples DataTableWithToolbarDemo.{tsx,vue}、generated component-index/api-summary/props/composite 与 generator generate-api-docs.mjs；grep 取证 Vue 声明 props 缺 ~20 个 Table 能力（expandable/virtual 系/editable/filterMode/advancedFilterRules/列行拖拽/summaryRow/groupBy/export 系/cardSelectionPosition/cardPadding/cardFieldGap）、core DataTableWithToolbarProps 两端零消费且 Vue export * 反向不一致、hasSearch 无 toolbar 时双端分歧、setFilterValue 过滤值更新双端一致、TableToolbar 在 index/api-summary 列为组件而 props 文档注明非独立导出；以本机 pnpm 11.9.0（与 packageManager 一致）实跑 C22 目标 vitest（2 文件 63 测试通过）与 api:validate / types:check（均通过），未改动源码。Table 自身实现属 C21。
source-c23: 实读 VirtualTable 全链路——core 类型 types/virtual-table.ts、core 工具 utils/virtual-table-utils.ts（对照 table-utils.ts 的 fixed column/colgroup/tableBaseClasses 逻辑）、React components/VirtualTable.tsx、Vue components/VirtualTable.ts、tests/core/virtual-table-utils.spec.ts、tests/{react,vue}/VirtualTable.spec.*、examples {react,vue3} VirtualTableDemo、benchmarks/virtual-table.bench.ts、generated component-index/shared props data+advanced/examples advanced；grep 取证 core VirtualTableProps 的 width/virtualizeColumns/rowClassName 与双端组件 props 漂移、React loading 硬编码 vs Vue locale、grid a11y/键盘事件缺口、table-fixed 与 Table border-separate/colgroup 复用差异、calculateVirtualRange 异常输入覆盖缺口；实跑 C23 目标 vitest（3 文件 86 测试通过）与 api:validate / types:check（均通过），未改动源码。C21/C22 已由远端更新合并；C23 本轮只扫描 VirtualTable。
source-c24: 实读 VirtualList / InfiniteScroll 全链路——core 类型 types/{virtual-list,infinite-scroll}.ts、core 工具 utils/{virtual-list-utils,infinite-scroll-utils}.ts、React components/{VirtualList,InfiniteScroll}.tsx、Vue components/{VirtualList,InfiniteScroll}.ts、tests/core/{virtual-list-strategies,infinite-scroll-utils}.spec.ts、tests/{react,vue}/{VirtualList,InfiniteScroll}.spec.*、examples {react,vue3} {VirtualList,InfiniteScroll}Demo、benchmarks/{virtual-scroll-fps,core-utils}.bench.ts、generated component-index/shared props advanced/examples advanced；grep 取证 dynamicSizeStrategy/updateItemHeight 仅 core 测试消费、双端 VirtualList 未做 DOM measurement 回写、IntersectionObserver rootMargin 只覆盖 bottom/right、scroll fallback 已支持 inverse top/left、Vue VirtualList className 走 attrs 合并、advanced props 仅列 InfiniteScroll 3/9 与 VirtualList 3/8；实跑 C24 目标 vitest（6 文件 109 测试通过）与 api:validate / types:check（均通过），未改动源码。
source-c28: 实读 FunnelChart / HeatmapChart / TreeMapChart / SunburstChart / OrgChart / Gantt 全链路——core 类型 types/{chart,gantt,org-chart}.ts、core 工具 utils/{funnel-chart,heatmap-chart,treemap-chart,sunburst-chart,org-chart,gantt}-utils.ts、React/Vue 对应组件、双端 index 导出、tests/{core,react,vue} 18 个定向 spec、examples {react,vue3} 专用图表 demo、generated component-index/shared props charts/examples charts/api-summary；grep 取证 Heatmap 空矩阵 min/max、Funnel 非正值、Gantt invalid date、TreeMap/Sunburst memo cache、OrgChart/Gantt disabled click/hover、charts props 文档覆盖。直接 pnpm 因本机 11.7.0 低于 engines.pnpm >=11.9.0 被拦截，corepack 不在 PATH；以 npx -y pnpm@11.9.0 实跑 C28 目标 vitest（18 文件 238 测试通过）与 api:validate / types:check（均通过），未改动源码。
note: 本文仅记录可验证发现与修复建议；扫描阶段不改组件代码、不改公共 API、不运行会重写生成产物的命令。结论与建议供维护者取舍。
-->

> 本文是对 [ROADMAP.md](ROADMAP.md)「最新一轮全代码扫描」按任务顺序执行的扫描结果记录。**不改组件代码、不改公共 API**；每条发现给出 `发现问题 / 公共内容决策 / 建议修复顺序 / 目标验证命令`。优先级：P1 影响发布门禁/正确性；P2 影响文档准确性与可维护性；P3 清理项。

---

## 任务 A — 公共 API、导出面与文档生成链路扫描

**扫描范围**：`packages/*/src/index*`、`packages/*/package.json`、`api-reports/`、`scripts/{validate-api,check-public-types,generate-api-docs,generate-api-baseline}.mjs`、`skills/tigercat/references`。

**结论速览**：双端组件值导出对称、`api:validate` / `types:check` 通过、源码 `@deprecated` 零残留（基础面健康）。但发现 **3 条需处理项**：① 公共 API 基线既滞后于源码、其校验门禁又因格式不匹配在所有平台恒失败（P1）；② 生成的「权威组件索引」用错了数据源，误列/漏列组件（P2）；③ 「从 index 枚举公开组件」逻辑在三个脚本里各写一份且口径不一（P2，亦是 ② 的根因）。其余为低优先清理与刻意的框架差异。

---

### A-1 导出完整性与双端对称

**发现问题**

- ✅ 组件值导出双端对称：`validate-api.mjs` 的 `missing-react` / `missing-vue` 跨框架检查 0 命中；`api:baseline` 报告 `148 vue / 148 react components`。无单端缺失组件。
- ✅ Props 类型导出齐全：`types:check`（`check-public-types.mjs`）通过——但注意该脚本只按「组件**文件名**」校验 `${prefix}${File}Props`，对单文件多导出的子组件（MenuItem/SubMenu、PrintPageBreak、StepsItem、DropdownMenu/Item 等）不单独校验，存在覆盖盲区（与 A-5 同源，见该节）。
- ⚠️ P3｜Vue index 冗余且与 React 不对称的核心类型再导出：[packages/vue/src/index.ts:9](../packages/vue/src/index.ts) 用 `export type { DrawerPlacement, DrawerSize, ListItem, TableColumn, TreeNode, UploadFile } from '@expcat/tigercat-core'`，而上一行 [:8](../packages/vue/src/index.ts) 已 `export * from '@expcat/tigercat-core'` 全量再导出，这 6 个类型属重复；React index 仅靠 `export *`（[packages/react/src/index.tsx:8](../packages/react/src/index.tsx)），无此块。
- ℹ️ 刻意的框架差异（非缺陷）：React 暴露 context 钩子/类型与 ref 句柄（`useFormContext`、`FormHandle`、`FormSubmitEvent`、各 `*ContextValue`、`SignatureRef`/`ImageCropperRef`/`CarouselRef`、`useControlledState`）；Vue 暴露 `v-model` 取向的类型（`VueDatePickerModelValue`、`VueTimePickerModelValue`、`TigerConfig`、`AnchorContext`）。属 React Context/forwardRef vs Vue v-model/expose 的惯用差异，`validate-api` 的 overlay/受控量 parity 检查均通过。

**公共内容决策**

- A-1 冗余再导出：**拆出/删除**（删 Vue index 第 9–16 行的 6 类型再导出，统一只靠 `export *`）；或维持现状仅作风格统一——低优先。
- 框架差异类：**保持框架分离**，不强行对齐，仅在文档说明。

**建议修复顺序**：随 A-7 一并处理（低优先，可延后）。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

### A-2 package.json 导出映射

**发现问题**

- ✅ core 导出映射完整一致：[packages/core/package.json](../packages/core/package.json) 列 13 个 `./locales/*` + 13 个 `./datepicker-locales/*` + 5 个 `./icons/*` + `./tailwind`、`./tailwind/modern`、`./tokens.css`、`./figma-variables.json`、`./utils/table-export`。与源码目录逐一吻合：`packages/core/src/utils/i18n/{locales,datepicker-locales}/` 各正好 13 个 locale 文件（+ index）。无「列了导出却缺源」或「有源却未导出」。
- ⚠️ P3｜core 的 locale/datepicker/icon 子路径为**手工枚举**（38+ 条），新增 locale 时需手动改 package.json，且无自动护栏校验「源 locale 文件 ↔ 导出映射」同步。当前无缺陷，属维护风险。
- ℹ️ 刻意差异（非缺陷）：React/Vue 为 **ESM-only**（`exports["."]` 仅 `import`/`default`，无 `require`），core 为 import+require 双格式；`sideEffects` 在 core 为 `false`、在 React/Vue 列了 chunk/component 通配（与 tree-shaking 取舍相关，归 Task F 体积扫描深究）。

**公共内容决策**：locale↔导出映射同步校验属**脚本 helper 候选**（可与 G 类脚本扫描合并），非组件公共内容；其余保持现状。

**建议修复顺序**：P3，可延后到 Task G（脚本/自动化扫描）。

**目标验证命令**：`pnpm api:baseline:check`、`pnpm example:build`。

---

### A-3 废弃 API 残留

**发现问题**

- ✅ `packages/*/src/**/*.{ts,tsx}` 全量 Grep `@deprecated` **0 命中**；`validate-api.mjs` 的 `deprecated-in-example` 检查无可标记项。无废弃 API 残留、无示例误用废弃 API。前几轮清理（如 `kanbanAddCardClasses`、`shouldLoadMore`）已落地干净。

**公共内容决策**：无。

**建议修复顺序**：无需处理。

**目标验证命令**：`pnpm api:validate`。

---

### A-4 公共 API 基线（api-reports）— **P1**

**发现问题**

- 🔴 P1｜**基线内容滞后于源码**：`api-reports/public-api-baseline.json`（已提交版）缺少源码中确已存在的核心导出。格式无关取证：
  - `git show HEAD:api-reports/public-api-baseline.json | grep -c TigerLocaleTimePicker` → **0**，但源码定义于 [packages/core/src/types/locale.ts](../packages/core/src/types/locale.ts)（另见 locale-utils.ts）。
  - `git show HEAD:… | grep -c ZH_CN_UPLOAD_LABELS` → **0**，但源码定义于 [packages/core/src/utils/locale-utils.ts](../packages/core/src/utils/locale-utils.ts)、`utils/i18n/locales/zh-CN.ts`。
  - 即 baseline 未在这些导出加入后重新生成。
- 🔴 P1｜**基线校验门禁恒失败（跨平台，非 Windows 特有）**：[scripts/generate-api-baseline.mjs:219](../scripts/generate-api-baseline.mjs) 用 `JSON.stringify(snapshot, null, 2)` 直写——非空数组**永远多行**、且**不经 prettier**；但 `.prettierignore`（[查看](../.prettierignore)）未排除 `api-reports/`，故 `pnpm format` 会用 prettier 把短数组压成单行（printWidth 100），**已提交基线即 prettier 压缩态**（如 `AffixProps.props` 单行）。而 `api:baseline:check = pnpm api:baseline && git diff --exit-code api-reports`（[package.json:53](../package.json)）中间**无格式化步骤**：重生成的多行 ≠ 已提交的单行 → `git diff --exit-code` 必非零 → 门禁恒失败，真实内容漂移（上一条）被淹没在格式 diff 里（本轮重生成 diff 达 +497/−79，绝大多数是短数组 reflow）。
  - 对照：`generate-api-docs.mjs` 自身调用 prettier（`formatMarkdown`），故 `docs:api:check` 不存在此类格式错配（见 A-5）。两者范式应统一。

**公共内容决策**：属**脚本/门禁修复**（非组件公共 API 变更）。基线本身已是 core/vue/react 三端共享快照，无需再拆合。

**建议修复顺序**（P1，建议本轮后优先）：

1. 让基线生成自带格式化——在 `generate-api-baseline.mjs` 输出前过一遍 prettier（对齐 `generate-api-docs.mjs` 范式）；或在 `api:baseline:check` 内于 diff 前补 `prettier --write api-reports`；或把 `api-reports/` 加入 `.prettierignore` 并以「生成器原样多行」重生成提交。三选一，使「生成器输出 == 已提交格式」。
2. 修好格式错配后重跑 `pnpm api:baseline`，审阅暴露出的真实新增（`TigerLocaleTimePicker`、`ZH_CN_UPLOAD_LABELS` 等），确认无意外破坏后提交刷新基线（按需在 MIGRATION/changeset 记录）。

**目标验证命令**：`pnpm api:baseline`、`pnpm api:baseline:check`、`pnpm quality:release`（其内含该门禁）。

---

### A-5 生成 references 漂移与「组件索引」生成逻辑 — **P2**

**发现问题**

- 🟠 P2｜**「权威组件索引」用错数据源，误列/漏列组件**：[skills/tigercat/references/component-index.md](../skills/tigercat/references/component-index.md) 自称 canonical route map，但 [generate-api-docs.mjs](../scripts/generate-api-docs.mjs) 的 `getComponentRows`/`propsToComponents` 是从 **core `*Props` 接口 + 文件名兜底**推导组件，而非读真实 index 导出，导致：
  - **误列（不是导出组件）**：`TableToolbar`——来自 [composite.ts:968](../packages/core/src/types/composite.ts) 的 `TableToolbarProps`，但两端 index 都不导出 `TableToolbar`（生成器自己的 `COMPONENT_USAGE_NOTES.TableToolbar` 都注明「不作为独立组件导出」）；`Drag`——`drag.ts` 无任何 `*Props` 接口，被 `getComponentRows` 的文件名兜底 `kebabToPascal('drag')` 凭空造出（公共 API 只有 `useDrag` 钩子/组合式）。
  - **漏列（确为导出组件）**：`StepsItem`、`PrintPageBreak`——两端 index 均导出（[react index.tsx:178/376](../packages/react/src/index.tsx)、[vue index.ts:150/344](../packages/vue/src/index.ts)），但其 Props 不在 core 类型里（[steps.ts](../packages/core/src/types/steps.ts) 仅 `StepsProps`、[print-layout.ts](../packages/core/src/types/print-layout.ts) 仅 `PrintLayoutProps`；Vue `PrintPageBreak` 本身无 props），故生成器看不到、不收录。
  - 该索引「自洽」（已提交版与重生成版一致），所以 `docs:api:check` 不报错——属**生成逻辑缺陷**而非漂移，门禁照样放行。
- 🟢 P3（本机噪声，非真实漂移）：本检出上 `pnpm docs:api` 后 `git diff` 显示约 21 个 references 文件「changed」，全部伴随 `LF will be replaced by CRLF` 警告——CRLF/prettier 本机噪声（与记忆中「prettier 在本检出为红」一致）。真实漂移须在干净 CI 复核。

**公共内容决策**：见 A-7——根因是「公开组件枚举」逻辑分散且口径不一，应**合并为共享脚本 helper**，让 component-index 以真实 index 导出为权威来源（必要时辅以 core 类型补 Props 字段）。

**建议修复顺序**（P2，紧随 A-7）：

1. 先做 A-7 的共享 helper。
2. 改 `getComponentRows` 以「真实 index 导出的组件集」为准来产生行（Drag/TableToolbar 自然消失、StepsItem/PrintPageBreak 自然纳入），Props 字段仍可来自 core 类型，缺失 Props 的子组件按需走 `VIRTUAL_COMPONENTS` 或别名补齐。
3. 重生成并提交 references。

**目标验证命令**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`。

---

### A-6 ~ A-7 文档生成链路一致性与公共拆合判断 — **P2**

**发现问题**

- 🟠 P2｜**「从 index 枚举公开组件」逻辑三处重复且口径不一**（核心拆合问题，亦是 A-5 根因）：
  - [validate-api.mjs:530 `collectPublicComponentExports`](../scripts/validate-api.mjs)：读真实 index、正则 `export {…} from './components/`、PascalCase、滤 `*Context`；并配 `DOC_SECTION_ALIASES`（StepsItem→Steps、PrintPageBreak→PrintLayout…）做覆盖校验——**口径最权威**（故其 LLM 文档覆盖检查能正确认到子组件，`api:validate` 通过）。
  - [generate-api-baseline.mjs:158 `componentExports`](../scripts/generate-api-baseline.mjs)：与上者近乎重复的 index 解析（读真实 index、同款正则与过滤）。
  - [generate-api-docs.mjs](../scripts/generate-api-docs.mjs)：**不读 index**，改从 core `*Props` + 文件名兜底推导——即 A-5 误列/漏列的来源。
  - 三套对「什么是公开组件」的定义不一致（baseline 报 148、component-index 报 147、且成员集不同），是典型的「该合未合」。
- ℹ️ `validate-api.mjs` 经核实**不存在** A-5 的盲区（靠别名表正确归并子组件）；问题集中在 `generate-api-docs.mjs` 用了不同且更弱的来源。

**公共内容决策**：**合并到共享脚本 helper**。把「解析框架 index → 公开组件/导出集（PascalCase、滤 Context、含子组件、别名表）」抽成单一模块（如 `scripts/lib/public-components.mjs`），由 `validate-api`、`generate-api-baseline`、`generate-api-docs` 三者共同消费；component-index 改以该权威集为准。属脚本层公共内容，不涉及组件运行时，不入 core 包。

**建议修复顺序**（P2）：A-7 抽 helper → A-5 改 component-index 生成 → A-4 修基线门禁格式错配并刷新（A-4 也可独立先行）。均为脚本/文档层改动，无公共 API 破坏。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm api:baseline:check`、`pnpm docs:api:check`。

---

### 任务 A 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| 公开组件枚举逻辑（A-6/A-7） | **合并→共享脚本 helper** | 三脚本各写一份、口径不一；抽 `scripts/lib/public-components.mjs` 统一。脚本层，不入 core。 |
| component-index 生成来源（A-5） | **改用权威来源** | 以真实 index 导出为准，Props 字段仍取 core 类型；消除 Drag/TableToolbar 误列、补齐 StepsItem/PrintPageBreak。 |
| api 基线格式/门禁（A-4） | **修复门禁（不拆合）** | 生成器自带 prettier 或门禁补格式化，使「生成==提交」，再刷新滞后内容。 |
| locale↔导出映射同步（A-2） | **延后（脚本 helper 候选）** | 归 Task G 脚本扫描，加同步校验；当前无缺陷。 |
| Vue index 冗余核心类型再导出（A-1） | **拆出/删除（低优先）** | 删 Vue index 第 9–16 行，统一靠 `export *`。 |
| React/Vue 框架差异类导出（A-1） | **保持框架分离** | Context/ref vs v-model 惯用差异，仅文档说明。 |

---

### 本轮验证命令实跑输出摘要（证据）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `pnpm api:validate` | ✅ 通过（0 问题） | 命名/双端 parity/overlay/受控量/废弃用法/文档覆盖均无问题 |
| `pnpm types:check` | ✅ 通过 | 「All public component props types are exported.」（按文件名校验，有子组件盲区，见 A-1/A-5） |
| Grep `@deprecated` (packages/*/src) | ✅ 0 命中 | 无废弃 API 残留（A-3） |
| `pnpm api:baseline` + `git diff` | ⚠️ +497/−79 | `git show HEAD` 证实 `TigerLocaleTimePicker`/`ZH_CN_UPLOAD_LABELS` 缺失（真实滞后）；其余为短数组多行↔单行格式错配（A-4）。已 `git checkout -- api-reports` 还原 |
| `pnpm docs:api` + `git diff` | ⚠️ ~21 文件 | 全部 CRLF/prettier 本机噪声（A-5 P3）；component-index 逻辑缺陷为独立问题（A-5 P2）。已 `git checkout -- skills/tigercat/references` 还原 |

> 还原后工作树仅余 `docs/ROADMAP_CHECK.md`（本文件）与 `docs/ROADMAP.md`（状态标记）两处文档改动，未触碰任何源码/脚本/生成产物。

---

## 任务 B — Core 工具、类型、主题、i18n、token 扫描

**扫描范围**：`packages/core/src/types`、`packages/core/src/utils`、`packages/core/src/themes`、`packages/core/src/theme-runtime`、`packages/core/src/tokens`、`packages/core/src/tailwind-entry*.ts`、`packages/core/src/tailwind-plugin.ts`、`packages/core/tokens/*`、`packages/core/package.json`、`packages/core/tsup.config.ts`，以及与 core locale/theme/token 直接相关的 React/Vue DatePicker、ConfigProvider 和 core 测试。

**结论速览**：core 基础门禁健康：`types:check`、`api:validate` 和目标 core 测试均通过；未发现需要在扫描阶段立刻改动公共 API 的 P1。主要问题集中在 **i18n / theme / token 三条公共内容链路的来源不够统一**：DatePicker locale 未纳入全局 ConfigProvider 使用路径、DatePicker 文案存在双源维护、ThemePreset 非 colors 字段公开但运行时未完整应用、token/Tailwind/theme 默认值多处手写。另有两个 P3 清理项：宽兼容 barrel 的公开面需要后续分级审计，示例导出会干扰朴素扫描。

---

### B-1 DatePicker i18n 未接入全局 ConfigProvider locale — **P2**

**发现问题**

- 🟠 P2｜`TigerLocale` 类型已包含 `datePicker?: Partial<DatePickerLocalePreset>`（[packages/core/src/types/locale.ts](../packages/core/src/types/locale.ts)），`DatePickerLocaleInput` 也支持 `{ datePicker: ... }` 形状（[packages/core/src/types/datepicker.ts](../packages/core/src/types/datepicker.ts)），但 React/Vue DatePicker 当前只从自身 `locale` prop 解析：
  - React：`useDatePickerState` 中 `getDatePickerLocaleCode(props.locale)` / `getDatePickerLabels(props.locale, props.labels)`（[packages/react/src/components/DatePicker/state.ts](../packages/react/src/components/DatePicker/state.ts)），未读取 `useTigerConfig()`。
  - Vue：`DatePicker` 中同样只用 `props.locale` / `props.labels`（[packages/vue/src/components/DatePicker.ts](../packages/vue/src/components/DatePicker.ts)），未注入 `useTigerConfig()`。
- 🟠 P2｜全局 locale preset 当前也没有装配 `datePicker`：13 个 `packages/core/src/utils/i18n/locales/*` 文件覆盖 `common/modal/drawer/upload/pagination/table/timePicker/formWizard/taskBoard/formValidation` 等字段，但没有 `datePicker` 字段；`tests/core/i18n-locales.spec.ts` 的 required keys 也未包含 `datePicker`。因此 `<ConfigProvider locale={zhCN}>` 对 DatePicker 的日历按钮文案不生效，仍需组件级 `locale` prop 或字符串 locale。

**公共内容决策**

- **合并到 core locale 使用链路**：DatePicker 的纯 locale 解析仍留在 core helper；React/Vue 组件应在框架层读取 ConfigProvider merged locale，并按“显式 props > ConfigProvider locale > 默认 locale”的现有优先级合并。
- 不在扫描阶段改 public API。后续修复可复用现有 `TigerLocale.datePicker` 字段，无需新增字段。

**建议修复顺序**

1. React/Vue DatePicker 接入 ConfigProvider merged locale；优先级保持 `props.locale` / `props.labels` 最高。
2. 为 `zhCN` / `enUS` 等 locale preset 装配 `datePicker` 字段，或补一个 core helper 将完整 TigerLocale 与 DatePicker locale preset 合流。
3. 补 React/Vue DatePicker + ConfigProvider 回归测试，覆盖全局 `datePicker` 文案和组件级覆盖。

**目标验证命令**：`pnpm vitest run tests/core/datepicker-i18n.spec.ts tests/react/DatePicker.spec.tsx tests/vue/DatePicker.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

### B-2 DatePicker 文案来源重复 — **P2**

**发现问题**

- 🟠 P2｜DatePicker locale 有两套权威来源：
  - [packages/core/src/utils/datepicker-i18n.ts](../packages/core/src/utils/datepicker-i18n.ts) 内置 `EN_US_DATEPICKER_LOCALE`、`ZH_CN_DATEPICKER_LOCALE`，并在 `DATEPICKER_LABELS_BY_LANGUAGE` 里手写 `en/zh/es/fr/de/pt/ar` 7 组 fallback labels。
  - [packages/core/src/utils/i18n/datepicker-locales/](../packages/core/src/utils/i18n/datepicker-locales/) 下维护 13 个可导出的 DatePicker locale preset，并通过 `package.json` 暴露 `./datepicker-locales/*` 子路径。
- 🟠 P2｜这会形成维护盲区：`getDatePickerLabels('ja-JP')`、`ko-KR`、`th-TH`、`vi-VN`、`id-ID`、`zh-TW` 等语言不会从对应 preset 自动读取，只会回落到英文；但直接传入 `@expcat/tigercat-core/datepicker-locales/<id>` preset 又能拿到完整翻译。`tests/core/datepicker-i18n.spec.ts` 只覆盖了内置 map 的新西文/阿拉伯语和显式 preset merge，没有覆盖“字符串 locale 与 13 个 preset 一致”。

**公共内容决策**

- **合并 DatePicker labels 来源**：以 `utils/i18n/datepicker-locales/*` preset 文件作为文案单一来源；`datepicker-i18n.ts` 只保留解析、合并和 fallback helper。
- 不直接删除子路径导出；这些 locale preset 已是公开入口，应保持稳定。

**建议修复顺序**

1. 建立 `locale id -> DatePickerLocalePreset` 的内部 map，来源为现有 preset 文件。
2. 让 `getDatePickerLabels(string)` 从该 map 解析，未知 locale 再回落 en-US。
3. 补 13 个 DatePicker locale 字符串回归测试，避免新增语言只改 preset 不改 helper。

**目标验证命令**：`pnpm vitest run tests/core/datepicker-i18n.spec.ts tests/core/i18n-locales.spec.ts`、`pnpm api:validate`。

---

### B-3 ThemePreset 非 colors 字段公开但运行时未完整应用 — **P2**

**发现问题**

- 🟠 P2｜`ThemeConfig` 公开了 `colors`、`typography`、`radius`、`shadows`、`spacing`、`motion`（[packages/core/src/types/theme.ts](../packages/core/src/types/theme.ts)），内置 themes 也填写了非 colors 字段，例如 `defaultTheme.light.radius/shadows`、`modernTheme.light.radius/shadows/motion`（[packages/core/src/themes/default/theme.ts](../packages/core/src/themes/default/theme.ts)、[packages/core/src/themes/modern/theme.ts](../packages/core/src/themes/modern/theme.ts)）。
- 🟠 P2｜运行时 ThemeManager 只把 `config.colors` 通过 `THEME_CSS_VARS` 写入 DOM；`radius/shadows/typography/spacing/motion` 不会被 `ThemeManager.setTheme()` 应用（[packages/core/src/themes/manager.ts](../packages/core/src/themes/manager.ts)）。
- 🟠 P2｜Tailwind plugin 的 `createTigercatPlugin({ preset })` 同样只映射 `preset.light.colors` / `preset.dark.colors`；radius/shadows/motion 等由 `MODERN_BASE_TOKENS_*` 与 `MODERN_OVERRIDE_TOKENS_*` 另一路注入（[packages/core/src/tailwind-plugin.ts](../packages/core/src/tailwind-plugin.ts)）。这会让使用者以为 `ThemePreset.radius` 能随 `ThemeManager.setTheme('modern')` 生效，但实际只有颜色跟随 preset。

**公共内容决策**

- **合并 theme preset 应用语义**：要么补齐非 colors 字段到 CSS var 的映射并由 ThemeManager/plugin 共同消费，要么收窄文档/类型说明，明确非 colors 字段当前只作 preset metadata / modern token layer 参考。
- 公共 API 默认保持兼容；若要收窄类型或改变应用时机，需要单独 migration。

**建议修复顺序**

1. 优先新增内部 `ThemeConfig -> CSS vars` helper，覆盖 colors/radius/shadows/typography/spacing/motion。
2. ThemeManager 与 `createTigercatPlugin({ preset })` 复用同一映射，避免运行时与构建时不一致。
3. 补 `ThemeManager.setTheme()` 对 radius/shadow/motion 的 DOM 变量测试，以及 plugin preset 输出测试。

**目标验证命令**：`pnpm vitest run tests/core/themes-manager.spec.ts tests/core/modern-theme.spec.ts tests/core/modern-theme-interaction.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

### B-4 tokens、Tailwind plugin、theme preset 默认值多源维护 — **P2**

**发现问题**

- 🟠 P2｜token 单一来源在文档中定义为 `packages/core/tokens/tokens.json`，并由 [packages/core/scripts/generate-tokens.mjs](../packages/core/scripts/generate-tokens.mjs) 生成 `tokens.css`、`src/tokens/tokens.ts`、`tailwind-tokens.js`、`figma-variables.json`。
- 🟠 P2｜但 Tailwind plugin 仍手写 `tigercatTheme` / `tigercatDarkTheme` legacy CSS vars（[packages/core/src/tailwind-plugin.ts](../packages/core/src/tailwind-plugin.ts)），内置 theme preset 文件也分别手写同类颜色、radius、shadow、motion 值（[packages/core/src/themes](../packages/core/src/themes)）。这些值与 tokens 生成链路没有自动校验。
- 🟠 P2｜`generate-tokens.mjs` 同时生成 canonical `--tiger-primitive-*` / `--tiger-semantic-*` / `--tiger-component-*` 和 compatibility `--tiger-*` 变量；但 plugin 注入的 `--tiger-*` 默认值并非从 `tokens.ts` 或 `tokens.json` 读取。后续 token 调整可能出现 CSS token、Tailwind plugin 默认变量、ThemePreset 三者漂移。

**公共内容决策**

- **合并 token/theme 默认值来源或加同步校验**：优先让 Tailwind plugin / themes 通过共享 token mapping helper 派生默认变量；若短期不改结构，至少新增测试校验关键 `--tiger-*` 变量和 theme preset 与 tokens 的一致性。
- 不在扫描阶段运行 `pnpm tokens:build`，避免重写生成产物。

**建议修复顺序**

1. 先补低风险校验：读取 `tokens.json` / generated `tokens.ts`，校验 plugin 默认 vars 与 default theme 的关键语义值。
2. 再考虑把 `tigercatTheme` / `tigercatDarkTheme` 从共享 helper 派生。
3. 修改 token 源后统一运行 `pnpm tokens:build` 并审阅生成产物 diff。

**目标验证命令**：`pnpm vitest run tests/core/design-tokens.spec.ts tests/core/modern-theme.spec.ts tests/core/reduced-motion.spec.ts`；涉及 token 源变更时追加 `pnpm tokens:build`、`git diff -- packages/core/src/tokens packages/core/tokens`。

---

### B-5 core utils 兼容 barrel 公开面过宽 — **P3**

**发现问题**

- 🟢 P3｜[packages/core/src/utils/index.ts](../packages/core/src/utils/index.ts) 为兼容性从 `helpers/icons/a11y/i18n/styles/motion` 到大量组件级 `*-utils` 做平铺再导出。粗扫 `packages/core/src/{types,utils,themes,theme-runtime,tokens}` 的显式导出并在仓库源码/测试/示例/文档中计数，有 146 个文件组包含仓库内零外部引用的导出符号。
- 🟢 P3｜该结果不能直接等同死代码：其中大量是公开 API、类型别名、样式常量或外部消费者可能使用的 helper；但它说明当前 flat barrel 已难以区分“公开承诺 API”“框架内部共享 helper”“组件局部实现细节”。

**公共内容决策**

- **延后到任务 H 或后续 API 清理**：先分类，不直接删除。跨框架共享且稳定的纯逻辑保留 core；只服务单组件且无外部价值的 helper 后续可逐步回收到组件局部；已公开符号删除前必须走 deprecated/migration。

**建议修复顺序**

1. 生成公开 helper 分类表：外部文档/API 示例使用、React/Vue 内部使用、测试/benchmark 使用、零仓库使用。
2. 对零仓库使用但已公开的 helper 标注保留/废弃/回收建议。
3. 真正删除前补 API baseline、migration、changeset，并按 semver 处理。

**目标验证命令**：`pnpm api:validate`、`pnpm api:baseline:check`、`pnpm types:check`。

---

### B-6 `types/base.ts` 示例导出干扰朴素扫描 — **P3**

**发现问题**

- 🟢 P3｜[packages/core/src/types/base.ts](../packages/core/src/types/base.ts) 的 JSDoc 示例中包含 `export interface MyButtonProps extends BaseInteractiveProps { ... }`。因为示例位于源码注释内，当前 TypeScript 编译没有问题；但朴素的文本扫描或自制导出提取脚本若没有先剥离注释，可能误把 `MyButtonProps` 当成真实公开导出。
- 🟢 P3｜本轮只读导出粗筛就曾捕获到 `MyButtonProps`，说明它会污染简单审计工具的候选结果。现有 `api:validate` / `types:check` 未因此失败。

**公共内容决策**

- **局部文档清理**：不涉及运行时代码和公共 API。后续可把示例中的 `export interface` 改为 `interface`，或改名为更明显的伪代码示例，降低脚本误报概率。

**建议修复顺序**：低优先，随下一次 core 类型文档清理一起改。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`。

---

### 任务 B 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| DatePicker 与 ConfigProvider locale | **合并→统一 locale 使用链路** | React/Vue DatePicker 应消费 ConfigProvider merged locale；显式 prop 仍最高优先级。 |
| DatePicker labels 来源 | **合并→datepicker locale preset 为权威来源** | `datepicker-i18n.ts` 只做解析/合并；避免字符串 locale 与 preset 子路径漂移。 |
| ThemeConfig 非 colors 字段 | **合并应用语义或明确收窄** | 当前公开类型和运行时行为不完全一致；优先抽 `ThemeConfig -> CSS vars` helper。 |
| token / Tailwind plugin / themes 默认值 | **合并或加同步校验** | `tokens.json`、plugin 手写 vars、theme preset 手写值需共享来源或测试护栏。 |
| core utils flat barrel | **延后分类** | 不直接删；先区分公开 API、框架共享 helper、组件局部 helper。 |
| `MyButtonProps` 示例导出 | **局部清理** | 文档示例改写即可，无公共 API 影响。 |

---

### 本轮验证命令实跑输出摘要（证据）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `git status --short` | ✅ 扫描前干净 | 完成后仅留下本次 Roadmap 文档更新；未留下源码/生成产物改动 |
| `pnpm types:check` | ⚠️ 环境拦截 | 本机默认 `pnpm 11.7.0` 低于仓库 `engines.pnpm >=11.9.0` |
| `corepack pnpm -v` | ✅ 11.9.0 | 使用 `packageManager: pnpm@11.9.0` 对齐仓库配置 |
| `corepack pnpm types:check` | ✅ 通过 | `All public component props types are exported.` |
| `corepack pnpm api:validate` | ✅ 通过 | API 一致性检查 0 问题 |
| `corepack pnpm vitest run tests/core/design-tokens.spec.ts tests/core/datepicker-i18n.spec.ts tests/core/i18n-locales.spec.ts tests/core/custom-text-labels.spec.ts tests/core/kanban-utils.spec.ts` | ✅ 通过 | 5 个测试文件、62 个测试通过 |
| `rg -n "datePicker" packages/core/src/utils/i18n/locales packages/core/src/utils/i18n/datepicker-locales tests/core/i18n-locales.spec.ts tests/core/define-locale.spec.ts` | ⚠️ 0 命中 | 证明完整 TigerLocale preset 与 i18n locale 测试未覆盖 `datePicker` 字段 |

> 本轮任务 B 只记录扫描结论和修复建议；未改组件源码、未改公共 API、未运行 `pnpm tokens:build` 或其他会重写生成产物的命令。

---

## 任务 C — 组件分组扫描

> 任务 C 按组件分组逐组扫描，每组结果独立成 `### Cxx` 子段并给出 `发现问题 / 公共内容决策 / 建议修复顺序 / 目标验证命令`。下为首组 C01 结果，后续组（C02…）追加到本段。

### C01 基础动作与文本

**扫描范围**：8 个轻量组件 Button、ButtonGroup、Link、Text、Code、Icon、Tag、Badge 的全链路——core 类型 `packages/core/src/types/{button,link,tag,badge,icon,text,code}.ts`、core 工具 `packages/core/src/utils/{button,badge,tag,text,link,icon,group}-utils.ts` 与 `class-names.ts`/`compose-classes.ts`/`coerce-class-value.ts`/`svg-attrs.ts`/`dev-warn.ts`/`common-icons.ts`、`packages/core/src/theme-runtime/colors.ts`、`packages/{react,vue}/src/components` 的双端实现、`tests/{react,vue}` 对应 spec、`skills/tigercat/references/component-index.md`。

**结论速览**：C01 基础面健康——业务逻辑已下沉 core `*-utils` / `theme-runtime`，双端值与行为对称，测试覆盖 role 与 label。**无 P1**。1 条 **P2**（默认标签本地化策略三套不一致、Badge 标签不可覆盖），其余为 **P3** 清理与命名/可访问性观察。注意：Vue 实现行数比 React 多约 65%（Vue 978 / React 594），但差异几乎全是 `defineComponent` 的 props 声明 + JSDoc 样板，**非重复业务逻辑**（不计入发现）。

---

#### C01-1 类组合助手采用不一致（该合未合）— **P3**

**发现问题**

- 🟢 P3｜`composeComponentClasses`（[compose-classes.ts](../packages/core/src/utils/compose-classes.ts)）的文档明确写着它就是为「remove the repeated `classNames(..., props.className, coerceClassValue(attrs.class))` boilerplate present in every Vue/React component」而建，并给了 Vue+React 两个用例。但 C01 中**只有 Vue Button** 用了它（[Button.ts:126](../packages/vue/src/components/Button.ts)）。其余 Vue 组件各自手写、且写法不一：Tag `classNames(tagClasses, coerceClassValue(attrsClass))`（[Tag.ts:147](../packages/vue/src/components/Tag.ts)）、Badge `classNames(badgeClasses, props.className, coerceClassValue(attrs.class))`（[Badge.ts:106](../packages/vue/src/components/Badge.ts)）、Icon `classNames(iconWrapperClasses, coerceClassValue(attrs.class))`（[Icon.ts:57](../packages/vue/src/components/Icon.ts)）、Link 用数组形式 `[linkClasses, attrs.class]`（[Link.ts:91](../packages/vue/src/components/Link.ts)）。为该助手而生的样板仍散落各处。

**公共内容决策**：助手已在 core，**统一采用**（Vue 全组件改用 `composeComponentClasses`；React 同组件亦可换用以对齐）。纯重构，无公共 API 变更、无双端行为差异。

**建议修复顺序**：P3，可与 C01-3 同批。

**目标验证命令**：`pnpm types:check`、`pnpm vitest run tests/react/{Tag,Badge,Icon,Link}.spec.tsx tests/vue/{Tag,Badge,Icon,Link}.spec.ts`。

---

#### C01-2 内联 SVG 图标渲染重复 + 常量未复用 + 内置图标 strokeWidth 魔数（图标渲染）— **P3**

**发现问题**

- 🟢 P3｜**常量未复用**：`SVG_DEFAULT_XMLNS` / `SVG_DEFAULT_FILL` 已在 [svg-attrs.ts:12](../packages/core/src/utils/svg-attrs.ts) 定义并被 Icon 使用，但 Button 的加载 spinner（[React Button.tsx:23](../packages/react/src/components/Button.tsx) / [Vue Button.ts:35](../packages/vue/src/components/Button.ts)）与 Tag 的 `CloseIcon`（[React Tag.tsx:31](../packages/react/src/components/Tag.tsx) / [Vue Tag.ts:30](../packages/vue/src/components/Tag.ts)）仍硬编码 `'http://www.w3.org/2000/svg'` 与 `fill="none"`。
- 🟢 P3｜**内置图标 strokeWidth 魔数**：Icon 渲染**内置**图标时硬编码 `stroke-width: 1.5`（[React Icon.tsx:48](../packages/react/src/components/Icon.tsx) / [Vue Icon.ts:80](../packages/vue/src/components/Icon.ts)），而渲染**自定义子 SVG** 时用常量 `iconSvgDefaultStrokeWidth`（=`2`，[icon-utils.ts:14](../packages/core/src/utils/icon-utils.ts)）。结果：内置图标 1.5 与自定义图标 2 描边粗细不一致，且 `1.5` 在 React+Vue 两处重复、无命名常量、易漂移。

**公共内容决策**：渲染（JSX vs `h()`）属框架细节，**保留框架层**；**数据/常量沉 core**——(a) Button/Tag 内联 SVG 复用 `SVG_DEFAULT_XMLNS` / `SVG_DEFAULT_FILL`；(b) 为内置图标描边新增命名常量（如 `iconBuiltInStrokeWidth = 1.5`）替代两处魔数，或确认应统一为 `iconSvgDefaultStrokeWidth` 后对齐。

**建议修复顺序**：P3。先确认 strokeWidth 是「刻意 1.5」还是「应为 2」（需视觉确认）再落常量。

**目标验证命令**：`pnpm vitest run tests/react/{Icon,Button,Tag}.spec.tsx tests/vue/{Icon,Button,Tag}.spec.ts`；涉及视觉默认值，必要时 `pnpm example:build` 目检。

---

#### C01-3 Tag 关闭按钮类未抽到 core（该提取未提取）— **P3**

**发现问题**

- 🟢 P3｜Tag 关闭按钮的类在 React+Vue **逐字重复**：`const scheme = defaultTagThemeColors[variant]; classNames(tagCloseButtonBaseClasses, scheme.closeBgHover, scheme.text)`（[React Tag.tsx:68](../packages/react/src/components/Tag.tsx) / [Vue Tag.ts:119](../packages/vue/src/components/Tag.ts)），两端都直接 reach-in `defaultTagThemeColors`。对照：Code 的「复制按钮类」已有 core 助手 `getCodeBlockCopyButtonClasses(isCopied)` 被双端共享，Tag 缺同类助手——属同组内不一致。
- ℹ️ `defaultTagThemeColors` 已覆盖全部 6 个 `TagVariant`（[colors.ts:421](../packages/core/src/theme-runtime/colors.ts)）且为 typed `Record`，**无崩溃风险**；纯属重复样板。

**公共内容决策**：**抽 `getTagCloseButtonClasses(variant)` 到 core**（与 `getTagVariantClasses` / `getCodeBlockCopyButtonClasses` 同址同风格），双端调用。

**建议修复顺序**：P3，与 C01-1 同批。

**目标验证命令**：`pnpm types:check`、`pnpm vitest run tests/react/Tag.spec.tsx tests/vue/Tag.spec.ts`。

---

#### C01-4 默认标签本地化策略三套不一致 + Badge 标签不可覆盖（i18n / a11y）— **P2**

**发现问题**

- 🟠 P2｜同组三种做法、默认语言混用（均有测试锁定）：
  - **Code**：`copyLabel` / `copiedLabel` 专属 props，默认**中文** `复制` / `已复制`（[code.ts](../packages/core/src/types/code.ts)；测试 `tests/react/Code.spec.tsx:61`）。
  - **Tag**：`closeAriaLabel` 专属 prop，默认**英文** `Close tag`（[tag.ts:41](../packages/core/src/types/tag.ts)；测试 `tests/react/Tag.spec.tsx:53`）。
  - **Badge**：**无任何 label prop**，aria-label 默认**英文** `notification` / `N notifications` **硬编码在组件内**（[React Badge.tsx:49](../packages/react/src/components/Badge.tsx) / [Vue Badge.ts:94](../packages/vue/src/components/Badge.ts)），仅能靠透传原生 `aria-label` 覆盖，**无法本地化**。
- ℹ️ 对照：仓库已有 locale 体系（13 语言）与 Drawer 的 `labels={{ closeAriaLabel }}` 模式（`tests/react/custom-text.spec.tsx:40`），但 C01 这几个轻量组件都绕开了它。

**公共内容决策**：跨框架默认文案应**统一策略并沉 core**（接入 locale，或统一 `labels` / 单字段 props），至少（a）给 Badge 增加可覆盖的 label；（b）统一默认语言。**属公共 API 变更**——按任务 H 策略：不直接改默认值破坏行为，应先加可覆盖入口、必要时 deprecate 旧默认、补 migration/changeset、过 `api:baseline:check`；改默认文案需同步更新被锁定的测试。

**建议修复顺序**：P2，独立成项（C01 内最大的双端一致性项）。先定方案（locale vs labels-prop）再落地。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm vitest run tests/react/{Code,Tag,Badge}.spec.tsx tests/vue/{Code,Tag,Badge}.spec.ts`、`pnpm api:baseline:check`、`pnpm docs:api:check`。

---

#### C01-5 尺寸 / variant / color 命名分歧（命名观察）— **P3 / 观察**

**发现问题**

- 🟢 P3｜**尺寸尺度不统一**：Button `xs|sm|md|lg|xl`、Icon `sm|md|lg|xl`（无 xs）、Link/Tag/Badge `sm|md|lg`、Text `xs|sm|base|lg|xl…6xl`（中号叫 `base` 而非 `md`，跟随 Tailwind 字号命名）。
- 🟢 P3｜**variant 两套哲学**：Button/Link 是**样式** variant（`primary|secondary|outline|ghost|link` / `primary|secondary|default`），Tag/Badge 是**语义/状态** variant（`default|primary|success|warning|danger|info`）。同一个值 `variant="primary"` 在 Button 表示「主填充样式」、在 Tag 表示「蓝色语义」——跨组件含义不同，易混淆。
- 🟢 P3｜**`danger` 重载**：Button 上 `danger` 是布尔修饰（叠加在任意 variant 上，[button.ts:82](../packages/core/src/types/button.ts)），Tag/Badge 上 `danger` 是 variant 取值。
- 🟢 P3｜**color 三种模型**：Text 是枚举 `color`（[text.ts:49](../packages/core/src/types/text.ts)）、Icon 是自由 CSS 字符串 `color`、Button/Tag 不支持 color 且 `warnUnsupportedColorProp` 告警（[dev-warn.ts:40](../packages/core/src/utils/dev-warn.ts)，文档注明仅限 Button/Tag）。

**公共内容决策**：上述多为**刻意的领域差异**，倾向**保持现状 + 文档说明**（在 skill/docs 一次性说明「样式 variant vs 语义 variant」「Button.danger 是修饰符」「三种 color 模型」），避免消费者误用。若产品确需，可后续给 Tag/Badge 补 `xs`/`xl`——**延后**，非本轮动作。

**建议修复顺序**：P3 文档项 / 多数观察延后。

**目标验证命令**：`pnpm docs:api:check`（若补文档）。

---

#### C01-6 Tag 与 Badge 的 variant 联合类型逐字重复（该合）— **P3**

**发现问题**

- 🟢 P3｜`TagVariant`（[tag.ts:8](../packages/core/src/types/tag.ts)）与 `BadgeVariant`（[badge.ts:6](../packages/core/src/types/badge.ts)）成员**完全相同**：`'default'|'primary'|'success'|'warning'|'danger'|'info'`。

**公共内容决策**：可在 core 抽**共享语义类型**（如 `StatusVariant`）并令二者 `= StatusVariant` 别名——成员不变、**结构等价、非破坏**。仅限「键联合」共享；二者的 theme 色板（`TagThemeColors` 含 border+closeBgHover，`BadgeThemeColors` 仅 bg+text）合理不同，不合并。

**建议修复顺序**：P3，可延后（收益主要是单一真相源）。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C01-7 Vue Link 吞掉用户 `@keydown`（双端 parity，latent）— **P3**

**发现问题**

- 🟢 P3｜React Link 把 `onKeyDown` 解构后在禁用判断后**转发** `onKeyDown?.(event)`（[Link.tsx:65](../packages/react/src/components/Link.tsx)）。Vue Link 的 `keydown` 不在 `emits`，渲染时 `...attrs`（含用户 `onKeydown`）之后又显式 `onKeydown: handleKeydown` **覆盖**，且 `handleKeydown` 只做禁用拦截、不转发（[Link.ts:79](../packages/vue/src/components/Link.ts) / [:98](../packages/vue/src/components/Link.ts)）——用户 `@keydown` 监听被丢弃（而 `@click` 因走 `emit` 正常）。

**公共内容决策**：属框架层 bug，**在 Vue 层修**（把 keydown 纳入 emits / 合并监听器，使禁用拦截后仍转发），对齐 React。

**建议修复顺序**：P3（影响低、当前无测试覆盖、键盘按键在链接上少见，但确为双端不一致）。

**目标验证命令**：`pnpm vitest run tests/react/Link.spec.tsx tests/vue/Link.spec.ts`（建议补 keydown 转发用例）。

---

#### C01-8 其余低优先观察 — **P3**

**发现问题**

- 🟢 P3｜**Tag `role="status"`**：每个 Tag 都带 `role="status"`（隐式 `aria-live=polite`，[Tag.tsx:87](../packages/react/src/components/Tag.tsx)；双端测试已锁 `tests/react/Tag.spec.tsx:18`）。静态标签作为 live region 在大量 filter chip 场景可能造成读屏噪声——**值得复核语义**，但属刻意且被测试锁定，改动即行为变更，**列为待议**而非建议直改。Badge `role="status"`（计数通知）相对可辩护。
- 🟢 P3｜**Vue Text 冗余默认**：Vue Text 在 props 声明 `size:'base'`/`weight:'normal'`/`color:'default'`，与 `getTextClasses` 内部默认（[text-utils.ts:17](../packages/core/src/utils/text-utils.ts)）重复（双真相源）；React Text 不声明、全靠 core 默认。当前结果一致，仅维护性微瑕。
- 🟢 P3｜**Button spinner 固定尺寸**：spinner 恒为 `h-4 w-4`，不随按钮 `size` 缩放；多数场景可接受，记录备查。

**公共内容决策**：均为低优先观察；Tag `role` 待议（不动），Vue Text 冗余默认与 Button spinner 尺寸可随相关组件下次改动顺手处理。

**建议修复顺序**：P3，无独立行动项。

**目标验证命令**：`pnpm vitest run tests/react/{Tag,Text,Button}.spec.tsx tests/vue/{Tag,Text,Button}.spec.ts`。

---

#### C01 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| `composeComponentClasses` 统一采用（C01-1） | **合并→统一用已有 core 助手** | P3 |
| Tag 关闭按钮类抽 `getTagCloseButtonClasses`（C01-3） | **提取→core 助手** | P3 |
| SVG 常量复用 + 内置图标 strokeWidth 命名常量（C01-2） | **常量沉 core，渲染留框架层** | P3 |
| 默认标签本地化统一 + Badge 可覆盖（C01-4） | **统一策略，接入 locale/labels（公共 API，走 H 流程）** | **P2** |
| Tag/Badge variant 抽 `StatusVariant` 别名（C01-6） | **合并→共享类型别名（非破坏）** | P3 |
| Vue Link keydown 转发（C01-7） | **框架层修复，对齐 React** | P3 |
| 尺寸/variant/color 命名分歧（C01-5） | **保持现状 + 文档说明** | P3/观察 |
| Tag `role="status"` 语义（C01-8） | **待议（测试已锁，暂不改）** | P3 |

---

#### C01 取证摘要（静态实读，未跑门禁命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| Grep `composeComponentClasses` 在 C01 组件的调用 | 仅 Vue Button 1 处；Tag/Badge/Icon/Link 手写 `classNames+coerceClassValue` | C01-1 |
| 比对 `iconSvgDefaultStrokeWidth` 与内置图标分支 | 常量=2，内置图标分支双端硬编码 1.5 | C01-2 |
| 比对 Tag 关闭按钮类 vs Code 复制按钮类 | Code 有 `getCodeBlockCopyButtonClasses` 助手，Tag 双端 reach-in `defaultTagThemeColors` | C01-3 |
| Grep 默认 label / aria-label 取值与测试断言 | Code 默认 `复制`/`已复制`、Tag `Close tag`、Badge 硬编码 `notification(s)`；均被双端 spec 断言 | C01-4 |
| 比对各组件 `*Size` / `*Variant` 类型联合 | 尺寸/variant 尺度与命名分歧；`TagVariant`≡`BadgeVariant` | C01-5 / C01-6 |
| Grep `role="status"` 断言 | Tag、Badge 双端 spec 均锁定 `role="status"` | C01-8 |
| `defaultTagThemeColors` 变体覆盖 | 完整覆盖 6 个 `TagVariant`（typed Record，无崩溃风险） | C01-3 |

> 本轮 C01 只记录扫描结论和修复建议；未改任何组件源码、core 工具、脚本或生成产物（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「仅更新 Roadmap 文档不要求跑完整门禁」，C01 阶段未执行 `pnpm` 门禁命令；表中「目标验证命令」供未来逐条修复时使用。

---

### C02 头像与状态展示

**扫描范围**：Avatar、AvatarGroup、Empty、Result、Statistic、QRCode、Watermark 七个组件的 React/Vue 实现、core 类型/工具模块、测试文件、示例页面。

**结论速览**：core 工具层已高度下沉，Canvas/SVG 逻辑均已提取到 `core/utils/`，双端实现对称度良好。但发现 **2 条功能 Bug**（P1）、**2 条 token/代码质量问题**（P2）、**1 条 i18n 缺口**（P2）。

---

#### C02-1 Vue AvatarGroup `size` prop 不响应式 — **P1 Bug**

**文件**：[packages/vue/src/components/AvatarGroup.ts:44](../packages/vue/src/components/AvatarGroup.ts)

```ts
provide<AvatarGroupContext>(AVATAR_GROUP_INJECTION_KEY, {
  size: props.size,   // ← setup 执行一次后不再更新
  itemClass: getAvatarGroupItemClasses()
})
```

`provide` 注入的是静态对象快照，`props.size` 变化后子 Avatar 读到的 inject 值不更新，导致动态切换 AvatarGroup `size` 时子头像尺寸不跟随变化。

对比 React 版（[packages/react/src/components/AvatarGroup.tsx:31](../packages/react/src/components/AvatarGroup.tsx)）使用 `useMemo` 在每次渲染时重新生成 contextValue，行为正确。

**公共内容决策**：属 Vue 框架层问题，无需沉到 core；修复保留在 Vue 组件内。

**建议修复**：改为 provide 一个 `reactive` 对象，并在 setup 内用 `watch` 同步 `props.size`：

```ts
const groupContext = reactive<AvatarGroupContext>({
  size: props.size,
  itemClass: getAvatarGroupItemClasses()
})
watch(() => props.size, (s) => { groupContext.size = s })
provide(AVATAR_GROUP_INJECTION_KEY, groupContext)
```

**目标验证命令**：`pnpm vitest run tests/vue/Avatar.spec.ts`、`pnpm types:check`。

---

#### C02-2 React QRCode 缺少 locale 支持，与 Vue 不对称 — **P1 不对称**

**文件**：
- [packages/react/src/components/QRCode.tsx:75](../packages/react/src/components/QRCode.tsx)（`"Loading..."` 硬编码）
- [packages/vue/src/components/QRCode.ts:44-46](../packages/vue/src/components/QRCode.ts)（已接入 `useTigerConfig` + `mergeTigerLocale` + `resolveLocaleText`）

Vue QRCode 接受 `locale` prop 并通过 `resolveLocaleText` 走 locale 系统（仅 loading 文本），React QRCode 完全无 locale prop，loading 文本写死为英文。`"QR code expired"` 和 `"Refresh"` 两端均硬编码，未走 locale（属共同缺口，见 C02-3）。

**公共内容决策**：locale key 合入 core `TigerLocale` 类型（`qrcode` 命名空间）；`resolveLocaleText` 已在 core 中，无需新增 helper。

**建议修复**：
1. 在 `packages/core/src/types/locale.ts`（或 locale-utils.ts）补 `qrcode: { expiredText, refreshText, loadingText }` key。
2. React QRCode 加 `locale?: Partial<TigerLocale>` prop，接入 `useConfigProvider`，用 `resolveLocaleText` 渲染三段文本。
3. Vue QRCode 同步补 `expiredText` / `refreshText` 两段文本的 locale 覆盖（当前只做了 loadingText）。

**目标验证命令**：`pnpm vitest run tests/react/QRCode.spec.tsx tests/vue/QRCode.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C02-3 QRCode loading/expired 状态文本使用裸 Tailwind 类而非 CSS token — **P2**

**文件**：[packages/react/src/components/QRCode.tsx:75](../packages/react/src/components/QRCode.tsx)、[packages/vue/src/components/QRCode.ts:114](../packages/vue/src/components/QRCode.ts)

两端 loading overlay 均写了 `'text-sm text-gray-500'`，与组件其他地方（如 `qrcodeExpiredTextClasses`）使用 `var(--tiger-text-muted)` token 的风格不一致，切换主题时颜色不随 token 变化。

**公共内容决策**：补常量到 `packages/core/src/utils/qrcode-utils.ts`，两端直接引用。

**建议修复**：在 `qrcode-utils.ts` 补：

```ts
export const qrcodeLoadingTextClasses =
  'text-sm text-[var(--tiger-qrcode-loading-text,var(--tiger-text-muted,#6b7280))]'
```

React/Vue 两端将 `'text-sm text-gray-500'` 替换为该常量。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`。

---

#### C02-4 `getResultHttpLabel` 函数无实质作用 — **P2 冗余**

**文件**：[packages/core/src/utils/result-utils.ts:124](../packages/core/src/utils/result-utils.ts)

```ts
const httpStatusLabels: Record<string, string> = {
  '404': '404',
  '403': '403',
  '500': '500'
}
export function getResultHttpLabel(status: ResultStatus): string | undefined {
  return httpStatusLabels[status]
}
```

`httpStatusLabels` 的值与 key 完全相同，函数实际只起「判断是否 HTTP 状态码并透传原字符串」的作用，查表意义为零。

**公共内容决策**：删除查找表，改为语义更清晰的类型守卫导出；保留在 core。

**建议修复**：

```ts
const HTTP_RESULT_STATUSES = new Set<ResultStatus>(['404', '403', '500'])

export function isHttpResultStatus(status: ResultStatus): boolean {
  return HTTP_RESULT_STATUSES.has(status)
}
```

调用方改为 `isHttpResultStatus(status) ? status : undefined`，删除 `getResultHttpLabel`。此为**公共 API 变更**，需走 deprecated → migration → changeset 流程，并刷新 `api:baseline`。

**目标验证命令**：`pnpm api:validate`、`pnpm api:baseline:check`、`pnpm vitest run tests/core/result-utils.spec.ts`。

---

#### C02-5 Empty 描述文本仅硬编码英文，未接入 locale — **P2 i18n 缺口**

**文件**：[packages/core/src/utils/empty-utils.ts:28](../packages/core/src/utils/empty-utils.ts)

```ts
const presetDescriptions: Record<EmptyPreset, string> = {
  default: 'No data',
  simple: 'No data',
  'no-data': 'No data available',
  'no-results': 'No results found',
  error: 'Something went wrong'
}
```

`getEmptyDescription(preset)` 固定返回英文，React/Vue Empty 组件直接消费，无 locale 覆盖机制。与已支持 locale 的 QRCode、Table 等组件形成一致性缺口。

**公共内容决策**：locale key 合入 core `TigerLocale` 类型（`empty` 命名空间）；`getEmptyDescription` 函数接受可选 locale 参数，或各端组件读取 ConfigProvider locale 后直接取值；核心 helper 保留在 core。

**建议修复**：在 locale 类型中补 `empty: { noData, noDataAvailable, noResults, error }`，两端 Empty 组件读取 ConfigProvider locale 后通过 `resolveLocaleText` 渲染描述文本，`getEmptyDescription` 降级为 fallback。

**目标验证命令**：`pnpm vitest run tests/core/empty-utils.spec.ts tests/react/Empty.spec.tsx tests/vue/Empty.spec.ts`、`pnpm api:validate`。

---

#### C02 整体公共拆合决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
|---|---|---|
| Canvas/SVG/QR 矩阵逻辑（watermark-utils、qrcode-utils） | **已在 core，保持** | 两端共用，无运行时框架依赖，已正确下沉 |
| `qrcodeLoadingTextClasses` 常量（C02-3） | **合入 core/utils/qrcode-utils.ts** | 统一 token 引用，删两端裸 Tailwind 字符串 |
| QRCode locale key（C02-2） | **合入 core TigerLocale 类型** | 补 `qrcode.expiredText / refreshText / loadingText` |
| Empty locale key（C02-5） | **合入 core TigerLocale 类型** | 补 `empty.*` 命名空间 |
| `isHttpResultStatus` 替换 `getResultHttpLabel`（C02-4） | **保留 core，走 deprecated 流程** | 公共 API 变更，需 changeset |
| Vue AvatarGroup reactive provide（C02-1） | **保留 Vue 组件层** | 纯框架生命周期问题，不涉及 core |
| `easeOutCubic` / `interpolateStatisticValue`（statistic-utils） | **已在 core，保持** | 动画纯逻辑，无框架依赖，已正确位置 |
| 水印 MutationObserver 逻辑（React/Vue Watermark） | **保留各框架层** | 依赖 DOM ref 生命周期，不可沉 core |

---

#### 本轮验证说明（C02）

扫描为纯静态阅读，未运行任何命令、未改动任何源码。C02 修复实施后应运行：

```bash
pnpm types:check
pnpm api:validate
pnpm vitest run tests/react/Avatar.spec.tsx tests/vue/Avatar.spec.ts
pnpm vitest run tests/react/QRCode.spec.tsx tests/vue/QRCode.spec.ts
pnpm vitest run tests/core/result-utils.spec.ts tests/core/empty-utils.spec.ts
# C02-4 涉及公共 API 变更时追加：
pnpm api:baseline:check
```

---

### C03 布局骨架

**扫描范围**：Layout、Header、Sidebar、Content、Footer、Container、Row、Col、Space、Divider 十个组件的 core 类型/工具模块、React/Vue 实现、测试文件、示例页面与 generated references。Divider 虽在 component-index 归 Basic，但 ROADMAP C03 明确列入，本次按 ROADMAP 口径纳入布局骨架扫描。

**结论速览**：未发现 Layout/Grid/Space/Divider 的 P1 运行时 Bug。布局 class/style 计算整体已沉到 core，React/Vue 实现多为薄包装，语义标签、attrs/native props 透传、Grid CSS 变量路径和 Space/Divider 行为基本对称。本轮发现 **1 条 generated reference 文档问题**（P2）和 **1 条 legacy public utility 清理项**（P3）。

---

#### C03-1 Space props reference 表格被联合类型说明中的 `|` 打坏 — **P2 文档生成**

**文件**：[skills/tigercat/references/shared/props/layout.md:154](../skills/tigercat/references/shared/props/layout.md)、[scripts/generate-api-docs.mjs:570](../scripts/generate-api-docs.mjs)

`Space` 的 generated props 表格当前被 `SpaceSize` 注释里的联合类型说明打成 6 列：

```md
| Prop         | Type             | Default        | Notes                                                  |
| ------------ | ---------------- | -------------- | ------------------------------------------------------ | ------- | --------------------------- |
| `size?`      | `SpaceSize`      | `'md'`         | Space size between items Can be a preset size ('sm' \ | 'md' \ | 'lg') or a custom number... |
```

源码注释来自 [packages/core/src/types/space.ts:32](../packages/core/src/types/space.ts)：`Can be a preset size ('sm' | 'md' | 'lg') or a custom number (in pixels)`。生成器虽然在 `tableText()` 中对 `|` 做了转义，但经过 markdown formatter 后仍输出为会被表格解析的分隔符，导致 `Space` 段落在 rendered reference 中列数错乱。

**公共内容决策**：修复应落在 `scripts/generate-api-docs.mjs` 的 markdown table cell 转义/格式化链路；`skills/tigercat/references/*` 是生成结果，不手改 generated reference。

**建议修复顺序**：

1. 在 `generate-api-docs.mjs` 的 table cell 生成阶段统一处理 description 中的 pipe，确保 prettier markdown 格式化后仍保持单元格内文本。
2. 重跑 `pnpm docs:api`，确认 `Space` props 表格恢复 4 列，并提交 generated references。

**目标验证命令**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`。

---

#### C03-2 `getGutterStyles` 已是旧 inline gutter helper — **P3 legacy 清理候选**

**文件**：[packages/core/src/utils/grid.ts:208](../packages/core/src/utils/grid.ts)

`getGutterStyles(gutter)` 仍返回旧式 `rowStyle` / `colStyle` inline margin/padding 对象；当前 React/Vue Grid 实现已经使用 CSS 变量路径：

- React/Vue Row 使用 `getRowGutterStyleVars`。
- React/Vue Col 使用 `getColMergedStyleVars` 与 `getColGutterClasses`。
- `rg` 结果显示 `getGutterStyles` 只在 `tests/core/grid.spec.ts` 中被覆盖，框架实现、示例和 generated references 均不消费该旧 helper。

同时，Grid/Space/Divider/Layout/Container 工具通过 [packages/core/src/utils/styles/index.ts:55](../packages/core/src/utils/styles/index.ts) 的 layout style utility 汇总进入 core flat utilities，属于公开 utility 面；不能把 `getGutterStyles` 当内部死代码直接删除。

**公共内容决策**：先作为兼容 legacy helper 保留。若后续要删除或替换，应按公共 API 变更处理：标记 deprecated、补 migration/changeset、刷新 baseline；若不删，可在注释中标明 legacy inline gutter path，推荐新实现继续使用 CSS 变量 helper。

**建议修复顺序**：P3，可延后到任务 H 的公共拆分/合并决策汇总，或在任务 G/API 清理批次中统一处理 public utility deprecation。

**目标验证命令**：若仅加 deprecated 注释，运行 `pnpm types:check`、`pnpm api:validate`；若删除或改导出，追加 `pnpm api:baseline:check`、`pnpm docs:api:check`。

---

#### C03 整体公共拆合决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| Layout/Header/Sidebar/Content/Footer class/style helper | **已在 core，保持** | 纯 class/style 计算无框架运行时依赖，两端薄包装消费正确 |
| Container/Space/Divider style helper | **已在 core，保持** | 两端共用，attrs/native props 透传留在框架层 |
| Grid CSS 变量 gutter/span/order/flex helper | **已在 core，保持** | React/Vue 均使用同一套 CSS 变量计算，避免双端重复 |
| `getGutterStyles` legacy inline helper（C03-2） | **保留兼容，列入 deprecation 候选** | 已无框架消费，但属 public flat utility，不能直接删除 |
| generated props 表格转义（C03-1） | **修生成器，不手改生成物** | 先改 `generate-api-docs.mjs`，再重生 references |

---

#### 本轮验证命令实跑输出摘要（C03）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `.\node_modules\.bin\vitest.cmd run tests/core/grid.spec.ts tests/react/LayoutSections.spec.tsx tests/react/Container.spec.tsx tests/react/Grid.spec.tsx tests/react/Space.spec.tsx tests/react/Divider.spec.tsx tests/vue/LayoutSections.spec.ts tests/vue/Container.spec.ts tests/vue/Grid.spec.ts tests/vue/Space.spec.ts tests/vue/Divider.spec.ts` | ✅ 通过 | 11 个 test files、114 个 tests 通过 |
| `node .\scripts\validate-api.mjs` | ✅ 通过 | API 一致性检查通过，没有发现问题 |
| `node .\scripts\check-public-types.mjs` | ✅ 通过 | `All public component props types are exported.` |
| `pnpm ...` wrapper | ⚠️ 本机阻塞 | 无 TTY 下触发依赖状态检查/安装并因 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` 中止；已改用本地 bin / node 脚本完成验证 |

---

### C04 内容容器

**扫描范围**：Card、List、Descriptions、Skeleton、Collapse、CollapsePanel、Timeline 七个组件的 core 类型/工具模块、React/Vue 实现、测试文件、示例页面与 generated references。

**结论速览**：core 工具层下沉良好——Collapse 过渡控制器、Descriptions 行分组、Skeleton 段落宽度、Timeline 定位数学均已在 core 双端复用，框架实现多为薄包装。本轮发现 **1 条双端不对称（P1）**、**3 条质量问题（P2）**、**4 条清理/一致性项（P3）**；C04 定向测试与 API/type 检查均通过，所有发现均为潜在问题（未触发现有门禁）。

---

#### C04-1 React Timeline 缺少 locale 支持，与 Vue 不对称 — **P1 不对称**

**文件**：[packages/react/src/components/Timeline.tsx:168](../packages/react/src/components/Timeline.tsx)（`Loading...` 硬编码、无 `locale` prop、未接 ConfigProvider）、[packages/vue/src/components/Timeline.ts:228](../packages/vue/src/components/Timeline.ts)（已接 `useTigerConfig` + `mergeTigerLocale`，pending 文本走 `resolveLocaleText`）

Vue Timeline 暴露 `locale?: Partial<TigerLocale>` prop，并通过 `resolveLocaleText('Loading...', mergedLocale.value?.common?.loadingText)` 渲染 pending 文本；React Timeline 无 `locale` prop、未接入 ConfigProvider，pending 文本写死英文 `Loading...`。与 C02-2（React QRCode 缺 locale）同型。React 仅有 `pendingContent` 逃生口，默认 pending 文本无法本地化；本地化面较小（仅一段 pending 文本）。

**公共内容决策**：`common.loadingText` 已在 core `TigerLocale`，无需新增 key；React Timeline 加 `locale?: Partial<TigerLocale>` prop、接 `useTigerConfig`、用 `resolveLocaleText` 渲染默认 pending 文本即可对齐。渲染逻辑保留框架层。

**建议修复顺序**：

1. React Timeline 接入 ConfigProvider locale，pending 默认文本走 `resolveLocaleText`。
2. 补 React 测试覆盖 locale 覆盖路径。
3. `pnpm api:validate` 复核双端 parity。

**目标验证命令**：`pnpm vitest run tests/react/Timeline.spec.tsx tests/vue/Timeline.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C04-2 List `getGridColumnClasses` 动态拼接 grid-cols 类（Tailwind 不可扫描）+ xs/column 撞车 + 零测试 — **P2 潜在功能 Bug**

**文件**：[packages/core/src/utils/list-utils.ts:191](../packages/core/src/utils/list-utils.ts)，被 [packages/react/src/components/List.tsx:251](../packages/react/src/components/List.tsx)、[packages/vue/src/components/List.ts:307](../packages/vue/src/components/List.ts) 在 grid 模式消费

两类问题：

1. **Tailwind JIT 无法扫描**：函数拼接 `grid-cols-${column}`、`sm:grid-cols-${sm}` 等模板字符串。这正是 [timeline-utils.ts:19](../packages/core/src/utils/timeline-utils.ts) 注释明令禁止的写法（“NEVER interpolate … the scanner will NOT resolve them”）。库内同类需求均用安全写法规避：[table-utils.ts:959](../packages/core/src/utils/table-utils.ts) 用静态 `COL_SPAN_CLASSES` 映射、[grid.ts:63](../packages/core/src/utils/grid.ts) 用 CSS 变量、[markdown-editor-utils.ts:94](../packages/core/src/utils/markdown-editor-utils.ts) 用完整静态串。消费方若用 Tigercat Tailwind preset 构建，List grid 模式列数 class 很可能不被生成（列布局静默失效），除非业务侧恰好在别处用到或自行 safelist。
2. **逻辑撞车**：`xs` 被推成无前缀 `grid-cols-${xs}`，与无前缀的 `grid-cols-${column}` 同级；同时设 `column` 与 `xs` 时输出两个基础列 class，最终以生成 CSS 顺序决定胜者（与 className 顺序无关），结果不确定。

现有测试对 `getGridColumnClasses` **零覆盖**（仓库无任何引用该函数的 spec），故上述问题在 jsdom 测试中不暴露。

**公共内容决策**：网格能力已在 core——应让 List grid 复用 [grid.ts](../packages/core/src/utils/grid.ts) 的 CSS 变量列宽体系，或改用 `table-utils` 式静态映射；避免在 core 里新造第三套且不可扫描的实现。属公开 flat utility，重写需走 deprecated/baseline 流程。

**建议修复顺序**：

1. 先补 `tests/core` 对 `getGridColumnClasses` 的断言（含 xs+column 同设）。
2. 改实现为静态映射或 CSS 变量路径。
3. 双端 List grid 示例回归 + `pnpm example:build` 确认列生效。
4. 若改导出签名追加 `pnpm api:baseline:check`。

**目标验证命令**：`pnpm vitest run tests/react/List.spec.tsx tests/vue/List.spec.ts`、`pnpm example:build`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C04-3 Collapse/CollapsePanel 使用裸 gray/white Tailwind 而非 CSS token — **P2 主题一致性**

**文件**：[packages/core/src/utils/collapse-utils.ts:11](../packages/core/src/utils/collapse-utils.ts)（另见 :26 / :32 / :37 / :54 / :59 / :77）

`collapse-utils.ts` 大量使用裸色值：`bg-white`、`border-gray-200`、`hover:bg-gray-50`、`bg-gray-50`、`text-gray-700`、`text-gray-500`、`text-gray-900`。C04 其余六个组件（card / list / descriptions / skeleton / timeline-utils）全部用 `var(--tiger-surface/border/text/text-muted…)` token；唯独 Collapse 用固定灰白，切换主题/暗色时颜色不跟随。属 token 漂移（同 C02-3 与 C03 token 一致性主题）。

**公共内容决策**：在 `collapse-utils.ts` 把裸色替换为 `var(--tiger-*)` token（surface / border / surface-muted / text / text-muted），保留 core，双端零改动即生效。

**建议修复顺序**：

1. 替换 collapse-utils 颜色为 token。
2. Collapse 双端 vitest 回归（断言基于 `border` / `bg-transparent` 等结构类，不依赖具体灰度，预期不破）。
3. 视觉/暗色抽查。

**目标验证命令**：`pnpm vitest run tests/react/Collapse.spec.tsx tests/vue/Collapse.spec.ts`、`pnpm types:check`、`pnpm api:validate`。

---

#### C04-4 List 分页文案硬编码英文，未用既有 pagination locale — **P2 i18n 缺口**

**文件**：[packages/react/src/components/List.tsx:481](../packages/react/src/components/List.tsx)、[packages/vue/src/components/List.ts:528](../packages/vue/src/components/List.ts)（另见 Previous / Next / 页码 / 每页条数各处）

两端 List 自建内联分页，文案 `Showing {s} to {e} of {t} items`、`Previous`、`Next`、`Page {c} of {t}`、`{size} / page` 全硬编码英文（双端一致）。而 core 已有 [TigerLocalePagination](../packages/core/src/types/locale.ts)（`totalText`、`pageText`、`pageIndicatorText`、`itemsPerPageText`、`prevPageAriaLabel`/`nextPageAriaLabel` 等）；List 未消费该命名空间。List 的 emptyText 已本地化（`common.emptyText`），分页却没有，组件内自相矛盾。

**公共内容决策**：locale key 已在 core，无需新增；两端 List 分页文本改走 `resolveLocaleText` + `mergedLocale.pagination.*`（沿用现有 `{total}/{start}/{end}/{current}` 模板约定）。helper 留 core，渲染留框架层。

**建议修复顺序**：

1. 两端 List 分页文本接入 `pagination` locale。
2. 补 locale 覆盖测试。
3. `pnpm api:validate` 复核。

**目标验证命令**：`pnpm vitest run tests/react/List.spec.tsx tests/vue/List.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C04-5 Vue Collapse/CollapsePanel 缺 `inheritAttrs: false` 又手动并入 attrs.class，致重复 class — **P3 一致性**

**文件**：[packages/vue/src/components/Collapse.ts:133](../packages/vue/src/components/Collapse.ts)、[packages/vue/src/components/CollapsePanel.ts:102](../packages/vue/src/components/CollapsePanel.ts)

两者均**未**声明 `inheritAttrs: false`，却在 `containerClasses` / `panelClasses` 里手动 `coerceClassValue(attrs.class)`。默认 `inheritAttrs: true` 时 Vue 已把 `$attrs.class` 自动并到根元素；再手动并一次会让父级传入的 class 重复出现（浏览器虽去重，属冗余且语义混乱）。C04 其余 Vue 组件（Card/List/Descriptions/Skeleton/Timeline）统一 `inheritAttrs: false` + `...attrs` 展开后用显式 `class`/`style` 覆盖（正确范式）；Collapse 两件套是组内唯一例外。

**公共内容决策**：保留 Vue 框架层；改为与同组一致——加 `inheritAttrs: false` 并 `...attrs` 展开（或删手动 `coerceClassValue(attrs.class)` 单纯依赖继承），二选一消除重复。

**建议修复顺序**：P3，与 C04-3 同批改 Vue Collapse 文件时一并处理。

**目标验证命令**：`pnpm vitest run tests/vue/Collapse.spec.ts`、`pnpm types:check`。

---

#### C04-6 `VueListProps` 公共接口与运行时 props 漂移 — **P3 类型文档**

**文件**：[packages/vue/src/components/List.ts:622](../packages/vue/src/components/List.ts)

导出的 `VueListProps` 缺 `locale`、`virtual`、`virtualHeight`、`virtualItemHeight`、`virtualOverscan`、`draggable`，而组件 `props` 实有这些。`check-public-types.mjs` 只校验 `VueListProps` 是否存在、不校验完整性（与 A-5 同源盲区），故漂移不被门禁拦。

**公共内容决策**：补齐 `VueListProps` 字段使其与运行时 props 对齐（保持 Vue 层）。

**建议修复顺序**：P3，随任意 List 改动补齐。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`。

---

#### C04-7 Vue Descriptions style 合并次序与同组相反 — **P3 一致性**

**文件**：[packages/vue/src/components/Descriptions.ts:331](../packages/vue/src/components/Descriptions.ts)

Descriptions 用 `mergeStyleValues(props.style, attrs.style)`（→ attrs.style 覆盖 props.style）；而 Card（[Card.ts:135](../packages/vue/src/components/Card.ts)）、List（[List.ts:595](../packages/vue/src/components/List.ts)）、Skeleton（[Skeleton.ts:106](../packages/vue/src/components/Skeleton.ts)）、Timeline（[Timeline.ts:120](../packages/vue/src/components/Timeline.ts)）均为 `mergeStyleValues(attrs*, props.style)`（→ props.style 覆盖 attrs）。Descriptions 是组内唯一反向，导致同名 style 冲突时优先级与其它组件不一致。

**公共内容决策**：统一为「props.style 覆盖 attrs.style」次序（与同组对齐），保留框架层。

**建议修复顺序**：P3 清理。

**目标验证命令**：`pnpm vitest run tests/vue/Descriptions.spec.ts`、`pnpm types:check`。

---

#### C04-8 重复 cell padding 标尺 + Timeline pending dot 裸 border-white — **P3 清理候选**

**文件**：[packages/core/src/utils/list-utils.ts:31](../packages/core/src/utils/list-utils.ts)、[packages/core/src/utils/descriptions-utils.ts:27](../packages/core/src/utils/descriptions-utils.ts)、[packages/core/src/utils/timeline-utils.ts:84](../packages/core/src/utils/timeline-utils.ts)

- **重复标尺**：`listItemSizeClasses` 与 `descriptionsCellSizeClasses` 取值完全相同（`sm:'px-3 py-2' / md:'px-4 py-3' / lg:'px-6 py-4'`）。属「该合未合」的重复常量，可抽公共 `cellPaddingClasses`；但二者均为公开 flat utility，合并需走 deprecated/baseline 流程，列为候选不强求。
- **裸色**：`getPendingDotClasses()`（:84）用 `border-white`，而同文件 `timelineDotBase`（:14）用 `border-[var(--tiger-surface,#ffffff)]`；建议 pending dot 同步改 token，保持时间轴点边框一致。

**公共内容决策**：标尺合并 → 任务 H 公共拆分批次统一评估；border-white → 直接改 token（core 内、无 API 变更）。

**建议修复顺序**：P3，延后到任务 H / 清理批次。

**目标验证命令**：`pnpm types:check`；若动公开 utility 追加 `pnpm api:baseline:check`、`pnpm docs:api:check`。

---

#### C04 整体公共拆合决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| 折叠过渡控制器 / Descriptions 行分组 / Skeleton 段落宽度 / Timeline 定位数学 | **已在 core，保持** | 纯逻辑双端复用，正确下沉 |
| React Timeline locale 接入（C04-1） | **保持框架分离，对齐 Vue** | core key 已具备，仅 React 端补 ConfigProvider 接入 |
| List grid 列 class（C04-2） | **改用 core 既有安全实现** | 复用 grid.ts CSS 变量或 table-utils 静态映射，弃可扫描失败的拼接 |
| Collapse token 化（C04-3） | **修 core util，保留 core** | 裸 gray/white → `var(--tiger-*)` |
| List 分页 locale（C04-4） | **接既有 pagination 命名空间** | 不新增 key，双端接 `resolveLocaleText` |
| Collapse attrs 透传（C04-5） | **保留框架层，对齐同组范式** | 加 `inheritAttrs:false` + `...attrs` |
| VueListProps 漂移（C04-6） | **补齐类型** | 与运行时 props 对齐 |
| Descriptions style 次序（C04-7） | **统一次序** | props.style 覆盖 attrs |
| 重复 cell padding / pending dot 裸色（C04-8） | **延后 / 直接改 token** | 重复常量合并走 deprecation；border-white 直接 token 化 |

---

#### 本轮验证命令实跑输出摘要（C04）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `.\node_modules\.bin\vitest.cmd run tests/react/Card.spec.tsx tests/vue/Card.spec.ts tests/react/List.spec.tsx tests/vue/List.spec.ts tests/react/Descriptions.spec.tsx tests/vue/Descriptions.spec.ts tests/react/Skeleton.spec.tsx tests/vue/Skeleton.spec.ts tests/react/Collapse.spec.tsx tests/vue/Collapse.spec.ts tests/react/Timeline.spec.tsx tests/vue/Timeline.spec.ts` | ✅ 通过 | 12 个 test files、210 个 tests 通过 |
| `node .\scripts\validate-api.mjs` | ✅ 通过 | API 一致性检查通过，没有发现问题 |
| `node .\scripts\check-public-types.mjs` | ✅ 通过 | `All public component props types are exported.` |
| `pnpm ...` wrapper | ⚠️ 本机阻塞 | 无 TTY 下因 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` 中止；已改用本地 bin / node 脚本完成验证 |

> 上表确认所有 C04 发现均为潜在问题（未触发现有门禁）；扫描未改动任何源码/脚本/生成产物，仅更新本文件与 ROADMAP.md 状态标记。

---

### C05 导航轻量组

**扫描范围**：Affix、Anchor、AnchorLink、BackTop、Breadcrumb、BreadcrumbItem、ScrollSpy、FloatButton、FloatButtonGroup 九个组件的 core 类型/工具模块、React/Vue 实现、测试文件与 generated references。

**结论速览**：Affix、Anchor/ScrollSpy 的滚动监听与 active 计算已大体沉到 core helper，Breadcrumb/BackTop/FloatButton 的样式常量也已共享。现有 C05 定向测试与 API/type 检查均通过。但本轮发现 **4 条运行时或 SSR 风险**（P2）和 **1 条 generated reference 信息缺口**（P3），主要集中在 Vue 响应式 provide/register、FloatButtonGroup 公开语义未实现、BackTop render 阶段访问 `window`。

---

#### C05-1 `FloatButtonGroup.shape` 公开语义未实现 — **P2 不对称/功能缺口**

**文件**：[packages/core/src/types/float-button.ts:62](../packages/core/src/types/float-button.ts)、[packages/react/src/components/FloatButton.tsx:82](../packages/react/src/components/FloatButton.tsx)、[packages/vue/src/components/FloatButton.ts:107](../packages/vue/src/components/FloatButton.ts)、[skills/tigercat/references/shared/props/navigation.md:120](../skills/tigercat/references/shared/props/navigation.md)

`FloatButtonGroupProps.shape` 的 core 注释和 generated props 都说明它会 “Shape applied to all child buttons”。但 React 版将该 prop 解构为 `shape: _shape = 'circle'` 后完全不使用；Vue 版声明并接收 `props.shape`，但只用 group class、trigger 与 open state，不向子 `FloatButton` 传递 shape。

现有测试只覆盖单个 `FloatButton shape="square"`，未覆盖 group shape 继承，因此门禁通过但公开语义没有落地。

**公共内容决策**：shape 继承语义应保留在框架层 context/provide；core 只保留类型和 class 常量，不引入运行时组件树逻辑。

**建议修复顺序**：

1. React `FloatButtonGroup` 增加 group context，`FloatButton` 在自身 `shape` 未显式传入时读取 group shape；Vue 使用 provide/inject 做同等行为。
2. 调整 `FloatButton` 框架层默认值：内部默认仍为 `'circle'`，但允许区分“未传 shape”与“显式传入 shape”，保证单个按钮 prop 优先于 group shape。
3. 补 React/Vue 测试：group `shape="square"` 时子按钮默认变方形，子按钮显式 `shape="circle"` 时不被覆盖。

**目标验证命令**：`pnpm vitest run tests/react/FloatButton.spec.tsx tests/vue/FloatButton.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C05-2 Vue `Breadcrumb` 父级 `separator` 更新后子项不响应 — **P2 Bug**

**文件**：[packages/vue/src/components/Breadcrumb.ts:256](../packages/vue/src/components/Breadcrumb.ts)、[packages/vue/src/components/Breadcrumb.ts:129](../packages/vue/src/components/Breadcrumb.ts)

Vue `Breadcrumb` 在 setup 中提供的是普通对象快照：

```ts
provide<BreadcrumbContext>(BreadcrumbContextKey, {
  separator: props.separator
})
```

`BreadcrumbItem` 的 computed 会读取 `breadcrumbContext.separator`，但这个 context 对象不是 reactive，父组件后续把 `separator` 从 `'/'` 切到 `'arrow'`、`'chevron'` 或自定义字符串时，未设置 item-level separator 的子项不会更新。React 版 context value 随 render 用 `useMemo({ separator })` 重新提供，行为正确。

**公共内容决策**：属 Vue provide 响应式问题，保留在 Vue 框架层；`getSeparatorContent` 等纯逻辑已在 core，位置正确。

**建议修复顺序**：

1. Vue `Breadcrumb` 改为 provide 一个 reactive context，并 watch `props.separator` 同步 `context.separator`。
2. 保持现有 `BreadcrumbContext` 形状不变，避免破坏外部深度导入类型。
3. 补 Vue rerender 测试：父级 separator 更新后，未覆盖 separator 的 `BreadcrumbItem` 分隔符跟随变化；item-level separator 仍优先。

**目标验证命令**：`pnpm vitest run tests/vue/Breadcrumb.spec.ts tests/core/breadcrumb-utils.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C05-3 Vue `AnchorLink.href` 动态变化后注册表残留旧 href — **P2 Bug**

**文件**：[packages/vue/src/components/Anchor.ts:96](../packages/vue/src/components/Anchor.ts)、[packages/vue/src/components/Anchor.ts:100](../packages/vue/src/components/Anchor.ts)、[packages/react/src/components/Anchor.tsx:78](../packages/react/src/components/Anchor.tsx)

Vue `AnchorLink` 只在 mount 时 `registerLink(props.href)`，在 unmount 时 `unregisterLink(props.href)`。如果业务根据状态把某个 link 的 `href` 从 `#a` 更新为 `#b`，DOM 上的 `href` 与 `data-anchor-href` 会更新，但父级 `links` 注册表仍包含旧 href，IntersectionObserver 继续按旧目标列表工作。

React 版用 `useEffect` 依赖 `[href, register, unregister]`，href 变化时会清理旧 href 并注册新 href。

**公共内容决策**：注册生命周期是框架层逻辑，保留在 Vue 组件；anchor target 解析、滚动和 active 计算继续留在 core helper。

**建议修复顺序**：

1. Vue `AnchorLink` 增加 `watch(() => props.href, (next, prev) => { unregister(prev); register(next) })`，并保留 unmount 清理当前 href。
2. 避免重复注册：沿用父级 `registerLink` 的去重逻辑即可。
3. 补 Vue rerender 测试：href 更新后点击新链接触发新 href，旧 href 不再留在父级 observer 输入中。

**目标验证命令**：`pnpm vitest run tests/vue/Anchor.spec.ts tests/core/anchor-utils.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C05-4 `BackTop` render 阶段访问默认 `window`，存在 SSR 风险 — **P2 SSR**

**文件**：[packages/react/src/components/BackTop.tsx:44](../packages/react/src/components/BackTop.tsx)、[packages/react/src/components/BackTop.tsx:86](../packages/react/src/components/BackTop.tsx)、[packages/vue/src/components/BackTop.ts:64](../packages/vue/src/components/BackTop.ts)、[packages/vue/src/components/BackTop.ts:117](../packages/vue/src/components/BackTop.ts)

React `BackTop` 的默认 target 是：

```ts
const getDefaultTarget = () => window
```

组件 render 期间的 `buttonClasses` `useMemo` 会调用 `target()` 判断 fixed/sticky 类。SSR 环境没有 `window`，因此默认 `<BackTop />` 在服务端 render 时可能直接抛错。Vue 版同样将 prop 默认值写成 `default: () => window`，且 `buttonClasses` computed 在未 mounted 时会走 `props.target()`。

滚动监听本身已放在 mounted/effect 阶段，问题集中在 render/computed 阶段为了选择 position class 而提前解析 target。

**公共内容决策**：SSR guard 属框架层渲染策略；`createBackTopVisibilityController`、`scrollToTop`、class 常量继续保留在 core。

**建议修复顺序**：

1. React/Vue 默认 target 改为 SSR-safe getter：仅浏览器环境返回 `window`，否则返回 `null` 或延迟到 mounted/effect。
2. render 阶段不要调用用户传入 target；未 mounted/未解析 target 时默认使用 window/fixed classes，mounted 后根据实际 target 切换 fixed/sticky。
3. 补 React/Vue SSR smoke 测试：服务端 render 默认 `<BackTop />` 不抛错；客户端现有 scroll 行为保持。

**目标验证命令**：`pnpm vitest run tests/react/BackTop.spec.tsx tests/vue/BackTop.spec.ts tests/core/back-top-utils.spec.ts tests/core/ssr-frameworks.spec.ts`、`pnpm quality:ssr`、`pnpm api:validate`。

---

#### C05-5 `ScrollSpyProps` 缺少源码注释，generated props 信息不足 — **P3 文档**

**文件**：[packages/core/src/types/scroll-spy.ts:20](../packages/core/src/types/scroll-spy.ts)、[skills/tigercat/references/shared/props/navigation.md:128](../skills/tigercat/references/shared/props/navigation.md)

`ScrollSpyProps` 的 core 类型字段没有注释，导致 generated props 文档中 `items`、`activeKey`、`defaultActiveKey` 等字段 Notes 全部为 `-`。这不是运行时问题，但与同组 Anchor、BackTop、Breadcrumb 的 props 文档质量不一致，也降低了 skill reference 的可用性。

**公共内容决策**：修复源头应在 `packages/core/src/types/scroll-spy.ts` 的字段注释；`skills/tigercat/references/*` 是生成物，不手改。

**建议修复顺序**：

1. 为 `ScrollSpyItem`、`ScrollSpyChangePayload`、`ScrollSpyProps` 增加简短 JSDoc，尤其说明受控/非受控 activeKey、offsetTop/targetOffset、sticky 与 ariaLabel。
2. 运行 `pnpm docs:api` 生成 references，再检查 `navigation.md` 的 ScrollSpy props Notes 不再为空。
3. 保持字段名称和 public type 不变，不触发 API 破坏。

**目标验证命令**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`。

---

#### C05 整体公共拆合决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| Affix 位置计算与 observer helper | **已在 core，保持** | React/Vue 均消费 `calculateAffixState`、`resolveAffixTarget`、`createAffixObserver` |
| Anchor / ScrollSpy target、active、scroll helper | **已在 core，保持** | `ScrollSpy` 复用 anchor observer/scroll helper，公共边界合理 |
| Breadcrumb separator 与折叠计算 | **已在 core，保持** | Vue 响应式 provide 问题不需要移动 core 逻辑 |
| BackTop visibility controller 与 scroll helper | **已在 core，保持** | SSR guard 只涉及框架 render/mount 时机 |
| FloatButtonGroup shape 继承（C05-1） | **保留框架层 context/provide** | 需要组件树注入和 prop 优先级判断，不适合沉入 core |
| Vue Breadcrumb context（C05-2） | **保留 Vue 层修复** | 改 reactive provide，不改公共类型形状 |
| Vue AnchorLink 注册生命周期（C05-3） | **保留 Vue 层修复** | href watch 属框架生命周期，不改 core |
| ScrollSpy generated props 注释（C05-5） | **修 core 类型注释并重生 docs** | 不手改 generated references |

---

#### 本轮验证命令实跑输出摘要（C05）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `.\node_modules\.bin\vitest.cmd run tests\core\anchor-utils.spec.ts tests\core\back-top-utils.spec.ts tests\core\breadcrumb-utils.spec.ts tests\core\float-button-utils.spec.ts tests\react\Anchor.spec.tsx tests\react\Affix.spec.tsx tests\react\Breadcrumb.spec.tsx tests\react\BackTop.spec.tsx tests\react\FloatButton.spec.tsx tests\react\ScrollSpy.spec.tsx tests\vue\Anchor.spec.ts tests\vue\Affix.spec.ts tests\vue\Breadcrumb.spec.ts tests\vue\BackTop.spec.ts tests\vue\FloatButton.spec.ts tests\vue\ScrollSpy.spec.ts` | ✅ 通过 | 16 个 test files、298 个 tests 通过 |
| `node .\scripts\validate-api.mjs` | ✅ 通过 | API 一致性检查通过，没有发现问题 |
| `node .\scripts\check-public-types.mjs` | ✅ 通过 | `All public component props types are exported.` |

---

### C06 Steps/Tabs

**扫描范围**：4 个导航组件 Steps、StepsItem、Tabs、TabPane 的全链路——core 类型 `packages/core/src/types/{steps,tabs}.ts`、core 工具 `packages/core/src/utils/{steps,tabs}-utils.ts`、`packages/{react,vue}/src/components/{Steps,StepsItem,Tabs,TabPane}`、双端 Steps/Tabs spec、`tests/core/tabs-utils.spec.ts`、generated references 中的 `component-index.md`、`shared/props/navigation.md`、`examples/navigation.md`。

**结论速览**：C06 主行为健康——双端 Steps/Tabs 目标测试通过，Steps 的状态/class 计算与 Tabs 的 nav/indicator/pane class helper 已下沉 core 并被 React/Vue 共用；`pnpm api:validate` 与 `pnpm types:check` 也通过。**无 P1**。本组发现 **4 条 P2**（Vue Tabs 公开 props 类型漏 `lazy`、React uncontrolled Tabs roving tabindex 可能滞后、editable tab 关闭控件语义、generated references 漏 `StepsItem`）与 **2 条 P3**（Steps finish 图标常量重复/无消费者、`getNextActiveKey` 公开但无仓库消费者）。

---

#### C06-1 Vue `VueTabsProps` 漏声明 `lazy`（公开类型漂移）— **P2**

**发现问题**

- 🟠 P2｜core `TabsProps` 已声明 `lazy?: boolean`（[tabs.ts:67](../packages/core/src/types/tabs.ts)），React `TabsProps` 也声明 `lazy?: boolean`（[Tabs.tsx:357](../packages/react/src/components/Tabs.tsx)），Vue 运行时 props 同样支持 `lazy`（[Tabs.ts:425](../packages/vue/src/components/Tabs.ts)），且 Vue 测试实际使用 `props: { defaultActiveKey: '1', lazy: true }` 并通过（[tests/vue/Tabs.spec.ts:750](../tests/vue/Tabs.spec.ts)）。
- 🟠 P2｜但导出的 `VueTabsProps` 接口缺少 `lazy?: boolean`（[Tabs.ts:56](../packages/vue/src/components/Tabs.ts)），TS 用户通过 `VueTabsProps` 建模时无法表达已存在的运行时能力。`pnpm types:check` 仍通过，因为该脚本只校验 props 类型是否导出，不校验 Vue props 接口与运行时 props 成员一致。

**公共内容决策**：**补齐 Vue 公开类型**，让 `VueTabsProps` 与 core/React/运行时 props 对齐。该变更只新增可选类型字段，不改运行时行为、不破坏 API。

**建议修复顺序**：P2，优先级较高且改动小；可独立修复并补类型/基线验证。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`、`pnpm vitest run tests/vue/Tabs.spec.ts`。

---

#### C06-2 React uncontrolled Tabs 的 roving `tabIndex` 可能滞后（受控状态 / 键盘导航）— **P2**

**发现问题**

- 🟠 P2｜React Tabs 在抽取 `tabItems` 时计算 `resolvedActiveKey = controlledActiveKey ?? defaultActiveKey ?? firstKey`，并据此给克隆出来的 tab item 写入 `tabIndex`（[Tabs.tsx:447](../packages/react/src/components/Tabs.tsx) / [:457](../packages/react/src/components/Tabs.tsx)）。这个 `useMemo` 依赖 `children`、`controlledActiveKey`、`defaultActiveKey`、`idBase`，**不依赖 `internalActiveKey`**（[Tabs.tsx:477](../packages/react/src/components/Tabs.tsx)）。
- 🟠 P2｜非受控模式点击后，`activeKey` 会切到 `internalActiveKey`，所以 `aria-selected`、内容面板、indicator 都会更新；但 `tabIndex` 仍来自初始 `defaultActiveKey`/first tab，可能导致 roving tabindex 停在旧 tab。现有 React 测试覆盖了 uncontrolled 内容切换与 `aria-selected`，但没有断言点击后的 `tabIndex`（`rg tabIndex/tabindex tests/react/Tabs.spec.tsx` 无相关断言）。
- ℹ️ Vue Tabs 在 render 内用 `resolvedActiveKey = currentActiveKey.value ?? firstTabKey` 重新计算 tabIndex（[Tabs.ts:631](../packages/vue/src/components/Tabs.ts) / [:645](../packages/vue/src/components/Tabs.ts)），没有同样的 memo stale 形状。

**公共内容决策**：属 React 框架层状态同步 bug，**不需要沉 core**。保留 core 的 class/indicator helper；React 侧让 tab item 克隆的 `tabIndex` 使用最终 `activeKey` 或把 clone 计算拆到 activeKey 之后。

**建议修复顺序**：P2，与 C06-1 可同批修。先补失败用例：uncontrolled click 后新 active tab `tabIndex=0`、旧 active tab `tabIndex=-1`；再调整 React Tabs clone 计算。

**目标验证命令**：`pnpm vitest run tests/react/Tabs.spec.tsx`、`pnpm api:validate`、`pnpm types:check`。

---

#### C06-3 editable Tabs 关闭控件是嵌套交互语义（键盘 / aria）— **P2**

**发现问题**

- 🟠 P2｜React/Vue editable tab 的关闭控件都渲染在 `button role="tab"` 内部，并使用 `span role="button"`：React [Tabs.tsx:254](../packages/react/src/components/Tabs.tsx) / [:273](../packages/react/src/components/Tabs.tsx)，Vue [Tabs.ts:281](../packages/vue/src/components/Tabs.ts) / [:303](../packages/vue/src/components/Tabs.ts)。这形成“交互控件嵌套交互控件”的语义，读屏与自动化 a11y 工具可能表现不一致。
- 🟠 P2｜键盘关闭路径已有覆盖：Tab 本体获得焦点后按 Backspace/Delete 会触发 `handleTabClose`（React [Tabs.tsx:173](../packages/react/src/components/Tabs.tsx)，Vue [Tabs.ts:203](../packages/vue/src/components/Tabs.ts)）。但鼠标关闭控件本身 `tabIndex={-1}`，且 role/button 只是 span，不能作为独立按钮完整表达；当前双端测试主要验证 close 事件与可关闭状态，没有锁定更合理的语义结构。
- ℹ️ 该问题不影响现有 `pnpm vitest` 主路径，属于可访问性和语义正确性修复。

**公共内容决策**：**框架渲染层重构**，不沉 core。保留 `tabCloseButtonClasses` 与 close icon path 常量在 core；双端可改为非嵌套结构（例如 tab label 与 close button 做兄弟节点、或用符合 tablist 模式的删除交互策略），并继续支持 Delete/Backspace 快捷删除。

**建议修复顺序**：P2，但应在 C06-1/C06-2 后处理；需要一次小设计，避免破坏 tablist 键盘导航。

**目标验证命令**：`pnpm vitest run tests/react/Tabs.spec.tsx tests/vue/Tabs.spec.ts`，必要时追加 `pnpm test:a11y` 或对应 isolated a11y 测试。

---

#### C06-4 generated references 漏 `StepsItem`（文档生成链路）— **P2**

**发现问题**

- 🟠 P2｜`StepsItem` 是双端真实导出：React index 导出 `Steps, StepsItem` 与 `StepsItemProps`，Vue index 导出 `Steps, StepsItem` 与 `VueStepsItemProps`；组件文件也提供独立 re-export（[StepsItem.tsx](../packages/react/src/components/StepsItem.tsx)、[StepsItem.ts](../packages/vue/src/components/StepsItem.ts)）。
- 🟠 P2｜但 generated `component-index.md` 的 C06 相关项只有 `Steps`、`Tabs`、`TabPane`，没有 `StepsItem`（[component-index.md:160](../skills/tigercat/references/component-index.md)）。`shared/props/navigation.md` 也只列 `StepsProps`、`TabsProps`、`TabPaneProps`，没有 `StepsItemProps`（[navigation.md:203](../skills/tigercat/references/shared/props/navigation.md)）。这与任务 A 已记录的 component-index 生成来源问题一致：生成器从 core `*Props`/文件名推导，`steps.ts` 只有 `StepsProps`，看不到子组件 `StepsItem`。

**公共内容决策**：**修生成器，不直接改 generated references**。后续应按 A-5/A-7：让 `scripts/generate-api-docs.mjs` 使用真实 index 导出的公开组件集，再把缺 props 的子组件按别名/虚拟组件补齐。

**建议修复顺序**：P2，归入任务 A/A-7 的生成链路修复批次；C06 不单独手改 `skills/tigercat/references/*`。

**目标验证命令**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`。

---

#### C06-5 Steps finish 图标常量重复，`stepFinishChar` 无消费者（图标渲染 / 无用公开项）— **P3**

**发现问题**

- 🟢 P3｜Steps 完成态图标的 SVG path 与 `strokeWidth="3"` 在 React/Vue 逐字双写：React [Steps.tsx:135](../packages/react/src/components/Steps.tsx)、Vue [Steps.ts:211](../packages/vue/src/components/Steps.ts)。这与 C01 的 SVG 常量复用问题同类，渲染层可以框架分离，但 path/viewBox/stroke 这类数据常量适合沉 core。
- 🟢 P3｜core `steps-utils.ts` 公开了 `stepFinishChar = '✓'`（[steps-utils.ts:10](../packages/core/src/utils/steps-utils.ts)），但仓库内未被 Steps 实现、测试、文档消费；实际 UI 已改用 SVG checkmark。由于它通过 `@expcat/tigercat-core` flat utils barrel 公开，不能直接删除。

**公共内容决策**：finish 图标 path/viewBox/stroke 可**沉 core 常量**，渲染仍留 React/Vue。`stepFinishChar` 进入任务 H 的公开 helper 分类：若确认外部价值低，走 deprecated/migration；若保留，则补文档说明用途。

**建议修复顺序**：P3，可与 C01 SVG 常量类清理同批。

**目标验证命令**：`pnpm vitest run tests/react/Steps.spec.tsx tests/vue/Steps.spec.ts`、`pnpm api:baseline:check`（若新增/废弃公开符号）。

---

#### C06-6 `getNextActiveKey` 公开但无仓库消费者、无测试（无消费者工具）— **P3**

**发现问题**

- 🟢 P3｜`getNextActiveKey` 在 core `tabs-utils.ts` 中公开（[tabs-utils.ts:319](../packages/core/src/utils/tabs-utils.ts)），并通过 `utils/styles/index.ts` 与 core flat barrel 暴露；但仓库源码、测试、示例、references 中没有实际调用者。
- 🟢 P3｜现有 `tests/core/tabs-utils.spec.ts` 只覆盖 tab indicator/nav list helper，没有覆盖 `getNextActiveKey`。Tabs 关闭逻辑当前也只向外 emit/edit，不使用该 helper 计算下一 active key。

**公共内容决策**：**先保留，任务 H 分类**。它可能是早期可关闭 tabs 行为的残留，也可能仍对外部消费者有价值；扫描阶段不删除、不改 API。若未来组件内部要接管 close 后 active key，可复用并补测试；若确认废弃，走 deprecated/migration。

**建议修复顺序**：P3，延后到 core utils 公开面分类或 editable tabs 行为重做时处理。

**目标验证命令**：`pnpm vitest run tests/core/tabs-utils.spec.ts tests/react/Tabs.spec.tsx tests/vue/Tabs.spec.ts`、`pnpm api:baseline:check`（若废弃/删除）。

---

#### C06 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Vue `VueTabsProps.lazy` 类型补齐（C06-1） | **补齐公开类型，对齐运行时** | **P2** |
| React uncontrolled Tabs roving `tabIndex`（C06-2） | **框架层修复，不沉 core** | **P2** |
| editable tab close 语义（C06-3） | **框架渲染层重构，core 保留常量/class** | **P2** |
| `StepsItem` generated references 缺失（C06-4） | **修生成器公开组件来源，不手改 generated 文件** | **P2** |
| Steps finish 图标常量与 `stepFinishChar`（C06-5） | **图标数据沉 core；无消费者符号进 H 分类** | P3 |
| `getNextActiveKey` 无仓库消费者（C06-6） | **保留并分类；删除需 deprecated/migration** | P3 |

---

#### C06 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| `pnpm vitest run tests/core/tabs-utils.spec.ts tests/react/Steps.spec.tsx tests/vue/Steps.spec.ts tests/react/Tabs.spec.tsx tests/vue/Tabs.spec.ts` | ✅ 5 个测试文件、129 个测试通过 | C06 基线 |
| `pnpm api:validate` | ✅ 通过 | C06 基线 |
| `pnpm types:check` | ✅ 通过；但只校验 props 类型导出，不校验 Vue props 成员 parity | C06-1 |
| Grep `lazy` in core/React/Vue Tabs | core 类型、React 类型、Vue 运行时 props 均有；`VueTabsProps` 接口无 | C06-1 |
| Grep `tabIndex/tabindex` in Tabs specs | 双端测试未断言 uncontrolled 点击后的 roving tabindex | C06-2 |
| 比对 editable close 渲染 | 双端均为 `button[role=tab]` 内嵌 `span role="button"` | C06-3 |
| 比对 generated references | `component-index.md` 有 Steps/Tabs/TabPane，缺 StepsItem；`shared/props/navigation.md` 缺 StepsItem props | C06-4 |
| Grep `stepFinishChar` / SVG checkmark | `stepFinishChar` 无消费者；双端 Steps finish SVG path/stroke 双写 | C06-5 |
| Grep `getNextActiveKey` | core 公开但无仓库调用，core tabs-utils 测试未覆盖 | C06-6 |

> 本轮 C06 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C06 阶段只执行目标 vitest、`pnpm api:validate` 与 `pnpm types:check`。

---

### C07 Menu 单组

**扫描范围**：Menu / MenuItem / MenuItemGroup / SubMenu 全链路——core 类型 [packages/core/src/types/menu.ts](../packages/core/src/types/menu.ts)、core 工具 [packages/core/src/utils/menu-utils.ts](../packages/core/src/utils/menu-utils.ts)（并对照 [focus-utils.ts](../packages/core/src/utils/focus-utils.ts)）、React [Menu.tsx](../packages/react/src/components/Menu.tsx) 与 `Menu/{context,state,types,menu-item,submenu,menu-item-group,icons}`、Vue [Menu.ts](../packages/vue/src/components/Menu.ts)（单文件含 MenuItem/MenuItemGroup/SubMenu/ExpandIcon）与 `{MenuItem,MenuItemGroup,SubMenu}.ts` re-export、[tests/react/Menu.spec.tsx](../tests/react/Menu.spec.tsx)、[tests/vue/Menu.spec.ts](../tests/vue/Menu.spec.ts)、[tests/core/menu-utils.spec.ts](../tests/core/menu-utils.spec.ts)、[component-index.md](../skills/tigercat/references/component-index.md)。

**结论速览**：C07 基础面健康——纯逻辑（class 生成、search/filter、height-transition 控制器、roving-tabindex DOM 助手、导航键解析）已下沉 core `menu-utils.ts` 双端共享；双端值/行为/ARIA 对称，测试强且镜像（首字母回退、方向键 roving、Home/End、Escape、collapsed、data-state、portal/teleport 均覆盖；目标 vitest 3 文件 119 测试通过）。**无 P1**。1 条 **P2**（core 两套菜单键盘导航实现并存，决策延后到 C08/H），其余为 P3 清理/结构观察与 a11y/测试加固项。「上下文拆分」检查结论：单一 context 合理，**不拆**。

---

#### C07-1 menu-utils 错位/孤立 JSDoc（文档缺陷）— **P3**

**发现问题**

- 🟢 P3｜[menu-utils.ts:483](../packages/core/src/utils/menu-utils.ts) 起的注释「Query all enabled, visible menu-item buttons that are direct children…」明显描述 `getMenuButtons`，却悬在 [`getMenuNavigationKeys`:493](../packages/core/src/utils/menu-utils.ts)（其自带 :487–492 注释）之上；真正的 [`getMenuButtons`:503](../packages/core/src/utils/menu-utils.ts) 反而无注释。纯文档错位，无运行时影响。

**公共内容决策**：保留 core；把孤立注释移回 `getMenuButtons` 上方。

**建议修复顺序**：P3，随任意 menu-utils 改动顺手修。

**目标验证命令**：`pnpm types:check`。

---

#### C07-2 core 两套菜单键盘导航实现并存（该合未合）— **P2**

**发现问题**

- 🟠 P2｜core 存在两套菜单键盘导航：① `menu-utils.ts` 的 roving-tabindex（查询 `button[data-tiger-menuitem="true"]`：`getMenuButtons`/`moveFocusInMenu`/`focusMenuEdge`/`initRovingTabIndex`/`focusFirstChildItem`/`getMenuNavigationKeys`），由 **Menu（C07）** 使用；② [focus-utils.ts](../packages/core/src/utils/focus-utils.ts) 的 `getMenuItems`/`handleMenuNavigation`/`focusFirstMenuItem`（查询 `[role="menuitem"]`，简单 ↑↓/Home/End 移焦），由 **Dropdown（C08）** 使用（[Dropdown.tsx:21](../packages/react/src/components/Dropdown.tsx)、[Dropdown.ts:28](../packages/vue/src/components/Dropdown.ts)）。二者都作用于 `role="menuitem"` 元素却模型不同（roving + 方向 + 环绕 vs 纯移焦），属典型「该合未合」。

**公共内容决策**：两套都属 core 公共逻辑；**合并/明确分工的决策延后到 C08（Dropdown）或任务 H**——届时 Menu + Dropdown 两个消费者同时在视野，才能判断是统一为一套，还是按「roving 菜单 vs 简单移焦菜单」明确文档化。本组不单独动。

**建议修复顺序**：P2，记录待 C08/H 取舍；非 C07 单独行动项。

**目标验证命令**：`pnpm vitest run tests/core/menu-utils.spec.ts tests/core/focus-utils.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C07-3 React MenuItemGroup 靠函数名识别 SubMenu + 全员缺 displayName（latent 脆性）— **P3**

**发现问题**

- 🟢 P3｜[menu-item-group.tsx:6](../packages/react/src/components/Menu/menu-item-group.tsx) 定义 `isComponentNamed`，:22 用 `child.type === MenuItem || isComponentNamed(child.type, 'SubMenu')`——MenuItem 走稳健的直引比较，SubMenu 因循环依赖（[submenu.tsx:30](../packages/react/src/components/Menu/submenu.tsx) 已 import 本文件）只能靠函数 `.name`/`.displayName`。但所有 React Menu 子组件**均未设 `displayName`**，故仅依赖箭头函数赋值常量推断出的 `.name === 'SubMenu'`。消费端激进压缩改名后，`MenuItemGroup` 内直挂的 `SubMenu` 会静默丢失 `level`/`collapsed` 透传（缩进错误、collapsed popup 覆盖失效）。SubMenu 自身 `renderContent`（[submenu.tsx:315](../packages/react/src/components/Menu/submenu.tsx)）用直引 `child.type === SubMenu`，不受影响。

**公共内容决策**：框架层修；给 Menu 子组件设 `displayName`（兼利 devtools）或加稳定静态标记，避免依赖压缩后的函数名。Vue 侧用 `name: 'TigerSubMenu'` 等组件名识别（[Menu.ts:701](../packages/vue/src/components/Menu.ts)、[:1111](../packages/vue/src/components/Menu.ts)），相对稳定。

**建议修复顺序**：P3（需特定嵌套 + 压缩才触发），可与 C07-4 同批框架层小修。

**目标验证命令**：`pnpm vitest run tests/react/Menu.spec.tsx`、`pnpm types:check`。

---

#### C07-4 Vue focusFirstChild 反推标题元素（双端 parity / 健壮性）— **P3**

**发现问题**

- 🟢 P3｜Vue `focusFirstChild`（[Menu.ts:981](../packages/vue/src/components/Menu.ts)）`await nextTick()` 后用 `document.activeElement` 当标题元素传给 `focusFirstChildItem`；React `openInline`（[submenu.tsx:178](../packages/react/src/components/Menu/submenu.tsx)）直接捕获 `event.currentTarget` 标题按钮传入。实践可用（Enter 后焦点仍在标题按钮），但若 await 期间焦点移动则 Vue 会定位到错误元素。

**公共内容决策**：框架层修，Vue 在 `handleTitleKeyDown` 捕获 `current` 按钮并透传，对齐 React。

**建议修复顺序**：P3。

**目标验证命令**：`pnpm vitest run tests/vue/Menu.spec.ts`（建议补「Enter 展开 inline 子菜单后焦点落到首子项」断言）。

---

#### C07-5 Vue 单文件 monolith vs React 多文件拆分（结构观察）— **P3**

**发现问题**

- 🟢 P3｜Vue [Menu.ts](../packages/vue/src/components/Menu.ts) 单文件 1274 行承载 Menu + MenuItem + MenuItemGroup + SubMenu + ExpandIcon + context + types，另有 `MenuItem.ts`/`MenuItemGroup.ts`/`SubMenu.ts` 三个 6 行 re-export；React 拆成 `Menu.tsx` + `Menu/{context,state,types,menu-item,submenu,menu-item-group,icons}`。维护性上属「该拆未拆」。

**公共内容决策**：可选重构（Vue 镜像 React 拆分）；当前因共享 `MenuContext`/helper 而内聚，非缺陷，**延后**。

**建议修复顺序**：P3，非本轮动作。

**目标验证命令**：`pnpm vitest run tests/vue/Menu.spec.ts`、`pnpm types:check`、`pnpm api:validate`（确保拆分后导出不变）。

---

#### C07-6 Vue 首字母回退取值更脆（边缘）— **P3**

**发现问题**

- 🟢 P3｜Vue MenuItem collapsed-无 icon 分支用 `String(defaultSlot[0].children || '')` 取首字母（[Menu.ts:596](../packages/vue/src/components/Menu.ts)），React 用 `String(children || '')`（[menu-item.tsx:107](../packages/react/src/components/Menu/menu-item.tsx)）。复合 slot（如 `<Icon/>文本`）下 Vue 取「首个 vnode 的 children」可能取错。

**公共内容决策**：记录为边缘场景（collapsed + 无 `icon` prop + 多节点 slot）；测试仅覆盖纯文本标签。

**建议修复顺序**：P3，可与 C07-4 同批。

**目标验证命令**：`pnpm vitest run tests/vue/Menu.spec.ts`。

---

#### C07-7 上下文拆分：单一 context 合理（观察 / 无动作）

**发现问题**

- ℹ️ 双端均单一 context（React `MenuContext` [context.ts:5](../packages/react/src/components/Menu/context.ts) / Vue `MenuContextKey` [Menu.ts:64](../packages/vue/src/components/Menu.ts)），载 mode/theme/collapsed/inlineIndent/popupPortal/selectedKeys/openKeys + 两个 handler。子项几乎都需其中多数值；选中态变化会让 contextValue 整体更新、消费组件较广重渲染，但菜单体量小，拆「静态配置 vs 选中态」两 context 收益有限。

**公共内容决策**：**保持单一 context，不拆**（直接回应 ROADMAP「上下文拆分」检查项：结论为设计合理）。

**建议修复顺序**：无动作。

**目标验证命令**：—。

---

#### C07-8 缺 ARIA 首字母 typeahead 导航 + roving-tabindex 核心助手无直接单测（a11y / 测试加固）— **P3**

**发现问题**

- 🟢 P3｜键盘处理覆盖方向键/Home/End/Enter/Space/Escape，但**无 WAI-ARIA 首字母 typeahead 导航**（敲字母跳到下一个匹配项）——与 collapsed 首字母展示、`searchable` 输入框是不同特性；双端一致，非回退。
- 🟢 P3｜`getMenuButtons`/`moveFocusInMenu`/`focusMenuEdge`/`initRovingTabIndex`/`focusFirstChildItem` **无直接 core 单测**（[tests/core/menu-utils.spec.ts](../tests/core/menu-utils.spec.ts) 仅覆盖 height-transition/search/classes/`getMenuNavigationKeys`），只经 React/Vue 组件 spec 间接覆盖。

**公共内容决策**：typeahead 属可选 a11y 增强，若做应抽 core 共享 typeahead 助手（双端复用）；roving-tabindex DOM 助手建议补 core 单测加固这批逻辑密集函数。

**建议修复顺序**：P3，独立可选项。

**目标验证命令**：`pnpm vitest run tests/core/menu-utils.spec.ts tests/react/Menu.spec.tsx tests/vue/Menu.spec.ts`。

> 「首字母回退」歧义澄清：组件实现的是 **collapsed 模式首字母展示回退**（无 icon 时显示首字母 + sr-only 全名），双端均实现且被测试断言（[tests/react/Menu.spec.tsx:811](../tests/react/Menu.spec.tsx)、[tests/vue/Menu.spec.ts:871](../tests/vue/Menu.spec.ts) 断言 `'A'`）；**首字母 typeahead 检索导航并不存在**（即本条）。

---

#### C07 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| 两套菜单键盘导航（C07-2） | **该合未合，决策延后 C08/H** | **P2** |
| menu-utils 错位 JSDoc（C07-1） | 注释移位修正 | P3 |
| React SubMenu 名识别 + displayName（C07-3） | 框架层加 displayName/标记 | P3 |
| Vue focusFirstChild 反推元素（C07-4） | 框架层对齐 React | P3 |
| Vue monolith 拆分（C07-5） | 可选重构，延后 | P3 |
| Vue 首字母取值脆性（C07-6） | 边缘记录 | P3 |
| 单一 context（C07-7） | 保持不拆 | 观察 |
| typeahead / 核心单测（C07-8） | a11y 增强 + 补 core 单测 | P3 |

---

#### C07 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| 读 `menu-utils.ts:479-575` 注释/函数排布 | :483-486 注释错位于 `getMenuNavigationKeys` 上方，`getMenuButtons`@503 无注释 | C07-1 |
| Grep `handleMenuNavigation`/`getMenuItems`/`focusFirstMenuItem` 消费者（src） | 仅 Dropdown（React/Vue）使用 focus-utils；Menu 用 menu-utils | C07-2 |
| Grep `displayName`（React Menu 目录） | 仅 `isComponentNamed` 内部读取，无任何子组件设 displayName | C07-3 |
| 比对 React `openInline` vs Vue `focusFirstChild` | React 传 `event.currentTarget`；Vue 反推 `document.activeElement` | C07-4 |
| `wc -l` Vue Menu.ts 与 re-export | Menu.ts=1274；MenuItem/MenuItemGroup/SubMenu.ts 各 6 行 | C07-5 |
| 比对首字母取值 | Vue `defaultSlot[0].children`（:596） vs React `String(children)`（:107） | C07-6 |
| 比对 context 定义 | 双端单一 context，载 8 字段 + 2 handler | C07-7 |
| 读 keydown 分支 + `menu-utils.spec.ts` | 无 typeahead 分支；core spec 不测 roving-tabindex DOM 助手 | C07-8 |
| collapsed 首字母测试 | React spec:811 / Vue spec:871 均断言 aria-hidden 首字母 `'A'` + sr-only 全名 | 首字母回退已实现并测 |
| 实跑目标 vitest | `tests/react/Menu.spec.tsx` + `tests/vue/Menu.spec.ts` + `tests/core/menu-utils.spec.ts`：3 文件 119 测试通过 | 结论速览 |
| 实跑 `pnpm api:validate` / `pnpm types:check` | 均通过（API 一致性 0 问题；公共 props 类型齐全） | 无 P1 |

> 本轮 C07 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C07 阶段只执行目标 vitest、`pnpm api:validate` 与 `pnpm types:check`（均通过）。

---

### C08 Overlay 触发器

**扫描范围**：Dropdown / DropdownMenu / DropdownItem / Popover / Popconfirm / Tooltip 全链路——core 类型 [floating-popup.ts](../packages/core/src/types/floating-popup.ts)、[dropdown.ts](../packages/core/src/types/dropdown.ts)、[popover.ts](../packages/core/src/types/popover.ts)、[popconfirm.ts](../packages/core/src/types/popconfirm.ts)、[tooltip.ts](../packages/core/src/types/tooltip.ts)，core 工具 [floating.ts](../packages/core/src/utils/floating.ts)、[floating-popup-utils.ts](../packages/core/src/utils/floating-popup-utils.ts)、[overlay-utils.ts](../packages/core/src/utils/overlay-utils.ts)、[focus-utils.ts](../packages/core/src/utils/focus-utils.ts)、[dropdown-utils.ts](../packages/core/src/utils/dropdown-utils.ts)、[popover-utils.ts](../packages/core/src/utils/popover-utils.ts)、[popconfirm-utils.ts](../packages/core/src/utils/popconfirm-utils.ts)、[tooltip-utils.ts](../packages/core/src/utils/tooltip-utils.ts)，React/Vue 对应组件实现、React `usePopup` / Vue `useFloatingPopup` 与 overlay 封装、4 个 popup 双端 spec、core floating/focus/overlay spec、generated references。

**结论速览**：C08 浮层基础面健康——定位（`floating.ts`）、外点/composedPath（`overlay-utils.ts`）、焦点（`focus-utils.ts`）、触发器映射（`buildTriggerHandlerMap`）、aria id 工厂已沉 core；Tooltip / Popover / Popconfirm 双端共享 `usePopup` / `useFloatingPopup`，对称良好；references 准确，4 个 popup 双端 spec + core floating/focus/overlay spec 齐全。**无 P1**。发现集中在 P3：1 条 latent 双端 bug、2 条该合未合类型、1 条 Dropdown 绕开共享 hook、3 条 parity/一致性清理。

---

#### C08-1 Vue Dropdown context 静态快照（双端 parity / latent bug）— **P3**

**发现问题**

- 🟢 P3｜Vue `provide(DropdownContextKey, { closeOnClick: props.closeOnClick, handleItemClick })`（[Dropdown.ts:381](../packages/vue/src/components/Dropdown.ts)）注入的是 setup 时静态快照；`DropdownItem` 读 `context?.closeOnClick`（[DropdownItem.ts:65](../packages/vue/src/components/DropdownItem.ts)）也会拿到定格值。React `useMemo(() => ({ closeOnClick, handleItemClick }), [closeOnClick, handleItemClick])`（[Dropdown.tsx:257](../packages/react/src/components/Dropdown.tsx)）会随 prop 重算。
- 🟢 P3｜影响窄但真实：`handleItemClick` 自身读活 `props.closeOnClick`（[Dropdown.ts:273](../packages/vue/src/components/Dropdown.ts)），所以 `true → false` 动态切换仍正确；但 `false → true` 时 item 侧 `if (context?.closeOnClick)` 仍为旧 false，导致不调用关闭逻辑。测试只覆盖静态 `closeOnClick={false}`，未覆盖动态切换。

**公共内容决策**：Vue 框架层修（provide reactive/computed 或 item 直读 reactive），不沉 core。与 C02-1 属同类 provide 快照反模式，但影响面更窄。

**建议修复顺序**：P3，可与 C02-1 同批处理。

**目标验证命令**：`pnpm vitest run tests/vue/Dropdown.spec.ts tests/react/Dropdown.spec.tsx`、`pnpm types:check`。

---

#### C08-2 共享 `BaseFloatingPopupProps` 声明并导出却无人继承（该合未合）— **P3**

**发现问题**

- 🟢 P3｜[floating-popup.ts:16](../packages/core/src/types/floating-popup.ts) 定义并导出 `BaseFloatingPopupProps`（`open` / `defaultOpen` / `placement` / `disabled` / `offset` / `className`），注释自述为 Tooltip / Popover / Popconfirm 共享基类。
- 🟢 P3｜但 `TooltipProps`（[tooltip.ts:15](../packages/core/src/types/tooltip.ts)）、`PopoverProps`（[popover.ts:15](../packages/core/src/types/popover.ts)）、`PopconfirmProps`（[popconfirm.ts:15](../packages/core/src/types/popconfirm.ts)）各自重复这些字段，无一继承该基类；grep 也只看到声明/文档引用，没有真实类型复用。

**公共内容决策**：合并候选。三 Props 可改为 `extends BaseFloatingPopupProps`（结构等价、非破坏）；但 Popconfirm 当前无 `offset` / `trigger`，需要 `Omit` 或拆更细基类。若决定弃用该导出，也应走 deprecated/migration，不直接删除已公开符号。

**建议修复顺序**：P3，和 C08-3 同批。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C08-3 `PopoverTrigger` / `TooltipTrigger` 重复 `FloatingTrigger`（该合未合）— **P3**

**发现问题**

- 🟢 P3｜`FloatingTrigger = 'click' | 'hover' | 'focus' | 'manual'`（[floating-popup.ts:10](../packages/core/src/types/floating-popup.ts)）已被 `buildTriggerHandlerMap`、React `usePopup`、Vue `useFloatingPopup` 共同消费。
- 🟢 P3｜`PopoverTrigger`（[popover.ts:10](../packages/core/src/types/popover.ts)）成员完全相同；`TooltipTrigger`（[tooltip.ts:10](../packages/core/src/types/tooltip.ts)）成员也相同，仅顺序不同。与 C01-6（TagVariant 等价 BadgeVariant）同型。

**公共内容决策**：合并候选。令 `PopoverTrigger` / `TooltipTrigger` 变成 `FloatingTrigger` 别名，成员不变、非破坏；`DropdownTrigger = 'click' | 'hover'` 是真子集，应保留独立。

**建议修复顺序**：P3，与 C08-2 同批。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`。

---

#### C08-4 Dropdown 绕开共享 popup hook，双端各自重写编排（该合未合 / 结构观察）— **P3**

**发现问题**

- 🟢 P3｜Tooltip / Popover / Popconfirm 双端走共享 hook：React `usePopup`、Vue `useFloatingPopup` 统一处理受控可见性、floating、外点、Esc、触发器映射。
- 🟢 P3｜Dropdown 双端没有使用这层 hook，而是在组件内重写可见性、hover 100/150ms 延时、`useFloating` / `useClickOutside` / `useEscapeKey`、焦点 capture/restore 与菜单键盘导航（React [Dropdown.tsx:161](../packages/react/src/components/Dropdown.tsx)，Vue [Dropdown.ts:246](../packages/vue/src/components/Dropdown.ts)）。双端实现彼此对称，不是 parity 缺陷，但与共享 hook 存在一层编排重复。

**公共内容决策**：可选重构。Dropdown 可基于共享 hook 叠加 hover 延时/菜单焦点，也可保留独立并注释说明边界。考虑 Dropdown 的菜单语义和焦点需求更强，本轮只记录，不直接重构。

**建议修复顺序**：P3/可选，延后。

**目标验证命令**：`pnpm vitest run tests/react/Dropdown.spec.tsx tests/vue/Dropdown.spec.ts`。

---

#### C08-5 React Dropdown 外点监听缺 `defer`，与 Vue/usePopup 不一致（双端 parity）— **P3**

**发现问题**

- 🟢 P3｜React `usePopup` 的 click-outside 传 `defer: true`（[use-popup.ts:135](../packages/react/src/utils/use-popup.ts)），Vue `useFloatingPopup` 同样传 `defer: true`（[use-floating-popup.ts:158](../packages/vue/src/utils/use-floating-popup.ts)）；Vue Dropdown 的 click-outside 也传 `defer: true`（[Dropdown.ts:324](../packages/vue/src/components/Dropdown.ts)）。
- 🟢 P3｜React Dropdown 直接调用 `useClickOutside` 时未传 `defer`（[Dropdown.tsx:208](../packages/react/src/components/Dropdown.tsx)）。当前多半良性：触发器在 `containerRef` 内，开启那次 click 对 `isEventOutside` 返回 false；但它仍偏离了本组已形成的“开启后延迟挂外点监听”约定。

**公共内容决策**：React 框架层对齐，给 React Dropdown 补 `defer: true`。不涉及 core API。

**建议修复顺序**：P3，小修。

**目标验证命令**：`pnpm vitest run tests/react/Dropdown.spec.tsx`。

---

#### C08-6 hover 触发的 Popover 内容不可悬停进入（latent UX / parity 观察）— **P3**

**发现问题**

- 🟢 P3｜Dropdown 菜单 wrapper 双端都挂了 `onMouseEnter` / `onMouseLeave`（React [Dropdown.tsx:305](../packages/react/src/components/Dropdown.tsx)，Vue [Dropdown.ts:463](../packages/vue/src/components/Dropdown.ts)）以便指针移入菜单后保持打开。
- 🟢 P3｜Tooltip / Popover 浮层内容没有类似 mouse enter/leave 保持逻辑；`trigger="hover"` 的 Popover 若内容可交互，指针从触发器移向浮层时会触发隐藏，导致内容难以进入。Tooltip 非交互内容可接受；Popover 默认 `trigger='click'`，影响有限。

**公共内容决策**：若明确支持 hover 交互 Popover，需要浮层补 hover 保持/safe-bridge；若不支持，应在文档说明 hover Popover 仅适合非交互内容。双端共享 hook 可以承接该策略，但本轮只记录。

**建议修复顺序**：P3/观察。

**目标验证命令**：`pnpm vitest run tests/react/Popover.spec.tsx tests/vue/Popover.spec.ts`（建议补 hover-into-content 用例）。

---

#### C08-7 浮层 style 合并 / 挂载策略次要不一致（清理）— **P3**

**发现问题**

- 🟢 P3｜style 合并：Dropdown / Popconfirm 双端会用 `mergeStyleValues` 合并外部 style；Tooltip / Popover 仅透传 `style: props.style`（Vue [Tooltip.ts:86](../packages/vue/src/components/Tooltip.ts)、[Popover.ts:100](../packages/vue/src/components/Popover.ts)，React 侧同型）。由于 style 是声明 prop，attrs.style 通常为空，当前没有明确 bug，只是组内写法不齐。
- 🟢 P3｜挂载策略：Tooltip / Popover 双端 mount-on-open；Popconfirm 双端 always-mounted + `hidden` 切换。各自双端对称，组内不同。当前没有行为缺陷，但后续若统一动画、SEO、可访问性或性能策略，需要一起取舍。

**公共内容决策**：低优先统一，无公共 API 影响。style 合并可框架层顺手对齐；挂载策略需结合动画/focus/portal 行为再决定。

**建议修复顺序**：P3，随相关组件下次改动处理。

**目标验证命令**：`pnpm vitest run tests/react/{Tooltip,Popover,Popconfirm}.spec.tsx tests/vue/{Tooltip,Popover,Popconfirm}.spec.ts`。

---

#### C08 健康项与 C07 延后项承接

- ✅ 核心逻辑已下沉 core：floating 定位、overlay composedPath 外点判断、焦点捕获/恢复、触发器事件映射、aria id 工厂均可复用。
- ✅ React `usePopup` 与 Vue `useFloatingPopup` 对称，Tooltip / Popover / Popconfirm 行为基线稳定。
- ✅ references 对本组的 portal、`data-state`、trigger 作用域插槽与 feedback props 描述未见漂移。
- ✅ 目标测试齐全：4 个 popup 双端 spec + core floating/focus/overlay spec 通过。
- ℹ️ 承接 C07-2：`focus-utils` 的 `handleMenuNavigation` / `focusFirstMenuItem` / `getMenuItems` 消费者经 grep 确认仅 Dropdown（React/Vue），Menu 使用自有 `menu-utils`。C08 确认边界：两套键盘导航是否合并留待任务 H（跨 C07+C08）。

---

#### C08 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Vue Dropdown context 静态快照（C08-1） | Vue 框架层 reactive 修复，不沉 core | P3 |
| `BaseFloatingPopupProps` 未被继承（C08-2） | 合并候选；或弃用需走 deprecated/migration | P3 |
| `PopoverTrigger` / `TooltipTrigger` 重复 `FloatingTrigger`（C08-3） | 改为 `FloatingTrigger` 别名；DropdownTrigger 保留独立 | P3 |
| Dropdown 绕开共享 hook（C08-4） | 可选重构或注释边界，延后 | P3 |
| React Dropdown click-outside 缺 `defer`（C08-5） | React 框架层补齐 `defer: true` | P3 |
| hover Popover 内容不可悬停进入（C08-6） | 补 hover 保持或文档限制，先观察 | P3 |
| style 合并 / 挂载策略差异（C08-7） | 低优先统一，无 API 影响 | P3 |
| C07/C08 两套菜单键盘导航 | 保持记录，交给任务 H 统一分类 | **P2** |

---

#### C08 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| Vue Dropdown provide + DropdownItem inject | provide 写入 `props.closeOnClick` 快照；item 先判断 `context?.closeOnClick` 再调用 handler | C08-1 |
| React Dropdown contextValue | `useMemo` 依赖 `closeOnClick` / `handleItemClick`，prop 改变时会更新 | C08-1 |
| Grep `BaseFloatingPopupProps` | core 类型声明和 references 文档引用存在；Tooltip/Popover/Popconfirm Props 未继承 | C08-2 |
| 比对 trigger 类型 | `FloatingTrigger`、`PopoverTrigger`、`TooltipTrigger` 成员等价；DropdownTrigger 为子集 | C08-3 |
| 比对 popup hook 消费 | Tooltip/Popover/Popconfirm 使用共享 hook；Dropdown 双端内联编排 | C08-4 |
| 比对 click-outside defer | React/Vue popup hook 与 Vue Dropdown 有 `defer: true`；React Dropdown 缺失 | C08-5 |
| 比对 hover 内容保持 | Dropdown 浮层容器有 mouse enter/leave；Tooltip/Popover 内容容器无 | C08-6 |
| 比对 style / mount 策略 | Dropdown/Popconfirm 合并 style；Tooltip/Popover 仅用 props.style；Popconfirm always-mounted，Tooltip/Popover mount-on-open | C08-7 |
| Grep `handleMenuNavigation` / `getMenuItems` / `focusFirstMenuItem` 消费者（src） | 仅 Dropdown（React/Vue）使用 focus-utils；Menu 使用 menu-utils | C07-2 / C08 承接 |
| `corepack pnpm vitest run tests/react/Dropdown.spec.tsx tests/react/Popover.spec.tsx tests/react/Popconfirm.spec.tsx tests/react/Tooltip.spec.tsx tests/vue/Dropdown.spec.ts tests/vue/Popover.spec.ts tests/vue/Popconfirm.spec.ts tests/vue/Tooltip.spec.ts tests/core/floating.spec.ts tests/core/focus-utils.spec.ts tests/core/overlay-utils.spec.ts tests/core/overlay-scroll-lock.spec.ts` | ✅ 12 个测试文件、225 个测试通过 | C08 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C08 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C08 基线 |

> 本轮 C08 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C08 阶段只执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。

### C09 Feedback 容器

**扫描范围**：Modal / Drawer / Loading / Progress / Tour 五个组件的 core 类型 [modal.ts](../packages/core/src/types/modal.ts)、[drawer.ts](../packages/core/src/types/drawer.ts)、[loading.ts](../packages/core/src/types/loading.ts)、[progress.ts](../packages/core/src/types/progress.ts)、[tour.ts](../packages/core/src/types/tour.ts)，core 工具 [modal-utils.ts](../packages/core/src/utils/modal-utils.ts)、[drawer-utils.ts](../packages/core/src/utils/drawer-utils.ts)、[loading-utils.ts](../packages/core/src/utils/loading-utils.ts)、[progress-utils.ts](../packages/core/src/utils/progress-utils.ts)、[tour-utils.ts](../packages/core/src/utils/tour-utils.ts)、[overlay-utils.ts](../packages/core/src/utils/overlay-utils.ts)、[focus-utils.ts](../packages/core/src/utils/focus-utils.ts)，React/Vue 对应组件实现、双端 overlay helper、feedback generated references 与相关 spec。

**结论速览**：Modal / Drawer / Loading / Progress 的基础面健康：scroll lock、focus trap、focus restore、mask click 判定、Loading 动画注入、Progress clamp/format/circle 计算均有 core helper 或双端镜像实现；C09 目标 vitest 13 文件 243 测试通过，`api:validate` / `types:check` 均通过。**无 P1**。发现主要集中在 3 条 P2：React Modal open callback 语义偏 observer、React Loading 缺少组件级 locale prop、Tour 宣称 `aria-modal` 但没有复用 overlay lifecycle；其余为遮罩语义、Tour i18n、Progress a11y 结构等 P3 清理项。

---

#### C09-1 React Modal 把 `onOpenChange` / `onClose` 当作 prop observer 调用 — **P2**

**发现问题**

- 🟠 P2｜React Modal 在 effect 中对每次 `open` prop 变化调用 `onOpenChange?.(open)`，并在 `open=false` 时调用 `onClose?.()`（[Modal.tsx:166](../packages/react/src/components/Modal.tsx)）。这意味着 `<Modal open={false} onClose={...} />` 初次挂载后也会触发 `onClose`，`open={true}` 初次挂载会触发 `onOpenChange(true)`。
- 🟠 P2｜Vue Modal 没有 immediate observer：只在关闭动作里 `emit('update:open', false)` / `emit('cancel')`，并在 `open` 从 true 变 false 的 watcher 中 `emit('close')`（[Modal.ts:292](../packages/vue/src/components/Modal.ts)、[Modal.ts:357](../packages/vue/src/components/Modal.ts)）。因此双端 callback 语义不一致。
- 🟠 P2｜现有 React 测试明确锁住了该 observer 行为（[tests/react/Modal.spec.tsx:304](../tests/react/Modal.spec.tsx)），但这和 Drawer / Tour / 大多数受控组件的 `onOpenChange` 语义不同：回调通常代表用户请求变更，而不是父级 prop 已变化。

**公共内容决策**：属于 React 框架层 open API 语义修正，不沉 core。若保留 observer 行为，需要在文档中明确；若改为 action-only，应按兼容变更处理并同步测试。

**建议修复顺序**：P2。先决定是否要 breaking-compatible 迁移：推荐让 `onOpenChange` 只在内部关闭/确认动作时触发，`onClose` 只在从 open 到 closed 的有效过渡或内部 close action 后触发；补“初始 closed 不触发 onClose”的回归测试。

**目标验证命令**：`pnpm vitest run tests/react/Modal.spec.tsx tests/vue/Modal.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C09-2 Modal `mask=false` 仍保留外层点击关闭区域 — **P3**

**发现问题**

- 🟢 P3｜React Modal 的 mask 节点只负责视觉遮罩；真正的关闭点击挂在 content container（[Modal.tsx:351](../packages/react/src/components/Modal.tsx)、[Modal.tsx:360](../packages/react/src/components/Modal.tsx)）。Vue Modal 同型，mask 节点没有 click handler，container 有 `onClick: handleMaskClick`（[Modal.ts:530](../packages/vue/src/components/Modal.ts)、[Modal.ts:540](../packages/vue/src/components/Modal.ts)）。
- 🟢 P3｜因此 `mask={false}` 时视觉遮罩消失，但固定定位 wrapper/container 仍覆盖视口；点击内容外空白区域仍会因为 `event.target === event.currentTarget` 触发关闭。Drawer 不同：Drawer 的关闭点击只挂在 mask 节点上，`mask=false` 后没有外层关闭点击（[Drawer.tsx:290](../packages/react/src/components/Drawer.tsx)、[Drawer.ts:498](../packages/vue/src/components/Drawer.ts)）。
- 🟢 P3｜现有测试只覆盖 “mask 节点不渲染”，没有覆盖 `mask=false` 时外部点击是否应关闭。

**公共内容决策**：属于 Modal/Drawer 行为语义统一问题，关闭判定 helper `shouldCloseOnMaskClick` 已在 core，无需新增 core 逻辑。若希望 `mask=false` 后仍可点空白关闭，应文档写明；若语义是“没有 mask 就没有 mask click”，则 Modal 框架层把 container click guard 改成 `mask && shouldCloseOnMaskClick(...)`。

**建议修复顺序**：P3。先补双端测试固定预期，再改 Modal 或文档；同时确认 `maskClosable=false` 与 `mask=false` 的组合语义。

**目标验证命令**：`pnpm vitest run tests/react/Modal.spec.tsx tests/vue/Modal.spec.ts`。

---

#### C09-3 React Loading 缺少组件级 `locale` prop，与 Vue 不对称 — **P2**

**发现问题**

- 🟠 P2｜Vue Loading 扩展了 `locale?: Partial<TigerLocale>`，并用 `mergeTigerLocale(config.value.locale, props.locale)` 解析无文本时的 aria-label（[Loading.ts:29](../packages/vue/src/components/Loading.ts)、[Loading.ts:93](../packages/vue/src/components/Loading.ts)、[Loading.ts:241](../packages/vue/src/components/Loading.ts)）。
- 🟠 P2｜React Loading 只读取 ConfigProvider locale（[Loading.tsx:38](../packages/react/src/components/Loading.tsx)、[Loading.tsx:146](../packages/react/src/components/Loading.tsx)），React `LoadingProps` 继承 core `LoadingProps`，core 类型没有 `locale` 字段（[loading.ts](../packages/core/src/types/loading.ts)）。单个 Loading 实例无法像 Vue 一样用组件级 locale 覆盖无文本 aria-label，只能传 `text` 或包一层 ConfigProvider。
- 🟠 P2｜这与 Modal / Drawer 的双端 locale+labels API 方向不一致，也不会被现有 Loading 测试覆盖：测试只断言默认 aria-label 与 `text` 覆盖。

**公共内容决策**：locale 语义应合到 core `LoadingProps` 或至少双端 wrapper props 对齐。渲染仍留框架层，`resolveLocaleText`/`mergeTigerLocale` 已在 core 可复用。

**建议修复顺序**：P2。给 core `LoadingProps` 补 `locale?: Partial<TigerLocale>`（或 React wrapper 补同名 prop并与 Vue 对齐），React Loading 合并 ConfigProvider + props locale；补双端“组件级 locale 覆盖 aria-label”的测试。若变更 core type，刷新 API baseline。

**目标验证命令**：`pnpm vitest run tests/react/Loading.spec.tsx tests/vue/Loading.spec.ts`、`pnpm api:validate`、`pnpm types:check`、涉及 public type baseline 时追加 `pnpm api:baseline:check`。

---

#### C09-4 Tour 使用 `aria-modal` 但未接入 overlay lifecycle — **P2**

**发现问题**

- 🟠 P2｜React/Vue Tour popover 都设置 `role="dialog"` 和 `aria-modal="true"`（[Tour.tsx:180](../packages/react/src/components/Tour.tsx)、[Tour.ts:310](../packages/vue/src/components/Tour.ts)），但没有像 Modal / Drawer 那样接入 Escape 关闭、focus trap、打开后聚焦、关闭后恢复焦点、body scroll lock。
- 🟠 P2｜React Tour 直接 `ReactDOM.createPortal(content, document.body)`（[Tour.tsx:226](../packages/react/src/components/Tour.tsx)），Vue Tour 直接 `h(Teleport, { to: 'body' }, children)`（[Tour.ts:323](../packages/vue/src/components/Tour.ts)），没有复用 React/Vue overlay helper，也没有使用 core `captureActiveElement` / `restoreFocus` / `lockBodyScroll`。
- 🟠 P2｜现有 Tour 双端测试覆盖渲染、导航、mask click、portal 与基础 a11y，但没有覆盖 Escape、Tab 环绕、焦点恢复、scroll lock。

**公共内容决策**：overlay lifecycle 的纯逻辑已在 core 与双端 overlay helper 中，Tour 应复用现有 helper；Tour 定位/step 逻辑继续留在 `tour-utils.ts` 与框架组件内。

**建议修复顺序**：P2。先补双端测试：打开后聚焦 close/primary button、Escape 关闭、Tab 环绕、关闭后恢复触发元素、可选 scroll lock。实现时 React 用 `renderBodyPortal` / `useEscapeKey` / `useFocusTrap` / `useBodyScrollLock`；Vue 用 `renderVueBodyTeleport` / `useVueEscapeKey` / `useVueFocusTrap` / `useVueBodyScrollLock`。若产品语义不希望 Tour 锁滚动或 trap focus，应移除 `aria-modal` 或降为非 modal dialog 语义。

**目标验证命令**：`pnpm vitest run tests/react/Tour.spec.tsx tests/vue/Tour.spec.ts tests/core/overlay-utils.spec.ts tests/core/overlay-scroll-lock.spec.ts`。

---

#### C09-5 Tour target spotlight mask 不拦截背景交互，且不能点击关闭 — **P3**

**发现问题**

- 🟢 P3｜无 target 的 Tour mask 是全屏固定 div，点击会关闭（React [Tour.tsx:175](../packages/react/src/components/Tour.tsx)、Vue [Tour.ts:230](../packages/vue/src/components/Tour.ts)）。有 target 时则渲染 `getTourSpotlightStyle(targetRect)` 的单个 overlay；该 helper 明确设置 `pointerEvents: 'none'`（[tour-utils.ts](../packages/core/src/utils/tour-utils.ts)），所以背景点击会穿透到页面，且不会关闭 Tour。
- 🟢 P3｜这和 `aria-modal="true"` 的体验不匹配，也和无 target mask 的点击关闭不一致。现有测试只验证 spotlight overlay 存在，没有验证背景点击是否被阻止或关闭。

**公共内容决策**：spotlight 几何/样式 helper 保留 core；是否阻止背景交互是 Tour 组件行为策略。若要可点击关闭，需要额外 overlay layer 或把 spotlight mask 改为 pointer-aware 结构；不能只改 `pointerEvents`，否则 target hole 也会被挡住。

**建议修复顺序**：P3，与 C09-4 一起决策。推荐先定义 `maskClosable` / spotlight 背景交互语义，再补测试。若保留穿透能力，应取消 `aria-modal` 并在文档说明 target step 不阻塞页面。

**目标验证命令**：`pnpm vitest run tests/react/Tour.spec.tsx tests/vue/Tour.spec.ts tests/core/tour-utils.spec.ts`。

---

#### C09-6 Tour 复用 `formWizard` locale 且 close label 硬编码 — **P3**

**发现问题**

- 🟢 P3｜Tour 的 Next / Previous / Finish 文案使用 `mergedLocale.formWizard`（React [Tour.tsx:61](../packages/react/src/components/Tour.tsx)、Vue [Tour.ts:84](../packages/vue/src/components/Tour.ts)），而组件本身不是 FormWizard。`TigerLocale` 也没有 `tour` 命名空间（[locale.ts:170](../packages/core/src/types/locale.ts)）。
- 🟢 P3｜close button aria-label 两端均硬编码 `"Close tour"`（React [Tour.tsx:190](../packages/react/src/components/Tour.tsx)、Vue [Tour.ts:251](../packages/vue/src/components/Tour.ts)），没有使用 `common.closeText` 或组件级 locale。用户只能覆盖 next/prev/finish，不能本地化 close label。

**公共内容决策**：新增 `TigerLocaleTour` 更清晰；短期也可兼容读取 `tour.*` 后回落到 `formWizard.*`，避免破坏已有使用。close label 可先回落 `common.closeText`。

**建议修复顺序**：P3。补 core locale 类型与 locale preset 字段、React/Vue Tour 文案解析和测试；generated references 由 `docs:api` 生成，不手改。

**目标验证命令**：`pnpm vitest run tests/react/Tour.spec.tsx tests/vue/Tour.spec.ts tests/core/i18n-locales.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C09-7 Progress 语义 attrs 分布不一致，role 落在内部图形节点 — **P3**

**发现问题**

- 🟢 P3｜Progress 的 `role="progressbar"` 与 aria value 属性挂在内部 fill/circle 节点；外层 wrapper 负责接收 `className` / `style` / 宽高（React [Progress.tsx:72](../packages/react/src/components/Progress.tsx)、[Progress.tsx:84](../packages/react/src/components/Progress.tsx)、[Progress.tsx:120](../packages/react/src/components/Progress.tsx)，Vue [Progress.ts:84](../packages/vue/src/components/Progress.ts)、[Progress.ts:111](../packages/vue/src/components/Progress.ts)、[Progress.ts:144](../packages/vue/src/components/Progress.ts)）。
- 🟢 P3｜React 会从 rest props 中摘出 `aria-label` / `aria-labelledby` / `aria-describedby` 后只放到内部 progressbar；Vue 则先 `...attrs` 到外层，再把相同 aria 字段放到内部 progressbar（[Progress.ts:87](../packages/vue/src/components/Progress.ts)、[Progress.ts:68](../packages/vue/src/components/Progress.ts)）。双端测试目前按内部 progressbar 断言，未覆盖 attrs 是否重复或 `id` / `aria-describedby` 指向外层时的使用体验。

**公共内容决策**：Progress 计算 helper（clamp、format、circle path、status variant）已正确沉 core；语义结构属于框架渲染层。建议统一为“外层根节点就是 progressbar，内部 fill/circle 只负责视觉”，或明确保持内部 progressbar 并确保 attrs 不重复。

**建议修复顺序**：P3。先补 a11y 结构测试，决定 role 所在节点；若迁移到外层 role，注意现有用户依赖 `querySelector('[role="progressbar"]')` 后取父节点的测试/用法可能变化，但公共 API 不变。

**目标验证命令**：`pnpm vitest run tests/react/Progress.spec.tsx tests/vue/Progress.spec.ts`、`pnpm types:check`。

---

#### C09 健康项

- ✅ Modal / Drawer 的视觉样式、尺寸、关闭按钮图标、触摸关闭方向、focus trap、focus restore 与 scroll lock 大体已对齐；纯判定和样式 helper 已在 core。
- ✅ Loading 的 SVG/点/柱动画配置、文本 class、animation style 注入已在 core，双端实现薄且测试覆盖 delay/fullscreen/lockScroll。
- ✅ Progress 的百分比 clamp、文本 format、circle path、status variant 已在 core，双端测试镜像完整。
- ✅ Drawer `destroyOnCloseAfterLeave` 双端已覆盖，动画后销毁路径稳定。
- ✅ Feedback references 当前能列出 C09 组件，未发现 C09 组件索引漏列。

---

#### C09 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| React Modal open callback observer（C09-1） | React open API 语义修正；不沉 core | **P2** |
| Modal `mask=false` 仍可外部点击关闭（C09-2） | 行为语义先定，框架层对齐或文档说明 | P3 |
| Loading 组件级 locale parity（C09-3） | 合入 core `LoadingProps` 或 React wrapper 对齐 Vue | **P2** |
| Tour overlay lifecycle（C09-4） | 复用现有 overlay helper，或取消 modal 语义 | **P2** |
| Tour spotlight mask 背景交互（C09-5） | Tour 行为策略；spotlight 几何 helper 保留 core | P3 |
| Tour locale namespace（C09-6） | 新增 `TigerLocaleTour`，兼容回落 formWizard/common | P3 |
| Progress role/attrs 结构（C09-7） | 框架层统一语义结构，计算 helper 继续留 core | P3 |
| Modal/Drawer/Loading/Progress core helper | 已在 core，保持 | - |

---

#### C09 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| React Modal `useEffect([open])` | 初始 closed 也会调用 `onClose`，初始 open 会调用 `onOpenChange(true)` | C09-1 |
| Vue Modal watcher / close action | 不 immediate；`update:open` 只在内部 action，`close` 在关闭过渡时发出 | C09-1 |
| Modal mask click 位置 | mask 只视觉；container click 执行 `shouldCloseOnMaskClick`，`mask=false` 仍有空白点击关闭区 | C09-2 |
| Drawer mask click 位置 | click handler 挂在 mask 节点；`mask=false` 后没有同类关闭区 | C09-2 |
| Loading locale props | Vue 有组件级 locale 并 merge；React 只读 ConfigProvider locale | C09-3 |
| Tour portal/Teleport | React/Vue Tour 直接 createPortal/Teleport，未接 overlay helper | C09-4 |
| Tour focus/Escape/scroll grep | Tour 未使用 `useEscapeKey` / `useFocusTrap` / `useBodyScrollLock` / `captureActiveElement` / `restoreFocus` | C09-4 |
| Tour spotlight style | target mask 使用 `pointerEvents: 'none'`；无 target mask 可点击关闭 | C09-5 |
| Tour locale grep | next/prev/finish 读取 `formWizard`，close aria-label 硬编码 `Close tour` | C09-6 |
| Progress aria 比对 | role/aria 在内部 fill/circle；Vue attrs 同时落外层和内部 | C09-7 |
| `corepack pnpm vitest run tests/react/Modal.spec.tsx tests/react/Drawer.spec.tsx tests/react/Loading.spec.tsx tests/react/Progress.spec.tsx tests/react/Tour.spec.tsx tests/vue/Modal.spec.ts tests/vue/Drawer.spec.ts tests/vue/Loading.spec.ts tests/vue/Progress.spec.ts tests/vue/Tour.spec.ts tests/core/tour-utils.spec.ts tests/core/overlay-utils.spec.ts tests/core/overlay-scroll-lock.spec.ts` | ✅ 13 个测试文件、243 个测试通过 | C09 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C09 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C09 基线 |

> 本轮 C09 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C09 阶段执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。

---

### C10 消息通知

**扫描范围**：Message / Notification / NotificationCenter 三个组件的 core 类型 [message.ts](../packages/core/src/types/message.ts)、[notification.ts](../packages/core/src/types/notification.ts)（NotificationCenter 的 `NotificationItem`/`NotificationGroup`/`NotificationCenterProps` 在 [composite.ts](../packages/core/src/types/composite.ts)），core 工具 [message-utils.ts](../packages/core/src/utils/message-utils.ts)、[notification-utils.ts](../packages/core/src/utils/notification-utils.ts)、[notification-center-utils.ts](../packages/core/src/utils/notification-center-utils.ts) 与共享 imperative helper [imperative-api.ts](../packages/core/src/utils/imperative-api.ts)，React/Vue 三组件实现、`packages/{react,vue}/src/index` 导出，tests/{core,react,vue} 8 个定向 spec，generated references（component-index.md、shared/props/feedback.md、shared/api-summary.md）。

**结论速览**：基础面健康——imperative API 公共管线（`normalizeStringOption`、`createInstanceCounter`、`ANIMATION_DURATION_MS`、`isBrowser`）、Notification 栈位更新调度器（`createNotificationStackUpdateScheduler`，rAF 批处理）、NotificationCenter 分组逻辑（`buildNotificationGroups`/`sortNotificationGroups`）、全部 class/颜色/图标常量均已沉 core 并双端共享、有 core spec；Notification 的 per-position 容器生命周期与 clear 双端对称、测试镜像；单例守卫在 DOM 被外部清空时复位 root，未发现严格模式重复容器节点。**无 P1**。发现集中在 2 条 **P2**（Message `position` 公共字段被 imperative API 静默忽略、与 Notification 不对称；Message/Notification 双端四实现各自手写近乎相同的 imperative 栈簿记，「该合未合」、合并决策延后 H）+ 5 条 P3（定时器/队列清理、Message 空容器不销毁、NotificationCenter 死代码、硬编码中文默认文案重复、一组首渲染/回退/动画/命名/属性写法的 parity 清理）。

---

#### C10-1 Message `position` 被 imperative API 静默忽略，与 Notification 不对称 — **P2**

**发现问题**

- 🟠 P2｜公共 `MessageProps`（[message.ts:108](../packages/core/src/types/message.ts)）与 imperative 入参 `MessageConfig` 都带 `position?: MessagePosition`，`messagePositionClasses` 提供 6 个方位（[message-utils.ts:23](../packages/core/src/utils/message-utils.ts)），feedback.md 把 Message 记作 `3/7 props`。但 React `addMessage` 只把 `{id,type,content,duration,closable,onClose,icon,className}` 写入实例，**从不读 `config.position`**（[Message.tsx:199](../packages/react/src/components/Message.tsx)），单例容器恒以默认 `'top'` 渲染（[Message.tsx:128](../packages/react/src/components/Message.tsx)、`containerRoot?.render(<MessageContainer />)` 无 position [Message.tsx:191](../packages/react/src/components/Message.tsx)）。
- 🟠 P2｜Vue 同型：`addMessage` 不读 position（[Message.ts:201](../packages/vue/src/components/Message.ts)），`ensureContainer` 用 `createApp(MessageContainer)` 不传 props（[Message.ts:194](../packages/vue/src/components/Message.ts)），容器 `position` prop 默认 `'top'`（[Message.ts:76](../packages/vue/src/components/Message.ts)）。因此 `Message.info({ content, position: 'bottom-right' })` 双端都被静默落到 `'top'`。
- 🟠 P2｜Notification 则真正按 position 分区建容器（[Notification.tsx:271](../packages/react/src/components/Notification.tsx)、[Notification.ts:300](../packages/vue/src/components/Notification.ts)），有测试锁定（`respects position by creating a container per position`，[tests/react/Notification.spec.tsx:84](../tests/react/Notification.spec.tsx)、[tests/vue/Notification.spec.ts:73](../tests/vue/Notification.spec.ts)）。Message 双端均无任何 position 测试。

**公共内容决策**：属框架层 imperative API 语义修正，不新增 core 逻辑。两条路线二选一：① Message imperative API 真正支持 position（与 Notification 对齐，可顺势复用 C10-2 的共享 controller，按方位分容器）；② 把 `position` 从 `MessageProps`/`MessageConfig` 标 `@deprecated` 并精简 `messagePositionClasses`。涉及 public type 时走 baseline。

**建议修复顺序**：P2。先定产品语义（Message 是否需要多方位）；落地前补「`Message.x({position})` 渲染到对应容器」或「position 已弃用」的双端测试，再改实现或类型。

**目标验证命令**：`pnpm vitest run tests/react/Message.spec.tsx tests/vue/Message.spec.ts`、`pnpm api:validate`、`pnpm types:check`，涉及 public type 追加 `pnpm api:baseline:check`。

---

#### C10-2 Message 与 Notification 双端各自手写近乎相同的 imperative 栈簿记（该合未合，决策延后 H）— **P2**

**发现问题**

- 🟠 P2｜四份实现（React/Vue × Message/Notification）重复同一套簿记骨架：实例存储、单调 id（都用 core `createInstanceCounter`）、`ensureContainer`/`destroyContainer`、`addX`/`removeX`/`clearAll`、自动关闭 `setTimeout`、DOM 被外部清空时复位 root。Message 用单一扁平数组 + 单例容器（[Message.tsx:37](../packages/react/src/components/Message.tsx)），Notification 多一层 per-position 分区 + rAF 调度器（[Notification.tsx:37](../packages/react/src/components/Notification.tsx)），其余结构高度同形。
- 🟠 P2｜纯簿记（实例表、id、定时器跟踪、clear、按 key 分区）与框架无关，目前在 4 个文件各写一遍；只有 render + root 挂载（createRoot/createApp、flushSync/Teleport）才是真正框架层。属典型「该合未合」。

**公共内容决策**：候选抽取 core 框架无关的「imperative stack controller」（管理 instances-by-key、id、timer、ensure/destroy 回调、clear），框架仅注入「挂载/卸载容器」与「触发重渲染」。与 C10-1 的 position 决策强耦合（Message 是否也要 per-key 分区）。**合并决策延后任务 H**——届时 Message + Notification 双端四实现同时在视野，参照 C07-2/C08 的延后处理。本组不单独动。

**建议修复顺序**：P2，记录待 H 取舍；非 C10 单独行动项。

**目标验证命令**：（决策项，无新增测试）届时 `pnpm vitest run tests/react/Message.spec.tsx tests/react/Notification.spec.tsx tests/vue/Message.spec.ts tests/vue/Notification.spec.ts tests/core/notification-utils.spec.ts`。

---

#### C10-3 自动关闭定时器未跟踪、手动关闭/clear 不清除 — **P3**

**发现问题**

- 🟢 P3｜`addX` 里 `setTimeout(() => removeX(id), duration)` 的 handle 被丢弃，未存入实例也无从清除（[Message.tsx:228](../packages/react/src/components/Message.tsx)、[Notification.tsx:295](../packages/react/src/components/Notification.tsx)、[Message.ts:221](../packages/vue/src/components/Message.ts)、[Notification.ts:325](../packages/vue/src/components/Notification.ts)）。
- 🟢 P3｜手动 close（关闭按钮 / 返回的 close fn）与 `clear()` 只移除实例，不取消定时器；定时器仍到点触发 `removeX(id)`，但 `findIndex` 已命中不到该 id 故为 no-op。因 id 由 `createInstanceCounter` 单调自增、永不复用，**不会误删后续实例，当前 benign**。
- 🟢 P3｜但这正是 C10 重点「定时器/队列清理」：`clear()` 后仍可能残留悬挂定时器，fake-timer 测试中 `advanceTimersByTime` 会触发这些已无效的回调；现有测试未断言「手动关闭/clear 应清除待触发定时器」。

**公共内容决策**：定时器跟踪属框架层簿记（或并入 C10-2 的共享 controller）。建议把每实例 timer handle 存入实例/Map，`removeX`/`clearAll` 时 `clearTimeout`。无需新增 core 纯逻辑。

**建议修复顺序**：P3。可与 C10-2 一并处理；先补「手动关闭后推进定时器不应二次触发 / 不留悬挂回调」的双端测试。

**目标验证命令**：`pnpm vitest run tests/react/Message.spec.tsx tests/react/Notification.spec.tsx tests/vue/Message.spec.ts tests/vue/Notification.spec.ts`。

---

#### C10-4 Message 空时不销毁全局容器，与 Notification 清空即销毁不一致 — **P3**

**发现问题**

- 🟢 P3｜Message `removeMessage` 在队列清空后不销毁容器（[Message.tsx:241](../packages/react/src/components/Message.tsx)、[Message.ts:234](../packages/vue/src/components/Message.ts)）；空的 `#tiger-message-container-root` 与已挂载的 React root / Vue app 常驻 `document.body`，直到显式 `Message.clear()` 才 unmount 并移除节点（[Message.tsx:271](../packages/react/src/components/Message.tsx)、[Message.ts:248](../packages/vue/src/components/Message.ts)）。
- 🟢 P3｜Notification 相反：某 position 队列清空即 `destroyContainer`（unmount + 移除节点 + 取消调度）（[Notification.tsx:321](../packages/react/src/components/Notification.tsx)、[Notification.ts:351](../packages/vue/src/components/Notification.ts)）。两个同类全局容器组件生命周期策略不一致；Message 留一个空容器节点（非重复节点，单例守卫避免重复创建）。

**公共内容决策**：属框架层容器生命周期策略。二选一并双端统一：① Message 跟随 Notification，空时 `destroyContainer`；② 明确「Message 单例容器有意常驻以省去频繁重建」并文档说明。无 core 改动。

**建议修复顺序**：P3，与 C10-2 一起决定（共享 controller 可统一容器生命周期）。

**目标验证命令**：`pnpm vitest run tests/react/Message.spec.tsx tests/vue/Message.spec.ts`。

---

#### C10-5 NotificationCenter `_currentGroup` 计算属性双端死代码 — **P3**

**发现问题**

- 🟢 P3｜React `const _currentGroup = useMemo(...)`（[NotificationCenter.tsx:93](../packages/react/src/components/NotificationCenter.tsx)）与 Vue `const _currentGroup = computed(...)`（[NotificationCenter.ts:170](../packages/vue/src/components/NotificationCenter.ts)）声明后从未被读取——下划线前缀即标记其闲置；实际使用的是带读态覆盖的 `effectiveCurrentGroup`。属纯死代码，连同其 memo/computed 计算开销可安全删除。

**公共内容决策**：双端删除即可，不涉及 core 或公共 API。

**建议修复顺序**：P3，独立小清理。

**目标验证命令**：`pnpm vitest run tests/react/NotificationCenter.spec.tsx tests/vue/NotificationCenter.spec.ts`、`pnpm types:check`。

---

#### C10-6 NotificationCenter 默认文案硬编码中文且双端重复 — **P3**

**发现问题**

- 🟢 P3｜9 条界面默认串（`加载中...`、`暂无通知`、`通知中心`、`全部`、`未读`、`已读`、`全部标记已读`、`标记已读`、`标记未读`）作为 props 默认值在两端各写一份（[NotificationCenter.tsx:44](../packages/react/src/components/NotificationCenter.tsx)、[NotificationCenter.ts:74](../packages/vue/src/components/NotificationCenter.ts)）。
- 🟢 P3｜这与库内其它组件「英文默认 + `TigerLocale` 覆盖」方向不一致（同组 Message/Notification 的 aria-label 用英文 `Close message`/`Close notification`）；默认值重复且无法经 ConfigProvider locale 本地化。

**公共内容决策**：默认文案可沉到 core 共享常量或 `TigerLocale` 的 notificationCenter 命名空间（候选），双端从同一来源读取；渲染留框架层。属「该合未合 / i18n 一致性」。

**建议修复顺序**：P3。若新增 locale 命名空间需改 core 类型与 preset、刷新 baseline、由 `docs:api` 生成 references（不手改）。

**目标验证命令**：`pnpm vitest run tests/react/NotificationCenter.spec.tsx tests/vue/NotificationCenter.spec.ts`，涉及 core locale 追加 `pnpm api:validate`、`pnpm types:check`。

---

#### C10-7 一组双端 parity / 清理项（合并） — **P3**

**发现问题**

- 🟢 P3｜① React 首渲染策略不一致：Message 用 `flushSync` 包裹容器渲染（[Message.tsx:191](../packages/react/src/components/Message.tsx)），Notification 用普通 `.render()` 并依赖容器 mount effect 的初次同步（[Notification.tsx:246](../packages/react/src/components/Notification.tsx)、[Notification.tsx:179](../packages/react/src/components/Notification.tsx)）；两者都能工作但机制不同。
- 🟢 P3｜② core 回退不对称：`getNotificationTypeClasses`/`getNotificationIconPath` 带 `|| info` 兜底（[notification-utils.ts:93](../packages/core/src/utils/notification-utils.ts)、[notification-utils.ts:110](../packages/core/src/utils/notification-utils.ts)），`getMessageTypeClasses`/`getMessageIconPath` 无（[message-utils.ts:91](../packages/core/src/utils/message-utils.ts)、[message-utils.ts:110](../packages/core/src/utils/message-utils.ts)）；两个 type 都是严格联合，要么 notification 侧兜底冗余、要么 message 侧缺一致兜底。
- 🟢 P3｜③ 自动关闭路径跳过退出动画：手动 close 先 `setIsVisible(false)` 再延时移除（React）/ 经 TransitionGroup（Vue），自动关闭直接 `removeX(id)`，无退出过渡。
- 🟢 P3｜④ imperative 导出命名 `Message`（大写）vs `notification`（小写）双端一致但彼此不一致（[index.tsx:201](../packages/react/src/index.tsx)、[index.ts:170](../packages/vue/src/index.ts)）；改名属 breaking，倾向保留 + 文档说明。
- 🟢 P3｜⑤ data 属性写法不一：React Message 用裸 `data-tiger-message`（渲染为 `="true"`）、Notification 用显式 `data-tiger-notification=""`；选择器多按「属性存在」匹配故无 bug，但约定不统一。

**公共内容决策**：均为框架层一致性/清理；纯逻辑已在 core，无需新增 core。回退不对称（②）若统一，应在 core 两侧取齐。

**建议修复顺序**：P3，低优先批量清理；先决定回退/动画/命名是否统一，再补少量断言。

**目标验证命令**：`pnpm vitest run tests/react/Message.spec.tsx tests/react/Notification.spec.tsx tests/vue/Message.spec.ts tests/vue/Notification.spec.ts`、`pnpm types:check`。

---

#### C10 健康项

- ✅ imperative API 公共管线 `normalizeStringOption` / `createInstanceCounter`（[imperative-api.ts:10](../packages/core/src/utils/imperative-api.ts)、[imperative-api.ts:29](../packages/core/src/utils/imperative-api.ts)）、`ANIMATION_DURATION_MS`（[animation.ts:310](../packages/core/src/utils/animation.ts)）、`isBrowser`（[env.ts:1](../packages/core/src/utils/env.ts)）已沉 core，双端共享。
- ✅ `createNotificationStackUpdateScheduler`（[notification-utils.ts:187](../packages/core/src/utils/notification-utils.ts)，rAF 批处理、多 position 合帧、cancel）在 core，有 core spec（[notification-utils.spec.ts](../tests/core/notification-utils.spec.ts)）双端同构消费。
- ✅ `buildNotificationGroups`/`sortNotificationGroups`（[notification-center-utils.ts](../packages/core/src/utils/notification-center-utils.ts)）在 core，有 core spec（[notification-center-utils.spec.ts](../tests/core/notification-center-utils.spec.ts)）双端共享。
- ✅ 全部 message/notification class/颜色/图标常量在 core-utils；NotificationCenter 双端结构（分组、读态过滤、`manageReadState` 覆盖、mark-all-read、Tabs/List）对称，测试镜像。
- ✅ 单例守卫在 DOM 被外部清空（测试 `innerHTML=''`）时自动复位 root（[Message.tsx:174](../packages/react/src/components/Message.tsx)、[Notification.tsx:227](../packages/react/src/components/Notification.tsx)、[Message.ts:179](../packages/vue/src/components/Message.ts)、[Notification.ts:260](../packages/vue/src/components/Notification.ts)），避免悬挂 root 并使 React StrictMode/测试重置安全——未发现严格模式重复容器节点。
- ✅ Feedback references 当前能列出 Message/Notification/NotificationCenter，未发现 C10 组件索引漏列。

---

#### C10 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Message position 被忽略（C10-1） | 框架层落实 position 或弃用字段；走 baseline | **P2** |
| imperative 栈簿记四实现重复（C10-2） | 候选抽 core 框架无关 controller；决策延后 H | **P2** |
| 自动关闭定时器未清（C10-3） | 框架层跟踪并 clearTimeout（或并入 C10-2） | P3 |
| Message 空容器不销毁（C10-4） | 双端统一生命周期或文档说明 | P3 |
| NotificationCenter `_currentGroup` 死代码（C10-5） | 双端删除 | P3 |
| NotificationCenter 中文默认重复（C10-6） | 沉 core 常量/locale（候选） | P3 |
| 一组 parity/清理（C10-7） | 框架层统一，core 无改动 | P3 |
| imperative helper / scheduler / 分组 / class 常量已在 core | 已在 core，保持 | - |

---

#### C10 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| React/Vue addMessage 入参 | 不读 `config.position`；单例容器恒 `top` | C10-1 |
| Notification addNotification | 按 position 分容器，有双端测试锁定 | C10-1 |
| 四实现结构比对 | instances/id/ensure-destroy/add-remove-clear/timeout 同形重复 | C10-2 |
| 自动关闭 setTimeout handle | 丢弃、不清除；id 单调故触发时 no-op、benign | C10-3 |
| removeMessage vs removeNotification 空队列 | Message 不销毁容器；Notification `destroyContainer` | C10-4 |
| grep `_currentGroup` | 仅声明、双端无读取点 | C10-5 |
| NotificationCenter props 默认 | 9 条中文默认双端各写一份 | C10-6 |
| flushSync / 回退 / 动画 / 命名 / data-attr 比对 | 五处双端或组件间不一致 | C10-7 |
| grep imperative helper 消费 | `normalizeStringOption`/`createInstanceCounter`/`ANIMATION_DURATION_MS`/`isBrowser` 双端共享 | 健康项 |
| `corepack pnpm vitest run tests/react/Message.spec.tsx tests/react/Notification.spec.tsx tests/react/NotificationCenter.spec.tsx tests/vue/Message.spec.ts tests/vue/Notification.spec.ts tests/vue/NotificationCenter.spec.ts tests/core/notification-utils.spec.ts tests/core/notification-center-utils.spec.ts` | ✅ 8 个测试文件、112 个测试通过 | C10 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C10 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C10 基线 |

> 本轮 C10 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C10 阶段只执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。

---

### C11 Form 单组

**扫描范围**：Form / FormItem / useFormController 三者的 core 类型 [form.ts](../packages/core/src/types/form.ts)，core 工具 [form-validation.ts](../packages/core/src/utils/form-validation.ts)、[form-dependency-utils.ts](../packages/core/src/utils/form-dependency-utils.ts)、[form-item-styles.ts](../packages/core/src/utils/form-item-styles.ts)、[form-history-utils.ts](../packages/core/src/utils/form-history-utils.ts)，React 实现 [Form.tsx](../packages/react/src/components/Form.tsx)、[FormItem.tsx](../packages/react/src/components/FormItem.tsx)、[useFormController.ts](../packages/react/src/hooks/useFormController.ts)，Vue 实现 [Form.ts](../packages/vue/src/components/Form.ts)、[FormItem.ts](../packages/vue/src/components/FormItem.ts)、[useFormController.ts](../packages/vue/src/composables/useFormController.ts)，tests/{core,react,vue} 8 个定向 spec，generated references（component-index.md、shared/props/form.md、shared/api-summary.md、examples/form.md）。**FormWizard 属 C30，本组排除**（form-wizard-utils 同排除）。

**结论速览**：纯逻辑沉降良好——校验（form-validation）、条件 DSL/依赖图（form-dependency-utils）、撤销/重做历史（form-history-utils）、表单项样式（form-item-styles，token 化 class）全在 core，双端共享并各有 core spec；防抖器 setTimer/clearTimer 可注入；i18n（`mergeTigerLocale`+`getFormValidationLabels`）与 a11y（label for、aria-invalid/required/describedby、`role=alert`/`role=group`）双端镜像；`FormController` 类型 core 统一、React hook/Vue composable 同构。**无 P1**。发现集中在 **3 条 P2**（① React 维护无人读取的 `formValues` 影子状态 + `updateValue` 上下文方法，与 Vue 单一数据源不对称；② `resetFields` 不重置字段值仅清错误，与方法名/常规语义不符且双端实现不一致；③ `addField/removeField/undo/redo` 的受控数据流双端契约不一致——C11 重点「受控/非受控」核心）+ 3 条 P3（core 表单工具公开面偏宽且与组件 hand-rolled 重复、点路径不支持数组段、一组低优先观察）。多数公共拆合判断指向「双端契约统一 / 公开面精简」，且因涉及公开类型而**延后任务 H**。

---

#### C11-1 React Form 维护无人读取的 `formValues` 影子状态 + `updateValue` 上下文方法（冗余受控层 / 双端不对称）— **P2**

**发现问题**

- 🟠 P2｜React Form 有内部 `formValues` useState（[Form.tsx:202](../packages/react/src/components/Form.tsx)）、`setFormValues(model)` 同步 effect（[Form.tsx:215](../packages/react/src/components/Form.tsx)）、`updateValue`（[Form.tsx:516](../packages/react/src/components/Form.tsx)），并把 `model: formValues` 与 `updateValue` 放进 `FormContextValue`（[Form.tsx:642](../packages/react/src/components/Form.tsx)）。但校验/条件求值读的是 `formValuesRef.current`，而该 ref 在**每次渲染被无条件重置为 `model` prop**（[Form.tsx:227](../packages/react/src/components/Form.tsx)）。
- 🟠 P2｜grep 取证：`useFormContext` 消费者只有 [FormItem.tsx](../packages/react/src/components/FormItem.tsx) 与 index re-export；FormItem **从不读 `context.model`、从不调用 `context.updateValue`**（`formContext.model` / `formContext.updateValue` 消费端 0 命中）。即 `context.model`（影子 state）与 `context.updateValue` 被 provide 却无人消费——相对实际数据流是冗余受控层。
- 🟠 P2｜Vue 端 FormContext 既无 `updateValue`，`context.model` 直接是 `props.model`（[Form.ts:552](../packages/vue/src/components/Form.ts)，单一数据源，无影子 state）。文档用法（[examples/form.md](../skills/tigercat/references/examples/form.md) 行 17）也是消费者把每个 Input 的 value/onChange（React）或 v-model（Vue）直接绑到自有 model，不经 Form 的 updateValue。

**公共内容决策**：`FormContextValue.model` / `updateValue` 是 React 包公开类型（`FormContextValue`、`useFormContext` 均公开），删除属 breaking。记为「该简化未简化 / 双端不对称」：候选方向是 React 也以 `model` prop 为单一数据源、移除影子 `formValues` + `updateValue`（或反向把它做成有文档的受控写入口，并让 Vue 对齐）。涉及公开类型与受控语义，**延后任务 H** 统一取舍；本组不动。

**建议修复顺序**：P2，记录待 H；非本组单独行动项。

**目标验证命令**：（决策项）届时 `corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`，涉及公开类型追加 `corepack pnpm api:baseline:check`。

---

#### C11-2 `resetFields` 不重置字段值、仅清校验错误，且与方法名常规语义不符、双端实现不一致 — **P2**

**发现问题**

- 🟠 P2｜React `resetFields` = `clearValidate()` + `setFormValues(model)`（[Form.tsx:486](../packages/react/src/components/Form.tsx)）；受控用法下 `model` 即当前值，`setFormValues(model)` ≈ 无值变化（且只改无人读取的影子 state，见 C11-1）。
- 🟠 P2｜Vue `resetFields` = `validationDebouncer.cancel()` + `clearValidate()`（[Form.ts:481](../packages/vue/src/components/Form.ts)），**完全不碰字段值**。
- 🟠 P2｜两端测试都只断言「清除校验错误」（[tests/react/Form.spec.tsx:975](../tests/react/Form.spec.tsx)、[tests/vue/Form.spec.ts:1441](../tests/vue/Form.spec.ts) 标题均为 `resetFields clears validation errors`），未断言值被重置。
- 🟠 P2｜Form 不存初始值（只有 `useFormController` 用 `initialRef`/`initialValues` 存了快照、其 `reset()` 能恢复初值——[useFormController.ts:51](../packages/react/src/hooks/useFormController.ts)、[useFormController.ts:131](../packages/vue/src/composables/useFormController.ts)）；故两端 `resetFields` 都无法恢复初值，而方法名 `resetFields` 易被理解为「重置字段值 + 清校验」（Element Plus 语义）。

**公共内容决策**：属框架层语义对齐，纯逻辑无需新增 core。二选一并双端统一：① 明确「`resetFields` 仅清校验」并改文档/或考虑改名（如 `clearValidate` 别名）；② 真正支持「重置值到初始」——需双端存初始快照（参照 useFormController 的 initialRef），并补值重置测试。

**建议修复顺序**：P2。先定语义，再双端对齐实现与测试。

**目标验证命令**：`corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`、`corepack pnpm types:check`。

---

#### C11-3 `addField`/`removeField`/`undo`/`redo` 的受控数据流双端契约不一致（受控/非受控）— **P2**

**发现问题**

- 🟠 P2｜React：`addField`/`removeField`（[Form.tsx:491](../packages/react/src/components/Form.tsx)）与 `undo`/`redo`（[Form.tsx:572](../packages/react/src/components/Form.tsx)）走 `setFormValues` + `onChange(next)` 通知父级，**不改 `model`**；影子 state 在 `model` 引用变化时被 effect 重置，且校验读 `formValuesRef.current`（=`model`）看不到这些变更（见 C11-1）。
- 🟠 P2｜Vue：`addField`/`removeField`（[Form.ts:486](../packages/vue/src/components/Form.ts)）与 `undo`/`redo`（[Form.ts:517](../packages/vue/src/components/Form.ts)）**直接就地突变 `props.model`**（`delete` / 赋值 / `Object.assign`），**不 emit 任何事件**。
- 🟠 P2｜取证：React 测试断言 `onChange` 被调用并带新增/移除后的对象（[tests/react/Form.spec.tsx:1463](../tests/react/Form.spec.tsx)、[:1480](../tests/react/Form.spec.tsx)）；Vue 测试断言 `model.age===25` / `model.email===undefined`（[tests/vue/Form.spec.ts:2136](../tests/vue/Form.spec.ts)、[:2166](../tests/vue/Form.spec.ts)）。即同名命令集成契约不同：React「内部 state + onChange 回传」，Vue「直接突变共享 reactive model + 无事件」。

**公共内容决策**：纯逻辑（`createFormHistory`/`pushFormHistory`/`undoFormHistory`/`redoFormHistory`）已在 core 且双端共享；差异在框架层数据所有权模型。与 C11-1 同根——React 影子 state vs Vue 直接突变 model。建议随 C11-1 一并在任务 H 决定统一契约（如双端都以 model 为单一数据源 + 统一变更事件），并补「addField/undo 后值与校验一致」的双端断言。

**建议修复顺序**：P2，与 C11-1 合并决策，延后 H。

**目标验证命令**：（决策项）届时 `corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`。

---

#### C11-4 core 表单工具公开面偏宽：多个 helper 仅测试消费 + 与组件 hand-rolled 重复 — **P3**

**发现问题**

- 🟢 P3｜以下 core 公开导出**无生产消费者，仅被单元测试引用**（grep packages/{react,vue}/src + examples 生产代码 0 命中；nuxt `.output` 为构建产物不计）：`validateFormFields`、`getFieldError`、`getErrorFields`、`getFieldDependencies`、`getValidationOrder`、`resolveFormConditionState`、`createFormValidationRule`、`FORM_VALIDATION_PRESETS`。
- 🟢 P3｜`validateFormFields`（[form-validation.ts:461](../packages/core/src/utils/form-validation.ts)，含 `Array.from(new Set(...))` dedupe）功能上等价于 React/Vue Form 各自 hand-roll 的 `validateFields`（[Form.tsx:437](../packages/react/src/components/Form.tsx)、[Form.ts:427](../packages/vue/src/components/Form.ts)），但**两端都没用它**（该用未用 + 重复实现）；React inline 版迭代原始 `fieldNames` 不 dedupe，与 core 版口径不一。
- 🟢 P3｜`getValidationOrder`（拓扑序，[form-dependency-utils.ts:54](../packages/core/src/utils/form-dependency-utils.ts)）**从未用于排序校验**：`validateForm` 按 `Object.entries(rules)` 插入序执行（[form-validation.ts:443](../packages/core/src/utils/form-validation.ts)），依赖只驱动 `getDependentFields` 的「再校验触发」，不影响顺序 → 拓扑序 helper 实为死路径。`resolveFormConditionState` 被组件以 `resolveFormFieldConditionState`（合并 conditions 后）替代。
- 🟢 P3｜公开 headless API `useFormController`/`FormController` **无 generated reference 覆盖**（[shared/props/form.md](../skills/tigercat/references/shared/props/form.md) 只列组件 Props，[api-summary.md](../skills/tigercat/references/shared/api-summary.md) form.ts 行只列 `FormProps, FormItemProps`），文档缺口。

**公共内容决策**：与 B-5「core utils 兼容 barrel 公开面过宽」同源。均为 core 公开导出，删除属 breaking → 两条路线：① 作为面向消费者的公开工具保留并补文档（含 useFormController reference）；② 对确认无用者（如 `getValidationOrder`/`resolveFormConditionState`）标 `@deprecated` 并走 baseline。本组只记录，统一并入 B-5/任务 H。

**建议修复顺序**：P3，随 B-5 一并处理。

**目标验证命令**：`corepack pnpm api:validate`、`corepack pnpm types:check`，标 deprecated 时追加 `corepack pnpm api:baseline:check`。

---

#### C11-5 `getValueByPath` / `setValueByPath` 不支持数组路径段（嵌套数组字段受限）— **P3**

**发现问题**

- 🟢 P3｜`getValueByPath` 遇到数组即返回 undefined：`if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined`（[form-validation.ts:59](../packages/core/src/utils/form-validation.ts)）→ 形如 `items.0.name` 的点路径取不到值。
- 🟢 P3｜React `updateValue` 内联 `setValueByPath`（[Form.tsx:544](../packages/react/src/components/Form.tsx)）中间段只创建普通对象、不创建数组，写嵌套数组路径同样不可行。校验读路径用同一个 `getValueByPath` → 嵌套数组字段无法按点路径校验。可能是有意（表单偏扁平），但与类型注释「Supports dotted paths」（[form.ts:138](../packages/core/src/types/form.ts)）承诺有出入。
- 🟢 P3｜注：Vue 端无 `setValueByPath`（直接突变 model），故这是「React 写路径 + 双端读路径（core）」的共同限制。

**公共内容决策**：若要支持数组段，写/读路径解析应统一沉到 core 一个 `getValueByPath`/`setValueByPath` 对（当前 set 只在 React 内联），双端共享；否则在类型注释明确「仅对象点路径」。属能力边界说明。

**建议修复顺序**：P3，低优先；先文档澄清，必要时再扩展并补 core spec。

**目标验证命令**：`corepack pnpm vitest run tests/core/form-validation.spec.ts`、`corepack pnpm types:check`。

---

#### C11-6 一组低优先观察（合并）— **P3**

**发现问题**

- 🟢 P3｜① `isEmpty`（[form-validation.ts:200](../packages/core/src/utils/form-validation.ts)）不把纯空白串视为空：`required` + 空格串会通过 required 校验（除非规则配 `transform: (v)=>v.trim()`）；常见表单期望先 trim。属行为说明。
- 🟢 P3｜② `validateType` 的 `number` 分支 `typeof value !== 'number' && isNaN(Number(value))`——字符串数字（如 `'12'`）按 number 通过，而 `boolean`/`array`/`object` 走严格 `typeof`（[form-validation.ts:229](../packages/core/src/utils/form-validation.ts)）；type 宽严不一，文档可说明。
- 🟢 P3｜③ undo 历史不克隆 `present`：`undoFormHistory` 直接 `present: previous`（[form-history-utils.ts:65](../packages/core/src/utils/form-history-utils.ts)），而 `pushFormHistory`/`redoFormHistory` 用 `{ ...newValues }` 克隆（[:49](../packages/core/src/utils/form-history-utils.ts)、[:83](../packages/core/src/utils/form-history-utils.ts)）；因 past 条目本就是历史快照、当前 benign，但不对称。
- 🟢 P3｜④ `form-item-styles` 仅 3 个测试 / 21 行覆盖（[tests/core/form-item-styles.spec.ts](../tests/core/form-item-styles.spec.ts)）偏弱，但样式逻辑简单、风险低。

**公共内容决策**：均为 core 纯逻辑的行为/一致性说明，无需新增 core 或改公共 API；如统一行为（trim、type 宽严、克隆）应在 core 两侧取齐并补少量断言。

**建议修复顺序**：P3，低优先批量清理。

**目标验证命令**：`corepack pnpm vitest run tests/core/form-validation.spec.ts tests/core/form-history-utils.spec.ts tests/core/form-item-styles.spec.ts`。

---

#### C11 健康项

- ✅ 校验 / 条件 DSL / 依赖图 / 历史 / 表单项样式 纯逻辑全在 core（[form-validation.ts](../packages/core/src/utils/form-validation.ts)、[form-dependency-utils.ts](../packages/core/src/utils/form-dependency-utils.ts)、[form-history-utils.ts](../packages/core/src/utils/form-history-utils.ts)、[form-item-styles.ts](../packages/core/src/utils/form-item-styles.ts)），双端共享，各有 core spec；`form-item-styles` 用 token 化 class（`text-[var(--tiger-text,#111827)]`/`var(--tiger-error,#ef4444)`），无裸主题色。
- ✅ 防抖器 `createFormValidationDebouncer`（[form-validation.ts:102](../packages/core/src/utils/form-validation.ts)）在 core，`setTimer`/`clearTimer` 可注入（测试友好）；React 用 ref + 重建 effect（[Form.tsx:219](../packages/react/src/components/Form.tsx)）、Vue 用 watch 重建（[Form.ts:499](../packages/vue/src/components/Form.ts)），卸载/依赖变更时 `cancel`。
- ✅ i18n 双端一致：`mergeTigerLocale` + `getFormValidationLabels`（ConfigProvider locale + prop `locale` + 每规则 `message` 优先）双端同构接入（[Form.tsx:197](../packages/react/src/components/Form.tsx)、[Form.ts:226](../packages/vue/src/components/Form.ts)），校验默认消息走 locale。
- ✅ a11y 双端镜像：label `for`/`htmlFor` 绑定字段 id、`aria-invalid`/`aria-required`、`aria-describedby`（`mergeAriaDescribedBy` 去重合并）、错误容器 `role="alert"`、field wrapper `role="group"`+`aria-labelledby`（[FormItem.tsx](../packages/react/src/components/FormItem.tsx)、[FormItem.ts](../packages/vue/src/components/FormItem.ts)）。
- ✅ FormItem「错误状态未变则不触发更新」优化两端镜像（React `setErrors` 返回同引用 [FormItem 源同款逻辑 Form.tsx:366](../packages/react/src/components/Form.tsx)、Vue 比较后跳过 splice [Form.ts:364](../packages/vue/src/components/Form.ts)），并据此只对真正新出现的错误触发 shake。
- ✅ `FormController` 类型在 core 统一（[form.ts:415](../packages/core/src/types/form.ts)），React hook（[useFormController.ts](../packages/react/src/hooks/useFormController.ts)）/ Vue composable（[useFormController.ts](../packages/vue/src/composables/useFormController.ts)）同构实现，且 `reset()` 正确恢复 `initialValues`（与 Form 的 resetFields 形成对照，见 C11-2）。
- ✅ 单文件多导出（Form/FormItem 同源 form.ts）双端 Props 类型齐全，`types:check` 通过（FormItem 作为 `${prefix}FormItemProps` 走文件名校验覆盖）。

---

#### C11 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| React 影子 `formValues` + `updateValue` 无人读、与 Vue 不对称（C11-1） | 统一以 model 为单一数据源 / 精简上下文；公开类型走 baseline；延后 H | **P2** |
| `resetFields` 不重置值、双端不一致（C11-2） | 双端统一语义（仅清校验或真重置到初值） | **P2** |
| addField/removeField/undo/redo 受控契约双端不一致（C11-3） | 随 C11-1 统一框架层数据所有权；延后 H | **P2** |
| core 表单工具公开面偏宽 + 与组件 hand-rolled 重复（C11-4） | 并入 B-5：保留并补文档 或 标 deprecated；useFormController 补 reference | P3 |
| 点路径不支持数组段（C11-5） | 文档澄清「仅对象点路径」或统一 core get/set 路径并扩展 | P3 |
| 一组低优先观察（C11-6） | core 行为/一致性说明，按需取齐 | P3 |
| 校验/DSL/依赖/历史/样式/防抖/i18n/a11y/FormController 已在 core 双端共享 | 已在 core，保持 | - |

---

#### C11 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `useFormContext` 消费者 + `formContext.model`/`.updateValue` 读取点 | 仅 FormItem/index；FormItem 不读 model、不调 updateValue（0 命中） | C11-1 |
| React vs Vue resetFields 实现 + 两端测试标题 | React clearValidate+setFormValues(model)、Vue 仅 clearValidate；测试均只断言清错误 | C11-2 |
| React vs Vue addField/removeField/undo/redo + 测试断言 | React onChange 通知不改 model；Vue 直接突变 props.model 无事件 | C11-3 |
| grep 8 个 core helper 的生产消费者 | 0 生产命中（仅测试 + nuxt 构建产物）；validateFormFields 与组件 validateFields 重复 | C11-4 |
| `getValueByPath` 数组分支 + React `setValueByPath` 中间段 | 数组返回 undefined；中间段只建对象 → 嵌套数组点路径不支持 | C11-5 |
| `isEmpty`/`validateType` number/undo present 克隆/form-item-styles 测试数 | 空白串非空、字符串数字通过、undo 不克隆、3 测试 | C11-6 |
| `corepack pnpm vitest run tests/core/form-validation.spec.ts tests/core/form-dependency-utils.spec.ts tests/core/form-history-utils.spec.ts tests/core/form-item-styles.spec.ts tests/react/Form.spec.tsx tests/react/useFormController.spec.tsx tests/vue/Form.spec.ts tests/vue/useFormController.spec.ts` | ✅ 8 个测试文件、248 个测试通过 | C11 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C11 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C11 基线 |

> 本轮 C11 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C11 阶段只执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。FormWizard（C30）不在本组范围。

---

### C12 输入基础组

**扫描范围**：Input / Textarea / InputGroup / InputGroupAddon / InputNumber / NumberKeyboard / Mentions 七个组件的 core 类型 [input.ts](../packages/core/src/types/input.ts)、[textarea.ts](../packages/core/src/types/textarea.ts)、[input-group.ts](../packages/core/src/types/input-group.ts)、[input-number.ts](../packages/core/src/types/input-number.ts)、[number-keyboard.ts](../packages/core/src/types/number-keyboard.ts)、[mentions.ts](../packages/core/src/types/mentions.ts)，core 工具 [input-styles.ts](../packages/core/src/utils/input-styles.ts)、[textarea-auto-resize.ts](../packages/core/src/utils/textarea-auto-resize.ts)、[input-group-utils.ts](../packages/core/src/utils/input-group-utils.ts)、[input-number-utils.ts](../packages/core/src/utils/input-number-utils.ts)、[number-keyboard-utils.ts](../packages/core/src/utils/number-keyboard-utils.ts)、[mentions-utils.ts](../packages/core/src/utils/mentions-utils.ts)，React/Vue 对应组件实现，tests/{core,react,vue} 16 个定向 spec，generated references（component-index.md、shared/props/form.md、shared/patterns/common.md、examples/form.md）。

**结论速览**：C12 基线健康：目标 vitest、API 校验、公共类型导出检查均通过；输入样式、数值解析/格式化、数字键盘输入规则、Mentions 查询/定位等主要纯逻辑已沉 core 并被双端复用。未发现 P1。主要问题集中在 **文档/契约准确性与双端 parity**：InputGroup 的 size 上下文承诺与实际不符、React Input/Textarea reference 示例的 `onChange` 形态错误、Vue InputNumber 缺少 core/React 已具备的 `defaultValue` 非受控语义。另有 3 个 P3：Mentions 过滤边界、InputNumber 重复 core spec、NumberKeyboard 删除文案 i18n 边界。

---

#### C12-1 InputGroup `size` 上下文只影响 Addon，不影响 Input/Textarea/InputNumber，与类型描述不符 — **P2**

**发现问题**

- 🟠 P2｜core 类型说明 `InputGroupProps.size` 是 “Size applied to all children in the group”（[input-group.ts:16](../packages/core/src/types/input-group.ts)），React/Vue 也分别 provide size/compact 上下文（[InputGroup.tsx:40](../packages/react/src/components/InputGroup.tsx)、[InputGroup.ts:46](../packages/vue/src/components/InputGroup.ts)）。
- 🟠 P2｜但消费端只有 `InputGroupAddon` 读取上下文并传给 `getInputGroupAddonClasses`（[InputGroup.tsx:58](../packages/react/src/components/InputGroup.tsx)、[InputGroup.ts:89](../packages/vue/src/components/InputGroup.ts)）。Input、Textarea、InputNumber 均没有读取 InputGroup context，仍使用自身 `size = 'md'` 默认值（[Input.tsx:84](../packages/react/src/components/Input.tsx)、[Textarea.tsx:27](../packages/react/src/components/Textarea.tsx)、[InputNumber.tsx:53](../packages/react/src/components/InputNumber.tsx)、[Input.ts:61](../packages/vue/src/components/Input.ts)、[Textarea.ts:47](../packages/vue/src/components/Textarea.ts)、[InputNumber.ts:58](../packages/vue/src/components/InputNumber.ts)）。
- 🟠 P2｜现有 InputGroup 测试只断言 group 接受 size、Addon class 存在，未覆盖「子 Input 自动继承 size」（[InputGroup.spec.tsx:62](../tests/react/InputGroup.spec.tsx)、[InputGroup.spec.ts:79](../tests/vue/InputGroup.spec.ts)）。因此当前实现是可通过测试但与公开说明不一致。

**公共内容决策**：二选一并双端统一：① 修改文档/类型说明为「size applies to InputGroupAddon; form controls should set size explicitly」；② 让 Input/Textarea/InputNumber 消费 InputGroup 上下文并仅在自身未显式传 size 时继承。若新增 context 消费属框架层行为变更，core 只保留已有 class helper。

**建议修复顺序**：P2。优先定语义；若选择继承，先补双端 InputGroup+Input/Textarea/InputNumber 组合测试，再改实现。

**目标验证命令**：`corepack pnpm vitest run tests/react/InputGroup.spec.tsx tests/react/Input.spec.tsx tests/react/Textarea.spec.tsx tests/react/InputNumber.spec.tsx tests/vue/InputGroup.spec.ts tests/vue/Input.spec.ts tests/vue/Textarea.spec.ts tests/vue/InputNumber.spec.ts`、`corepack pnpm types:check`。

---

#### C12-2 React Input/Textarea reference 示例把 `onChange` 写成值回调，实际组件传 DOM event — **P2**

**发现问题**

- 🟠 P2｜generated reference 的通用绑定示例写 `<Input value={value} onChange={setValue} />`（[common.md:95](../skills/tigercat/references/shared/patterns/common.md)），form 示例也写 Input/Textarea 的 React 用法为 `onChange={setValue}`（[form.md:18](../skills/tigercat/references/examples/form.md)、[form.md:22](../skills/tigercat/references/examples/form.md)）。
- 🟠 P2｜真实 React Input 类型是 `onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void`（[Input.tsx:43](../packages/react/src/components/Input.tsx)），实现直接 `onChange?.(event)`（[Input.tsx:145](../packages/react/src/components/Input.tsx)）；Textarea 同理传 `React.ChangeEvent<HTMLTextAreaElement>`（[Textarea.tsx:18](../packages/react/src/components/Textarea.tsx)、[Textarea.tsx:80](../packages/react/src/components/Textarea.tsx)）。
- 🟠 P2｜React 示例页和测试都按 event 用法写：`onChange={(e) => setBasicText(e.target.value)}`（[InputDemo.tsx:7](../examples/example/react/src/pages/InputDemo.tsx)），Textarea 测试同样读取 `e.target.value`（[Textarea.spec.tsx:377](../tests/react/Textarea.spec.tsx)）。因此 reference 示例会误导消费者把 React state setter 直接接到 event。

**公共内容决策**：属于 generated references/示例文档准确性问题，不改公共 API。后续应从生成源修正（不要手改 generated references）：React Input/Textarea 绑定示例写成 `(event) => setValue(event.target.value)`；保留 InputNumber/Mentions 等值回调组件的 `onChange={setValue}` 示例。

**建议修复顺序**：P2。优先修文档生成源，避免继续生成错误示例。

**目标验证命令**：修复生成源后运行 `corepack pnpm docs:api:check`；若只改文档源，补 `corepack pnpm types:check`。

---

#### C12-3 Vue InputNumber 缺 `defaultValue` 非受控运行时 prop，且本地接口含未实现 `className` — **P2 / P3**

**发现问题**

- 🟠 P2｜core `InputNumberProps` 定义 `defaultValue?: number | null`（[input-number.ts:31](../packages/core/src/types/input-number.ts)），React InputNumber 实现并测试了非受控 `defaultValue`（[InputNumber.tsx:52](../packages/react/src/components/InputNumber.tsx)、[InputNumber.spec.tsx:23](../tests/react/InputNumber.spec.tsx)）。
- 🟠 P2｜Vue InputNumber 运行时 props 只有 `modelValue`，没有 `defaultValue`（[InputNumber.ts:55](../packages/vue/src/components/InputNumber.ts)）；内部 `internalValue` 初始化为 `props.modelValue ?? null`（[InputNumber.ts:152](../packages/vue/src/components/InputNumber.ts)）。因此 Vue 侧无法用 `defaultValue` 初始化非受控值，与 core/React 语义不一致。
- 🟢 P3｜Vue 本地接口 `VueInputNumberProps` 声明了 `className?: string`（[InputNumber.ts:48](../packages/vue/src/components/InputNumber.ts)），但运行时 props 没有 `className`，wrapper class 只合并 `attrs.class`（[InputNumber.ts:264](../packages/vue/src/components/InputNumber.ts)）。这与同组 Textarea/NumberKeyboard 显式支持 `className` 的 Vue 组件不一致，属于类型/实现清理项。

**公共内容决策**：`defaultValue` 属 core 公开 props，应补齐 Vue 运行时能力或在 generated references 明确 Vue 仅用 `modelValue`。建议补齐 Vue `defaultValue`，保持与 NumberKeyboard Vue 的非受控模式一致；`className` 则二选一：运行时补 prop，或从本地接口删除并统一推荐 `class`。

**建议修复顺序**：P2 先补 Vue `defaultValue` + 测试；P3 再处理 `className` 一致性。

**目标验证命令**：`corepack pnpm vitest run tests/vue/InputNumber.spec.ts tests/react/InputNumber.spec.tsx tests/core/input-number-utils.spec.ts tests/core/input-number-display-utils.spec.ts`、`corepack pnpm types:check`。

---

#### C12-4 Mentions 打开条件与过滤结果使用不同口径，无匹配/禁用项时进入不可见打开态 — **P3**

**发现问题**

- 🟢 P3｜React `handleInput` 判断 `result && options.length > 0` 就 `setIsOpen(true)`（[Mentions.tsx:58](../packages/react/src/components/Mentions.tsx)），但渲染 listbox 需要 `isOpen && filteredOptions.length > 0`（[Mentions.tsx:138](../packages/react/src/components/Mentions.tsx)）。过滤本身排除 disabled option（[Mentions.tsx:49](../packages/react/src/components/Mentions.tsx)）。
- 🟢 P3｜Vue `handleInput` 在设置新 query 前读取 `filteredOptions.value.length`（[Mentions.ts:57](../packages/vue/src/components/Mentions.ts)），此时 computed 仍基于旧 query；随后设置 query 后渲染又看新的 `filteredOptions.value.length`（[Mentions.ts:138](../packages/vue/src/components/Mentions.ts)）。因此输入一个无匹配 query 或只匹配禁用项时，可能短暂进入 `isOpen=true` 但无 listbox 渲染的状态。
- 🟢 P3｜现有测试覆盖下拉定位、键盘导航、过滤和自定义 prefix；React disabled-option 测试只确认组件存在，没有断言无 listbox / 不进入打开态（[Mentions.spec.tsx:188](../tests/react/Mentions.spec.tsx)）。Vue 侧无 disabled option 分支测试。

**公共内容决策**：过滤和打开条件应统一复用同一 core helper 或至少同一份 filtered result。无须改公共 API；建议把「计算 query + 过滤候选 + 是否打开」整理成框架无关 helper，双端消费。

**建议修复顺序**：P3。先补无匹配/disabled-only 双端测试，再收敛打开条件。

**目标验证命令**：`corepack pnpm vitest run tests/react/Mentions.spec.tsx tests/vue/Mentions.spec.ts tests/core/mentions-utils.spec.ts`。

---

#### C12-5 InputNumber core 解析/格式化 helper 有两份近重复 spec — **P3**

**发现问题**

- 🟢 P3｜[input-number-utils.spec.ts](../tests/core/input-number-utils.spec.ts) 与 [input-number-display-utils.spec.ts](../tests/core/input-number-display-utils.spec.ts) 都测试 `formatInputNumberDisplay` / `parseInputNumberValue`，覆盖点高度重合：null/undefined、formatter 优先、precision、默认 Number 解析、空串/单 `-`、非法输入。
- 🟢 P3｜这两份测试都能通过，但未来修改格式化/解析行为时需要同步维护两处断言，增加噪音。实际 helper 已在 [input-number-utils.ts:195](../packages/core/src/utils/input-number-utils.ts) / [:212](../packages/core/src/utils/input-number-utils.ts) 单源实现，测试也应单源。

**公共内容决策**：纯测试清理；保留一个 core spec 文件即可。建议把较完整的边界用例合并到 `input-number-utils.spec.ts`，删除 `input-number-display-utils.spec.ts` 或改为覆盖真正缺口（如 parser 返回 NaN、precision 非整数策略）。

**建议修复顺序**：P3，低风险清理。

**目标验证命令**：`corepack pnpm vitest run tests/core/input-number-utils.spec.ts tests/react/InputNumber.spec.tsx tests/vue/InputNumber.spec.ts`。

---

#### C12-6 NumberKeyboard confirm 文案接 locale，delete 默认文案未接 locale，i18n 边界不对称 — **P3**

**发现问题**

- 🟢 P3｜React/Vue NumberKeyboard 的 confirm 文案通过 `resolveLocaleText('Done', confirmText, mergedLocale?.common?.okText)` 接入 ConfigProvider locale（[NumberKeyboard.tsx:58](../packages/react/src/components/NumberKeyboard.tsx)、[NumberKeyboard.ts:52](../packages/vue/src/components/NumberKeyboard.ts)）。
- 🟢 P3｜delete 文案只有 prop 默认值 `deleteText = 'Delete'` / `default: 'Delete'`，传给 core key layout（[NumberKeyboard.tsx:41](../packages/react/src/components/NumberKeyboard.tsx)、[NumberKeyboard.ts:38](../packages/vue/src/components/NumberKeyboard.ts)、[number-keyboard-utils.ts:160](../packages/core/src/utils/number-keyboard-utils.ts)），不会从 locale 派生。当前 `TigerLocaleCommon` 只有 `okText` / `cancelText` / `emptyText` 等字段，无 deleteText（[locale.ts:7](../packages/core/src/types/locale.ts)）。
- 🟢 P3｜这不是现有测试红灯：双端测试覆盖默认 Delete/Done、自定义 deleteText/confirmText、showConfirm=false（[NumberKeyboard.spec.tsx:12](../tests/react/NumberKeyboard.spec.tsx)、[NumberKeyboard.spec.ts:11](../tests/vue/NumberKeyboard.spec.ts)），但未覆盖 locale 下 delete label 的预期。

**公共内容决策**：可保持现状并在文档说明「deleteText 需显式传入」；若要统一 i18n，则需要给 `TigerLocale` 增加 numberKeyboard/deleteText 命名空间或 common deleteText，属于 core 类型/API 扩展，需 baseline 与 references 更新。

**建议修复顺序**：P3。先文档说明；若产品要求全局本地化，再走 locale 类型扩展。

**目标验证命令**：`corepack pnpm vitest run tests/react/NumberKeyboard.spec.tsx tests/vue/NumberKeyboard.spec.ts tests/core/number-keyboard-utils.spec.ts`，若改 locale 类型追加 `corepack pnpm api:validate`、`corepack pnpm types:check`、`corepack pnpm api:baseline:check`。

---

#### C12 健康项

- ✅ Input 基础 class、状态、prefix/suffix、clearable、password toggle、showCount、number 解析统一走 core `input-styles`（[input-styles.ts](../packages/core/src/utils/input-styles.ts)），React/Vue 行为镜像；error `aria-describedby` / `aria-invalid` 已覆盖。
- ✅ Textarea 自动尺寸逻辑沉到 core `autoResizeTextarea`（[textarea-auto-resize.ts](../packages/core/src/utils/textarea-auto-resize.ts)），双端分别在 `useLayoutEffect` / `watch + nextTick` 调用，minRows/maxRows 逻辑一致。
- ✅ InputNumber 的 clamp/step/precision、重复按压 rAF controller、display format/parse 已在 core（[input-number-utils.ts](../packages/core/src/utils/input-number-utils.ts)），双端同构消费；长按 repeat 测试双端覆盖。
- ✅ NumberKeyboard 输入规则、布局、mode-specific maxLength/precision、delete/confirm payload 均在 core（[number-keyboard-utils.ts](../packages/core/src/utils/number-keyboard-utils.ts)），React/Vue 事件 payload 对齐，ConfigProvider locale 能覆盖 confirm 文案。
- ✅ Mentions 的输入 class、option class、query 提取、dropdown floating position 与 cyclic index helper 已在 core（[mentions-utils.ts](../packages/core/src/utils/mentions-utils.ts)、[picker-utils.ts:96](../packages/core/src/utils/picker-utils.ts)），双端复用。
- ✅ component-index 与 form props/api-summary 能列出 C12 组件；`api:validate` 与 `types:check` 均通过，未发现导出缺口。

---

#### C12 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| InputGroup size 上下文未影响子输入（C12-1） | 文档澄清 Addon-only 或双端实现未显式 size 时继承 | **P2** |
| React Input/Textarea reference `onChange={setValue}` 错误（C12-2） | 修生成源示例；React DOM event handler 与值回调组件分开 | **P2** |
| Vue InputNumber 缺 `defaultValue`（C12-3） | 补齐 Vue 非受控默认值语义；`className` 单独清理 | **P2** |
| Mentions 打开条件/过滤口径不一（C12-4） | 双端统一 filtered result；可沉 core helper | P3 |
| InputNumber helper 重复 spec（C12-5） | 合并测试文件，保留单源覆盖 | P3 |
| NumberKeyboard delete 文案未接 locale（C12-6） | 文档说明显式 deleteText；或扩展 locale 类型 | P3 |
| 输入样式/自动尺寸/数值解析/数字键盘/Mentions 定位等核心逻辑已在 core | 已在 core，保持 | - |

---

#### C12 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep InputGroup context 消费者 + Input/Textarea/InputNumber size 默认 | 只有 Addon 消费 context；子输入不继承 group size | C12-1 |
| references `onChange={setValue}` vs React 组件类型/示例页 | reference 写值回调；真实组件传 DOM event，示例页使用 `event.target.value` | C12-2 |
| core/React InputNumber `defaultValue` vs Vue runtime props | core/React 有 defaultValue；Vue 没有 runtime prop，内部值从 modelValue 初始化 | C12-3 |
| Vue InputNumber `className` 接口 vs props/wrapper class | interface 有 `className`，runtime 只合并 `attrs.class` | C12-3 |
| Mentions handleInput/open/render/filter 分支 | 打开口径与渲染过滤口径不同；无匹配/disabled-only 缺测试锁定 | C12-4 |
| core InputNumber 两份 spec 文件 | `input-number-utils.spec.ts` 与 `input-number-display-utils.spec.ts` 覆盖高度重复 | C12-5 |
| NumberKeyboard confirm/delete 文案路径 | confirm 走 locale common.okText；delete 只走 prop/default `Delete` | C12-6 |
| `corepack pnpm vitest run tests/react/Input.spec.tsx tests/react/Textarea.spec.tsx tests/react/InputGroup.spec.tsx tests/react/InputNumber.spec.tsx tests/react/NumberKeyboard.spec.tsx tests/react/Mentions.spec.tsx tests/vue/Input.spec.ts tests/vue/Textarea.spec.ts tests/vue/InputGroup.spec.ts tests/vue/InputNumber.spec.ts tests/vue/NumberKeyboard.spec.ts tests/vue/Mentions.spec.ts tests/core/input-number-utils.spec.ts tests/core/input-number-display-utils.spec.ts tests/core/number-keyboard-utils.spec.ts tests/core/mentions-utils.spec.ts` | ✅ 16 个测试文件、473 个测试通过 | C12 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C12 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C12 基线 |

> 本轮 C12 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C12 阶段只执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。

---

### C13 选择/切换基础组

**扫描范围**：Checkbox、CheckboxGroup、Radio、RadioGroup、Switch、Slider、Stepper、Rate、Segmented 的全链路——core 类型 `packages/core/src/types/{checkbox,radio,switch,slider,stepper,rate,segmented}.ts`，core 工具 `utils/{radio-utils,radio-group-utils,rate-utils,stepper-utils,segmented-utils}.ts`、`utils/helpers/slider-utils.ts`，React/Vue 对应组件实现、双端定向 spec、`tests/core/{segmented-utils,switch-theme}.spec.ts`，以及 generated component index 与 `shared/props/{form,basic}.md`。

**结论速览**：Checkbox/Radio 保持原生输入语义，组内受控/非受控值、禁用继承和 Radio 箭头键导航双端对称；Slider 的键盘、范围约束和 ARIA thumb 也已有双端覆盖。**无 P1**。需处理的发现为：Rate/Segmented 仅披露 radio 角色而不提供实际键盘操作，且 Rate 把多个星标同时标为已选；Slider 的 `marks={true}` 是空渲染；Slider/Stepper 的数值契约对零/负 step 与反向边界没有保护，核心计算又无直接单测；Vue Switch 覆盖调用方传入的 click/keydown 监听器。

---

#### C13-1 Rate / Segmented 的 ARIA radio 语义没有可键盘操作实现，Rate 还会产生多选 radio 状态（a11y）— **P2**

**发现问题**

- 🟠 P2｜Rate 两端将每个星标渲染为 `span role="radio"`（[Rate.tsx:119](../packages/react/src/components/Rate.tsx)、[Rate.ts:143](../packages/vue/src/components/Rate.ts)），没有 `tabIndex`、`onKeyDown` 或原生可聚焦控件；只能鼠标点击。`value=3` 时前三个星都按 `full || half` 赋 `aria-checked=true`，不符合单选组只能有一个选项被选中的语义。
- 🟠 P2｜Segmented 两端同样以不可聚焦的 `label role="radio"` 表示选项（[Segmented.tsx:57](../packages/react/src/components/Segmented.tsx)、[Segmented.ts:80](../packages/vue/src/components/Segmented.ts)），只绑定 click，没有 roving tabindex、方向键、Home/End 或 Enter/Space 选择。React 组件也不透传根节点属性，调用方不能提供 `aria-label` / `aria-labelledby`；Vue 虽透传 attrs，但默认组没有名称。
- 🟠 P2｜现有 Rate/Segmented 双端 spec 只验证 click、静态 aria 属性和 axe 结果；没有键盘、焦点顺序、radio 单选基数或可定制组名称断言。axe 无法证明自定义角色可以由键盘操作。

**公共内容决策**：这是框架层交互与 ARIA 模式问题，不应把 DOM 焦点管理沉入 core。Rate 先确定正确模式：更适合以一个 `role="slider"` 表达 0～count（含 half）评分；若保留 radiogroup，必须只让精确值对应一个 radio。Segmented 应使用原生 radio 或 button + roving-tabindex，并在双端统一命名入口。共享的选项索引/跳过禁用项计算可在确认两端需求后沉入 core。

**建议修复顺序**：P2。先确定 Rate 的 ARIA 模式，再为两组件补键盘和焦点行为，最后补 React/Vue 对等的键盘、禁用跳过、名称和半分值测试。

**目标验证命令**：`pnpm vitest run tests/react/Rate.spec.tsx tests/vue/Rate.spec.ts tests/react/Segmented.spec.tsx tests/vue/Segmented.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C13-2 Slider 的 `marks={true}` 是静默空实现，测试未锁定承诺的可见标记 — **P2**

**发现问题**

- 🟠 P2｜React/Vue 都把布尔 `marks` 转为空对象（[Slider.tsx:287](../packages/react/src/components/Slider.tsx)、[Slider.ts:364](../packages/vue/src/components/Slider.ts)），随后只遍历对象条目；因此 `marks={true}` 仅渲染空容器，不显示任何标记或标签。
- 🟠 P2｜props 注释承诺 boolean 用于“show marks”，但没有默认 marks 集合。两端测试的 `marks=true` 用例只断言 slider thumb 存在（[Slider.spec.tsx:338](../tests/react/Slider.spec.tsx)、[Slider.spec.ts:405](../tests/vue/Slider.spec.ts)），注释称 DOM 是实现细节，未验证该布尔值的实际效果。

**公共内容决策**：marks 的布局仍属框架组件；默认 marks 的纯派生规则若需要双端一致，可抽为 core helper。先确定兼容语义：让 `true` 至少派生 min/max 标记，或收窄类型和文档，只接受显式 map；不能继续保留无效果的 boolean 分支。

**建议修复顺序**：P2。先确定 `true` 的默认标记策略，双端接入同一派生结果，并补可见文本/位置断言和空区间边界测试。

**目标验证命令**：`pnpm vitest run tests/react/Slider.spec.tsx tests/vue/Slider.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C13-3 Slider / Stepper 数值参数缺少有效域保护，核心计算没有直接单测 — **P2**

**发现问题**

- 🟠 P2｜`sliderNormalizeValue` 直接以 `step` 作除数（[slider-utils.ts:22](../packages/core/src/utils/helpers/slider-utils.ts)）；`step=0` 会经 `Infinity * 0` 产生 `NaN`，并传播到键盘、轨道点击和拖动路径。Slider props 未限制 `step > 0` 或 `min <= max`，双端实现也未归一化外部 value/defaultValue。
- 🟠 P2｜Stepper 同样接受任意 `step`、min/max 与 precision（[Stepper.tsx:22](../packages/react/src/components/Stepper.tsx)、[Stepper.ts:20](../packages/vue/src/components/Stepper.ts)）；零 step 使动作无效，负 step 会让加减方向反转，`min > max` 会令按钮边界和 `clampStepperValue` 语义冲突。
- 🟠 P2｜核心 `sliderNormalizeValue` / `sliderGetValueFromPosition` / `sliderGetKeyboardValue` 与 `clampStepperValue` 只由组件消费，仓库没有 core direct spec；现有组件 spec 覆盖正常整数、小数、范围交叉和键盘路径，但不覆盖零/负 step、反向区间或非有限数。

**公共内容决策**：有效域归一化是跨框架纯逻辑，应保持在 core；框架层只处理 DOM 事件与受控值通知。不要在 React/Vue 分别补不同的 guard。后续需先定义无效 props 的兼容策略（开发期告警并安全回退，或显式约束/抛错），再由 core helper 统一实施。

**建议修复顺序**：P2。先给 Slider/Stepper 的数值参数定契约，补 core 单测，再让两端在挂载和交互时复用归一化结果；这项不改 public API 前也可作为防御性修复。

**目标验证命令**：新增 `tests/core/slider-utils.spec.ts`、`tests/core/stepper-utils.spec.ts` 后运行 `pnpm vitest run tests/core/slider-utils.spec.ts tests/core/stepper-utils.spec.ts tests/react/Slider.spec.tsx tests/vue/Slider.spec.ts tests/react/Stepper.spec.tsx tests/vue/Stepper.spec.ts`。

---

#### C13-4 Vue Switch 覆盖调用方的原生 click / keydown 监听器，和 React 透传语义不一致 — **P3**

**发现问题**

- 🟢 P3｜Vue Switch 先展开 `attrs`，随后同一 vnode 又写入 `onClick: emitChange`、`onKeydown: handleKeyDown`（[Switch.ts:101](../packages/vue/src/components/Switch.ts)）；未声明为组件 emits 的 `@click` / `@keydown` 会作为 attrs 到达，但被内部 handler 覆盖，调用方监听器不会执行。
- 🟢 P3｜React Switch 明确先调用外部 `onClick` / `onKeyDown`，再在事件未取消时 toggle（[Switch.tsx:36](../packages/react/src/components/Switch.tsx)），可以保留业务拦截和默认阻止语义。Vue spec 仅验证切换和 disabled，不覆盖调用方监听器与 preventDefault。

**公共内容决策**：保持事件编排在框架层；Vue 应采用合并 listener 的方式并与 React 保持“外部监听器先运行、`defaultPrevented` 时不切换”的契约。无需新增 core helper 或公共 API。

**建议修复顺序**：P3。补 Vue click/keydown 透传与 preventDefault 回归测试后，最小化调整 vnode listener 合并。

**目标验证命令**：`pnpm vitest run tests/vue/Switch.spec.ts tests/react/Switch.spec.tsx`、`pnpm api:validate`、`pnpm types:check`。

---

#### C13 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Rate / Segmented 键盘与 ARIA 状态（C13-1） | DOM/focus 留框架层；候选选项索引/跳过禁用计算按需沉 core | **P2** |
| Slider `marks=true`（C13-2） | 先确定 boolean 语义；若派生默认 marks，再抽 core 纯规则 | **P2** |
| Slider / Stepper 数值契约（C13-3） | 归一化和有效域 guard 合入 core，框架层复用 | **P2** |
| Vue Switch listener 覆盖（C13-4） | 框架层最小修复，保持 React 对等事件契约 | P3 |
| Checkbox/Radio 原生输入、组选项、禁用继承与箭头键导航 | 已健康，保持双端现状 | - |

---

#### C13 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| Rate / Segmented 双端 render | 自定义 radio 均无焦点/键盘路径；Rate value=3 可产生 3 个 `aria-checked=true` | C13-1 |
| Rate / Segmented 双端 spec | 覆盖 click/静态 aria/axe；无键盘、焦点、单选基数或可配置名称断言 | C13-1 |
| Slider `marks` 分支与双端 spec | boolean 分支转 `{}`；测试只验证 thumb 存在 | C13-2 |
| slider-utils / stepper-utils 消费者与 tests/core | helper 只被双端组件消费；无 direct core spec；无无效数值参数用例 | C13-3 |
| Vue / React Switch 事件处理 | Vue 后写 handler 覆盖 attrs listener；React 先回调调用方并尊重 defaultPrevented | C13-4 |
| 目标 vitest、`pnpm api:validate`、`pnpm types:check` | ⚠️ 未运行：本机 `node_modules` 缺失，冻结安装在下载 `typescript@6.0.3` 及平台二进制包时超时；不作为组件结论 | C13 基线 |

> 本轮 C13 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，目标 vitest、`pnpm api:validate` 与 `pnpm types:check` 因本机依赖重建的下载超时未能启动；该环境问题不作为组件结论。

---

### C14 Select 单组

**扫描范围**：Select、AutoComplete 的全链路——core 类型 `packages/core/src/types/{select,auto-complete}.ts`，core 工具 `utils/{select-utils,auto-complete-utils,picker-utils}.ts`，React 实现 `components/Select.tsx` + `Select/{state,render-option,types,icons}`、`components/AutoComplete.tsx`，Vue 实现 `components/{Select,AutoComplete}.ts`，双端定向 spec、`tests/core/{picker-utils,select-utils}.spec.ts`，examples `SelectDemo`/`AutoCompleteDemo`，generated component-index。

**结论速览**：Select/AutoComplete 核心行为健康、双端对称且测试充分——受控量（`value`/`onChange` ↔ `modelValue`/`update:modelValue`）、多选切换、clearable、过滤、creatable、remote、debounce、键盘导航均双端锁定。**无 P1**。需处理项集中在两类：① **公共 props 名实不符**——`allowFreeInput` 双端声明零实现、Select `virtual`/`listHeight` 双端 no-op、React AutoComplete 整体缺 `locale`（与 Vue 不对称）；② **该合未合**——Select 绕开同族 picker helpers（连 TreeSelect/Cascader 都用的 `getPickerTriggerKeyAction`），把导航/trigger/aria 在 React+Vue 各手写一遍。其余为 a11y / i18n / 一致性 P3。

---

#### C14-1 AutoComplete `allowFreeInput` 死 prop、`defaultActiveFirstOption` JSDoc 名实不符（公共 API 卫生）— **P2**

**发现问题**

- 🟠 P2｜`allowFreeInput` 为**双端声明、零实现、零测试、零示例**的公共 prop：定义于 [auto-complete.ts:41](../packages/core/src/types/auto-complete.ts)（注释「Whether to allow free-form text input」），Vue 声明默认 `true`（[AutoComplete.ts:96](../packages/vue/src/components/AutoComplete.ts)）、React 只把它放进 `AUTOCOMPLETE_KEYS` 过滤集（[AutoComplete.tsx:48](../packages/react/src/components/AutoComplete.tsx)），但两端 setup/render **从不读取**它。语义上 AutoComplete 本就是自由输入框，该 prop 既无效果又含义含糊。
- 🟢 P3｜`defaultActiveFirstOption` 的 JSDoc 写「Whether to select the first match automatically **when losing focus**」（[auto-complete.ts:38](../packages/core/src/types/auto-complete.ts)），但实现只用它在**打开/输入时**设置高亮 active 索引（React [AutoComplete.tsx:104](../packages/react/src/components/AutoComplete.tsx)/[:122](../packages/react/src/components/AutoComplete.tsx)、Vue [AutoComplete.ts:137](../packages/vue/src/components/AutoComplete.ts)/[:156](../packages/vue/src/components/AutoComplete.ts)）；全代码没有任何 blur-select 行为。文档与实现不符。

**公共内容决策**：属公共 API 卫生，走任务 H 策略（不直接删公开内容）。`allowFreeInput` 二选一——要么按文档实现（失焦/回车时是否限定为 options 内的值），要么标 deprecated + migration + changeset 后移除，并过 `api:baseline:check`。`defaultActiveFirstOption` 先修 JSDoc 以匹配实际「打开时高亮首项」语义。

**建议修复顺序**：P2。先定 `allowFreeInput` 去留（实现 or 废弃）；JSDoc 修正可随手并入。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm api:baseline:check`、`pnpm vitest run tests/react/AutoComplete.spec.tsx tests/vue/AutoComplete.spec.ts`。

---

#### C14-2 Select `virtual` / `listHeight` 是双端 no-op 的公共 API，且 `virtual` 文档承诺性能优化（过度设计 / 未实现）— **P2**

**发现问题**

- 🟠 P2｜`virtual`（`@since 0.5.0`，注释「only visible options are rendered for better performance」）与 `listHeight`（`@since 0.5.0`，默认 256）是公开 props（[select.ts:117](../packages/core/src/types/select.ts)/[:149](../packages/core/src/types/select.ts)），但两端**均未实现虚拟滚动**：React 只把二者放进 `SELECT_KEYS` 过滤集（[state.ts:33](../packages/react/src/components/Select/state.ts)/[:38](../packages/react/src/components/Select/state.ts)）、从不消费；Vue 声明了 props（[Select.ts:195](../packages/vue/src/components/Select.ts)/[:225](../packages/vue/src/components/Select.ts)）也从不引用。dropdown 始终一次性渲染全部选项。
- ℹ️ 测试「should handle large number of options」对 100 项**全量渲染**断言（[tests/react/Select.spec.tsx:519](../tests/react/Select.spec.tsx)、[tests/vue/Select.spec.ts:653](../tests/vue/Select.spec.ts)），反证无虚拟化。对照：同批 `@since 0.5.0` 的 `maxTagCount` 已实现并测试。

**公共内容决策**：公共 API 变更走任务 H。二选一——要么接入真实虚拟滚动（C24 已有 `VirtualList` 可复用，属框架层接入，纯滚动/测量计算可沉 core），要么把 `virtual`/`listHeight` 标 deprecated + migration、修正 `virtual` 注释中的性能承诺，过 `api:baseline:check`。不可继续保留「声明了性能优化但无效果」的 props。

**建议修复顺序**：P2，独立成项。先决策实现 vs 废弃。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm api:baseline:check`、`pnpm vitest run tests/react/Select.spec.tsx tests/vue/Select.spec.ts`。

---

#### C14-3 React AutoComplete 缺 `locale`，与 Vue 不对称；Vue `notFoundText` 又未走 locale（i18n 不对称）— **P2**

**发现问题**

- 🟠 P2｜**双端不对称**：Vue AutoComplete 接 `locale` prop 并经 `useTigerConfig` + `mergeTigerLocale` + `resolveLocaleText` 本地化 clear 按钮 `aria-label`（[AutoComplete.ts:100](../packages/vue/src/components/AutoComplete.ts)/[:266](../packages/vue/src/components/AutoComplete.ts)）；**React AutoComplete 完全没有 `locale` prop**，clear `aria-label="Clear"` 硬编码英文、无法本地化（[AutoComplete.tsx:205](../packages/react/src/components/AutoComplete.tsx)）。与 B-1（DatePicker 未接 ConfigProvider locale）同向、与 C02-2（React QRCode 缺 locale）同型。注意 Select 双端均已接 `locale`，唯 AutoComplete 不对称。
- 🟢 P3｜Vue AutoComplete 虽有 `mergedLocale`，但空态 `notFoundText` 直接用 prop 默认英文（[AutoComplete.ts:310](../packages/vue/src/components/AutoComplete.ts)），**未走 locale**；而 Vue Select 的空态走 `mergedLocale?.common?.emptyText`（[Select.ts:826](../packages/vue/src/components/Select.ts)）——同组内空态本地化策略不一致。

**公共内容决策**：locale 解析留 core（`mergeTigerLocale`/`resolveLocaleText` 已在 core），框架层消费。React AutoComplete 应补 `locale` prop 并对齐 Vue 的「显式 prop > ConfigProvider locale > 默认」优先级；clear/notFoundText 文案统一接 `common`（如 `clearText`/`emptyText`）。属公共 API 新增（React 加 prop），双端 parity 收敛。

**建议修复顺序**：P2。先给 React AutoComplete 补 locale 接入与 clear 文案本地化，再统一两端空态走 locale，补 ConfigProvider 回归测试。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm vitest run tests/react/AutoComplete.spec.tsx tests/vue/AutoComplete.spec.ts`。

---

#### C14-4 Select 绕开共享 picker helpers，把导航/trigger/aria 在双端各手写一遍（该合未合 + 双端重复）— **P2**

**发现问题**

- 🟠 P2｜[picker-utils.ts:1](../packages/core/src/utils/picker-utils.ts) 自述为「Select、AutoComplete、Cascader、TreeSelect、Transfer」的**共享键盘导航/aria 层**，提供 `getPickerNavigationIndex`、`getPickerComboboxAria`/`getPickerListboxAria`/`getPickerOptionAria`、`getPickerTriggerKeyAction`、`getInitialPickerActiveIndex` 等。AutoComplete、Cascader、TreeSelect、Transfer、Mentions、Spotlight 都消费这些高层 helper；**唯独 Select 只用底层 `findFirstEnabledIndex`/`findLastEnabledIndex`/`findNextEnabledIndex`**（[state.ts:10](../packages/react/src/components/Select/state.ts)、[Select.ts:17](../packages/vue/src/components/Select.ts)），把导航键派发、option/listbox aria 在两端**逐处内联**。
- 🟠 P2｜尤其 `getPickerTriggerKeyAction(key, expanded)` 连 Select 的**同族** TreeSelect、Cascader 都在用（[TreeSelect.tsx:176](../packages/react/src/components/TreeSelect.tsx)、[TreeSelect.ts:223](../packages/vue/src/components/TreeSelect.ts)、[Cascader.tsx:211](../packages/react/src/components/Cascader.tsx)、[Cascader.ts:240](../packages/vue/src/components/Cascader.ts)），Select 却在 trigger handler 里另写一套 Enter/Space/Arrow/Escape 分支（[state.ts:269](../packages/react/src/components/Select/state.ts)、[Select.ts:437](../packages/vue/src/components/Select.ts)）。
- 🟠 P2｜后果是**跨框架重复**：Select 的 trigger/dropdown/search 三个键盘 switch 在 React `state.ts` 与 Vue `Select.ts` 之间近乎逐字重复；option/listbox 的 `role`/`aria-selected`/`aria-disabled` 也在两端各写一遍（React [render-option.tsx:27](../packages/react/src/components/Select/render-option.tsx)、Vue [Select.ts:741](../packages/vue/src/components/Select.ts)），而这正是 `getPickerOptionAria` 已封装的内容。
- ℹ️ ARIA 模式差异（非缺陷，限定可合范围）：Select 是 **button 触发 + 焦点移入选项（roving tabindex + DOM focus + scrollIntoView）**；AutoComplete 是 **combobox + `aria-activedescendant`（焦点留输入框）**。故 `getPickerComboboxAria`（输出 `role="combobox"`）**不应**套到 Select 触发器。可安全共享的是：dropdown 的方向键派发改用 `getPickerNavigationIndex`、option aria 改用 `getPickerOptionAria`；`getPickerTriggerKeyAction` 可评估接入（行为敏感、双端 spec 已锁，需谨慎）。

**公共内容决策**：**合并到已有 core picker-utils**。纯逻辑（导航索引派发、trigger 键意图、option aria）沉 core 共享，焦点/DOM/事件编排留框架层。优先低风险项（`getPickerNavigationIndex`、`getPickerOptionAria`），`getPickerTriggerKeyAction` 接入需对照现有键盘 spec 逐项验证等价。无公共 API 破坏（纯内部重构）。

**建议修复顺序**：P3→P2 渐进。先用 `getPickerNavigationIndex` 收敛 Select dropdown 的 4 个方向键分支（与底层 finder 行为等价、零风险），再用 `getPickerOptionAria` 收敛 option aria；最后评估 trigger 键合并。每步跑双端 Select spec 保证行为不变。

**目标验证命令**：`pnpm vitest run tests/core/picker-utils.spec.ts tests/react/Select.spec.tsx tests/vue/Select.spec.ts`、`pnpm types:check`、`pnpm api:validate`。

---

#### C14-5 同组 clear 控件 a11y 模式不一致：Select 用不可聚焦 `<span>`，AutoComplete 用 `<button>`（a11y）— **P3**

**发现问题**

- 🟢 P3｜Select 的清除控件是嵌在触发 `<button>` 内的 `<span data-tiger-select-clear onClick>`（[Select.tsx:47](../packages/react/src/components/Select.tsx)、[Select.ts:673](../packages/vue/src/components/Select.ts)），**不可聚焦、无键盘路径**——键盘用户无法清除（Select 也未提供 Delete/Backspace 清除）。且交互元素（span onClick）嵌套在 button 内，语义不佳。
- 🟢 P3｜对照同组 AutoComplete 的清除控件是真正的 `<button aria-label>`（[AutoComplete.tsx:202](../packages/react/src/components/AutoComplete.tsx)、[AutoComplete.ts:259](../packages/vue/src/components/AutoComplete.ts)），键盘可达。同一 C14 组内两套清除模式。

**公共内容决策**：框架层 a11y 修复，不入 core。Select clear 宜改为可聚焦控件（独立 `<button>` 或补键盘路径），并避免 button 内嵌 onClick span。属行为/结构调整，双端 spec 仅断言 `[data-tiger-select-clear]` 存在与点击清除，改造空间可控。

**建议修复顺序**：P3。补 Select 键盘清除回归测试后再调结构，双端对齐。

**目标验证命令**：`pnpm vitest run tests/react/Select.spec.tsx tests/vue/Select.spec.ts`。

---

#### C14-6 Select clear 的 `aria-label` 硬编码英文未本地化（i18n）— **P3**

**发现问题**

- 🟢 P3｜Select 清除控件 `aria-label="Clear selection"` 双端硬编码（[Select.tsx:51](../packages/react/src/components/Select.tsx)、[Select.ts:679](../packages/vue/src/components/Select.ts)），**未走 locale**——即便 Vue Select 已有 `mergedLocale`、且仓库已有 `common.clearText` 这一 key（Vue AutoComplete 正用它本地化 clear）。结果 Select 的清除标签无法本地化。

**公共内容决策**：接入已有 locale 链路（`resolveLocaleText('Clear selection', mergedLocale?.common?.clearText)` 之类），与 Vue AutoComplete 统一。core 已有 helper，无需新增。与 C14-3、C01-4（默认标签本地化）同向，可合并到一次 i18n 收敛。

**建议修复顺序**：P3，随 C14-3 / a11y 标签本地化一并处理。

**目标验证命令**：`pnpm vitest run tests/react/Select.spec.tsx tests/vue/Select.spec.ts`、`pnpm api:validate`。

---

#### C14-7 AutoComplete 三处双端一致但与 Select 不一致的小问题（一致性）— **P3**

**发现问题**

- 🟢 P3｜**hover 高亮禁用项**：AutoComplete option 的 `onMouseEnter` 无条件 `setActiveIndex`（[AutoComplete.tsx:233](../packages/react/src/components/AutoComplete.tsx)、[AutoComplete.ts:296](../packages/vue/src/components/AutoComplete.ts)），可把 active 落到 disabled 项（Enter 仍被 `handleSelect` 拦截，仅视觉/语义瑕疵）；Select 的 hover 有 `!option.disabled` 判断（[render-option.tsx:32](../packages/react/src/components/Select/render-option.tsx)、[Select.ts:745](../packages/vue/src/components/Select.ts)）。
- 🟢 P3｜**键盘导航不滚动**：AutoComplete 走 `aria-activedescendant` 但方向键导航**从不 scrollIntoView**，长列表 active 项可能在视口外；Select 会 `scrollIntoView({block:'nearest'})`（[state.ts:179](../packages/react/src/components/Select/state.ts)、[Select.ts:339](../packages/vue/src/components/Select.ts)）。combobox 模式同样需手动滚动 active 项。
- 🟢 P3｜**Vue 多一个 `change` 事件**：Vue AutoComplete 在 emits 声明并在输入/选择/清除时额外发 `change`（[AutoComplete.ts:105](../packages/vue/src/components/AutoComplete.ts)/[:153](../packages/vue/src/components/AutoComplete.ts)），React 无对应 `onChange`-distinct 事件（React `onChange` 等价 Vue `update:modelValue`）——事件面双端不完全对称。
- ℹ️ 另：`auto-complete-utils.ts` 的 `filterAutoCompleteOptions`/`defaultAutoCompleteFilter` 无 `tests/core` direct spec，仅经组件测试间接覆盖（对照 `select-utils`/`picker-utils` 均有 core spec）。

**公共内容决策**：(a)(b) 框架层补 disabled 判断与 scrollIntoView，与 Select 对齐；(c) 评估 Vue `change` 是保留（文档化为非 v-model 事件）还是移除以对齐 React，属事件契约取舍；core filter helper 可补 direct spec。均不涉及公共拆合到 core 的结构变更。

**建议修复顺序**：P3，低优先，随 AutoComplete 下次改动顺手处理；补 `tests/core/auto-complete-utils.spec.ts`。

**目标验证命令**：`pnpm vitest run tests/react/AutoComplete.spec.tsx tests/vue/AutoComplete.spec.ts`（如补 core spec 追加 `tests/core/auto-complete-utils.spec.ts`）。

---

#### C14-8 受控量 / 双端 parity 健康面 + active-index 重算策略细微差异（观察）— **P3 / 观察**

**发现问题**

- ✅ 受控量/事件双端对称：`value`/`onChange` ↔ `modelValue`/`update:modelValue`；多选 toggle、clear 回值（单选 `undefined` / 多选 `[]`）、`maxTagCount` 截断、`creatable`（去重 + `create` 回调）、`remote`（跳过本地过滤）、`searchDebounce`、键盘（Arrow/Home/End/Enter/Space/Escape/Tab）均双端 spec 锁定且行为一致。option 过滤、空态、分组渲染一致。
- 🟢 P3｜**active-index 重算策略**：打开时两端都「优先选中项、否则首个可用项」；但**选项变化时**——React 用单 effect 仍偏向选中项（[state.ts:410](../packages/react/src/components/Select/state.ts)），Vue 的 `flatSelectableOptions` watch 无条件回到 `findFirstEnabledIndex`、忽略选中项（[Select.ts:615](../packages/vue/src/components/Select.ts)）。实时过滤时选中值通常已不在结果内，差异概率低，但属双端不完全一致，列为观察。

**公共内容决策**：parity 健康面无需动作。active-index 差异如要统一，可在 C14-4 收敛键盘/状态逻辑时一并对齐两端「选项变化后是否保留选中高亮」的语义。

**建议修复顺序**：P3 观察，随 C14-4 顺带评估。

**目标验证命令**：`pnpm vitest run tests/react/Select.spec.tsx tests/vue/Select.spec.ts`。

---

#### C14 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| AutoComplete `allowFreeInput` 死 prop（C14-1） | 实现 or 废弃（走 H 流程）；`defaultActiveFirstOption` 修 JSDoc | **P2** |
| Select `virtual`/`listHeight` 双端 no-op（C14-2） | 接入真实虚拟滚动（复用 VirtualList）或废弃 + 改注释 | **P2** |
| React AutoComplete 缺 `locale`（C14-3） | React 补 locale 接入；空态/clear 文案双端统一走 locale | **P2** |
| Select 绕开 picker-utils 高层 helper（C14-4） | 合并→core 共享（先 `getPickerNavigationIndex`/`getPickerOptionAria`，再评估 `getPickerTriggerKeyAction`） | **P2** |
| Select clear `<span>` 不可键盘聚焦（C14-5） | 框架层改可聚焦控件 + 键盘路径 | P3 |
| Select clear `aria-label` 硬编码英文（C14-6） | 接入已有 `common.clearText` locale key | P3 |
| AutoComplete hover 禁用项 / 无 scrollIntoView / Vue 多 change 事件（C14-7） | 框架层对齐 Select；补 core filter direct spec | P3 |
| 受控量/parity 健康面 + active-index 重算差异（C14-8） | 健康面保持；差异随 C14-4 顺带统一 | P3/观察 |

---

#### C14 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `allowFreeInput` 全仓 | 仅类型 + 双端声明出现，setup/render 零消费 | C14-1 |
| grep Select `virtual`/`listHeight` 消费者 | 仅 React `SELECT_KEYS` 过滤集；双端无虚拟渲染；100 项全量渲染测试反证 | C14-2 |
| 比对 React/Vue AutoComplete `locale` | Vue 有 locale + 本地化 clear；React 无 locale、clear 硬编码英文 | C14-3 |
| grep picker-utils 高层 helper 消费者 | AutoComplete/Cascader/TreeSelect/Transfer/Mentions/Spotlight 用；Select 仅用底层 finder；`getPickerTriggerKeyAction` 被 TreeSelect/Cascader 用而 Select 未用 | C14-4 |
| 比对 Select vs AutoComplete clear 控件 | Select=不可聚焦 `<span onClick>`；AutoComplete=`<button>` | C14-5 |
| grep Select clear `aria-label` | 双端硬编码 `Clear selection`，未走 `common.clearText` | C14-6 |
| 比对 onMouseEnter/scrollIntoView/emits | AutoComplete hover 不滤 disabled、无 scrollIntoView、Vue 多 `change`；Select 反之 | C14-7 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 6 文件 190 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C14 基线 |

> 本轮 C14 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮以 packageManager 指定的 pnpm 11.9.0（本机无 corepack）实跑 C14 目标 vitest（6 文件 190 测试通过）、`pnpm run api:validate`（一致性检查 0 问题）与 `pnpm run types:check`（全部 props 类型导出），均为只读校验、未改动仓库。

### C15 层级选择组

**扫描范围**：Tree、TreeSelect、Cascader、Transfer 的全链路——core 类型 `types/{tree,tree-select,cascader,transfer}.ts`，core 工具 `utils/{tree-utils,tree-select-utils,cascader-utils,transfer-utils,picker-utils}.ts`，React `Tree/` 状态拆分与 `TreeSelect`/`Cascader`/`Transfer` 实现，Vue 四组件单文件实现，双端定向 spec，`tests/core/{tree-utils,picker-utils}.spec.ts`，examples 与 generated references。

**结论速览**：C15 基线整体健康，目标 vitest、API 校验、公共类型导出检查均通过。Tree 是本组最成熟面：展开/选中/勾选/过滤/键盘行为沉到 `tree-utils` 与双端状态机复用，`virtual` 已真实接入 `VirtualList`，非 no-op。**无 P1**。主要需处理 2 条 **P2** 公共契约问题：Transfer core 文档/类型的 `targetKeys` 未被双端组件实现；Cascader `showSearch.render` 声明后零消费。其余为 P3：Cascader/TreeSelect/Transfer core helper 缺 direct spec、TreeSelect/Cascader clear 控件 a11y/i18n 模式不佳、Vue Transfer 死代码与移动逻辑可继续沉淀。

---

#### C15-1 Transfer `targetKeys` 是 core/文档公共 prop，但双端组件实际只接 `value` / `modelValue` — **P2**

**发现问题**

- 🟠 P2｜core `TransferProps` 暴露 `targetKeys?: (string | number)[]`（[transfer.ts:32](../packages/core/src/types/transfer.ts)），generated form props 也把 Transfer 主值列为 `targetKeys`（[form.md:266](../skills/tigercat/references/shared/props/form.md)）。但 React Transfer 真正受控值是额外声明的 `value`（[Transfer.tsx:33](../packages/react/src/components/Transfer.tsx)），实现只从 `value = []` 拆分数据（[Transfer.tsx:60](../packages/react/src/components/Transfer.tsx)、[Transfer.tsx:93](../packages/react/src/components/Transfer.tsx)），`TRANSFER_KEYS` 还没有 `targetKeys`（[Transfer.tsx:45](../packages/react/src/components/Transfer.tsx)），导致调用方传 `targetKeys` 时不会影响组件状态，还会被当作未知属性透传到 root `div`。
- 🟠 P2｜Vue Transfer 只声明 `modelValue`，没有 `targetKeys` runtime prop（[Transfer.ts:53](../packages/vue/src/components/Transfer.ts)），拆分也只读 `props.modelValue`（[Transfer.ts:110](../packages/vue/src/components/Transfer.ts)）。这意味着 core/reference 的公共名与双端框架实际契约不一致。

**公共内容决策**：任务 H 统一决策。可选方向：① 在 React 接 `targetKeys` alias、Vue 增 `targetKeys` prop 并明确优先级（框架绑定仍推荐 `value`/`modelValue`）；② 修改 core/reference，把 Transfer 主受控名标为框架绑定专用，`targetKeys` 从共享公共面移除或 deprecated。无论哪种都需过 API baseline 流程，避免继续让 reference 推荐无效 prop。

**建议修复顺序**：P2，优先处理。先决定兼容 alias 还是文档/API 收敛，再补「传 `targetKeys` 可生效或不再出现在 reference」的测试。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm api:baseline:check`、`pnpm vitest run tests/react/Transfer.spec.tsx tests/vue/Transfer.spec.ts`。

---

#### C15-2 Cascader `showSearch.render` 声明为公共配置但双端零消费；搜索模式不支持 `changeOnSelect` 中间层结果 — **P2 / P3**

**发现问题**

- 🟠 P2｜`CascaderShowSearch.render` 在 core 类型中声明为「render matched options in search result」（[cascader.ts:47](../packages/core/src/types/cascader.ts)），但全链路无实现：`filterCascaderOptions` 只读取 `showSearch.filter` 和 `limit`（[cascader-utils.ts:266](../packages/core/src/utils/cascader-utils.ts)），React/Vue 搜索结果直接渲染 `item.label`（[Cascader.tsx:317](../packages/react/src/components/Cascader.tsx)、[Cascader.ts:420](../packages/vue/src/components/Cascader.ts)），没有任何 `render` 调用或测试。调用方传 `showSearch={{ render }}` 不会改变 UI。
- 🟢 P3｜`flattenCascaderOptions` 注释写「Add leaf options or all if changeOnSelect」（[cascader-utils.ts:229](../packages/core/src/utils/cascader-utils.ts)），但函数没有 `changeOnSelect` 参数，只把 leaf / `isLeaf` 路径加入搜索结果（[cascader-utils.ts:217](../packages/core/src/utils/cascader-utils.ts)、[cascader-utils.ts:230](../packages/core/src/utils/cascader-utils.ts)）。列模式下 `changeOnSelect` 能选择中间层（React [Cascader.tsx:174](../packages/react/src/components/Cascader.tsx)、Vue [Cascader.ts:206](../packages/vue/src/components/Cascader.ts)），搜索模式则不能展示中间层结果；现有双端搜索测试只覆盖 leaf 命中。

**公共内容决策**：`showSearch.render` 属已公开配置，应二选一：实现自定义搜索结果渲染（框架层渲染函数适配，过滤/limit 仍留 core），或标 deprecated 并从 generated references 中移除/澄清。`changeOnSelect` 搜索语义需文档明确：若希望搜索也可选中间层，应扩展 `flattenCascaderOptions(options, { changeOnSelect })` 这类 core 纯逻辑；若只支持 leaf 搜索，修正注释与 reference。

**建议修复顺序**：P2。先修 `showSearch.render` 名实不符；`changeOnSelect` 搜索语义作为同批 P3 文档/逻辑补齐。

**目标验证命令**：`pnpm vitest run tests/react/Cascader.spec.tsx tests/vue/Cascader.spec.ts`、如补 core direct spec 则追加 `tests/core/cascader-utils.spec.ts`，并跑 `pnpm api:validate`、`pnpm types:check`。

---

#### C15-3 TreeSelect/Cascader/Transfer core helper 缺 direct spec，只有组件间接覆盖 — **P3**

**发现问题**

- 🟢 P3｜C15 中 Tree 与 picker 基础层有 direct core spec：`tests/core/tree-utils.spec.ts` 覆盖 visible flatten、checked state、filter、keyboard action；`tests/core/picker-utils.spec.ts` 覆盖 trigger/listbox/option aria 与导航。但同组 `tree-select-utils.ts`、`cascader-utils.ts`、`transfer-utils.ts` 没有对应 `tests/core/*-utils.spec.ts`（`rg --files tests/core` 仅命中 tree/picker，没有这三类）。
- 🟢 P3｜这些 helper 不是纯样式：TreeSelect 包含 `findTreeSelectNode`、display label、flatten/filter（[tree-select-utils.ts:81](../packages/core/src/utils/tree-select-utils.ts)、[tree-select-utils.ts:133](../packages/core/src/utils/tree-select-utils.ts)、[tree-select-utils.ts:153](../packages/core/src/utils/tree-select-utils.ts)）；Cascader 包含路径解析、flatten、filter/limit、columns（[cascader-utils.ts:155](../packages/core/src/utils/cascader-utils.ts)、[cascader-utils.ts:217](../packages/core/src/utils/cascader-utils.ts)、[cascader-utils.ts:259](../packages/core/src/utils/cascader-utils.ts)、[cascader-utils.ts:280](../packages/core/src/utils/cascader-utils.ts)）；Transfer 包含 split/filter（[transfer-utils.ts:103](../packages/core/src/utils/transfer-utils.ts)、[transfer-utils.ts:125](../packages/core/src/utils/transfer-utils.ts)）。目前这些行为只经组件 spec 间接覆盖，回归定位成本偏高。

**公共内容决策**：不需要新增公共 API；补 core direct spec 即可。优先锁定会影响公共契约的纯逻辑：Cascader `filter/limit/render`、Transfer `split/filter`、TreeSelect 搜索祖先路径与 display fallback。

**建议修复顺序**：P3，测试补强项。可与 C15-1/C15-2 的实现或文档修复同批推进。

**目标验证命令**：新增后运行 `pnpm vitest run tests/core/tree-select-utils.spec.ts tests/core/cascader-utils.spec.ts tests/core/transfer-utils.spec.ts`，并保留现有双端组件 spec。

---

#### C15-4 TreeSelect / Cascader clear 控件用嵌套 `span`，键盘与本地化模式不如同族输入组件 — **P3**

**发现问题**

- 🟢 P3｜TreeSelect clear 是嵌在 trigger `<button>` 内的 `<span aria-label="Clear selection" onClick>`（React [TreeSelect.tsx:222](../packages/react/src/components/TreeSelect.tsx)、Vue [TreeSelect.ts:286](../packages/vue/src/components/TreeSelect.ts)），没有 `role="button"` / `tabIndex` / 键盘处理，且 `aria-label` 硬编码英文。Cascader clear 同样嵌在 trigger button 内；它有 `role="button"`，但仍不可独立聚焦、无键盘路径、英文标签硬编码（React [Cascader.tsx:248](../packages/react/src/components/Cascader.tsx)、Vue [Cascader.ts:304](../packages/vue/src/components/Cascader.ts)）。
- 🟢 P3｜对照 C14 已记录 Select 的相同模式；AutoComplete 则使用真正的 `<button aria-label>`。C15 说明该问题不是 Select 单点，而是 picker/trigger 类组件的统一 a11y/i18n 债务。

**公共内容决策**：框架层修复为主。统一 clear 控件结构（可聚焦按钮或明确键盘清除路径），避免 button 内嵌可点击 span；文案接已有 `common.clearText` 或新增清晰的 clear aria label 策略。core 可只提供文案解析/aria 小 helper，不必承接 DOM 结构。

**建议修复顺序**：P3，可与 C14-5/C14-6 合并做 picker 类 clear 控件统一修复。

**目标验证命令**：`pnpm vitest run tests/react/TreeSelect.spec.tsx tests/vue/TreeSelect.spec.ts tests/react/Cascader.spec.tsx tests/vue/Cascader.spec.ts`，补键盘与 ConfigProvider locale 断言。

---

#### C15-5 健康面与低优先清理：Tree 已真实虚拟化；Transfer 迁移逻辑可继续沉 core，Vue 有一处死代码 — **P3 / 观察**

**发现问题**

- ✅ Tree 的虚拟化不是声明型 no-op：core 类型声明 `virtual`/`height`/`itemHeight`（[tree.ts:181](../packages/core/src/types/tree.ts)、[tree.ts:186](../packages/core/src/types/tree.ts)），React/Vue 均通过 `VirtualList` 渲染 visible items（React [Tree.tsx:47](../packages/react/src/components/Tree.tsx)，Vue [Tree.ts:880](../packages/vue/src/components/Tree.ts)），双端 spec 均断言 500 节点时只渲染子集（React [Tree.spec.tsx:714](../tests/react/Tree.spec.tsx)、Vue [Tree.spec.ts:845](../tests/vue/Tree.spec.ts)）。Tree keyboard 也已统一到 `getTreeKeyboardAction` 并有 core+双端覆盖。
- 🟢 P3｜Transfer 的 split/filter 已沉 core，但 moveRight/moveLeft 的「过滤 disabled、生成 next target keys、清空 selected keys、返回 movedKeys」仍在 React/Vue 各写一遍（React [Transfer.tsx:140](../packages/react/src/components/Transfer.tsx)、Vue [Transfer.ts:158](../packages/vue/src/components/Transfer.ts)）。当前行为双端一致，属可维护性观察；若后续要扩展批量移动、保序或 filtered-only 语义，可把 move 纯计算沉到 core。
- 🟢 P3｜Vue Transfer 有一处无消费者的 computed 解构死代码：`const { sourceItems: _sourceItems, targetItems: _targetItems } = computed(...).value`（[Transfer.ts:106](../packages/vue/src/components/Transfer.ts)），真正渲染使用下一行 `computedData`（[Transfer.ts:110](../packages/vue/src/components/Transfer.ts)）。不影响运行，但可随 Transfer 下次清理删除。

**公共内容决策**：Tree 虚拟化与键盘健康面无需动作。Transfer move 逻辑是否沉 core 延后任务 H；Vue 死代码可作为无 API 影响的 P3 清理。

**建议修复顺序**：P3/观察。优先级低于 C15-1/C15-2；如碰 Transfer 修复 `targetKeys`，可顺手抽 move helper 与删 Vue 死代码。

**目标验证命令**：`pnpm vitest run tests/react/Tree.spec.tsx tests/vue/Tree.spec.ts tests/core/tree-utils.spec.ts tests/react/Transfer.spec.tsx tests/vue/Transfer.spec.ts`。

---

#### C15 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Transfer `targetKeys` core/reference 与双端实际受控名不一致（C15-1） | 实现 alias 或收敛/废弃共享 prop；需 API baseline 流程 | **P2** |
| Cascader `showSearch.render` 零消费（C15-2） | 实现自定义结果渲染，或 deprecated + 修 reference | **P2** |
| Cascader `changeOnSelect` 搜索中间层语义不清（C15-2） | 扩展 core flatten 选项或修正文档为 leaf-only | P3 |
| TreeSelect/Cascader/Transfer helper 缺 direct core spec（C15-3） | 补 core spec，不改 API | P3 |
| Picker 类 clear 控件 a11y/i18n（C15-4） | 与 C14 同批统一为可键盘操作 + locale 文案 | P3 |
| Transfer move 纯逻辑与 Vue 死代码（C15-5） | 可沉 core + 清理 Vue 无消费者 computed | P3/观察 |

---

#### C15 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| 比对 Transfer core props/reference 与双端实现 | core/reference 写 `targetKeys`；React 用 `value` 且未过滤 `targetKeys`；Vue 只用 `modelValue` | C15-1 |
| grep Cascader `showSearch.render` 消费者 | 仅 core 类型声明；filter 只读 `filter/limit`，双端直接渲染 `item.label` | C15-2 |
| `flattenCascaderOptions` vs `changeOnSelect` | helper 无 `changeOnSelect` 参数；搜索结果只收 leaf/isLeaf 路径；双端列模式可选中间层 | C15-2 |
| `rg --files tests/core` 对 C15 helper | 有 `tree-utils` / `picker-utils` direct spec；无 `tree-select-utils` / `cascader-utils` / `transfer-utils` direct spec | C15-3 |
| 比对 TreeSelect/Cascader clear 控件 | 双端均为 trigger button 内嵌 span；硬编码 `Clear selection`，无独立键盘路径 | C15-4 |
| Tree virtual 与 keyboard | 双端 `VirtualList` 接入 + 500 节点子集渲染 spec；`getTreeKeyboardAction` core+双端覆盖 | C15-5 |
| Transfer move / Vue dead code | split/filter 进 core；moveRight/moveLeft 双端重复；Vue `_sourceItems/_targetItems` 无消费者 | C15-5 |
| `corepack pnpm vitest run tests/react/Tree.spec.tsx tests/react/TreeSelect.spec.tsx tests/react/Cascader.spec.tsx tests/react/Transfer.spec.tsx tests/vue/Tree.spec.ts tests/vue/TreeSelect.spec.ts tests/vue/Cascader.spec.ts tests/vue/Transfer.spec.ts tests/core/tree-utils.spec.ts tests/core/picker-utils.spec.ts` | ✅ 10 个测试文件、285 个测试通过 | C15 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C15 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C15 基线 |

> 本轮 C15 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮实跑 C15 目标 vitest（10 文件 285 测试通过）、`corepack pnpm api:validate` 与 `corepack pnpm types:check`，均为只读校验、未改动仓库。

---

### C16 日期组

**扫描范围**：DatePicker、Calendar 的全链路——core 类型 `packages/core/src/types/{datepicker,calendar}.ts`，core 工具 `utils/{date-utils,calendar-utils,datepicker-i18n,datepicker-styles}.ts` 与 `utils/i18n/datepicker-locales/*`，React 实现 `components/DatePicker.tsx` + `DatePicker/{state,render-calendar,render-mobile,types}.ts(x)`、`components/Calendar.tsx`，Vue 实现 `components/{DatePicker,Calendar}.ts`，双端定向 spec、`tests/core/{date-utils,datepicker-i18n}.spec.ts`，examples `DatePickerDemo`/`CalendarDemo`，generated `component-index.md`/`i18n.md`。

**结论速览**：日期组核心受控/范围/键盘行为健康、双端 spec 覆盖充分——受控量（`value`/`onChange` ↔ `modelValue`/`update:modelValue`）、Arrow/Escape/Enter 键盘、跨月聚焦、clear、shortcuts、range 的 OK/Today 均双端锁定且行为一致。**无 P1**。需处理项集中两类：① **该合未合 / 跨框架重复**——DatePicker 的键盘导航·聚焦·范围单元格状态在 React `state.ts` 与 Vue `DatePicker.ts` 各手写一遍，全组没有 picker-utils 式共享层（对照 C14-4）；Calendar 是独立、更弱的第二套日历实现（纯鼠标 + 无 locale）。② **i18n / a11y 缺口**——Calendar 纯鼠标 `<div onClick>` 且无 locale（硬编码英文 `WEEKDAYS`/`MONTHS`），DatePicker 仅接 `props.locale` 不接 ConfigProvider（复核 B-1）、文案双源（复核 B-2）、`format` 在带 locale 时被静默忽略。其余为公共类型卫生与 Vue parity 的 P3。

---

#### C16-1 DatePicker 键盘导航 / 聚焦 / 范围单元格逻辑双端各手写一遍，全组无共享 picker 层（该合未合 + 跨框架重复）— **P2**

**发现问题**

- 🟠 P2｜DatePicker 的整套日历交互纯逻辑在 React 与 Vue 之间**近乎逐字重复**：`moveFocus`（42 次步进、跳过禁用日、跨月翻页）、`handleCalendarKeyDown`（Escape/ArrowLeft/Right/Up/Down/Enter/Space switch）、`getFirstEnabledIsoInView`、`getPreferredFocusIso`、`focusDateButtonByIso`——React [state.ts:210](../packages/react/src/components/DatePicker/state.ts)/[:256](../packages/react/src/components/DatePicker/state.ts)/[:292](../packages/react/src/components/DatePicker/state.ts) 与 Vue [DatePicker.ts:352](../packages/vue/src/components/DatePicker.ts)/[:395](../packages/vue/src/components/DatePicker.ts)/[:438](../packages/vue/src/components/DatePicker.ts) 仅差 React `useCallback`/ref 与 Vue `nextTick`/`ref` 的框架外壳。
- 🟠 P2｜每个日格的范围状态计算（`isRangeStart`/`isRangeEnd`/`isInRange`/`isBeforeRangeStart`/`isSelected`/`iso`）也在两端重复——React [render-calendar.tsx:63](../packages/react/src/components/DatePicker/render-calendar.tsx)-133 与 Vue [DatePicker.ts:848](../packages/vue/src/components/DatePicker.ts)-926 是同一段派生逻辑写两遍。
- ℹ️ 对照：Select 家族有 [picker-utils.ts](../packages/core/src/utils/picker-utils.ts) 提供共享导航/aria（C14-4 指出 Select 绕开它去用底层 finder）；DatePicker 家族**连共享层都没有**，纯逻辑全散在框架层。日历键盘 spec 双端已锁（React `DatePicker.spec.tsx:282`/`:316` ArrowRight + 跨月；Vue 对应），故任何抽取需逐项保行为。

**公共内容决策**：**合并到 core**。抽纯函数下沉（`date-utils` 或新 `datepicker-utils`）：`resolveCalendarKeyAction(key)`（键→意图映射，类比 `getPickerTriggerKeyAction`）、`getNextFocusableDateIso(baseIso, deltaDays, isDisabled, maxAttempts)`、`getCalendarCellState(date, ctx)`（返回 `{isSelected,isToday,isInRange,isRangeStart,isRangeEnd,isDisabled,isCurrentMonth,iso}`）；DOM focus/querySelector/setViewing 编排留框架层。无公共 API 破坏（纯内部重构）。

**建议修复顺序**：P3→P2 渐进。先 cell-state（纯派生、零风险），再 key-action 映射，最后 focus 步进；每步跑双端 DatePicker spec 保行为不变。

**目标验证命令**：`pnpm vitest run tests/react/DatePicker.spec.tsx tests/vue/DatePicker.spec.ts`、`pnpm types:check`、`pnpm api:validate`。

---

#### C16-2 Calendar 纯鼠标 `<div onClick>`，无 button/role/tabindex/键盘，与 DatePicker 自带日历的可访问性不对称（a11y）— **P2**

**发现问题**

- 🟠 P2｜Calendar 的日格与月格都是 `<div onClick>`：**无 `role="gridcell"`、无 `tabindex`、无 `onKeyDown`**（React [Calendar.tsx:139](../packages/react/src/components/Calendar.tsx)-148、[:113](../packages/react/src/components/Calendar.tsx)；Vue [Calendar.ts:160](../packages/vue/src/components/Calendar.ts)-172、[:127](../packages/vue/src/components/Calendar.ts)）——键盘用户完全无法操作 Calendar（既不能聚焦也不能选择）。
- 🟢 P3｜对照同组 DatePicker 的日历用 `<button role="gridcell">` + roving `tabindex` + Arrow/Enter 全键盘（[render-calendar.tsx:105](../packages/react/src/components/DatePicker/render-calendar.tsx)、[DatePicker.ts:895](../packages/vue/src/components/DatePicker.ts)）。同一 C16 组内并存两套可访问性标准。
- ℹ️ 测试未锁：[tests/react/Calendar.spec.tsx:17](../tests/react/Calendar.spec.tsx)、[tests/vue/Calendar.spec.ts:16](../tests/vue/Calendar.spec.ts) 仅断言 `[role="group"]`，无 button/keyboard 断言，改造空间安全。

**公共内容决策**：框架层 a11y 修复（日/月格改 `<button>` + `role="gridcell"` + roving tabindex + 键盘导航），可复用 C16-1 抽出的 `getNextFocusableDateIso`；不入 core 结构变更。

**建议修复顺序**：P2。先补 Calendar 键盘回归测试，再改结构，双端对齐 DatePicker 的交互模型。

**目标验证命令**：`pnpm vitest run tests/react/Calendar.spec.tsx tests/vue/Calendar.spec.ts`。

---

#### C16-3 Calendar 无 locale，硬编码英文 `WEEKDAYS`/`MONTHS`，而 date-utils 已有 locale 版被 DatePicker 使用（i18n 缺口 + 该合未合）— **P2**

**发现问题**

- 🟠 P2｜[calendar-utils.ts:68](../packages/core/src/utils/calendar-utils.ts)-83 的 `WEEKDAYS`（`Su…Sa`）、`MONTHS`（`Jan…Dec`）为**硬编码英文**，且**仅被 Calendar 两端消费**（React `Calendar.tsx:100`/`:113`/`:125`、Vue `Calendar.ts:107`/`:127`/`:143`）；Calendar 月名/周名永远英文。core `CalendarProps`（[calendar.ts:9](../packages/core/src/types/calendar.ts)）也根本没有 `locale` 字段。
- 🟠 P2｜对照 [date-utils.ts](../packages/core/src/utils/date-utils.ts) 已提供 locale 感知的 `getShortDayNames(locale)`/`getShortMonthNames(locale)`/`formatMonthYear(y,m,locale)`，DatePicker 正用这些（`state.ts:162`、`DatePicker.ts:317`/`:820`）。Calendar 重造了一套英文专用名，属重复实现 + i18n 缺口。
- ℹ️ examples `CalendarDemo` 全程无 `locale`，印证 Calendar 当前无本地化入口。

**公共内容决策**：Calendar 应消费已有 locale 感知 helper 并补 `locale` prop（与 DatePicker 一致）；`WEEKDAYS`/`MONTHS` 是 public flat utility，按任务 H 流程列 **deprecation 候选**（不直接删）。`getMonthDays`（[calendar-utils.ts:85](../packages/core/src/utils/calendar-utils.ts)）可保留为 `getCalendarDays` 的 `Date[]` 视图或一并收敛。

**建议修复顺序**：P2。先给 Calendar 接 `locale` + 切到 date-utils 名称源，再评估 `WEEKDAYS`/`MONTHS` 废弃。属公共 API 新增（Calendar 加 prop）+ 旧常量废弃，走 H 流程。

**目标验证命令**：`pnpm vitest run tests/react/Calendar.spec.tsx tests/vue/Calendar.spec.ts tests/core/date-utils.spec.ts`、`pnpm api:validate`。

---

#### C16-4 `getIntlOptionsFromDateFormat` 是无效 switch（五分支全等），导致带 locale 时 `format` 被静默忽略（冗余 + latent 显示问题）— **P2**

**发现问题**

- 🟠 P2｜[date-utils.ts:21](../packages/core/src/utils/date-utils.ts)-33 的 switch 四个 `case` + `default` 返回**完全相同**的 `{ year:'numeric', month:'2-digit', day:'2-digit' }`；故 `formatDate(date, format, locale)` 一旦有 `locale`，输出顺序由 Intl/locale 决定，`format`（`MM/dd/yyyy` vs `dd/MM/yyyy` vs `yyyy-MM-dd`）**无任何作用**（连补零也由 locale 决定）。
- 🟠 P2｜双端输入框显示都走该路径：`displayValue` = `formatDate(date, props.format, localeCode)`（[state.ts:128](../packages/react/src/components/DatePicker/state.ts)、[DatePicker.ts:289](../packages/vue/src/components/DatePicker.ts)）。用户同时设 `locale` + `format` 时（`DatePickerDemo` 即此用法）`format` 被吞。
- ℹ️ 测试未覆盖差异：[tests/core/date-utils.spec.ts:76](../tests/core/date-utils.spec.ts) 只锁 `yyyy-MM-dd` + locale；无 locale 时四个 format 都测了（[:107](../tests/core/date-utils.spec.ts)-110），故差异区是「format×locale」矩阵，恰好没测。

**公共内容决策**：core 纯逻辑修正，二选一——要么按 `format` 顺序构造 Intl options（让 format 在 locale 下仍决定 年/月/日 次序），要么删掉无效 switch 并在 JSDoc 明确「带 locale 时由 locale 决定顺序」；补 format×locale 矩阵测试锁定语义。无公共 API 破坏。

**建议修复顺序**：P2。先定语义（format 是否应在 locale 下生效）再落地。

**目标验证命令**：`pnpm vitest run tests/core/date-utils.spec.ts`、`pnpm types:check`。

---

#### C16-5 DatePicker i18n 复核：不接 ConfigProvider（B-1）+ 文案双源（B-2）— **P2**

**发现问题**

- 🟠 P2｜（复核 **B-1**）React [state.ts:116](../packages/react/src/components/DatePicker/state.ts)/[:166](../packages/react/src/components/DatePicker/state.ts) 与 Vue [DatePicker.ts:276](../packages/vue/src/components/DatePicker.ts)/[:322](../packages/vue/src/components/DatePicker.ts) 只读 `props.locale`/`props.labels`，**从不读 `useTigerConfig()`**；`<ConfigProvider locale>` 对日历文案不生效。[references/i18n.md:17](../skills/tigercat/references/i18n.md) 把 DatePicker 列为「Localized component」，实际只是组件 prop 级本地化，措辞偏宽。
- 🟠 P2｜（复核 **B-2**）文案双源：[datepicker-i18n.ts:34](../packages/core/src/utils/datepicker-i18n.ts)-82 的 `DATEPICKER_LABELS_BY_LANGUAGE` 仅手写 `en/zh/es/fr/de/pt/ar` 7 组 fallback labels；而 [datepicker-locales/index.ts](../packages/core/src/utils/i18n/datepicker-locales/index.ts) 导出 13 个 preset。`getDatePickerLabels('ja-JP'|'ko-KR'|'th-TH'|'vi-VN'|'id-ID'|'zh-TW')` 这 **6 个语言只回落英文 labels**，但直接传对应 preset 又能拿到完整翻译。[tests/core/datepicker-i18n.spec.ts](../tests/core/datepicker-i18n.spec.ts) 只覆盖 7 个 inline 语言（`:28`-33）+ 2 个 preset merge（`:13`/`:36`），未覆盖这 6 个字符串 locale。

**公共内容决策**：同 B-1/B-2——locale 解析留 core，框架层接 ConfigProvider merged locale（优先级 `props.locale` > ConfigProvider locale > 默认）；以 `datepicker-locales/*` preset 为 labels 单一来源，`datepicker-i18n.ts` 只保留解析/合并/fallback。复用现有 `TigerLocale.datePicker` 字段，不新增公共字段。

**建议修复顺序**：P2，走任务 H 流程；本段从组件视角复核并补「6 个 preset-only 语言字符串 locale 回落英文」的覆盖缺口取证。

**目标验证命令**：`pnpm vitest run tests/core/datepicker-i18n.spec.ts tests/react/DatePicker.spec.tsx tests/vue/DatePicker.spec.ts`、`pnpm api:validate`。

---

#### C16-6 core `CalendarProps`（types/calendar.ts）是幽灵共享类型——双端都不消费 — **P3**

**发现问题**

- 🟢 P3｜[types/calendar.ts:9](../packages/core/src/types/calendar.ts) 的 `CalendarProps`（`mode`/`fullscreen`/`disabledDate`/`className`）经 core barrel 导出，但 React/Vue **都不 import 它**：React [Calendar.tsx:18](../packages/react/src/components/Calendar.tsx) 自定义 `CalendarProps`、Vue [Calendar.ts:18](../packages/vue/src/components/Calendar.ts) 用 `VueCalendarProps`，且两端都额外加了核心类型没有的 `value`/`modelValue`/`onChange`/`onPanelChange`。所谓「shared」类型既非真源、也不够用，属漂移/死类型。

**公共内容决策**：要么把它做成真正源头（上提 value/事件契约供双端 extend），要么按 H 流程标 deprecated 后移除（public 类型不直接删）。

**建议修复顺序**：P3，随 C16-3 给 Calendar 补 `locale`/受控量时一并定型。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`。

---

#### C16-7 Vue parity 簇：shortcut 不归一化 + 多发 `change` + 接口漏 `shortcuts` — **P3**

**发现问题**

- 🟢 P3｜**shortcut 归一化双端不一致**：Vue [DatePicker.ts:502](../packages/vue/src/components/DatePicker.ts)-506 `handleShortcut` 直接 `emitValue(val)`（原样发 shortcut 值）；React [state.ts:395](../packages/react/src/components/DatePicker/state.ts)-420 会 `normalizeDate`/`parseDate`、处理 range 元组。结果：字符串/范围 shortcut 时 Vue 发原值、React 发 `Date`；即便 Date shortcut，Vue 保留时间分量、React 归零到午夜。Vue shortcut 测试只用 Date 值（`DatePicker.spec.ts:494`/`:515`），未锁该差异。
- 🟢 P3｜**多发 `change` 事件**：Vue `emitValue` 同时发 `update:modelValue` + `change`（[DatePicker.ts:347](../packages/vue/src/components/DatePicker.ts)-350），React 只有 `onChange`（≈ v-model）；Vue Calendar `selectDay` 亦同发两者（[Calendar.ts:76](../packages/vue/src/components/Calendar.ts)-77）。与 C14-7（AutoComplete Vue 多 `change`）同型的双发模式。
- 🟢 P3｜**接口/运行时漂移**：`VueDatePickerProps` 接口（[DatePicker.ts:59](../packages/vue/src/components/DatePicker.ts)-77）**漏列 `shortcuts`**，但运行时 props（[:226](../packages/vue/src/components/DatePicker.ts)）已声明。同 C12-3（Vue InputNumber 接口漂移）。

**公共内容决策**：框架层对齐——Vue shortcut 比照 React 归一化；`change` 事件契约建议全库统一取舍（保留并文档化为非 v-model 事件，或移除对齐 React）；补 `shortcuts` 到 `VueDatePickerProps`。均不涉及 core 结构。

**建议修复顺序**：P3，随 DatePicker 下次改动顺手。

**目标验证命令**：`pnpm vitest run tests/vue/DatePicker.spec.ts tests/react/DatePicker.spec.tsx`、`pnpm types:check`。

---

#### C16-8 受控量 / 双端 parity 健康面 + 低优先观察 — **P3 / 观察**

**发现问题**

- ✅ 健康：受控量/事件双端对称（React `value`/`onChange` 单/范围判别联合 ↔ Vue `modelValue`/`update:modelValue`）；range 规则（end 不早于 start）、跨月聚焦、Escape 关闭 + 恢复焦点、RTL 镜像导航图标（`getLocaleDirection`，双端一致）、shortcuts 渲染/关闭、`isDateInRange` 禁用边界均双端 spec 锁定且行为一致。
- 🟢 P3｜移动端 wheel `<select aria-label="Year"/"Month"/"Day">`、Start/End 切换、`aria-label="Mobile OK"` 在双端均**硬编码英文**、未走 `labels.*`（桌面端走了），i18n 边界不对称（React [render-mobile.tsx:39](../packages/react/src/components/DatePicker/render-mobile.tsx)/[:74](../packages/react/src/components/DatePicker/render-mobile.tsx)、Vue [DatePicker.ts:748](../packages/vue/src/components/DatePicker.ts)/[:785](../packages/vue/src/components/DatePicker.ts)）。
- 🟢 观察｜Calendar 的 `value`/`modelValue` 视图只在初始化读一次（[Calendar.tsx:38](../packages/react/src/components/Calendar.tsx)、[Calendar.ts:39](../packages/vue/src/components/Calendar.ts)），后续 prop 变化不跟随——双端一致（受控视图设计）。
- 🟢 观察｜`getCalendarDays` 签名 `(Date|null)[]` 但实现恒非空，`getMonthDays` 直接 `as Date[]`（[calendar-utils.ts:85](../packages/core/src/utils/calendar-utils.ts)-87）依赖未文档化不变量；DatePicker 渲染仍 `if (!date) return null` 防御——类型与实现轻微不一致。

**公共内容决策**：mobile aria 文案可随 C16-5 一并接 locale；其余健康面/观察无需动作。

**建议修复顺序**：P3 观察，随相应修复顺带。

**目标验证命令**：随相应修复的 `pnpm vitest run tests/react/DatePicker.spec.tsx tests/vue/DatePicker.spec.ts tests/react/Calendar.spec.tsx tests/vue/Calendar.spec.ts`。

---

#### C16 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| DatePicker 键盘/聚焦/cell-state 双端重复（C16-1） | **合并→core 共享 helper**（cell-state → key-action → focus 步进渐进） | **P2** |
| Calendar 纯鼠标无键盘（C16-2） | **框架层 a11y 修复**（button + roving tabindex + 键盘），复用 C16-1 helper | **P2** |
| Calendar 无 locale + `WEEKDAYS`/`MONTHS` 硬编码英文（C16-3） | **Calendar 接 locale 用 date-utils 名称源；旧常量走 H 废弃** | **P2** |
| `getIntlOptionsFromDateFormat` 无效 switch / format 被吞（C16-4） | **core 修正语义 + 补 format×locale 测试** | **P2** |
| DatePicker 不接 ConfigProvider + 文案双源（C16-5，复核 B-1/B-2） | **框架层接 merged locale；preset 作 labels 单源（走 H）** | **P2** |
| core `CalendarProps` 幽灵共享类型（C16-6） | **做成真源 or 走 H 废弃** | P3 |
| Vue shortcut 不归一化 / 多发 change / 接口漏 shortcuts（C16-7） | **框架层对齐 React；change 契约全库统一** | P3 |
| 受控量/parity 健康面 + mobile aria 英文 + 类型观察（C16-8） | **健康面保持；mobile aria 随 C16-5 接 locale** | P3/观察 |

---

#### C16 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| 比对 React `state.ts` vs Vue `DatePicker.ts` 键盘/聚焦/cell-state | `moveFocus`/`handleCalendarKeyDown`/`getPreferredFocusIso`/范围 cell 派生近乎逐字重复，全组无共享层 | C16-1 |
| 比对 Calendar vs DatePicker 日历元素 | Calendar 日/月格 `<div onClick>` 无 role/tabindex/键盘；DatePicker 用 `<button role="gridcell">` + 键盘 | C16-2 |
| grep `WEEKDAYS`/`MONTHS`/`getMonthDays` 消费者 | 仅 Calendar 两端；硬编码英文；date-utils 已有 locale 版被 DatePicker 用；`CalendarProps` 无 `locale` | C16-3 |
| 读 `getIntlOptionsFromDateFormat` 五分支 | 四 case + default 返回同一对象；带 locale 时 `format` 无效；spec 仅锁 `yyyy-MM-dd`+locale | C16-4 |
| grep `getDatePickerLabels` 消费者 + datepicker-i18n 源 | 仅 DatePicker 两端用；inline map 7 语言 vs 13 preset，6 个 preset-only 语言字符串 locale 回落英文且无 spec | C16-5 |
| grep core `CalendarProps` 消费者 | 双端零 import；React/Vue 各自定义 props 且额外含 value/事件 | C16-6 |
| 比对 Vue/React `handleShortcut` + emits + 接口 | Vue 原样 emit / 多发 `change` / `VueDatePickerProps` 漏 `shortcuts` | C16-7 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 6 文件 117 测试通过；`api:validate` 一致性 0 问题；`types:check` 全部 props 类型导出 | C16 基线 |

> 本轮 C16 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮以本机 pnpm 11.9.0 实跑 C16 目标 vitest（6 文件 117 测试通过）、`pnpm api:validate`（一致性 0 问题）与 `pnpm types:check`（全部 props 类型导出），均为只读校验、未改动仓库。

---

### C17 时间组（TimePicker / Countdown / CronEditor）— 已扫描（2026-06-27）

**扫描范围**：TimePicker、Countdown、CronEditor 三个组件的全链路——core 类型 [timepicker.ts](../packages/core/src/types/timepicker.ts)、[countdown.ts](../packages/core/src/types/countdown.ts)、[cron-editor.ts](../packages/core/src/types/cron-editor.ts)，core 工具 [time-utils.ts](../packages/core/src/utils/time-utils.ts)、[timepicker-utils.ts](../packages/core/src/utils/timepicker-utils.ts)、[countdown-utils.ts](../packages/core/src/utils/countdown-utils.ts)、[cron-editor-utils.ts](../packages/core/src/utils/cron-editor-utils.ts)，React 实现 [TimePicker.tsx](../packages/react/src/components/TimePicker.tsx) 与 `TimePicker/{state,render-desktop,render-mobile,types,icons}`、[Countdown.tsx](../packages/react/src/components/Countdown.tsx)、[CronEditor.tsx](../packages/react/src/components/CronEditor.tsx)，Vue 实现 [TimePicker.ts](../packages/vue/src/components/TimePicker.ts)、[Countdown.ts](../packages/vue/src/components/Countdown.ts)、[CronEditor.ts](../packages/vue/src/components/CronEditor.ts)，tests/{core,react,vue} 9 个定向 spec，examples TimePickerDemo/CountdownDemo/CronEditorDemo，以及 generated references（component-index.md、shared/props/{form,data}.md、shared/api-summary.md）。

**结论速览**：C17 基线健康：目标 vitest、API 校验、公共类型导出检查均通过；无 P1。TimePicker 的 i18n、键盘 roving focus、12/24 小时显示、范围排序和步进列表已有 core helper + 双端测试覆盖。Countdown 的格式化、payload、finish、interval 与 `now` 初始值行为已由 core/React/Vue 测试锁定。需记录的主要问题是 **TimePicker 秒级值与分钟级范围判断的契约不完整**；另有 CronEditor 的 `className` 透传与 core props 说明存在 Vue 侧小偏差。

#### C17-1 TimePicker `minTime`/`maxTime` 只按分钟比较，秒级值与 `showSeconds` 场景存在契约缺口 — **P2**

- 🟠 P2｜core `TimePickerProps` 允许 `value/defaultValue` 使用 `HH:mm` 或 `HH:mm:ss`，组件也支持 `showSeconds` 与 `secondStep`；[parseTime](../packages/core/src/utils/time-utils.ts) 接受第三段 seconds 并校验 0-59。
- 🟠 P2｜但 [isTimeInRange](../packages/core/src/utils/time-utils.ts) 只把当前值、`minTime`、`maxTime` 转成 `hours * 60 + minutes` 比较，忽略 seconds。若设置 `minTime="10:00:30"`、`maxTime="10:00:45"` 这类秒级边界，`10:00:00` 与 `10:00:59` 会被视为同一分钟内合法。
- 🟠 P2｜React/Vue 双端小时、分钟列会调用 `isTimeInRange` 禁用越界项，但秒列没有对应禁用判断：React [render-desktop.tsx](../packages/react/src/components/TimePicker/render-desktop.tsx) 秒按钮始终用 `getTimePickerItemClasses(isSelected, false)`，Vue [TimePicker.ts](../packages/vue/src/components/TimePicker.ts) 秒按钮同样不传 disabled；移动端秒 `<option>` 也不禁用。
- 🟠 P2｜现有测试覆盖分钟级边界、秒列选择、范围排序，但未覆盖秒级 `minTime/maxTime`。因此当前门禁通过，问题属于公开契约缺口而非现有测试失败。

**公共内容决策**：`minTime/maxTime` 的有效域应由 core 单一 helper 定义，再由双端 UI 复用。后续需二选一：① 明确支持秒级边界，将 `isTimeInRange` 改为总秒比较并补 `isSecondDisabled`/秒列 disabled；② 明确范围 props 只承诺分钟级，收窄 JSDoc/generated references，并在 `showSeconds` 场景说明 seconds 不参与禁用。倾向方案①，因为 `parseTime` 与 value 契约已经接受秒级字符串。

**建议修复顺序**：P2。先补 core `isTimeInRange` 秒级单测，再双端补秒列禁用与组件测试；最后同步 props 文档。

**目标验证命令**：

```bash
pnpm vitest run tests/core/timepicker-utils.spec.ts tests/react/TimePicker.spec.tsx tests/vue/TimePicker.spec.ts
pnpm run api:validate
pnpm run types:check
```

#### C17-2 CronEditor core `className` prop 与 Vue runtime 透传不完全一致 — **P3**

- 🟢 P3｜core [CronEditorProps](../packages/core/src/types/cron-editor.ts) 暴露 `className?: string`，React [CronEditor.tsx](../packages/react/src/components/CronEditor.tsx) 直接合并 `className` 到 root。
- 🟢 P3｜Vue [CronEditor.ts](../packages/vue/src/components/CronEditor.ts) 运行时 props 没有 `className`，root 只合并 `attrs.class`。这与同组 Vue Countdown（显式支持 `className` 并合并 `attrs.class`）以及 Vue TimePicker（接口/props 都含 `className`）不完全一致。
- 🟢 P3｜因为 Vue 标准 `class` attr 可正常工作，且 generated props 只列 core 前 3 个 props，当前不是功能性阻断；但 core props 公开了 `className`，Vue 侧没有同名 runtime prop，长期会增加文档与框架 parity 解释成本。

**公共内容决策**：低风险补齐 Vue `className` prop 更符合现有 core/React/同组组件口径；若维护者希望 Vue 只推荐标准 `class`，则应收窄 core/generator 对 Vue 的说明，避免把 React 风格 `className` 暗示为双端一致。

**建议修复顺序**：P3。可随下一批 Vue className 透传清理统一处理，不需要为 C17 单独开 API 变更。

**目标验证命令**：

```bash
pnpm vitest run tests/react/CronEditor.spec.tsx tests/vue/CronEditor.spec.ts
pnpm run api:validate
pnpm run types:check
```

#### C17-3 Countdown 纯逻辑与双端运行时契约健康（观察）— **无缺陷**

- ✅ core [countdown-utils.ts](../packages/core/src/utils/countdown-utils.ts) 已集中处理 timestamp 解析、remaining clamp、parts 拆分、格式 token、payload 生成；tests/core 覆盖数字/Date/ISO/非法值、day-aware format、毫秒、zero finished。
- ✅ React/Vue Countdown 都用 core `getCountdownRemaining`、`formatCountdown`、`createCountdownPayload`，并测试了初始 `now`、Date/ISO value、interval tick、`onChange`/`change` payload、finish 只触发一次、interval=0 不启动 timer、value/now rerender。
- ✅ `now` 的行为在双端测试中明确为“初始/重算使用 `now`，tick 使用实时 `Date.now()`”，本轮按既有测试契约视为设计选择，不记录为缺陷。

**公共内容决策**：保持现状。若未来要支持“完全由 `now` 驱动的受控倒计时”，应新增明确 props 或文档模式，不改变当前 interval tick 语义。

**建议修复顺序**：无。

**目标验证命令**：

```bash
pnpm vitest run tests/core/countdown-utils.spec.ts tests/react/Countdown.spec.tsx tests/vue/Countdown.spec.ts
```

---

#### C17 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| TimePicker 秒级范围判断（C17-1） | 倾向 core 改总秒比较 + 双端秒列 disabled；或文档明确分钟级契约 | **P2** |
| CronEditor Vue `className` 透传（C17-2） | 补 Vue runtime prop，或收窄 Vue 文档为标准 `class` attr | P3 |
| Countdown now/tick 契约（C17-3） | 保持现状；如需受控 now，另设明确模式 | 观察 |

---

#### C17 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| 比对 `parseTime` 与 `isTimeInRange` | `parseTime` 接受 seconds；`isTimeInRange` 只比较小时/分钟 | C17-1 |
| grep 秒列 disabled / `isSecondDisabled` | 双端仅小时/分钟列禁用；秒列按钮和移动端 option 不禁用 | C17-1 |
| 比对 CronEditor `className` | core/React 有同名 prop；Vue 只合并 `attrs.class` | C17-2 |
| 比对 Countdown core + 双端测试 | 格式化、payload、finish、interval、`now` 初始值均有测试锁定 | C17-3 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 9 文件 174 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C17 基线 |

> 本轮 C17 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮以 packageManager 指定的 pnpm 11.9.0 实跑 C17 目标 vitest（9 文件 174 测试通过）、`pnpm run api:validate`（一致性检查 0 问题）与 `pnpm run types:check`（全部 props 类型导出），均为只读校验、未改动仓库。

---

### C18 Upload 单组

**扫描范围**：Upload、FileManager、Signature 的全链路——core 类型 `packages/core/src/types/{upload,signature,file-manager}.ts`，core 工具 `utils/{upload-utils,upload-labels,signature-utils,file-manager-utils}.ts`（对照 `locale-utils.ts` 的 `DEFAULT_UPLOAD_LABELS`/`ZH_CN_UPLOAD_LABELS`、`tailwind-entry.ts`），React 实现 `components/{Upload.tsx,FileManager.tsx,Signature.tsx}` 与 `index.tsx` 导出，Vue 实现 `components/{Upload.ts,FileManager.ts,Signature.ts}` 与 `index.ts` 导出，`tests/core/{upload-utils,file-manager-utils,signature-utils}.spec.ts`、`tests/{react,vue}/{Upload,FileManager,Signature}.spec.*`，examples `{Upload,FileManager,Signature}Demo`。CropUpload 属 C20，排除。

**结论速览**：Signature 双端健康对称（React `forwardRef`+`onChange` / Vue `v-model`+`expose` 属惯例差异，非缺陷），笔画/导出/清除/键盘双端一致且测试充分。问题集中在 Upload 与 FileManager。**无 P1**（不阻断发布门禁）。需处理项：① Upload picture-card/上传遮罩用 Tailwind v3 `bg-opacity-*`（v4 已移除）→ 半透明遮罩退化为纯色（P2，全仓 ~18 文件共性，FileManager/Signature 已用 v4 正确写法）；② FileManager `draggable` 半接线（仅设 `draggable` 属性 + `data-drag-id`，无 drop/reorder 处理），`applyFileDragReorder` 公共 core helper 零生产消费（P2）；③ React FileManager `Loading...`/`Root` 硬编码、Vue loading 走 locale → i18n 不对称（P2）；④ core `FileManagerProps` 公共类型漂移 + `columns` 死字段（P2）。其余为 core 文件大小/扩展名重复（P3）、FileManager 键盘 a11y 缺口（P3）、Upload 主题 token 与内联 SVG 重复（P3）、一组低优先 latent（P3/观察）。

---

#### C18-1 Upload picture-card / 上传遮罩用 Tailwind v3 `bg-opacity-*`（v4 已移除）→ 半透明退化为纯色 — **P2**

**发现问题**

- 🟠 P2｜本仓 Tailwind 为 **v4**（[package.json:222](../packages/core/package.json) `tailwindcss ^4.0.0`；[tailwind-entry.ts:1](../packages/core/src/tailwind-entry.ts) 注释自称「Tailwind v4 `@plugin` entry」）。v4 **移除**了 `bg-opacity-*` 等独立不透明度工具类，须改用 `/<alpha>` 斜杠写法。Upload 仍用 v3 写法：
  - picture-card 悬浮遮罩 `bg-black bg-opacity-0 hover:bg-opacity-50`（[Upload.tsx:476](../packages/react/src/components/Upload.tsx)、[Upload.ts:719](../packages/vue/src/components/Upload.ts)）——`bg-opacity-*` 不生成 → 遮罩底色恒为**纯黑 `bg-black`**；遮罩可见性虽另由有效的 `opacity-0 hover:opacity-100` 控制，但 hover 时呈现 100% 纯黑而非 50% 半透明，盖住图片。
  - 上传中指示层 `bg-white bg-opacity-75`（[Upload.tsx:524](../packages/react/src/components/Upload.tsx)、[Upload.ts:797](../packages/vue/src/components/Upload.ts)）→ 退化为**纯白**盖住缩略图（本应 75% 半透明）。
- ℹ️ 同组对照：FileManager 的 loading 遮罩已用 v4 正确写法 `bg-[var(--tiger-bg,#ffffff)]/60`（[file-manager-utils.ts:52](../packages/core/src/utils/file-manager-utils.ts)），Signature 类也全用 CSS 变量——**Upload 是本组唯一的 v3 残留**。
- ℹ️ 全仓共性（非 C18 独有）：`bg-opacity-*` 在约 18 个文件出现（ActivityFeed/CommentThread/Tour/NotificationCenter、carousel/image/qrcode/spotlight/tour/code/color-swatch-utils 等），宜作一次全仓 v4 迁移；C18 仅认领 Upload 的 4 处。

**公共内容决策**：框架层/core 工具类样式修复，不涉及公共 API。Upload 4 处 `bg-opacity-x` → `bg-black/0`、`hover:bg-black/50`、`bg-white/75`。归入「全仓 Tailwind v4 `bg-opacity-*` 迁移」专项（供任务 F/H 汇总统一处理），避免逐组重复发现。

**建议修复顺序**：P2。先修 Upload 这 4 处（与 FileManager 既有斜杠写法对齐），再随任务 F 扫出的其余文件统一迁移。

**目标验证命令**：`pnpm example:build`（确认生成 CSS 含斜杠透明度类、不再引用 `bg-opacity-*`）、`pnpm vitest run tests/react/Upload.spec.tsx tests/vue/Upload.spec.ts`。

---

#### C18-2 FileManager `draggable` 半接线 + `applyFileDragReorder` 公共 core helper 零消费（未实现 / 死代码）— **P2**

**发现问题**

- 🟠 P2｜`draggable` 是双端公开 prop（[FileManager.tsx:201](../packages/react/src/components/FileManager.tsx)、[FileManager.ts:233](../packages/vue/src/components/FileManager.ts)、core 类型 [file-manager.ts:57](../packages/core/src/types/file-manager.ts)），但两端只做了**半截**：开启后给每个 item 设 `draggable={true}` 与 `data-drag-id`（来自 `toFileDragItem(item,index)`），**没有任何 `onDragStart`/`onDragOver`/`onDrop` 处理器**，也不发出任何拖拽事件/回调。即「能拖起来，但放不下、不会重排、外部拿不到拖拽结果」——`draggable` 实际无功能。
- 🟠 P2｜core 为此准备的 `applyFileDragReorder(items, event)`（[file-manager-utils.ts:268](../packages/core/src/utils/file-manager-utils.ts)）**零生产消费**：grep 全仓仅 `file-manager-utils.ts`（定义）、`tests/core/file-manager-utils.spec.ts`（测试）、`api-reports/public-api-baseline.json`（基线）出现，两个组件都没用它。属「声明并测试但无人调用」的公共 helper。
- ℹ️ 取证：[tests/react/FileManager.spec.tsx](../tests/react/FileManager.spec.tsx) 无任何 `draggable`/`onDrop`/`drag` 用例；`examples/.../FileManagerDemo.*` 不演示 `draggable`，佐证该路径未被使用。

**公共内容决策**：走任务 H（不直接删公开内容）。二选一——(a) **补全实现**：双端接入 drag 事件并消费已存在的 `applyFileDragReorder`（纯重排逻辑留 core，DOM 事件编排留框架层），新增 `onReorder`/`update:files` 出口；(b) 若暂不做，把 `draggable` 标 deprecated + migration、并对 `applyFileDragReorder` 标注/回收，过 `api:baseline:check`。不可保留「公开但无效」的 prop + 无消费 helper。

**建议修复顺序**：P2。先定去留；若补全，纯逻辑已就绪（`toFileDragItem`/`applyFileDragReorder`），主要补双端 DOM 事件 + 重排回调 + 双端用例。

**目标验证命令**：`pnpm vitest run tests/core/file-manager-utils.spec.ts tests/react/FileManager.spec.tsx tests/vue/FileManager.spec.ts`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C18-3 React FileManager `Loading...` / `Root` 硬编码，Vue loading 走 locale → i18n 不对称 — **P2**

**发现问题**

- 🟠 P2｜**双端不对称**：Vue FileManager loading 文案 `resolveLocaleText('Loading...', mergedLocale?.common?.loadingText)`（[FileManager.ts:266](../packages/vue/src/components/FileManager.ts)）已本地化；**React 直接渲染硬编码 `Loading...`**（[FileManager.tsx:228](../packages/react/src/components/FileManager.tsx)），未走 locale。React FileManager 其实已有 `locale` 且对 empty/search placeholder 本地化（[FileManager.tsx:174](../packages/react/src/components/FileManager.tsx)/[:224](../packages/react/src/components/FileManager.tsx)），唯独 loading 漏接。与 C04-1 / C09-3 / C14-3 同型。
- ℹ️ 取证：[tests/react/FileManager.spec.tsx:90](../tests/react/FileManager.spec.tsx) 的 `shows loading overlay` 断言 `getByText('Loading...')`，把硬编码英文**锁进了测试**——本地化时需同步改用例。
- 🟢 P3｜面包屑根节点 `Root` 双端硬编码（[FileManager.tsx:143](../packages/react/src/components/FileManager.tsx)、[FileManager.ts:149](../packages/vue/src/components/FileManager.ts)），未走 locale。

**公共内容决策**：locale 解析链路（`resolveLocaleText`/`mergeTigerLocale`）已在 core，框架层消费。React loading 改用 `common.loadingText`（与 Vue 对齐）；`Root` 双端接入一个 `common` key（如 `common.rootText`，core 已有 `common` 容器，新增 key 即可）。属双端 parity 收敛 + i18n 补缺。

**建议修复顺序**：P2。先对齐 React loading 本地化（同步改 `FileManager.spec.tsx` 断言），`Root` 本地化随手并入。

**目标验证命令**：`pnpm vitest run tests/react/FileManager.spec.tsx tests/vue/FileManager.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C18-4 core `FileManagerProps` 公共类型漂移 + `columns` 死字段（公共 API 卫生）— **P2**

**发现问题**

- 🟠 P2｜core 导出的 `FileManagerProps`（[file-manager.ts:38](../packages/core/src/types/file-manager.ts)）与**实际组件 props 漂移**：两个组件都各自声明本地接口（React `FileManagerProps`、Vue `VueFileManagerProps`）而**不继承/不引用** core 的 `FileManagerProps`。core 版是「纯数据」形（含 `columns`、`searchText` 等），缺组件实有的回调（`onSelect`/`onOpen`/`onNavigate`/`onSelectedKeysChange`/`onCurrentPathChange`/`onSearchTextChange`）、`renderIcon`、`locale`；与 C04-6（VueListProps 漂移）、C12-3 同型。
- 🟠 P2｜`columns?: FileSortField[]`（[file-manager.ts:48](../packages/core/src/types/file-manager.ts)「Which columns to show in list view」）是**无人实现的死字段**：两端 list 视图把 name/size/modified **写死渲染**（[FileManager.tsx:210](../packages/react/src/components/FileManager.tsx)、[FileManager.ts:209](../packages/vue/src/components/FileManager.ts)），从不读 `columns`；grep 全仓仅类型定义出现。
- ℹ️ 导出取证：React index 显式再导出**本地** `FileManagerProps`（[index.tsx:363](../packages/react/src/index.tsx)），与 `export *` 带出的 core 同名类型在 React 命名空间内冲突、由显式导出胜出；Vue 则同时暴露 core `FileManagerProps`（经 `export *`）与 `VueFileManagerProps`（[index.ts:331](../packages/vue/src/index.ts)）。无论哪端，core `FileManagerProps.columns` 都是「对外可见但零实现」。

**公共内容决策**：走任务 H。`columns` 二选一——按语义实现可配置列，或标 deprecated + 从 core 类型移除并过 `api:baseline:check`。`FileManagerProps` 类型来源宜统一：让组件 props 以 core 类型为单一事实源（core 补回调/`renderIcon` 的框架无关签名，框架层只加各自 ref/v-model 形），消除「core 数据型 vs 组件富型」两套漂移。

**建议修复顺序**：P2。先决 `columns` 去留；再收敛类型来源（与 C04-6/C12-3 同批处理公共类型漂移）。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C18-5 core 两套文件大小格式化（输出不一致）+ `getFileExtension` 重名异义（该合未合）— **P3**

**发现问题**

- 🟢 P3｜core 有**两个**公开的「字节→人类可读」函数，输出格式不同：`formatFileSize`（[upload-utils.ts:364](../packages/core/src/utils/upload-utils.ts)，恒 `toFixed(2)` → `1.00 KB`/`2.50 MB`，参数必填、`0`→`0 B`）与 `formatFileSizeLabel`（[file-manager-utils.ts:116](../packages/core/src/utils/file-manager-utils.ts)，整数不带小数、否则 `toFixed(1)` → `1 KB`/`2.5 MB`，且容忍 `undefined`→`''`）。后者注释自称「Uses the same format as upload-utils」，**实则不同**（2 位 vs 1 位小数）。结果：Upload 显示 `1.00 KB`、FileManager 显示 `1 KB`——同库两组件文件大小观感不一致，且逻辑重复。
- 🟢 P3｜`getFileExtension` **重名异义**：[upload-utils.ts:222](../packages/core/src/utils/upload-utils.ts)（模块私有）返回**带点小写** `.png`；[file-manager-utils.ts:131](../packages/core/src/utils/file-manager-utils.ts)（导出）返回**不带点小写** `png`，且对前导点名（`.gitignore`）返回 `''`。两者同名、语义相反（带/不带点）。导出版（file-manager）grep 仅自身 spec 消费，组件未用。

**公共内容决策**：**合并到 core 单一实现**。统一一个 `formatFileSize(bytes?, opts?)`（支持 `undefined`、可选精度），两组件共用，消除显示分歧；旧名按任务 H 处理（保留别名或 deprecated）。`getFileExtension` 统一为一份带明确「是否含点」语义的实现，私有版改调用公共版。纯逻辑，沉 core。

**建议修复顺序**：P3。先合 `formatFileSize`（影响显示，先定精度口径），再合 `getFileExtension`；补/改对应 core spec。

**目标验证命令**：`pnpm vitest run tests/core/upload-utils.spec.ts tests/core/file-manager-utils.spec.ts`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C18-6 FileManager 键盘 a11y 缺口 + loading 遮罩定位缺 `relative` 容器 — **P3**

**发现问题**

- 🟢 P3｜FileManager 列表用 `role="listbox"` + item `role="option"` + `aria-selected`/`aria-multiselectable`（[FileManager.tsx:185](../packages/react/src/components/FileManager.tsx)、[FileManager.ts:249](../packages/vue/src/components/FileManager.ts)），但 item 是 `<div>`，**无 `tabIndex`、无任何键盘处理器**（无 roving tabindex、无 ↑↓/Home/End 导航、无 Enter/Space 选择、无 Enter 打开/进入文件夹）。键盘用户既不能聚焦也不能操作；与声明的 listbox 语义不符。与 C13-1 / C07-8（a11y 键盘缺口）同向。
- ℹ️ 取证：[tests/react/FileManager.spec.tsx](../tests/react/FileManager.spec.tsx) 无 `keydown`/`tabIndex`/`role` 相关用例（仅 `loading`/选择/导航点击路径），键盘可达性未被任何测试覆盖。
- 🟢 P3｜loading 遮罩 `fileManagerLoadingClasses`（[file-manager-utils.ts:51](../packages/core/src/utils/file-manager-utils.ts)）用 `absolute inset-0`，但容器 `fileManagerContainerClasses`（[file-manager-utils.ts:13](../packages/core/src/utils/file-manager-utils.ts)）**无 `relative`**，遮罩会相对最近定位祖先（可能是页面）而非 FileManager 定位。属 latent CSS 缺陷，双端共有（现有测试只断言文案存在、不验定位）。

**公共内容决策**：框架层补键盘交互（roving tabindex + 方向键/Enter/Space，复用 core 既有 list/menu 导航 helper 评估）、core 类常量给容器补 `relative`。a11y 行为留框架层，可共享的「下一焦点索引」纯计算可评估沉 core。

**建议修复顺序**：P3。先给容器加 `relative`（零风险）；键盘导航补全后补双端用例。

**目标验证命令**：`pnpm vitest run tests/react/FileManager.spec.tsx tests/vue/FileManager.spec.ts`。

---

#### C18-7 Upload 主题 token 不一致（裸 Tailwind 调色板）+ 内联 SVG 双端重复（该提取未提取）— **P3**

**发现问题**

- 🟢 P3｜Upload 大量用**裸 Tailwind 调色板**而非 `var(--tiger-*)` token：core 的 `getUploadButtonClasses`/`getDragAreaClasses`/`FILE_LIST_STATUS_CLASSES`/`PICTURE_CARD_STATUS_CLASSES`（[upload-utils.ts:379](../packages/core/src/utils/upload-utils.ts)–[:530](../packages/core/src/utils/upload-utils.ts)，`border-gray-300`/`bg-gray-100`/`bg-blue-50`/`text-green-700`/`bg-red-50`…），以及组件内联（`text-gray-400`/`text-gray-500`/`hover:text-red-500`/`hover:text-blue-200`…）。对照同文件的 `uploadStatusIconColorClasses`（[upload-utils.ts:17](../packages/core/src/utils/upload-utils.ts) 用 `var(--tiger-*)`）与 FileManager/Signature 全量 token——Upload 主题一致性最差。与 C02-3 / C03-3 / C04-3 同向。
- 🟢 P3｜**内联 SVG 双端重复**：拖拽区云图标、文件图标、预览眼图标、删除垃圾桶图标在 React [Upload.tsx:326](../packages/react/src/components/Upload.tsx)/[:396](../packages/react/src/components/Upload.tsx)/[:485](../packages/react/src/components/Upload.tsx)/[:513](../packages/react/src/components/Upload.tsx) 与 Vue [Upload.ts:500](../packages/vue/src/components/Upload.ts)/[:588](../packages/vue/src/components/Upload.ts)/[:734](../packages/vue/src/components/Upload.ts)/[:772](../packages/vue/src/components/Upload.ts) 逐字重复，未抽到 core `common-icons`；而状态图标（success/error/close）已用 core 常量（`successCircleSolidIcon20PathD` 等）。同组件内一半图标走常量、一半内联，且双端各抄一遍。与 C01-2（内联 SVG 重复）同向。

**公共内容决策**：(a) Upload 颜色类改走 `var(--tiger-*)` token（与 dark/modern 主题一致），属 core 工具类样式收敛；(b) 把 4 个内联图标补进 core `common-icons` 并双端引用（纯常量沉 core）。均无公共 API 变更。

**建议修复顺序**：P3，低优先。token 收敛与图标抽取可随 Upload 下次改动一并处理；与 C18-1 的 v4 迁移同批最省事。

**目标验证命令**：`pnpm vitest run tests/react/Upload.spec.tsx tests/vue/Upload.spec.ts`、`pnpm example:build`。

---

#### C18-8 一组低优先 latent + 健康面（观察）— **P3 / 观察**

**发现问题**

- 🟢 P3｜**queue 模式重复计算 chunk**：queue+chunk 模式下 `createUploadQueueItem(file, uid, chunkSize)`（[upload-utils.ts:265](../packages/core/src/utils/upload-utils.ts)）已为 queue item 生成 `chunks`，但实际上传走 `uploadOne` 又 `createUploadChunks(file, chunkSize)` 重算一遍（[Upload.tsx:189](../packages/react/src/components/Upload.tsx)、[Upload.ts:350](../packages/vue/src/components/Upload.ts)），queue item 的 `chunks` 字段从不被读取——重复计算 + 字段冗余。
- 🟢 P3｜**picture-card object URL 泄漏**：`renderPictureCard` 每次渲染对无 `url` 的文件 `URL.createObjectURL(file.file)`（[Upload.tsx:469](../packages/react/src/components/Upload.tsx)、[Upload.ts:698](../packages/vue/src/components/Upload.ts)），**从不 `revokeObjectURL`**；列表重渲染会累积 blob URL（轻量内存泄漏，双端一致）。
- 🟢 P3｜**0 字节文件渲染杂散 `0`**：文件大小用 `file.size && …`（[Upload.tsx:412](../packages/react/src/components/Upload.tsx)、[Upload.ts:609](../packages/vue/src/components/Upload.ts)），`size===0` 时 `0 && …` 求值为 `0`，React/Vue 都会把数字 `0` 渲染成文本节点（应改 `file.size != null` 或 `typeof === 'number'`）。边缘但双端共有。
- 🟢 P3｜**Signature 无 `setPointerCapture`**：`handlePointerDown` 未捕获指针（[Signature.tsx:181](../packages/react/src/components/Signature.tsx)、[Signature.ts:168](../packages/vue/src/components/Signature.ts)），指针在画布外释放时 `pointerup` 不触发 `finishStroke`，`activeStroke` 残留、`onEnd`/`update:modelValue` 该轮不发；下次按下才隐式接续。健壮性小缺陷，双端一致。
- 🟢 P3｜**Signature `ariaLabel` 未本地化**：默认 `'Signature pad'`（[Signature.tsx:65](../packages/react/src/components/Signature.tsx)、[Signature.ts:52](../packages/vue/src/components/Signature.ts)）不走 locale（同组 `clearText` 已 `resolveLocaleText('Clear', …, common.clearText)`）。只能逐实例覆盖，无法经 ConfigProvider locale。
- ✅ 健康面（无需动作）：受控量/事件双端对称——Upload `fileList`/`onChange` ↔ `fileList`/`update:file-list`+`change`；Signature React `forwardRef`(`SignatureRef`) + `onChange/onBegin/onEnd/onClear` ↔ Vue v-model + `expose` + `begin/end/clear`（属框架惯例差异，非缺陷）。Upload 的 `prepareUploadFiles`（limit/type/size/beforeUpload）、drag、queue/chunk/resumable 双端一致且 `tests/{react,vue}/Upload.spec.*` 充分覆盖（各 60+ queue/chunk/drag 断言）。Signature 笔画/导出/清除/键盘 Delete-Backspace 双端一致。

**公共内容决策**：均为框架层/局部清理，不涉及公共拆合到 core。(a) queue 模式直接复用 queue item 已算的 `chunks`，去掉 `uploadOne` 重算；(b) picture-card 缓存并在卸载/列表变更时 `revokeObjectURL`；(c) `file.size != null` 判定；(d) Signature 加 `setPointerCapture`/`releasePointerCapture`；(e) `ariaLabel` 接 `common`（如 `signatureAriaLabel`）。

**建议修复顺序**：P3，随各组件下次改动顺手清理；健康面保持。

**目标验证命令**：`pnpm vitest run tests/react/Upload.spec.tsx tests/vue/Upload.spec.ts tests/react/Signature.spec.tsx tests/vue/Signature.spec.ts`。

---

#### C18 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Upload `bg-opacity-*` v4 失效（C18-1） | 框架层改斜杠透明度；归入全仓 v4 迁移专项（F/H） | **P2** |
| FileManager `draggable` 半接线 + `applyFileDragReorder` 死 helper（C18-2） | 补全实现（消费 core helper）或废弃 prop+helper（走 H + baseline） | **P2** |
| React FileManager `Loading...`/`Root` 硬编码（C18-3） | React 接 `common.loadingText`、双端 `Root` 接 locale；同步改测试 | **P2** |
| core `FileManagerProps` 漂移 + `columns` 死字段（C18-4） | `columns` 实现或废弃；类型来源统一以 core 为源（合 C04-6/C12-3） | **P2** |
| core 两套 file-size 格式化 + `getFileExtension` 重名异义（C18-5） | 合并→core 单一实现，消除显示分歧 | P3 |
| FileManager 键盘 a11y 缺口 + loading 缺 `relative`（C18-6） | 框架层补键盘交互；容器加 `relative` | P3 |
| Upload 裸 Tailwind 调色板 + 内联 SVG 双端重复（C18-7） | 颜色走 `var(--tiger-*)`；图标抽 core `common-icons` | P3 |
| queue 重复算 chunk / objectURL 泄漏 / 0 字节渲染 0 / Signature 无 pointerCapture / ariaLabel 未本地化（C18-8） | 框架层/局部清理；健康面保持 | P3/观察 |

---

#### C18 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| `tailwindcss` 版本 + `tailwind-entry` 注释 | v4（`core/package.json:222` + entry 自述 v4）；`bg-opacity-*` 已移除 | C18-1 |
| grep `bg-opacity-*` 分布 | Upload 4 处（React 476/524、Vue 719/797）；全仓约 18 文件；FileManager 已用 `…/60` 斜杠 | C18-1/C18-7 |
| grep `applyFileDragReorder` 消费者 | 仅 core 定义 + core spec + baseline；两组件零消费（仅用 `toFileDragItem` 设 data 属性） | C18-2 |
| 比对 React/Vue FileManager loading | Vue 走 `common.loadingText`；React 硬编码 `Loading...`（spec 锁定） | C18-3 |
| grep `FileManagerProps`/`columns` 消费者 | 组件各用本地接口、不继承 core；`columns` 仅类型定义出现、零实现 | C18-4 |
| 比对 `formatFileSize` vs `formatFileSizeLabel` / 两个 `getFileExtension` | 两套格式化（2 位 vs 1 位小数）、注释误称同格式；扩展名带点 vs 不带点 | C18-5 |
| grep FileManager spec 键盘/drag | 无 keydown/tabIndex/draggable 用例（仅 loading/点击） | C18-6/C18-2 |
| grep Upload spec queue/chunk/drag | 双端各 60+ 断言（queue/chunk/drag 已覆盖） | C18-8 健康面 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 9 文件 238 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C18 基线 |

> 本轮 C18 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮以 packageManager 指定的 pnpm 11.9.0（本机无 corepack）实跑 C18 目标 vitest（9 文件 238 测试通过）、`pnpm run api:validate`（一致性检查 0 问题）与 `pnpm run types:check`（全部 props 类型导出），均为只读校验、未改动仓库。

---

### C19 图片展示组（Image / ImagePreview / ImageGroup / ImageViewer）

**扫描范围**：Image、ImagePreview、ImageGroup、ImageViewer 的全链路——core 类型 [image.ts](../packages/core/src/types/image.ts)、[image-viewer.ts](../packages/core/src/types/image-viewer.ts)，core 工具 [image-utils.ts](../packages/core/src/utils/image-utils.ts)、[image-viewer-utils.ts](../packages/core/src/utils/image-viewer-utils.ts)、[group-utils.ts](../packages/core/src/utils/group-utils.ts)，React 实现 [Image.tsx](../packages/react/src/components/Image.tsx)、[ImagePreview.tsx](../packages/react/src/components/ImagePreview.tsx)、[ImageGroup.tsx](../packages/react/src/components/ImageGroup.tsx)、[ImageViewer.tsx](../packages/react/src/components/ImageViewer.tsx) 与 index 导出，Vue 实现 [Image.ts](../packages/vue/src/components/Image.ts)、[ImagePreview.ts](../packages/vue/src/components/ImagePreview.ts)、[ImageGroup.ts](../packages/vue/src/components/ImageGroup.ts)、[ImageViewer.ts](../packages/vue/src/components/ImageViewer.ts) 与 index 导出，`tests/core/{image-utils,image-viewer-gesture,group-utils}.spec.ts`、`tests/react/{Image,ImagePreview,ImagePreview.ssr,ImageGroup,ImageViewer}.spec.tsx`、`tests/vue/{Image,ImagePreview,ImageGroup,ImageViewer}.spec.ts`，examples `{ImageDemo,ImageViewerDemo}`（双端对称，无 ImagePreviewDemo——ImagePreview 经 Image 间接演示），generated `component-index.md`。ImageCropper / ImageAnnotation / CropUpload 属 C20，排除。

**结论速览**：图片展示组在 happy path 与受控量上双端基本对称、核心手势纯逻辑已沉到 core 且有 `tests/core` 直测，**无 P1**。两条 **P2**：① ImagePreview 与 ImageViewer 是两套近重复的「全屏图片查看器」（zoom/rotate/pan/pinch/wheel/nav/counter/mask/Escape 各做一遍），且行为不一致（wrap vs clamp、是否锁 body 滚动、是否走 portal、有无 reset），其中 ImageViewer 双端不走 portal 属 latent 全屏定位隐患；② ImageViewer i18n 双端不对称（Vue 有 `locale` prop 但只本地化 close，React 完全无 locale），且该 `locale` prop 未声明在 `VueImageViewerProps`/core `ImageViewerProps`。其余 P3：core 手势/图标两套重复 + `getTouchDistance` 零消费（`image-utils` vs `image-viewer-utils`，含 5/7 图标 path 逐字重复）、core 图片类型漂移 + ImageGroup 公共面不一致、`previewTrigger="hover"` 在 ImageGroup 内预览完全失效（latent）、a11y（两查看器声明 `aria-modal` 但无 focus trap/restore）与杂项 parity。

---

#### C19-1 ImagePreview 与 ImageViewer 两套近重复全屏查看器（重复实现 + 行为不一致）— **P2**

**发现问题**

- 🟠 P2｜`ImagePreview`（[ImagePreview.tsx](../packages/react/src/components/ImagePreview.tsx)/[.ts](../packages/vue/src/components/ImagePreview.ts)）与 `ImageViewer`（[ImageViewer.tsx](../packages/react/src/components/ImageViewer.tsx)/[.ts](../packages/vue/src/components/ImageViewer.ts)）是两个**职责高度重叠**的公开全屏查看器：均实现 全屏遮罩 + 缩放（按钮/滚轮）+ 旋转 + 鼠标拖拽平移 + 双指 pinch + 上一张/下一张 + 计数器 + 点遮罩关闭 + Escape/Arrow 键 + `role="dialog" aria-modal`。双端各写一遍，合计 ~4 个 ~300 行实现。
- 🟠 P2（latent）｜**ImageViewer 不走 portal**：React `ImageViewer` 直接内联返回根 div（[ImageViewer.tsx:135](../packages/react/src/components/ImageViewer.tsx)），Vue 同样无 `Teleport`（[ImageViewer.ts:410](../packages/vue/src/components/ImageViewer.ts)）；而 `ImagePreview` 双端用 `renderBodyPortal`/`Teleport`（[ImagePreview.tsx:270](../packages/react/src/components/ImagePreview.tsx)、[ImagePreview.ts:418](../packages/vue/src/components/ImagePreview.ts)）。ImageViewer 的 `fixed inset-0` 全屏遮罩若被带 `transform`/`filter`/`will-change` 的祖先包裹会被**困在该祖先内**而非视口——标准全屏 modal 隐患，双端共有。
- 🟢 行为不一致（双端各自一致、但两查看器之间分歧）：
  - 翻页：ImageViewer **环绕**（`(i±1+n)%n`，[ImageViewer.tsx:95](../packages/react/src/components/ImageViewer.tsx)，且被 [ImageViewer.spec.tsx:132](../tests/react/ImageViewer.spec.tsx) 锁定）；ImagePreview **夹紧**（`hasPrev/hasNext`、端点禁用按钮，[ImagePreview.tsx:151](../packages/react/src/components/ImagePreview.tsx)）。
  - body 滚动锁：ImagePreview 打开时 `document.body.style.overflow='hidden'`（[ImagePreview.tsx:105](../packages/react/src/components/ImagePreview.tsx)、[ImagePreview.ts:122](../packages/vue/src/components/ImagePreview.ts)）；ImageViewer **不锁**，背景可滚。
  - reset：ImagePreview 工具栏有「重置」按钮（[ImagePreview.tsx:331](../packages/react/src/components/ImagePreview.tsx)）；ImageViewer 无，缩放/旋转/平移后只能靠翻页隐式重置。

**公共内容决策**：走任务 H（两者均为已发布公开组件，不直接删）。(a) **先消除 latent 与 parity 缺口**（框架层、无 API 变更）：给 ImageViewer 双端补 portal/Teleport 与 body 滚动锁，对齐 ImagePreview。(b) **中期评估合并**：抽一个框架无关的「viewer 状态/手势编排」共享层，让两组件共用 transform/nav/手势逻辑，仅保留各自 props 外形（ImagePreview：`zIndex`/`scaleStep`/内部被 Image/ImageGroup 复用；ImageViewer：`zoomable`/`rotatable`/`showNav`/`showCounter` 开关）；纯逻辑沉 core，DOM/portal 留框架层。翻页 wrap vs clamp 需先定一致策略（两端测试已各自锁定，改动需同步改 spec）。

**建议修复顺序**：P2。先做 (a) ImageViewer 补 portal + 滚动锁（低风险，先对齐 ImagePreview）；(b) 合并查看器逻辑作为更大重构，随 C19-2 的 core 工具合并一并设计。

**目标验证命令**：`pnpm exec vitest run tests/react/ImageViewer.spec.tsx tests/vue/ImageViewer.spec.ts tests/react/ImagePreview.spec.tsx tests/vue/ImagePreview.spec.ts tests/react/ImagePreview.ssr.spec.tsx`、`pnpm run api:validate`、`pnpm run types:check`。

---

#### C19-2 core 手势/变换/图标两套重复 + `getTouchDistance` 零消费公共导出（该合未合）— **P3**

**发现问题**

- 🟢 P3｜两个 core 工具模块对同一手势域**各做一套**：`image-utils.ts`（`clampScale`/`calculateTransform`/`getTouchDistance`，[:219](../packages/core/src/utils/image-utils.ts)/[:226](../packages/core/src/utils/image-utils.ts)/[:451](../packages/core/src/utils/image-utils.ts)）与 `image-viewer-utils.ts`（`clampZoom`/`getImageTransformStyle`/私有 `touchDistance` + 完整 pan/pinch/wheel 状态机，[:64](../packages/core/src/utils/image-viewer-utils.ts)/[:94](../packages/core/src/utils/image-viewer-utils.ts)/[:176](../packages/core/src/utils/image-viewer-utils.ts)）。`clampScale`≡`clampZoom`（同一 min/max 夹紧）；`calculateTransform`(translate+scale) 是 `getImageTransformStyle`(translate+scale+rotate) 的子集——ImagePreview 用前者再**手工拼接** ` rotate(${rotation}deg)`（[ImagePreview.tsx:262](../packages/react/src/components/ImagePreview.tsx)）重造了后者。`image-viewer-utils.ts:172` 注释甚至自承「与 image-utils 的 getTouchDistance 同公式」。
- 🟢 P3｜**5/7 图标 path 逐字重复**：`image-utils` 的 `zoomInIconPath`/`zoomOutIconPath`/`prevIconPath`/`nextIconPath`/`previewCloseIconPath` 与 `image-viewer-utils.imageViewerIcons` 的 `zoomIn`/`zoomOut`/`prev`/`next`/`close` **字节相同**；`rotateLeft`/`rotateRight` 只在 `imageViewerIcons`——导致 ImagePreview 不得不**同时从两个模块**取图标（[ImagePreview.tsx:12-28](../packages/react/src/components/ImagePreview.tsx) 既导入 `zoomInIconPath…` 又导入 `imageViewerIcons`）。
- 🟢 P3｜`getTouchDistance`（[image-utils.ts:451](../packages/core/src/utils/image-utils.ts)，公开导出）**零组件消费**：grep 全仓仅 定义 + `tests/core/image-utils.spec.ts` + `api-reports` 基线 + `image-viewer-utils.ts` 的注释；实际 pinch 用的是 `image-viewer-utils` 的私有 `touchDistance`。属「公开但无人调用」的死 helper（与 C14 `allowFreeInput`、C18 `applyFileDragReorder` 同型）。

**公共内容决策**：**合并到 core 单一手势/图标来源**（纯逻辑，沉 core）。统一 `clamp`、统一 `transform` 串、把图标并入一处（评估并入 core `common-icons` 或单一 `imageViewerIcons`），让 ImagePreview/ImageViewer 共用；`getTouchDistance` 改为复用 `image-viewer-utils` 公式或标 deprecated 后回收，走 `api:baseline:check`。`image-utils.spec.ts`/`image-viewer-gesture.spec.ts` 已覆盖，合并时同步收敛测试。

**建议修复顺序**：P3，与 C19-1(b) 同批设计。先合 `clamp`/`transform`/图标（无 API 破坏，可保留旧名别名），再决 `getTouchDistance` 去留（走 H + baseline）。

**目标验证命令**：`pnpm exec vitest run tests/core/image-utils.spec.ts tests/core/image-viewer-gesture.spec.ts`、`pnpm run api:validate`、`pnpm run api:baseline:check`。

---

#### C19-3 ImageViewer i18n 双端不对称 + `locale` prop 未声明在类型 — **P2**

**发现问题**

- 🟠 P2｜**双端不对称**：Vue `ImageViewer` 接 `useTigerConfig` + `mergeTigerLocale`，把关闭按钮文案本地化为 `resolveLocaleText('Close', …common?.closeText)`（[ImageViewer.ts:117-121](../packages/vue/src/components/ImageViewer.ts)）；React `ImageViewer` **完全无 locale**，`aria-label="Close"` 等全硬编码（[ImageViewer.tsx:153](../packages/react/src/components/ImageViewer.tsx)）。与 C02-2(QRCode)/C18-3(FileManager) 同型。
- 🟠 P2｜Vue 该 `locale` prop 在运行时声明（[ImageViewer.ts:110-113](../packages/vue/src/components/ImageViewer.ts)），却**未出现在导出的 `VueImageViewerProps` 接口**（[:31-43](../packages/vue/src/components/ImageViewer.ts)），也不在 core `ImageViewerProps`（[image-viewer.ts](../packages/core/src/types/image-viewer.ts)）——类型与运行时漂移。
- 🟢 P3｜即使 Vue 端，也只本地化了 close；`Previous`/`Next`/`Zoom in`/`Zoom out`/`Rotate left/right`/`Image viewer` 双端仍硬编码英文；ImagePreview 双端**全部**硬编码（`Image preview`/`Close preview`/`Zoom out`/`Reset`/`Rotate left`…）。取证：`ImageViewer.spec.tsx:41/79/102…` 把英文 label 锁进测试，本地化时需同步改。

**公共内容决策**：locale 链路（`resolveLocaleText`/`mergeTigerLocale`/`useTigerConfig`）已在 core，框架层消费。React `ImageViewer` 接入 locale 与 Vue 对齐；两端把全部 aria-label 走 `common.*`（评估新增 `common.zoomInText` 等或就近复用）。`locale` prop 要么补进 `VueImageViewerProps`/core 类型，要么移除——消除类型漂移（走 H）。

**建议修复顺序**：P2。先补 React `ImageViewer` locale（与 Vue 对齐 close），并把 `locale` prop 声明补齐/统一；其余 label 本地化随后批量做（同步改 spec）。

**目标验证命令**：`pnpm exec vitest run tests/react/ImageViewer.spec.tsx tests/vue/ImageViewer.spec.ts`、`pnpm run types:check`、`pnpm run api:validate`。

---

#### C19-4 core 图片类型漂移 + ImageGroup 公共面双端不一致（公共 API 卫生）— **P3**

**发现问题**

- 🟢 P3｜**core 类型与组件实际 props 漂移**（与 C18-4/C04-6/C12-3 同型）：core `ImageGroupProps` 仅 `preview`（[image.ts:188](../packages/core/src/types/image.ts)），而 React 本地 `ImageGroupProps` 多出 `onPreviewVisibleChange`/`children`/`className`（[ImageGroup.tsx:17](../packages/react/src/components/ImageGroup.tsx)）、Vue `VueImageGroupProps` 又只有 `preview`（[ImageGroup.ts:17](../packages/vue/src/components/ImageGroup.ts)）。React `ImageViewer` 干脆**内联重定义** `ImageViewerProps` 不引用 core（[ImageViewer.tsx:26](../packages/react/src/components/ImageViewer.tsx)）；Vue `VueImagePreviewProps` 逐字**复制** core `ImagePreviewProps` 字段而非 extends（[ImagePreview.ts:41](../packages/vue/src/components/ImagePreview.ts)），React 则 `extends CoreImagePreviewProps`（[ImagePreview.tsx:33](../packages/react/src/components/ImagePreview.tsx)）——类型来源各端不一。
- 🟢 P3｜`getImageGroupClasses(className?) => className || base`（[group-utils.ts:77](../packages/core/src/utils/group-utils.ts)）语义是**替换**而非合并：React 传 `className` 时 `tiger-image-group` 基类被丢弃（[ImageGroup.tsx:74](../packages/react/src/components/ImageGroup.tsx)）；Vue 不传参（恒基类，[ImageGroup.ts:73](../packages/vue/src/components/ImageGroup.ts)）且 `ImageGroup` 根本没有 `className` prop（靠 attr 透传）。双端外形不对称，且基类标记可能被无声丢弃。

**公共内容决策**：走任务 H。统一类型来源以 core 为单一事实源（core 补框架无关回调/`className` 签名，框架层只加各自 ref/v-model 形）；`getImageGroupClasses` 改为 `classNames(base, className)`（合并语义）并给 Vue `ImageGroup` 补 `className` prop，对齐 React。纯类型/工具卫生，无运行逻辑变更。

**建议修复顺序**：P3，与 C18-4/C04-6 同批处理「core 数据型 vs 组件富型」漂移。

**目标验证命令**：`pnpm run types:check`、`pnpm run api:validate`、`pnpm run api:baseline:check`、`pnpm exec vitest run tests/core/group-utils.spec.ts tests/react/ImageGroup.spec.tsx tests/vue/ImageGroup.spec.ts`。

---

#### C19-5 `previewTrigger="hover"` 在 ImageGroup 内 → 预览完全失效（latent 双端）— **P3**

**发现问题**

- 🟢 P3（latent）｜`Image` 的两个开关互斥导致死角：`hoverPreviewEnabled = preview && previewTrigger==='hover' && !group`、`clickPreviewEnabled = preview && previewTrigger!=='hover'`（[Image.tsx:76-77](../packages/react/src/components/Image.tsx)、[Image.ts:82-85](../packages/vue/src/components/Image.ts)）。当一个 `previewTrigger="hover"` 的 Image **放进 ImageGroup** 时：hover 被 `!group` 关掉、click 被 `previewTrigger!=='hover'` 关掉 → 两者皆 false。该图片仍被 `group.register` 注册进图片数组，但 `role`/`tabIndex` 为 undefined、`handleClick` 首行 `if(!clickPreviewEnabled) return`（[Image.tsx:154](../packages/react/src/components/Image.tsx)）→ **点它毫无反应，无法打开组预览**，纯键盘用户也不可达。双端逻辑一致、同病。

**公共内容决策**：框架层修复（不涉及 core）。在 group 上下文里应让 `previewTrigger="hover"` **回退为 click 打开组预览**（即 `clickPreviewEnabled` 在 `group` 存在时忽略 hover 限制），或在组内显式忽略 `previewTrigger`。双端对齐同一回退规则，补双端用例覆盖「hover 图片在组内仍可点开预览」。

**建议修复顺序**：P3，低优先（非默认组合）。修时双端同改 + 加用例。

**目标验证命令**：`pnpm exec vitest run tests/react/ImageGroup.spec.tsx tests/vue/ImageGroup.spec.ts tests/react/Image.spec.tsx tests/vue/Image.spec.ts`。

---

#### C19-6 一组低优先 a11y/parity latent + 健康面（观察）— **P3 / 观察**

**发现问题**

- 🟢 P3（a11y）｜`ImagePreview` 与 `ImageViewer` 双端均声明 `role="dialog" aria-modal="true"`，但**都没有 focus trap、初始聚焦、关闭后焦点恢复**；仓库已有 `focus-utils`（C08/C09 overlay 在用），这两个全屏查看器未接入。键盘可达性弱于声明的 modal 语义。
- 🟢 P3（冗余）｜`ImagePreview` 鼠标拖拽**手搓** `draggingRef`/`dragStartRef`（[ImagePreview.tsx:193-207](../packages/react/src/components/ImagePreview.tsx)、[ImagePreview.ts:181-201](../packages/vue/src/components/ImagePreview.ts)），却同时 import 了 `startPan`/`movePan` 只用于 touch；`ImageViewer` 鼠标+触摸**统一**用 `startPan`/`movePan`（[ImageViewer.tsx:189](../packages/react/src/components/ImageViewer.tsx)）。ImagePreview 鼠标平移可改用同一 helper，去掉手搓状态。
- 🟢 P3（parity）｜`Image` 加载/错误事件不对称：Vue `Image` 显式 `emit('load')`/`emit('error')`（[Image.ts:160](../packages/vue/src/components/Image.ts)/[:171](../packages/vue/src/components/Image.ts)），React `Image` 内部 `handleLoad/handleError` 不回调用户（消费者只能靠 `...props` 落到容器 div 上，拿不到 `<img>` 的 load/error）。
- 🟢 P3（观察）｜`Image` 的 loading 占位仅在 `loading && !actualSrc` 显示（[Image.tsx:199](../packages/react/src/components/Image.tsx)），即只在 lazy 触发前出现；非 lazy 图片网络加载期间不显示 `animate-pulse` 占位——`placeholderRender`/`imageLoadingClasses` 对非 lazy 基本是死路径（双端一致，设计取舍，记录备查）。
- ✅ 健康面（无需动作）：受控量/事件双端对称——`Image` `preview`/`previewTrigger`/`lazy`/`fallbackSrc` 与 hover 浮层（复用 `usePopup`/`useFloatingPopup`）双端一致；`ImagePreview` `open`+`onOpenChange`/`update:open`、`currentIndex`+`onCurrentIndexChange`、`scale-change` 对称；`ImageGroup` register/unregister/openPreview 上下文双端一致且 `group-utils` 纯逻辑有 `tests/core/group-utils.spec.ts` 直测；手势纯逻辑（clamp/pan/pinch/wheel/transform）由 `tests/core/{image-utils,image-viewer-gesture}.spec.ts` 覆盖；示例与生成 references 双端对称无漂移。

**公共内容决策**：均框架层/局部清理。(a) 两查看器接 `focus-utils` 做 trap+restore（a11y 行为留框架层，可共享「下一焦点」纯计算评估沉 core）；(b) ImagePreview 鼠标平移改用 `startPan`/`movePan`；(c) React `Image` 评估补 `onLoad`/`onError`（与 Vue parity）；(d) loading 占位仅作观察。

**建议修复顺序**：P3，随各组件下次改动顺手；健康面保持。

**目标验证命令**：`pnpm exec vitest run tests/react/Image.spec.tsx tests/vue/Image.spec.ts tests/react/ImagePreview.spec.tsx tests/vue/ImagePreview.spec.ts`。

---

#### C19 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| ImagePreview/ImageViewer 两套全屏查看器重复 + ImageViewer 无 portal/滚动锁 + nav 行为分歧（C19-1） | 先补 ImageViewer portal/滚动锁（框架层）；中期合并查看器逻辑（走 H） | **P2** |
| ImageViewer i18n 不对称 + `locale` prop 未声明（C19-3） | React 接 locale 与 Vue 对齐；`locale` prop 补进类型或移除（走 H + baseline） | **P2** |
| `image-utils` vs `image-viewer-utils` 手势/图标重复 + `getTouchDistance` 零消费（C19-2） | 合并→core 单一手势/图标来源；`getTouchDistance` 复用或废弃 | P3 |
| core 图片类型漂移 + ImageGroup className 替换语义/Vue 无 className（C19-4） | 类型以 core 为源；`getImageGroupClasses` 改合并、Vue 补 className | P3 |
| `previewTrigger="hover"` 在组内预览失效（C19-5） | 框架层：组内 hover 回退为 click，双端对齐 | P3 |
| 两查看器无 focus trap/restore；ImagePreview 手搓鼠标平移；React Image 无 load/error 事件（C19-6） | 框架层补 a11y/复用 helper/parity；健康面保持 | P3/观察 |

---

#### C19 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| 比对 ImagePreview vs ImageViewer 渲染/手势 | 同域查看器各做一遍；ImageViewer 无 portal、无 body 滚动锁、无 reset、nav 环绕 | C19-1 |
| grep portal/Teleport | ImagePreview 双端 portal；ImageViewer 双端内联 | C19-1 |
| 比对 `clampScale`/`clampZoom`、`calculateTransform`/`getImageTransformStyle`、`imageViewerIcons` | clamp 等价；transform 子集；zoomIn/zoomOut/prev/next/close 5 路径字节相同 | C19-2 |
| grep `getTouchDistance` 消费者 | 仅 def + `image-utils.spec` + baseline + 注释；零组件消费 | C19-2 |
| 比对 React/Vue ImageViewer locale | Vue 有 `locale` prop+本地化 close；React 无 locale；`locale` 未在 `VueImageViewerProps`/core | C19-3 |
| grep core `ImageGroupProps`/`ImageViewerProps` 引用 | 组件用本地/内联接口，core 类型偏「数据型」漂移；`getImageGroupClasses` 替换语义 | C19-4 |
| 推演 `previewTrigger='hover'` + group | hover 被 `!group` 关、click 被 `!=='hover'` 关 → 图片注册却不可交互 | C19-5 |
| grep `aria-modal`/focus | 两查看器声明 aria-modal 但无 focus trap/restore；ImagePreview 鼠标平移手搓 | C19-6 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 12 文件 244 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C19 基线 |

> 本轮 C19 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮以 packageManager 指定的 pnpm 11.9.0（本机无 corepack）实跑 C19 目标 vitest（12 文件 244 测试通过）、`pnpm run api:validate`（一致性检查 0 问题）与 `pnpm run types:check`（全部 props 类型导出），均为只读校验、未改动仓库。

---

### C20 图片编辑组

**扫描范围**：ImageCropper、ImageAnnotation、CropUpload 的全链路——core 类型 [image.ts](../packages/core/src/types/image.ts)、[image-annotation.ts](../packages/core/src/types/image-annotation.ts)，core 工具 [image-utils.ts](../packages/core/src/utils/image-utils.ts)、[image-annotation-utils.ts](../packages/core/src/utils/image-annotation-utils.ts)、[crop-upload-utils.ts](../packages/core/src/utils/crop-upload-utils.ts)，React 实现 [ImageCropper.tsx](../packages/react/src/components/ImageCropper.tsx)、[ImageAnnotation.tsx](../packages/react/src/components/ImageAnnotation.tsx)、[CropUpload.tsx](../packages/react/src/components/CropUpload.tsx)，Vue 实现 [ImageCropper.ts](../packages/vue/src/components/ImageCropper.ts)、[ImageAnnotation.ts](../packages/vue/src/components/ImageAnnotation.ts)、[CropUpload.ts](../packages/vue/src/components/CropUpload.ts)，`tests/core/{image-utils,image-annotation-utils,crop-upload-utils}.spec.ts`、`tests/{react,vue}/{ImageCropper,ImageAnnotation,CropUpload}.spec.*`，examples `{ImageCropper,ImageAnnotation,CropUpload}Demo`，generated references（component-index、shared props、api-summary）。C19 的 Image/ImagePreview/ImageGroup/ImageViewer 不在本组范围。

**结论速览**：裁剪几何、标注坐标、CropUpload 文件读取/校验等纯逻辑已沉到 core，双端实现总体对称，C20 目标 vitest/API/type 门禁均通过。**无 P1**。需处理项集中在公开契约与多实例/a11y/i18n：① ImageCropper 的 SVG mask 使用固定 `crop-mask` id，多实例同屏会冲突（P2）；② CropUpload 公开 `modalWidth` 但双端零消费（P2）；③ ImageAnnotation 的 SVG 标注形状声明 `role="button"` + 可聚焦，但缺 Enter/Space 键盘激活（P2）；④ Vue ImageAnnotation 的 `selectedId`/`tool` 受控 props 无 `update:*` 事件，双向受控口径不完整（P3）；⑤ `ImageAnnotationChangeMeta` 暴露 `update/select/clear` 但实现只发 `add/remove`（P3）；⑥ 编辑组件硬编码英文/中文文案与 aria label，未接 locale（P3）。

---

#### C20-1 ImageCropper SVG mask 固定 `crop-mask` id，多实例同屏会冲突 — **P2**

**发现问题**

- 🟠 P2｜React [ImageCropper.tsx](../packages/react/src/components/ImageCropper.tsx) 与 Vue [ImageCropper.ts](../packages/vue/src/components/ImageCropper.ts) 都在每个实例内渲染 `<mask id="crop-mask">`，并通过 `mask="url(#crop-mask)"` 引用。HTML/SVG id 是文档级唯一；同屏多个裁剪器时，后续实例的 `url(#crop-mask)` 可能解析到第一个 mask，导致遮罩裁剪窗口串用第一实例的尺寸/位置。
- 🟠 P2｜示例页实际同屏渲染多个 ImageCropper：React `ImageCropperDemo` 同页有基础、固定宽高比、隐藏辅助线、JPEG 输出四个实例；Vue demo 同理。现有测试只单实例渲染、拖拽、键盘、touch，未覆盖多实例 mask id。
- ℹ️ 仓内已有同类做法可复用：React 多个图表和表单控件使用 `useId()`；Vue 图表使用 `useId()` + stable prefix 生成 SVG gradient id，说明现有模式支持实例级 SVG id。

**公共内容决策**：不改公共 API。双端组件层生成实例级 mask id（React `useId`，Vue `useId` 或现有 stable id helper），并把 `mask` 引用同步改为 `url(#${maskId})`。纯 DOM/id 修复，无需沉 core。

**建议修复顺序**：P2。优先修，因为示例页已具备多实例触发条件，且修复局部、低风险。

**目标验证命令**：

```bash
pnpm vitest run tests/react/ImageCropper.spec.tsx tests/vue/ImageCropper.spec.ts
pnpm example:build
```

---

#### C20-2 CropUpload `modalWidth` 是公开 prop 但双端零消费 — **P2**

**发现问题**

- 🟠 P2｜core [CropUploadProps](../packages/core/src/types/image.ts) 暴露 `modalWidth?: number`，React/Vue 本地 props 也暴露同名字段；但 React [CropUpload.tsx](../packages/react/src/components/CropUpload.tsx) 只把它解构成 `_modalWidth = 520` 后完全不传给 Modal，Vue [CropUpload.ts](../packages/vue/src/components/CropUpload.ts) 定义 `modalWidth` prop 后也没有读取。
- 🟠 P2｜Modal 双端实际支持 `width` prop，并有对应测试（React/Vue Modal spec 均覆盖 string/number width）。CropUpload 当前固定 `size="lg"` / `size: 'lg'`，`modalWidth` 对消费者完全无效。
- ℹ️ 现有 CropUpload spec 覆盖默认 modalTitle 的“渲染不崩”、accept、disabled、maxSize、键盘触发与 a11y，但没有断言 `modalWidth`。

**公共内容决策**：公开 prop 已存在，应实现而非废弃。双端把 `modalWidth` 传给 Modal 的 `width`，并补 React/Vue spec 断言自定义宽度进入 dialog style。若维护者决定只保留 Modal size，则需 deprecated `modalWidth` 并走 baseline/migration；不建议继续保留死 prop。

**建议修复顺序**：P2。与 C20-1 同批修复，成本低且消除公开契约失效。

**目标验证命令**：

```bash
pnpm vitest run tests/react/CropUpload.spec.tsx tests/vue/CropUpload.spec.ts
pnpm run api:validate
pnpm run types:check
```

---

#### C20-3 ImageAnnotation 标注形状可聚焦但缺键盘激活 — **P2**

**发现问题**

- 🟠 P2｜React/Vue ImageAnnotation 渲染标注图形时给 SVG `rect`/`ellipse`/`path` 设置 `role="button"` 与 `tabIndex`/`tabindex`，但只绑定鼠标 `onClick`。SVG + `role="button"` 不是原生 button，Enter/Space 不会自动触发 click；键盘用户可以 Tab 到形状，却不能用键盘选中它。
- 🟠 P2｜Delete/Backspace 删除路径依赖已有选中项。由于键盘无法选中 SVG 形状，键盘删除现有标注的路径不完整。现有 `handleKeyDown` 只处理 Escape、Enter、Delete/Backspace，不处理标注形状自身的 Enter/Space 激活。
- ℹ️ 现有双端 ImageAnnotation spec 覆盖鼠标绘制、点击选择、点击 Delete、polygon Enter 提交、readonly/disabled 与 axe，但没有覆盖“Tab 到已有标注后 Enter/Space 选中/删除”。

**公共内容决策**：框架层 a11y 修复。给可聚焦 SVG 标注增加键盘处理：Enter/Space 选择该 annotation；Delete/Backspace 可删除当前聚焦且可编辑的 annotation；必要时 stop propagation 避免误提交 polygon。纯交互修复，不改 core 类型。

**建议修复顺序**：P2。跟随 C20-1/C20-2 后处理；补双端键盘 spec 防回归。

**目标验证命令**：

```bash
pnpm vitest run tests/react/ImageAnnotation.spec.tsx tests/vue/ImageAnnotation.spec.ts
```

---

#### C20-4 Vue ImageAnnotation `selectedId` / `tool` 受控 props 无 `update:*` 事件 — **P3**

**发现问题**

- 🟢 P3｜core [ImageAnnotationProps](../packages/core/src/types/image-annotation.ts) 暴露 `selectedId`、`defaultSelectedId`、`tool`、`defaultTool`；React 对应 `onSelect` / `onToolChange` 可让外部同步受控状态。Vue 也有 `selectedId` / `tool` props 和 `select` / `tool-change` 事件，但没有 `update:selectedId` / `update:tool`，因此不能用 Vue 常规 `v-model:selected-id` / `v-model:tool` 双向受控。
- 🟢 P3｜Vue 对 annotations 已采用 `modelValue` + `update:modelValue`，同组件内部受控口径不一致：数据列表支持 v-model，选中项和工具只支持单向 prop + 自定义事件。
- ℹ️ 示例目前只用 `@select` 保存选中对象、`v-model` 保存 annotations，未演示 `selectedId` / `tool` 受控；generated props 只列前 3 个 props，暂未放大到文档错误。

**公共内容决策**：建议补 Vue `update:selectedId` / `update:tool` 事件，并保留现有 `select` / `tool-change` 事件作为语义回调。React 保持现有 callbacks。属 Vue framework parity，不涉及 core 类型变更。

**建议修复顺序**：P3。可随 ImageAnnotation 下一次受控量整理处理。

**目标验证命令**：

```bash
pnpm vitest run tests/vue/ImageAnnotation.spec.ts
pnpm run types:check
```

---

#### C20-5 `ImageAnnotationChangeMeta` 暴露未实现分支，撤销/重置/清空能力缺口未成型 — **P3**

**发现问题**

- 🟢 P3｜core [ImageAnnotationChangeMeta](../packages/core/src/types/image-annotation.ts) 的 `type` 包含 `'add' | 'update' | 'remove' | 'select' | 'clear'`，但 React/Vue 实现只通过 `onChange` / `change` 发出 `add` 和 `remove`；grep `update/select/clear` 在实现和测试中均无命中。
- 🟢 P3｜组件有 Delete 删除选中项、Escape 取消 draft、Enter/双击提交 polygon，但没有公开 clear/reset/undo/redo 方法或 props。ROADMAP 对本组要求扫描“撤销/重置”，当前能力尚未形成公共契约；类型里的 `clear`/`update` 像预留状态而非实际行为。
- ℹ️ 现有 tests 只断言 `add` 和 `remove` meta；示例也只演示绘制、选择和受控 annotations，不演示清空、更新、撤销或重置。

**公共内容决策**：走任务 H/API 收敛。二选一：若要补能力，新增清空/更新/撤销/重做的明确 UI/API，并让 meta 分支真实可达；若短期不做，应收窄 `ImageAnnotationChangeMeta` 或标注未实现分支，避免 public type 暗示不存在的事件。

**建议修复顺序**：P3。先定产品契约，再改类型/实现/测试；不要只在组件里临时塞一个清空按钮而不定义受控行为。

**目标验证命令**：

```bash
pnpm vitest run tests/core/image-annotation-utils.spec.ts tests/react/ImageAnnotation.spec.tsx tests/vue/ImageAnnotation.spec.ts
pnpm run api:validate
pnpm run types:check
```

---

#### C20-6 图片编辑组件硬编码文案与 aria label，未接 locale — **P3**

**发现问题**

- 🟢 P3｜CropUpload 双端硬编码默认触发文案 `选择图片`、Modal title `裁剪图片`、footer `取消` / `确认裁剪`，aria-label 则硬编码英文 `Select image to crop and upload`。这些文案无法通过 ConfigProvider locale 统一替换，只能部分通过 `modalTitle` 或自定义 children 规避。
- 🟢 P3｜ImageCropper 双端硬编码 `Loading image for cropping`、`Image cropper`、`Image to crop`、`Move crop area`、`Resize crop area {handle}` 等 aria label；ImageAnnotation 的 toolbar label、工具名 `Select/Rectangle/...`、`Delete`、loading/editor/canvas aria label 也硬编码在 core helper 或组件实现中。
- ℹ️ 与 C09/C14/C18 多个 locale 发现同向：已有 `resolveLocaleText`/ConfigProvider locale 链路，但图片编辑组尚未接入。当前 tests 把这些硬编码文案作为断言锁定，修复时需同步改为 locale-aware 断言。

**公共内容决策**：locale 能力应沉到 core 的 locale 类型/默认值，框架层消费。先给 CropUpload 的 visible 文案和 aria label 接 locale；再补 ImageCropper/ImageAnnotation 的 a11y 文案。短期保留现有字符串作为 fallback，避免破坏默认渲染。

**建议修复顺序**：P3。可与全库 locale 清理批次合并；不阻断当前发布门禁。

**目标验证命令**：

```bash
pnpm vitest run tests/react/ImageCropper.spec.tsx tests/vue/ImageCropper.spec.ts tests/react/ImageAnnotation.spec.tsx tests/vue/ImageAnnotation.spec.ts tests/react/CropUpload.spec.tsx tests/vue/CropUpload.spec.ts
pnpm run api:validate
pnpm run types:check
```

---

#### C20 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| ImageCropper 固定 SVG mask id（C20-1） | 双端组件层生成实例级 id；不改 public API | **P2** |
| CropUpload `modalWidth` 死 prop（C20-2） | 实现为 Modal `width`，并补双端 spec；不建议保留死字段 | **P2** |
| ImageAnnotation SVG button 键盘激活缺口（C20-3） | 框架层补 Enter/Space 选择与删除键路径 | **P2** |
| Vue ImageAnnotation selected/tool v-model 缺口（C20-4） | 补 `update:selectedId` / `update:tool`，保留语义事件 | P3 |
| `ImageAnnotationChangeMeta` 未实现分支（C20-5） | 补真实 clear/update/undo/reset 契约，或收窄 public type | P3 |
| 图片编辑文案/aria 未接 locale（C20-6） | locale 默认值沉 core，双端消费，保留现有 fallback | P3 |

---

#### C20 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `crop-mask` | React/Vue ImageCropper 均固定 `id="crop-mask"` + `url(#crop-mask)`；测试无多实例覆盖 | C20-1 |
| grep `modalWidth` | core/React/Vue props 暴露；React 解构为 `_modalWidth`；Vue 定义后零读取；spec 无断言 | C20-2 |
| 比对 Modal width 支持 | React/Vue Modal 已支持 `width` 并有 spec；CropUpload 未转发 | C20-2 |
| grep ImageAnnotation SVG role/tabIndex | 标注形状 `role="button"` + tabIndex/tabindex，仅 click 选择，无键盘激活 | C20-3 |
| grep `update:selectedId` / `update:tool` | Vue ImageAnnotation 无命中；仅 `select` / `tool-change` 语义事件 | C20-4 |
| grep `ImageAnnotationChangeMeta` 分支 | public type 含 `update/select/clear`；实现和测试只触达 `add/remove` | C20-5 |
| grep 硬编码文案/aria | CropUpload、ImageCropper、ImageAnnotation 多处中英文硬编码；tests 锁定当前字符串 | C20-6 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 9 文件 187 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C20 基线 |

> 本轮 C20 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮以 packageManager 指定的 pnpm 11.9.0 实跑 C20 目标 vitest（9 文件 187 测试通过）、`pnpm run api:validate`（一致性检查 0 问题）与 `pnpm run types:check`（全部 props 类型导出），均为只读校验、未改动源码。
---

### 任务 C / C21：Table 单组扫描结果（2026-06-27）

**扫描范围**：Table 全链路——core 类型 `packages/core/src/types/table.ts`，core 工具 `utils/{table-utils,table-filter-utils,table-group-utils,table-resize-utils,table-export-utils}.ts` 与 `utils/locale-utils.ts` 的 Table labels，React 实现 `components/Table.tsx`、`components/Table/{state,types,render-header,render-body,render-summary,render-pagination}.tsx`，Vue 实现 `components/Table.ts`、`components/Table/{props,state,types,render-header,render-body,render-summary,render-pagination}.ts`，Table demos，`tests/core/table-*.spec.ts`、`tests/{react,vue}/Table*.spec.*`。C22 DataTableWithToolbar 与 C23 VirtualTable 独立成组，本轮只在边界处取证，不纳入实现扫描。

#### C21-1 `ColumnFilter.filterFn` 是公开 API 但 Table 未消费 — **P2**

**发现问题**

- 🟡 P2｜`ColumnFilter` 公开 `filterFn?: (value, filterValue) => boolean`（[table.ts:119](../packages/core/src/types/table.ts)–[:124](../packages/core/src/types/table.ts)），但 React/Vue state 都只调用 `filterData(data, filterState)`（[state.tsx:283](../packages/react/src/components/Table/state.ts)、[state.ts:212](../packages/vue/src/components/Table/state.ts)），没有把 `column.filter.filterFn` 传入 core 过滤逻辑。
- 🟡 P2｜`filterData` 只按字符串包含或严格相等过滤（[table-utils.ts:758](../packages/core/src/utils/table-utils.ts)–[:777](../packages/core/src/utils/table-utils.ts)），因此配置了 `filterFn` 的列行为与类型承诺不一致；现有 React/Vue filtering spec 只覆盖 `placeholder`、输入/选择过滤，没有覆盖 `filterFn`（[Table.spec.tsx:761](../tests/react/Table.spec.tsx)、[Table.spec.ts:556](../tests/vue/Table.spec.ts)）。

**公共内容决策**：应在 core 增加「按列配置过滤」的纯函数（如 `filterTableData(data, columns, filters)`），由双端 state 共用；保留现有 `filterData` 兼容导出或作为简单 helper。

**建议修复顺序**：P2。先补 core 单测锁定 `filterFn`、select/text 默认行为，再改 React/Vue state 消费同一 helper。

**目标验证命令**：`pnpm vitest run tests/core/table-utils.spec.ts tests/react/TableState.spec.tsx tests/vue/TableState.spec.ts tests/react/Table.spec.tsx tests/vue/Table.spec.ts`。

---

#### C21-2 Table `virtual`/`autoVirtual` 只加滚动容器，未做行窗口化 — **P2**

**发现问题**

- 🟡 P2｜`virtualItemHeight` 在 React 中被解构为 `_virtualItemHeight` 后未使用（[Table.tsx:95](../packages/react/src/components/Table.tsx)），Vue 虽保存 `virtualScrollTop`（[state.ts:506](../packages/vue/src/components/Table/state.ts)）并在虚拟容器滚动时写入（[Table.ts:276](../packages/vue/src/components/Table.ts)–[:279](../packages/vue/src/components/Table.ts)），但没有任何渲染路径根据 scrollTop/itemHeight 裁剪 `paginatedData`。
- 🟡 P2｜`getTableVirtualRecommendation` 会在 `autoVirtualThreshold` 后自动置 `enabled: true`（[table-utils.ts:555](../packages/core/src/utils/table-utils.ts)–[:572](../packages/core/src/utils/table-utils.ts)；测试 [table-utils.spec.ts:458](../tests/core/table-utils.spec.ts)），React/Vue 组件只加高度/overflow（[Table.tsx:295](../packages/react/src/components/Table.tsx)–[:307](../packages/react/src/components/Table.tsx)、[Table.ts:272](../packages/vue/src/components/Table.ts)–[:282](../packages/vue/src/components/Table.ts)），仍渲染全部行。`autoVirtual` 名称容易让用户以为 10000 行会自动窗口化，实际只是滚动容器。
- ℹ️ 边界健康面：`virtualThreshold` 推荐信号与 `VirtualTable` 独立组件边界是清晰的（[table.ts:746](../packages/core/src/types/table.ts)–[:751](../packages/core/src/types/table.ts)，[virtual-table.ts:4](../packages/core/src/types/virtual-table.ts)–[:9](../packages/core/src/types/virtual-table.ts)），但 Table 自身的 `virtual` 命名/实现需要收敛。

**公共内容决策**：二选一并明确公共语义：(a) 若 Table 要保留“轻量虚拟”，把窗口计算纯逻辑沉 core 并让双端只渲染 visible slice；(b) 若推荐用户使用 C23 `VirtualTable`，则把 Table 的 `virtual/autoVirtual` 改名或降级为 scroll container/recommendation，并走 API 兼容策略。

**建议修复顺序**：P2。先定 API 语义，再补大数据行数渲染断言；避免继续扩大 `autoVirtual` 的误导面。

**目标验证命令**：`pnpm vitest run tests/core/table-utils.spec.ts tests/react/Table.spec.tsx tests/vue/Table.spec.ts`。

---

#### C21-3 Select all 未排除 disabled 行，选择状态也不按可选行计算 — **P2**

**发现问题**

- 🟡 P2｜行级 checkbox/radio 会读取 `rowSelection.getCheckboxProps(record)?.disabled`（React [render-body.tsx:164](../packages/react/src/components/Table/render-body.tsx)、Vue [render-body.ts:171](../packages/vue/src/components/Table/render-body.ts)），但 `handleSelectAll(true)` 直接使用当前页全部 row keys（React [state.ts:429](../packages/react/src/components/Table/state.ts)–[:435](../packages/react/src/components/Table/state.ts)、Vue [state.ts:402](../packages/vue/src/components/Table/state.ts)–[:408](../packages/vue/src/components/Table/state.ts)），会把禁用行也加入 `selectedRowKeys`。
- 🟡 P2｜`allSelected` / `someSelected` 同样按 `pageRowKeys` 与 `selectedRowKeys.length` 计算（React [state.ts:444](../packages/react/src/components/Table/state.ts)–[:451](../packages/react/src/components/Table/state.ts)、Vue [state.ts:417](../packages/vue/src/components/Table/state.ts)–[:425](../packages/vue/src/components/Table/state.ts)），未区分可选行、禁用行和当前页外的已选行；header/card select-all 可能显示错误的全选/半选状态。
- ℹ️ 取证：现有 selection spec 覆盖 checkbox、radio、受控 selectedRowKeys rerender（[Table.spec.tsx:880](../tests/react/Table.spec.tsx)–[:960](../tests/react/Table.spec.tsx)、[Table.spec.ts:923](../tests/vue/Table.spec.ts)–[:999](../tests/vue/Table.spec.ts)），但没有 disabled selection/select-all 用例。

**公共内容决策**：把「当前页可选 keys / allSelected / someSelected / toggleAll」抽成 core selection helper，双端 state 共用；保留框架层事件发射。

**建议修复顺序**：P2。与 C21-1 同批改 state 最省事；先补 core helper 测试，再补 React/Vue disabled selection 用例。

**目标验证命令**：`pnpm vitest run tests/react/TableState.spec.tsx tests/vue/TableState.spec.ts tests/react/Table.spec.tsx tests/vue/Table.spec.ts`。

---

#### C21-4 Vue `totalColumnCount` 与 React 在 `showCheckbox=false` 时不一致 — **P2**

**发现问题**

- 🟡 P2｜React `totalColumnCount` 只在 `rowSelection && rowSelection.showCheckbox !== false` 时加选择列（[state.ts:227](../packages/react/src/components/Table/state.ts)–[:232](../packages/react/src/components/Table/state.ts)），与 header/body/summary 是否实际渲染选择列一致。
- 🟡 P2｜Vue `totalColumnCount` 只判断 `props.rowSelection` 就加 1（[state.ts:244](../packages/vue/src/components/Table/state.ts)–[:248](../packages/vue/src/components/Table/state.ts)），但 Vue header/body 同样在 `showCheckbox !== false` 才渲染选择列（[render-header.ts:36](../packages/vue/src/components/Table/render-header.ts)–[:40](../packages/vue/src/components/Table/render-header.ts)、[render-body.ts:154](../packages/vue/src/components/Table/render-body.ts)）。当 `rowSelection={{ showCheckbox: false }}` 且 empty/expanded/group/summary 需要 `colspan` 时，Vue 会多跨一列，React 不会。
- ℹ️ 取证：现有 colspan spec 只覆盖普通 rowSelection + expandable（React [Table.spec.tsx:1255](../tests/react/Table.spec.tsx)–[:1270](../tests/react/Table.spec.tsx)、Vue [Table.spec.ts:1337](../tests/vue/Table.spec.ts)–[:1351](../tests/vue/Table.spec.ts)），没有 `showCheckbox=false` 分支。

**公共内容决策**：把 action column count 规则沉到 core（selection/expand/summary 都复用），或至少双端 state 使用完全相同的 `hasSelectionColumn` 判断。

**建议修复顺序**：P2。改动小、双端 parity 风险明确，适合先修并补 `showCheckbox=false` colspan 用例。

**目标验证命令**：`pnpm vitest run tests/react/TableState.spec.tsx tests/vue/TableState.spec.ts tests/react/Table.spec.tsx tests/vue/Table.spec.ts`。

---

#### C21-5 Table i18n 覆盖不完整：过滤器、导出与部分 aria 仍硬编码英文 — **P3**

**发现问题**

- 🟢 P3｜Table 已有完整 `DEFAULT_TABLE_LABELS` / `ZH_CN_TABLE_LABELS` 与 `getTableLabels`（[locale-utils.ts:302](../packages/core/src/utils/locale-utils.ts)–[:401](../packages/core/src/utils/locale-utils.ts)），且 empty/loading/card select-all/lock button 已接入 labels（React [Table.tsx:399](../packages/react/src/components/Table.tsx)、[:407](../packages/react/src/components/Table.tsx)、[:435](../packages/react/src/components/Table.tsx)；Vue [Table.ts:313](../packages/vue/src/components/Table.ts)、[:689](../packages/vue/src/components/Table.ts)）。
- 🟢 P3｜过滤器下拉默认项和文本过滤 placeholder 仍硬编码英文 `All` / `Filter...`（React [render-header.tsx:147](../packages/react/src/components/Table/render-header.tsx)、[:158](../packages/react/src/components/Table/render-header.tsx)；Vue [render-header.ts:169](../packages/vue/src/components/Table/render-header.ts)、[:178](../packages/vue/src/components/Table/render-header.ts)）。导出按钮/aria 仍硬编码 `Export CSV` / `Export Excel` / `Export to CSV` / `Export to Excel`（React [Table.tsx:348](../packages/react/src/components/Table.tsx)–[:350](../packages/react/src/components/Table.tsx)，Vue [Table.ts:664](../packages/vue/src/components/Table.ts)–[:675](../packages/vue/src/components/Table.ts)）。展开列 header 与行按钮 aria 仍硬编码 `Expand` / `Expand row` / `Collapse row`（React [render-header.tsx:41](../packages/react/src/components/Table/render-header.tsx)、[render-body.tsx:129](../packages/react/src/components/Table/render-body.tsx)；Vue [render-header.ts:28](../packages/vue/src/components/Table/render-header.ts)、[render-body.ts:136](../packages/vue/src/components/Table/render-body.ts)）。
- ℹ️ 取证：当前 labels spec 覆盖 card mode 文案与 emptyText（React [Table.spec.tsx:282](../tests/react/Table.spec.tsx)–[:326](../tests/react/Table.spec.tsx)、Vue [Table.spec.ts:305](../tests/vue/Table.spec.ts)–[:338](../tests/vue/Table.spec.ts)），但 export/filter/expand aria 仍被测试锁在英文（React [Table.spec.tsx:1096](../tests/react/Table.spec.tsx)、[:1414](../tests/react/Table.spec.tsx)，Vue [Table.spec.ts:1163](../tests/vue/Table.spec.ts)、[:1526](../tests/vue/Table.spec.ts)）。

**公共内容决策**：扩展 `TigerLocaleTable` 增加 filter/export/expand aria 文案，或复用现有 table labels 增加 formatter；双端 render-header/body/export button 只消费 labels，不内联英文。

**建议修复顺序**：P3。作为 i18n 收敛批处理，需同步 locale files、public types、API baseline 和双端测试。

**目标验证命令**：`pnpm vitest run tests/react/Table.spec.tsx tests/vue/Table.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C21-6 导出与拖拽语义有低优先级清理空间 — **P3**

**发现问题**

- 🟢 P3｜React `onExport?: (csv: string) => void`（[types.ts:30](../packages/react/src/components/Table/types.ts)）命名为 csv，但 `exportFormat='excel'` 时 `exportTableData` 返回 Excel-compatible HTML（[table-export-utils.ts:102](../packages/core/src/utils/table-export-utils.ts)–[:107](../packages/core/src/utils/table-export-utils.ts)）。类型不影响运行，但公共回调语义不准确。
- 🟢 P3｜`columnDraggable`/`rowDraggable` 当前只设置 HTML draggable 并在 drop 时发出重排结果（React [render-header.tsx:106](../packages/react/src/components/Table/render-header.tsx)–[:109](../packages/react/src/components/Table/render-header.tsx)、[state.ts:495](../packages/react/src/components/Table/state.ts)–[:523](../packages/react/src/components/Table/state.ts)；Vue [render-header.ts:148](../packages/vue/src/components/Table/render-header.ts)–[:151](../packages/vue/src/components/Table/render-header.ts)、[state.ts:473](../packages/vue/src/components/Table/state.ts)–[:500](../packages/vue/src/components/Table/state.ts)），组件不维护新的列/行顺序，也没有键盘拖拽或 aria 描述。测试也只覆盖 draggable attribute 和 drop callback（React [Table.spec.tsx:1441](../tests/react/Table.spec.tsx)–[:1478](../tests/react/Table.spec.tsx)、Vue [Table.spec.ts:1553](../tests/vue/Table.spec.ts)–[:1591](../tests/vue/Table.spec.ts)）。

**公共内容决策**：(a) 将 `onExport` 参数命名/类型升级为 `content` 或 `{ content, format, filename }`，需兼容旧回调；(b) 拖拽如果保持“只发事件、不内置重排”，应在文档/类型注释中明确；可访问键盘 reorder 逻辑若要实现，应抽 core helper。

**建议修复顺序**：P3。先改文档/类型注释最小化误解；真正的键盘 reorder 可与 a11y 专项合并。

**目标验证命令**：`pnpm vitest run tests/core/table-export-utils.spec.ts tests/react/Table.spec.tsx tests/vue/Table.spec.ts`。

---

#### C21 健康面：fixed columns、pagination、card mode、resize 基线较稳

- ✅ fixed columns：`orderTableFixedColumns`、`getFixedColumnOffsets`、`freezeTableColumnWidths`、`getTableColgroup` 已在 core 承担主要计算（[table-utils.ts:176](../packages/core/src/utils/table-utils.ts)–[:388](../packages/core/src/utils/table-utils.ts)），React/Vue 均消费同一 helper；测试覆盖非连续 fixed columns、隐藏列后 offset、锁定中间列移动、colgroup 稳定性和 fixed class override（React [Table.spec.tsx:445](../tests/react/Table.spec.tsx)–[:691](../tests/react/Table.spec.tsx)、Vue [Table.spec.ts:689](../tests/vue/Table.spec.ts)–[:915](../tests/vue/Table.spec.ts)）。
- ✅ pagination：状态层支持受控/非受控 current/pageSize，分页渲染复用 pagination locale helper（React [render-pagination.tsx:26](../packages/react/src/components/Table/render-pagination.tsx)–[:123](../packages/react/src/components/Table/render-pagination.tsx)、Vue [render-pagination.ts:25](../packages/vue/src/components/Table/render-pagination.ts)–[:132](../packages/vue/src/components/Table/render-pagination.ts)），并有 rerender/disabled pagination 覆盖。
- ✅ card mode：`getCardColumns`、`getCardGridInfo`、breakpoint class map 均在 core，双端覆盖 cardTitle、hideInCard、cardPriority、cardLayout、cardSelectionPosition、custom card 与 empty card。
- ✅ resize：`createTableResizeObserverController` 把 column/row 测量封装到 core，并用 rAF 合批（[table-resize-utils.ts:105](../packages/core/src/utils/table-resize-utils.ts)–[:160](../packages/core/src/utils/table-resize-utils.ts)），有 core burst batching 测试（[table-resize-utils.spec.ts:62](../tests/core/table-resize-utils.spec.ts)）。

---

#### C21 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| `ColumnFilter.filterFn` 公开但未消费（C21-1） | 新增/升级 core 表格过滤 helper，双端 state 共用 | **P2** |
| Table `virtual` 只加滚动容器（C21-2） | 定义 Table vs VirtualTable 边界；要么实现 core 窗口计算，要么降级/重命名语义 | **P2** |
| select-all 选中 disabled 行（C21-3） | 抽 core selection helper，按可选行计算 all/some/toggle-all | **P2** |
| Vue `showCheckbox=false` colspan parity（C21-4） | 抽 action column count 或统一 `hasSelectionColumn` 判断 | **P2** |
| Table i18n 硬编码英文（C21-5） | 扩展 `TigerLocaleTable` 或 formatter，双端 render 消费 labels | P3 |
| export callback 命名 + drag 语义（C21-6） | 类型/文档先澄清；键盘 reorder 后续 a11y 专项 | P3 |

---

#### C21 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `filterFn` 消费者 | 仅类型定义出现；React/Vue state 只调用 `filterData(data, filters)` | C21-1 |
| grep `virtualItemHeight` / `virtualScrollTop` | React `_virtualItemHeight` 未用；Vue `virtualScrollTop` 写入后无人读取；渲染仍 map 全量 `paginatedData` | C21-2 |
| grep `getCheckboxProps` / `handleSelectAll` | 行 checkbox 读取 disabled；select-all 直接使用当前页全部 row keys | C21-3 |
| 比对 `totalColumnCount` | React 判断 `showCheckbox !== false`；Vue 只判断 `rowSelection` | C21-4 |
| grep `All` / `Filter...` / `Export CSV` / `Expand row` | filter/export/expand aria 仍双端英文硬编码；Table labels 未覆盖 | C21-5 |
| grep `columnDraggable` / `rowDraggable` | 只设置 draggable + drop callback；无内置 reorder 状态/键盘 reorder | C21-6 |
| 目标 vitest | ✅ `corepack pnpm vitest run tests/core/table-utils.spec.ts tests/core/table-filter-utils.spec.ts tests/core/table-group-utils.spec.ts tests/core/table-resize-utils.spec.ts tests/core/table-export-utils.spec.ts tests/react/Table.spec.tsx tests/react/TableState.spec.tsx tests/vue/Table.spec.ts tests/vue/TableState.spec.ts`：9 文件 280 测试通过 | C21 基线 |

> 本轮 C21 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮使用仓库声明的 `corepack pnpm` / pnpm 11.9.0 实跑 C21 目标 vitest（9 文件 280 测试通过）、`corepack pnpm api:validate`（一致性检查通过，0 问题）、`corepack pnpm types:check`（全部 props 类型导出）与 `git diff --check -- docs/ROADMAP.md docs/ROADMAP_CHECK.md`（通过），均为只读校验、未改动源码。

---

### 任务 C / C22：DataTableWithToolbar 单组扫描结果（2026-06-27）

**扫描范围**：DataTableWithToolbar / TableToolbar 全链路——core 类型 `packages/core/src/types/composite.ts`（`TableToolbar*` 系列 + `DataTableWithToolbarProps`，821-1106）与 `types/table.ts`（`TableProps` 全面，519-815，做共享边界对照），React 实现 `components/DataTableWithToolbar.tsx`（569 行），Vue 实现 `components/DataTableWithToolbar.ts`（854 行），双端 `index` 导出，`tests/{react,vue}/DataTableWithToolbar.spec.*`（812/877 行），examples `DataTableWithToolbarDemo.{tsx,vue}`，generated references（`component-index.md`、`shared/api-summary.md`、`shared/props/composite.md`、生成器 `scripts/generate-api-docs.mjs`）。Table 自身实现属 C21，本组只在共享边界处取证。

**结论速览**：toolbar / filter / card mode、列隐藏 / 锁定、过滤值更新双端**逻辑一致且测试充分**（双端 spec 各 ~30 例，本轮实跑 63 例全绿），**无 P1**。问题集中在 **Table 共享边界的「公开面不对称」**：① Vue 的声明 props / 公开类型是 `TableProps` 的手维子集，约 20 个 Table 能力（expandable、virtual 系、editable、filterMode/advancedFilterRules、列/行拖拽、summaryRow、groupBy、export 系、cardSelectionPosition/cardPadding/cardFieldGap）未在 Vue 侧类型化/文档化，而 React 经 `extends TableProps` 全量透传（P2）；② core `DataTableWithToolbarProps` 是两端都不消费的 ghost 型，且 Vue `export *` 把该 core 全量型带进命名空间，与实际 Vue 组件接受面反向不一致（P2）。其余为 `hasSearch` 边缘场景双端分歧（P3）与一处 generated 文档对 `TableToolbar`「组件 / 配置型」口径微瑕（P3 / 观察）。

---

#### C22-1 Table 共享边界：Vue 声明 props / 公开类型是 `TableProps` 手维子集，约 20 个 Table 能力未类型化（该合未合 + 双端不对称）— **P2**

**发现问题**

- 🟡 P2｜React `DataTableWithToolbarProps extends Omit<TableProps<T>, 'className' | 'onPageChange'>`（[DataTableWithToolbar.tsx:56](../packages/react/src/components/DataTableWithToolbar.tsx)–[:59](../packages/react/src/components/DataTableWithToolbar.tsx)），组件 `...tableProps` 解构（114）、`...remainingTableProps` 透传给内部 `<Table>`（556）→ **全量类型化转发** Table 所有 prop。
- 🟡 P2｜Vue 侧反之：`VueDataTableWithToolbarProps`（[DataTableWithToolbar.ts:78](../packages/vue/src/components/DataTableWithToolbar.ts)–[:111](../packages/vue/src/components/DataTableWithToolbar.ts)）与 runtime `props:{}`（116-252）是**手维子集**，`setup` 返回时只把一份显式 allowlist 映射进 `tableProps`（804-837）。对照 core `TableProps`（[table.ts:519](../packages/core/src/types/table.ts)–[:815](../packages/core/src/types/table.ts)），Vue **未声明 / 未类型化**约 20 个 Table 能力：`expandable`、`virtual`/`autoVirtual`/`virtualHeight`/`virtualItemHeight`/`autoVirtualThreshold`/`virtualThreshold`、`editable`/`editableCells`、`filterMode`/`advancedFilterRules`、`columnDraggable`/`rowDraggable`、`summaryRow`、`groupBy`、`exportable`/`exportFormat`/`exportFilename`、`cardSelectionPosition`/`cardPadding`/`cardFieldGap`。
- ℹ️ 运行时缓和但不消除：Vue `inheritAttrs: false` + 末尾 `{ class, style, ...restAttrs }` 展开（[DataTableWithToolbar.ts:803](../packages/vue/src/components/DataTableWithToolbar.ts)–[:805](../packages/vue/src/components/DataTableWithToolbar.ts)）会把未声明 attr 透传到 Table，部分能力**运行时可达**；但它们**无类型、无 generated 文档、模板严格模式报未知 prop**，且恰是 Table 较新的增长项（virtual/editable/export/summary/advanced-filter/drag）——Vue 手维清单已落后于 Table。
- ℹ️ 取证：双端 spec 与双端 example **均未**经 DataTableWithToolbar 演练 expandable/virtual/editable/export/summary/drag（grep 空），该缺口为 latent、未被任一测试锁定。

**公共内容决策**：走任务 H（不直接删改公开 API）。让 Vue 的 props / 公开类型以 core `TableProps` / `DataTableWithToolbarProps` 为单一事实源派生（或直接复用 Table 的 props 定义合并），声明面与 React 对齐；与 C22-2 同批收敛，过 `api:baseline:check`。

**建议修复顺序**：P2。先定 Vue props 派生方式（复用 core 型）再补齐声明面；同步在 generated props 文档体现新增受支持 prop。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C22-2 core `DataTableWithToolbarProps` 是 ghost 型 + Vue 导出反向不一致（公共 API 卫生）— **P2**

**发现问题**

- 🟡 P2｜core `DataTableWithToolbarProps`（[composite.ts:1085](../packages/core/src/types/composite.ts)，`Omit<TableProps, 'pagination'>` + `toolbar`/`pagination`/`onPageChange`/`onPageSizeChange`）**被两端组件都不消费**：React 用本地同名接口（[DataTableWithToolbar.tsx:56](../packages/react/src/components/DataTableWithToolbar.tsx)），Vue 用 `VueDataTableWithToolbarProps`（[DataTableWithToolbar.ts:78](../packages/vue/src/components/DataTableWithToolbar.ts)）。grep 全仓：仅 core 定义 + React 本地定义 / 再导出，无人 `import` core 版。
- 🟡 P2｜两端 index 均 `export * from '@expcat/tigercat-core'`（[react index.tsx:8](../packages/react/src/index.tsx)、[vue index.ts:8](../packages/vue/src/index.ts)）。React 另显式 `export { DataTableWithToolbarProps }` 本地版（[index.tsx:223](../packages/react/src/index.tsx)）→ 显式胜出，React 命名空间得到与组件一致的全量本地型（OK）。Vue **无**本地 `DataTableWithToolbarProps` 导出（仅 `VueDataTableWithToolbarProps`，[index.ts:192](../packages/vue/src/index.ts)）→ `export *` 把 **core 全量型（≈50 props）**带进 Vue 命名空间，与实际 Vue 组件接受面（`VueDataTableWithToolbarProps`，≈30 子集）**反向不一致**：类型许诺多于实现。
- ℹ️ core 型还缺 React 暴露的 toolbar 级回调 `onSearchChange`/`onSearch`/`onFiltersChange`/`onBulkAction` 与 `tableClassName`；属 C18-4 / C04-6 / C12-3 同型「core 数据型 vs 组件富型」漂移族。

**公共内容决策**：走任务 H。收敛类型来源——core `DataTableWithToolbarProps` 作单一事实源并补 toolbar 级回调；Vue 暴露与组件实参一致的 props 型（消除「导出 core 全量 vs 实现子集」反向漂移）；与 C22-1 一并修。

**建议修复顺序**：P2。与 C22-1 同批；先决 core 型补全字段，再统一双端导出。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C22-3 `hasSearch` 双端分歧：仅给搜索回调而无 `toolbar` 对象时 React 不渲染搜索框、Vue 渲染 — **P3**

**发现问题**

- 🟢 P3｜React `hasSearch = Boolean(toolbar && (... || onSearchChange || onSearch))`（[DataTableWithToolbar.tsx:216](../packages/react/src/components/DataTableWithToolbar.tsx)–[:226](../packages/react/src/components/DataTableWithToolbar.tsx)）→ `toolbar` 为 `undefined` 时整体短路为 `false`，**即便传了顶层 `onSearch`/`onSearchChange` 也不渲染搜索框**。
- 🟢 P3｜Vue `hasSearch`：`if (!props.toolbar) return hasSearchListener`（[DataTableWithToolbar.ts:375](../packages/vue/src/components/DataTableWithToolbar.ts)–[:384](../packages/vue/src/components/DataTableWithToolbar.ts)），`hasSearchListener = Boolean(vnodeProps.onSearch || vnodeProps.onSearchChange)`（278）→ 无 toolbar 但挂了 `@search`/`@search-change` 时**渲染搜索框**。同样输入双端 UI 不一致（边缘场景）。

**公共内容决策**：框架层一致性收敛——择一语义（是否允许「无 `toolbar` 仅凭顶层 / 监听回调」启用搜索）并两端对齐；不涉及 core / 公共 API。

**建议修复顺序**：P3，低优先。两端取齐 `hasSearch` 判定即可，补一条对应双端用例。

**目标验证命令**：`pnpm vitest run tests/react/DataTableWithToolbar.spec.tsx tests/vue/DataTableWithToolbar.spec.ts`。

---

#### C22-4 健康面（toolbar/filter/card/列隐藏锁定双端一致）+ generated `TableToolbar` 口径微瑕 — **P3 / 观察**

**发现问题**

- ✅ 健康面（无需动作，正面回答 ROADMAP「过滤值更新是否双端一致」「toolbar/filter/card mode」「列隐藏/锁定」关注点）：
  - **过滤值更新双端一致**：两端 `setFilterValue` 均 `nextFilters = { ...resolvedFilters, [key]: value }`，受控（`filter.value !== undefined`）不写内部状态、非受控才写，载荷经 React `onFiltersChange` + `toolbar.onFiltersChange`（[DataTableWithToolbar.tsx:296](../packages/react/src/components/DataTableWithToolbar.tsx)–[:297](../packages/react/src/components/DataTableWithToolbar.tsx)）↔ Vue `emit('filters-change')`（[DataTableWithToolbar.ts:462](../packages/vue/src/components/DataTableWithToolbar.ts)）一致；双端 spec 各覆盖「emits filter and pagination changes」「object filter values」与 custom-filter `setValue`/`setFilter`。
  - **列隐藏 / 锁定双端一致**：`columnSettings.lockedColumnKeys` / 列级 `hideable === false` / `columnLockable` 转发一致；spec 覆盖 toggle 可见性、locked / non-hideable 禁用、受控模式只回调不改内部、lock aria-label 的 labels / locale 本地化。
  - **card mode 转发一致**：`responsiveMode`/`cardBreakpoint`/`cardLayout`/`cardClassName`/`renderCard` 双端转发给内部 Table；Vue 另透传 `#card` 作用域插槽且优先于 `renderCard`（已测）。
  - `previousPageSize*` 的 page-size-change 追踪、lazy locale 解析（immediate + async resolveId 守卫）、bulk-action 选中徽章双端对称。
  - `filtersExtra`（React prop 节点 / 函数 ↔ Vue `#filters-extra` 插槽）与 toolbar `render`（React ↔ Vue `#toolbar` 插槽）属**文档化的跨框架惯例映射**（[props/composite.md:80](../skills/tigercat/references/shared/props/composite.md)、composite.ts:1062 注释），非缺陷。
- 🟢 P3｜generated 文档对 `TableToolbar`「组件 vs 配置型」口径不一：`component-index.md` route map（第 81 行）与 `shared/api-summary.md`（第 152 行 Components 列）仍把 `TableToolbar` 列为**组件**；而 `shared/props/composite.md`（第 80 行，同由 `generate-api-docs.mjs` 生成）已注明「框架实现中**不作为独立组件导出**」。实际双端 `index` **无 `TableToolbar` 导出**，仅 `TableToolbarProps` 配置型 + 由 `DataTableWithToolbar` inline 渲染。属生成器表述口径问题。

**公共内容决策**：健康面保持，不动 core 逻辑。文档口径走「先改 `scripts/generate-api-docs.mjs` 源（让 index / summary 对 `TableToolbar` 的「组件」表述与 props 文档一致，例如标注为配置型 / non-exported），再重新生成 references」。

**建议修复顺序**：P3，随生成器下次维护一并校正；健康面无需动作。

**目标验证命令**：`pnpm vitest run tests/react/DataTableWithToolbar.spec.tsx tests/vue/DataTableWithToolbar.spec.ts`、`pnpm docs:api:check`。

---

#### C22 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Vue 声明 props / 公开类型是 `TableProps` 手维子集，~20 能力未类型化（C22-1） | 走任务 H：Vue props 以 core `TableProps` 为单一事实源派生，对齐 React 全量面；过 `api:baseline:check` | **P2** |
| core `DataTableWithToolbarProps` ghost 型 + Vue 导出反向不一致（C22-2） | 走任务 H：core 型作单一事实源并补 toolbar 级回调；Vue 暴露与组件一致的 props 型；合 C18-4/C04-6/C12-3 | **P2** |
| `hasSearch` 无 `toolbar` 时双端分歧（C22-3） | 框架层一致性收敛，择一语义两端对齐 | P3 |
| 健康面（过滤 / 列隐藏锁定 / card 转发双端一致）+ generated `TableToolbar` 口径微瑕（C22-4） | 健康面保持；文档口径改 `generate-api-docs.mjs` 源后再生成 | P3 / 观察 |

---

#### C22 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| 比对 React `extends TableProps` vs Vue 声明 props | React `...tableProps`/`...remainingTableProps` 全量透传；Vue 手维 allowlist（116-252 + 804-837）缺约 20 个 Table prop | C22-1 |
| 列举 Vue 未声明的 Table 能力 | expandable、virtual/autoVirtual/virtualHeight/virtualItemHeight/autoVirtualThreshold/virtualThreshold、editable/editableCells、filterMode/advancedFilterRules、columnDraggable/rowDraggable、summaryRow、groupBy、exportable/exportFormat/exportFilename、cardSelectionPosition/cardPadding/cardFieldGap | C22-1 |
| grep core `DataTableWithToolbarProps` 消费者 | 仅 composite.ts 定义 + React 本地同名定义 / 再导出；两端组件均不 `import` core 版（ghost） | C22-2 |
| 比对双端 index 导出 | React 显式导出本地全量型（覆盖 core）；Vue 无本地同名导出，`export *` 带出 core 全量型（≈50）vs 实现子集（≈30）反向不一致 | C22-2 |
| 比对 `hasSearch`（无 toolbar） | React `toolbar && (...)` 短路为 false 不渲染；Vue `!toolbar` 时返回 `hasSearchListener` 渲染 | C22-3 |
| grep 双端 spec / example 的 expandable/virtual/editable/export | 均无——C22-1 缺口为 latent、未被测试锁定 | C22-1 |
| 比对 `setFilterValue` 双端 | `nextFilters = {...resolvedFilters,[key]:value}`、受控不写内部、载荷一致；spec 各覆盖 emits filter / object filter / custom setValue+setFilter | C22-4 健康面 |
| 比对 generated `TableToolbar` 表述 | `component-index.md`/`api-summary.md` 列为「组件」；`props/composite.md` 注「不作为独立组件导出」；双端 index 无 `TableToolbar` 导出 | C22-4 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 2 文件 63 测试通过；`api:validate` 一致性 0 问题；`types:check` 全部 props 类型导出（注：现有门禁不校验 Vue 导出型 vs 组件实参的反向漂移，故 C22-2 不被门禁拦截） | C22 基线 |

> 本轮 C22 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮使用本机 pnpm 11.9.0（与 `packageManager` 声明的 `pnpm@11.9.0` 一致）实跑 C22 目标 vitest（2 文件 63 测试通过）、`pnpm api:validate`（一致性检查通过，0 问题）、`pnpm types:check`（全部 props 类型导出）与 `git diff --check -- docs/ROADMAP.md docs/ROADMAP_CHECK.md`（通过），均为只读校验、未改动源码。
---

### C23 VirtualTable 单组 — 已扫描（2026-06-27）

**扫描范围**：VirtualTable 的全链路——core 类型 [virtual-table.ts](../packages/core/src/types/virtual-table.ts)、core 工具 [virtual-table-utils.ts](../packages/core/src/utils/virtual-table-utils.ts)（对照 [table-utils.ts](../packages/core/src/utils/table-utils.ts) 的 fixed column、`tableBaseClasses` 与 colgroup 逻辑）、React 实现 [VirtualTable.tsx](../packages/react/src/components/VirtualTable.tsx)、Vue 实现 [VirtualTable.ts](../packages/vue/src/components/VirtualTable.ts)、`tests/core/virtual-table-utils.spec.ts`、`tests/{react,vue}/VirtualTable.spec.*`、examples `VirtualTableDemo`、[virtual-table.bench.ts](../benchmarks/virtual-table.bench.ts)，以及 generated references（component-index、shared props data/advanced、examples advanced）。C21 Table 与 C22 DataTableWithToolbar 未在本轮执行。

**结论速览**：VirtualTable 的基础虚拟行窗口、固定列 offset、固定列自定义 class、空/加载态和当前 a11y smoke test 均有覆盖，C23 目标 vitest/API/type 门禁均通过。**无 P1**。需处理项集中在 public surface 与 Table 复用边界：① core `VirtualTableProps` 声明 `width`/`virtualizeColumns`/`rowClassName`，但双端组件未实现或未暴露（P2）；② VirtualTable 未复用 Table 固定列场景的 `border-separate` 与 colgroup 钉宽逻辑（P2）；③ `selectable`/row click 只有鼠标路径，`role="grid"` 语义下缺键盘和选中态 aria（P2）；④ React loading 文案硬编码，Vue 已接 `common.loadingText`（P2）；⑤ virtual range 对负数 overscan 与异常 viewport/scroll 输入缺少规范化和测试（P3）。

---

#### C23-1 core `VirtualTableProps` 声明的 `width` / `virtualizeColumns` / `rowClassName` 与双端实现漂移 — **P2**

**发现问题**

- 🟠 P2｜core [VirtualTableProps](../packages/core/src/types/virtual-table.ts) 暴露 `width?: number | 'auto'`、`virtualizeColumns?: boolean`、`rowClassName?: string | ((row, index) => string)`，文件注释还写明 VirtualTable 支持 “column virtualization”。但 React [VirtualTable.tsx](../packages/react/src/components/VirtualTable.tsx) 与 Vue [VirtualTable.ts](../packages/vue/src/components/VirtualTable.ts) 的公开组件 props 均没有 `width` / `virtualizeColumns` / `rowClassName`，实现也没有列虚拟化或行级自定义 class 消费。
- 🟠 P2｜generated reference 仍显示 `VirtualTableProps · 3/17 props`，说明这些字段已经属于 core public surface。消费者如果按 core 类型或注释预期使用列虚拟化/宽度/行 class，会在框架组件运行时无效。
- ℹ️ 现有 React/Vue spec 覆盖 `height`、`overscan`、`selectedKeys`、`renderCell`（React-only）和固定列，但没有覆盖上述 3 个 core 字段；`benchmarks/virtual-table.bench.ts` 也只计算所有列 cell style，未模拟列窗口。

**公共内容决策**：走 API 收敛。`width` 与 `rowClassName` 成本低，建议补到 React/Vue 组件并加双端 spec；`virtualizeColumns` 需要明确列窗口、横向 scroll、固定列保留策略和 aria 列索引后再实现。若短期不做列虚拟化，应先从 public type 注释中降级为未实现计划项或标注保留字段，避免继续承诺不存在的能力。

**建议修复顺序**：P2。先处理死字段/错误能力声明，再决定列虚拟化真实契约。

**目标验证命令**：

```bash
pnpm vitest run tests/react/VirtualTable.spec.tsx tests/vue/VirtualTable.spec.ts
pnpm run api:validate
pnpm run types:check
```

---

#### C23-2 固定列未复用 Table 的 `border-separate` 与 colgroup 钉宽逻辑，横向滚动稳定性存在风险 — **P2**

**发现问题**

- 🟠 P2｜VirtualTable 双端 `<table>` 使用 `class="w-full table-fixed"`；Table 则明确使用 `tableBaseClasses = 'w-full border-separate border-spacing-0'`，注释说明 `border-collapse` 下 sticky `<th>/<td>` 不稳定，固定/锁定列需要把分隔线落到 cell 上。
- 🟠 P2｜Table 在存在 fixed/lockable columns 时会渲染 `<colgroup>` 钉死列宽，并有 React/Vue spec 覆盖“锁定切换后 colgroup 宽度稳定”。VirtualTable 只给 header cell 写 `width`，body cell 只写 sticky style；没有 colgroup，也没有冻结 auto width 的路径。
- ℹ️ generated advanced props 明确说 VirtualTable 复用 `TableColumn` 与 `fixedClassName` / `fixedHeaderClassName`；当前固定列 class 复用已做，但底层 table layout 与宽度钉住策略未共享。

**公共内容决策**：Table 固定列基础能力应继续共享。建议把可复用的 table base class、colgroup descriptor 或固定列宽度策略下沉/提取为可被 VirtualTable 消费的 helper；VirtualTable 保留虚拟行窗口特有逻辑，不复制 Table 全量状态机。

**建议修复顺序**：P2。与 C23-1 同批评估；优先保证 fixed columns 在真实横向滚动和自动宽度列下稳定。

**目标验证命令**：

```bash
pnpm vitest run tests/react/Table.spec.tsx tests/vue/Table.spec.ts tests/react/VirtualTable.spec.tsx tests/vue/VirtualTable.spec.ts
```

---

#### C23-3 `selectable` / row click 仅鼠标路径，`role="grid"` 缺键盘与选中态语义 — **P2**

**发现问题**

- 🟠 P2｜React/Vue VirtualTable 根节点设置 `role="grid"` 与 `aria-rowcount`，但可点击行只绑定 `onClick` / `onClick` emit；数据行没有 `tabIndex`、`onKeyDown`、`aria-selected`、`aria-rowindex`，cell 也没有 `aria-colindex`。
- 🟠 P2｜`selectable` 打开时 `selectedKeys` 只改变 class；屏幕阅读器无法读取选中态，键盘用户也无法用 Enter/Space 触发 `onSelect` / `select`。当前 axe smoke test 不会捕获这类交互不可达。
- ℹ️ 现有 spec 只点击 data row 并断言回调/事件；没有键盘激活、aria-selected、rowindex/colindex 或 roving focus 覆盖。

**公共内容决策**：框架层补交互与 aria；core 可提供轻量 grid row/cell aria helper，但不需要改 public API。默认非 selectable 场景可保持不可聚焦；当存在 `onRowClick`、`selectable` 或行级交互时，数据行应可键盘激活。

**建议修复顺序**：P2。紧随 fixed layout 后处理，补双端键盘 spec 和 aria 断言。

**目标验证命令**：

```bash
pnpm vitest run tests/react/VirtualTable.spec.tsx tests/vue/VirtualTable.spec.ts
```

---

#### C23-4 React loading 文案硬编码，Vue 已接 `common.loadingText`，双端 i18n 不对称 — **P2**

**发现问题**

- 🟠 P2｜React [VirtualTable.tsx](../packages/react/src/components/VirtualTable.tsx) loading overlay 直接渲染 `Loading...`；Vue [VirtualTable.ts](../packages/vue/src/components/VirtualTable.ts) 已用 `resolveLocaleText('Loading...', mergedLocale.value?.common?.loadingText)`。
- 🟠 P2｜React VirtualTable 已接 `useTigerConfig`、`mergeTigerLocale` 并用 `common.emptyText` 处理 empty 文案，唯独 loading 漏接。现有 React spec 多处断言 `Loading...`，把硬编码英文锁进测试。
- ℹ️ core locale 已有 `common.loadingText`，不需要新增 key；与 C18 FileManager、C04/C09/C14 的 locale 发现同型。

**公共内容决策**：复用既有 `common.loadingText`。React 改为 `resolveLocaleText('Loading...', mergedLocale?.common?.loadingText)`；Vue 保持现状并补自定义 locale 断言，双端测试从硬编码英文改为默认 fallback + locale override。

**建议修复顺序**：P2。局部修复，低风险，可与其他 i18n 漏接项合并。

**目标验证命令**：

```bash
pnpm vitest run tests/react/VirtualTable.spec.tsx tests/vue/VirtualTable.spec.ts
pnpm run api:validate
pnpm run types:check
```

---

#### C23-5 `calculateVirtualRange` 对负数 overscan 与异常 viewport/scroll 输入缺少规范化 — **P3**

**发现问题**

- 🟢 P3｜[calculateVirtualRange](../packages/core/src/utils/virtual-table-utils.ts) 只在 `totalRows === 0 || rowHeight <= 0` 时返回空范围；`overscan`、`viewportHeight`、`scrollTop` 没有 clamp。负数 overscan 会让 `start` 增大、`end` 减小，极端值可能出现 `start > end` 或渲染空窗口；负数 scrollTop 也会产生负 `startRaw` 后再进入 end 计算。
- 🟢 P3｜当前 tests/core 只覆盖 0 rows、0 rowHeight、顶部/中部/底部、默认 overscan；React/Vue 只覆盖大正数 overscan。没有负数 overscan、负 scrollTop、0/负 viewportHeight、NaN/Infinity 输入的契约。
- ℹ️ benchmark 重点是正常大数据路径，不替代边界规范。组件默认 props 不会触发异常，但 public utility 是 core 导出函数，消费者可直接调用。

**公共内容决策**：在 core utility 层规范化输入：`scrollTop >= 0`、`viewportHeight >= 0`、`overscan >= 0` 且只接受有限数；异常输入回退到安全空/最小窗口。框架组件无需单独兜底。

**建议修复顺序**：P3。补 core spec 后改 helper；不影响当前发布门禁。

**目标验证命令**：

```bash
pnpm vitest run tests/core/virtual-table-utils.spec.ts tests/react/VirtualTable.spec.tsx tests/vue/VirtualTable.spec.ts
```

---

#### C23 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| core VirtualTableProps 与双端组件漂移（C23-1） | `width`/`rowClassName` 补实现；`virtualizeColumns` 先定契约，无法短期实现则降级 public 承诺 | **P2** |
| 固定列 table layout / colgroup 复用缺口（C23-2） | 共享 Table 固定列基础类与钉宽 helper，避免 VirtualTable 自行漂移 | **P2** |
| grid 行交互 a11y 缺口（C23-3） | 框架层补键盘激活与 `aria-selected`/索引语义；可抽 core aria helper | **P2** |
| React loading locale 漏接（C23-4） | 复用 `common.loadingText`，双端补 locale override spec | **P2** |
| virtual range 异常输入（C23-5） | core utility 规范化输入并补边界 spec | P3 |

---

#### C23 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `width` / `virtualizeColumns` / `rowClassName` | core `VirtualTableProps` 有声明；React/Vue 组件 props 与实现无消费；generated props 仍计入 17 个字段 | C23-1 |
| grep `table-fixed` / `tableBaseClasses` / `colgroup` | VirtualTable 双端为 `w-full table-fixed` 且无 colgroup；Table 为 `border-separate border-spacing-0` 并有 colgroup 稳定性测试 | C23-2 |
| grep `role` / `aria-rowcount` / `tabIndex` / `onKeyDown` | VirtualTable 只有根 `role="grid"`/`aria-rowcount`；数据行无键盘事件、选中态 aria 或行列索引 | C23-3 |
| grep `Loading...` / `common.loadingText` | React loading 硬编码；Vue 走 `common.loadingText`；双端 spec 都锁定默认英文 | C23-4 |
| grep `calculateVirtualRange` 边界测试 | core spec 覆盖正常窗口/默认 overscan/超大正 overscan；未覆盖负数/NaN/Infinity/异常 viewport | C23-5 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 3 文件 86 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C23 基线 |

> 本轮 C23 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮实跑 C23 目标 vitest（3 文件 86 测试通过）、`pnpm run api:validate`（一致性检查 0 问题）与 `pnpm run types:check`（全部 props 类型导出），均为只读校验、未改动源码。C21/C22 已由远端更新合并，状态不再标记为未扫描。

### C24 虚拟列表组（VirtualList / InfiniteScroll）— 已扫描（2026-06-27）

**扫描范围**：VirtualList / InfiniteScroll 的全链路——core 类型 [virtual-list.ts](../packages/core/src/types/virtual-list.ts)、[infinite-scroll.ts](../packages/core/src/types/infinite-scroll.ts)，core 工具 [virtual-list-utils.ts](../packages/core/src/utils/virtual-list-utils.ts)、[infinite-scroll-utils.ts](../packages/core/src/utils/infinite-scroll-utils.ts)，React 实现 [VirtualList.tsx](../packages/react/src/components/VirtualList.tsx)、[InfiniteScroll.tsx](../packages/react/src/components/InfiniteScroll.tsx)，Vue 实现 [VirtualList.ts](../packages/vue/src/components/VirtualList.ts)、[InfiniteScroll.ts](../packages/vue/src/components/InfiniteScroll.ts)，`tests/core/{virtual-list-strategies,infinite-scroll-utils}.spec.ts`、`tests/{react,vue}/{VirtualList,InfiniteScroll}.spec.*`、examples `{VirtualList,InfiniteScroll}Demo`、benchmarks [virtual-scroll-fps.bench.ts](../benchmarks/virtual-scroll-fps.bench.ts) 与 [core-utils.bench.ts](../benchmarks/core-utils.bench.ts)，以及 generated references（component-index、shared props advanced、examples advanced）。List、Tree、ChatWindow 等 VirtualList 消费者不在本轮执行，只在边界处取证。

**结论速览**：C24 基础门禁健康，固定高度窗口、variable strategy、InfiniteScroll 默认文案/slot/locale、scroll fallback 与双端 smoke test 均通过。**无 P1**。待处理项集中在“已公开语义与真实运行路径不一致”：① VirtualList dynamic strategy 暴露 DOM 测量回写，但双端组件没有测量与刷新（P2）；② InfiniteScroll observer 路径未感知 `inverse`，与 scroll fallback 的 top/left 触发逻辑不一致（P2）；③ Vue VirtualList 的 public props 与 core/React 轻微漂移，`className` 只走 attrs 合并（P3）；④ generated props 与示例没有覆盖高级能力和 inverse/horizontal 组合（P3）。

---

#### C24-1 VirtualList dynamic strategy 暴露 DOM 测量语义，但双端组件未回写实测高度 — **P2**

**发现问题**

- 🟠 P2｜core [VirtualListSizeStrategy](../packages/core/src/types/virtual-list.ts) 注释明确 `dynamicSizeStrategy` “updates after DOM measurement”，并公开 `updateItemHeight?(index, measuredHeight)`；core 测试也覆盖 `updateItemHeight` 后 totalHeight / offset 更新。
- 🟠 P2｜React [VirtualList.tsx](../packages/react/src/components/VirtualList.tsx) 与 Vue [VirtualList.ts](../packages/vue/src/components/VirtualList.ts) 在传入 `estimatedItemHeight` 时会创建 `dynamicSizeStrategy`，但渲染项只用 `strategy.getItemHeight(i)` 设置固定 `height`，没有 `ref`/ResizeObserver/DOM measurement，也没有调用 `strategy.updateItemHeight` 后触发 range 重新计算。
- 🟠 P2｜因此 `estimatedItemHeight` 实际行为更接近“估算固定高”：真实内容高度不会反哺 totalHeight、offsetTop 或可见窗口。现有双端 spec 只断言 `estimatedItemHeight={60}` 时 inner height 是 `50 * 60 = 3000px`，没有覆盖内容真实高度变化。

**公共内容决策**：保留 core strategy 抽象，但需要二选一收敛语义：要么在 React/Vue VirtualList 中实现测量回写和刷新；要么把 `estimatedItemHeight` / dynamic 文档降级为估算模式，避免承诺“动态高度”。若实现测量，建议用共享 hook/composable 边界保持双端行为一致，core 继续只负责策略与纯计算。

**建议修复顺序**：P2。优先明确 dynamic mode 真实契约，再补双端测量/刷新 spec。

**目标验证命令**：

```bash
pnpm vitest run tests/core/virtual-list-strategies.spec.ts tests/react/VirtualList.spec.tsx tests/vue/VirtualList.spec.ts
pnpm run api:validate
pnpm run types:check
```

---

#### C24-2 InfiniteScroll observer 路径未感知 `inverse`，与 scroll fallback 触发边界不一致 — **P2**

**发现问题**

- 🟠 P2｜core [shouldLoadMore](../packages/core/src/utils/infinite-scroll-utils.ts) 已支持 `inverse`：垂直时检查 `scrollTop <= threshold`，水平时检查 `scrollLeft <= threshold`；tests/core 覆盖了 vertical inverse 与 horizontal inverse。
- 🟠 P2｜但 [createInfiniteScrollObserver](../packages/core/src/utils/infinite-scroll-utils.ts) options 没有 `inverse`，rootMargin 只按 direction 写成 vertical bottom `0px 0px ${threshold}px 0px` 或 horizontal right `0px ${threshold}px 0px 0px`。React/Vue 组件即使 props 有 `inverse`，也只把 sentinel 放到内容前方，没有把 inverse 传入 observer。
- 🟠 P2｜在支持 IntersectionObserver 的现代浏览器中，InfiniteScroll 会优先走 observer 路径；只有 IO 不可用时才回退 scroll event。因此 inverse 场景的“接近顶部/左侧提前加载”只在 fallback 中完全表达，主路径可能等 sentinel 真正进入视口才触发，且不会按顶部/左侧 threshold 提前触发。

**公共内容决策**：扩展 core observer helper 的 options（例如 `inverse?: boolean`）并生成 top/left rootMargin；React/Vue 组件同步传入 `inverse`。这属于内部 helper 行为增强，不需要改变用户层 public prop。

**建议修复顺序**：P2。与 C24-1 分开处理，先补 core rootMargin tests，再改双端组件传参。

**目标验证命令**：

```bash
pnpm vitest run tests/core/infinite-scroll-utils.spec.ts tests/react/InfiniteScroll.spec.tsx tests/vue/InfiniteScroll.spec.ts
```

---

#### C24-3 Vue VirtualList public props 与 core/React 轻微漂移，`className` 只走 attrs 合并 — **P3**

**发现问题**

- 🟢 P3｜core [VirtualListProps](../packages/core/src/types/virtual-list.ts) 与 React `VirtualListProps extends CoreVirtualListProps` 都包含 `className?: string`；Vue [VirtualList.ts](../packages/vue/src/components/VirtualList.ts) props 只声明 `itemCount`、`itemHeight`、`estimatedItemHeight`、`getItemHeight`、`sizeStrategy`、`height`、`overscan`，没有声明 `className`。
- 🟢 P3｜Vue 实现通过 `coerceClassValue(attrs.class)` 支持标准 `class` attrs，因此 `className` 不是运行时必需字段；但 tests/vue 仍用 `renderWithProps(VirtualList, { className: 'my-vl' })` 并通过 attrs 透传生效。这个行为依赖测试工具/attrs 透传，而不是组件声明式 public props。
- ℹ️ `types:check` 当前通过，因为 Vue 导出的是 `InstanceType<typeof VirtualList>['$props']`，不会强制对齐 core `VirtualListProps`。这属于公共面卫生和文档一致性问题，不是当前门禁失败。

**公共内容决策**：Vue 侧建议统一对齐轻量 `className` prop，或在 generated/docs 中明确 Vue 使用 `class` attrs 而不是 `className`。若继续保留 attrs-only 行为，测试应改成验证 `class`，避免把非声明 prop 误当 public API。

**建议修复顺序**：P3。可与 generated docs 清理一起处理。

**目标验证命令**：

```bash
pnpm vitest run tests/vue/VirtualList.spec.ts
pnpm run types:check
```

---

#### C24-4 generated props 与示例没有覆盖 VirtualList / InfiniteScroll 高级能力 — **P3**

**发现问题**

- 🟢 P3｜generated [shared/props/advanced.md](../skills/tigercat/references/shared/props/advanced.md) 只展示 `InfiniteScrollProps · 3/9 props`（`hasMore` / `loading` / `threshold`）与 `VirtualListProps · 3/8 props`（`itemCount` / `itemHeight` / `estimatedItemHeight`），没有列出 `direction`、`inverse`、`disabled`、`loadingText`、`endText`、`getItemHeight`、`sizeStrategy`、`height`、`overscan` 等关键能力。
- 🟢 P3｜examples 的 VirtualList 只演示固定高度，InfiniteScroll 只演示默认方向与自定义文案；没有 `inverse`、horizontal、variable height 或 dynamic estimate 的示例。与 C24-1/C24-2 的真实风险点相比，文档和示例无法帮助使用者区分“推荐稳定路径”和“高级/待收敛路径”。
- ℹ️ `pnpm docs:api:check` 未在本轮运行，符合 ROADMAP 对扫描文档更新的约束；本项只记录 generated 覆盖不足，不手改 generated references。

**公共内容决策**：生成器层补 advanced props 覆盖与说明优先级；示例层增加 inverse/horizontal 或 variable height 示例前，应先完成 C24-1/C24-2 的契约收敛，避免示例推广不稳定组合。

**建议修复顺序**：P3。等行为契约确定后由 `scripts/generate-api-docs.mjs` 驱动 references 更新。

**目标验证命令**：

```bash
pnpm docs:api:check
pnpm example:build
```

---

#### C24-5 固定高度 range、variable strategy、InfiniteScroll 基础路径当前健康 — **P3 / 观察**

**发现问题**

- ℹ️ 固定高度 VirtualList 基线清晰：`getFixedVirtualRange` 有 core benchmark 与双端组件 spec 覆盖，100k item 场景只渲染窗口内节点，`overscan=0`、empty、single item、height=0 均有测试。
- ℹ️ `variableSizeStrategy(getItemHeight, itemCount)` 通过 prefix sum 支持已知高度模式，core spec 覆盖 offset/range，React/Vue spec 覆盖 `getItemHeight` 总高与首项高度。
- ℹ️ InfiniteScroll 的基础文案/slot/locale 路径双端一致：默认 `Loading...` / `No more data`、自定义 `loadingText`/`endText`、React `loader`/`end` 与 Vue `loader`/`end` slot、`role="status"`、sentinel 渲染/隐藏均有测试覆盖。

**公共内容决策**：这些健康面不需要重构。后续修复 C24-1/C24-2 时应保持固定高度、known variable height 与默认 infinite scroll 行为不回退。

**建议修复顺序**：观察项。作为后续修复的回归基线。

**目标验证命令**：

```bash
pnpm vitest run tests/core/virtual-list-strategies.spec.ts tests/core/infinite-scroll-utils.spec.ts tests/react/VirtualList.spec.tsx tests/vue/VirtualList.spec.ts tests/react/InfiniteScroll.spec.tsx tests/vue/InfiniteScroll.spec.ts
```

---

#### C24 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| VirtualList dynamic measurement 契约（C24-1） | 保留 core strategy；双端要么实现 DOM measurement 回写，要么降级文档承诺 | **P2** |
| InfiniteScroll inverse observer rootMargin（C24-2） | 扩展 core observer helper 的 `inverse` 语义，React/Vue 同步传参 | **P2** |
| Vue VirtualList className / attrs 边界（C24-3） | 对齐声明式 prop 或改测试/文档只承诺 Vue `class` attrs | P3 |
| generated props/examples 覆盖（C24-4） | 行为收敛后由 generator 补 advanced props 与示例说明，不手改 generated references | P3 |
| 固定高度与基础 infinite scroll 健康面（C24-5） | 保持现状，作为后续修复回归基线 | 观察 |

---

#### C24 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `dynamicSizeStrategy` / `updateItemHeight` / `estimatedItemHeight` | core strategy 与测试有测量回写语义；React/Vue 只创建 strategy 和读取估算高度，无 DOM measurement 回写 | C24-1 |
| grep `createInfiniteScrollObserver` / `rootMargin` / `shouldLoadMore` | scroll fallback 支持 inverse top/left；observer options 无 inverse，rootMargin 只覆盖 bottom/right | C24-2 |
| grep Vue VirtualList props / `coerceClassValue(attrs.class)` | Vue 未声明 `className` prop，但 attrs/class 可透传；测试把 `className` 当 props 使用 | C24-3 |
| generated advanced props / examples | InfiniteScroll 仅 3/9 props、VirtualList 仅 3/8 props；示例只覆盖固定高度与默认方向 | C24-4 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 6 文件 109 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C24 基线 |

> 本轮 C24 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮实跑 C24 目标 vitest（6 文件 109 测试通过）、`pnpm run api:validate`（一致性检查 0 问题）与 `pnpm run types:check`（全部 props 类型导出），均为只读校验、未改动源码。

### C28 专用图表组（FunnelChart / HeatmapChart / TreeMapChart / SunburstChart / OrgChart / Gantt）— 已扫描（2026-06-27）

**扫描范围**：FunnelChart、HeatmapChart、TreeMapChart、SunburstChart、OrgChart、Gantt 的全链路——core 类型 [chart.ts](../packages/core/src/types/chart.ts)、[gantt.ts](../packages/core/src/types/gantt.ts)、[org-chart.ts](../packages/core/src/types/org-chart.ts)，core 工具 [funnel-chart-utils.ts](../packages/core/src/utils/funnel-chart-utils.ts)、[heatmap-chart-utils.ts](../packages/core/src/utils/heatmap-chart-utils.ts)、[treemap-chart-utils.ts](../packages/core/src/utils/treemap-chart-utils.ts)、[sunburst-chart-utils.ts](../packages/core/src/utils/sunburst-chart-utils.ts)、[org-chart-utils.ts](../packages/core/src/utils/org-chart-utils.ts)、[gantt-utils.ts](../packages/core/src/utils/gantt-utils.ts)，React/Vue 对应组件实现，双端 index 导出，tests/{core,react,vue} 18 个定向 spec，examples `{FunnelChart,HeatmapChart,TreeMapChart,SunburstChart,OrgChart,Gantt}Demo`，以及 generated references（component-index、shared props charts、examples charts、api-summary）。C25-C27 图表基础/笛卡尔/径向组不在本轮执行，只在共享边界处取证。

**结论速览**：C28 导出面、双端组件基线、交互 smoke、a11y smoke、Heatmap canvas 路径和 OrgChart/Gantt 键盘选择测试均通过。**无 P1**。待处理项集中在复杂数据边界和文档覆盖：① Funnel/Heatmap 对空矩阵、非有限值、负值缺少规范化（P2）；② Gantt invalid date 会把 NaN 传播到 layout/tick/aria（P2）；③ TreeMap/Sunburst 的长期 memo cache 对原地变更和 Vue 深层响应式更新不安全（P2）；④ OrgChart/Gantt 的 disabled 节点/任务仍触发 hover/click 事件，语义需要收敛（P3）；⑤ generated props/examples 对 C28 高级能力覆盖不足（P3）。

---

#### C28-1 FunnelChart / HeatmapChart 数值边界缺少统一规范化 — **P2**

**发现问题**

- 🟠 P2｜[computeFunnelSegments](../packages/core/src/utils/funnel-chart-utils.ts) 只处理 `data.length === 0` 和 `maxValue === 0`；`NaN`、`Infinity`、负值、混合正负值、负 `gap` / 过大 `gap` 不会被 clamp。负 `nextVal` 会生成负 bottom width，`height - totalGap` 也可能让 `segH` 为负，最终把异常坐标写进 SVG path。
- 🟠 P2｜[computeHeatmapCells](../packages/core/src/utils/heatmap-chart-utils.ts) 在 `xLabels/yLabels` 非空但 `data=[]` 时 `minVal=Infinity`、`maxVal=-Infinity`，缺失单元格默认 `0` 后计算出 `heat=NaN`；RGB 插值会生成异常 hex，OKLCH 分支会生成 `NaN%` 的 `color-mix()`。
- 🟠 P2｜现有 core spec 只覆盖 Funnel 空数组/全 0/单项、Heatmap renderMode 和 canvas hit-test；React/Vue Heatmap “empty data” 只用空 labels，因此没有锁定“有坐标轴但缺数据”的真实矩阵边界。

**公共内容决策**：在 core utility 层集中做数值规范化：过滤或 clamp 非有限值、负值、gap/尺寸异常，并明确缺失 Heatmap cell 的 domain 行为。框架组件继续只消费安全 layout，不各自补防御。

**建议修复顺序**：P2。先补 core spec 覆盖空矩阵、负值、NaN/Infinity 和异常 gap，再调整 Funnel/Heatmap helper。

**目标验证命令**：

```bash
pnpm vitest run tests/core/funnel-chart-utils.spec.ts tests/core/heatmap-chart-utils.spec.ts tests/react/FunnelChart.spec.tsx tests/vue/FunnelChart.spec.ts tests/react/HeatmapChart.spec.tsx tests/vue/HeatmapChart.spec.ts
```

---

#### C28-2 Gantt invalid date / invalid range 会把 NaN 传播到布局、tick 与 aria — **P2**

**发现问题**

- 🟠 P2｜[normalizeGanttDate](../packages/core/src/utils/gantt-utils.ts) 对非法 date 返回 `Number.NaN`，但 [computeGanttLayout](../packages/core/src/utils/gantt-utils.ts) 随后直接 `Math.min(rawStart, rawEnd)` / `Math.max(...)`，`minMs/maxMs/rangeMs/xForTime` 都会继续传播 NaN。
- 🟠 P2｜`createGanttTimelineTicks` 遇到 NaN range 时会落到 fallback tick，但 `new Date(NaN)` 再交给 `formatGanttDate` 会产生 `NaN-NaN` 类标签；`getGanttTaskAriaLabel` 也会把非法 task date 格式化进可访问名称。
- 🟠 P2｜现有 Gantt spec 覆盖空数据、进度 clamp、依赖、today marker 和 disabled selection；没有覆盖非法 `start/end`、非法 `minDate/maxDate`、`minDate > maxDate` 或非有限日期输入。

**公共内容决策**：Gantt core layout 应先规范化日期 domain：非法 task 可跳过或回退到安全 day range，非法 min/max 回退到数据推导范围；aria label 应避免 `Invalid Date` / `NaN-NaN` 输出。React/Vue 只消费 core 的安全结果。

**建议修复顺序**：P2。先补 core `gantt-utils` invalid-date spec，再补双端组件 smoke，确保 SVG attributes、tick label、aria label 均为有限稳定值。

**目标验证命令**：

```bash
pnpm vitest run tests/core/gantt-utils.spec.ts tests/react/Gantt.spec.tsx tests/vue/Gantt.spec.ts
```

---

#### C28-3 TreeMapChart / SunburstChart memo cache 对原地数据变更不安全 — **P2**

**发现问题**

- 🟠 P2｜[treemap-chart-utils.ts](../packages/core/src/utils/treemap-chart-utils.ts) 有两层引用缓存：`flattenCache` 按 data array 引用缓存 flatten 结果，`_tmLastData/_tmLastResult` 按上次参数引用返回 layout。若调用方原地修改 `data[0].value` 或 children，helper 会继续返回旧 flatten/layout。
- 🟠 P2｜[sunburst-chart-utils.ts](../packages/core/src/utils/sunburst-chart-utils.ts) 的 `sumCache` 按 datum object 缓存子树求和，`_sbLastData/_sbLastResult` 按 data array 引用缓存 arcs。原地修改子节点值时，即使 Vue 深层响应式触发 computed，helper 仍可能从 WeakMap/last-result 返回旧 sum 或旧 arcs。
- 🟠 P2｜现有 spec 明确覆盖“same inputs memoizes”和“new data reference recomputes”，但没有覆盖同引用原地变更，也没有把不可变输入写成 public contract。

**公共内容决策**：二选一收敛：要么删除/缩短跨调用缓存，改为每次从当前 data 计算；要么把 TreeMap/Sunburst 输入声明为 immutable，并在 React/Vue docs/examples 中强调必须替换数组/对象引用。考虑 Vue 深层响应式，优先建议去掉 WeakMap 子树缓存或加入显式版本键。

**建议修复顺序**：P2。先补 core mutation spec，确认期望后改缓存策略；若选择 immutable contract，再由生成器补 docs。

**目标验证命令**：

```bash
pnpm vitest run tests/core/treemap-chart-utils.spec.ts tests/core/sunburst-chart-utils.spec.ts tests/react/TreeMapChart.spec.tsx tests/vue/TreeMapChart.spec.ts tests/react/SunburstChart.spec.tsx tests/vue/SunburstChart.spec.ts
```

---

#### C28-4 OrgChart / Gantt disabled 项仍触发 hover/click，交互语义不清 — **P3**

**发现问题**

- 🟢 P3｜React/Vue [OrgChart](../packages/react/src/components/OrgChart.tsx) / [Gantt](../packages/react/src/components/Gantt.tsx) 都把 disabled 节点/任务的 `interactive` 置为 false，因此 role 降为 `group` 且无 `tabIndex`；但 `onMouseEnter` / `onMouseLeave` / `onClick` / `onKeyDown` 仍绑定在同一个 `<g>` 上。
- 🟢 P3｜`selectNode` / `selectTask` 只在 `selectable && !disabled` 时阻止 selectedId 更新，但仍会触发 `onNodeClick` / `onTaskClick` 或 Vue `node-click` / `task-click`。现有双端 spec 甚至锁定 disabled click 仍会发出 click 事件。
- ℹ️ 这不影响当前门禁，但“disabled”到底是禁用选择、禁用所有交互，还是只禁用 keyboard/focus，当前类型、测试和 DOM 语义没有说明清楚。

**公共内容决策**：保留还是修正都可以，但需要单一语义：若 disabled 只禁用选择，应在类型/docs 中明确 disabled item 仍会发 click/hover；若 disabled 表示不可交互，应只在 `interactive` 为 true 时绑定 hover/click/key handlers，并更新现有 spec。

**建议修复顺序**：P3。与 Gantt/OrgChart 文档补充或行为修正一起处理。

**目标验证命令**：

```bash
pnpm vitest run tests/react/OrgChart.spec.tsx tests/vue/OrgChart.spec.ts tests/react/Gantt.spec.tsx tests/vue/Gantt.spec.ts
```

---

#### C28-5 generated props / examples 对专用图表高级能力覆盖不足 — **P3**

**发现问题**

- 🟢 P3｜generated [shared/props/charts.md](../skills/tigercat/references/shared/props/charts.md) 只展示 FunnelChart 3/6、HeatmapChart 3/13、TreeMapChart 3/6、SunburstChart 3/5、Gantt 3/16、OrgChart 3/11 props；`renderMode/canvasThreshold/colorSpace`、`selectedId`、`showToday/showDependencies`、`direction`、`showAvatars/showSubtitles` 等 C28 关键能力没有进入 props 表。
- 🟢 P3｜generated [examples/charts.md](../skills/tigercat/references/examples/charts.md) 对 C28 只给一行 `<Component data={data} />` / `<Component :data="data" />`，而实际 examples 已有 horizontal Funnel/OrgChart、Heatmap custom、Gantt selectedId/month scale、TreeMap nested、Sunburst donut/selectable 等更有代表性的用法。
- ℹ️ 本轮按 ROADMAP 约束不运行 `pnpm docs:api` / `pnpm docs:api:check`，只记录 generated coverage 缺口，不手改 generated references。

**公共内容决策**：由 `scripts/generate-api-docs.mjs` 驱动 charts props/examples 覆盖增强；不要直接手改 `skills/tigercat/references/*`。优先补 C28 高风险 props 和例子，再统一处理 C25-C27 图表文档覆盖。

**建议修复顺序**：P3。等 C28-1~C28-4 行为契约明确后补生成器与 examples 摘要。

**目标验证命令**：

```bash
pnpm docs:api:check
pnpm example:build
```

---

#### C28 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Funnel/Heatmap 数值 domain（C28-1） | core utility 统一规范化非有限值、负值、空矩阵和异常 gap/尺寸 | **P2** |
| Gantt 日期 domain（C28-2） | core layout 过滤/回退 invalid date，避免 NaN SVG/tick/aria | **P2** |
| TreeMap/Sunburst cache（C28-3） | 移除或收敛引用缓存；若保留缓存需声明 immutable 输入 contract | **P2** |
| OrgChart/Gantt disabled 语义（C28-4） | 明确 disabled 是仅禁 selection 还是禁所有交互，并同步测试/docs | P3 |
| generated props/examples 覆盖（C28-5） | 通过生成器补 charts props/examples，不手改 generated references | P3 |

---

#### C28 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `maxValue` / `minVal = Infinity` / empty Heatmap spec | Funnel 只处理全 0；Heatmap 空矩阵会产生 NaN heat；现有 empty data spec 同时清空 labels | C28-1 |
| grep `normalizeGanttDate` / `Math.min(rawStart, rawEnd)` / invalid-date spec | invalid date 返回 NaN 后进入 layout/tick/aria；测试未覆盖非法日期或非法 min/max | C28-2 |
| grep `WeakMap` / `_tmLastData` / `_sbLastData` / memo tests | TreeMap/Sunburst 按引用缓存；测试只覆盖 same ref memo 与 new ref recompute | C28-3 |
| grep disabled OrgChart/Gantt handlers and disabled specs | disabled item role 降为 group、无 tabIndex，但 click/hover handlers 仍绑定；spec 锁定 disabled click event | C28-4 |
| generated charts props/examples | C28 props 表只列 3 个关键 props；examples charts 只有最小占位用法 | C28-5 |
| 目标 vitest、`api:validate`、`types:check` | ✅ `npx -y pnpm@11.9.0` vitest 18 文件 238 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C28 基线 |

> 本轮 C28 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本机直接 `pnpm` 因 11.7.0 低于 engines.pnpm >=11.9.0 被拦截且 `corepack` 不在 PATH，因此本轮用 `npx -y pnpm@11.9.0` 实跑 C28 目标 vitest（18 文件 238 测试通过）、`api:validate` 与 `types:check`，均为只读校验、未改动源码。
