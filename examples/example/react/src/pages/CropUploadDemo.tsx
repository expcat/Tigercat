import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('crop-upload')

export default function CropUploadDemo() {
  return (
    <DemoPage
      title="CropUpload 裁剪上传"
      description="组合组件：选择图片 → 弹窗裁剪 → 输出裁剪结果。适用于头像上传、封面裁剪等场景。"
      modules={modules}
    />
  )
}
