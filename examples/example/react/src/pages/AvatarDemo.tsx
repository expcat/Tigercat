import { Avatar, Space, Divider, Badge } from '@tigercat/react';

export default function AvatarDemo() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Avatar 头像</h1>
        <p className="text-gray-600">
          用于展示用户或实体的头像组件，支持图片、文字、图标等多种展示形式。
        </p>
      </div>

      {/* 基本用法 - 图片头像 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">图片头像</h2>
        <p className="text-gray-600 mb-6">使用 src 属性显示图片头像。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
            <Avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
            <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 文字头像 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">文字头像</h2>
        <p className="text-gray-600 mb-6">
          使用 text 属性显示文字头像，组件会自动提取首字母或缩写。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Avatar text="Alice" />
            <Avatar text="Bob Smith" />
            <Avatar text="John Doe" />
            <Avatar text="张三" />
            <Avatar text="李明华" />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 图标头像 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">图标头像</h2>
        <p className="text-gray-600 mb-6">通过 children 传入图标内容。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Avatar>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Avatar>
            <Avatar>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </Avatar>
            <Avatar>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Avatar>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 头像尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">头像尺寸</h2>
        <p className="text-gray-600 mb-6">头像有四种尺寸：小、中、大、超大。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space align="center">
            <Avatar size="sm" text="SM" />
            <Avatar size="md" text="MD" />
            <Avatar size="lg" text="LG" />
            <Avatar size="xl" text="XL" />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 头像形状 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">头像形状</h2>
        <p className="text-gray-600 mb-6">头像支持圆形和方形两种形状。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
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
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义颜色 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义颜色</h2>
        <p className="text-gray-600 mb-6">
          可以通过 bgColor 和 textColor 自定义文字/图标头像颜色，推荐使用主题
          CSS 变量以便跟随主题。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Avatar text="默认" />
            <Avatar
              text="主"
              bgColor="bg-[var(--tiger-primary,#2563eb)]"
              textColor="text-white"
            />
            <Avatar
              text="次"
              bgColor="bg-[var(--tiger-secondary,#4b5563)]"
              textColor="text-white"
            />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 实际应用示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">实际应用示例</h2>
        <p className="text-gray-600 mb-6">模拟真实的使用场景。</p>

        {/* 用户列表 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">用户列表</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src="https://i.pravatar.cc/150?img=11"
                  alt="Alice Johnson"
                />
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
                  <div className="text-sm text-gray-500">
                    zhangsan@example.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 头像组 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">团队成员（头像组）</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex -space-x-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=21"
                alt="Member 1"
                size="md"
                className="ring-2 ring-white"
              />
              <Avatar
                src="https://i.pravatar.cc/150?img=22"
                alt="Member 2"
                size="md"
                className="ring-2 ring-white"
              />
              <Avatar
                text="Charlie"
                bgColor="bg-[var(--tiger-secondary,#4b5563)]"
                textColor="text-white"
                size="md"
                className="ring-2 ring-white"
              />
              <Avatar
                text="David"
                bgColor="bg-[var(--tiger-primary,#2563eb)]"
                textColor="text-white"
                size="md"
                className="ring-2 ring-white"
              />
              <Avatar
                text="+5"
                bgColor="bg-[var(--tiger-secondary,#4b5563)]"
                textColor="text-white"
                size="md"
                className="ring-2 ring-white"
              />
            </div>
          </div>
        </div>

        {/* 在线状态 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">在线状态指示</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space wrap>
              <div className="flex items-center gap-3">
                <Badge
                  type="dot"
                  variant="success"
                  standalone={false}
                  position="bottom-right">
                  <Avatar
                    src="https://i.pravatar.cc/150?img=31"
                    alt="Online User"
                    size="lg"
                  />
                </Badge>
                <span className="text-green-600 font-medium">在线</span>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  type="dot"
                  variant="warning"
                  standalone={false}
                  position="bottom-right">
                  <Avatar text="忙碌" size="lg" />
                </Badge>
                <span className="text-yellow-600 font-medium">忙碌</span>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  type="dot"
                  variant="default"
                  standalone={false}
                  position="bottom-right">
                  <Avatar text="离线" size="lg" />
                </Badge>
                <span className="text-gray-500">离线</span>
              </div>
            </Space>
          </div>
        </div>

        {/* 评论列表 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">评论列表</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar
                  src="https://i.pravatar.cc/150?img=41"
                  alt="User"
                  size="md"
                />
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
      </section>
    </div>
  );
}
