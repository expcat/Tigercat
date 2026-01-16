import { useState } from 'react'
import { Modal, Button, Space, Input } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Button>打开对话框</Button>
<Modal visible={visible1} title="基本对话框">...</Modal>`

const sizeSnippet = `<Button>小尺寸</Button>
<Modal size="sm">...</Modal>
<Modal size="md">...</Modal>
<Modal size="lg">...</Modal>
<Modal size="xl">...</Modal>
<Modal size="full">...</Modal>`

const centeredSnippet = `<Modal centered title="垂直居中对话框">...</Modal>`

const customFooterSnippet = `<Modal
  title="自定义页脚对话框"
  footer={<Space>...</Space>}
>...</Modal>`

const nestedSnippet = `<Modal title="第一层对话框">
  <Modal title="第二层对话框" zIndex={1100}>...</Modal>
</Modal>`

const maskClosableSnippet = `<Modal maskClosable={false} title="禁用遮罩关闭">...</Modal>`

const noMaskSnippet = `<Modal mask={false} title="无遮罩对话框">...</Modal>`

const destroySnippet = `<Modal destroyOnClose title="关闭时销毁">...</Modal>`

const noCloseSnippet = `<Modal closable={false} title="无关闭按钮">...</Modal>`

const scenarioSnippet = `<Button variant="outline">删除确认</Button>
<Button>查看详情</Button>
<Button>编辑资料</Button>`

const infoParagraphs = Array.from({ length: 14 }).map((_, index) => (
  <p key={index} className={index === 0 ? '' : 'mt-2'}>
    这是一段用于演示滚动内容的示例文本（第 {index + 1} 段）。当内容较长时，Modal
    仍应保持良好的可读性与滚动体验。
  </p>
))

export default function ModalDemo() {
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
    <div className="max-w-5xl mx-auto p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Modal 对话框</h1>
        <p className="text-gray-600">用于显示重要信息或需要用户交互的浮层对话框。</p>
      </div>

      <DemoBlock
        title="基本用法"
        description="最简单的用法，点击按钮打开对话框。"
        code={basicSnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={() => setVisible1(true)}>打开对话框</Button>
          <Modal
            visible={visible1}
            title="基本对话框"
            onOk={handleOk}
            onCancel={handleCancel}
            footer={
              <Space>
                <Button variant="secondary" onClick={handleCancel}>
                  取消
                </Button>
                <Button onClick={handleOk}>确定</Button>
              </Space>
            }>
            <p>这是对话框的内容。</p>
            <p className="mt-2">您可以在这里添加任何内容。</p>
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="不同尺寸"
        description="Modal 提供了多种尺寸选项：sm、md（默认）、lg、xl、full。"
        code={sizeSnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Space>
            <Button onClick={() => setVisibleSm(true)}>小尺寸</Button>
            <Button onClick={() => setVisibleMd(true)}>中等尺寸</Button>
            <Button onClick={() => setVisibleLg(true)}>大尺寸</Button>
            <Button onClick={() => setVisibleXl(true)}>超大尺寸</Button>
            <Button onClick={() => setVisibleFull(true)}>全屏</Button>
          </Space>

          <Modal
            visible={visibleSm}
            title="小尺寸对话框"
            size="sm"
            onCancel={() => setVisibleSm(false)}>
            <p>这是一个小尺寸的对话框。</p>
          </Modal>
          <Modal
            visible={visibleMd}
            title="中等尺寸对话框"
            size="md"
            onCancel={() => setVisibleMd(false)}>
            <p>这是一个中等尺寸的对话框（默认）。</p>
          </Modal>
          <Modal
            visible={visibleLg}
            title="大尺寸对话框"
            size="lg"
            onCancel={() => setVisibleLg(false)}>
            <p>这是一个大尺寸的对话框，可以容纳更多内容。</p>
          </Modal>
          <Modal
            visible={visibleXl}
            title="超大尺寸对话框"
            size="xl"
            onCancel={() => setVisibleXl(false)}>
            <p>这是一个超大尺寸的对话框，适合复杂的内容展示。</p>
          </Modal>
          <Modal
            visible={visibleFull}
            title="全屏对话框"
            size="full"
            onCancel={() => setVisibleFull(false)}>
            <p>这是一个全屏对话框，占据整个屏幕宽度。</p>
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="居中显示"
        description="设置 centered 属性可以使 Modal 垂直居中显示。"
        code={centeredSnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={() => setVisibleCentered(true)}>打开居中对话框</Button>
          <Modal
            visible={visibleCentered}
            title="居中对话框"
            centered
            onCancel={() => setVisibleCentered(false)}>
            <p>这是一个垂直居中显示的对话框。</p>
            <p>默认情况下，Modal 会显示在距离顶部 10% 的位置。</p>
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义页脚"
        description="通过 footer 属性可以自定义 Modal 的页脚内容。"
        code={customFooterSnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={() => setVisibleCustomFooter(true)}>自定义页脚对话框</Button>
          <Modal
            visible={visibleCustomFooter}
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
      </DemoBlock>

      <DemoBlock
        title="嵌套对话框"
        description="对话框可以嵌套使用，通过 z-index 控制层级。"
        code={nestedSnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={() => setVisibleNested(true)}>打开嵌套对话框</Button>
          <Modal
            visible={visibleNested}
            title="第一层对话框"
            onCancel={() => setVisibleNested(false)}>
            <p>这是第一层对话框的内容。</p>
            <Button onClick={() => setVisibleNested2(true)} className="mt-4">
              打开第二层对话框
            </Button>

            <Modal
              visible={visibleNested2}
              title="第二层对话框"
              zIndex={1100}
              onCancel={() => setVisibleNested2(false)}>
              <p>这是第二层嵌套的对话框。</p>
            </Modal>
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="禁用遮罩关闭"
        description="设置 maskClosable 为 false 可以禁止点击遮罩层关闭对话框。"
        code={maskClosableSnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={() => setVisible2(true)}>禁用遮罩关闭</Button>
          <Modal
            visible={visible2}
            title="禁用遮罩关闭"
            maskClosable={false}
            onCancel={() => setVisible2(false)}>
            <p>点击遮罩层不会关闭此对话框。</p>
            <p className="mt-2">只能通过关闭按钮或页脚按钮关闭。</p>
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="无遮罩"
        description="设置 mask 为 false 可以不显示遮罩层。"
        code={noMaskSnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={() => setVisibleNoMask(true)}>无遮罩对话框</Button>
          <Modal
            visible={visibleNoMask}
            title="无遮罩对话框"
            mask={false}
            onCancel={() => setVisibleNoMask(false)}>
            <p>这个对话框没有遮罩层。</p>
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="关闭时销毁"
        description="设置 destroyOnClose 可以在关闭对话框时销毁其内容。"
        code={destroySnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={() => setVisibleDestroyOnClose(true)}>关闭时销毁</Button>
          <Modal
            visible={visibleDestroyOnClose}
            title="关闭时销毁"
            destroyOnClose
            onCancel={() => setVisibleDestroyOnClose(false)}>
            <p>关闭对话框时，此内容将被销毁。</p>
            <p className="mt-2">组件状态：{new Date().toLocaleTimeString()}</p>
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="无关闭按钮"
        description="设置 closable 为 false 可以隐藏关闭按钮。"
        code={noCloseSnippet}>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={() => setVisible3(true)}>无关闭按钮</Button>
          <Modal
            visible={visible3}
            title="无关闭按钮"
            closable={false}
            footer={<Button onClick={() => setVisible3(false)}>确定</Button>}
            onCancel={() => setVisible3(false)}>
            <p>这个对话框没有关闭按钮。</p>
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="实际应用场景"
        description="用更贴近业务的例子展示交互、滚动与表单。"
        code={scenarioSnippet}>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">确认对话框</h3>
            <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-gray-700">用于需要用户确认的操作（示例：删除）。</p>
                <Button variant="outline" onClick={() => setVisibleConfirm(true)}>
                  删除确认
                </Button>
              </div>
              {confirmResult && <p className="mt-3 text-sm text-green-700">{confirmResult}</p>}

              <Modal
                visible={visibleConfirm}
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
                <p className="mt-2 text-gray-600 text-sm">
                  提示：这里用按钮 loading 模拟异步提交。
                </p>
              </Modal>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">信息展示</h3>
            <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-gray-700">用于展示较长内容（用户协议/隐私政策等）。</p>
                <Button onClick={() => setVisibleInfo(true)}>查看详情</Button>
              </div>

              <Modal
                visible={visibleInfo}
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
                <p className="text-gray-700">在对话框中嵌入表单，用于数据收集和编辑。</p>
                <Button onClick={() => setVisibleForm(true)}>编辑资料</Button>
              </div>

              <Modal
                visible={visibleForm}
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
      </DemoBlock>
    </div>
  )
}
