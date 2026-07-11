import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('file-manager')

export default function FileManagerDemo() {
  return (
    <DemoPage
      title="FileManager 文件管理器"
      description="文件浏览管理组件，支持列表/网格视图和搜索。"
      modules={modules}
    />
  )
}
