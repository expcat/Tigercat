import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('backtop')

export default function BackTopDemo() {
  return (
    <DemoPage title="BackTop 回到顶部" description="返回页面顶部的操作按钮。" modules={modules} />
  )
}
