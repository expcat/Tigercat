import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('color-picker')

export default function ColorPickerDemo() {
  return (
    <DemoPage
      title="ColorPicker 颜色选择器"
      description="用于选择颜色，支持透明度、预设颜色和多种格式。"
      modules={modules}
    />
  )
}
