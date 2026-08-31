import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('signature')

export default function SignatureDemo() {
  return (
    <DemoPage
      title="Signature 手写签名"
      description="受控值为 SVG data URL 或空字符串；toDataURL 可导出 PNG / JPEG / SVG。"
      modules={modules}
    />
  )
}
