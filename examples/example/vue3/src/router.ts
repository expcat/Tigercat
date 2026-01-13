import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import AppLayout from './layouts/AppLayout.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', component: Home },
        { path: 'button', component: () => import('./pages/ButtonDemo.vue') },
        { path: 'input', component: () => import('./pages/InputDemo.vue') },
        {
          path: 'textarea',
          component: () => import('./pages/TextareaDemo.vue'),
        },
        {
          path: 'checkbox',
          component: () => import('./pages/CheckboxDemo.vue'),
        },
        { path: 'radio', component: () => import('./pages/RadioDemo.vue') },
        { path: 'switch', component: () => import('./pages/SwitchDemo.vue') },
        { path: 'slider', component: () => import('./pages/SliderDemo.vue') },
        { path: 'select', component: () => import('./pages/SelectDemo.vue') },
        { path: 'form', component: () => import('./pages/FormDemo.vue') },
        { path: 'space', component: () => import('./pages/SpaceDemo.vue') },
        { path: 'divider', component: () => import('./pages/DividerDemo.vue') },
        { path: 'layout', component: () => import('./pages/LayoutDemo.vue') },
        { path: 'grid', component: () => import('./pages/GridDemo.vue') },
        { path: 'link', component: () => import('./pages/LinkDemo.vue') },
        { path: 'text', component: () => import('./pages/TextDemo.vue') },
        { path: 'icon', component: () => import('./pages/IconDemo.vue') },
        {
          path: 'datepicker',
          component: () => import('./pages/DatePickerDemo.vue'),
        },
        {
          path: 'timepicker',
          component: () => import('./pages/TimePickerDemo.vue'),
        },
        { path: 'upload', component: () => import('./pages/UploadDemo.vue') },
        { path: 'table', component: () => import('./pages/TableDemo.vue') },
        { path: 'tag', component: () => import('./pages/TagDemo.vue') },
        { path: 'badge', component: () => import('./pages/BadgeDemo.vue') },
        { path: 'card', component: () => import('./pages/CardDemo.vue') },
        { path: 'avatar', component: () => import('./pages/AvatarDemo.vue') },
        { path: 'list', component: () => import('./pages/ListDemo.vue') },
        {
          path: 'descriptions',
          component: () => import('./pages/DescriptionsDemo.vue'),
        },
        {
          path: 'timeline',
          component: () => import('./pages/TimelineDemo.vue'),
        },
        {
          path: 'progress',
          component: () => import('./pages/ProgressDemo.vue'),
        },
        { path: 'menu', component: () => import('./pages/MenuDemo.vue') },
        {
          path: 'breadcrumb',
          component: () => import('./pages/BreadcrumbDemo.vue'),
        },
        {
          path: 'dropdown',
          component: () => import('./pages/DropdownDemo.vue'),
        },
        { path: 'tabs', component: () => import('./pages/TabsDemo.vue') },
        { path: 'tree', component: () => import('./pages/TreeDemo.vue') },
        {
          path: 'skeleton',
          component: () => import('./pages/SkeletonDemo.vue'),
        },
        { path: 'alert', component: () => import('./pages/AlertDemo.vue') },
        { path: 'message', component: () => import('./pages/MessageDemo.vue') },
        { path: 'modal', component: () => import('./pages/ModalDemo.vue') },
        {
          path: 'popconfirm',
          component: () => import('./pages/PopconfirmDemo.vue'),
        },
        { path: 'popover', component: () => import('./pages/PopoverDemo.vue') },
        { path: 'tooltip', component: () => import('./pages/TooltipDemo.vue') },
        {
          path: 'notification',
          component: () => import('./pages/NotificationDemo.vue'),
        },
        { path: 'steps', component: () => import('./pages/StepsDemo.vue') },
        {
          path: 'pagination',
          component: () => import('./pages/PaginationDemo.vue'),
        },
        { path: 'drawer', component: () => import('./pages/DrawerDemo.vue') },
        { path: 'loading', component: () => import('./pages/LoadingDemo.vue') },
      ],
    },
  ],
});

export default router;
