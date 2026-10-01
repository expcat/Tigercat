import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('app-shell')

export default function AppShellDemo() {
  return (
    <DemoPage
      title="AppShell 应用壳"
      description="组合侧栏、页头、面包屑与页签的应用布局。"
      modules={modules}
    />
  )
}
