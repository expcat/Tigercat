import { QRCode } from '@expcat/tigercat-react/QRCode'

const levels = ['L', 'M', 'Q', 'H'] as const

export default function App() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-6">
        <QRCode value="https://tigercat.dev" size={96} />
        <QRCode value="https://tigercat.dev" size={128} />
        <QRCode value="https://tigercat.dev" size={160} />
      </div>
      <div className="flex flex-wrap gap-6">
        {levels.map((level) => (
          <div key={level} className="text-center">
            <QRCode value="https://tigercat.dev" size={96} level={level} />
            <p className="mt-1 text-xs text-gray-500">level={level}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
