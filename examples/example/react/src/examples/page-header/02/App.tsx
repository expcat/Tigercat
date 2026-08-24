import { useState } from 'react'
import { Breadcrumb } from '@expcat/tigercat-react/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-react/BreadcrumbItem'
import { Button } from '@expcat/tigercat-react/Button'
import { PageHeader } from '@expcat/tigercat-react/PageHeader'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未操作')

  return (
    <div className="space-y-3">
      <PageHeader
        title="商品编辑"
        subTitle="SKU-8848"
        onBack={() => setLastAction('返回目录')}
        breadcrumb={
          <Breadcrumb separator="chevron">
            <BreadcrumbItem href="/">首页</BreadcrumbItem>
            <BreadcrumbItem href="/products">商品</BreadcrumbItem>
            <BreadcrumbItem current>编辑</BreadcrumbItem>
          </Breadcrumb>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setLastAction('预览')}>
              预览
            </Button>
            <Button size="sm" onClick={() => setLastAction('发布')}>
              发布
            </Button>
          </>
        }
      />
      <p className="text-sm text-gray-500">最近操作：{lastAction}</p>
    </div>
  )
}
