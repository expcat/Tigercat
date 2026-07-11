import React, { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <>
      <Space direction="vertical" className="w-full" size="lg">
        <Space direction="vertical" className="w-full">
          <Button variant="primary" block>
            block 主要按钮
          </Button>
          <Button variant="secondary" block>
            block 次要按钮
          </Button>
        </Space>
        <Space direction="vertical" className="w-full">
          <Button variant="primary" className="w-1/2">
            50% 宽度
          </Button>
          <Button variant="secondary" className="w-3/4">
            75% 宽度
          </Button>
          <Button variant="outline" className="w-full">
            100% 宽度
          </Button>
        </Space>
      </Space>
    </>
  )
}
