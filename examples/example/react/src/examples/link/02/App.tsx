import { useState } from 'react'
import { Link } from '@expcat/tigercat-react/Link'

export default function App() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <Link
      href="#"
      variant="secondary"
      underline={false}
      onClick={(event) => {
        event.preventDefault()
        setClickCount((count) => count + 1)
      }}>
      点击计数：{clickCount}
    </Link>
  )
}
