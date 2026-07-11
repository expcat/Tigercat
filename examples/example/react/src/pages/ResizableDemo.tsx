import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('resizable')

export default function ResizableDemo() {
  return (
    <DemoPage
      title="Resizable 可调整大小容器"
      description="拖拽手柄改变元素尺寸，支持锁定宽高比和约束范围。"
      modules={modules}
    />
  )
}
