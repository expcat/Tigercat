import { Space } from '@expcat/tigercat-react/Space'

const items = ['项目一', '项目二', '项目三']
const chip = 'rounded bg-indigo-600 px-3 py-1.5 text-sm text-white'

export default function App() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-gray-500">direction=&quot;vertical&quot;</p>
        <Space direction="vertical" size="md">
          {items.map((t) => (
            <span key={t} className={chip}>
              {t}
            </span>
          ))}
        </Space>
      </div>
      <div>
        <p className="mb-2 text-sm text-gray-500">size={40}（自定义像素间距）</p>
        <Space size={40}>
          {items.map((t) => (
            <span key={t} className={chip}>
              {t}
            </span>
          ))}
        </Space>
      </div>
    </div>
  )
}
