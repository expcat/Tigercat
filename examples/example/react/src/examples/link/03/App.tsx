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
        <Link href="#" disabled>
          Disabled Primary
        </Link>
        <Link href="#" variant="secondary" disabled>
          Disabled Secondary
        </Link>
        <Link href="#" variant="default" disabled>
          Disabled Default
        </Link>
      </Space>
    </>
  )
}
