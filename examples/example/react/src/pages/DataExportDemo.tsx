import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('data-export')

export default function DataExportDemo() {
  return (
    <DemoPage
      title="DataExport 导出"
      description="将表格型数据导出为真正的 .xlsx 工作簿或 Markdown 表格。序列化逻辑按需加载，仅在触发导出时下载。"
      modules={modules}
    />
  )
}
