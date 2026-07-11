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
          type="info"
          titleSlot={<strong>自定义标题内容</strong>}
          descriptionSlot={
            <div>
              <p>这是自定义的描述内容，支持复杂的 HTML 结构：</p>
              <List
                className="mt-2 text-sm"
                bordered="none"
                split={false}
                size="sm"
                dataSource={customContentItems.map((title, index) => ({
                  key: index,
                  title
                }))}
                renderItem={(item) => (
                  <div className="flex items-start gap-2">
                    <span aria-hidden>•</span>
                    <span>{item.title}</span>
                  </div>
                )}
              />
            </div>
          }
        />

        <Alert type="warning">这是通过 children 传入的内容</Alert>
      </div>
    </>
  )
}
