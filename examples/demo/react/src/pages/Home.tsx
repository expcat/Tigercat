import React from 'react'
import { Link } from 'react-router-dom'

const components = [
  { name: 'Button', path: '/button', category: '基础组件' },
  { name: 'Icon', path: '/icon', category: '基础组件' },
  { name: 'Link', path: '/link', category: '基础组件' },
  { name: 'Text', path: '/text', category: '基础组件' },
  
  { name: 'Input', path: '/input', category: '表单组件' },
  { name: 'Textarea', path: '/textarea', category: '表单组件' },
  { name: 'Checkbox', path: '/checkbox', category: '表单组件' },
  { name: 'CheckboxGroup', path: '/checkbox-group', category: '表单组件' },
  { name: 'Radio', path: '/radio', category: '表单组件' },
  { name: 'RadioGroup', path: '/radio-group', category: '表单组件' },
  { name: 'Switch', path: '/switch', category: '表单组件' },
  { name: 'Slider', path: '/slider', category: '表单组件' },
  { name: 'Select', path: '/select', category: '表单组件' },
  { name: 'Form', path: '/form', category: '表单组件' },
  { name: 'FormItem', path: '/form-item', category: '表单组件' },
  { name: 'DatePicker', path: '/datepicker', category: '表单组件' },
  { name: 'TimePicker', path: '/timepicker', category: '表单组件' },
  { name: 'Upload', path: '/upload', category: '表单组件' },
  
  { name: 'Layout', path: '/layout', category: '布局组件' },
  { name: 'Container', path: '/container', category: '布局组件' },
  { name: 'Header', path: '/header', category: '布局组件' },
  { name: 'Sidebar', path: '/sidebar', category: '布局组件' },
  { name: 'Content', path: '/content', category: '布局组件' },
  { name: 'Footer', path: '/footer', category: '布局组件' },
  { name: 'Grid', path: '/grid', category: '布局组件' },
  { name: 'Row', path: '/row', category: '布局组件' },
  { name: 'Col', path: '/col', category: '布局组件' },
  { name: 'Space', path: '/space', category: '布局组件' },
  { name: 'Divider', path: '/divider', category: '布局组件' },
]

const categories = ['基础组件', '表单组件', '布局组件']

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Tigercat React 组件演示</h1>
      <p className="text-gray-600 mb-8">基于 Tailwind CSS 的 React UI 组件库</p>
      
      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components
              .filter(c => c.category === category)
              .map(component => (
                <Link
                  key={component.name}
                  to={component.path}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{component.name} 组件演示</p>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Home
