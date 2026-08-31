import { Splitter } from '@expcat/tigercat-react/Splitter'

export default function App() {
  return (
    <Splitter
      direction="horizontal"
      sizes={['25%', '75%']}
      dir="rtl"
      style={{ height: 300, border: '1px solid var(--tiger-border, #e5e7eb)', borderRadius: 8 }}>
      <div className="p-4 h-full bg-[var(--tiger-surface-muted,#f9fafb)]">起始栏</div>
      <Splitter direction="vertical" sizes={['60%', '40%']}>
        <div className="p-4">内容区</div>
        <div className="p-4 bg-[var(--tiger-surface-muted,#f9fafb)]">底部面板</div>
      </Splitter>
    </Splitter>
  )
}
