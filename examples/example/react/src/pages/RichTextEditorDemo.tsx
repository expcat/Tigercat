import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('rich-text-editor')

export default function RichTextEditorDemo() {
  return (
    <DemoPage
      title="RichTextEditor 富文本编辑器"
      description="所见即所得的富文本编辑器，带工具栏。"
      modules={modules}
    />
  )
}
