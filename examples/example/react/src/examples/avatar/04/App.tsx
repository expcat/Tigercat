import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'

export default function App() {
  return (
    <AvatarGroup max={2}>
      <Avatar text="安" />
      <Avatar text="柏" />
      <Avatar text="陈" />
      <Avatar alt="丁" />
    </AvatarGroup>
  )
}
