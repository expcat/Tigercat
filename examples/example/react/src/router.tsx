import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import Home from './pages/Home'
import AppLayout from './layouts/AppLayout'

// Basic
const ButtonDemo = lazy(() => import('./pages/ButtonDemo'))
const IconDemo = lazy(() => import('./pages/IconDemo'))
const LinkDemo = lazy(() => import('./pages/LinkDemo'))
const TextDemo = lazy(() => import('./pages/TextDemo'))
const CodeDemo = lazy(() => import('./pages/CodeDemo'))
const ImageDemo = lazy(() => import('./pages/ImageDemo'))
const ImageCropperDemo = lazy(() => import('./pages/ImageCropperDemo'))
const ImageViewerDemo = lazy(() => import('./pages/ImageViewerDemo'))
const AvatarDemo = lazy(() => import('./pages/AvatarDemo'))
const BadgeDemo = lazy(() => import('./pages/BadgeDemo'))
const TagDemo = lazy(() => import('./pages/TagDemo'))
const EmptyDemo = lazy(() => import('./pages/EmptyDemo'))
const ResultDemo = lazy(() => import('./pages/ResultDemo'))
const QRCodeDemo = lazy(() => import('./pages/QRCodeDemo'))
const StatisticDemo = lazy(() => import('./pages/StatisticDemo'))
const RateDemo = lazy(() => import('./pages/RateDemo'))
const SegmentedDemo = lazy(() => import('./pages/SegmentedDemo'))
const WatermarkDemo = lazy(() => import('./pages/WatermarkDemo'))

// Form
const InputDemo = lazy(() => import('./pages/InputDemo'))
const InputGroupDemo = lazy(() => import('./pages/InputGroupDemo'))
const TextareaDemo = lazy(() => import('./pages/TextareaDemo'))
const CheckboxDemo = lazy(() => import('./pages/CheckboxDemo'))
const RadioDemo = lazy(() => import('./pages/RadioDemo'))
const SwitchDemo = lazy(() => import('./pages/SwitchDemo'))
const SliderDemo = lazy(() => import('./pages/SliderDemo'))
const StepperDemo = lazy(() => import('./pages/StepperDemo'))
const SelectDemo = lazy(() => import('./pages/SelectDemo'))
const AutoCompleteDemo = lazy(() => import('./pages/AutoCompleteDemo'))
const CascaderDemo = lazy(() => import('./pages/CascaderDemo'))
const TreeSelectDemo = lazy(() => import('./pages/TreeSelectDemo'))
const ColorPickerDemo = lazy(() => import('./pages/ColorPickerDemo'))
const MentionsDemo = lazy(() => import('./pages/MentionsDemo'))
const TransferDemo = lazy(() => import('./pages/TransferDemo'))
const DatePickerDemo = lazy(() => import('./pages/DatePickerDemo'))
const TimePickerDemo = lazy(() => import('./pages/TimePickerDemo'))
const UploadDemo = lazy(() => import('./pages/UploadDemo'))
const FormDemo = lazy(() => import('./pages/FormDemo'))

// Layout
const LayoutDemo = lazy(() => import('./pages/LayoutDemo'))
const GridDemo = lazy(() => import('./pages/GridDemo'))
const SpaceDemo = lazy(() => import('./pages/SpaceDemo'))
const DividerDemo = lazy(() => import('./pages/DividerDemo'))
const CardDemo = lazy(() => import('./pages/CardDemo'))
const DescriptionsDemo = lazy(() => import('./pages/DescriptionsDemo'))
const ListDemo = lazy(() => import('./pages/ListDemo'))
const SkeletonDemo = lazy(() => import('./pages/SkeletonDemo'))
const SplitterDemo = lazy(() => import('./pages/SplitterDemo'))
const PrintLayoutDemo = lazy(() => import('./pages/PrintLayoutDemo'))

// Data Display
const TableDemo = lazy(() => import('./pages/TableDemo'))
const VirtualTableDemo = lazy(() => import('./pages/VirtualTableDemo'))
const TimelineDemo = lazy(() => import('./pages/TimelineDemo'))
const ProgressDemo = lazy(() => import('./pages/ProgressDemo'))
const TreeDemo = lazy(() => import('./pages/TreeDemo'))
const CollapseDemo = lazy(() => import('./pages/CollapseDemo'))
const CarouselDemo = lazy(() => import('./pages/CarouselDemo'))
const CalendarDemo = lazy(() => import('./pages/CalendarDemo'))

// Navigation
const MenuDemo = lazy(() => import('./pages/MenuDemo'))
const BreadcrumbDemo = lazy(() => import('./pages/BreadcrumbDemo'))
const DropdownDemo = lazy(() => import('./pages/DropdownDemo'))
const TabsDemo = lazy(() => import('./pages/TabsDemo'))
const StepsDemo = lazy(() => import('./pages/StepsDemo'))
const PaginationDemo = lazy(() => import('./pages/PaginationDemo'))
const AnchorDemo = lazy(() => import('./pages/AnchorDemo'))
const BackTopDemo = lazy(() => import('./pages/BackTopDemo'))
const AffixDemo = lazy(() => import('./pages/AffixDemo'))
const TourDemo = lazy(() => import('./pages/TourDemo'))
const FloatButtonDemo = lazy(() => import('./pages/FloatButtonDemo'))

// Feedback
const AlertDemo = lazy(() => import('./pages/AlertDemo'))
const MessageDemo = lazy(() => import('./pages/MessageDemo'))
const ModalDemo = lazy(() => import('./pages/ModalDemo'))
const PopconfirmDemo = lazy(() => import('./pages/PopconfirmDemo'))
const PopoverDemo = lazy(() => import('./pages/PopoverDemo'))
const TooltipDemo = lazy(() => import('./pages/TooltipDemo'))
const NotificationDemo = lazy(() => import('./pages/NotificationDemo'))
const DrawerDemo = lazy(() => import('./pages/DrawerDemo'))
const LoadingDemo = lazy(() => import('./pages/LoadingDemo'))

// Charts
const BarChartDemo = lazy(() => import('./pages/BarChartDemo'))
const LineChartDemo = lazy(() => import('./pages/LineChartDemo'))
const AreaChartDemo = lazy(() => import('./pages/AreaChartDemo'))
const PieChartDemo = lazy(() => import('./pages/PieChartDemo'))
const DonutChartDemo = lazy(() => import('./pages/DonutChartDemo'))
const ScatterChartDemo = lazy(() => import('./pages/ScatterChartDemo'))
const RadarChartDemo = lazy(() => import('./pages/RadarChartDemo'))
const FunnelChartDemo = lazy(() => import('./pages/FunnelChartDemo'))
const GaugeChartDemo = lazy(() => import('./pages/GaugeChartDemo'))
const HeatmapChartDemo = lazy(() => import('./pages/HeatmapChartDemo'))
const TreeMapChartDemo = lazy(() => import('./pages/TreeMapChartDemo'))
const SunburstChartDemo = lazy(() => import('./pages/SunburstChartDemo'))

// Advanced
const ResizableDemo = lazy(() => import('./pages/ResizableDemo'))
const VirtualListDemo = lazy(() => import('./pages/VirtualListDemo'))
const InfiniteScrollDemo = lazy(() => import('./pages/InfiniteScrollDemo'))
const CodeEditorDemo = lazy(() => import('./pages/CodeEditorDemo'))
const RichTextEditorDemo = lazy(() => import('./pages/RichTextEditorDemo'))
const KanbanDemo = lazy(() => import('./pages/KanbanDemo'))
const FileManagerDemo = lazy(() => import('./pages/FileManagerDemo'))

// Composite
const DataTableWithToolbarDemo = lazy(() => import('./pages/DataTableWithToolbarDemo'))
const FormWizardDemo = lazy(() => import('./pages/FormWizardDemo'))
const ChatWindowDemo = lazy(() => import('./pages/ChatWindowDemo'))
const CommentThreadDemo = lazy(() => import('./pages/CommentThreadDemo'))
const ActivityFeedDemo = lazy(() => import('./pages/ActivityFeedDemo'))
const NotificationCenterDemo = lazy(() => import('./pages/NotificationCenterDemo'))
const CropUploadDemo = lazy(() => import('./pages/CropUploadDemo'))
const TaskBoardDemo = lazy(() => import('./pages/TaskBoardDemo'))

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <Home /> },
        // Basic
        { path: 'button', element: <ButtonDemo /> },
        { path: 'icon', element: <IconDemo /> },
        { path: 'link', element: <LinkDemo /> },
        { path: 'text', element: <TextDemo /> },
        { path: 'code', element: <CodeDemo /> },
        { path: 'image', element: <ImageDemo /> },
        { path: 'image-cropper', element: <ImageCropperDemo /> },
        { path: 'image-viewer', element: <ImageViewerDemo /> },
        { path: 'avatar', element: <AvatarDemo /> },
        { path: 'badge', element: <BadgeDemo /> },
        { path: 'tag', element: <TagDemo /> },
        { path: 'empty', element: <EmptyDemo /> },
        { path: 'result', element: <ResultDemo /> },
        { path: 'qrcode', element: <QRCodeDemo /> },
        { path: 'statistic', element: <StatisticDemo /> },
        { path: 'rate', element: <RateDemo /> },
        { path: 'segmented', element: <SegmentedDemo /> },
        { path: 'watermark', element: <WatermarkDemo /> },
        // Form
        { path: 'input', element: <InputDemo /> },
        { path: 'input-group', element: <InputGroupDemo /> },
        { path: 'textarea', element: <TextareaDemo /> },
        { path: 'checkbox', element: <CheckboxDemo /> },
        { path: 'radio', element: <RadioDemo /> },
        { path: 'switch', element: <SwitchDemo /> },
        { path: 'slider', element: <SliderDemo /> },
        { path: 'stepper', element: <StepperDemo /> },
        { path: 'select', element: <SelectDemo /> },
        { path: 'auto-complete', element: <AutoCompleteDemo /> },
        { path: 'cascader', element: <CascaderDemo /> },
        { path: 'tree-select', element: <TreeSelectDemo /> },
        { path: 'color-picker', element: <ColorPickerDemo /> },
        { path: 'mentions', element: <MentionsDemo /> },
        { path: 'transfer', element: <TransferDemo /> },
        { path: 'datepicker', element: <DatePickerDemo /> },
        { path: 'timepicker', element: <TimePickerDemo /> },
        { path: 'upload', element: <UploadDemo /> },
        { path: 'form', element: <FormDemo /> },
        // Layout
        { path: 'layout', element: <LayoutDemo /> },
        { path: 'grid', element: <GridDemo /> },
        { path: 'space', element: <SpaceDemo /> },
        { path: 'divider', element: <DividerDemo /> },
        { path: 'card', element: <CardDemo /> },
        { path: 'descriptions', element: <DescriptionsDemo /> },
        { path: 'list', element: <ListDemo /> },
        { path: 'skeleton', element: <SkeletonDemo /> },
        { path: 'splitter', element: <SplitterDemo /> },
        { path: 'print-layout', element: <PrintLayoutDemo /> },
        // Data Display
        { path: 'table', element: <TableDemo /> },
        { path: 'virtual-table', element: <VirtualTableDemo /> },
        { path: 'timeline', element: <TimelineDemo /> },
        { path: 'progress', element: <ProgressDemo /> },
        { path: 'tree', element: <TreeDemo /> },
        { path: 'collapse', element: <CollapseDemo /> },
        { path: 'carousel', element: <CarouselDemo /> },
        { path: 'calendar', element: <CalendarDemo /> },
        // Navigation
        { path: 'menu', element: <MenuDemo /> },
        { path: 'breadcrumb', element: <BreadcrumbDemo /> },
        { path: 'dropdown', element: <DropdownDemo /> },
        { path: 'tabs', element: <TabsDemo /> },
        { path: 'steps', element: <StepsDemo /> },
        { path: 'pagination', element: <PaginationDemo /> },
        { path: 'anchor', element: <AnchorDemo /> },
        { path: 'backtop', element: <BackTopDemo /> },
        { path: 'affix', element: <AffixDemo /> },
        { path: 'tour', element: <TourDemo /> },
        { path: 'float-button', element: <FloatButtonDemo /> },
        // Feedback
        { path: 'alert', element: <AlertDemo /> },
        { path: 'message', element: <MessageDemo /> },
        { path: 'modal', element: <ModalDemo /> },
        { path: 'popconfirm', element: <PopconfirmDemo /> },
        { path: 'popover', element: <PopoverDemo /> },
        { path: 'tooltip', element: <TooltipDemo /> },
        { path: 'notification', element: <NotificationDemo /> },
        { path: 'drawer', element: <DrawerDemo /> },
        { path: 'loading', element: <LoadingDemo /> },
        // Charts
        { path: 'bar-chart', element: <BarChartDemo /> },
        { path: 'line-chart', element: <LineChartDemo /> },
        { path: 'area-chart', element: <AreaChartDemo /> },
        { path: 'pie-chart', element: <PieChartDemo /> },
        { path: 'donut-chart', element: <DonutChartDemo /> },
        { path: 'scatter-chart', element: <ScatterChartDemo /> },
        { path: 'radar-chart', element: <RadarChartDemo /> },
        { path: 'funnel-chart', element: <FunnelChartDemo /> },
        { path: 'gauge-chart', element: <GaugeChartDemo /> },
        { path: 'heatmap-chart', element: <HeatmapChartDemo /> },
        { path: 'treemap-chart', element: <TreeMapChartDemo /> },
        { path: 'sunburst-chart', element: <SunburstChartDemo /> },
        // Advanced
        { path: 'resizable', element: <ResizableDemo /> },
        { path: 'virtual-list', element: <VirtualListDemo /> },
        { path: 'infinite-scroll', element: <InfiniteScrollDemo /> },
        { path: 'code-editor', element: <CodeEditorDemo /> },
        { path: 'rich-text-editor', element: <RichTextEditorDemo /> },
        { path: 'kanban', element: <KanbanDemo /> },
        { path: 'file-manager', element: <FileManagerDemo /> },
        // Composite
        { path: 'data-table-with-toolbar', element: <DataTableWithToolbarDemo /> },
        { path: 'form-wizard', element: <FormWizardDemo /> },
        { path: 'chat-window', element: <ChatWindowDemo /> },
        { path: 'comment-thread', element: <CommentThreadDemo /> },
        { path: 'activity-feed', element: <ActivityFeedDemo /> },
        { path: 'notification-center', element: <NotificationCenterDemo /> },
        { path: 'crop-upload', element: <CropUploadDemo /> },
        { path: 'task-board', element: <TaskBoardDemo /> }
      ]
    }
  ],
  {
    basename: import.meta.env.BASE_URL
  }
)

export default router
