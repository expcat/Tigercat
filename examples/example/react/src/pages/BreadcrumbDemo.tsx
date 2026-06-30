import React from 'react'
import { Breadcrumb } from '@expcat/tigercat-react/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-react/BreadcrumbItem'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './BreadcrumbDemo.tsx?raw'

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

const extraSnippet = `<Breadcrumb extra={<button className="text-sm text-blue-600 hover:underline">Edit</button>}>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/products">Products</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>`

const BreadcrumbDemo: React.FC = () => {
  const handleClick = (event: React.MouseEvent) => {
    console.log('Breadcrumb item clicked:', event)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Breadcrumb 面包屑</h1>
        <p className="text-gray-600 dark:text-gray-400">
          显示当前页面在系统层级结构中的位置，并能向上返回。
        </p>
      </div>

      <DemoBlock
        title="基本用法等组合展示"
        description="合并展示基本用法、箭头分隔符、尖括号分隔符等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/products">Products</BreadcrumbItem>
                <BreadcrumbItem current>Details</BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">箭头分隔符</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Breadcrumb separator="arrow">
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/products">Products</BreadcrumbItem>
                <BreadcrumbItem current>Details</BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">尖括号分隔符</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Breadcrumb separator="chevron">
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/products">Products</BreadcrumbItem>
                <BreadcrumbItem href="/category">Category</BreadcrumbItem>
                <BreadcrumbItem current>Details</BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义分隔符</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Breadcrumb separator=">">
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
                <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="带图标等组合展示"
        description="合并展示带图标、外部链接、点击事件等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">带图标</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">外部链接</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="https://github.com" target="_blank">
                  GitHub
                </BreadcrumbItem>
                <BreadcrumbItem current>Current Page</BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">点击事件</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">多级层次</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              单独设置分隔符
            </h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">扩展区域</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Breadcrumb
                extra={<button className="text-sm text-blue-600 hover:underline">Edit</button>}>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/products">Products</BreadcrumbItem>
                <BreadcrumbItem current>Details</BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}

export default BreadcrumbDemo
