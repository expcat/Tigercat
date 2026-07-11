import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('tour')

export default function TourDemo() {
  return (
    <DemoPage title="Tour 漫游式引导" description="分步引导用户了解页面功能。" modules={modules} />
  )
}
