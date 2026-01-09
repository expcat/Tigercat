import { useMemo, useState } from 'react';
import {
  List,
  Card,
  Space,
  Divider,
  Button,
  type ListProps,
} from '@tigercat/react';
import { Link } from 'react-router-dom';

export default function ListDemo() {
  type DemoItem = NonNullable<ListProps['dataSource']>[number];

  // Basic list data
  const basicData: DemoItem[] = [
    { key: 1, title: '列表项 1', description: '这是第一个列表项的描述' },
    { key: 2, title: '列表项 2', description: '这是第二个列表项的描述' },
    { key: 3, title: '列表项 3', description: '这是第三个列表项的描述' },
  ];

  // List with avatars
  const userData: DemoItem[] = [
    {
      key: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      title: '张三',
      description: '软件工程师 · 北京',
    },
    {
      key: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      title: '李四',
      description: '产品经理 · 上海',
    },
    {
      key: 3,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      title: '王五',
      description: 'UI 设计师 · 深圳',
    },
  ];

  // Large dataset for pagination
  const largeData: DemoItem[] = Array.from({ length: 25 }, (_, i) => ({
    key: i + 1,
    title: `列表项 ${i + 1}`,
    description: `这是第 ${i + 1} 个列表项的描述信息`,
  }));

  // Grid data
  const gridData = useMemo(
    () => [
      { key: 1, title: '卡片 1', content: '这是卡片内容 1' },
      { key: 2, title: '卡片 2', content: '这是卡片内容 2' },
      { key: 3, title: '卡片 3', content: '这是卡片内容 3' },
      { key: 4, title: '卡片 4', content: '这是卡片内容 4' },
      { key: 5, title: '卡片 5', content: '这是卡片内容 5' },
      { key: 6, title: '卡片 6', content: '这是卡片内容 6' },
    ],
    []
  );

  const extraData: DemoItem[] = useMemo(
    () => [
      {
        key: 1,
        title: '任务 1',
        description: '完成项目文档',
        extra: <Button size="sm">查看</Button>,
      },
      {
        key: 2,
        title: '任务 2',
        description: 'Review Pull Requests',
        extra: <Button size="sm">查看</Button>,
      },
    ],
    []
  );

  const productData = useMemo(
    () => [
      { key: 1, name: 'Product A', price: '¥99', stock: 15 },
      { key: 2, name: 'Product B', price: '¥149', stock: 8 },
      { key: 3, name: 'Product C', price: '¥199', stock: 22 },
    ],
    []
  );

  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: 10 });

  const handleItemClick = (item: DemoItem, index: number) => {
    console.log('点击了列表项:', item, '索引:', index);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">List 列表</h1>
        <p className="text-gray-600">
          通用列表组件，用于展示一系列相似的数据项。
        </p>
      </div>

      <div className="mb-10 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="text-sm font-semibold text-gray-900 mb-3">功能导航</div>
        <div className="flex flex-wrap gap-2">
          {[
            ['#basic', '基本用法'],
            ['#size', '尺寸'],
            ['#border', '边框'],
            ['#split', '分割线'],
            ['#avatar', '头像'],
            ['#extra', '额外内容'],
            ['#renderItem', '自定义渲染'],
            ['#headerFooter', '头尾'],
            ['#pagination', '分页'],
            ['#grid', '网格'],
            ['#loading', '加载'],
            ['#empty', '空态'],
            ['#clickable', '点击'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* 基本用法 */}
      <section className="mb-12" id="basic">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">最简单的列表展示。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={basicData} />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 尺寸 */}
      <section className="mb-12" id="size">
        <h2 className="text-2xl font-bold mb-4">列表尺寸</h2>
        <p className="text-gray-600 mb-6">列表支持三种尺寸：小、中、大。</p>
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
        <Divider className="my-6" />
      </section>

      {/* 边框样式 */}
      <section className="mb-12" id="border">
        <h2 className="text-2xl font-bold mb-4">边框样式</h2>
        <p className="text-gray-600 mb-6">列表支持多种边框样式。</p>
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
        <Divider className="my-6" />
      </section>

      {/* 分割线 */}
      <section className="mb-12" id="split">
        <h2 className="text-2xl font-bold mb-4">分割线（split）</h2>
        <p className="text-gray-600 mb-6">
          当 bordered="divided" 时，可通过 split 控制是否显示分割线。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">
                split = true（默认）
              </h3>
              <List
                dataSource={basicData.slice(0, 3)}
                bordered="divided"
                split
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">split = false</h3>
              <List
                dataSource={basicData.slice(0, 3)}
                bordered="divided"
                split={false}
              />
            </div>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 带头像的列表 */}
      <section className="mb-12" id="avatar">
        <h2 className="text-2xl font-bold mb-4">带头像的列表</h2>
        <p className="text-gray-600 mb-6">列表项可以包含头像。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={userData} />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 带额外内容 */}
      <section className="mb-12" id="extra">
        <h2 className="text-2xl font-bold mb-4">带额外内容</h2>
        <p className="text-gray-600 mb-6">
          通过数据项的 extra 在右侧添加操作区。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={extraData} />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义渲染 */}
      <section className="mb-12" id="renderItem">
        <h2 className="text-2xl font-bold mb-4">自定义列表项渲染</h2>
        <p className="text-gray-600 mb-6">
          通过 renderItem 自定义每一项的布局。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List
            dataSource={productData as unknown as DemoItem[]}
            hoverable
            renderItem={(item: any) => (
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    库存：{item.stock}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {item.price}
                  </div>
                  <Button size="sm">购买</Button>
                </div>
              </div>
            )}
          />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 头部和底部 */}
      <section className="mb-12" id="headerFooter">
        <h2 className="text-2xl font-bold mb-4">头部和底部</h2>
        <p className="text-gray-600 mb-6">列表可以添加头部和底部内容。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List
            dataSource={basicData}
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">用户列表</h3>
                <Button size="sm">添加</Button>
              </div>
            }
            footer={
              <p className="text-sm text-gray-500">
                共 {basicData.length} 条记录
              </p>
            }
          />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 分页列表 */}
      <section className="mb-12" id="pagination">
        <h2 className="text-2xl font-bold mb-4">分页列表</h2>
        <p className="text-gray-600 mb-6">当数据较多时，可以使用分页功能。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List
            dataSource={largeData}
            pagination={{
              current: 1,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: true,
            }}
            onPageChange={(page) => {
              setPageInfo(page);
              console.log('分页变化:', page);
            }}
          />
          <div className="mt-3 text-sm text-gray-600">
            当前：第 {pageInfo.current} 页，{pageInfo.pageSize} / 页
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 网格布局 */}
      <section className="mb-12" id="grid">
        <h2 className="text-2xl font-bold mb-4">网格布局</h2>
        <p className="text-gray-600 mb-6">
          列表项可以以网格形式展示，支持响应式布局。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List
            dataSource={gridData}
            grid={{
              gutter: 16,
              column: 3,
              xs: 1,
              sm: 2,
              md: 3,
            }}
            bordered="none"
            renderItem={(item: any) => (
              <Card variant="shadow">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.content}</p>
              </Card>
            )}
          />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 加载状态 */}
      <section className="mb-12" id="loading">
        <h2 className="text-2xl font-bold mb-4">加载状态</h2>
        <p className="text-gray-600 mb-6">列表支持加载状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={16} className="w-full">
            <Button onClick={simulateLoading}>
              {loading ? '加载中...' : '模拟加载'}
            </Button>
            <List dataSource={basicData} loading={loading} />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 空状态 */}
      <section className="mb-12" id="empty">
        <h2 className="text-2xl font-bold mb-4">空状态</h2>
        <p className="text-gray-600 mb-6">当列表没有数据时显示空状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List dataSource={[]} emptyText="暂无数据" />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 可点击列表 */}
      <section className="mb-12" id="clickable">
        <h2 className="text-2xl font-bold mb-4">可点击列表</h2>
        <p className="text-gray-600 mb-6">列表项可以添加点击事件和悬停效果。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <List
            dataSource={basicData}
            hoverable
            onItemClick={handleItemClick}
          />
        </div>
        <Divider className="my-6" />
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
