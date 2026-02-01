import { useState } from 'react'
import { List, Card, Space, Button, Pagination, type ListProps } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

type DemoItem = NonNullable<ListProps['dataSource']>[number]

const basicData: DemoItem[] = [
  { key: 1, title: '列表项 1', description: '这是第一个列表项的描述' },
  { key: 2, title: '列表项 2', description: '这是第二个列表项的描述' },
  { key: 3, title: '列表项 3', description: '这是第三个列表项的描述' }
]

const userData: DemoItem[] = [
  {
    key: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    title: '张三',
    description: '软件工程师 · 北京'
  },
  {
    key: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    title: '李四',
    description: '产品经理 · 上海'
  },
  {
    key: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    title: '王五',
    description: 'UI 设计师 · 深圳'
  }
]

const largeData: DemoItem[] = Array.from({ length: 25 }, (_, i) => ({
  key: i + 1,
  title: `列表项 ${i + 1}`,
  description: `这是第 ${i + 1} 个列表项的描述信息`
}))

const gridData: DemoItem[] = [
  { key: 1, title: '卡片 1', content: '这是卡片内容 1' },
  { key: 2, title: '卡片 2', content: '这是卡片内容 2' },
  { key: 3, title: '卡片 3', content: '这是卡片内容 3' },
  { key: 4, title: '卡片 4', content: '这是卡片内容 4' },
  { key: 5, title: '卡片 5', content: '这是卡片内容 5' },
  { key: 6, title: '卡片 6', content: '这是卡片内容 6' }
]

const extraData: DemoItem[] = [
  {
    key: 1,
    title: '任务 1',
    description: '完成项目文档',
    extra: <Button size="sm">查看</Button>
  },
  {
    key: 2,
    title: '任务 2',
    description: 'Review Pull Requests',
    extra: <Button size="sm">查看</Button>
  }
]

const productData: DemoItem[] = [
  { key: 1, name: 'Product A', price: '¥99', stock: 15 },
  { key: 2, name: 'Product B', price: '¥149', stock: 8 },
  { key: 3, name: 'Product C', price: '¥199', stock: 22 }
]

const basicSnippet = `<List dataSource={basicData} />`

const sizeSnippet = `<List dataSource={basicData.slice(0, 2)} size="sm" />
<List dataSource={basicData.slice(0, 2)} size="md" />
<List dataSource={basicData.slice(0, 2)} size="lg" />`

const borderSnippet = `<List dataSource={basicData.slice(0, 2)} bordered="none" />
<List dataSource={basicData.slice(0, 2)} bordered="divided" />
<List dataSource={basicData.slice(0, 2)} bordered="bordered" />`

const splitSnippet = `<List dataSource={basicData.slice(0, 3)} bordered="divided" split />
<List dataSource={basicData.slice(0, 3)} bordered="divided" split={false} />`

const avatarSnippet = `<List dataSource={userData} />`

const extraSnippet = `<List dataSource={extraData} />`

const renderSnippet = `<List dataSource={productData} hoverable renderItem={(item) => (...)} />`

const headerFooterSnippet = `<List dataSource={basicData} header={...} footer={...} />`

const paginationSnippet = `<List dataSource={pagedListData} />
<Pagination
  current={pageInfo.current}
  pageSize={pageInfo.pageSize}
  total={largeData.length}
  showSizeChanger
  showTotal
  onChange={(current, pageSize) => setPageInfo({ current, pageSize })}
  onPageSizeChange={(current, pageSize) => setPageInfo({ current, pageSize })}
/>`

const gridSnippet = `<List
  dataSource={gridData}
  grid={{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }}
  bordered="none"
  renderItem={(item) => (...)}
/>`

const loadingSnippet = `<List dataSource={basicData} loading={loading} />`

const emptySnippet = `<List dataSource={[]} emptyText="暂无数据" />`

const clickableSnippet = `<List dataSource={basicData} hoverable onItemClick={handleItemClick} />`

export default function ListDemo() {
  const [loading, setLoading] = useState(false)
  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: 10 })

  const pagedListData = largeData.slice(
    (pageInfo.current - 1) * pageInfo.pageSize,
    pageInfo.current * pageInfo.pageSize
  )

  const handleItemClick = (item: DemoItem, index: number) => {
    console.log('点击了列表项:', item, '索引:', index)
  }

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">List 列表</h1>
        <p className="text-gray-600">通用列表组件，用于展示一系列相似的数据项。</p>
      </div>

      <DemoBlock title="基本用法" description="最简单的列表展示。" code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={basicData} />
        </div>
      </DemoBlock>

      <DemoBlock title="列表尺寸" description="列表支持三种尺寸：小、中、大。" code={sizeSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={16} className="w-full">
            <div>
              <h3 className="text-sm font-semibold mb-2">小尺寸</h3>
              <List dataSource={basicData.slice(0, 2)} size="sm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">中等尺寸（默认）</h3>
              <List dataSource={basicData.slice(0, 2)} size="md" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">大尺寸</h3>
              <List dataSource={basicData.slice(0, 2)} size="lg" />
            </div>
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock title="边框样式" description="列表支持多种边框样式。" code={borderSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={16} className="w-full">
            <div>
              <h3 className="text-sm font-semibold mb-2">无边框</h3>
              <List dataSource={basicData.slice(0, 2)} bordered="none" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">分割线（默认）</h3>
              <List dataSource={basicData.slice(0, 2)} bordered="divided" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">完整边框</h3>
              <List dataSource={basicData.slice(0, 2)} bordered="bordered" />
            </div>
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock
        title="分割线（split）"
        description='当 bordered="divided" 时，可通过 split 控制是否显示分割线。'
        code={splitSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">split = true（默认）</h3>
              <List dataSource={basicData.slice(0, 3)} bordered="divided" split />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">split = false</h3>
              <List dataSource={basicData.slice(0, 3)} bordered="divided" split={false} />
            </div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock title="带头像的列表" description="列表项可以包含头像。" code={avatarSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={userData} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="带额外内容"
        description="通过数据项的 extra 在右侧添加操作区。"
        code={extraSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={extraData} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义列表项渲染"
        description="通过 renderItem 自定义每一项的布局。"
        code={renderSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <List dataSource={pagedListData} />
            <Pagination
              current={pageInfo.current}
              pageSize={pageInfo.pageSize}
              total={largeData.length}
              showSizeChanger
              showTotal
              onChange={(current, pageSize) => setPageInfo({ current, pageSize })}
              onPageSizeChange={(current, pageSize) => setPageInfo({ current, pageSize })}
            />
          </div>
                    ? Number(item.stock)
                    : undefined

              return (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-500">库存：{stock ?? '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{price}</div>
                    <Button size="sm">购买</Button>
                  </div>
                </div>
              )
            }}
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="头部和底部"
        description="列表可以添加头部和底部内容。"
        code={headerFooterSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List
            dataSource={basicData}
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">用户列表</h3>
                <Button size="sm">添加</Button>
              </div>
            }
            footer={<p className="text-sm text-gray-500">共 {basicData.length} 条记录</p>}
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="分页列表"
        description="当数据较多时，可以使用分页功能。"
        code={paginationSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List
            dataSource={largeData}
            pagination={{
              current: 1,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: true
            }}
            onPageChange={(page) => {
              setPageInfo(page)
              console.log('分页变化:', page)
            }}
          />
          <div className="mt-3 text-sm text-gray-600">
            当前：第 {pageInfo.current} 页，{pageInfo.pageSize} / 页
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="网格布局"
        description="列表项可以以网格形式展示，支持响应式布局。"
        code={gridSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List
            dataSource={gridData}
            grid={{
              gutter: 16,
              column: 3,
              xs: 1,
              sm: 2,
              md: 3
            }}
            bordered="none"
            renderItem={(item) => {
              const title = typeof item.title === 'string' ? item.title : ''
              const content = typeof item.content === 'string' ? item.content : ''

              return (
                <Card variant="shadow">
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600">{content}</p>
                </Card>
              )
            }}
          />
        </div>
      </DemoBlock>

      <DemoBlock title="加载状态" description="列表支持加载状态。" code={loadingSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={16} className="w-full">
            <Button onClick={simulateLoading}>{loading ? '加载中...' : '模拟加载'}</Button>
            <List dataSource={basicData} loading={loading} />
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock title="空状态" description="当列表没有数据时显示空状态。" code={emptySnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={[]} emptyText="暂无数据" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="可点击列表"
        description="列表项可以添加点击事件和悬停效果。"
        code={clickableSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={basicData} hoverable onItemClick={handleItemClick} />
        </div>
      </DemoBlock>
    </div>
  )
}
