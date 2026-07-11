import { Avatar } from '@expcat/tigercat-react/Avatar'

export default function App() {
  return (
    <Avatar
      text="TC"
      size="lg"
      shape="square"
      bgColor="bg-[var(--tiger-primary,#2563eb)]"
      textColor="text-white"
      aria-label="Tigercat 团队"
    />
  )
}
