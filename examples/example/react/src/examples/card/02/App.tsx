import { Card } from '@expcat/tigercat-react/Card'

const variants = ['default', 'bordered', 'shadow', 'elevated', 'transparent'] as const

export default function App() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {variants.map((variant) => (
        <Card key={variant} variant={variant} header={<span className="font-medium">{variant}</span>}>
          <p className="text-sm text-gray-600">variant=&quot;{variant}&quot;</p>
        </Card>
      ))}
    </div>
  )
}
