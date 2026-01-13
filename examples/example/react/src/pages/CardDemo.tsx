import { Card, Space, Divider, Button } from '@tigercat/react';

export default function CardDemo() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Card 卡片</h1>
        <p className="text-gray-600">
          用于内容展示的卡片容器组件，支持多种样式和布局选项。
        </p>
      </div>

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">最简单的卡片，包含基本内容。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Card>
            <p>这是一个基础的卡片组件，可以展示任何内容。</p>
          </Card>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 卡片变体 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">卡片变体</h2>
        <p className="text-gray-600 mb-6">
          卡片有四种样式：默认、带边框、带阴影和浮起。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="default">
              <h3 className="font-semibold mb-2">默认卡片</h3>
              <p className="text-gray-600">带细边框的基础卡片样式。</p>
            </Card>
            <Card variant="bordered">
              <h3 className="font-semibold mb-2">带边框卡片</h3>
              <p className="text-gray-600">带粗边框的卡片样式。</p>
            </Card>
            <Card variant="shadow">
              <h3 className="font-semibold mb-2">带阴影卡片</h3>
              <p className="text-gray-600">带阴影效果的卡片样式。</p>
            </Card>
            <Card variant="elevated">
              <h3 className="font-semibold mb-2">浮起卡片</h3>
              <p className="text-gray-600">带大阴影的浮起卡片样式。</p>
            </Card>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 卡片尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">卡片尺寸</h2>
        <p className="text-gray-600 mb-6">卡片有三种尺寸，主要影响内边距。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={16} className="w-full">
            <Card size="sm">
              <h3 className="font-semibold mb-2">小尺寸卡片</h3>
              <p className="text-gray-600">内边距较小，适合紧凑布局。</p>
            </Card>
            <Card size="md">
              <h3 className="font-semibold mb-2">中等尺寸卡片</h3>
              <p className="text-gray-600">默认尺寸，适合大多数场景。</p>
            </Card>
            <Card size="lg">
              <h3 className="font-semibold mb-2">大尺寸卡片</h3>
              <p className="text-gray-600">内边距较大，适合重要内容展示。</p>
            </Card>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 可悬停卡片 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">可悬停卡片</h2>
        <p className="text-gray-600 mb-6">鼠标悬停时显示交互效果。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card hoverable variant="shadow">
              <h3 className="font-semibold mb-2">功能卡片 1</h3>
              <p className="text-gray-600">悬停查看效果</p>
            </Card>
            <Card hoverable variant="shadow">
              <h3 className="font-semibold mb-2">功能卡片 2</h3>
              <p className="text-gray-600">悬停查看效果</p>
            </Card>
            <Card hoverable variant="shadow">
              <h3 className="font-semibold mb-2">功能卡片 3</h3>
              <p className="text-gray-600">悬停查看效果</p>
            </Card>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 带封面图片 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">带封面图片</h2>
        <p className="text-gray-600 mb-6">卡片可以包含封面图片。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              cover="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop"
              coverAlt="代码编辑器">
              <h3 className="font-semibold mb-2">开发工具</h3>
              <p className="text-gray-600">现代化的开发环境</p>
            </Card>
            <Card
              cover="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop"
              coverAlt="笔记本电脑">
              <h3 className="font-semibold mb-2">移动办公</h3>
              <p className="text-gray-600">随时随地高效工作</p>
            </Card>
            <Card
              cover="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
              coverAlt="数据分析">
              <h3 className="font-semibold mb-2">数据分析</h3>
              <p className="text-gray-600">洞察数据价值</p>
            </Card>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 卡片结构 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">卡片结构</h2>
        <p className="text-gray-600 mb-6">
          卡片支持头部、主体、底部和操作区域。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              header={<h3 className="text-lg font-semibold">卡片标题</h3>}
              footer={
                <p className="text-sm text-gray-500">创建于 2024-01-01</p>
              }>
              <p className="text-gray-600">
                这是卡片的主体内容区域，可以放置任何内容。
              </p>
            </Card>

            <Card
              header={<h3 className="text-lg font-semibold">操作卡片</h3>}
              actions={
                <>
                  <Button variant="ghost" size="sm">
                    取消
                  </Button>
                  <Button variant="primary" size="sm">
                    确认
                  </Button>
                </>
              }>
              <p className="text-gray-600">这个卡片包含操作按钮。</p>
            </Card>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 完整示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">完整示例</h2>
        <p className="text-gray-600 mb-6">结合所有功能的完整卡片示例。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              variant="shadow"
              hoverable
              cover="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop"
              coverAlt="科技产品"
              header={<h3 className="text-lg font-semibold">智能设备</h3>}
              footer={
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">
                    ¥299
                  </span>
                  <span className="text-sm text-gray-500">已售 1.2k</span>
                </div>
              }
              actions={
                <>
                  <Button variant="ghost" size="sm">
                    收藏
                  </Button>
                  <Button variant="primary" size="sm">
                    购买
                  </Button>
                </>
              }>
              <p className="text-gray-600 mb-4">
                最新的智能科技产品，为您的生活带来便利。
              </p>
            </Card>

            <Card
              variant="shadow"
              hoverable
              cover="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop"
              coverAlt="科技背景"
              header={<h3 className="text-lg font-semibold">创新方案</h3>}
              footer={
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">
                    ¥999
                  </span>
                  <span className="text-sm text-gray-500">已售 856</span>
                </div>
              }
              actions={
                <>
                  <Button variant="ghost" size="sm">
                    收藏
                  </Button>
                  <Button variant="primary" size="sm">
                    购买
                  </Button>
                </>
              }>
              <p className="text-gray-600 mb-4">
                为企业提供全方位的数字化转型解决方案。
              </p>
            </Card>

            <Card
              variant="shadow"
              hoverable
              cover="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop"
              coverAlt="专业服务"
              header={<h3 className="text-lg font-semibold">专业服务</h3>}
              footer={
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">
                    ¥1999
                  </span>
                  <span className="text-sm text-gray-500">已售 562</span>
                </div>
              }
              actions={
                <>
                  <Button variant="ghost" size="sm">
                    收藏
                  </Button>
                  <Button variant="primary" size="sm">
                    购买
                  </Button>
                </>
              }>
              <p className="text-gray-600 mb-4">
                专业团队为您提供一对一的咨询和技术支持。
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
