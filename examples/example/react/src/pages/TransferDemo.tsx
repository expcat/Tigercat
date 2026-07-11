import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('transfer')

export default function TransferDemo() {
  return (
    <DemoPage
      title="Transfer 穿梭框"
      description="双栏穿梭选择，将数据在两栏之间移动。"
      modules={modules}
    />
  )
}
