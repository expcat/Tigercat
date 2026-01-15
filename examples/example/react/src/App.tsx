import React, { useState } from 'react'
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Select,
  Form,
  FormItem,
  Space,
  Divider,
  List,
  Layout,
  Header,
  Sidebar,
  Content,
  Footer,
  Row,
  Col,
  Container,
  Link,
  Text,
  Icon
} from '@expcat/tigercat-react'

const App: React.FC = () => {
  // Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [agree, setAgree] = useState(false)
  const [fruits, setFruits] = useState<string[]>([])
  const [gender, setGender] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [volume, setVolume] = useState(50)
  const [country, setCountry] = useState('')

  // Select options
  const countries = [
    { label: '中国', value: 'china' },
    { label: '美国', value: 'usa' },
    { label: '日本', value: 'japan' }
  ]

  const handleSubmit = (event: {
    valid: boolean
    values: Record<string, unknown>
    errors: unknown[]
  }) => {
    console.log('Form submitted:', event)
    alert('表单提交成功！查看控制台获取数据。')
  }

  const handleReset = () => {
    setUsername('')
    setPassword('')
    setBio('')
    setAgree(false)
    setFruits([])
    setGender('')
    setNotifications(true)
    setVolume(50)
    setCountry('')
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Tigercat React 组件演示</h1>
        </div>
      </Header>

      <Layout className="container mx-auto p-6">
        <Sidebar className="w-64 p-4 bg-gray-100 rounded-lg mr-6">
          <nav>
            <h2 className="text-lg font-semibold mb-4">组件导航</h2>
            <List
              bordered="none"
              split={false}
              size="sm"
              dataSource={[
                { key: 'buttons', title: '按钮', href: '#buttons' },
                { key: 'forms', title: '表单', href: '#forms' },
                { key: 'layout', title: '布局', href: '#layout' },
                { key: 'typography', title: '文本', href: '#typography' }
              ]}
              renderItem={(item) => <Link href={item.href}>{item.title}</Link>}
            />
          </nav>
        </Sidebar>

        <Content className="flex-1">
          {/* Buttons Section */}
          <section id="buttons" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">按钮组件</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">按钮类型</h3>
              <Space>
                <Button variant="primary">主要按钮</Button>
                <Button variant="secondary">次要按钮</Button>
                <Button variant="outline">轮廓按钮</Button>
                <Button variant="ghost">幽灵按钮</Button>
                <Button variant="link">链接按钮</Button>
              </Space>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">按钮大小</h3>
              <Space align="center">
                <Button size="sm">小按钮</Button>
                <Button size="md">中按钮</Button>
                <Button size="lg">大按钮</Button>
              </Space>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">按钮状态</h3>
              <Space>
                <Button>正常按钮</Button>
                <Button disabled>禁用按钮</Button>
                <Button loading>加载中</Button>
              </Space>
            </div>

            <Divider />
          </section>

          {/* Forms Section */}
          <section id="forms" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">表单组件</h2>

            <Form onSubmit={handleSubmit} className="max-w-2xl">
              <FormItem label="用户名" required>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                />
              </FormItem>

              <FormItem label="密码" required>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="请输入密码"
                />
              </FormItem>

              <FormItem label="个人简介">
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介绍一下你自己..."
                  rows={4}
                />
              </FormItem>

              <FormItem label="性别">
                <RadioGroup value={gender} onChange={(val) => setGender(String(val))}>
                  <Radio value="male">男</Radio>
                  <Radio value="female">女</Radio>
                  <Radio value="other">其他</Radio>
                </RadioGroup>
              </FormItem>

              <FormItem label="喜欢的水果">
                <CheckboxGroup value={fruits} onChange={(val) => setFruits(val.map(String))}>
                  <Checkbox value="apple">苹果</Checkbox>
                  <Checkbox value="banana">香蕉</Checkbox>
                  <Checkbox value="orange">橙子</Checkbox>
                </CheckboxGroup>
              </FormItem>

              <FormItem label="国家">
                <Select
                  value={country}
                  onChange={(val) => setCountry(val ? String(val) : '')}
                  options={countries}
                  placeholder="请选择国家"
                />
              </FormItem>

              <FormItem label="开启通知">
                <Switch checked={notifications} onChange={setNotifications} />
              </FormItem>

              <FormItem label="音量">
                <div className="flex items-center">
                  <Slider
                    value={volume}
                    onChange={(val) => setVolume(Array.isArray(val) ? val[0] : val)}
                    min={0}
                    max={100}
                  />
                  <Text className="ml-3">{volume}%</Text>
                </div>
              </FormItem>

              <FormItem>
                <Checkbox checked={agree} onChange={setAgree}>
                  我同意用户协议
                </Checkbox>
              </FormItem>

              <FormItem>
                <Space>
                  <Button type="submit" variant="primary">
                    提交
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleReset}>
                    重置
                  </Button>
                </Space>
              </FormItem>
            </Form>

            <Divider />
          </section>

          {/* Layout Section */}
          <section id="layout" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">布局组件</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">栅格系统</h3>
              <Container>
                <Row gutter={16} className="mb-4">
                  <Col span={12}>
                    <div className="bg-blue-500 text-white p-4 rounded">Col-12</div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-blue-500 text-white p-4 rounded">Col-12</div>
                  </Col>
                </Row>

                <Row gutter={16} className="mb-4">
                  <Col span={8}>
                    <div className="bg-green-500 text-white p-4 rounded">Col-8</div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-green-500 text-white p-4 rounded">Col-8</div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-green-500 text-white p-4 rounded">Col-8</div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={6}>
                    <div className="bg-purple-500 text-white p-4 rounded">Col-6</div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-purple-500 text-white p-4 rounded">Col-6</div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-purple-500 text-white p-4 rounded">Col-6</div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-purple-500 text-white p-4 rounded">Col-6</div>
                  </Col>
                </Row>
              </Container>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">空间组件</h3>
              <Space direction="vertical">
                <Text>垂直排列的元素 1</Text>
                <Text>垂直排列的元素 2</Text>
                <Text>垂直排列的元素 3</Text>
              </Space>
            </div>

            <Divider />
          </section>

          {/* Typography Section */}
          <section id="typography" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">文本组件</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">文本样式</h3>
              <Space direction="vertical">
                <Text color="primary">主要文本</Text>
                <Text color="secondary">次要文本</Text>
                <Text color="success">成功文本</Text>
                <Text color="warning">警告文本</Text>
                <Text color="danger">危险文本</Text>
              </Space>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">链接</h3>
              <Space>
                <Link href="https://github.com/expcats/Tigercat" target="_blank">
                  GitHub 仓库
                </Link>
                <Link href="#" disabled>
                  禁用链接
                </Link>
              </Space>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">图标</h3>
              <Space>
                <Icon>
                  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </Icon>
                <Icon>
                  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Icon>
                <Icon>
                  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </Icon>
                <Icon>
                  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>
                </Icon>
              </Space>
            </div>
          </section>
        </Content>
      </Layout>

      <Footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <Text className="text-gray-300">
            Tigercat UI Library © 2024 - Built with React and Tailwind CSS
          </Text>
        </div>
      </Footer>
    </Layout>
  )
}

export default App
