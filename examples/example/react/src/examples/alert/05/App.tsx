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
        {showAlert1 && (
          <Alert
            type="info"
            title="可关闭的提示"
            description="点击右侧关闭按钮可以关闭此提示"
            closable
            closeAriaLabel="关闭提示"
            onClose={() => setShowAlert1(false)}
          />
        )}
        {showAlert2 && (
          <Alert
            type="success"
            title="操作成功"
            description="您的操作已成功完成"
            closable
            closeAriaLabel="关闭提示"
            onClose={() => setShowAlert2(false)}
          />
        )}
        {(!showAlert1 || !showAlert2) && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            提示已关闭
            <Button
              className="ml-4"
              size="sm"
              variant="primary"
              onClick={() => {
                setShowAlert1(true)
                setShowAlert2(true)
              }}>
              重置
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
