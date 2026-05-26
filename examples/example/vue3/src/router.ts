import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'

const lazyPage = (loader: () => Promise<{ default: Component }>) => defineAsyncComponent(loader)
const Home = lazyPage(() => import('./pages/Home.vue'))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', component: Home },
        // Basic
        { path: 'button', component: lazyPage(() => import('./pages/ButtonDemo.vue')) },
        { path: 'icon', component: lazyPage(() => import('./pages/IconDemo.vue')) },
        { path: 'link', component: lazyPage(() => import('./pages/LinkDemo.vue')) },
        { path: 'text', component: lazyPage(() => import('./pages/TextDemo.vue')) },
        { path: 'code', component: lazyPage(() => import('./pages/CodeDemo.vue')) },
        { path: 'image', component: lazyPage(() => import('./pages/ImageDemo.vue')) },
        {
          path: 'image-cropper',
          component: lazyPage(() => import('./pages/ImageCropperDemo.vue'))
        },
        { path: 'image-viewer', component: lazyPage(() => import('./pages/ImageViewerDemo.vue')) },
        { path: 'avatar', component: lazyPage(() => import('./pages/AvatarDemo.vue')) },
        { path: 'badge', component: lazyPage(() => import('./pages/BadgeDemo.vue')) },
        { path: 'tag', component: lazyPage(() => import('./pages/TagDemo.vue')) },
        { path: 'empty', component: lazyPage(() => import('./pages/EmptyDemo.vue')) },
        { path: 'result', component: lazyPage(() => import('./pages/ResultDemo.vue')) },
        { path: 'qrcode', component: lazyPage(() => import('./pages/QRCodeDemo.vue')) },
        { path: 'statistic', component: lazyPage(() => import('./pages/StatisticDemo.vue')) },
        { path: 'rate', component: lazyPage(() => import('./pages/RateDemo.vue')) },
        { path: 'segmented', component: lazyPage(() => import('./pages/SegmentedDemo.vue')) },
        { path: 'watermark', component: lazyPage(() => import('./pages/WatermarkDemo.vue')) },
        // Form
        { path: 'input', component: lazyPage(() => import('./pages/InputDemo.vue')) },
        { path: 'input-group', component: lazyPage(() => import('./pages/InputGroupDemo.vue')) },
        { path: 'textarea', component: lazyPage(() => import('./pages/TextareaDemo.vue')) },
        { path: 'checkbox', component: lazyPage(() => import('./pages/CheckboxDemo.vue')) },
        { path: 'radio', component: lazyPage(() => import('./pages/RadioDemo.vue')) },
        { path: 'switch', component: lazyPage(() => import('./pages/SwitchDemo.vue')) },
        { path: 'slider', component: lazyPage(() => import('./pages/SliderDemo.vue')) },
        { path: 'stepper', component: lazyPage(() => import('./pages/StepperDemo.vue')) },
        { path: 'select', component: lazyPage(() => import('./pages/SelectDemo.vue')) },
        {
          path: 'auto-complete',
          component: lazyPage(() => import('./pages/AutoCompleteDemo.vue'))
        },
        { path: 'cascader', component: lazyPage(() => import('./pages/CascaderDemo.vue')) },
        { path: 'tree-select', component: lazyPage(() => import('./pages/TreeSelectDemo.vue')) },
        { path: 'color-picker', component: lazyPage(() => import('./pages/ColorPickerDemo.vue')) },
        { path: 'color-swatch', component: lazyPage(() => import('./pages/ColorSwatchDemo.vue')) },
        { path: 'cron-editor', component: lazyPage(() => import('./pages/CronEditorDemo.vue')) },
        { path: 'signature', component: lazyPage(() => import('./pages/SignatureDemo.vue')) },
        {
          path: 'number-keyboard',
          component: lazyPage(() => import('./pages/NumberKeyboardDemo.vue'))
        },
        { path: 'mentions', component: lazyPage(() => import('./pages/MentionsDemo.vue')) },
        { path: 'transfer', component: lazyPage(() => import('./pages/TransferDemo.vue')) },
        { path: 'datepicker', component: lazyPage(() => import('./pages/DatePickerDemo.vue')) },
        { path: 'timepicker', component: lazyPage(() => import('./pages/TimePickerDemo.vue')) },
        { path: 'upload', component: lazyPage(() => import('./pages/UploadDemo.vue')) },
        { path: 'form', component: lazyPage(() => import('./pages/FormDemo.vue')) },
        // Layout
        { path: 'layout', component: lazyPage(() => import('./pages/LayoutDemo.vue')) },
        { path: 'grid', component: lazyPage(() => import('./pages/GridDemo.vue')) },
        { path: 'space', component: lazyPage(() => import('./pages/SpaceDemo.vue')) },
        { path: 'divider', component: lazyPage(() => import('./pages/DividerDemo.vue')) },
        { path: 'card', component: lazyPage(() => import('./pages/CardDemo.vue')) },
        { path: 'descriptions', component: lazyPage(() => import('./pages/DescriptionsDemo.vue')) },
        { path: 'list', component: lazyPage(() => import('./pages/ListDemo.vue')) },
        { path: 'skeleton', component: lazyPage(() => import('./pages/SkeletonDemo.vue')) },
        { path: 'splitter', component: lazyPage(() => import('./pages/SplitterDemo.vue')) },
        { path: 'print-layout', component: lazyPage(() => import('./pages/PrintLayoutDemo.vue')) },
        // Data Display
        { path: 'table', component: lazyPage(() => import('./pages/TableDemo.vue')) },
        {
          path: 'virtual-table',
          component: lazyPage(() => import('./pages/VirtualTableDemo.vue'))
        },
        { path: 'timeline', component: lazyPage(() => import('./pages/TimelineDemo.vue')) },
        { path: 'progress', component: lazyPage(() => import('./pages/ProgressDemo.vue')) },
        { path: 'tree', component: lazyPage(() => import('./pages/TreeDemo.vue')) },
        { path: 'collapse', component: lazyPage(() => import('./pages/CollapseDemo.vue')) },
        { path: 'carousel', component: lazyPage(() => import('./pages/CarouselDemo.vue')) },
        { path: 'calendar', component: lazyPage(() => import('./pages/CalendarDemo.vue')) },
        { path: 'countdown', component: lazyPage(() => import('./pages/CountdownDemo.vue')) },
        // Navigation
        { path: 'menu', component: lazyPage(() => import('./pages/MenuDemo.vue')) },
        { path: 'breadcrumb', component: lazyPage(() => import('./pages/BreadcrumbDemo.vue')) },
        { path: 'dropdown', component: lazyPage(() => import('./pages/DropdownDemo.vue')) },
        { path: 'tabs', component: lazyPage(() => import('./pages/TabsDemo.vue')) },
        { path: 'steps', component: lazyPage(() => import('./pages/StepsDemo.vue')) },
        { path: 'pagination', component: lazyPage(() => import('./pages/PaginationDemo.vue')) },
        { path: 'anchor', component: lazyPage(() => import('./pages/AnchorDemo.vue')) },
        { path: 'backtop', component: lazyPage(() => import('./pages/BackTopDemo.vue')) },
        { path: 'affix', component: lazyPage(() => import('./pages/AffixDemo.vue')) },
        { path: 'tour', component: lazyPage(() => import('./pages/TourDemo.vue')) },
        { path: 'float-button', component: lazyPage(() => import('./pages/FloatButtonDemo.vue')) },
        { path: 'spotlight', component: lazyPage(() => import('./pages/SpotlightDemo.vue')) },
        { path: 'scroll-spy', component: lazyPage(() => import('./pages/ScrollSpyDemo.vue')) },
        // Feedback
        { path: 'alert', component: lazyPage(() => import('./pages/AlertDemo.vue')) },
        { path: 'message', component: lazyPage(() => import('./pages/MessageDemo.vue')) },
        { path: 'modal', component: lazyPage(() => import('./pages/ModalDemo.vue')) },
        { path: 'popconfirm', component: lazyPage(() => import('./pages/PopconfirmDemo.vue')) },
        { path: 'popover', component: lazyPage(() => import('./pages/PopoverDemo.vue')) },
        { path: 'tooltip', component: lazyPage(() => import('./pages/TooltipDemo.vue')) },
        { path: 'notification', component: lazyPage(() => import('./pages/NotificationDemo.vue')) },
        { path: 'drawer', component: lazyPage(() => import('./pages/DrawerDemo.vue')) },
        { path: 'loading', component: lazyPage(() => import('./pages/LoadingDemo.vue')) },
        // Charts
        { path: 'bar-chart', component: lazyPage(() => import('./pages/BarChartDemo.vue')) },
        { path: 'line-chart', component: lazyPage(() => import('./pages/LineChartDemo.vue')) },
        { path: 'area-chart', component: lazyPage(() => import('./pages/AreaChartDemo.vue')) },
        { path: 'pie-chart', component: lazyPage(() => import('./pages/PieChartDemo.vue')) },
        { path: 'donut-chart', component: lazyPage(() => import('./pages/DonutChartDemo.vue')) },
        {
          path: 'scatter-chart',
          component: lazyPage(() => import('./pages/ScatterChartDemo.vue'))
        },
        { path: 'radar-chart', component: lazyPage(() => import('./pages/RadarChartDemo.vue')) },
        { path: 'funnel-chart', component: lazyPage(() => import('./pages/FunnelChartDemo.vue')) },
        { path: 'gauge-chart', component: lazyPage(() => import('./pages/GaugeChartDemo.vue')) },
        {
          path: 'heatmap-chart',
          component: lazyPage(() => import('./pages/HeatmapChartDemo.vue'))
        },
        {
          path: 'treemap-chart',
          component: lazyPage(() => import('./pages/TreeMapChartDemo.vue'))
        },
        {
          path: 'sunburst-chart',
          component: lazyPage(() => import('./pages/SunburstChartDemo.vue'))
        },
        { path: 'org-chart', component: lazyPage(() => import('./pages/OrgChartDemo.vue')) },
        // Advanced
        { path: 'resizable', component: lazyPage(() => import('./pages/ResizableDemo.vue')) },
        { path: 'virtual-list', component: lazyPage(() => import('./pages/VirtualListDemo.vue')) },
        {
          path: 'infinite-scroll',
          component: lazyPage(() => import('./pages/InfiniteScrollDemo.vue'))
        },
        { path: 'code-editor', component: lazyPage(() => import('./pages/CodeEditorDemo.vue')) },
        {
          path: 'rich-text-editor',
          component: lazyPage(() => import('./pages/RichTextEditorDemo.vue'))
        },
        { path: 'kanban', component: lazyPage(() => import('./pages/KanbanDemo.vue')) },
        { path: 'file-manager', component: lazyPage(() => import('./pages/FileManagerDemo.vue')) },
        {
          path: 'image-annotation',
          component: lazyPage(() => import('./pages/ImageAnnotationDemo.vue'))
        },
        // Composite
        {
          path: 'data-table-with-toolbar',
          component: lazyPage(() => import('./pages/DataTableWithToolbarDemo.vue'))
        },
        { path: 'form-wizard', component: lazyPage(() => import('./pages/FormWizardDemo.vue')) },
        { path: 'chat-window', component: lazyPage(() => import('./pages/ChatWindowDemo.vue')) },
        {
          path: 'comment-thread',
          component: lazyPage(() => import('./pages/CommentThreadDemo.vue'))
        },
        {
          path: 'activity-feed',
          component: lazyPage(() => import('./pages/ActivityFeedDemo.vue'))
        },
        {
          path: 'notification-center',
          component: lazyPage(() => import('./pages/NotificationCenterDemo.vue'))
        },
        { path: 'crop-upload', component: lazyPage(() => import('./pages/CropUploadDemo.vue')) },
        { path: 'task-board', component: lazyPage(() => import('./pages/TaskBoardDemo.vue')) },
        // Hooks
        { path: 'use-drag', component: lazyPage(() => import('./pages/UseDragDemo.vue')) },
        {
          path: 'use-controlled-state',
          component: lazyPage(() => import('./pages/UseControlledStateDemo.vue'))
        },
        {
          path: 'use-chart-interaction',
          component: lazyPage(() => import('./pages/UseChartInteractionDemo.vue'))
        }
      ]
    }
  ]
})

export default router
