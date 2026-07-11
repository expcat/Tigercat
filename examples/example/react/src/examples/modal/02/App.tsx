import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Modal } from '@expcat/tigercat-react/Modal'

export default function App() {
  const [outerOpen, setOuterOpen] = useState(false)
  const [innerOpen, setInnerOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOuterOpen(true)}>打开父对话框</Button>
      <Modal
        open={outerOpen}
        onOpenChange={setOuterOpen}
        title="父对话框"
        footer={
          <Button variant="secondary" onClick={() => setOuterOpen(false)}>
            关闭
          </Button>
        }>
        <Button onClick={() => setInnerOpen(true)}>继续确认</Button>
        <Modal
          open={innerOpen}
          onOpenChange={setInnerOpen}
          title="嵌套确认"
          size="sm"
          zIndex={1100}
          showDefaultFooter>
          <p>嵌套 Modal 是双实例的唯一例外。</p>
        </Modal>
      </Modal>
    </>
  )
}
