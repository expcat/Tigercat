import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('code')

export default function CodeDemo() {
  return (
    <DemoPage title="Code 代码展示" description="展示代码片段并支持一键复制。" modules={modules} />
  )
}
