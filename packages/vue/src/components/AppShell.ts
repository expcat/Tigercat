import { computed, defineComponent, h, PropType, ref } from 'vue'
import {
  resolveAppShellActiveTab,
  type AppShellBreadcrumbItem,
  type AppShellTab,
  type HeaderVariant,
  type LayoutSiderSide
} from '@expcat/tigercat-core'
import { Layout } from './Layout'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Content } from './Content'
import { PageHeader } from './PageHeader'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'
import { Tabs, TabPane } from './Tabs'

export const AppShell = defineComponent({
  name: 'TigerAppShell',
  props: {
    collapsed: { type: Boolean, default: undefined },
    defaultCollapsed: { type: Boolean, default: false },
    side: { type: String as PropType<LayoutSiderSide>, default: 'start' },
    headerSticky: { type: Boolean, default: false },
    headerVariant: { type: String as PropType<HeaderVariant>, default: 'default' },
    breadcrumb: { type: Array as PropType<AppShellBreadcrumbItem[]>, default: () => [] },
    tabs: { type: Array as PropType<AppShellTab[]>, default: () => [] },
    activeTab: { type: String, default: undefined },
    defaultActiveTab: { type: String, default: undefined },
    title: { type: String, default: undefined },
    subTitle: { type: String, default: undefined },
    fullHeight: { type: Boolean, default: true },
    className: { type: String, default: undefined }
  },
  emits: ['collapsed-change', 'tab-change'],
  setup(props, { slots, emit }) {
    const localCollapsed = ref(props.defaultCollapsed)
    const localTab = ref(props.defaultActiveTab)
    const collapsed = computed(() =>
      props.collapsed !== undefined ? props.collapsed : localCollapsed.value
    )
    const active = computed(() =>
      resolveAppShellActiveTab(props.tabs, props.activeTab, localTab.value)
    )

    const toggle = () => {
      const next = !collapsed.value
      if (props.collapsed === undefined) localCollapsed.value = next
      emit('collapsed-change', next)
    }

    return () =>
      h(
        Layout,
        { fullHeight: props.fullHeight, className: props.className, 'data-tiger-app-shell': '' },
        {
          default: () => [
            h(
              Sidebar,
              {
                side: props.side,
                collapsible: true,
                collapsed: collapsed.value,
                'onUpdate:collapsed': toggle
              },
              { default: () => slots.sidebar?.() }
            ),
            h('div', { class: 'flex min-h-0 min-w-0 flex-1 flex-col' }, [
              h(
                Header,
                { sticky: props.headerSticky, variant: props.headerVariant },
                { default: () => slots.header?.() }
              ),
              h(Content, null, {
                default: () => [
                  h(
                    PageHeader,
                    { title: props.title, subTitle: props.subTitle },
                    {
                      breadcrumb: () =>
                        props.breadcrumb.length
                          ? h(Breadcrumb, null, {
                              default: () =>
                                props.breadcrumb.map((item) =>
                                  h(
                                    BreadcrumbItem,
                                    { key: item.key ?? item.title, href: item.href },
                                    { default: () => item.title }
                                  )
                                )
                            })
                          : slots.breadcrumb?.(),
                      tabs: () =>
                        props.tabs.length
                          ? h(
                              Tabs,
                              {
                                type: 'card',
                                activeKey: active.value,
                                onChange: (key: string | number) => {
                                  const next = String(key)
                                  if (props.activeTab === undefined) localTab.value = next
                                  emit('tab-change', next)
                                }
                              },
                              {
                                default: () =>
                                  props.tabs.map((tab) =>
                                    h(TabPane, { key: tab.key, tabKey: tab.key, label: tab.title })
                                  )
                              }
                            )
                          : slots.tabs?.(),
                      actions: () => slots.actions?.()
                    }
                  ),
                  slots.default?.()
                ]
              })
            ])
          ]
        }
      )
  }
})

export default AppShell
