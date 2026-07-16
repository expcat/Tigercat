import { Statistic } from '@expcat/tigercat-react/Statistic'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-8">
        {sizes.map((size) => (
          <Statistic key={size} title={`size=${size}`} value={12345} size={size} groupSeparator />
        ))}
      </div>
      <div className="flex flex-wrap gap-8">
        <Statistic title="groupSeparator" value={1234567} groupSeparator />
        <Statistic title="无分隔符" value={1234567} />
      </div>
    </div>
  )
}
