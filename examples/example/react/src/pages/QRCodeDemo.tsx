import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('qrcode')

export default function QRCodeDemo() {
  return (
    <DemoPage
      title="QRCode 二维码"
      description="把 value 编成可扫描的 QR。可选纠错等级和中心图标。状态包含已扫描。"
      modules={modules}
    />
  )
}
