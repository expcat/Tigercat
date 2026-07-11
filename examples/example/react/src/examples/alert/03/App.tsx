import { Button } from '@expcat/tigercat-react/Button'
import { List } from '@expcat/tigercat-react/List'
import { useState } from 'react'
import { Alert } from '@expcat/tigercat-react/Alert'

export default function App() {
  const [showAlert1, setShowAlert1] = useState(true)

  const [showAlert2, setShowAlert2] = useState(true)

  const [showAlert3, setShowAlert3] = useState(true)

  const customContentItems = ['支持列表项', '支持多种格式', '支持任意 React 组件']

  const demoCardClassName =
    'p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4 dark:border-gray-800 dark:bg-gray-900/40'

  return (
    <>
      <div className={demoCardClassName}>
        <Alert size="sm" type="info" title="小尺寸提示" description="这是小尺寸的提示内容" />
        <Alert size="md" type="success" title="中等尺寸提示" description="这是中等尺寸的提示内容" />
        <Alert size="lg" type="warning" title="大尺寸提示" description="这是大尺寸的提示内容" />
      </div>
    </>
  )
}
