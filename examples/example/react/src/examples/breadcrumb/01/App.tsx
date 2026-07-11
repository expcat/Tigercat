import React from 'react'
import { Breadcrumb } from '@expcat/tigercat-react/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-react/BreadcrumbItem'

export default function App() {
  const handleClick = (event: React.MouseEvent) => {
    console.log('Breadcrumb item clicked:', event)
  }

  return (
    <>
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
    </>
  )
}
