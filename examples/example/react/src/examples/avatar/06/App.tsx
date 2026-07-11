import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { Space } from '@expcat/tigercat-react/Space'
import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <>
      <Space>
        <div>
          <p className="text-sm text-gray-600 mb-2 text-center">圆形</p>
          <Avatar shape="circle" text="圆形" />
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-2 text-center">方形</p>
          <Avatar shape="square" text="方形" />
        </div>
      </Space>
    </>
  )
}
