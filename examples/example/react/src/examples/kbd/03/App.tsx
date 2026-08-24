import { Kbd } from '@expcat/tigercat-react/Kbd'

export default function App() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Kbd size="sm">S</Kbd>
        <Kbd size="md">M</Kbd>
        <Kbd size="lg">L</Kbd>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Kbd variant="default" keys={['Ctrl', 'S']} />
        <Kbd variant="subtle" keys={['Ctrl', 'S']} />
      </div>
    </div>
  )
}
