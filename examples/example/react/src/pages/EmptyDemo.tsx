import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('empty')

export default function EmptyDemo() {
  return (
    <DemoPage
      title="Empty 空状态"
      description="空状态占位。preset 换默认文案和内置插图（simple 无图）。"
      modules={modules}
    />
  )
}
