import { Avatar } from '@expcat/tigercat-react/Avatar'
import { Icon } from '@expcat/tigercat-react/Icon'

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar src="https://i.pravatar.cc/150?img=12" alt="Jane Doe" />
      <Avatar text="Jane Doe" />
      <Avatar text="张三" />
      <Avatar>
        <Icon name="user" />
      </Avatar>
      <Avatar
        text="TC"
        shape="square"
        bgColor="bg-[var(--tiger-primary,#2563eb)]"
        textColor="text-white"
      />
    </div>
  )
}
