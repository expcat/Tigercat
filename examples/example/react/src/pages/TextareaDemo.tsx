import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('textarea')

export default function TextareaDemo() {
  return <DemoPage title="Textarea 文本域" description="输入多行文本时使用。" modules={modules} />
}
