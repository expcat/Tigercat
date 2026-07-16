import { Card } from '@expcat/tigercat-react/Card'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sizes.map((size) => (
          <Card
            key={size}
            variant="bordered"
            size={size}
            header={<span className="font-medium">size={size}</span>}>
            <p className="text-sm text-gray-600">尺寸决定内边距密度。</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card variant="bordered" padding="p-8">
          <p className="text-sm text-gray-600">padding=&quot;p-8&quot; 覆盖尺寸内边距。</p>
        </Card>
        <Card variant="bordered" padding={false}>
          <div className="bg-blue-500 px-4 py-6 text-sm text-white">
            padding=false：内容自行控制边距。
          </div>
        </Card>
      </div>
    </div>
  )
}
