import React, { useState } from 'react'
import { Link, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const variantSnippet = `<Space>
  <Link href="#" variant="primary">Primary</Link>
  <Link href="#" variant="secondary">Secondary</Link>
  <Link href="#" variant="default">Default</Link>
</Space>`

const sizeSnippet = `<Space>
  <Link href="#" size="sm">Small</Link>
  <Link href="#" size="md">Medium</Link>
  <Link href="#" size="lg">Large</Link>
</Space>`

const disabledSnippet = `<Space>
  <Link href="#" disabled>Disabled Primary</Link>
  <Link href="#" variant="secondary" disabled>Disabled Secondary</Link>
  <Link href="#" variant="default" disabled>Disabled Default</Link>
</Space>`

const underlineSnippet = `<Space>
  <Link href="#">有下划线（悬停）</Link>
  <Link href="#" underline={false}>无下划线</Link>
</Space>`

const externalSnippet = `<Link href="https://github.com" target="_blank">
  GitHub（自动添加 rel="noopener noreferrer"）
</Link>
<Link href="https://example.com" target="_blank" rel="nofollow">
  自定义 rel
</Link>`

const eventSnippet = `<Link href="#" onClick={handleClick}>点击计数：{count}</Link>`

const LinkDemo: React.FC = () => {
  const [clickCount, setClickCount] = useState(0)

  const handlePreventNavigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Link 链接</h1>
        <p className="text-gray-600">文字超链接。</p>
      </div>

      {/* 链接变体 */}
      <DemoBlock
        title="链接变体"
        description="展示 primary / secondary / default 三种变体。"
        code={variantSnippet}>
        <Space>
          <Link href="#" onClick={handlePreventNavigate} variant="primary">
            Primary
          </Link>
          <Link href="#" onClick={handlePreventNavigate} variant="secondary">
            Secondary
          </Link>
          <Link href="#" onClick={handlePreventNavigate} variant="default">
            Default
          </Link>
        </Space>
      </DemoBlock>

      {/* 链接尺寸 */}
      <DemoBlock title="链接尺寸" description="展示 sm / md / lg 三种尺寸。" code={sizeSnippet}>
        <Space>
          <Link href="#" onClick={handlePreventNavigate} size="sm">
            Small
          </Link>
          <Link href="#" onClick={handlePreventNavigate} size="md">
            Medium
          </Link>
          <Link href="#" onClick={handlePreventNavigate} size="lg">
            Large
          </Link>
        </Space>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock
        title="禁用状态"
        description="禁用后不可点击，移除 href，并从 Tab 顺序移除。"
        code={disabledSnippet}>
        <Space>
          <Link href="#" disabled>
            Disabled Primary
          </Link>
          <Link href="#" variant="secondary" disabled>
            Disabled Secondary
          </Link>
          <Link href="#" variant="default" disabled>
            Disabled Default
          </Link>
        </Space>
      </DemoBlock>

      {/* 下划线 */}
      <DemoBlock
        title="下划线"
        description="underline=true（默认）悬停显示下划线；underline=false 无下划线。"
        code={underlineSnippet}>
        <Space>
          <Link href="#" onClick={handlePreventNavigate}>
            有下划线（悬停）
          </Link>
          <Link href="#" onClick={handlePreventNavigate} underline={false}>
            无下划线
          </Link>
        </Space>
      </DemoBlock>

      {/* 外部链接 */}
      <DemoBlock
        title="外部链接"
        description='target="_blank" 时自动添加 rel="noopener noreferrer"；也可传入自定义 rel。'
        code={externalSnippet}>
        <Space>
          <Link href="https://github.com" target="_blank">
            GitHub（自动添加 rel）
          </Link>
          <Link href="https://example.com" target="_blank" rel="nofollow">
            自定义 rel
          </Link>
        </Space>
      </DemoBlock>

      {/* 点击事件 */}
      <DemoBlock title="点击事件" description="通过 onClick 回调处理交互逻辑。" code={eventSnippet}>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setClickCount((c) => c + 1)
          }}>
          点击计数：{clickCount}
        </Link>
      </DemoBlock>
    </div>
  )
}

export default LinkDemo
