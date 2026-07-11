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
        <QRCode value="https://github.com" status="active" locale={locale} />
        <QRCode
          value="https://github.com"
          status="expired"
          locale={locale}
          onRefresh={() => console.log('刷新二维码')}
        />
        <QRCode value="https://github.com" status="loading" locale={locale} />
      </Space>
    </>
  )
}
