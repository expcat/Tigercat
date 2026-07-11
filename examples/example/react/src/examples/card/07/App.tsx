import { useState } from 'react'
import { Card } from '@expcat/tigercat-react/Card'
import { Space } from '@expcat/tigercat-react/Space'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未执行卡片操作')

  const recordAction = (action: string, target: string) => setLastAction(`${action}：${target}`)

  return (
    <>
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
                <span className="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">¥299</span>
                <span className="text-sm text-gray-500">已售 1.2k</span>
              </div>
            }
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => recordAction('收藏', '基础套餐')}>
                  收藏
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => recordAction('购买', '基础套餐')}>
                  购买
                </Button>
              </>
            }>
            <p className="text-gray-600 mb-4">最新的智能科技产品，为您的生活带来便利。</p>
          </Card>

          <Card
            variant="shadow"
            hoverable
            cover="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop"
            coverAlt="科技背景"
            header={<h3 className="text-lg font-semibold">创新方案</h3>}
            footer={
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">¥999</span>
                <span className="text-sm text-gray-500">已售 856</span>
              </div>
            }
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => recordAction('收藏', '创新方案')}>
                  收藏
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => recordAction('购买', '创新方案')}>
                  购买
                </Button>
              </>
            }>
            <p className="text-gray-600 mb-4">为企业提供全方位的数字化转型解决方案。</p>
          </Card>

          <Card
            variant="shadow"
            hoverable
            cover="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop"
            coverAlt="专业服务"
            header={<h3 className="text-lg font-semibold">专业服务</h3>}
            footer={
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">¥1999</span>
                <span className="text-sm text-gray-500">已售 562</span>
              </div>
            }
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => recordAction('收藏', '专业服务')}>
                  收藏
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => recordAction('购买', '专业服务')}>
                  购买
                </Button>
              </>
            }>
            <p className="text-gray-600 mb-4">专业团队为您提供一对一的咨询和技术支持。</p>
          </Card>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300" role="status">
          操作反馈：{lastAction}
        </p>
      </div>
    </>
  )
}
