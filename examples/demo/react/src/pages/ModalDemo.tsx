import { useState } from 'react'
import { Modal, Button, Space, Divider } from '@tigercat/react'

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

  const handleOk = () => {
    console.log('OK clicked')
    setVisible1(false)
  }

  const handleCancel = () => {
    console.log('Cancel clicked')
    setVisible1(false)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Modal 对话框</h1>
        <p className="text-gray-600">用于显示重要信息或需要用户交互的浮层对话框。</p>
      </div>

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">最简单的用法，点击按钮打开对话框。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setVisible1(true)}>打开对话框</Button>
          <Modal
            visible={visible1}
            title="基本对话框"
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <p>这是对话框的内容。</p>
            <p className="mt-2">您可以在这里添加任何内容。</p>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">Modal 提供了多种尺寸选项：sm、md（默认）、lg、xl、full。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Button onClick={() => setVisibleSm(true)}>小尺寸</Button>
            <Button onClick={() => setVisibleMd(true)}>中等尺寸</Button>
            <Button onClick={() => setVisibleLg(true)}>大尺寸</Button>
            <Button onClick={() => setVisibleXl(true)}>超大尺寸</Button>
            <Button onClick={() => setVisibleFull(true)}>全屏</Button>
          </Space>
          
          <Modal visible={visibleSm} title="小尺寸对话框" size="sm" onCancel={() => setVisibleSm(false)}>
            <p>这是一个小尺寸的对话框。</p>
          </Modal>
          <Modal visible={visibleMd} title="中等尺寸对话框" size="md" onCancel={() => setVisibleMd(false)}>
            <p>这是一个中等尺寸的对话框（默认）。</p>
          </Modal>
          <Modal visible={visibleLg} title="大尺寸对话框" size="lg" onCancel={() => setVisibleLg(false)}>
            <p>这是一个大尺寸的对话框，可以容纳更多内容。</p>
          </Modal>
          <Modal visible={visibleXl} title="超大尺寸对话框" size="xl" onCancel={() => setVisibleXl(false)}>
            <p>这是一个超大尺寸的对话框，适合复杂的内容展示。</p>
          </Modal>
          <Modal visible={visibleFull} title="全屏对话框" size="full" onCancel={() => setVisibleFull(false)}>
            <p>这是一个全屏对话框，占据整个屏幕宽度。</p>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 垂直居中 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">垂直居中</h2>
        <p className="text-gray-600 mb-6">设置 centered 属性可以让对话框垂直居中显示。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setVisibleCentered(true)}>垂直居中对话框</Button>
          <Modal
            visible={visibleCentered}
            title="垂直居中对话框"
            centered
            onCancel={() => setVisibleCentered(false)}
          >
            <p>这个对话框垂直居中显示。</p>
            <p className="mt-2">适合展示重要信息。</p>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义页脚 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义页脚</h2>
        <p className="text-gray-600 mb-6">使用 footer 属性可以自定义页脚内容。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setVisibleCustomFooter(true)}>自定义页脚</Button>
          <Modal
            visible={visibleCustomFooter}
            title="自定义页脚对话框"
            footer={
              <Space>
                <Button variant="secondary" onClick={() => setVisibleCustomFooter(false)}>取消</Button>
                <Button variant="outline" onClick={() => console.log('保存草稿')}>保存草稿</Button>
                <Button onClick={() => setVisibleCustomFooter(false)}>提交</Button>
              </Space>
            }
            onCancel={() => setVisibleCustomFooter(false)}
          >
            <p>这是对话框的内容。</p>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 嵌套对话框 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">嵌套对话框</h2>
        <p className="text-gray-600 mb-6">对话框可以嵌套使用，通过 z-index 控制层级。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setVisibleNested(true)}>打开嵌套对话框</Button>
          <Modal
            visible={visibleNested}
            title="第一层对话框"
            onCancel={() => setVisibleNested(false)}
          >
            <p>这是第一层对话框的内容。</p>
            <Button onClick={() => setVisibleNested2(true)} className="mt-4">打开第二层对话框</Button>
            
            <Modal
              visible={visibleNested2}
              title="第二层对话框"
              zIndex={1100}
              onCancel={() => setVisibleNested2(false)}
            >
              <p>这是第二层嵌套的对话框。</p>
            </Modal>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用遮罩关闭 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用遮罩关闭</h2>
        <p className="text-gray-600 mb-6">设置 maskClosable 为 false 可以禁止点击遮罩层关闭对话框。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setVisible2(true)}>禁用遮罩关闭</Button>
          <Modal
            visible={visible2}
            title="禁用遮罩关闭"
            maskClosable={false}
            onCancel={() => setVisible2(false)}
          >
            <p>点击遮罩层不会关闭此对话框。</p>
            <p className="mt-2">只能通过关闭按钮或页脚按钮关闭。</p>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 无遮罩 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">无遮罩</h2>
        <p className="text-gray-600 mb-6">设置 mask 为 false 可以不显示遮罩层。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setVisibleNoMask(true)}>无遮罩对话框</Button>
          <Modal
            visible={visibleNoMask}
            title="无遮罩对话框"
            mask={false}
            onCancel={() => setVisibleNoMask(false)}
          >
            <p>这个对话框没有遮罩层。</p>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 关闭时销毁 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">关闭时销毁</h2>
        <p className="text-gray-600 mb-6">设置 destroyOnClose 可以在关闭对话框时销毁其内容。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setVisibleDestroyOnClose(true)}>关闭时销毁</Button>
          <Modal
            visible={visibleDestroyOnClose}
            title="关闭时销毁"
            destroyOnClose
            onCancel={() => setVisibleDestroyOnClose(false)}
          >
            <p>关闭对话框时，此内容将被销毁。</p>
            <p className="mt-2">组件状态：{new Date().toLocaleTimeString()}</p>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 无关闭按钮 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">无关闭按钮</h2>
        <p className="text-gray-600 mb-6">设置 closable 为 false 可以隐藏关闭按钮。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setVisible3(true)}>无关闭按钮</Button>
          <Modal
            visible={visible3}
            title="无关闭按钮"
            closable={false}
            footer={
              <Button onClick={() => setVisible3(false)}>确定</Button>
            }
            onCancel={() => setVisible3(false)}
          >
            <p>这个对话框没有关闭按钮。</p>
          </Modal>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 实际应用场景 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">实际应用场景</h2>
        <p className="text-gray-600 mb-6">模拟真实的使用场景。</p>
        
        <div className="space-y-6">
          {/* 确认对话框 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">确认对话框</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <p>用于需要用户确认的操作，如删除、提交等。</p>
            </div>
          </div>

          {/* 信息展示 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">信息展示</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <p>对话框可以用于展示详细信息、用户协议、隐私政策等。</p>
            </div>
          </div>

          {/* 表单输入 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">表单输入</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <p>在对话框中嵌入表单，用于数据收集和编辑。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
