import { Code } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const installSnippet = 'pnpm add @expcat/tigercat-react'
const usageSnippet = [
  "import { Code } from '@expcat/tigercat-react'",
  '',
  '<Code code="const a = 1" />'
].join('\n')

const themeSnippet = `:root {
  --tiger-primary: #2563eb;
}`

const basicDemoSnippet = '<Code code="pnpm add @expcat/tigercat-react" />'
const customLabelSnippet = '<Code code={usageSnippet} copyLabel="复制代码" copiedLabel="已复制" />'
const disabledSnippet = '<Code code={themeSnippet} copyable={false} />'

export default function CodeDemo() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code 代码展示</h1>
        <p className="text-gray-600">展示代码片段并支持一键复制。</p>
      </div>

      <DemoBlock
        title="基础用法"
        description="展示代码内容与默认复制按钮。"
        code={basicDemoSnippet}>
        <Code code={installSnippet} />
      </DemoBlock>

      <DemoBlock
        title="自定义按钮文案"
        description="通过 copyLabel / copiedLabel 自定义按钮文案。"
        code={customLabelSnippet}>
        <Code code={usageSnippet} copyLabel="复制代码" copiedLabel="已复制" />
      </DemoBlock>

      <DemoBlock
        title="禁用复制"
        description="关闭 copyable 不显示复制按钮。"
        code={disabledSnippet}>
        <Code code={themeSnippet} copyable={false} />
      </DemoBlock>
    </div>
  )
}
