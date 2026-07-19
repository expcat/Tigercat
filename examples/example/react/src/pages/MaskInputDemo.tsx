import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('mask-input')

export default function MaskInputDemo() {
  return (
    <DemoPage
      title="MaskInput 掩码输入"
      description="模板掩码(日期/电话/自定义 token)输入，同时输出原始值与格式化值。"
      modules={modules}
    />
  )
}
