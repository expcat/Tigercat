import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('grid')

export default function GridDemo() {
  return (
    <DemoPage
      title="Grid 栅格"
      description="通过基础的 24 分栏，迅速简便地创建布局。"
      modules={modules}
    />
  )
}
