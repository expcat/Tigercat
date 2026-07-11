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
        <Link href="#" onClick={handlePreventNavigate} variant="primary">
          Primary
        </Link>
        <Link href="#" onClick={handlePreventNavigate} variant="secondary">
          Secondary
        </Link>
        <Link href="#" onClick={handlePreventNavigate} variant="default">
          Default
        </Link>
      </Space>
    </>
  )
}
