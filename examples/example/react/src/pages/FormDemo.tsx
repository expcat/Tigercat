import React, { useRef, useState } from 'react'
import {
  Form,
  FormItem,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Button,
  Space,
  type FormHandle,
  type FormSubmitEvent,
  type FormRules,
  type FormLabelPosition,
  type FormSize
} from '@expcat/tigercat-react'
import { countries } from '@demo-shared/constants'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Form model={basicForm} onSubmit={handleBasicSubmit} className="max-w-md">
  <FormItem label="用户名" required>
    <Input value={basicForm.username} onChange={(e) => setBasicForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="请输入用户名" />
  </FormItem>
  <FormItem label="邮箱" required>
    <Input type="email" value={basicForm.email} onChange={(e) => setBasicForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="请输入邮箱" />
  </FormItem>
  <FormItem label="性别">
    <RadioGroup value={basicForm.gender} onChange={handleGenderChange}>
      <Radio value="male">男</Radio>
      <Radio value="female">女</Radio>
      <Radio value="other">其他</Radio>
    </RadioGroup>
  </FormItem>
  <FormItem label="国家">
    <Select value={basicForm.country} onChange={handleCountryChange} options={countries} />
  </FormItem>
  <FormItem label="个人简介">
    <Textarea value={basicForm.bio} onChange={(e) => setBasicForm((prev) => ({ ...prev, bio: e.target.value }))} placeholder="请输入个人简介" rows={4} />
  </FormItem>
  <FormItem>
    <Checkbox checked={basicForm.agreement} onChange={(value) => setBasicForm((prev) => ({ ...prev, agreement: value }))}>
      我已阅读并同意用户协议
    </Checkbox>
  </FormItem>
  <FormItem>
    <Space>
      <Button type="submit" variant="primary">提交</Button>
      <Button type="button" variant="secondary" onClick={resetBasic}>重置</Button>
    </Space>
  </FormItem>
</Form>`

const validateSnippet = `<Space direction="vertical" className="w-full">
  <Form ref={validateFormRef} model={validateForm} rules={validateRules} onSubmit={handleValidateSubmit} className="max-w-md">
    <FormItem label="用户名" name="username">
      <Input value={validateForm.username} onChange={(e) => setValidateForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="至少 3 个字符" />
    </FormItem>
    <FormItem label="邮箱" name="email">
      <Input value={validateForm.email} onChange={(e) => setValidateForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="example@domain.com" />
    </FormItem>
    <FormItem label="年龄" name="age">
      <Input type="number" value={validateForm.age} onChange={(e) => setValidateForm((prev) => ({ ...prev, age: e.target.value }))} placeholder="1-150" />
    </FormItem>
    <FormItem label="网站" name="website">
      <Input value={validateForm.website} onChange={(e) => setValidateForm((prev) => ({ ...prev, website: e.target.value }))} placeholder="https://example.com" />
    </FormItem>
    <FormItem>
      <Space>
        <Button type="submit" variant="primary">提交并校验</Button>
        <Button type="button" variant="secondary" onClick={validateManually}>手动校验</Button>
        <Button type="button" variant="secondary" onClick={clearValidateManually}>清除校验</Button>
        <Button type="button" variant="secondary" onClick={resetValidateForm}>重置</Button>
      </Space>
    </FormItem>
  </Form>
  <div className="max-w-md w-full">
    <p className="text-sm text-gray-600 mb-2">最近一次校验结果：</p>
    <pre className="text-sm text-gray-700 bg-white p-4 rounded border whitespace-pre-wrap">{lastValidateResult || '（无）'}</pre>
  </div>
</Space>`

const previewSnippet = `<pre className="text-sm text-gray-700 bg-white p-4 rounded border">
  {JSON.stringify({ basicForm, validateForm }, null, 2)}
</pre>`

const layoutSnippet = `<Form model={layoutModel} labelPosition={layoutPosition} labelWidth={100}>
  <FormItem label="姓名" name="name">
    <Input value={layoutModel.name} onChange={...} placeholder="请输入姓名" />
  </FormItem>
  <FormItem label="邮箱" name="email">
    <Input value={layoutModel.email} onChange={...} placeholder="请输入邮箱" />
  </FormItem>
</Form>`

const sizeSnippet = `<Form model={sizeModel} size={sizeValue}>
  <FormItem label="姓名" name="name">
    <Input value={sizeModel.name} onChange={...} placeholder="请输入姓名" />
  </FormItem>
</Form>`

const disabledSnippet = `<Form model={disabledModel} disabled>
  <FormItem label="姓名" name="name">
    <Input value={disabledModel.name} />
  </FormItem>
  <FormItem label="邮箱" name="email">
    <Input value={disabledModel.email} />
  </FormItem>
</Form>`

const customValidatorSnippet = `<Form model={customModel} rules={customRules}>
  <FormItem label="用户名" name="username">
    <Input value={customModel.username} onChange={...} placeholder="输入 admin 试试" />
  </FormItem>
  <FormItem label="年龄" name="age">
    <Input type="number" value={customModel.age} onChange={...} placeholder="18-120" />
  </FormItem>
</Form>`

const showMessageSnippet = `{/* 默认模式：错误在 FormItem 下方 */}
<FormItem label="邮箱" name="email">
  <Input value={model.email} onChange={...} placeholder="错误显示在输入框下方" />
</FormItem>

{/* 内联模式：错误在 Input 内部 */}
<FormItem label="邮箱" name="email" showMessage={false}>
  <Input value={model.email} onChange={...} placeholder="错误在输入框内显示" />
</FormItem>`

const validateRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email' as const, message: '请输入有效的邮箱地址' }
  ],
  age: [
    { required: true, message: '请输入年龄' },
    { type: 'number' as const, message: '年龄必须是数字' },
    { min: 1, max: 150, message: '年龄必须在 1 到 150 之间' }
  ],
  website: [{ type: 'url' as const, message: '请输入有效的 URL' }]
}

const FormDemo: React.FC = () => {
  const [basicForm, setBasicForm] = useState({
    username: '',
    email: '',
    gender: 'male',
    country: 'china',
    bio: '',
    agreement: false
  })

  const handleBasicSubmit = ({ valid, values }: FormSubmitEvent) => {
    console.log('表单提交:', { valid, values })
    alert(valid ? '表单提交成功！请查看控制台。' : '表单验证失败，请检查输入。')
  }

  const handleGenderChange = (value: string | number) => {
    setBasicForm((prev) => ({ ...prev, gender: String(value) }))
  }

  const handleCountryChange = (value: string | number | (string | number)[] | undefined) => {
    setBasicForm((prev) => ({
      ...prev,
      country: String(Array.isArray(value) ? (value[0] ?? '') : (value ?? ''))
    }))
  }

  const resetBasic = () => {
    setBasicForm({
      username: '',
      email: '',
      gender: 'male',
      country: 'china',
      bio: '',
      agreement: false
    })
  }

  const validateFormRef = useRef<FormHandle | null>(null)
  const [validateForm, setValidateForm] = useState({
    username: '',
    email: '',
    age: '',
    website: ''
  })
  const [lastValidateResult, setLastValidateResult] = useState<string>('')

  const handleValidateSubmit = ({ valid, values, errors }: FormSubmitEvent) => {
    setLastValidateResult(JSON.stringify({ valid, values, errors }, null, 2))
  }

  const validateManually = async () => {
    const valid = await validateFormRef.current?.validate()
    setLastValidateResult(JSON.stringify({ valid }, null, 2))
  }

  const clearValidateManually = () => {
    validateFormRef.current?.clearValidate()
  }

  const resetValidateForm = () => {
    setValidateForm({ username: '', email: '', age: '', website: '' })
    validateFormRef.current?.clearValidate()
    setLastValidateResult('')
  }

  const [layoutPosition, setLayoutPosition] = useState<FormLabelPosition>('right')
  const [layoutModel, setLayoutModel] = useState({ name: '', email: '' })

  const [sizeValue, setSizeValue] = useState<FormSize>('md')
  const [sizeModel, setSizeModel] = useState({ name: '' })

  const disabledModel = { name: '张三', email: 'zhangsan@example.com' }

  const customValidatorFormRef = useRef<FormHandle | null>(null)
  const [customModel, setCustomModel] = useState({ username: '', age: '' })
  const customRules: FormRules = {
    username: [
      { required: true, message: '请输入用户名' },
      {
        validator: async (value) => {
          await new Promise((r) => setTimeout(r, 500))
          if (value === 'admin') return '用户名已被占用'
          return true
        },
        message: '用户名校验失败'
      }
    ],
    age: [
      { required: true, message: '请输入年龄' },
      {
        validator: (value) => {
          const num = Number(value)
          if (isNaN(num) || num < 18 || num > 120) return '年龄必须在 18-120 之间'
          return true
        }
      }
    ]
  }

  const showMessageFormRef = useRef<FormHandle | null>(null)
  const [showMessageModel, setShowMessageModel] = useState({ email: '' })
  const showMessageRules: FormRules = {
    email: [
      { required: true, message: '请输入邮箱' },
      { type: 'email' as const, message: '请输入有效的邮箱地址' }
    ]
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form 表单</h1>
        <p className="text-gray-600">
          由输入框、选择器、单选框、多选框等控件组成，用以收集、校验、提交数据。
        </p>
      </div>

      {/* 基础用法 */}
      <DemoBlock
        title="基础用法"
        description="完整的表单示例，包含多种表单控件。"
        code={basicSnippet}>
        <Form model={basicForm} onSubmit={handleBasicSubmit} className="max-w-md">
          <FormItem label="用户名" required>
            <Input
              value={basicForm.username}
              onChange={(e) =>
                setBasicForm((prev) => ({
                  ...prev,
                  username: e.target.value
                }))
              }
              placeholder="请输入用户名"
            />
          </FormItem>

          <FormItem label="邮箱" required>
            <Input
              type="email"
              value={basicForm.email}
              onChange={(e) => setBasicForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="请输入邮箱"
            />
          </FormItem>

          <FormItem label="性别">
            <RadioGroup value={basicForm.gender} onChange={handleGenderChange}>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
              <Radio value="other">其他</Radio>
            </RadioGroup>
          </FormItem>

          <FormItem label="国家">
            <Select value={basicForm.country} onChange={handleCountryChange} options={countries} />
          </FormItem>

          <FormItem label="个人简介">
            <Textarea
              value={basicForm.bio}
              onChange={(e) => setBasicForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="请输入个人简介"
              rows={4}
            />
          </FormItem>

          <FormItem>
            <Checkbox
              checked={basicForm.agreement}
              onChange={(value) => setBasicForm((prev) => ({ ...prev, agreement: value }))}>
              我已阅读并同意用户协议
            </Checkbox>
          </FormItem>

          <FormItem>
            <Space>
              <Button type="submit" variant="primary">
                提交
              </Button>
              <Button type="button" variant="secondary" onClick={resetBasic}>
                重置
              </Button>
            </Space>
          </FormItem>
        </Form>
      </DemoBlock>

      {/* 表单验证 */}
      <DemoBlock
        title="表单验证"
        description="通过 rules + name 实现校验，支持提交校验与手动校验。"
        code={validateSnippet}>
        <Space direction="vertical" className="w-full">
          <Form
            ref={validateFormRef}
            model={validateForm}
            rules={validateRules}
            onSubmit={handleValidateSubmit}
            className="max-w-md">
            <FormItem label="用户名" name="username">
              <Input
                value={validateForm.username}
                onChange={(e) =>
                  setValidateForm((prev) => ({
                    ...prev,
                    username: e.target.value
                  }))
                }
                placeholder="至少 3 个字符"
              />
            </FormItem>

            <FormItem label="邮箱" name="email">
              <Input
                value={validateForm.email}
                onChange={(e) =>
                  setValidateForm((prev) => ({
                    ...prev,
                    email: e.target.value
                  }))
                }
                placeholder="example@domain.com"
              />
            </FormItem>

            <FormItem label="年龄" name="age">
              <Input
                type="number"
                value={validateForm.age}
                onChange={(e) =>
                  setValidateForm((prev) => ({
                    ...prev,
                    age: e.target.value
                  }))
                }
                placeholder="1-150"
              />
            </FormItem>

            <FormItem label="网站" name="website">
              <Input
                value={validateForm.website}
                onChange={(e) =>
                  setValidateForm((prev) => ({
                    ...prev,
                    website: e.target.value
                  }))
                }
                placeholder="https://example.com"
              />
            </FormItem>

            <FormItem>
              <Space>
                <Button type="submit" variant="primary">
                  提交并校验
                </Button>
                <Button type="button" variant="secondary" onClick={validateManually}>
                  手动校验
                </Button>
                <Button type="button" variant="secondary" onClick={clearValidateManually}>
                  清除校验
                </Button>
                <Button type="button" variant="secondary" onClick={resetValidateForm}>
                  重置
                </Button>
              </Space>
            </FormItem>
          </Form>

          <div className="max-w-md w-full">
            <p className="text-sm text-gray-600 mb-2">最近一次校验结果：</p>
            <pre className="text-sm text-gray-700 bg-white p-4 rounded border whitespace-pre-wrap">
              {lastValidateResult || '（无）'}
            </pre>
          </div>
        </Space>
      </DemoBlock>

      {/* 布局模式 */}
      <DemoBlock
        title="布局模式"
        description="通过 labelPosition 切换标签位置：right（默认）、left、top。"
        code={layoutSnippet}>
        <div className="max-w-md">
          <Space className="mb-4">
            <Button
              variant={layoutPosition === 'right' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setLayoutPosition('right')}>
              Right
            </Button>
            <Button
              variant={layoutPosition === 'left' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setLayoutPosition('left')}>
              Left
            </Button>
            <Button
              variant={layoutPosition === 'top' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setLayoutPosition('top')}>
              Top
            </Button>
          </Space>
          <Form model={layoutModel} labelPosition={layoutPosition} labelWidth={100}>
            <FormItem label="姓名" name="name">
              <Input
                value={layoutModel.name}
                onChange={(e) => setLayoutModel((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="请输入姓名"
              />
            </FormItem>
            <FormItem label="邮箱" name="email">
              <Input
                value={layoutModel.email}
                onChange={(e) => setLayoutModel((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="请输入邮箱"
              />
            </FormItem>
          </Form>
        </div>
      </DemoBlock>

      {/* 表单尺寸 */}
      <DemoBlock
        title="表单尺寸"
        description="通过 size 设置表单整体尺寸：sm、md（默认）、lg。"
        code={sizeSnippet}>
        <div className="max-w-md">
          <Space className="mb-4">
            <Button
              variant={sizeValue === 'sm' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSizeValue('sm')}>
              Small
            </Button>
            <Button
              variant={sizeValue === 'md' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSizeValue('md')}>
              Medium
            </Button>
            <Button
              variant={sizeValue === 'lg' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSizeValue('lg')}>
              Large
            </Button>
          </Space>
          <Form model={sizeModel} size={sizeValue}>
            <FormItem label="姓名" name="name">
              <Input
                value={sizeModel.name}
                onChange={(e) => setSizeModel((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="请输入姓名"
              />
            </FormItem>
          </Form>
        </div>
      </DemoBlock>

      {/* 禁用表单 */}
      <DemoBlock title="禁用表单" description="设置 disabled 禁用整个表单。" code={disabledSnippet}>
        <Form model={disabledModel} disabled className="max-w-md">
          <FormItem label="姓名" name="name">
            <Input value={disabledModel.name} />
          </FormItem>
          <FormItem label="邮箱" name="email">
            <Input value={disabledModel.email} />
          </FormItem>
        </Form>
      </DemoBlock>

      {/* 自定义校验器 */}
      <DemoBlock
        title="自定义校验器"
        description="通过 validator 函数实现自定义校验，支持同步和异步。输入 admin 触发异步校验。"
        code={customValidatorSnippet}>
        <Form
          ref={customValidatorFormRef}
          model={customModel}
          rules={customRules}
          className="max-w-md">
          <FormItem label="用户名" name="username">
            <Input
              value={customModel.username}
              onChange={(e) => setCustomModel((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="输入 admin 试试"
            />
          </FormItem>
          <FormItem label="年龄" name="age">
            <Input
              type="number"
              value={customModel.age}
              onChange={(e) => setCustomModel((prev) => ({ ...prev, age: e.target.value }))}
              placeholder="18-120"
            />
          </FormItem>
          <FormItem>
            <Button
              type="button"
              variant="primary"
              onClick={() => customValidatorFormRef.current?.validate()}>
              校验
            </Button>
          </FormItem>
        </Form>
      </DemoBlock>

      {/* 错误消息模式 */}
      <DemoBlock
        title="错误消息模式"
        description="showMessage 控制错误提示位置。默认在 FormItem 下方显示；设为 false 则让 Input 内部显示错误（抖动 + 红色边框）。"
        code={showMessageSnippet}>
        <Form
          ref={showMessageFormRef}
          model={showMessageModel}
          rules={showMessageRules}
          className="max-w-md">
          <FormItem label="默认模式" name="email">
            <Input
              value={showMessageModel.email}
              onChange={(e) => setShowMessageModel((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="错误显示在输入框下方"
            />
          </FormItem>
          <FormItem label="内联模式" name="email" showMessage={false}>
            <Input
              value={showMessageModel.email}
              onChange={(e) => setShowMessageModel((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="错误在输入框内显示"
            />
          </FormItem>
          <FormItem>
            <Button
              type="button"
              variant="primary"
              onClick={() => showMessageFormRef.current?.validate()}>
              校验对比
            </Button>
          </FormItem>
        </Form>
      </DemoBlock>

      {/* 表单数据预览 */}
      <DemoBlock title="表单数据预览" description="实时查看表单数据。" code={previewSnippet}>
        <pre className="text-sm text-gray-700 bg-white p-4 rounded border">
          {JSON.stringify({ basicForm, validateForm }, null, 2)}
        </pre>
      </DemoBlock>
    </div>
  )
}

export default FormDemo
