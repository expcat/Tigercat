import React, { useState } from 'react'
import {
  resolveAppShellActiveTab,
  type AppShellProps as CoreAppShellProps
} from '@expcat/tigercat-core'
import { Layout } from './Layout'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Content } from './Content'
import { PageHeader } from './PageHeader'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'
import { Tabs, TabPane } from './Tabs'

export interface AppShellProps extends CoreAppShellProps {
  sidebar?: React.ReactNode
  header?: React.ReactNode
  breadcrumbExtra?: React.ReactNode
  tabsExtra?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function AppShell({
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  side = 'start',
  headerSticky = false,
  headerVariant = 'default',
  breadcrumb = [],
  tabs = [],
  activeTab,
  defaultActiveTab,
  onTabChange,
  title,
  subTitle,
  fullHeight = true,
  className,
  sidebar,
  header,
  breadcrumbExtra,
  tabsExtra,
  actions,
  children
}: AppShellProps) {
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed)
  const [localTab, setLocalTab] = useState(defaultActiveTab)
  const effectiveCollapsed = collapsed !== undefined ? collapsed : localCollapsed
  const active = resolveAppShellActiveTab(tabs, activeTab, localTab)

  return (
    <Layout fullHeight={fullHeight} className={className} data-tiger-app-shell="">
      <Sidebar
        side={side}
        collapsible
        collapsed={effectiveCollapsed}
        onCollapsedChange={(next) => {
          if (collapsed === undefined) setLocalCollapsed(next)
          onCollapsedChange?.(next)
        }}>
        {sidebar}
      </Sidebar>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header sticky={headerSticky} variant={headerVariant}>
          {header}
        </Header>
        <Content>
          <PageHeader
            title={title}
            subTitle={subTitle}
            breadcrumb={
              breadcrumb.length ? (
                <Breadcrumb>
                  {breadcrumb.map((item) => (
                    <BreadcrumbItem key={item.key ?? item.title} href={item.href}>
                      {item.title}
                    </BreadcrumbItem>
                  ))}
                </Breadcrumb>
              ) : (
                breadcrumbExtra
              )
            }
            tabs={
              tabs.length ? (
                <Tabs
                  type="card"
                  activeKey={active}
                  onChange={(key) => {
                    const next = String(key)
                    if (activeTab === undefined) setLocalTab(next)
                    onTabChange?.(next)
                  }}>
                  {tabs.map((tab) => (
                    <TabPane key={tab.key} tabKey={tab.key} label={tab.title} />
                  ))}
                </Tabs>
              ) : (
                tabsExtra
              )
            }
            actions={actions}
          />
          {children}
        </Content>
      </div>
    </Layout>
  )
}
