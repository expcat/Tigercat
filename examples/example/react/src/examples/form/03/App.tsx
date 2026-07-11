import React, { useRef, useState } from 'react'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'
import { Textarea } from '@expcat/tigercat-react/Textarea'
import { Select } from '@expcat/tigercat-react/Select'
import { Checkbox } from '@expcat/tigercat-react/Checkbox'
import { Radio } from '@expcat/tigercat-react/Radio'
import { RadioGroup } from '@expcat/tigercat-react/RadioGroup'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import {
  type FormHandle,
  type FormSubmitEvent,
  type FormRules,
  type FormLabelPosition,
  type ComponentSize
} from '@expcat/tigercat-react'
import { countries } from '@demo-shared/constants'

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

export default function App() {
  const [basicForm, setBasicForm] = useState({
    username: '',
    email: '',
    gender: 'male',
    country: 'china',
    bio: '',
    agreement: false
  })

  const [basicSubmitFeedback, setBasicSubmitFeedback] = useState('尚未提交表单')

  const handleBasicSubmit = ({ valid, values }: FormSubmitEvent) => {
    setBasicSubmitFeedback(
      valid ? `提交成功：${String(values.username || '未填写用户名')}` : '提交失败，请检查输入。'
    )
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
    setBasicSubmitFeedback('表单已重置')
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

  const [sizeValue, setSizeValue] = useState<ComponentSize>('md')

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
    <>
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
    </>
  )
}
