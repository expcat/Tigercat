import { useState } from 'react'
import { Avatar } from '@expcat/tigercat-react/Avatar'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [src, setSrc] = useState('/missing-avatar.jpg')

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar src={src} text="Ada Lovelace" />
      <Button
        size="sm"
        variant="outline"
        onClick={() => setSrc('https://i.pravatar.cc/150?img=32')}>
        换成有效地址
      </Button>
      <Avatar src="https://i.pravatar.cc/150?img=15" text="No Alt" />
    </div>
  )
}
