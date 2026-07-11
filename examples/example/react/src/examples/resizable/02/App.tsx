import { Resizable } from '@expcat/tigercat-react/Resizable'

export default function App() {
  return (
    <Resizable defaultWidth={200} defaultHeight={200} minWidth={120} lockAspectRatio>
      <div className="flex h-full w-full items-center justify-center rounded border border-green-200 bg-green-50 text-sm">
        固定宽高比
      </div>
    </Resizable>
  )
}
