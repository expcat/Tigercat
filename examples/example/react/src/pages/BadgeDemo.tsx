import { useState } from 'react'
import { Badge, Space, Button } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Space>
  <Badge content={5} />
  <Badge content={99} />
  <Badge content="Hot" />
  <Badge content="NEW" />
</Space>`

const variantSnippet = `<Space wrap>
  <Badge variant="default" content={1} />
  <Badge variant="primary" content={2} />
  <Badge variant="success" content={3} />
  <Badge variant="warning" content={4} />
  <Badge variant="danger" content={5} />
  <Badge variant="info" content={6} />
</Space>`

const sizeSnippet = `<Space align="center">
  <Badge size="sm" content={5} />
  <Badge size="md" content={10} />
  <Badge size="lg" content={99} />
</Space>`

const dotSnippet = `<Space wrap>
  <Badge type="dot" variant="default" />
  <Badge type="dot" variant="primary" />
  <Badge type="dot" variant="success" />
  <Badge type="dot" variant="warning" />
  <Badge type="dot" variant="danger" />
  <Badge type="dot" variant="info" />
</Space>`

const textSnippet = `<Space wrap>
  <Badge type="text" content="NEW" variant="danger" />
  <Badge type="text" content="HOT" variant="warning" />
  <Badge type="text" content="VIP" variant="primary" />
  <Badge type="text" content="推荐" variant="success" />
</Space>`

const maxSnippet = `<Space>
  <Badge content={99} />
  <Badge content={100} />
  <Badge content={150} max={99} />
  <Badge content={1000} max={999} />
</Space>`

const wrapSnippet = `<Space>
  <Badge content={5} standalone={false}>
    <Button>通知</Button>
  </Badge>

  <Badge content={99} standalone={false} variant="danger">
    <Button variant="secondary">消息</Button>
  </Badge>

  <Badge type="dot" standalone={false} variant="danger">
    <Button variant="outline">邮件</Button>
  </Badge>
</Space>`

const positionSnippet = `<Space wrap>
  <Badge content={5} standalone={false} position="top-right">
    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">右上</div>
  </Badge>

  <Badge content={5} standalone={false} position="top-left">
    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">左上</div>
  </Badge>

  <Badge content={5} standalone={false} position="bottom-right">
    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">右下</div>
  </Badge>

  <Badge content={5} standalone={false} position="bottom-left">
    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">左下</div>
  </Badge>
</Space>`

const zeroSnippet = `<Space>
  <div>
    <p className="text-sm text-gray-600 mb-2">默认（不显示零）</p>
    <Badge content={0} />
    <span className="text-gray-500 ml-2">（无徽章）</span>
  </div>

  <div>
    <p className="text-sm text-gray-600 mb-2">显示零值</p>
    <Badge content={0} showZero={true} />
  </div>
</Space>`

const usageSnippet = `<div>
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3">通知中心</h3>
    <div className="p-6 bg-gray-50 rounded-lg">
      <Space>
        <Badge content={notificationCount} standalone={false} variant="danger">
          <Button variant="primary" onClick={incrementNotifications}>通知</Button>
        </Badge>

        <Button variant="secondary" onClick={clearNotifications}>清除通知</Button>
      </Space>
    </div>
  </div>

  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3">消息和购物车</h3>
    <div className="p-6 bg-gray-50 rounded-lg">
      <Space>
        <Badge content={messageCount} standalone={false} variant="primary" max={99}>
          <Button variant="primary">消息</Button>
        </Badge>

        <Badge content={cartItems} standalone={false} variant="danger">
          <Button variant="secondary">购物车</Button>
        </Badge>
      </Space>
    </div>
  </div>

  <div>
    <h3 className="text-lg font-semibold mb-3">在线状态指示</h3>
    <div className="p-6 bg-gray-50 rounded-lg">
      <Space wrap>
        <div className="flex items-center gap-3">
          <Badge type="dot" variant="success" standalone={false}>
            <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
              张三
            </div>
          </Badge>
          <span className="text-green-600 font-medium">在线</span>
        </div>

        <div className="flex items-center gap-3">
          <Badge type="dot" variant="default" standalone={false}>
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
              李四
            </div>
          </Badge>
          <span className="text-gray-500">离线</span>
        </div>

        <div className="flex items-center gap-3">
          <Badge type="dot" variant="warning" standalone={false}>
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
              王五
            </div>
          </Badge>
          <span className="text-yellow-600">忙碌</span>
        </div>
      </Space>
    </div>
  </div>
</div>`

export default function BadgeDemo() {
  const [notificationCount, setNotificationCount] = useState(5)
  const [messageCount] = useState(99)
  const [cartItems] = useState(3)

  const incrementNotifications = () => {
    setNotificationCount((prev) => prev + 1)
  }

  const clearNotifications = () => {
    setNotificationCount(0)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Badge 徽章</h1>
        <p className="text-gray-600">
          用于标记和通知的徽章组件，支持点状、数字、文本等多种展示方式。
        </p>
      </div>

      {/* 基本用法 */}
      <DemoBlock title="基本用法" description="独立使用徽章展示数字或文本。" code={basicSnippet}>
        <Space>
          <Badge content={5} />
          <Badge content={99} />
          <Badge content="Hot" />
          <Badge content="NEW" />
        </Space>
      </DemoBlock>

      {/* 徽章类型 */}
      <DemoBlock
        title="徽章类型"
        description="徽章有六种颜色类型：默认、主要、成功、警告、危险和信息。"
        code={variantSnippet}>
        <Space wrap>
          <Badge variant="default" content={1} />
          <Badge variant="primary" content={2} />
          <Badge variant="success" content={3} />
          <Badge variant="warning" content={4} />
          <Badge variant="danger" content={5} />
          <Badge variant="info" content={6} />
        </Space>
      </DemoBlock>

      {/* 徽章大小 */}
      <DemoBlock title="徽章大小" description="徽章有三种尺寸：小、中、大。" code={sizeSnippet}>
        <Space align="center">
          <Badge size="sm" content={5} />
          <Badge size="md" content={10} />
          <Badge size="lg" content={99} />
        </Space>
      </DemoBlock>

      {/* 点状徽章 */}
      <DemoBlock
        title="点状徽章"
        description="用于简单的通知提示，不显示具体数字。"
        code={dotSnippet}>
        <Space wrap>
          <Badge type="dot" variant="default" />
          <Badge type="dot" variant="primary" />
          <Badge type="dot" variant="success" />
          <Badge type="dot" variant="warning" />
          <Badge type="dot" variant="danger" />
          <Badge type="dot" variant="info" />
        </Space>
      </DemoBlock>

      {/* 文本徽章 */}
      <DemoBlock title="文本徽章" description="显示文本内容的徽章。" code={textSnippet}>
        <Space wrap>
          <Badge type="text" content="NEW" variant="danger" />
          <Badge type="text" content="HOT" variant="warning" />
          <Badge type="text" content="VIP" variant="primary" />
          <Badge type="text" content="推荐" variant="success" />
        </Space>
      </DemoBlock>

      {/* 最大值 */}
      <DemoBlock
        title="最大值"
        description="设置 max 属性，当数字超过最大值时显示 {'{max}+'}。"
        code={maxSnippet}>
        <Space>
          <Badge content={99} />
          <Badge content={100} />
          <Badge content={150} max={99} />
          <Badge content={1000} max={999} />
        </Space>
      </DemoBlock>

      {/* 包裹模式 - 按钮 */}
      <DemoBlock
        title="包裹元素"
        description="徽章可以附加到其他元素上，通过设置 standalone 为 false 启用包裹模式。"
        code={wrapSnippet}>
        <Space>
          <Badge content={5} standalone={false}>
            <Button>通知</Button>
          </Badge>

          <Badge content={99} standalone={false} variant="danger">
            <Button variant="secondary">消息</Button>
          </Badge>

          <Badge type="dot" standalone={false} variant="danger">
            <Button variant="outline">邮件</Button>
          </Badge>
        </Space>
      </DemoBlock>

      {/* 徽章位置 */}
      <DemoBlock
        title="徽章位置"
        description="在包裹模式下，可以设置徽章的位置。"
        code={positionSnippet}>
        <Space wrap>
          <Badge content={5} standalone={false} position="top-right">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              右上
            </div>
          </Badge>

          <Badge content={5} standalone={false} position="top-left">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              左上
            </div>
          </Badge>

          <Badge content={5} standalone={false} position="bottom-right">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              右下
            </div>
          </Badge>

          <Badge content={5} standalone={false} position="bottom-left">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              左下
            </div>
          </Badge>
        </Space>
      </DemoBlock>

      {/* 显示零值 */}
      <DemoBlock
        title="显示零值"
        description="默认情况下不显示零值，设置 showZero 可以显示。"
        code={zeroSnippet}>
        <Space>
          <div>
            <p className="text-sm text-gray-600 mb-2">默认（不显示零）</p>
            <Badge content={0} />
            <span className="text-gray-500 ml-2">（无徽章）</span>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">显示零值</p>
            <Badge content={0} showZero={true} />
          </div>
        </Space>
      </DemoBlock>

      {/* 实际应用示例 */}
      <DemoBlock title="实际应用示例" description="模拟真实的使用场景。" code={usageSnippet}>
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">通知中心</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Space>
                <Badge content={notificationCount} standalone={false} variant="danger">
                  <Button variant="primary" onClick={incrementNotifications}>
                    通知
                  </Button>
                </Badge>

                <Button variant="secondary" onClick={clearNotifications}>
                  清除通知
                </Button>
              </Space>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">消息和购物车</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Space>
                <Badge content={messageCount} standalone={false} variant="primary" max={99}>
                  <Button variant="primary">消息</Button>
                </Badge>

                <Badge content={cartItems} standalone={false} variant="danger">
                  <Button variant="secondary">购物车</Button>
                </Badge>
              </Space>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">在线状态指示</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Space wrap>
                <div className="flex items-center gap-3">
                  <Badge type="dot" variant="success" standalone={false}>
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                      张三
                    </div>
                  </Badge>
                  <span className="text-green-600 font-medium">在线</span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge type="dot" variant="default" standalone={false}>
                    <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                      李四
                    </div>
                  </Badge>
                  <span className="text-gray-500">离线</span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge type="dot" variant="warning" standalone={false}>
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                      王五
                    </div>
                  </Badge>
                  <span className="text-yellow-600">忙碌</span>
                </div>
              </Space>
            </div>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}
