import { Divider } from '@expcat/tigercat-react/Divider'

export default function App() {
  return (
    <div className="flex h-12 items-center gap-3">
      <span>左侧</span>
      <Divider orientation="vertical" className="h-6" />
      <span>右侧</span>
    </div>
  )
}
