import React, { useState } from 'react'
import { Drawer, Button, Space, Divider, type DrawerPlacement, type DrawerSize } from '@tigercat/react'

const DrawerDemo: React.FC = () => {
  // Basic drawer
  const [basicVisible, setBasicVisible] = useState(false)

  // Placement drawers
  const [placementVisible, setPlacementVisible] = useState(false)
  const [placement, setPlacement] = useState<DrawerPlacement>('right')

  const showPlacementDrawer = (pos: DrawerPlacement) => {
    setPlacement(pos)
    setPlacementVisible(true)
  }

  // Size drawers
  const [sizeVisible, setSizeVisible] = useState(false)
  const [size, setSize] = useState<DrawerSize>('md')

  const showSizeDrawer = (s: DrawerSize) => {
    setSize(s)
    setSizeVisible(true)
  }

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

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Drawer 抽屉</h1>
        <p className="text-gray-600">从页面边缘滑出的面板，用于展示详细信息或进行操作。</p>
      </div>

      {/* 基本使用 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本使用</h2>
        <p className="text-gray-600 mb-6">最基本的抽屉使用示例。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setBasicVisible(true)}>打开抽屉</Button>
          <Drawer visible={basicVisible} title="基本抽屉" onClose={() => setBasicVisible(false)}>
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
          通过 <code className="px-1 py-0.5 bg-gray-200 rounded">placement</code> 属性设置抽屉从不同方向弹出。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Button onClick={() => showPlacementDrawer('left')}>左侧</Button>
            <Button onClick={() => showPlacementDrawer('right')}>右侧</Button>
            <Button onClick={() => showPlacementDrawer('top')}>顶部</Button>
            <Button onClick={() => showPlacementDrawer('bottom')}>底部</Button>
          </Space>
          <Drawer
            visible={placementVisible}
            placement={placement}
            title={`${placement} 抽屉`}
            onClose={() => setPlacementVisible(false)}
          >
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
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Button onClick={() => showSizeDrawer('sm')}>Small</Button>
            <Button onClick={() => showSizeDrawer('md')}>Medium</Button>
            <Button onClick={() => showSizeDrawer('lg')}>Large</Button>
            <Button onClick={() => showSizeDrawer('xl')}>Extra Large</Button>
            <Button onClick={() => showSizeDrawer('full')}>Full</Button>
          </Space>
          <Drawer
            visible={sizeVisible}
            size={size}
            title="不同尺寸的抽屉"
            onClose={() => setSizeVisible(false)}
          >
            <p>尺寸: {size}</p>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义头部和底部 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义头部和底部</h2>
        <p className="text-gray-600 mb-6">使用 header 和 footer 属性自定义头部和底部内容。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setCustomVisible(true)}>打开自定义抽屉</Button>
          <Drawer
            visible={customVisible}
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span>
                <span>设置</span>
              </div>
            }
            footer={
              <Space>
                <Button onClick={() => setCustomVisible(false)}>取消</Button>
                <Button variant="primary" onClick={handleSubmit}>确定</Button>
              </Space>
            }
            onClose={() => setCustomVisible(false)}
          >
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
          设置 <code className="px-1 py-0.5 bg-gray-200 rounded">mask=false</code> 可以不显示遮罩层。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setNoMaskVisible(true)}>打开无蒙层抽屉</Button>
          <Drawer
            visible={noMaskVisible}
            mask={false}
            title="无蒙层抽屉"
            onClose={() => setNoMaskVisible(false)}
          >
            <p>这个抽屉没有蒙层</p>
            <p>你可以与页面其他部分交互</p>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 点击蒙层不关闭 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">点击蒙层不关闭</h2>
        <p className="text-gray-600 mb-6">
          设置 <code className="px-1 py-0.5 bg-gray-200 rounded">maskClosable=false</code> 可以禁止点击蒙层关闭抽屉。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setNotClosableVisible(true)}>打开抽屉</Button>
          <Drawer
            visible={notClosableVisible}
            maskClosable={false}
            title="点击蒙层不关闭"
            onClose={() => setNotClosableVisible(false)}
          >
            <p>点击蒙层或按 ESC 键无法关闭</p>
            <p>只能点击关闭按钮</p>
          </Drawer>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 关闭时销毁 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">关闭时销毁</h2>
        <p className="text-gray-600 mb-6">
          设置 <code className="px-1 py-0.5 bg-gray-200 rounded">destroyOnClose</code> 可以在关闭时销毁内容，适用于表单重置等场景。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={() => setDestroyVisible(true)}>打开抽屉</Button>
          <Drawer
            visible={destroyVisible}
            destroyOnClose={true}
            title="关闭时销毁内容"
            onClose={() => setDestroyVisible(false)}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入框（关闭后会重置）
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="尝试输入一些内容，然后关闭抽屉"
                />
              </div>
            </div>
          </Drawer>
        </div>
      </section>
    </div>
  )
}

export default DrawerDemo
