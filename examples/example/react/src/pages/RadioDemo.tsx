import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('radio')

export default function RadioDemo() {
  return <DemoPage title="Radio 单选框" description="在一组备选项中进行单选。" modules={modules} />
}
