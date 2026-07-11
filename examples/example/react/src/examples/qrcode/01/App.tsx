import { QRCode } from '@expcat/tigercat-react/QRCode'
import { Space } from '@expcat/tigercat-react/Space'
import { getDemoTigerLocale } from '@demo-shared/tiger-locale'
import { useLang } from '@demo-runtime/context'

export default function App() {
  const { lang } = useLang()

  const locale = getDemoTigerLocale(lang)

  return (
    <>
      <Space wrap>
        <QRCode value="https://github.com" locale={locale} />
        <QRCode value="https://github.com" size={200} locale={locale} />
        <QRCode value="https://github.com" size={80} locale={locale} />
      </Space>
    </>
  )
}
