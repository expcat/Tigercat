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
        <Link href="https://github.com" target="_blank">
          GitHub（自动添加 rel）
        </Link>
        <Link href="https://example.com" target="_blank" rel="nofollow">
          自定义 rel
        </Link>
      </Space>
    </>
  )
}
