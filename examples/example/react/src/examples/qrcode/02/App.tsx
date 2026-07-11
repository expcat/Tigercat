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
        <QRCode value="https://github.com" color="#1677ff" locale={locale} />
        <QRCode value="https://github.com" color="#52c41a" bgColor="#f6ffed" locale={locale} />
        <QRCode value="https://github.com" level="H" locale={locale} />
        <QRCode value="https://github.com" level="L" locale={locale} />
      </Space>
    </>
  )
}
