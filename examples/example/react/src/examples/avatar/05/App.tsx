import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { Space } from '@expcat/tigercat-react/Space'
import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <>
      <Space align="center">
        <Avatar size="sm" text="SM" />
        <Avatar size="md" text="MD" />
        <Avatar size="lg" text="LG" />
        <Avatar size="xl" text="XL" />
      </Space>
    </>
  )
}
