import { Breadcrumb } from '@expcat/tigercat-react/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-react/BreadcrumbItem'

function stay(event: { preventDefault: () => void }) {
  event.preventDefault()
}

export default function App() {
  return (
    <div className="space-y-2">
      <Breadcrumb maxItems={3}>
        <BreadcrumbItem href="/" onClick={stay}>
          首页
        </BreadcrumbItem>
        <BreadcrumbItem href="/a" onClick={stay}>
          一级目录
        </BreadcrumbItem>
        <BreadcrumbItem href="/a/b" onClick={stay}>
          二级目录
        </BreadcrumbItem>
        <BreadcrumbItem href="/a/b/c" onClick={stay}>
          三级目录
        </BreadcrumbItem>
        <BreadcrumbItem href="/a/b/c/d" onClick={stay}>
          四级目录
        </BreadcrumbItem>
        <BreadcrumbItem>当前页面</BreadcrumbItem>
      </Breadcrumb>
      <p className="text-sm text-gray-500">
        maxItems=3 时保留首页和当前页，中间折叠为 …。展开后再换路径会重新折叠。
      </p>
    </div>
  )
}
