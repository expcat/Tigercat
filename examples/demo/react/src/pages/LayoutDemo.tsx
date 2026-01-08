import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Layout,
  Header,
  Sidebar,
  Content,
  Footer,
} from '@tigercat/react';

const LayoutDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Layout 布局</h1>
        <p className="text-gray-600">协助进行页面级整体布局。</p>
      </div>

      {/* Container 容器 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Container 容器</h2>
        <p className="text-gray-600 mb-6">
          用于约束内容宽度并提供响应式内边距。
        </p>
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
      </section>

      {/* 基础布局 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础布局</h2>
        <p className="text-gray-600 mb-6">典型的页面布局。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[260px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <Content className="!bg-white !p-4">Content</Content>
            <Footer className="!bg-gray-800 !text-white !p-4">Footer</Footer>
          </Layout>
        </div>
      </section>

      {/* 侧边栏布局 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">侧边栏布局</h2>
        <p className="text-gray-600 mb-6">带有侧边栏的布局。</p>
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
      </section>

      {/* 复杂布局 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">复杂布局</h2>
        <p className="text-gray-600 mb-6">更复杂的页面布局。</p>
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
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <RouterLink to="/" className="text-blue-600 hover:text-blue-800">
          ← 返回首页
        </RouterLink>
      </div>
    </div>
  );
};

export default LayoutDemo;
