import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          如何在项目中使用 Tigercat（React）
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">按照下面的步骤安装并使用组件库。</p>
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">1. 安装</h2>
          <pre className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100">
            <code>{`pnpm add @expcat/tigercat-react`}</code>
          </pre>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">2. 组件使用</h2>
          <pre className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100">
            <code>{`import { Button, ConfigProvider } from '@expcat/tigercat-react'

function App() {
  return (
    <ConfigProvider>
      <Button variant="solid">开始使用</Button>
    </ConfigProvider>
  )
}
`}</code>
          </pre>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            3. 主题色（可选）
          </h2>
          <pre className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100">
            <code>{`:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
}`}</code>
          </pre>
        </section>
      </div>
    </div>
  )
}

export default Home
