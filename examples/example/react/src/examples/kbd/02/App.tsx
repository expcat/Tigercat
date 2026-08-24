import { Kbd } from '@expcat/tigercat-react/Kbd'

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Kbd keys={['Ctrl', 'K']} />
      <Kbd keys={['⌘', 'Shift', 'P']} />
      <Kbd keys="Enter" />
      <Kbd keys={['Ctrl']}>S</Kbd>
    </div>
  )
}
