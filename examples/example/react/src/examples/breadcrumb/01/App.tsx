import { Breadcrumb } from '@expcat/tigercat-react/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-react/BreadcrumbItem'

export default function App() {
  return (
    <Breadcrumb separator="chevron" extra={<span className="text-xs text-gray-500">项目导航</span>}>
      <BreadcrumbItem
        href="/"
        onClick={(event) => {
          event.preventDefault()
        }}>
        首页
      </BreadcrumbItem>
      <BreadcrumbItem
        href="/components"
        onClick={(event) => {
          event.preventDefault()
        }}>
        组件
      </BreadcrumbItem>
      <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
    </Breadcrumb>
  )
}
