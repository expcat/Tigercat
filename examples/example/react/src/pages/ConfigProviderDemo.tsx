import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('config-provider')

export default function ConfigProviderDemo() {
  return (
    <DemoPage
      title="ConfigProvider 全局配置"
      description="应用根 ConfigProvider 写入 document 的 locale / theme / dir / lang；内层只改 context。"
      modules={modules}
    />
  )
}
