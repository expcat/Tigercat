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
      <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button onClick={() => setVisibleNested(true)}>打开嵌套对话框</Button>
        <Modal open={visibleNested} title="第一层对话框" onCancel={() => setVisibleNested(false)}>
          <p>这是第一层对话框的内容。</p>
          <Button onClick={() => setVisibleNested2(true)} className="mt-4">
            打开第二层对话框
          </Button>

          <Modal
            open={visibleNested2}
            title="第二层对话框"
            zIndex={1100}
            onCancel={() => setVisibleNested2(false)}>
            <p>这是第二层嵌套的对话框。</p>
          </Modal>
        </Modal>
      </div>
    </>
  )
}
