import { QRCode } from '@expcat/tigercat-react/QRCode'

export default function App() {
  return (
    <QRCode
      value="https://github.com/exp-codes/tigercat"
      size={160}
      color="#2563eb"
      bgColor="#eff6ff"
      level="H"
    />
  )
}
