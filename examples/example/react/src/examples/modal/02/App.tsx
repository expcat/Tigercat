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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">不同尺寸</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Space>
              <Button onClick={() => setVisibleSm(true)}>小尺寸</Button>
              <Button onClick={() => setVisibleMd(true)}>中等尺寸</Button>
              <Button onClick={() => setVisibleLg(true)}>大尺寸</Button>
              <Button onClick={() => setVisibleXl(true)}>超大尺寸</Button>
              <Button onClick={() => setVisibleFull(true)}>全屏</Button>
            </Space>

            <Modal
              open={visibleSm}
              title="小尺寸对话框"
              size="sm"
              onCancel={() => setVisibleSm(false)}>
              <p>这是一个小尺寸的对话框。</p>
            </Modal>
            <Modal
              open={visibleMd}
              title="中等尺寸对话框"
              size="md"
              onCancel={() => setVisibleMd(false)}>
              <p>这是一个中等尺寸的对话框（默认）。</p>
            </Modal>
            <Modal
              open={visibleLg}
              title="大尺寸对话框"
              size="lg"
              onCancel={() => setVisibleLg(false)}>
              <p>这是一个大尺寸的对话框，可以容纳更多内容。</p>
            </Modal>
            <Modal
              open={visibleXl}
              title="超大尺寸对话框"
              size="xl"
              onCancel={() => setVisibleXl(false)}>
              <p>这是一个超大尺寸的对话框，适合复杂的内容展示。</p>
            </Modal>
            <Modal
              open={visibleFull}
              title="全屏对话框"
              size="full"
              onCancel={() => setVisibleFull(false)}>
              <p>这是一个全屏对话框，占据整个屏幕宽度。</p>
            </Modal>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">居中显示</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button onClick={() => setVisibleCentered(true)}>打开居中对话框</Button>
            <Modal
              open={visibleCentered}
              title="居中对话框"
              centered
              onCancel={() => setVisibleCentered(false)}>
              <p>这是一个垂直居中显示的对话框。</p>
              <p>默认情况下，Modal 会显示在距离顶部 10% 的位置。</p>
            </Modal>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义页脚</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button onClick={() => setVisibleCustomFooter(true)}>自定义页脚对话框</Button>
            <Modal
              open={visibleCustomFooter}
              title="自定义页脚对话框"
              footer={
                <Space>
                  <Button variant="secondary" onClick={() => setVisibleCustomFooter(false)}>
                    取消
                  </Button>
                  <Button onClick={() => setVisibleCustomFooter(false)}>提交</Button>
                </Space>
              }
              onCancel={() => setVisibleCustomFooter(false)}>
              <p>这是对话框的内容。</p>
            </Modal>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">默认页脚</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button onClick={() => setVisibleDefaultFooter(true)}>默认页脚对话框</Button>
            <Modal
              open={visibleDefaultFooter}
              title="默认页脚对话框"
              showDefaultFooter
              onOk={() => {
                console.log('OK clicked')
                setVisibleDefaultFooter(false)
              }}
              onCancel={() => setVisibleDefaultFooter(false)}>
              <p>这个对话框使用内置的默认页脚按钮。</p>
            </Modal>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            自定义文案 (labels)
          </h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button onClick={() => setVisibleLabels(true)}>自定义文案对话框</Button>
            <Modal
              open={visibleLabels}
              title="自定义文案"
              showDefaultFooter
              labels={{ okText: '提交', cancelText: '关闭', closeAriaLabel: '关闭对话框' }}
              onOk={() => setVisibleLabels(false)}
              onCancel={() => setVisibleLabels(false)}>
              <p>页脚按钮与右上角关闭按钮的文案均由 labels 提供。</p>
            </Modal>
          </div>
        </div>
      </div>
    </>
  )
}
