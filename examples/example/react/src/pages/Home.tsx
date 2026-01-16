import React from 'react'
import { Code } from '@expcat/tigercat-react'

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
          <Code className="mt-3" code="pnpm add @expcat/tigercat-react @expcat/tigercat-core" />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            2. 配置 Tailwind
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            在 <code>tailwind.config.js</code> 中添加插件与扫描路径：
          </p>
          <Code
            className="mt-3"
            code={`// tailwind.config.js
import { tigercatPlugin } from '@expcat/tigercat-core'

export default {
  content: [
    // ...
    './node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}'
  ],
  plugins: [
    tigercatPlugin
  ]
}`}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            3. 引入样式入口
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            在项目的 CSS 文件中加入以下内容（放在业务样式之前）：
          </p>
          <Code
            className="mt-3"
            code={`@import 'tailwindcss';
@source '../node_modules/@expcat/tigercat-react/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';`}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">4. 组件使用</h2>

          <Code
            className="mt-3"
            code={`import { Button, ConfigProvider } from '@expcat/tigercat-react'

function App() {
  return (
    <ConfigProvider>
      <Button variant="solid">开始使用</Button>
    </ConfigProvider>
  )
}
`}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            5. 主题色（可选）
          </h2>

          <Code
            className="mt-3"
            code={`:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
}`}
          />
        </section>
      </div>
    </div>
  )
}

export default Home
