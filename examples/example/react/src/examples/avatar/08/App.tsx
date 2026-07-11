import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { Space } from '@expcat/tigercat-react/Space'
import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <>
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">用户列表</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar src="https://i.pravatar.cc/150?img=11" alt="Alice Johnson" />
                <div>
                  <div className="font-medium">Alice Johnson</div>
                  <div className="text-sm text-gray-500">alice@example.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar text="Bob Smith" />
                <div>
                  <div className="font-medium">Bob Smith</div>
                  <div className="text-sm text-gray-500">bob@example.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar text="张三" />
                <div>
                  <div className="font-medium">张三</div>
                  <div className="text-sm text-gray-500">zhangsan@example.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">团队成员（头像组）</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <AvatarGroup max={4} size="md" aria-label="项目团队成员">
              <Avatar src="https://i.pravatar.cc/150?img=21" alt="成员：王一" />
              <Avatar src="https://i.pravatar.cc/150?img=22" alt="成员：李敏" />
              <Avatar
                text="Charlie"
                bgColor="bg-[var(--tiger-secondary,#4b5563)]"
                textColor="text-white"
                aria-label="成员：Charlie"
              />
              <Avatar
                text="David"
                bgColor="bg-[var(--tiger-primary,#2563eb)]"
                textColor="text-white"
                aria-label="成员：David"
              />
              <Avatar text="赵六" aria-label="成员：赵六" />
              <Avatar text="钱七" aria-label="成员：钱七" />
              <Avatar text="孙八" aria-label="成员：孙八" />
              <Avatar text="周九" aria-label="成员：周九" />
              <Avatar text="吴十" aria-label="成员：吴十" />
            </AvatarGroup>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">在线状态指示</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space wrap>
              <div className="flex items-center gap-3">
                <Badge type="dot" variant="success" standalone={false} position="bottom-right">
                  <Avatar src="https://i.pravatar.cc/150?img=31" alt="Online User" size="lg" />
                </Badge>
                <span className="text-green-600 font-medium">在线</span>
              </div>

              <div className="flex items-center gap-3">
                <Badge type="dot" variant="warning" standalone={false} position="bottom-right">
                  <Avatar text="忙碌" size="lg" />
                </Badge>
                <span className="text-yellow-600 font-medium">忙碌</span>
              </div>

              <div className="flex items-center gap-3">
                <Badge type="dot" variant="default" standalone={false} position="bottom-right">
                  <Avatar text="离线" size="lg" />
                </Badge>
                <span className="text-gray-500">离线</span>
              </div>
            </Space>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">评论列表</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar src="https://i.pravatar.cc/150?img=41" alt="User" size="md" />
                <div className="flex-1">
                  <div className="font-medium mb-1">Alice Johnson</div>
                  <div className="text-gray-600 text-sm">
                    这是一条评论内容，用于展示头像在评论列表中的应用。
                  </div>
                  <div className="text-gray-400 text-xs mt-1">2小时前</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar text="Bob" size="md" />
                <div className="flex-1">
                  <div className="font-medium mb-1">Bob Smith</div>
                  <div className="text-gray-600 text-sm">
                    另一条评论内容，展示文字头像的使用效果。
                  </div>
                  <div className="text-gray-400 text-xs mt-1">5小时前</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
