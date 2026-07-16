import { Signature } from '@expcat/tigercat-react/Signature'

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="space-y-1">
        <Signature width={280} height={140} penColor="#dc2626" lineWidth={2} ariaLabel="红色细笔" />
        <p className="text-xs text-gray-500">penColor 红 · lineWidth 2</p>
      </div>
      <div className="space-y-1">
        <Signature
          width={280}
          height={140}
          penColor="#f8fafc"
          backgroundColor="#0f172a"
          lineWidth={4}
          ariaLabel="深色背景画板"
        />
        <p className="text-xs text-gray-500">backgroundColor 深色 · lineWidth 4</p>
      </div>
    </div>
  )
}
