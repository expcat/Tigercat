import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { Space } from '@expcat/tigercat-react/Space'
import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <>
      <Space>
        <Avatar text="默认" />
        <Avatar text="主" bgColor="bg-[var(--tiger-primary,#2563eb)]" textColor="text-white" />
        <Avatar text="次" bgColor="bg-[var(--tiger-secondary,#4b5563)]" textColor="text-white" />
      </Space>
    </>
  )
}
