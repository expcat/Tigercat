import { PageHeader } from '@expcat/tigercat-react/PageHeader'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react/Breadcrumb'
import { Tabs, TabPane } from '@expcat/tigercat-react/Tabs'

export default function App() {
  return (
    <PageHeader
      title="发布记录"
      backHref="/releases"
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem current>发布</BreadcrumbItem>
        </Breadcrumb>
      }
      tabs={
        <Tabs defaultActiveKey="notes">
          <TabPane tabKey="notes" label="说明" />
          <TabPane tabKey="files" label="文件" />
        </Tabs>
      }
      footer={<span>页脚由调用方提供</span>}
    />
  )
}
