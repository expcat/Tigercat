import { Breadcrumb } from '@expcat/tigercat-react/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-react/BreadcrumbItem'

function stay(event: { preventDefault: () => void }) {
  event.preventDefault()
}

export default function App() {
  return (
    <div className="space-y-3">
      <Breadcrumb separator="slash">
        <BreadcrumbItem href="/" onClick={stay}>
          首页
        </BreadcrumbItem>
        <BreadcrumbItem href="/settings" onClick={stay}>
          设置
        </BreadcrumbItem>
        <BreadcrumbItem>账户</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb separator="arrow">
        <BreadcrumbItem href="/" onClick={stay}>
          首页
        </BreadcrumbItem>
        <BreadcrumbItem href="/settings" onClick={stay}>
          设置
        </BreadcrumbItem>
        <BreadcrumbItem>账户</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb separator="›">
        <BreadcrumbItem href="/" icon="🏠" onClick={stay}>
          首页
        </BreadcrumbItem>
        <BreadcrumbItem icon="📁" onClick={() => undefined}>
          文件
        </BreadcrumbItem>
        <BreadcrumbItem icon="📄">文档</BreadcrumbItem>
      </Breadcrumb>
    </div>
  )
}
