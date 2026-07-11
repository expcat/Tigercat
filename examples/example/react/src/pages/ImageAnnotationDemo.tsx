import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-annotation')

export default function ImageAnnotationDemo() {
  return (
    <DemoPage
      title="ImageAnnotation 图片标注"
      description="用 SVG 覆层在图片上绘制矩形、圆形、多边形和自由画笔标注，坐标以归一化数据保存。"
      modules={modules}
    />
  )
}
