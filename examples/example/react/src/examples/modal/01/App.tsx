import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Modal } from '@expcat/tigercat-react/Modal'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>打开对话框</Button>
      <Modal open={open} onOpenChange={setOpen} title="基本对话框">
        <p>受控打开。默认没有居中、没有默认页脚。</p>
      </Modal>
    </>
  )
}
