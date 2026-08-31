import { Splitter } from '@expcat/tigercat-react/Splitter'

export default function App() {
  return (
    <div className="flex flex-col gap-3">
      <Splitter
        direction="vertical"
        sizes={['40%', '60%']}
        style={{ height: 220, border: '1px solid var(--tiger-border, #e5e7eb)', borderRadius: 8 }}>
        <div className="p-4">上方面板</div>
        <div className="p-4">下方面板</div>
      </Splitter>
      <Splitter
        disabled
        sizes={['50%', '50%']}
        style={{ height: 80, border: '1px solid var(--tiger-border, #e5e7eb)', borderRadius: 8 }}>
        <div className="p-3 text-sm">禁用</div>
        <div className="p-3 text-sm">不能拖</div>
      </Splitter>
    </div>
  )
}
