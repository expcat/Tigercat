import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { Space } from '@expcat/tigercat-react/Space'
import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <>
      <Space>
        <Avatar src="/does-not-exist.jpg" text="回退" alt="加载失败回退" />
        <Avatar text="无图" />
      </Space>
    </>
  )
}
