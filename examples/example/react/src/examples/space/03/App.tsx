import { Space } from '@expcat/tigercat-react/Space'

const aligns = ['start', 'center', 'end'] as const
const tags = Array.from({ length: 10 }, (_, i) => i + 1)

export default function App() {
  return (
    <div className="space-y-6">
      {aligns.map((align) => (
        <div key={align}>
          <p className="mb-2 text-sm text-gray-500">align=&quot;{align}&quot;</p>
          <Space align={align} size="md">
            <span className="rounded bg-emerald-600 px-3 py-1 text-sm text-white">小</span>
            <span className="rounded bg-emerald-600 px-3 py-4 text-sm text-white">高</span>
            <span className="rounded bg-emerald-600 px-3 py-2 text-sm text-white">中</span>
          </Space>
        </div>
      ))}
      <div>
        <p className="mb-2 text-sm text-gray-500">wrap（窄容器内自动换行）</p>
        <div className="max-w-xs">
          <Space size="sm" wrap>
            {tags.map((i) => (
              <span key={i} className="rounded bg-emerald-600 px-3 py-1 text-sm text-white">
                标签 {i}
              </span>
            ))}
          </Space>
        </div>
      </div>
    </div>
  )
}
