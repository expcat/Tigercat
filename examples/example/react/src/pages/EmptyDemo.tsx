import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('empty')

export default function EmptyDemo() {
  return (
    <DemoPage
      title="Empty 空状态"
      description="空状态时的占位提示，支持多种预设样式。"
      modules={modules}
    />
  )
}
