import { useState } from 'react'
import { Dropdown, DropdownMenu, DropdownItem, Button, Divider } from '@tigercat/react'

export default function DropdownDemo() {
  const [visible1, setVisible1] = useState(false)

  const handleCommand = (command: string) => {
    console.log('点击了：', command)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dropdown 下拉菜单</h1>
        <p className="text-gray-600">向下弹出的列表菜单。</p>
      </div>

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">悬停在触发元素上时显示下拉菜单。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Dropdown>
            <Button>悬浮触发</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 触发方式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">触发方式</h2>
        <p className="text-gray-600 mb-6">支持点击和悬浮两种触发方式。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex gap-4">
            <Dropdown trigger="hover">
              <Button>悬浮触发</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown trigger="click">
              <Button>点击触发</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 弹出位置 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">弹出位置</h2>
        <p className="text-gray-600 mb-6">支持 12 种弹出位置。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Dropdown placement="bottom-start">
                <Button>底部-左对齐</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="bottom">
                <Button>底部-居中</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="bottom-end">
                <Button>底部-右对齐</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="flex gap-4">
              <Dropdown placement="top-start">
                <Button>顶部-左对齐</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="top">
                <Button>顶部-居中</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="top-end">
                <Button>顶部-右对齐</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">禁用整个下拉菜单或单个菜单项。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex gap-4">
            <Dropdown disabled>
              <Button disabled>禁用的下拉菜单</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <Button>部分禁用</Button>
              <DropdownMenu>
                <DropdownItem>编辑</DropdownItem>
                <DropdownItem disabled>删除（已禁用）</DropdownItem>
                <DropdownItem>复制</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 分割线 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">分割线</h2>
        <p className="text-gray-600 mb-6">使用 divided 属性在菜单项之间添加分割线。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Dropdown>
            <Button>操作菜单</Button>
            <DropdownMenu>
              <DropdownItem>编辑</DropdownItem>
              <DropdownItem>复制</DropdownItem>
              <DropdownItem divided>删除</DropdownItem>
              <DropdownItem>下载</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 点击事件 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">点击事件</h2>
        <p className="text-gray-600 mb-6">监听菜单项的点击事件（查看控制台）。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Dropdown>
            <Button>操作</Button>
            <DropdownMenu>
              <DropdownItem onClick={() => handleCommand('edit')}>编辑</DropdownItem>
              <DropdownItem onClick={() => handleCommand('copy')}>复制</DropdownItem>
              <DropdownItem onClick={() => handleCommand('delete')} divided>删除</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 受控模式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">受控模式</h2>
        <p className="text-gray-600 mb-6">通过 visible 和 onVisibleChange 控制下拉菜单的显示隐藏。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex gap-4 items-center">
            <Dropdown visible={visible1} onVisibleChange={setVisible1}>
              <Button>受控下拉菜单</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button onClick={() => setVisible1(!visible1)}>
              {visible1 ? '关闭' : '打开'}下拉菜单
            </Button>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 多种按钮 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">多种按钮样式</h2>
        <p className="text-gray-600 mb-6">下拉菜单可以搭配不同样式的按钮使用。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex gap-4">
            <Dropdown>
              <Button variant="primary">主要按钮</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <Button variant="secondary">次要按钮</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <Button variant="outline">轮廓按钮</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </section>
    </div>
  )
}
