import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { Input } from '@expcat/tigercat-react/Input'
import { useState } from 'react'
import { Modal } from '@expcat/tigercat-react/Modal'

const infoParagraphs = Array.from({ length: 14 }).map((_, index) => (
  <p key={index} className={index === 0 ? '' : 'mt-2'}>
    这是一段用于演示滚动内容的示例文本（第 {index + 1} 段）。当内容较长时，Modal
    仍应保持良好的可读性与滚动体验。
  </p>
))

export default function App() {
  const [visible1, setVisible1] = useState(false)

  const [visible2, setVisible2] = useState(false)

  const [visible3, setVisible3] = useState(false)

  const [visibleSm, setVisibleSm] = useState(false)

  const [visibleMd, setVisibleMd] = useState(false)

  const [visibleLg, setVisibleLg] = useState(false)

  const [visibleXl, setVisibleXl] = useState(false)

  const [visibleFull, setVisibleFull] = useState(false)

  const [visibleCentered, setVisibleCentered] = useState(false)

  const [visibleNested, setVisibleNested] = useState(false)

  const [visibleNested2, setVisibleNested2] = useState(false)

  const [visibleNoMask, setVisibleNoMask] = useState(false)

  const [visibleDestroyOnClose, setVisibleDestroyOnClose] = useState(false)

  const [visibleCustomFooter, setVisibleCustomFooter] = useState(false)

  const [visibleDefaultFooter, setVisibleDefaultFooter] = useState(false)

  const [visibleLabels, setVisibleLabels] = useState(false)

  const [visibleConfirm, setVisibleConfirm] = useState(false)

  const [confirmLoading, setConfirmLoading] = useState(false)

  const [confirmResult, setConfirmResult] = useState<string | null>(null)

  const [visibleInfo, setVisibleInfo] = useState(false)

  const [visibleForm, setVisibleForm] = useState(false)

  const [formLoading, setFormLoading] = useState(false)

  const [formName, setFormName] = useState('')

  const [formEmail, setFormEmail] = useState('')

  const [formError, setFormError] = useState<string | null>(null)

  const handleOk = () => {
    console.log('OK clicked')
    setVisible1(false)
  }

  const handleCancel = () => {
    console.log('Cancel clicked')
    setVisible1(false)
  }

  const handleConfirmDelete = async () => {
    if (confirmLoading) return
    setConfirmLoading(true)
    setConfirmResult(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 900))
      setVisibleConfirm(false)
      setConfirmResult('已确认：删除操作已提交（示例）')
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleFormSubmit = async () => {
    if (formLoading) return
    setFormError(null)

    const name = formName.trim()
    const email = formEmail.trim()
    if (!name) {
      setFormError('请填写姓名')
      return
    }
    if (!email || !email.includes('@')) {
      setFormError('请填写正确的邮箱')
      return
    }

    setFormLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setVisibleForm(false)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">确认对话框</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-gray-700 dark:text-gray-300">
                用于需要用户确认的操作（示例：删除）。
              </p>
              <Button variant="outline" onClick={() => setVisibleConfirm(true)}>
                删除确认
              </Button>
            </div>
            {confirmResult && <p className="mt-3 text-sm text-green-700">{confirmResult}</p>}

            <Modal
              open={visibleConfirm}
              title="删除确认"
              onCancel={() => {
                if (confirmLoading) return
                setVisibleConfirm(false)
                setConfirmResult('已取消：未执行删除（示例）')
              }}
              footer={
                <Space>
                  <Button
                    variant="secondary"
                    disabled={confirmLoading}
                    onClick={() => {
                      setVisibleConfirm(false)
                      setConfirmResult('已取消：未执行删除（示例）')
                    }}>
                    取消
                  </Button>
                  <Button disabled={confirmLoading} onClick={handleConfirmDelete}>
                    {confirmLoading ? '删除中…' : '确认删除'}
                  </Button>
                </Space>
              }>
              <p className="text-gray-800">此操作不可撤销，是否继续？</p>
              <p className="mt-2 text-gray-600 text-sm">提示：这里用按钮 loading 模拟异步提交。</p>
            </Modal>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">信息展示</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-gray-700 dark:text-gray-300">
                用于展示较长内容（用户协议/隐私政策等）。
              </p>
              <Button onClick={() => setVisibleInfo(true)}>查看详情</Button>
            </div>

            <Modal
              open={visibleInfo}
              title="服务协议（示例）"
              size="lg"
              onCancel={() => setVisibleInfo(false)}
              footer={<Button onClick={() => setVisibleInfo(false)}>我已阅读</Button>}>
              <div className="max-h-[50vh] overflow-auto pr-2">{infoParagraphs}</div>
            </Modal>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">表单输入</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-gray-700 dark:text-gray-300">
                在对话框中嵌入表单，用于数据收集和编辑。
              </p>
              <Button onClick={() => setVisibleForm(true)}>编辑资料</Button>
            </div>

            <Modal
              open={visibleForm}
              title="编辑资料"
              onCancel={() => {
                if (formLoading) return
                setVisibleForm(false)
                setFormError(null)
              }}
              footer={
                <Space>
                  <Button
                    variant="secondary"
                    disabled={formLoading}
                    onClick={() => {
                      setVisibleForm(false)
                      setFormError(null)
                    }}>
                    取消
                  </Button>
                  <Button disabled={formLoading} onClick={handleFormSubmit}>
                    {formLoading ? '保存中…' : '保存'}
                  </Button>
                </Space>
              }>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">姓名</div>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">邮箱</div>
                  <Input
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <p className="text-xs text-gray-500">提示：这里仅做简单校验与异步保存模拟。</p>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </>
  )
}
