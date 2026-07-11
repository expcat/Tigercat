import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { Space } from '@expcat/tigercat-react/Space'
import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <>
      <Space>
        <Avatar text="Alice" />
        <Avatar text="Bob Smith" />
        <Avatar text="John Doe" />
        <Avatar text="张三" />
        <Avatar text="李明华" />
      </Space>
    </>
  )
}
