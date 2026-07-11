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
        {showAlert3 && (
          <Alert
            type="warning"
            size="lg"
            title="重要提示"
            description="这是一条重要的警告信息，请仔细阅读。此提示包含了图标、标题、描述和关闭按钮等所有功能。"
            showIcon
            closable
            onClose={() => setShowAlert3(false)}
          />
        )}
        {!showAlert3 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            提示已关闭
            <Button
              className="ml-4"
              size="sm"
              variant="primary"
              onClick={() => setShowAlert3(true)}>
              重置
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
