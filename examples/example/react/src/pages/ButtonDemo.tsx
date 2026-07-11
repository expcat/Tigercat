import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('button')

export default function ButtonDemo() {
  return <DemoPage title="Button 按钮" description="按钮用于触发一个操作。" modules={modules} />
}
