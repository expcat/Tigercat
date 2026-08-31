import { Resizable } from '@expcat/tigercat-react/Resizable'

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <Resizable defaultWidth={160} defaultHeight={160} minWidth={120} lockAspectRatio>
        <div className="flex h-full w-full items-center justify-center rounded border border-green-200 bg-green-50 text-sm">
          锁定比例
        </div>
      </Resizable>
      <Resizable defaultWidth={200} defaultHeight={120} axis="horizontal" minWidth={80}>
        <div className="flex h-full w-full items-center justify-center rounded border border-blue-200 bg-blue-50 text-sm">
          仅水平 axis
        </div>
      </Resizable>
      <Resizable defaultWidth={160} defaultHeight={80} disabled>
        <div className="flex h-full w-full items-center justify-center rounded border bg-[var(--tiger-surface-muted,#f9fafb)] text-sm">
          disabled
        </div>
      </Resizable>
    </div>
  )
}
