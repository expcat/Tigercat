import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('mentions')

export default function MentionsDemo() {
  return (
    <DemoPage
      title="Mentions 提及"
      description="输入框中 @提及 用户，支持自定义触发字符。"
      modules={modules}
    />
  )
}
