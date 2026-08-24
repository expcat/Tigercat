import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('kbd')

export default function KbdDemo() {
  return (
    <DemoPage
      title="Kbd 按键"
      description="语义化 kbd 按键标识，用于展示单个按键或组合快捷键，不是可点击按钮。"
      modules={modules}
    />
  )
}
