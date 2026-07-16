import { Text } from '@expcat/tigercat-react/Text'

const sizes = ['xs', 'base', 'lg', '2xl', '4xl'] as const
const weights = ['normal', 'medium', 'semibold', 'bold', 'black'] as const

export default function App() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-4">
        {sizes.map((size) => (
          <Text key={size} tag="span" size={size}>
            {size}
          </Text>
        ))}
      </div>
      <div className="flex flex-wrap items-baseline gap-4">
        {weights.map((weight) => (
          <Text key={weight} tag="span" size="lg" weight={weight}>
            {weight}
          </Text>
        ))}
      </div>
    </div>
  )
}
