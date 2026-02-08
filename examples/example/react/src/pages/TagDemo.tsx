import React, { useState } from 'react'
import { Tag, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Space>
  <Tag>Default Tag</Tag>
  <Tag>标签二</Tag>
  <Tag>Tag Three</Tag>
</Space>`

const variantSnippet = `<Space wrap>
  <Tag variant="default">默认标签</Tag>
  <Tag variant="primary">主要标签</Tag>
  <Tag variant="success">成功标签</Tag>
  <Tag variant="warning">警告标签</Tag>
  <Tag variant="danger">危险标签</Tag>
  <Tag variant="info">信息标签</Tag>
</Space>`

const sizeSnippet = `<Space align="center">
  <Tag size="sm" variant="primary">小标签</Tag>
  <Tag size="md" variant="primary">中标签</Tag>
  <Tag size="lg" variant="primary">大标签</Tag>
</Space>`

const closableSnippet = `<Space wrap>
  {tags.map((tag, index) => (
    <Tag key={tag} variant="primary" closable onClose={() => handleClose(index)}>
      {tag}
    </Tag>
  ))}
  {tags.length === 0 && <p className="text-gray-500">所有标签已被移除</p>}
</Space>`

const closeAriaSnippet = `<Space wrap>
  <Tag variant="info" closable closeAriaLabel="移除标签：JavaScript">JavaScript</Tag>
  <Tag variant="success" closable closeAriaLabel="移除标签：已完成">已完成</Tag>
</Space>`

const preventCloseSnippet = `<Tag closable onClose={(e) => e.preventDefault()}>点击关闭按钮不会消失</Tag>`

const closableVariantSnippet = `<Space wrap>
  <Tag variant="default" closable>默认标签</Tag>
  <Tag variant="primary" closable>主要标签</Tag>
  <Tag variant="success" closable>成功标签</Tag>
  <Tag variant="warning" closable>警告标签</Tag>
  <Tag variant="danger" closable>危险标签</Tag>
  <Tag variant="info" closable>信息标签</Tag>
</Space>`

const closableSizeSnippet = `<Space align="center" wrap>
  <Tag size="sm" variant="success" closable>小标签</Tag>
  <Tag size="md" variant="success" closable>中标签</Tag>
  <Tag size="lg" variant="success" closable>大标签</Tag>
</Space>`

const usageSnippet = `<Space direction="vertical" className="w-full">
  <div>
    <h3 className="text-sm font-semibold mb-2 text-gray-700">状态标签</h3>
    <Space>
      <Tag variant="success">已完成</Tag>
      <Tag variant="warning">进行中</Tag>
      <Tag variant="danger">已取消</Tag>
      <Tag variant="info">待审核</Tag>
    </Space>
  </div>
  <div>
    <h3 className="text-sm font-semibold mb-2 text-gray-700">分类标签</h3>
    <Space wrap>
      <Tag variant="primary">前端开发</Tag>
      <Tag variant="primary">后端开发</Tag>
      <Tag variant="primary">UI设计</Tag>
      <Tag variant="primary">产品经理</Tag>
    </Space>
  </div>
  <div>
    <h3 className="text-sm font-semibold mb-2 text-gray-700">可移除的兴趣标签</h3>
    <Space wrap>
      <Tag variant="info" closable>JavaScript</Tag>
      <Tag variant="info" closable>TypeScript</Tag>
      <Tag variant="info" closable>React</Tag>
      <Tag variant="info" closable>Vue</Tag>
      <Tag variant="info" closable>Node.js</Tag>
    </Space>
  </div>
</Space>`

const TagDemo: React.FC = () => {
  const [tags, setTags] = useState(['标签一', '标签二', '标签三'])

  const handleClose = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tag 标签</h1>
        <p className="text-gray-600">用于标记和分类的小型标签组件。</p>
      </div>

      {/* 基本用法 */}
      <DemoBlock title="基本用法" description="基础的标签展示。" code={basicSnippet}>
        <Space>
          <Tag>Default Tag</Tag>
          <Tag>标签二</Tag>
          <Tag>Tag Three</Tag>
        </Space>
      </DemoBlock>

      {/* 标签类型 */}
      <DemoBlock
        title="标签类型"
        description="标签有六种类型：默认、主要、成功、警告、危险和信息。"
        code={variantSnippet}>
        <Space wrap>
          <Tag variant="default">默认标签</Tag>
          <Tag variant="primary">主要标签</Tag>
          <Tag variant="success">成功标签</Tag>
          <Tag variant="warning">警告标签</Tag>
          <Tag variant="danger">危险标签</Tag>
          <Tag variant="info">信息标签</Tag>
        </Space>
      </DemoBlock>

      {/* 标签大小 */}
      <DemoBlock title="标签大小" description="标签有三种尺寸：小、中、大。" code={sizeSnippet}>
        <Space align="center">
          <Tag size="sm" variant="primary">
            小标签
          </Tag>
          <Tag size="md" variant="primary">
            中标签
          </Tag>
          <Tag size="lg" variant="primary">
            大标签
          </Tag>
        </Space>
      </DemoBlock>

      {/* 可关闭标签 */}
      <DemoBlock
        title="可关闭标签"
        description="设置 closable 属性可以定义一个标签是否可移除。"
        code={closableSnippet}>
        <Space wrap>
          {tags.map((tag, index) => (
            <Tag key={tag} variant="primary" closable onClose={() => handleClose(index)}>
              {tag}
            </Tag>
          ))}
          {tags.length === 0 && <p className="text-gray-500">所有标签已被移除</p>}
        </Space>
      </DemoBlock>

      {/* 关闭按钮无障碍标签 */}
      <DemoBlock
        title="关闭按钮无障碍标签"
        description="使用 closeAriaLabel 自定义关闭按钮的 aria-label（便于无障碍与多语言）。"
        code={closeAriaSnippet}>
        <Space wrap>
          <Tag variant="info" closable closeAriaLabel="移除标签：JavaScript">
            JavaScript
          </Tag>
          <Tag variant="success" closable closeAriaLabel="移除标签：已完成">
            已完成
          </Tag>
        </Space>
      </DemoBlock>

      {/* 阻止关闭 */}
      <DemoBlock
        title="阻止关闭"
        description="通过 preventDefault() 阻止标签自动关闭，适用于二次确认等场景。"
        code={preventCloseSnippet}>
        <Tag closable onClose={(e) => e.preventDefault()}>
          点击关闭按钮不会消失
        </Tag>
      </DemoBlock>

      {/* 不同类型的可关闭标签 */}
      <DemoBlock
        title="不同类型的可关闭标签"
        description="展示不同变体的可关闭标签。"
        code={closableVariantSnippet}>
        <Space wrap>
          <Tag variant="default" closable>
            默认标签
          </Tag>
          <Tag variant="primary" closable>
            主要标签
          </Tag>
          <Tag variant="success" closable>
            成功标签
          </Tag>
          <Tag variant="warning" closable>
            警告标签
          </Tag>
          <Tag variant="danger" closable>
            危险标签
          </Tag>
          <Tag variant="info" closable>
            信息标签
          </Tag>
        </Space>
      </DemoBlock>

      {/* 不同大小的可关闭标签 */}
      <DemoBlock
        title="不同大小的可关闭标签"
        description="不同尺寸的可关闭标签组合。"
        code={closableSizeSnippet}>
        <Space align="center" wrap>
          <Tag size="sm" variant="success" closable>
            小标签
          </Tag>
          <Tag size="md" variant="success" closable>
            中标签
          </Tag>
          <Tag size="lg" variant="success" closable>
            大标签
          </Tag>
        </Space>
      </DemoBlock>

      {/* 实际应用场景 */}
      <DemoBlock
        title="应用场景"
        description="标签在实际应用中的常见使用场景。"
        code={usageSnippet}>
        <Space direction="vertical" className="w-full">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">状态标签</h3>
            <Space>
              <Tag variant="success">已完成</Tag>
              <Tag variant="warning">进行中</Tag>
              <Tag variant="danger">已取消</Tag>
              <Tag variant="info">待审核</Tag>
            </Space>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">分类标签</h3>
            <Space wrap>
              <Tag variant="primary">前端开发</Tag>
              <Tag variant="primary">后端开发</Tag>
              <Tag variant="primary">UI设计</Tag>
              <Tag variant="primary">产品经理</Tag>
            </Space>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">可移除的兴趣标签</h3>
            <Space wrap>
              <Tag variant="info" closable>
                JavaScript
              </Tag>
              <Tag variant="info" closable>
                TypeScript
              </Tag>
              <Tag variant="info" closable>
                React
              </Tag>
              <Tag variant="info" closable>
                Vue
              </Tag>
              <Tag variant="info" closable>
                Node.js
              </Tag>
            </Space>
          </div>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default TagDemo
