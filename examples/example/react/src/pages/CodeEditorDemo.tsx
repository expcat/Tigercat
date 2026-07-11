import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('code-editor')

export default function CodeEditorDemo() {
  return (
    <DemoPage
      title="CodeEditor 代码编辑器"
      description="轻量级代码编辑器，支持语法高亮、行号和主题切换。"
      modules={modules}
    />
  )
}
