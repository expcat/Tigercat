import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('inplace')

export default function InplaceDemo() {
  return (
    <DemoPage
      title="Inplace 原位编辑"
      description="在展示态与编辑态之间切换，支持提交与取消。"
      modules={modules}
    />
  )
}
