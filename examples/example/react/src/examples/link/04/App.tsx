import React, { useState } from 'react'
import { Link } from '@expcat/tigercat-react/Link'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [clickCount, setClickCount] = useState(0)

  const handlePreventNavigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
  }

  return (
    <>
      <Space>
        <Link href="#" onClick={handlePreventNavigate}>
          有下划线（悬停）
        </Link>
        <Link href="#" onClick={handlePreventNavigate} underline={false}>
          无下划线
        </Link>
      </Space>
    </>
  )
}
