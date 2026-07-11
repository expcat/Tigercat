import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('input-group')

export default function InputGroupDemo() {
  return (
    <DemoPage
      title="InputGroup 输入框组"
      description="将多个输入元素组合在一起，支持前后缀和紧凑模式。"
      modules={modules}
    />
  )
}
