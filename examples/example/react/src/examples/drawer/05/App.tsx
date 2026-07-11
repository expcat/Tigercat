import React, { useState } from 'react'
import { Drawer } from '@expcat/tigercat-react/Drawer'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { type DrawerPlacement, type DrawerSize } from '@expcat/tigercat-react'

const DestroyOnCloseContent: React.FC = () => {
  const [value, setValue] = useState('')
  const [count, setCount] = useState(0)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">这个区域的内部状态会在关闭后重置（示例计数：{count}）</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          输入框（关闭后会重置）
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="尝试输入一些内容，然后关闭抽屉"
        />
      </div>
      <Space>
        <Button variant="secondary" onClick={() => setCount((c) => c + 1)}>
          计数 +1
        </Button>
        <Button variant="secondary" onClick={() => setValue('')}>
          清空输入
        </Button>
      </Space>
    </div>
  )
}

const getCloseFooter = (onClose: () => void, primaryAction?: React.ReactNode) => {
  return (
    <Space>
      <Button variant="secondary" onClick={onClose}>
        关闭
      </Button>
      {primaryAction}
    </Space>
  )
}

export default function App() {
  // Basic drawer
  const [basicVisible, setBasicVisible] = useState(false)

  // Placement drawers
  const [placementVisible, setPlacementVisible] = useState(false)

  const [placement, setPlacement] = useState<DrawerPlacement>('right')

  // Size drawers
  const [sizeVisible, setSizeVisible] = useState(false)

  const [size, setSize] = useState<DrawerSize>('md')

  const [customPaddingVisible, setCustomPaddingVisible] = useState(false)

  // Custom content drawer
  const [customVisible, setCustomVisible] = useState(false)

  const handleSubmit = () => {
    console.log('提交')
    setCustomVisible(false)
  }

  // No mask drawer
  const [noMaskVisible, setNoMaskVisible] = useState(false)

  // Not closable by mask
  const [notClosableVisible, setNotClosableVisible] = useState(false)

  // No close button
  const [noCloseButtonVisible, setNoCloseButtonVisible] = useState(false)

  // Destroy on close
  const [destroyVisible, setDestroyVisible] = useState(false)

  // Custom text via labels (no i18n)
  const [labelsVisible, setLabelsVisible] = useState(false)

  const closeAll = () => {
    setBasicVisible(false)
    setPlacementVisible(false)
    setSizeVisible(false)
    setCustomPaddingVisible(false)
    setCustomVisible(false)
    setNoMaskVisible(false)
    setNotClosableVisible(false)
    setNoCloseButtonVisible(false)
    setDestroyVisible(false)
    setLabelsVisible(false)
  }

  const openBasic = () => {
    closeAll()
    setBasicVisible(true)
  }

  const showPlacementDrawer = (pos: DrawerPlacement) => {
    closeAll()
    setPlacement(pos)
    setPlacementVisible(true)
  }

  const showSizeDrawer = (s: DrawerSize) => {
    closeAll()
    setSize(s)
    setSizeVisible(true)
  }

  const showCustomPaddingDrawer = () => {
    closeAll()
    setCustomPaddingVisible(true)
  }

  const openCustom = () => {
    closeAll()
    setCustomVisible(true)
  }

  const openNoMask = () => {
    closeAll()
    setNoMaskVisible(true)
  }

  const openNotClosable = () => {
    closeAll()
    setNotClosableVisible(true)
  }

  const openNoCloseButton = () => {
    closeAll()
    setNoCloseButtonVisible(true)
  }

  const openDestroy = () => {
    closeAll()
    setDestroyVisible(true)
  }

  const openLabels = () => {
    closeAll()
    setLabelsVisible(true)
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Button onClick={openNotClosable}>打开抽屉</Button>
        <Drawer
          open={notClosableVisible}
          maskClosable={false}
          title="点击蒙层不关闭"
          footer={getCloseFooter(() => setNotClosableVisible(false))}
          onClose={() => setNotClosableVisible(false)}>
          <p>点击蒙层不会关闭</p>
          <p className="mt-2">仍可使用关闭按钮或按 ESC 关闭</p>
        </Drawer>
      </div>
    </>
  )
}
