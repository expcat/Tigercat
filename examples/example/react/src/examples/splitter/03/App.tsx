import { Splitter } from '@expcat/tigercat-react/Splitter'

export default function App() {
  return (
    <Splitter
      orientation="horizontal"
      sizes={['25%', '75%']}
      dir="rtl"
      style={{ height: 300, border: '1px solid var(--tiger-border)', borderRadius: 8 }}>
      <div className="p-4 h-full bg-[var(--tiger-surface-muted)]">起始栏</div>
      <Splitter orientation="vertical" sizes={['60%', '40%']}>
        <div className="p-4">内容区</div>
        <div className="p-4 bg-[var(--tiger-surface-muted)]">底部面板</div>
      </Splitter>
    </Splitter>
  )
}
