import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('markdown-editor')

export default function MarkdownEditorDemo() {
  return (
    <DemoPage
      title="MarkdownEditor Markdown 编辑器"
      description="支持编辑、分屏预览、工具栏插入和自定义预览渲染。"
      modules={modules}
    />
  )
}
