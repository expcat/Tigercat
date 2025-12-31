import { useState, useEffect } from 'react'
import { Skeleton, Space, Divider, Card, Avatar } from '@tigercat/react'

export default function SkeletonDemo() {
  // Loading state simulation
  const [loading, setLoading] = useState(true)
  const [cardLoading, setCardLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading for basic demo
    const timer1 = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // Simulate data loading for card demo
    const timer2 = setTimeout(() => {
      setCardLoading(false)
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Skeleton 骨架屏</h1>
        <p className="text-gray-600">用于在内容加载时显示占位符的骨架屏组件，提升用户体验。</p>
      </div>

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">最简单的使用方式，默认为文本占位符。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Skeleton />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同变体 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">骨架屏变体</h2>
        <p className="text-gray-600 mb-6">支持文本、头像、图片、按钮和自定义等多种变体。</p>
        <div className="p-6 bg-gray-50 rounded-lg space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">文本 (Text)</h3>
            <Skeleton variant="text" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">头像 (Avatar)</h3>
            <Skeleton variant="avatar" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">图片 (Image)</h3>
            <Skeleton variant="image" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">按钮 (Button)</h3>
            <Skeleton variant="button" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">自定义 (Custom)</h3>
            <Skeleton variant="custom" width="300px" height="150px" />
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 动画效果 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">动画效果</h2>
        <p className="text-gray-600 mb-6">支持脉冲、波浪和无动画三种效果。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={16} className="w-full">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">脉冲 (Pulse) - 默认</h3>
              <Skeleton animation="pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">波浪 (Wave)</h3>
              <Skeleton animation="wave" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">无动画 (None)</h3>
              <Skeleton animation="none" />
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 多行文本 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">多行文本</h2>
        <p className="text-gray-600 mb-6">使用 rows 属性渲染多行文本骨架屏。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={24} className="w-full">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">3 行</h3>
              <Skeleton variant="text" rows={3} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">5 行</h3>
              <Skeleton variant="text" rows={5} />
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 段落模式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">段落模式</h2>
        <p className="text-gray-600 mb-6">启用 paragraph 属性让多行文本具有不同的宽度。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={24} className="w-full">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">段落模式</h3>
              <Skeleton variant="text" rows={4} paragraph />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">普通模式</h3>
              <Skeleton variant="text" rows={4} />
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 头像形状 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">头像形状</h2>
        <p className="text-gray-600 mb-6">头像变体支持圆形和方形两种形状。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <div className="text-center">
              <Skeleton variant="avatar" shape="circle" />
              <p className="text-sm text-gray-600 mt-2">圆形</p>
            </div>
            <div className="text-center">
              <Skeleton variant="avatar" shape="square" />
              <p className="text-sm text-gray-600 mt-2">方形</p>
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义尺寸</h2>
        <p className="text-gray-600 mb-6">通过 width 和 height 属性自定义骨架屏的尺寸。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={16} className="w-full">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">自定义宽度</h3>
              <Skeleton width="200px" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">自定义高度</h3>
              <Skeleton height="50px" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">同时自定义宽高</h3>
              <Skeleton width="300px" height="100px" />
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 组合使用 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">组合使用</h2>
        <p className="text-gray-600 mb-6">组合多个 Skeleton 组件创建复杂的加载状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" size={24} className="w-full">
            {/* 文章预览 */}
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">文章预览</h3>
              <div className="flex items-start gap-4">
                <Skeleton variant="avatar" shape="circle" />
                <div className="flex-1">
                  <Skeleton variant="text" width="150px" className="mb-2" />
                  <Skeleton variant="text" rows={2} paragraph />
                </div>
              </div>
            </div>

            {/* 卡片 */}
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">图片卡片</h3>
              <Skeleton variant="image" className="mb-4" />
              <Skeleton variant="text" rows={2} paragraph className="mb-3" />
              <Skeleton variant="button" />
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 加载状态控制 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">加载状态控制</h2>
        <p className="text-gray-600 mb-6">结合加载状态使用骨架屏（3秒后显示内容）。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="bg-white p-6 rounded-lg">
            {loading ? (
              <>
                <Skeleton variant="text" width="200px" className="mb-4" />
                <Skeleton variant="text" rows={3} paragraph />
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">文章标题</h3>
                <p className="text-gray-700">
                  这是加载完成后显示的内容。骨架屏在内容加载时显示，
                  提供更好的用户体验，避免页面空白或突然跳动。
                </p>
              </>
            )}
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 真实场景示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">真实场景示例</h2>
        <p className="text-gray-600 mb-6">卡片列表加载效果（3.5秒后显示内容）。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cardLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <div className="flex items-start gap-4">
                      <Skeleton variant="avatar" shape="square" />
                      <div className="flex-1">
                        <Skeleton variant="text" width="120px" className="mb-2" />
                        <Skeleton variant="text" rows={2} paragraph />
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <div className="flex items-start gap-4">
                      <Avatar shape="square" text="Item" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Item {i}</h4>
                        <p className="text-sm text-gray-600">
                          This is the content loaded after the skeleton.
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
