import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { useState } from 'react'
import { Popconfirm } from '@expcat/tigercat-react/Popconfirm'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './PopconfirmDemo.tsx?raw'

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

const controlledSnippet = `<Popconfirm open={visible1} onOpenChange={setVisible1} title="确定要执行此操作吗？">...</Popconfirm>`

const noIconSnippet = `<Popconfirm showIcon={false} title="确定要继续吗？">...</Popconfirm>`

const disabledSnippet = `<Popconfirm title="此操作已禁用" disabled>
  <Button variant="secondary" disabled>禁用按钮</Button>
</Popconfirm>
<Popconfirm title="Popconfirm 已禁用" disabled>
  <Button>按钮未禁用</Button>
</Popconfirm>`

const basicScriptSnippet = `const [visible1, setVisible1] = useState(false)`

export default function PopconfirmDemo() {
  const [visible1, setVisible1] = useState(false)
  const [lastAction, setLastAction] = useState('尚未确认或取消操作')

  const handleConfirm = () => {
    setLastAction('已确认删除记录')
  }

  const handleCancel = () => {
    setLastAction('已取消操作')
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Popconfirm 弹出确认</h1>
        <p className="text-gray-600 dark:text-gray-400">用于在执行敏感操作时向用户确认。</p>
      </div>

      <DemoBlock
        title="基本用法"
        description="最简单的用法，点击按钮打开确认框。"
        code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={handleConfirm}
            onCancel={handleCancel}>
            <Button variant="secondary">删除</Button>
          </Popconfirm>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300" role="status">
            操作反馈：{lastAction}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="不同位置等组合展示"
        description="合并展示不同位置、不同图标类型、自定义按钮文字等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">不同位置</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">不同图标类型</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              自定义按钮文字
            </h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Popconfirm
                title="确定要提交这个表单吗？"
                okText="提交"
                cancelText="取消"
                onConfirm={() => setLastAction('表单已提交')}>
                <Button>提交表单</Button>
              </Popconfirm>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">危险操作</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Popconfirm
                title="确定要删除这个用户吗？"
                description="此操作不可撤销，用户的所有数据将被永久删除。"
                icon="error"
                okType="danger"
                okText="删除"
                onConfirm={() => setLastAction('用户已删除')}>
                <Button variant="secondary">删除用户</Button>
              </Popconfirm>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">带描述信息</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Popconfirm
                title="确定要发布这篇文章吗？"
                description="发布后，文章将对所有用户可见。"
                onConfirm={() => setLastAction('文章已发布')}>
                <Button>发布文章</Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="受控模式"
        description="通过 open 和 onOpenChange 控制 Popconfirm 的显示状态。"
        code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Popconfirm
              open={visible1}
              onOpenChange={setVisible1}
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
        title="隐藏图标与禁用状态"
        description="合并展示隐藏图标、禁用状态，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">隐藏图标</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Popconfirm
                title="确定要继续吗？"
                showIcon={false}
                onConfirm={() => setLastAction('已确认继续')}>
                <Button>无图标</Button>
              </Popconfirm>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Space>
                <Popconfirm title="此操作已禁用" disabled>
                  <Button variant="secondary" disabled>
                    禁用按钮
                  </Button>
                </Popconfirm>

                <Popconfirm title="Popconfirm 已禁用" disabled>
                  <Button>按钮未禁用</Button>
                </Popconfirm>
              </Space>
            </div>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}
