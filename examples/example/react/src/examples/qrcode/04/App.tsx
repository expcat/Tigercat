import { QRCode } from '@expcat/tigercat-react/QRCode'

export default function App() {
  return <QRCode value="https://tigercat.dev" errorLevel="H" status="scanned" icon="M4 4h6v6H4z" />
}
