import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('split-button')

export default function SplitButtonDemo() {
  return (
    <DemoPage
      title="SplitButton 分裂按钮"
      description="主操作按钮旁附带 chevron 下拉，复用 Button 与 Dropdown，菜单项走现有 Dropdown API。"
      modules={modules}
    />
  )
}
