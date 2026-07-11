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
        <Alert type="info" title="信息提示" description="这是一条信息提示的详细内容" />
        <Alert type="success" title="成功提示" description="操作成功完成" />
        <Alert type="warning" title="警告提示" description="请注意相关事项" />
        <Alert type="error" title="错误提示" description="操作失败，请重试" />
      </div>
    </>
  )
}
