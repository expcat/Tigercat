import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('signature')

export default function SignatureDemo() {
  return (
    <DemoPage
      title="Signature 手写签名"
      description="手写签名画板，支持颜色、线宽、清空和 PNG / SVG 导出。"
      modules={modules}
    />
  )
}
