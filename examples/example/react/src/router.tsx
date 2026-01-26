import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import Home from './pages/Home'
import AppLayout from './layouts/AppLayout'

// Lazy load all demo pages for better code splitting
const ButtonDemo = lazy(() => import('./pages/ButtonDemo'))
const InputDemo = lazy(() => import('./pages/InputDemo'))
const TextareaDemo = lazy(() => import('./pages/TextareaDemo'))
const CheckboxDemo = lazy(() => import('./pages/CheckboxDemo'))
const RadioDemo = lazy(() => import('./pages/RadioDemo'))
const SwitchDemo = lazy(() => import('./pages/SwitchDemo'))
const SliderDemo = lazy(() => import('./pages/SliderDemo'))
const SelectDemo = lazy(() => import('./pages/SelectDemo'))
const FormDemo = lazy(() => import('./pages/FormDemo'))
const SpaceDemo = lazy(() => import('./pages/SpaceDemo'))
const DividerDemo = lazy(() => import('./pages/DividerDemo'))
const LayoutDemo = lazy(() => import('./pages/LayoutDemo'))
const GridDemo = lazy(() => import('./pages/GridDemo'))
const LinkDemo = lazy(() => import('./pages/LinkDemo'))
const TextDemo = lazy(() => import('./pages/TextDemo'))
const CodeDemo = lazy(() => import('./pages/CodeDemo'))
const IconDemo = lazy(() => import('./pages/IconDemo'))
const DatePickerDemo = lazy(() => import('./pages/DatePickerDemo'))
const TimePickerDemo = lazy(() => import('./pages/TimePickerDemo'))
const UploadDemo = lazy(() => import('./pages/UploadDemo'))
const TableDemo = lazy(() => import('./pages/TableDemo'))
const TagDemo = lazy(() => import('./pages/TagDemo'))
const BadgeDemo = lazy(() => import('./pages/BadgeDemo'))
const CardDemo = lazy(() => import('./pages/CardDemo'))
const AvatarDemo = lazy(() => import('./pages/AvatarDemo'))
const ListDemo = lazy(() => import('./pages/ListDemo'))
const DescriptionsDemo = lazy(() => import('./pages/DescriptionsDemo'))
const TimelineDemo = lazy(() => import('./pages/TimelineDemo'))
const ProgressDemo = lazy(() => import('./pages/ProgressDemo'))
const BarChartDemo = lazy(() => import('./pages/BarChartDemo'))
const ScatterChartDemo = lazy(() => import('./pages/ScatterChartDemo'))
const PieChartDemo = lazy(() => import('./pages/PieChartDemo'))
const DonutChartDemo = lazy(() => import('./pages/DonutChartDemo'))
const MenuDemo = lazy(() => import('./pages/MenuDemo'))
const BreadcrumbDemo = lazy(() => import('./pages/BreadcrumbDemo'))
const DropdownDemo = lazy(() => import('./pages/DropdownDemo'))
const TabsDemo = lazy(() => import('./pages/TabsDemo'))
const TreeDemo = lazy(() => import('./pages/TreeDemo'))
const SkeletonDemo = lazy(() => import('./pages/SkeletonDemo'))
const AlertDemo = lazy(() => import('./pages/AlertDemo'))
const MessageDemo = lazy(() => import('./pages/MessageDemo'))
const ModalDemo = lazy(() => import('./pages/ModalDemo'))
const PopconfirmDemo = lazy(() => import('./pages/PopconfirmDemo'))
const PopoverDemo = lazy(() => import('./pages/PopoverDemo'))
const TooltipDemo = lazy(() => import('./pages/TooltipDemo'))
const NotificationDemo = lazy(() => import('./pages/NotificationDemo'))
const StepsDemo = lazy(() => import('./pages/StepsDemo'))
const PaginationDemo = lazy(() => import('./pages/PaginationDemo'))
const DrawerDemo = lazy(() => import('./pages/DrawerDemo'))
const LoadingDemo = lazy(() => import('./pages/LoadingDemo'))

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'button', element: <ButtonDemo /> },
        { path: 'input', element: <InputDemo /> },
        { path: 'textarea', element: <TextareaDemo /> },
        { path: 'checkbox', element: <CheckboxDemo /> },
        { path: 'radio', element: <RadioDemo /> },
        { path: 'switch', element: <SwitchDemo /> },
        { path: 'slider', element: <SliderDemo /> },
        { path: 'select', element: <SelectDemo /> },
        { path: 'form', element: <FormDemo /> },
        { path: 'space', element: <SpaceDemo /> },
        { path: 'divider', element: <DividerDemo /> },
        { path: 'layout', element: <LayoutDemo /> },
        { path: 'grid', element: <GridDemo /> },
        { path: 'link', element: <LinkDemo /> },
        { path: 'text', element: <TextDemo /> },
        { path: 'code', element: <CodeDemo /> },
        { path: 'icon', element: <IconDemo /> },
        { path: 'datepicker', element: <DatePickerDemo /> },
        { path: 'timepicker', element: <TimePickerDemo /> },
        { path: 'upload', element: <UploadDemo /> },
        { path: 'table', element: <TableDemo /> },
        { path: 'tag', element: <TagDemo /> },
        { path: 'badge', element: <BadgeDemo /> },
        { path: 'card', element: <CardDemo /> },
        { path: 'avatar', element: <AvatarDemo /> },
        { path: 'list', element: <ListDemo /> },
        { path: 'descriptions', element: <DescriptionsDemo /> },
        { path: 'timeline', element: <TimelineDemo /> },
        { path: 'progress', element: <ProgressDemo /> },
        { path: 'bar-chart', element: <BarChartDemo /> },
        { path: 'scatter-chart', element: <ScatterChartDemo /> },
        { path: 'pie-chart', element: <PieChartDemo /> },
        { path: 'donut-chart', element: <DonutChartDemo /> },
        { path: 'menu', element: <MenuDemo /> },
        { path: 'breadcrumb', element: <BreadcrumbDemo /> },
        { path: 'dropdown', element: <DropdownDemo /> },
        { path: 'tabs', element: <TabsDemo /> },
        { path: 'tree', element: <TreeDemo /> },
        { path: 'skeleton', element: <SkeletonDemo /> },
        { path: 'alert', element: <AlertDemo /> },
        { path: 'message', element: <MessageDemo /> },
        { path: 'modal', element: <ModalDemo /> },
        { path: 'popconfirm', element: <PopconfirmDemo /> },
        { path: 'popover', element: <PopoverDemo /> },
        { path: 'tooltip', element: <TooltipDemo /> },
        { path: 'notification', element: <NotificationDemo /> },
        { path: 'steps', element: <StepsDemo /> },
        { path: 'pagination', element: <PaginationDemo /> },
        { path: 'drawer', element: <DrawerDemo /> },
        { path: 'loading', element: <LoadingDemo /> }
      ]
    }
  ],
  {
    basename: import.meta.env.BASE_URL
  }
)

export default router
