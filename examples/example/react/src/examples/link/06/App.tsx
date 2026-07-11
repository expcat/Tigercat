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
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault()
          setClickCount((c) => c + 1)
        }}>
        点击计数：{clickCount}
      </Link>
    </>
  )
}
