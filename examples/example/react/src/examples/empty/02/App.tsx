import { Empty } from '@expcat/tigercat-react/Empty'

const presets = ['default', 'simple', 'no-data', 'no-results', 'error'] as const

export default function App() {
  return (
    <div className="grid min-h-full grid-cols-1 gap-6 overflow-auto sm:grid-cols-3">
      {presets.map((preset) => (
        <div key={preset} className="rounded border border-gray-200 p-4 dark:border-gray-700">
          <Empty preset={preset} />
          <p className="mt-2 text-center text-xs text-gray-400">preset=&quot;{preset}&quot;</p>
        </div>
      ))}
    </div>
  )
}
