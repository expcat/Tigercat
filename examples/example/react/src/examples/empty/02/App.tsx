import { Empty } from '@expcat/tigercat-react/Empty'

const presets = ['default', 'simple', 'no-data', 'no-results', 'error'] as const

export default function App() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {presets.map((preset) => (
        <div key={preset} className="rounded border border-gray-200 p-4 dark:border-gray-700">
          <Empty preset={preset} />
          <p className="mt-2 text-center text-xs text-gray-400">preset=&quot;{preset}&quot;</p>
        </div>
      ))}
    </div>
  )
}
