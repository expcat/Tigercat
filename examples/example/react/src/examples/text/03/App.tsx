import { Text } from '@expcat/tigercat-react/Text'

const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'muted'] as const

export default function App() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {colors.map((color) => (
          <Text key={color} tag="span" weight="medium" color={color}>
            {color}
          </Text>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <Text tag="span" underline>
          下划线
        </Text>
        <Text tag="span" italic>
          斜体
        </Text>
        <Text tag="span" lineThrough color="muted">
          删除线
        </Text>
      </div>
      <div className="max-w-xs">
        <Text truncate>truncate：这是一段很长很长的文本，超出容器宽度时会以省略号结尾而不换行。</Text>
      </div>
    </div>
  )
}
