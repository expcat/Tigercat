import { useState } from 'react'
import { Code } from '@expcat/tigercat-react/Code'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './CodeDemo.tsx?raw'

const installSnippet = 'pnpm add @expcat/tigercat-react'
const usageSnippet = [
  "import { Code } from '@expcat/tigercat-react/Code'",
  '',
  '<Code code="const a = 1" />'
].join('\n')

const themeSnippet = `:root {
  --tiger-primary: #2563eb;
}`

const basicDemoSnippet = '<Code code="pnpm add @expcat/tigercat-react" />'
const customLabelSnippet =
  '<Code code={fullPageSnippet} copyLabel="复制代码" copiedLabel="已复制" />'
const disabledSnippet = '<Code code={fullPageSnippet} copyable={false} />'
const eventSnippet = '<Code code={fullPageSnippet} onCopy={handleCopy} />'

const eventScriptSnippet = `import { useState } from 'react'

const [lastCopied, setLastCopied] = useState('')
const handleCopy = (text: string) => setLastCopied(text)`

export default function CodeDemo() {
  const [lastCopied, setLastCopied] = useState('')

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code 代码展示</h1>
        <p className="text-gray-600 dark:text-gray-400">展示代码片段并支持一键复制。</p>
      </div>

      <DemoBlock title="基础用法" description="展示代码内容与默认复制按钮。" code={fullPageSnippet}>
        <Code code={fullPageSnippet} />
      </DemoBlock>

      <DemoBlock
        title="自定义按钮文案"
        description="通过 copyLabel / copiedLabel 自定义按钮文案。"
        code={fullPageSnippet}>
        <Code code={fullPageSnippet} copyLabel="复制代码" copiedLabel="已复制" />
      </DemoBlock>

      <DemoBlock
        title="禁用复制"
        description="关闭 copyable 不显示复制按钮。"
        code={fullPageSnippet}>
        <Code code={fullPageSnippet} copyable={false} />
      </DemoBlock>

      <DemoBlock
        title="复制事件回调"
        description="通过 onCopy 监听复制事件，获取被复制的代码内容。"
        code={fullPageSnippet}>
        <Code code={fullPageSnippet} onCopy={setLastCopied} />
        {lastCopied && <p className="mt-2 text-sm text-gray-500">上次复制: {lastCopied}</p>}
      </DemoBlock>
    </div>
  )
}
