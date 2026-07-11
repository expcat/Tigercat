import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('text')

export default function TextDemo() {
  return <DemoPage title="Text 文本" description="文本的基本格式。" modules={modules} />
}
