import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-cropper')

export default function ImageCropperDemo() {
  return (
    <DemoPage
      title="ImageCropper 图片裁剪"
      description="有界裁剪支持 1:1、4:3、16:9、自由比例，以及旋转、翻转和圆形遮罩。键盘仍能改边。"
      modules={modules}
    />
  )
}
