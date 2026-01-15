import { Code, Divider, Space } from '@expcat/tigercat-react'

const installSnippet = 'pnpm add @expcat/tigercat-react'
const usageSnippet = [
  "import { Code } from '@expcat/tigercat-react'",
  '',
  '<Code code="const a = 1" />'
].join('\n')

const themeSnippet = `:root {
  --tiger-primary: #2563eb;
}`

export default function CodeDemo() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code 代码展示</h1>
        <p className="text-gray-600">展示代码片段并支持一键复制。</p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">展示代码内容与默认复制按钮。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Code code={installSnippet} />
        </div>
        <Divider className="my-6" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义按钮文案</h2>
        <p className="text-gray-600 mb-6">通过 copyLabel / copiedLabel 自定义按钮文案。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Code code={usageSnippet} copyLabel="复制代码" copiedLabel="已复制" />
        </div>
        <Divider className="my-6" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用复制</h2>
        <p className="text-gray-600 mb-6">关闭 copyable 不显示复制按钮。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full">
            <Code code={themeSnippet} copyable={false} />
          </Space>
        </div>
      </section>
    </div>
  )
}
