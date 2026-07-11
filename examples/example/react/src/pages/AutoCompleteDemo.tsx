import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('auto-complete')

export default function AutoCompleteDemo() {
  return (
    <DemoPage
      title="AutoComplete 自动补全"
      description="输入框自动完成，根据输入内容过滤候选项。"
      modules={modules}
    />
  )
}
