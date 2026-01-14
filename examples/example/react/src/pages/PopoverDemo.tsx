import { useState } from 'react';
import { Popover, Button, Space, Divider, List } from '@tigercat/react';

export default function PopoverDemo() {
  const [visible1, setVisible1] = useState(false);
  const [manualVisible, setManualVisible] = useState(false);

  const customContentItems = ['列表项 1', '列表项 2', '列表项 3'];

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Popover 气泡卡片</h1>
        <p className="text-gray-600">用于显示复杂的自定义内容。</p>
      </div>

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">
          最简单的用法，点击按钮显示气泡卡片。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popover content="这是一个气泡卡片的内容">
            <Button>触发气泡卡片</Button>
          </Popover>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 带标题 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">带标题</h2>
        <p className="text-gray-600 mb-6">可以通过 title 属性设置标题。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popover title="气泡卡片标题" content="这是一个带标题的气泡卡片内容">
            <Button>带标题的气泡卡片</Button>
          </Popover>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义内容 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义内容</h2>
        <p className="text-gray-600 mb-6">可以通过 props 自定义内容。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popover
            titleContent={<span style={{ color: '#2563eb' }}>自定义标题</span>}
            contentContent={
              <div>
                <p className="mb-2">这是自定义的内容</p>
                <List
                  className="text-sm"
                  bordered="none"
                  split={false}
                  size="sm"
                  dataSource={customContentItems.map((title, index) => ({
                    key: index,
                    title,
                  }))}
                  renderItem={(item) => (
                    <div className="flex items-start gap-2">
                      <span aria-hidden>•</span>
                      <span>{item.title}</span>
                    </div>
                  )}
                />
              </div>
            }>
            <Button>自定义内容</Button>
          </Popover>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同位置 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同位置</h2>
        <p className="text-gray-600 mb-6">通过 placement 属性设置弹出位置。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <Popover title="提示" content="上方弹出" placement="top">
              <Button>上方</Button>
            </Popover>

            <Popover title="提示" content="下方弹出" placement="bottom">
              <Button>下方</Button>
            </Popover>

            <Popover title="提示" content="左侧弹出" placement="left">
              <Button>左侧</Button>
            </Popover>

            <Popover title="提示" content="右侧弹出" placement="right">
              <Button>右侧</Button>
            </Popover>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 触发方式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">触发方式</h2>
        <p className="text-gray-600 mb-6">
          支持 click、hover、focus、manual 四种触发方式。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Popover title="点击触发" content="点击按钮触发" trigger="click">
              <Button>点击触发</Button>
            </Popover>

            <Popover
              title="悬停触发"
              content="悬停触发气泡卡片"
              trigger="hover">
              <Button>悬停触发</Button>
            </Popover>

            <Popover
              title="聚焦触发"
              content="聚焦触发气泡卡片"
              trigger="focus">
              <Button>聚焦触发</Button>
            </Popover>

            <Popover
              visible={manualVisible}
              onVisibleChange={setManualVisible}
              title="手动触发"
              content="手动控制显示隐藏"
              trigger="manual">
              <Button onClick={() => setManualVisible(!manualVisible)}>
                手动触发
              </Button>
            </Popover>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 受控模式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">受控模式</h2>
        <p className="text-gray-600 mb-6">
          通过 visible 和 onVisibleChange 控制气泡卡片的显示状态。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Popover
              visible={visible1}
              onVisibleChange={setVisible1}
              title="受控气泡卡片"
              content="通过外部状态控制显示">
              <Button>受控气泡卡片</Button>
            </Popover>

            <Button onClick={() => setVisible1(!visible1)}>
              {visible1 ? '隐藏' : '显示'}
            </Button>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义宽度 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义宽度</h2>
        <p className="text-gray-600 mb-6">
          通过 width 属性自定义气泡卡片的宽度。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Popover
              title="自定义宽度"
              content="这是一个宽度为 300px 的气泡卡片"
              width="300">
              <Button>宽度 300px</Button>
            </Popover>

            <Popover
              title="自定义宽度"
              content="这是一个宽度为 400px 的气泡卡片"
              width="400">
              <Button>宽度 400px</Button>
            </Popover>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">禁用状态下无法触发气泡卡片。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popover title="禁用状态" content="这个气泡卡片已被禁用" disabled>
            <Button disabled>禁用的气泡卡片</Button>
          </Popover>
        </div>
      </section>
    </div>
  );
}
