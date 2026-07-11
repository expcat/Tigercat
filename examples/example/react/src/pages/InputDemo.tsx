import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('input')

export default function InputDemo() {
  return (
    <DemoPage
      title="Input 输入框"
      description="通过鼠标或键盘输入内容，是最基础的表单域的包装。"
      modules={modules}
    />
  )
}
