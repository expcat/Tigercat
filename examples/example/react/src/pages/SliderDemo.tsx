import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('slider')

export default function SliderDemo() {
  return (
    <DemoPage
      title="Slider 滑块"
      description="通过拖动滑块在一个固定区间内进行选择。"
      modules={modules}
    />
  )
}
