import { Link } from '@expcat/tigercat-react/Link'
import { PageHeader } from '@expcat/tigercat-react/PageHeader'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  return (
    <PageHeader
      title="项目概览"
      subTitle="只读页头，返回使用 Link 覆盖"
      back={
        <Link href="#projects" underline={false} className="text-sm">
          返回项目
        </Link>
      }
      actions={<Tag>进行中</Tag>}>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        children 渲染在标题行下方，适合放简短说明或筛选条。自定义 back 可换成 Link 或其他控件。
      </p>
    </PageHeader>
  )
}
