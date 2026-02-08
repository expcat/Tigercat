import React from 'react'
import { Divider } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<div className="text-gray-700">上方内容</div>
<Divider />
<div className="text-gray-700">下方内容</div>`

const lineStyleSnippet = `<Divider lineStyle="solid" />
<Divider lineStyle="dashed" />
<Divider lineStyle="dotted" />`

const spacingSnippet = `<Divider spacing="none" />
<Divider spacing="xs" />
<Divider spacing="sm" />
<Divider spacing="md" />
<Divider spacing="lg" />
<Divider spacing="xl" />`

const customSnippet = `<Divider color="#2563eb" thickness="2px" />
<Divider color="#10b981" thickness="4px" lineStyle="dashed" />`

const verticalSnippet = `<div className="flex items-center h-12">
  <span>Left</span>
  <Divider orientation="vertical" className="h-6" />
  <span>Middle</span>
  <Divider orientation="vertical" className="h-6" lineStyle="dashed" />
  <span>Right</span>
</div>`

const DividerDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Divider 分割线</h1>
        <p className="text-gray-600">区隔内容的分割线。</p>
      </div>

      <DemoBlock title="基础用法" description="默认水平分割线。" code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="text-gray-700">上方内容</div>
          <Divider />
          <div className="text-gray-700">下方内容</div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="线条样式"
        description="lineStyle 支持 solid / dashed / dotted。"
        code={lineStyleSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg space-y-4">
          <div>
            <div className="text-gray-700 mb-2">solid</div>
            <Divider lineStyle="solid" />
          </div>
          <div>
            <div className="text-gray-700 mb-2">dashed</div>
            <Divider lineStyle="dashed" />
          </div>
          <div>
            <div className="text-gray-700 mb-2">dotted</div>
            <Divider lineStyle="dotted" />
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="间距"
        description="spacing 控制分割线周围留白（none / xs / sm / md / lg / xl）。"
        code={spacingSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="text-gray-700">none</div>
          <Divider spacing="none" />
          <div className="text-gray-700">xs</div>
          <Divider spacing="xs" />
          <div className="text-gray-700">sm</div>
          <Divider spacing="sm" />
          <div className="text-gray-700">md (default)</div>
          <Divider spacing="md" />
          <div className="text-gray-700">lg</div>
          <Divider spacing="lg" />
          <div className="text-gray-700">xl</div>
          <Divider spacing="xl" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义颜色与粗细"
        description="通过 color / thickness 自定义边框颜色与宽度。"
        code={customSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="text-gray-700">color="#2563eb" thickness="2px"</div>
          <Divider color="#2563eb" thickness="2px" />
          <div className="text-gray-700">color="#10b981" thickness="4px"（dashed）</div>
          <Divider color="#10b981" thickness="4px" lineStyle="dashed" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="垂直分割线"
        description='orientation="vertical" 用于行内内容分隔。'
        code={verticalSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center h-12">
            <span className="text-gray-700">Left</span>
            <Divider orientation="vertical" className="h-6" />
            <span className="text-gray-700">Middle</span>
            <Divider orientation="vertical" className="h-6" lineStyle="dashed" />
            <span className="text-gray-700">Right</span>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}

export default DividerDemo
