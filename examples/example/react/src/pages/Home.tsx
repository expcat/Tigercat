import React from 'react'
import { Code } from '@expcat/tigercat-react/Code'
import { demoChrome } from '@demo-shared/chrome'
import { useLang } from '../context/lang'

const cssSnippet = `@import 'tailwindcss';
@plugin '@expcat/tigercat-core/tailwind';
@source '../node_modules/@expcat/tigercat-react/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';`

const Home: React.FC = () => {
  const { lang } = useLang()
  const chrome = demoChrome(lang)
  const usageSnippet = `import { Button } from '@expcat/tigercat-react/Button'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'

function App() {
  return (
    <ConfigProvider theme="default" colorScheme="light">
      <Button variant="primary">${chrome.homeStart}</Button>
    </ConfigProvider>
  )
}
`

  const themeSnippet = `import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'

<ConfigProvider theme="natural" colorScheme="light">
  <App />
</ConfigProvider>`

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {chrome.homeTitle}（React）
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{chrome.homeLead}</p>
      </div>

      <div className="mb-6">
        <div className="rounded-lg border border-(--tiger-primary,#2563eb)/40 bg-(--tiger-primary,#2563eb)/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">⚛️</span>
            <span className="text-sm font-semibold text-(--tiger-primary,#2563eb)">
              {chrome.homeFramework} · React
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            @expcat/tigercat-react · {chrome.homeFrameworkLead}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {chrome.homeInstall}
          </h2>
          <Code className="mt-3" code="pnpm add @expcat/tigercat-react @expcat/tigercat-core" />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {chrome.homeCss}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{chrome.homeCssLead}</p>
          <Code className="mt-3" code={cssSnippet} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {chrome.homeUsage}
          </h2>
          <Code className="mt-3" code={usageSnippet} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {chrome.homeTheme}
          </h2>
          <Code className="mt-3" code={themeSnippet} />
        </section>
      </div>
    </div>
  )
}

export default Home
