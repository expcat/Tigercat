/**
 * Tigercat Vue
 *
 * Vue 3 components for Tigercat UI library
 */

// Re-export from core
export * from '@expcat/tigercat-core'
export type {
  DrawerPlacement,
  DrawerSize,
  ListItem,
  TableColumn,
  TreeNode,
  UploadFile
} from '@expcat/tigercat-core'

// Global config
export { ConfigProvider, useTigerConfig } from './components/ConfigProvider'
export type { TigerConfig, VueConfigProviderProps } from './components/ConfigProvider'

// Components
export { Button } from './components/Button'
export type { VueButtonProps } from './components/Button'
export { ButtonGroup } from './components/ButtonGroup'
export type { VueButtonGroupProps } from './components/ButtonGroup'
export { SplitButton } from './components/SplitButton'
export type { VueSplitButtonProps, SplitButtonProps } from './components/SplitButton'
export { Slider } from './components/Slider'
export type { VueSliderProps } from './components/Slider'
export { Switch } from './components/Switch'
export type { VueSwitchProps } from './components/Switch'
export { Select } from './components/Select'
export type { VueSelectProps, SelectProps, SelectOption, SelectOptions } from './components/Select'
export { Cascader } from './components/Cascader'
export type {
  VueCascaderProps,
  CascaderProps,
  CascaderOption,
  CascaderValue,
  CascaderModelValue
} from './components/Cascader'
export { AutoComplete } from './components/AutoComplete'
export type {
  VueAutoCompleteProps,
  AutoCompleteProps,
  AutoCompleteOption
} from './components/AutoComplete'
export { Signature } from './components/Signature'
export type { VueSignatureProps, SignatureProps } from './components/Signature'
export { NumberKeyboard } from './components/NumberKeyboard'
export type { VueNumberKeyboardProps, NumberKeyboardProps } from './components/NumberKeyboard'
export { InputOTP } from './components/InputOTP'
export type { VueInputOTPProps, InputOTPProps } from './components/InputOTP'
export { TagsInput } from './components/TagsInput'
export type { VueTagsInputProps, TagsInputProps } from './components/TagsInput'
export { MaskInput } from './components/MaskInput'
export type { VueMaskInputProps, MaskInputProps } from './components/MaskInput'
export { Transfer } from './components/Transfer'
export type { VueTransferProps, TransferProps } from './components/Transfer'
export { TreeSelect } from './components/TreeSelect'
export type { VueTreeSelectProps, TreeSelectProps, TreeSelectValue } from './components/TreeSelect'
export { Checkbox } from './components/Checkbox'
export type { VueCheckboxProps } from './components/Checkbox'
export { CheckboxGroup } from './components/CheckboxGroup'
export type { VueCheckboxGroupProps } from './components/CheckboxGroup'
export { Radio } from './components/Radio'
export type { VueRadioProps } from './components/Radio'
export { RadioGroup } from './components/RadioGroup'
export type { VueRadioGroupProps } from './components/RadioGroup'
export { Textarea } from './components/Textarea'
export type { VueTextareaProps } from './components/Textarea'
export { Input } from './components/Input'
export type { VueInputProps } from './components/Input'
export { InputNumber } from './components/InputNumber'
export type { VueInputNumberProps } from './components/InputNumber'
export { Form, useFormContext } from './components/Form'
export type { VueFormProps } from './components/Form'
export { FormItem } from './components/FormItem'
export type { VueFormItemProps } from './components/FormItem'
export { FORM_ITEM_CONTROL_INJECTION_KEY } from './components/FormItemContext'
export type { VueFormItemControlContext } from './components/FormItemContext'
export { useFormController } from './composables/useFormController'
export { Space } from './components/Space'
export type { VueSpaceProps } from './components/Space'
export { Divider } from './components/Divider'
export type { VueDividerProps } from './components/Divider'
export { Layout } from './components/Layout'
export type { VueLayoutProps } from './components/Layout'
export { Header } from './components/Header'
export type { VueHeaderProps } from './components/Header'
export { Sidebar } from './components/Sidebar'
export type { VueSidebarProps } from './components/Sidebar'
export { Content } from './components/Content'
export type { VueContentProps } from './components/Content'
export { Footer } from './components/Footer'
export type { VueFooterProps } from './components/Footer'
export { Row } from './components/Row'
export type { VueRowProps } from './components/Row'
export { Col } from './components/Col'
export type { VueColProps } from './components/Col'
export { Container } from './components/Container'
export type { VueContainerProps } from './components/Container'
export { Link } from './components/Link'
export type { VueLinkProps } from './components/Link'
export { Text } from './components/Text'
export type { VueTextProps } from './components/Text'
export { Code } from './components/Code'
export type { VueCodeProps } from './components/Code'
export { Kbd } from './components/Kbd'
export type { VueKbdProps } from './components/Kbd'
export { Highlight } from './components/Highlight'
export type { VueHighlightProps } from './components/Highlight'
export { Marquee } from './components/Marquee'
export type { VueMarqueeProps } from './components/Marquee'
export { Icon } from './components/Icon'
export type { VueIconProps } from './components/Icon'
export { DatePicker } from './components/DatePicker'
export type {
  VueDatePickerProps,
  VueDatePickerModelValue,
  DatePickerProps
} from './components/DatePicker'
export { TimePicker } from './components/TimePicker'
export type {
  VueTimePickerProps,
  VueTimePickerModelValue,
  TimePickerProps
} from './components/TimePicker'
export { Upload } from './components/Upload'
export type { VueUploadProps, UploadProps } from './components/Upload'
export { Table } from './components/Table'
export type { VueTableProps, TableProps } from './components/Table'
export { DataExport } from './components/DataExport'
export type { VueDataExportProps, DataExportProps } from './components/DataExport'
export { Tag } from './components/Tag'
export type { VueTagProps } from './components/Tag'
export { Badge } from './components/Badge'
export type { VueBadgeProps } from './components/Badge'
export { Card } from './components/Card'
export type { VueCardProps } from './components/Card'
export { Avatar } from './components/Avatar'
export type { VueAvatarProps } from './components/Avatar'
export { AvatarGroup } from './components/AvatarGroup'
export type { VueAvatarGroupProps } from './components/AvatarGroup'
export { Image } from './components/Image'
export type { VueImageProps } from './components/Image'
export { ImageCompare } from './components/ImageCompare'
export type { VueImageCompareProps } from './components/ImageCompare'
export { ImagePreview } from './components/ImagePreview'
export type { VueImagePreviewProps } from './components/ImagePreview'
export { ImageGroup, IMAGE_GROUP_INJECTION_KEY } from './components/ImageGroup'
export type { VueImageGroupProps, ImageGroupContext } from './components/ImageGroup'
export { ImageCropper } from './components/ImageCropper'
export type { VueImageCropperProps, ImageCropperRef } from './components/ImageCropper'
export { ImageAnnotation } from './components/ImageAnnotation'
export type { VueImageAnnotationProps } from './components/ImageAnnotation'
export { List } from './components/List'
export type { VueListProps, ListProps } from './components/List'
export { Descriptions } from './components/Descriptions'
export type { VueDescriptionsProps, DescriptionsProps } from './components/Descriptions'
export { Timeline } from './components/Timeline'
export type { VueTimelineProps, TimelineProps } from './components/Timeline'
export { Countdown } from './components/Countdown'
export type { VueCountdownProps, CountdownProps } from './components/Countdown'
export { Tree } from './components/Tree'
export type { VueTreeProps, TreeProps } from './components/Tree'
export { Skeleton } from './components/Skeleton'
export type { VueSkeletonProps } from './components/Skeleton'
export { Progress } from './components/Progress'
export type { VueProgressProps, ProgressProps } from './components/Progress'
export { Collapse, useCollapseContext, CollapseContextKey } from './components/Collapse'
export type { VueCollapseProps, CollapseProps, CollapseContext } from './components/Collapse'
export { CollapsePanel } from './components/CollapsePanel'
export type { VueCollapsePanelProps, CollapsePanelProps } from './components/CollapsePanel'
export { Menu, useMenuContext } from './components/Menu'
export type { VueMenuProps, MenuProps } from './components/Menu'
export { MenuItem } from './components/Menu'
export type { VueMenuItemProps, MenuItemProps } from './components/Menu'
export { SubMenu } from './components/Menu'
export type { VueSubMenuProps, SubMenuProps } from './components/Menu'
export { MenuItemGroup } from './components/Menu'
export type { VueMenuItemGroupProps, MenuItemGroupProps } from './components/Menu'
export { Tabs, TabPane, useTabsContext, TabsContextKey } from './components/Tabs'
export type { VueTabsProps, TabsProps, VueTabPaneProps, TabPaneProps } from './components/Tabs'
export {
  Breadcrumb,
  BreadcrumbItem,
  useBreadcrumbContext,
  BreadcrumbContextKey
} from './components/Breadcrumb'
export type {
  VueBreadcrumbProps,
  BreadcrumbProps,
  VueBreadcrumbItemProps,
  BreadcrumbItemProps
} from './components/Breadcrumb'
export { Steps, StepsItem, useStepsContext, StepsContextKey } from './components/Steps'
export type {
  VueStepsProps,
  StepsProps,
  VueStepsItemProps,
  StepsItemProps
} from './components/Steps'
export { Pagination } from './components/Pagination'
export type { VuePaginationProps, PaginationProps } from './components/Pagination'
export { Dropdown } from './components/Dropdown'
export type { VueDropdownProps, DropdownProps } from './components/Dropdown'
export { DropdownMenu, DropdownItem } from './components/Dropdown'
export type { VueDropdownMenuProps, VueDropdownItemProps } from './components/Dropdown'
export {
  ContextMenu,
  ContextMenuMenu,
  ContextMenuItem,
  ContextMenuSub
} from './components/ContextMenu'
export type {
  VueContextMenuProps,
  ContextMenuProps,
  VueContextMenuMenuProps,
  VueContextMenuItemProps,
  VueContextMenuSubProps
} from './components/ContextMenu'
export {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuList,
  useNavigationMenuContext
} from './components/NavigationMenu'
export type {
  VueNavigationMenuProps,
  NavigationMenuProps,
  VueNavigationMenuItemProps,
  VueNavigationMenuTriggerProps,
  VueNavigationMenuContentProps,
  VueNavigationMenuLinkProps,
  VueNavigationMenuListProps,
  NavigationMenuListProps
} from './components/NavigationMenu'
export { PageHeader } from './components/PageHeader'
export type { VuePageHeaderProps, PageHeaderProps } from './components/PageHeader'
export { Spotlight } from './components/Spotlight'
export type { VueSpotlightProps, SpotlightProps } from './components/Spotlight'
export { ScrollSpy } from './components/ScrollSpy'
export type { VueScrollSpyProps, ScrollSpyProps } from './components/ScrollSpy'
export { Drawer } from './components/Drawer'
export type { VueDrawerProps } from './components/Drawer'
export { Modal } from './components/Modal'
export type { VueModalProps } from './components/Modal'
export { Alert } from './components/Alert'
export type { VueAlertProps, AlertProps } from './components/Alert'
export { Message } from './components/MessageRoot'
export type { VueMessageProps } from './components/MessageRoot'
export { MessageContainer } from './components/MessageContainer'
export type { VueMessageContainerProps } from './components/MessageContainer'
export { notification } from './components/NotificationRoot'
export type { VueNotificationProps } from './components/NotificationRoot'
export { NotificationContainer } from './components/NotificationContainer'
export type { VueNotificationContainerProps } from './components/NotificationContainer'
export { Loading } from './components/Loading'
export type { VueLoadingProps } from './components/Loading'
export { LoadingBar } from './components/LoadingBarRoot'
export type { VueLoadingBarProps } from './components/LoadingBarRoot'
export { LoadingBarContainer } from './components/LoadingBarContainer'
export type { VueLoadingBarContainerProps } from './components/LoadingBarContainer'
export { Popconfirm } from './components/Popconfirm'
export type { VuePopconfirmProps, PopconfirmProps } from './components/Popconfirm'
export { Popover } from './components/Popover'
export type { VuePopoverProps, PopoverProps } from './components/Popover'
export { Tooltip } from './components/Tooltip'
export type { VueTooltipProps, TooltipProps } from './components/Tooltip'
export { ActivityFeed } from './components/ActivityFeed'
export type { VueActivityFeedProps } from './components/ActivityFeed'
export { ChatWindow } from './components/ChatWindow'
export type { VueChatWindowProps } from './components/ChatWindow'
export { CommentThread } from './components/CommentThread'
export type { VueCommentThreadProps } from './components/CommentThread'
export { NotificationCenter } from './components/NotificationCenter'
export type { VueNotificationCenterProps } from './components/NotificationCenter'
export { DataTableWithToolbar } from './components/DataTableWithToolbar'
export type {
  VueDataTableWithToolbarProps,
  VueTableToolbarFilter,
  VueTableToolbarFilterRenderContext,
  VueTableToolbarFiltersExtraContext,
  VueTableToolbarRenderContext,
  VueTableToolbarProps
} from './components/DataTableWithToolbar'
export { FormWizard } from './components/FormWizard'
export type { VueFormWizardProps } from './components/FormWizard'
export { CropUpload } from './components/CropUpload'
export type { VueCropUploadProps, CropUploadProps } from './components/CropUpload'
export { ChartCanvas } from './components/ChartCanvas'
export type { VueChartCanvasProps } from './components/ChartCanvas'
export { ChartAxis } from './components/ChartAxis'
export type { VueChartAxisProps } from './components/ChartAxis'
export { ChartGrid } from './components/ChartGrid'
export type { VueChartGridProps } from './components/ChartGrid'
export { ChartSeries } from './components/ChartSeries'
export type { VueChartSeriesProps } from './components/ChartSeries'
export { BarChart } from './components/BarChart'
export type { VueBarChartProps } from './components/BarChart'
export { ScatterChart } from './components/ScatterChart'
export type { VueScatterChartProps } from './components/ScatterChart'
export { PieChart } from './components/PieChart'
export type { VuePieChartProps } from './components/PieChart'
export { DonutChart } from './components/DonutChart'
export type { VueDonutChartProps } from './components/DonutChart'
export { RadarChart } from './components/RadarChart'
export type { VueRadarChartProps } from './components/RadarChart'
export { LineChart } from './components/LineChart'
export type { VueLineChartProps } from './components/LineChart'
export { AreaChart } from './components/AreaChart'
export type { VueAreaChartProps } from './components/AreaChart'
export { ChartLegend } from './components/ChartLegend'
export type { VueChartLegendProps } from './components/ChartLegend'
export { ChartTooltip } from './components/ChartTooltip'
export type { VueChartTooltipProps } from './components/ChartTooltip'
export { FunnelChart } from './components/FunnelChart'
export type { VueFunnelChartProps } from './components/FunnelChart'
export { GaugeChart } from './components/GaugeChart'
export type { VueGaugeChartProps } from './components/GaugeChart'
export { HeatmapChart } from './components/HeatmapChart'
export type { VueHeatmapChartProps } from './components/HeatmapChart'
export { TreeMapChart } from './components/TreeMapChart'
export type { VueTreeMapChartProps } from './components/TreeMapChart'
export { SunburstChart } from './components/SunburstChart'
export type { VueSunburstChartProps } from './components/SunburstChart'

// Other components
export { Carousel } from './components/Carousel'
export type { CarouselProps, VueCarouselProps, CarouselMethods } from './components/Carousel'
export { BackTop } from './components/BackTop'
export type { VueBackTopProps, BackTopProps } from './components/BackTop'
export { Anchor, AnchorLink } from './components/Anchor'
export type {
  VueAnchorProps,
  VueAnchorLinkProps,
  AnchorProps,
  AnchorLinkProps,
  AnchorContext
} from './components/Anchor'
export { AnchorContextKey } from './components/Anchor'
export { TaskBoard } from './components/TaskBoard'
export type { VueTaskBoardProps } from './components/TaskBoard'

// Phase 1B/1C components (v0.6.0+)
export { Rate } from './components/Rate'
export type { VueRateProps } from './components/Rate'
export { Segmented } from './components/Segmented'
export type { VueSegmentedProps } from './components/Segmented'
export { Statistic } from './components/Statistic'
export type { VueStatisticProps } from './components/Statistic'
export { ColorPicker } from './components/ColorPicker'
export type { VueColorPickerProps, ColorPickerProps, ColorFormat } from './components/ColorPicker'
export { ColorSwatch } from './components/ColorSwatch'
export type { VueColorSwatchProps, ColorSwatchProps } from './components/ColorSwatch'
export { VirtualList } from './components/VirtualList'
export type {
  VueVirtualListProps,
  VirtualListProps,
  VirtualListHandle
} from './components/VirtualList'
export { Stepper } from './components/Stepper'
export type { VueStepperProps } from './components/Stepper'
export { CronEditor } from './components/CronEditor'
export type { VueCronEditorProps, CronEditorProps } from './components/CronEditor'
export { Calendar } from './components/Calendar'
export type { VueCalendarProps, CalendarProps } from './components/Calendar'
export { Mentions } from './components/Mentions'
export type { VueMentionsProps, MentionsProps, MentionOption } from './components/Mentions'
export { QRCode } from './components/QRCode'
export type { VueQRCodeProps } from './components/QRCode'

// Visual / feedback components (v0.7.0+)
export { Result } from './components/Result'
export type { VueResultProps } from './components/Result'
export { Empty } from './components/Empty'
export type { VueEmptyProps } from './components/Empty'
export { FloatButton, FloatButtonGroup } from './components/FloatButton'
export type {
  VueFloatButtonProps,
  VueFloatButtonGroupProps,
  FloatButtonProps,
  FloatButtonGroupProps
} from './components/FloatButton'
export { Watermark } from './components/Watermark'
export type { VueWatermarkProps } from './components/Watermark'
export { Tour } from './components/Tour'
export type { VueTourProps } from './components/Tour'
export { Affix } from './components/Affix'
export type { VueAffixProps, AffixProps } from './components/Affix'

// Composables
export { useChartInteraction } from './composables/useChartInteraction'
export type {
  UseChartInteractionOptions,
  UseChartInteractionReturn
} from './composables/useChartInteraction'
export { useDrag } from './composables/useDrag'
export type { UseDragOptions, UseDragReturn } from './composables/useDrag'

// Splitter (v0.8.0+)
export { Splitter } from './components/Splitter'
export type { VueSplitterProps } from './components/Splitter'

// Resizable (v0.8.0+)
export { Resizable } from './components/Resizable'
export type { VueResizableProps } from './components/Resizable'

// ScrollArea (v2.1.0+)
export { ScrollArea } from './components/ScrollArea'
export type {
  VueScrollAreaProps,
  ScrollAreaProps,
  ScrollAreaInstance
} from './components/ScrollArea'

// Masonry (v2.1.0+)
export { Masonry } from './components/Masonry'
export type { VueMasonryProps, MasonryProps } from './components/Masonry'

// CodeEditor (v0.8.0+)
export { CodeEditor } from './components/CodeEditor'
export type { VueCodeEditorProps } from './components/CodeEditor'

// RichTextEditor (v0.8.0+)
export { RichTextEditor } from './components/RichTextEditor'
export type { VueRichTextEditorProps } from './components/RichTextEditor'

// MarkdownEditor (v1.6+)
export { MarkdownEditor } from './components/MarkdownEditor'
export type { VueMarkdownEditorProps } from './components/MarkdownEditor'

// Kanban (v0.8.0+)
export { Kanban } from './components/Kanban'
export type { VueKanbanProps } from './components/Kanban'

// VirtualTable (v0.8.0+)
export { VirtualTable } from './components/VirtualTable'
export type {
  VueVirtualTableProps,
  VirtualTableProps,
  VirtualTableHandle
} from './components/VirtualTable'

// InfiniteScroll (v0.8.0+)
export { InfiniteScroll } from './components/InfiniteScroll'
export type { VueInfiniteScrollProps, InfiniteScrollProps } from './components/InfiniteScroll'

// FileManager (v0.8.0+)
export { FileManager } from './components/FileManager'
export type { VueFileManagerProps } from './components/FileManager'

// OrgChart (v1.6+)
export { OrgChart } from './components/OrgChart'
export type { VueOrgChartProps } from './components/OrgChart'
export { Gantt } from './components/Gantt'
export type { VueGanttProps } from './components/Gantt'

// InputGroup (v0.9.0+)
export { InputGroup, InputGroupAddon } from './components/InputGroup'
export type { VueInputGroupProps, VueInputGroupAddonProps } from './components/InputGroup'

// PrintLayout (v0.9.0+)
export { PrintLayout, PrintPageBreak } from './components/PrintLayout'
export type {
  VuePrintLayoutProps,
  PrintLayoutProps,
  PrintPageBreakProps
} from './components/PrintLayout'
export type { PrintLayoutInstance } from '@expcat/tigercat-core'

// ImageViewer (v0.9.0+)
export { ImageViewer } from './components/ImageViewer'
export type { VueImageViewerProps } from './components/ImageViewer'

// AspectRatio (v2.1.0+)
export { AspectRatio } from './components/AspectRatio'
export type { VueAspectRatioProps } from './components/AspectRatio'

export const version = '2.1.2'
