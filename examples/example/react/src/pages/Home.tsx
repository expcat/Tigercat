import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_NAV_GROUPS } from '@demo-shared/app-config'
import { useLang } from '../context/lang'

const Home: React.FC = () => {
  const quickLinks = useMemo(() => {
    const flat = DEMO_NAV_GROUPS.flatMap((g) => g.items)
    return flat.slice(0, 8)
  }, [])

  const { lang } = useLang()

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tigercat React 示例</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          使用上方 Header 切换语言/主题色；用左侧菜单按功能浏览组件示例。
        </p>
      </div>

      <div className="p-4 rounded-lg border border-[var(--tiger-primary-disabled,#93c5fd)] bg-[var(--tiger-outline-bg-hover,rgba(37,99,235,0.1))] text-gray-900 dark:text-gray-100">
        <div className="text-sm">
          主题色会通过 CSS 变量（如 <span className="font-mono">--tiger-primary</span>
          ）即时作用于所有组件。
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">快速入口</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 hover:border-[var(--tiger-primary,#2563eb)] hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900">
              {item.label[lang]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
