import { QRCode } from '@expcat/tigercat-react/QRCode'

export default function App() {
  return (
    <div className="flex flex-wrap gap-6">
      <div className="text-center">
        <QRCode value="https://tigercat.dev" size={120} color="#7c3aed" bgColor="#f5f3ff" />
        <p className="mt-1 text-xs text-gray-500">自定义配色</p>
      </div>
      <div className="text-center">
        <QRCode value="https://tigercat.dev" size={120} status="expired" />
        <p className="mt-1 text-xs text-gray-500">status=&quot;expired&quot;</p>
      </div>
      <div className="text-center">
        <QRCode value="https://tigercat.dev" size={120} status="loading" />
        <p className="mt-1 text-xs text-gray-500">status=&quot;loading&quot;</p>
      </div>
    </div>
  )
}
