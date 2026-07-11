import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Modal } from '@expcat/tigercat-react/Modal'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>打开对话框</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="基本对话框"
        size="md"
        centered
        showDefaultFooter
        okText="知道了">
        <p>一个受控实例复合展示尺寸、居中、遮罩和默认页脚。</p>
      </Modal>
    </>
  )
}
