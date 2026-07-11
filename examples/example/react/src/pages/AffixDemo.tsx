import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('affix')

export default function AffixDemo() {
  return (
    <DemoPage title="Affix 固钉" description="将元素固定在可视区域的指定位置。" modules={modules} />
  )
}
