import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('link')

export default function LinkDemo() {
  return <DemoPage title="Link 链接" description="文字超链接。" modules={modules} />
}
