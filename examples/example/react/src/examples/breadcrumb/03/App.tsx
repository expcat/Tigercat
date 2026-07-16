import { Breadcrumb } from '@expcat/tigercat-react/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-react/BreadcrumbItem'

export default function App() {
  return (
    <div className="space-y-2">
      <Breadcrumb maxItems={3}>
        <BreadcrumbItem href="/">首页</BreadcrumbItem>
        <BreadcrumbItem href="/a">一级目录</BreadcrumbItem>
        <BreadcrumbItem href="/a/b">二级目录</BreadcrumbItem>
        <BreadcrumbItem href="/a/b/c">三级目录</BreadcrumbItem>
        <BreadcrumbItem href="/a/b/c/d">四级目录</BreadcrumbItem>
        <BreadcrumbItem current>当前页面</BreadcrumbItem>
      </Breadcrumb>
      <p className="text-sm text-gray-500">maxItems=3 时中间项折叠为 …，点击可展开完整路径。</p>
    </div>
  )
}
