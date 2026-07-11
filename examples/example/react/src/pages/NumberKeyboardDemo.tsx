import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('number-keyboard')

export default function NumberKeyboardDemo() {
  return (
    <DemoPage
      title="NumberKeyboard 数字键盘"
      description="移动端数字键盘，支持金额、手机号和身份证输入模式。"
      modules={modules}
    />
  )
}
