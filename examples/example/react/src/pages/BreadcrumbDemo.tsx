import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('breadcrumb')

export default function BreadcrumbDemo() {
  return (
    <DemoPage
      title="Breadcrumb 面包屑"
      description="显示当前页面在系统层级结构中的位置，并能向上返回。"
      modules={modules}
    />
  )
}
