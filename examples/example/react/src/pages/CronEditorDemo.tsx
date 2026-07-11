import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('cron-editor')

export default function CronEditorDemo() {
  return (
    <DemoPage
      title="CronEditor Cron 编辑器"
      description="用于编辑和校验 5 段 Cron 表达式。"
      modules={modules}
    />
  )
}
