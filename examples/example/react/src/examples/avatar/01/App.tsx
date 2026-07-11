import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { Space } from '@expcat/tigercat-react/Space'
import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <>
      <Space>
        <Avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
        <Avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
        <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
      </Space>
    </>
  )
}
