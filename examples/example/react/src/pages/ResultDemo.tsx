import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('result')

export default function ResultDemo() {
  return (
    <DemoPage
      title="Result 结果页"
      description="用于反馈操作结果，包括成功、失败、警告和 HTTP 状态码。"
      modules={modules}
    />
  )
}
