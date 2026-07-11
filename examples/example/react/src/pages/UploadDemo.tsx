import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('upload')

export default function UploadDemo() {
  return (
    <DemoPage title="Upload 文件上传" description="通过点击或者拖拽上传文件。" modules={modules} />
  )
}
