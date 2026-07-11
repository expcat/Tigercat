import React, { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <>
      <Space direction="vertical" className="w-full" size="lg">
        <Space align="center">
          <Button variant="primary" onClick={() => setClickCount((c) => c + 1)}>
            已点击 {clickCount} 次
          </Button>
          <Button variant="secondary" onClick={() => setClickCount(0)}>
            重置
          </Button>
        </Space>
        <form onSubmit={(e) => e.preventDefault()}>
          <Space>
            <Button htmlType="submit" variant="primary">
              提交
            </Button>
            <Button htmlType="reset" variant="outline">
              重置
            </Button>
            <Button htmlType="button" variant="ghost">
              普通按钮
            </Button>
          </Space>
        </form>
      </Space>
    </>
  )
}
