import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Divider,
  type FormHandle,
  type FormSubmitEvent,
} from '@tigercat/react';
import { countries } from '../../../shared/constants';

const FormDemo: React.FC = () => {
  const [basicForm, setBasicForm] = useState({
    username: '',
    email: '',
    gender: 'male',
    country: 'china',
    bio: '',
    agreement: false,
  });

  const handleBasicSubmit = ({ valid, values }: FormSubmitEvent) => {
    console.log('表单提交:', { valid, values });
    alert(
      valid ? '表单提交成功！请查看控制台。' : '表单验证失败，请检查输入。'
    );
  };

  const handleGenderChange = (value: string | number) => {
    setBasicForm((prev) => ({ ...prev, gender: String(value) }));
  };

  const handleCountryChange = (
    value: string | number | (string | number)[] | undefined
  ) => {
    setBasicForm((prev) => ({
      ...prev,
      country: String(Array.isArray(value) ? value[0] ?? '' : value ?? ''),
    }));
  };

  const resetBasic = () => {
    setBasicForm({
      username: '',
      email: '',
      gender: 'male',
      country: 'china',
      bio: '',
      agreement: false,
    });
  };

  const validateFormRef = useRef<FormHandle | null>(null);
  const [validateForm, setValidateForm] = useState({
    username: '',
    email: '',
    age: '',
    website: '',
  });
  const [lastValidateResult, setLastValidateResult] = useState<string>('');

  const validateRules = useMemo(
    () => ({
      username: [
        { required: true, message: '请输入用户名' },
        { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间' },
      ],
      email: [
        { required: true, message: '请输入邮箱' },
        { type: 'email' as const, message: '请输入有效的邮箱地址' },
      ],
      age: [
        { required: true, message: '请输入年龄' },
        { type: 'number' as const, message: '年龄必须是数字' },
        { min: 1, max: 150, message: '年龄必须在 1 到 150 之间' },
      ],
      website: [{ type: 'url' as const, message: '请输入有效的 URL' }],
    }),
    []
  );

  const handleValidateSubmit = ({ valid, values, errors }: FormSubmitEvent) => {
    setLastValidateResult(JSON.stringify({ valid, values, errors }, null, 2));
  };

  const validateManually = async () => {
    const valid = await validateFormRef.current?.validate();
    setLastValidateResult(JSON.stringify({ valid }, null, 2));
  };

  const clearValidateManually = () => {
    validateFormRef.current?.clearValidate();
  };

  const resetValidateForm = () => {
    setValidateForm({ username: '', email: '', age: '', website: '' });
    validateFormRef.current?.clearValidate();
    setLastValidateResult('');
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form 表单</h1>
        <p className="text-gray-600">
          由输入框、选择器、单选框、多选框等控件组成，用以收集、校验、提交数据。
        </p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">完整的表单示例，包含多种表单控件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Form
            model={basicForm}
            onSubmit={handleBasicSubmit}
            className="max-w-md">
            <FormItem label="用户名" required>
              <Input
                value={basicForm.username}
                onChange={(e) =>
                  setBasicForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                placeholder="请输入用户名"
              />
            </FormItem>

            <FormItem label="邮箱" required>
              <Input
                type="email"
                value={basicForm.email}
                onChange={(e) =>
                  setBasicForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="请输入邮箱"
              />
            </FormItem>

            <FormItem label="性别">
              <RadioGroup
                value={basicForm.gender}
                onChange={handleGenderChange}>
                <Radio value="male">男</Radio>
                <Radio value="female">女</Radio>
                <Radio value="other">其他</Radio>
              </RadioGroup>
            </FormItem>

            <FormItem label="国家">
              <Select
                value={basicForm.country}
                onChange={handleCountryChange}
                options={countries}
              />
            </FormItem>

            <FormItem label="个人简介">
              <Textarea
                value={basicForm.bio}
                onChange={(e) =>
                  setBasicForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="请输入个人简介"
                rows={4}
              />
            </FormItem>

            <FormItem>
              <Checkbox
                checked={basicForm.agreement}
                onChange={(value) =>
                  setBasicForm((prev) => ({ ...prev, agreement: value }))
                }>
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
        </div>
        <Divider className="my-6" />
      </section>

      {/* 表单验证 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">表单验证</h2>
        <p className="text-gray-600 mb-6">
          通过 rules + name 实现校验，支持提交校验与手动校验。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
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
                      username: e.target.value,
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
                      email: e.target.value,
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
                      age: e.target.value,
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
                      website: e.target.value,
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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={validateManually}>
                    手动校验
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearValidateManually}>
                    清除校验
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetValidateForm}>
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
        </div>
        <Divider className="my-6" />
      </section>

      {/* 表单数据预览 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">表单数据预览</h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <pre className="text-sm text-gray-700 bg-white p-4 rounded border">
            {JSON.stringify({ basicForm, validateForm }, null, 2)}
          </pre>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
};

export default FormDemo;
