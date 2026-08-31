import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('input-number')

export default function InputNumberDemo() {
  return (
    <DemoPage
      title="InputNumber 数字输入"
      description="十进制步进的数字框，支持格式化、双侧控件与键盘 Home/End。"
      modules={modules}
    />
  )
}
