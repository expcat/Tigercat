import React, { useState } from 'react'
import {
  Drawer,
  Button,
  Space,
  Divider,
  type DrawerPlacement,
  type DrawerSize
} from '@expcat/tigercat-react'

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

const DrawerDemo: React.FC = () => {
  // Basic drawer
  const [basicVisible, setBasicVisible] = useState(false)

  // Placement drawers
  const [placementVisible, setPlacementVisible] = useState(false)
  const [placement, setPlacement] = useState<DrawerPlacement>('right')

  // Size drawers
  const [sizeVisible, setSizeVisible] = useState(false)
  const [size, setSize] = useState<DrawerSize>('md')

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

  // Destroy on close
  const [destroyVisible, setDestroyVisible] = useState(false)

  const closeAll = () => {
    setBasicVisible(false)
    setPlacementVisible(false)
    setSizeVisible(false)
    setCustomVisible(false)
    setNoMaskVisible(false)
    setNotClosableVisible(false)
    setDestroyVisible(false)
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

  const openDestroy = () => {
    closeAll()
    setDestroyVisible(true)
  }

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Drawer 抽屉</h1>
        <p className="text-gray-600">从页面边缘滑出的面板，用于展示详细信息或进行操作。</p>
      </div>

      {/* 基本使用 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本使用</h2>
        <p className="text-gray-600 mb-6">最基本的抽屉使用示例。</p>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={openBasic}>打开抽屉</Button>
          <Drawer
            visible={basicVisible}
            title="基本抽屉"
            footer={getCloseFooter(() => setBasicVisible(false))}
            onClose={() => setBasicVisible(false)}>
            <p>这是抽屉的内容</p>
            <p>你可以在这里放置任何内容</p>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同位置 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同位置</h2>
        <p className="text-gray-600 mb-6">
          通过 <code className="px-1 py-0.5 bg-gray-200 rounded">placement</code>{' '}
          属性设置抽屉从不同方向弹出。
        </p>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Space>
            <Button
              variant={placement === 'left' ? 'primary' : 'secondary'}
              onClick={() => showPlacementDrawer('left')}>
              左侧
            </Button>
            <Button
              variant={placement === 'right' ? 'primary' : 'secondary'}
              onClick={() => showPlacementDrawer('right')}>
              右侧
            </Button>
            <Button
              variant={placement === 'top' ? 'primary' : 'secondary'}
              onClick={() => showPlacementDrawer('top')}>
              顶部
            </Button>
            <Button
              variant={placement === 'bottom' ? 'primary' : 'secondary'}
              onClick={() => showPlacementDrawer('bottom')}>
              底部
            </Button>
          </Space>
          <Drawer
            visible={placementVisible}
            placement={placement}
            title={`${placement} 抽屉`}
            footer={getCloseFooter(() => setPlacementVisible(false))}
            onClose={() => setPlacementVisible(false)}>
            <p>从 {placement} 弹出的抽屉</p>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">
          通过 <code className="px-1 py-0.5 bg-gray-200 rounded">size</code> 属性设置抽屉的大小。
        </p>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Space>
            <Button
              variant={size === 'sm' ? 'primary' : 'secondary'}
              onClick={() => showSizeDrawer('sm')}>
              小 (sm)
            </Button>
            <Button
              variant={size === 'md' ? 'primary' : 'secondary'}
              onClick={() => showSizeDrawer('md')}>
              中 (md)
            </Button>
            <Button
              variant={size === 'lg' ? 'primary' : 'secondary'}
              onClick={() => showSizeDrawer('lg')}>
              大 (lg)
            </Button>
            <Button
              variant={size === 'xl' ? 'primary' : 'secondary'}
              onClick={() => showSizeDrawer('xl')}>
              超大 (xl)
            </Button>
            <Button
              variant={size === 'full' ? 'primary' : 'secondary'}
              onClick={() => showSizeDrawer('full')}>
              全屏 (full)
            </Button>
          </Space>
          <Drawer
            visible={sizeVisible}
            size={size}
            title="不同尺寸的抽屉"
            footer={getCloseFooter(() => setSizeVisible(false))}
            onClose={() => setSizeVisible(false)}>
            <p>尺寸: {size}</p>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义头部和底部 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义头部和底部</h2>
        <p className="text-gray-600 mb-6">使用 header 和 footer 属性自定义头部和底部内容。</p>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={openCustom}>打开自定义抽屉</Button>
          <Drawer
            visible={customVisible}
            header={
              <div className="flex items-center gap-2">
                <span>⚙️</span>
                <span>设置</span>
              </div>
            }
            footer={
              <Space>
                <Button onClick={() => setCustomVisible(false)}>取消</Button>
                <Button variant="primary" onClick={handleSubmit}>
                  确定
                </Button>
              </Space>
            }
            onClose={() => setCustomVisible(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选项 1</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="输入内容"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选项 2</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="输入内容"
                />
              </div>
            </div>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 无蒙层 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">无蒙层</h2>
        <p className="text-gray-600 mb-6">
          设置 <code className="px-1 py-0.5 bg-gray-200 rounded">mask=false</code>{' '}
          可以不显示遮罩层。
        </p>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={openNoMask}>打开无蒙层抽屉</Button>
          <Drawer
            visible={noMaskVisible}
            mask={false}
            title="无蒙层抽屉"
            footer={getCloseFooter(() => setNoMaskVisible(false))}
            onClose={() => setNoMaskVisible(false)}>
            <p>这个抽屉没有蒙层</p>
            <p>你可以与页面其他部分交互</p>
            <p className="mt-2 text-sm text-gray-500">建议仍保留明确的关闭入口（关闭按钮/ESC）。</p>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 点击蒙层不关闭 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">点击蒙层不关闭</h2>
        <p className="text-gray-600 mb-6">
          设置 <code className="px-1 py-0.5 bg-gray-200 rounded">maskClosable=false</code>{' '}
          可以禁止点击蒙层关闭抽屉。
        </p>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={openNotClosable}>打开抽屉</Button>
          <Drawer
            visible={notClosableVisible}
            maskClosable={false}
            title="点击蒙层不关闭"
            footer={getCloseFooter(() => setNotClosableVisible(false))}
            onClose={() => setNotClosableVisible(false)}>
            <p>点击蒙层不会关闭</p>
            <p className="mt-2">仍可使用关闭按钮或按 ESC 关闭</p>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 关闭时销毁 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">关闭时销毁</h2>
        <p className="text-gray-600 mb-6">
          设置 <code className="px-1 py-0.5 bg-gray-200 rounded">destroyOnClose</code>{' '}
          可以在关闭时销毁内容，适用于表单重置等场景。
        </p>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button onClick={openDestroy}>打开抽屉</Button>
          <Drawer
            visible={destroyVisible}
            destroyOnClose={true}
            title="关闭时销毁内容"
            footer={getCloseFooter(() => setDestroyVisible(false))}
            onClose={() => setDestroyVisible(false)}>
            <DestroyOnCloseContent />
          </Drawer>
        </div>
      </section>
    </div>
  )
}

export default DrawerDemo
