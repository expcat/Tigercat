import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('qrcode')

export default function QRCodeDemo() {
  return (
    <DemoPage
      title="QRCode 二维码"
      description="将文本转换为二维码，支持自定义颜色、大小和纠错等级。"
      modules={modules}
    />
  )
}
