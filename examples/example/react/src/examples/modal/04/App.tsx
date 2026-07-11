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
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用遮罩关闭</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button onClick={() => setVisible2(true)}>禁用遮罩关闭</Button>
            <Modal
              open={visible2}
              title="禁用遮罩关闭"
              maskClosable={false}
              onCancel={() => setVisible2(false)}>
              <p>点击遮罩层不会关闭此对话框。</p>
              <p className="mt-2">只能通过关闭按钮或页脚按钮关闭。</p>
            </Modal>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">无遮罩</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button onClick={() => setVisibleNoMask(true)}>无遮罩对话框</Button>
            <Modal
              open={visibleNoMask}
              title="无遮罩对话框"
              mask={false}
              onCancel={() => setVisibleNoMask(false)}>
              <p>这个对话框没有遮罩层。</p>
            </Modal>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">关闭时销毁</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button onClick={() => setVisibleDestroyOnClose(true)}>关闭时销毁</Button>
            <Modal
              open={visibleDestroyOnClose}
              title="关闭时销毁"
              destroyOnClose
              onCancel={() => setVisibleDestroyOnClose(false)}>
              <p>关闭对话框时，此内容将被销毁。</p>
              <p className="mt-2">组件状态：{new Date().toLocaleTimeString()}</p>
            </Modal>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">无关闭按钮</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button onClick={() => setVisible3(true)}>无关闭按钮</Button>
            <Modal
              open={visible3}
              title="无关闭按钮"
              closable={false}
              footer={<Button onClick={() => setVisible3(false)}>确定</Button>}
              onCancel={() => setVisible3(false)}>
              <p>这个对话框没有关闭按钮。</p>
            </Modal>
          </div>
        </div>
      </div>
    </>
  )
}
