import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react/Breadcrumb'

export default function App() {
  return (
    <Breadcrumb maxItems={3}>
      <BreadcrumbItem href="/">首页</BreadcrumbItem>
      <BreadcrumbItem href="/docs">文档</BreadcrumbItem>
      <BreadcrumbItem href="/api">接口</BreadcrumbItem>
      <BreadcrumbItem current>当前</BreadcrumbItem>
    </Breadcrumb>
  )
}
