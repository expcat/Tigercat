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
        <Alert
          type="success"
          title="操作成功"
          description="您的订单已成功提交，我们将尽快为您处理。订单号：202312310001"
        />
        <Alert
          type="warning"
          title="注意事项"
          description="请确保填写的信息准确无误，操作过程中请勿关闭页面。"
        />
        <Alert
          type="error"
          title="操作失败"
          description="网络连接失败，请检查您的网络设置后重试。错误代码：E001"
        />
      </div>
    </>
  )
}
