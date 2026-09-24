import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-compare')

export default function ImageCompareDemo() {
  return (
    <DemoPage
      title="ImageCompare 图片对比"
      description="叠放 before/after。两侧可加标题，标题进入滑块值文本。页面仍可滚动。"
      modules={modules}
    />
  )
}
