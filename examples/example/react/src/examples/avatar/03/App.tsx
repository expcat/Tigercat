import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'

export default function App() {
  return (
    <AvatarGroup max={3} size="md" aria-label="项目成员">
      <Avatar src="https://i.pravatar.cc/150?img=21" alt="成员：王一" />
      <Avatar src="https://i.pravatar.cc/150?img=22" alt="成员：李敏" />
      <Avatar text="陈晨" aria-label="成员：陈晨" />
      <Avatar text="赵六" aria-label="成员：赵六" />
    </AvatarGroup>
  )
}
