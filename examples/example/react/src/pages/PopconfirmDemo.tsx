import { useState } from 'react'
import { Popconfirm, Button, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Popconfirm title="确定要删除这条记录吗？">
  <Button variant="secondary">删除</Button>
</Popconfirm>`

const placementSnippet = `<Popconfirm placement="top" title="确定要删除吗？">...</Popconfirm>
<Popconfirm placement="bottom" title="确定要删除吗？">...</Popconfirm>
<Popconfirm placement="left" title="确定要删除吗？">...</Popconfirm>
<Popconfirm placement="right" title="确定要删除吗？">...</Popconfirm>`

const iconSnippet = `<Popconfirm icon="warning" title="这是警告信息">...</Popconfirm>
<Popconfirm icon="info" title="这是提示信息">...</Popconfirm>
<Popconfirm icon="error" title="这是错误信息">...</Popconfirm>
<Popconfirm icon="success" title="操作成功">...</Popconfirm>
<Popconfirm icon="question" title="确定继续吗？">...</Popconfirm>`

const textSnippet = `<Popconfirm okText="提交" cancelText="取消" title="确定要提交这个表单吗？">...</Popconfirm>`

const dangerSnippet = `<Popconfirm okType="danger" icon="error" title="确定要删除这个用户吗？">...</Popconfirm>`

const descriptionSnippet = `<Popconfirm title="确定要发布这篇文章吗？" description="发布后，文章将对所有用户可见。">...</Popconfirm>`

const controlledSnippet = `<Popconfirm visible={visible1} onVisibleChange={setVisible1} title="确定要执行此操作吗？">...</Popconfirm>`

const noIconSnippet = `<Popconfirm showIcon={false} title="确定要继续吗？">...</Popconfirm>`

export default function PopconfirmDemo() {
  const [visible1, setVisible1] = useState(false)

  const handleConfirm = () => {
    console.log('Confirmed!')
  }

  const handleCancel = () => {
    console.log('Cancelled!')
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Popconfirm 弹出确认</h1>
        <p className="text-gray-600">用于在执行敏感操作时向用户确认。</p>
      </div>

      <DemoBlock
        title="基本用法"
        description="最简单的用法，点击按钮打开确认框。"
        code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={handleConfirm}
            onCancel={handleCancel}>
            <Button variant="secondary">删除</Button>
          </Popconfirm>
        </div>
      </DemoBlock>

      <DemoBlock
        title="不同位置"
        description="通过 placement 属性设置弹出位置。"
        code={placementSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <Popconfirm title="确定要删除吗？" placement="top">
              <Button>上方</Button>
            </Popconfirm>

            <Popconfirm title="确定要删除吗？" placement="bottom">
              <Button>下方</Button>
            </Popconfirm>

            <Popconfirm title="确定要删除吗？" placement="left">
              <Button>左侧</Button>
            </Popconfirm>

            <Popconfirm title="确定要删除吗？" placement="right">
              <Button>右侧</Button>
            </Popconfirm>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="不同图标类型"
        description="支持 warning、info、error、success、question 五种图标类型。"
        code={iconSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Popconfirm title="这是警告信息" icon="warning">
              <Button>警告</Button>
            </Popconfirm>

            <Popconfirm title="这是提示信息" icon="info">
              <Button>信息</Button>
            </Popconfirm>

            <Popconfirm title="这是错误信息" icon="error">
              <Button variant="secondary">错误</Button>
            </Popconfirm>

            <Popconfirm title="操作成功" icon="success">
              <Button>成功</Button>
            </Popconfirm>

            <Popconfirm title="确定继续吗？" icon="question">
              <Button>疑问</Button>
            </Popconfirm>
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义按钮文字"
        description="通过 okText 和 cancelText 属性自定义按钮文字。"
        code={textSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要提交这个表单吗？"
            okText="提交"
            cancelText="取消"
            onConfirm={() => console.log('Form submitted')}>
            <Button>提交表单</Button>
          </Popconfirm>
        </div>
      </DemoBlock>

      <DemoBlock
        title="危险操作"
        description={'通过 okType="danger" 将确认按钮设置为危险样式。'}
        code={dangerSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="此操作不可撤销，用户的所有数据将被永久删除。"
            icon="error"
            okType="danger"
            okText="删除"
            onConfirm={() => console.log('User deleted')}>
            <Button variant="secondary">删除用户</Button>
          </Popconfirm>
        </div>
      </DemoBlock>

      <DemoBlock
        title="带描述信息"
        description="通过 description 属性添加详细描述。"
        code={descriptionSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要发布这篇文章吗？"
            description="发布后，文章将对所有用户可见。"
            onConfirm={() => console.log('Article published')}>
            <Button>发布文章</Button>
          </Popconfirm>
        </div>
      </DemoBlock>

      <DemoBlock
        title="受控模式"
        description="通过 visible 和 onVisibleChange 控制 Popconfirm 的显示状态。"
        code={controlledSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Popconfirm
              visible={visible1}
              onVisibleChange={setVisible1}
              title="确定要执行此操作吗？"
              onConfirm={() => {
                handleConfirm()
                setVisible1(false)
              }}
              onCancel={() => {
                handleCancel()
                setVisible1(false)
              }}>
              <Button>受控弹窗</Button>
            </Popconfirm>

            <Button onClick={() => setVisible1(true)}>外部控制打开</Button>
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock
        title="隐藏图标"
        description="通过 showIcon 属性控制图标显示。"
        code={noIconSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要继续吗？"
            showIcon={false}
            onConfirm={() => console.log('Confirmed')}>
            <Button>无图标</Button>
          </Popconfirm>
        </div>
      </DemoBlock>
    </div>
  )
}
