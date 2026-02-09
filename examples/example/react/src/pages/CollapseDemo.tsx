import { useState } from 'react'
import { Collapse, CollapsePanel } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Collapse activeKey={activeKey} onChange={setActiveKey}>
  <CollapsePanel panelKey="1" header="面板 1">内容 1</CollapsePanel>
  <CollapsePanel panelKey="2" header="面板 2">内容 2</CollapsePanel>
</Collapse>`

const accordionSnippet = `<Collapse accordion activeKey={activeKey} onChange={setActiveKey}>
  <CollapsePanel panelKey="1" header="面板 1">内容 1</CollapsePanel>
  <CollapsePanel panelKey="2" header="面板 2">内容 2</CollapsePanel>
</Collapse>`

const borderlessSnippet = `<Collapse bordered={false}>
  <CollapsePanel panelKey="1" header="无边框面板 1">内容 1</CollapsePanel>
  <CollapsePanel panelKey="2" header="无边框面板 2">内容 2</CollapsePanel>
</Collapse>`

const ghostSnippet = `<Collapse ghost>
  <CollapsePanel panelKey="1" header="透明背景面板 1">内容 1</CollapsePanel>
  <CollapsePanel panelKey="2" header="透明背景面板 2">内容 2</CollapsePanel>
</Collapse>`

const iconPositionSnippet = `<Collapse expandIconPosition="end">
  <CollapsePanel panelKey="1" header="箭头在右侧">内容</CollapsePanel>
</Collapse>`

const disabledSnippet = `<Collapse>
  <CollapsePanel panelKey="1" header="正常面板">可展开</CollapsePanel>
  <CollapsePanel panelKey="2" header="禁用面板" disabled>不可展开</CollapsePanel>
</Collapse>`

const nestedSnippet = `<Collapse>
  <CollapsePanel panelKey="1" header="外层面板">
    <Collapse>
      <CollapsePanel panelKey="1-1" header="嵌套面板 1">嵌套内容 1</CollapsePanel>
      <CollapsePanel panelKey="1-2" header="嵌套面板 2">嵌套内容 2</CollapsePanel>
    </Collapse>
  </CollapsePanel>
</Collapse>`

const customHeaderSnippet = `<Collapse>
  <CollapsePanel
    panelKey="1"
    header={<span className="font-bold text-blue-600">🎨 自定义标题</span>}
    extra={<span className="text-xs text-gray-400">额外内容</span>}>
    面板内容
  </CollapsePanel>
</Collapse>`

const hideArrowSnippet = `<Collapse>
  <CollapsePanel panelKey="1" header="无箭头面板" showArrow={false}>
    不显示展开/收起箭头图标
  </CollapsePanel>
</Collapse>`

export default function CollapseDemo() {
  const [activeKey1, setActiveKey1] = useState<string[]>(['1'])
  const [activeKey2, setActiveKey2] = useState<string | undefined>('1')
  const [activeKey3, setActiveKey3] = useState<string[]>([])
  const [activeKey4, setActiveKey4] = useState<string[]>([])
  const [activeKey5, setActiveKey5] = useState<string[]>([])
  const [activeKey6, setActiveKey6] = useState<string[]>([])
  const [activeKey7, setActiveKey7] = useState<string[]>(['1'])
  const [activeKey8, setActiveKey8] = useState<string[]>([])
  const [activeKey9, setActiveKey9] = useState<string[]>([])

  const toStringArray = (value: string | number | (string | number)[] | undefined) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item))
    }

    if (value === undefined) {
      return []
    }

    return [String(value)]
  }

  const toStringValue = (value: string | number | (string | number)[] | undefined) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0]) : undefined
    }

    if (value === undefined) {
      return undefined
    }

    return String(value)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Collapse 折叠面板</h1>
        <p className="text-gray-600">可以折叠/展开的内容区域，用于将复杂的区域折叠起来。</p>
      </div>

      <DemoBlock title="基本用法" description="可以同时展开多个面板。" code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Collapse
            activeKey={activeKey1}
            onChange={(value) => setActiveKey1(toStringArray(value))}>
            <CollapsePanel panelKey="1" header="面板标题 1">
              <p>这是面板 1 的内容。可以包含任意 HTML 元素。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="2" header="面板标题 2">
              <p>这是面板 2 的内容。折叠面板适合用于展示大量信息。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="3" header="面板标题 3">
              <p>这是面板 3 的内容。每个面板可以独立展开或折叠。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>

      <DemoBlock title="手风琴模式" description="每次只能展开一个面板。" code={accordionSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Collapse
            accordion
            activeKey={activeKey2}
            onChange={(value) => setActiveKey2(toStringValue(value))}>
            <CollapsePanel panelKey="1" header="手风琴面板 1">
              <p>手风琴模式下，展开一个面板会自动收起其他面板。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="2" header="手风琴面板 2">
              <p>适合用于 FAQ 或者步骤指南等场景。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="3" header="手风琴面板 3">
              <p>点击其他面板时，当前面板会自动收起。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>

      <DemoBlock title="无边框" description="简洁的无边框样式。" code={borderlessSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Collapse
            bordered={false}
            activeKey={activeKey3}
            onChange={(value) => setActiveKey3(toStringArray(value))}>
            <CollapsePanel panelKey="1" header="无边框面板 1">
              <p>这是无边框面板的内容。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="2" header="无边框面板 2">
              <p>外观更加简洁。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>

      <DemoBlock title="透明背景" description="背景透明的 Ghost 模式。" code={ghostSnippet}>
        <div className="p-6 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg">
          <Collapse
            ghost
            activeKey={activeKey4}
            onChange={(value) => setActiveKey4(toStringArray(value))}>
            <CollapsePanel panelKey="1" header="Ghost 面板 1">
              <p>Ghost 模式的面板没有背景色，适合放在有背景的容器中。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="2" header="Ghost 面板 2">
              <p>可以更好地融入页面设计。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>

      <DemoBlock title="图标位置" description="可以将展开图标放在右侧。" code={iconPositionSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Collapse
            expandIconPosition="end"
            activeKey={activeKey5}
            onChange={(value) => setActiveKey5(toStringArray(value))}>
            <CollapsePanel panelKey="1" header="箭头在右侧">
              <p>展开图标位于面板标题的右侧。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="2" header="另一个面板">
              <p>所有面板的图标位置保持一致。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>

      <DemoBlock title="禁用面板" description="可以禁用某个面板。" code={disabledSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Collapse
            activeKey={activeKey6}
            onChange={(value) => setActiveKey6(toStringArray(value))}>
            <CollapsePanel panelKey="1" header="正常面板">
              <p>这个面板可以正常展开和折叠。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="2" header="禁用面板" disabled>
              <p>这个面板被禁用，无法展开。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="3" header="另一个正常面板">
              <p>这个面板也可以正常使用。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>

      <DemoBlock title="嵌套面板" description="折叠面板可以嵌套使用。" code={nestedSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Collapse
            activeKey={activeKey7}
            onChange={(value) => setActiveKey7(toStringArray(value))}>
            <CollapsePanel panelKey="1" header="外层面板 1">
              <Collapse>
                <CollapsePanel panelKey="1-1" header="嵌套面板 1-1">
                  <p>这是嵌套的内容。</p>
                </CollapsePanel>
                <CollapsePanel panelKey="1-2" header="嵌套面板 1-2">
                  <p>嵌套面板可以有自己独立的状态。</p>
                </CollapsePanel>
              </Collapse>
            </CollapsePanel>
            <CollapsePanel panelKey="2" header="外层面板 2">
              <p>普通面板内容。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>

      <DemoBlock title="自定义标题与额外内容" description="通过 props 自定义面板标题和右侧额外内容。" code={customHeaderSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Collapse
            activeKey={activeKey8}
            onChange={(value) => setActiveKey8(toStringArray(value))}>
            <CollapsePanel
              panelKey="1"
              header={<span className="font-bold text-blue-600">🎨 自定义标题</span>}
              extra={<span className="text-xs text-gray-400">额外内容</span>}>
              <p>使用 ReactNode 可以完全自定义面板标题和右侧额外内容。</p>
            </CollapsePanel>
            <CollapsePanel
              panelKey="2"
              header={<span className="font-bold text-green-600">📝 另一个自定义标题</span>}>
              <p>每个面板都可以有不同的自定义标题样式。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>

      <DemoBlock title="隐藏箭头" description="通过 showArrow 属性隐藏展开/收起箭头图标。" code={hideArrowSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Collapse
            activeKey={activeKey9}
            onChange={(value) => setActiveKey9(toStringArray(value))}>
            <CollapsePanel panelKey="1" header="无箭头面板 1" showArrow={false}>
              <p>不显示展开/收起箭头图标。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="2" header="无箭头面板 2" showArrow={false}>
              <p>所有面板都隐藏了箭头。</p>
            </CollapsePanel>
          </Collapse>
        </div>
      </DemoBlock>
    </div>
  )
}
