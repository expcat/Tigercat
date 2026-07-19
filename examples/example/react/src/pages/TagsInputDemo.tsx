import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('tags-input')

export default function TagsInputDemo() {
  return (
    <DemoPage
      title="TagsInput 标签输入"
      description="输入创建标签，支持退格删除、去重、最大数量、分隔符拆分与受控/非受控。"
      modules={modules}
    />
  )
}
