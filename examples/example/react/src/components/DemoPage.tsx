import type { DemoModuleDescriptor } from '@demo-shared/playground/types'
import DemoBlock from './DemoBlock'

interface DemoPageProps {
  title: string
  description?: string
  modules: DemoModuleDescriptor[]
}

export default function DemoPage({ title, description, modules }: DemoPageProps) {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">{title}</h1>
        {description ? <p className="text-gray-600 dark:text-gray-400">{description}</p> : null}
      </div>
      {modules.map((module) => (
        <DemoBlock key={module.meta.id} module={module} />
      ))}
    </div>
  )
}
