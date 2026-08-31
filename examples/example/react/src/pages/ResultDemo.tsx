import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('result')

export default function ResultDemo() {
  return (
    <DemoPage
      title="Result 结果页"
      description="操作结果页。有 title 时用 heading；HTTP 状态画数字，不自动补文案。默认不是 live region。"
      modules={modules}
    />
  )
}
