import { useLocation } from 'react-router-dom'
import type { DemoModuleDescriptor } from '@demo-shared/playground/types'
import { findDemoNavItem } from '@demo-shared/app-config'
import { useLang } from '../context/lang'
import DemoBlock from './DemoBlock'

interface DemoPageProps {
  title: string
  description?: string
  modules: DemoModuleDescriptor[]
}

export default function DemoPage({ title, description, modules }: DemoPageProps) {
  const location = useLocation()
  const { lang } = useLang()
  const routeKey = location.pathname.replace(/^\//, '')
  const nav = findDemoNavItem(routeKey)
  const heading = nav?.label[lang] ?? title
  const lead = lang === 'zh-CN' ? description : undefined

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">{heading}</h1>
        {lead ? <p className="text-gray-600 dark:text-gray-400">{lead}</p> : null}
      </div>
      {modules.map((module) => (
        <DemoBlock key={module.meta.id} module={module} />
      ))}
    </div>
  )
}
