import React from 'react'
import { Container, Layout, Header, Sidebar, Content, Footer } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const containerSnippet = `<Container maxWidth="lg">
  <div>这里是 Container 内容区域</div>
</Container>`

const basicSnippet = `<Layout>
  <Header>Header</Header>
  <Content>Content</Content>
  <Footer>Footer</Footer>
</Layout>`

const sidebarSnippet = `<Layout>
  <Header>Header</Header>
  <div className="flex flex-1">
    <Sidebar width="192px">Sidebar</Sidebar>
    <Content>Content</Content>
  </div>
  <Footer>Footer</Footer>
</Layout>`

const complexSnippet = `<Layout>
  <Header>Header</Header>
  <div className="flex flex-1">
    <Sidebar width="192px">Sidebar</Sidebar>
    <Layout>
      <Content>Content</Content>
      <Footer>Inner Footer</Footer>
    </Layout>
  </div>
  <Footer>Footer</Footer>
</Layout>`

const LayoutDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Layout 布局</h1>
        <p className="text-gray-600">协助进行页面级整体布局。</p>
      </div>

      <DemoBlock
        title="Container 容器"
        description="用于约束内容宽度并提供响应式内边距。"
        code={containerSnippet}>
        <div className="bg-gray-50 rounded-lg py-6">
          <Container maxWidth="lg">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="font-medium mb-1">这里是 Container 内容区域</div>
              <div className="text-sm text-gray-600">
                maxWidth=&quot;lg&quot;，默认居中并带有响应式 padding
              </div>
            </div>
          </Container>
        </div>
      </DemoBlock>

      <DemoBlock title="基础布局" description="典型的页面布局。" code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[260px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <Content className="!bg-white !p-4">Content</Content>
            <Footer className="!bg-gray-800 !text-white !p-4">Footer</Footer>
          </Layout>
        </div>
      </DemoBlock>

      <DemoBlock title="侧边栏布局" description="带有侧边栏的布局。" code={sidebarSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[260px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <div className="flex flex-1">
              <Sidebar width="192px" className="!bg-gray-200 !p-4">
                Sidebar
              </Sidebar>
              <Content className="!bg-white !p-4">Content</Content>
            </div>
            <Footer className="!bg-gray-800 !text-white !p-4">Footer</Footer>
          </Layout>
        </div>
      </DemoBlock>

      <DemoBlock title="复杂布局" description="更复杂的页面布局。" code={complexSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[400px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <div className="flex flex-1">
              <Sidebar width="192px" className="!bg-gray-200 !p-4">
                Sidebar
              </Sidebar>
              <Layout className="min-h-0 flex-1">
                <Content className="!bg-white !p-4">Content</Content>
                <Footer className="!bg-gray-100 !p-4">Inner Footer</Footer>
              </Layout>
            </div>
            <Footer className="!bg-gray-800 !text-white !p-4">Footer</Footer>
          </Layout>
        </div>
      </DemoBlock>
    </div>
  )
}

export default LayoutDemo
