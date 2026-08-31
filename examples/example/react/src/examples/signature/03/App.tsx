import { Signature } from '@expcat/tigercat-react/Signature'

const SAMPLE_SIGNATURE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="140" viewBox="0 0 280 140"><path d="M 20 90 L 60 40 L 100 110 L 160 50 L 220 95" fill="none" stroke="#0f766e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  )

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-[280px] space-y-1">
        <Signature width={280} height={140} readonly value={SAMPLE_SIGNATURE} />
        <p className="text-xs text-[var(--tiger-text-muted,#6b7280)]">
          readonly：展示已有签名，不可绘制
        </p>
      </div>
      <div className="w-[280px] space-y-1">
        <Signature width={280} height={140} disabled clearable={false} />
        <p className="text-xs text-[var(--tiger-text-muted,#6b7280)]">disabled + 隐藏清除按钮</p>
      </div>
    </div>
  )
}
