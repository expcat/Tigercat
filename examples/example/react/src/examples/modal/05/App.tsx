import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { confirmModal } from '@expcat/tigercat-react/Modal'

export default function App() {
  const [result, setResult] = useState('尚未确认')

  async function ask() {
    try {
      await confirmModal({
        title: '删除这项？',
        content: '删除后不能恢复。',
        onOk: () => Promise.resolve('deleted')
      })
      setResult('已确认')
    } catch {
      setResult('已取消')
    }
  }

  return (
    <ConfigProvider>
      <Button onClick={() => void ask()}>确认删除</Button>
      <p>{result}</p>
    </ConfigProvider>
  )
}
