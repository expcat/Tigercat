import React from 'react'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/products">Products</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>`

const arrowSnippet = `<Breadcrumb separator="arrow">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/products">Products</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>`

const chevronSnippet = `<Breadcrumb separator="chevron">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/products">Products</BreadcrumbItem>
  <BreadcrumbItem href="/category">Category</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>`

const customSnippet = `<Breadcrumb separator=">">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
  <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
</Breadcrumb>`

const iconSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/" icon={<HomeIcon />}>Home</BreadcrumbItem>
  <BreadcrumbItem href="/products" icon={<BagIcon />}>Products</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>`

const externalSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="https://github.com" target="_blank">GitHub</BreadcrumbItem>
  <BreadcrumbItem current>Current Page</BreadcrumbItem>
</Breadcrumb>`

const clickSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/" onClick={handleClick}>Home</BreadcrumbItem>
  <BreadcrumbItem href="/products" onClick={handleClick}>Products</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>`

const multiSnippet = `<Breadcrumb separator="chevron">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/category">Category</BreadcrumbItem>
  <BreadcrumbItem href="/category/electronics">Electronics</BreadcrumbItem>
  <BreadcrumbItem href="/category/electronics/phones">Phones</BreadcrumbItem>
  <BreadcrumbItem href="/category/electronics/phones/smartphones">Smartphones</BreadcrumbItem>
  <BreadcrumbItem current>iPhone 15 Pro</BreadcrumbItem>
</Breadcrumb>`

const itemSeparatorSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/" separator="arrow">Home</BreadcrumbItem>
  <BreadcrumbItem href="/products" separator="chevron">Products</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>`

const BreadcrumbDemo: React.FC = () => {
  const handleClick = (event: React.MouseEvent) => {
    console.log('Breadcrumb item clicked:', event)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Breadcrumb 面包屑</h1>
        <p className="text-gray-600">显示当前页面在系统层级结构中的位置，并能向上返回。</p>
      </div>

      <DemoBlock title="基本用法" description="最简单的面包屑导航。" code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/products">Products</BreadcrumbItem>
            <BreadcrumbItem current>Details</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>

      <DemoBlock title="箭头分隔符" description="使用箭头作为分隔符。" code={arrowSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb separator="arrow">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/products">Products</BreadcrumbItem>
            <BreadcrumbItem current>Details</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>

      <DemoBlock title="尖括号分隔符" description="使用尖括号作为分隔符。" code={chevronSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb separator="chevron">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/products">Products</BreadcrumbItem>
            <BreadcrumbItem href="/category">Category</BreadcrumbItem>
            <BreadcrumbItem current>Details</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义分隔符"
        description="可以使用任意字符串作为分隔符。"
        code={customSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb separator=">">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
            <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>

      <DemoBlock title="带图标" description="可以在面包屑项中添加图标。" code={iconSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb>
            <BreadcrumbItem
              href="/"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              }>
              Home
            </BreadcrumbItem>
            <BreadcrumbItem
              href="/products"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
              }>
              Products
            </BreadcrumbItem>
            <BreadcrumbItem current>Details</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>

      <DemoBlock title="外部链接" description="支持在新窗口打开链接。" code={externalSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="https://github.com" target="_blank">
              GitHub
            </BreadcrumbItem>
            <BreadcrumbItem current>Current Page</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>

      <DemoBlock
        title="点击事件"
        description="面包屑项可以监听点击事件（查看控制台）。"
        code={clickSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb>
            <BreadcrumbItem href="/" onClick={handleClick}>
              Home
            </BreadcrumbItem>
            <BreadcrumbItem href="/products" onClick={handleClick}>
              Products
            </BreadcrumbItem>
            <BreadcrumbItem current>Details</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>

      <DemoBlock title="多级层次" description="支持任意层级的面包屑导航。" code={multiSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb separator="chevron">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/category">Category</BreadcrumbItem>
            <BreadcrumbItem href="/category/electronics">Electronics</BreadcrumbItem>
            <BreadcrumbItem href="/category/electronics/phones">Phones</BreadcrumbItem>
            <BreadcrumbItem href="/category/electronics/phones/smartphones">
              Smartphones
            </BreadcrumbItem>
            <BreadcrumbItem current>iPhone 15 Pro</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>

      <DemoBlock
        title="单独设置分隔符"
        description="每个面包屑项可以单独设置分隔符。"
        code={itemSeparatorSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Breadcrumb>
            <BreadcrumbItem href="/" separator="arrow">
              Home
            </BreadcrumbItem>
            <BreadcrumbItem href="/products" separator="chevron">
              Products
            </BreadcrumbItem>
            <BreadcrumbItem current>Details</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </DemoBlock>
    </div>
  )
}

export default BreadcrumbDemo
