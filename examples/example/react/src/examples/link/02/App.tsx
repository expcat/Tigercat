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
        <Link href="#" onClick={handlePreventNavigate} size="sm">
          Small
        </Link>
        <Link href="#" onClick={handlePreventNavigate} size="md">
          Medium
        </Link>
        <Link href="#" onClick={handlePreventNavigate} size="lg">
          Large
        </Link>
      </Space>
    </>
  )
}
