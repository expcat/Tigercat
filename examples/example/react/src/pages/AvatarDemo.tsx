import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('avatar')

export default function AvatarDemo() {
  return (
    <DemoPage
      title="Avatar 头像"
      description="头像支持图片、文字和图标。溢出按钮打开浮层，列出被折叠头像的名字。"
      modules={modules}
    />
  )
}
