import { Card } from '@expcat/tigercat-react/Card'

const sizes = ['sm', 'md', 'lg'] as const
const cover = 'https://picsum.photos/seed/tiger-card-pad/480/192'

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
            <p className="text-sm text-gray-600 dark:text-gray-300">尺寸决定内边距密度。</p>
          </Card>
        ))}
      </div>
      <Card variant="bordered" size="md" cover={cover} coverAlt="">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          有封面时 padding 打在内容列，封面贴边。
        </p>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card variant="bordered" padding="p-8">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            padding=&quot;p-8&quot; 覆盖尺寸内边距。
          </p>
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
