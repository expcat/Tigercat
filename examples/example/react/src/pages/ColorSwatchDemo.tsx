import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('color-swatch')

export default function ColorSwatchDemo() {
  return (
    <DemoPage
      title="ColorSwatch 色板选择器"
      description="用于从预设色板或自定义色组中快速选择颜色。"
      modules={modules}
    />
  )
}
