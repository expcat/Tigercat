import { QRCode } from '@expcat/tigercat-react/QRCode'

export default function App() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <QRCode value="https://tigercat.dev" size={96} />
      <QRCode value="https://tigercat.dev" size={128} />
      <QRCode value="https://tigercat.dev" size={160} />
    </div>
  )
}
