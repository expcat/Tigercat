import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, FormItem, Input, Textarea, Select, Checkbox, Radio, RadioGroup, Button, Space, Divider } from '@tigercat/react'
import { countries } from '../../../shared/constants'

const FormDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    gender: 'male',
    country: 'china',
    bio: '',
    agreement: false,
  })

  const handleSubmit = () => {
    console.log('表单提交:', formData)
    alert('表单提交成功！请查看控制台。')
  }

  const handleGenderChange = (value: string | number) => {
    setFormData({ ...formData, gender: String(value) })
  }

  const handleCountryChange = (value: string | number | (string | number)[] | undefined) => {
    setFormData({ ...formData, country: String(value || '') })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form 表单</h1>
        <p className="text-gray-600">由输入框、选择器、单选框、多选框等控件组成，用以收集、校验、提交数据。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">完整的表单示例，包含多种表单控件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Form onSubmit={handleSubmit} className="max-w-md">
            <FormItem label="用户名" required>
              <Input 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="请输入用户名"
              />
            </FormItem>

            <FormItem label="邮箱" required>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
              />
            </FormItem>

            <FormItem label="性别">
              <RadioGroup 
                value={formData.gender} 
                onChange={handleGenderChange}
              >
                <Radio value="male">男</Radio>
                <Radio value="female">女</Radio>
                <Radio value="other">其他</Radio>
              </RadioGroup>
            </FormItem>

            <FormItem label="国家">
              <Select 
                value={formData.country}
                onChange={handleCountryChange}
                options={countries}
              />
            </FormItem>

            <FormItem label="个人简介">
              <Textarea 
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="请输入个人简介"
                rows={4}
              />
            </FormItem>

            <FormItem>
              <Checkbox 
                checked={formData.agreement}
                onChange={(value) => setFormData({ ...formData, agreement: value })}
              >
                我已阅读并同意用户协议
              </Checkbox>
            </FormItem>

            <FormItem>
              <Space>
                <Button type="submit" variant="primary">提交</Button>
                <Button type="button" variant="secondary" onClick={() => {
                  setFormData({
                    username: '',
                    email: '',
                    gender: 'male',
                    country: 'china',
                    bio: '',
                    agreement: false,
                  })
                }}>
                  重置
                </Button>
              </Space>
            </FormItem>
          </Form>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 表单数据预览 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">表单数据预览</h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <pre className="text-sm text-gray-700 bg-white p-4 rounded border">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default FormDemo
