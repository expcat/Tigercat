<script setup lang="ts">
import { ref } from 'vue'
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
} from '@tigercat/vue'

// Form data
const username = ref('')
const password = ref('')
const bio = ref('')
const agree = ref(false)
const fruits = ref<string[]>([])
const gender = ref('')
const notifications = ref(true)
const volume = ref(50)
const country = ref('')

// Select options
const countries = [
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
  { label: '日本', value: 'japan' },
]

const handleSubmit = (data: any) => {
  console.log('Form submitted:', data)
  alert('表单提交成功！查看控制台获取数据。')
}
</script>

<template>
  <Layout class="min-h-screen">
    <Header class="bg-blue-600 text-white p-4">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold">Tigercat Vue3 组件演示</h1>
      </div>
    </Header>
    
    <Layout class="container mx-auto p-6">
      <Sidebar class="w-64 p-4 bg-gray-100 rounded-lg mr-6">
        <nav>
          <h2 class="text-lg font-semibold mb-4">组件导航</h2>
          <ul class="space-y-2">
            <li><Link href="#buttons">按钮</Link></li>
            <li><Link href="#forms">表单</Link></li>
            <li><Link href="#layout">布局</Link></li>
            <li><Link href="#typography">文本</Link></li>
          </ul>
        </nav>
      </Sidebar>
      
      <Content class="flex-1">
        <!-- Buttons Section -->
        <section id="buttons" class="mb-12">
          <h2 class="text-2xl font-bold mb-6">按钮组件</h2>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">按钮类型</h3>
            <Space>
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="link">链接按钮</Button>
            </Space>
          </div>

          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">按钮大小</h3>
            <Space align="center">
              <Button size="sm">小按钮</Button>
              <Button size="md">中按钮</Button>
              <Button size="lg">大按钮</Button>
            </Space>
          </div>

          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">按钮状态</h3>
            <Space>
              <Button>正常按钮</Button>
              <Button disabled>禁用按钮</Button>
              <Button loading>加载中</Button>
            </Space>
          </div>

          <Divider />
        </section>

        <!-- Forms Section -->
        <section id="forms" class="mb-12">
          <h2 class="text-2xl font-bold mb-6">表单组件</h2>
          
          <Form @submit="handleSubmit" class="max-w-2xl">
            <FormItem label="用户名" required>
              <Input v-model="username" placeholder="请输入用户名" />
            </FormItem>

            <FormItem label="密码" required>
              <Input v-model="password" type="password" placeholder="请输入密码" />
            </FormItem>

            <FormItem label="个人简介">
              <Textarea v-model="bio" placeholder="介绍一下你自己..." :rows="4" />
            </FormItem>

            <FormItem label="性别">
              <RadioGroup v-model="gender">
                <Radio value="male">男</Radio>
                <Radio value="female">女</Radio>
                <Radio value="other">其他</Radio>
              </RadioGroup>
            </FormItem>

            <FormItem label="喜欢的水果">
              <CheckboxGroup v-model="fruits">
                <Checkbox value="apple">苹果</Checkbox>
                <Checkbox value="banana">香蕉</Checkbox>
                <Checkbox value="orange">橙子</Checkbox>
              </CheckboxGroup>
            </FormItem>

            <FormItem label="国家">
              <Select v-model="country" :options="countries" placeholder="请选择国家" />
            </FormItem>

            <FormItem label="开启通知">
              <Switch v-model="notifications" />
            </FormItem>

            <FormItem label="音量">
              <Slider v-model="volume" :min="0" :max="100" />
              <Text class="ml-3">{{ volume }}%</Text>
            </FormItem>

            <FormItem>
              <Checkbox v-model="agree">我同意用户协议</Checkbox>
            </FormItem>

            <FormItem>
              <Space>
                <Button type="submit" variant="primary">提交</Button>
                <Button type="reset" variant="secondary">重置</Button>
              </Space>
            </FormItem>
          </Form>

          <Divider />
        </section>

        <!-- Layout Section -->
        <section id="layout" class="mb-12">
          <h2 class="text-2xl font-bold mb-6">布局组件</h2>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">栅格系统</h3>
            <Container>
              <Row :gutter="16" class="mb-4">
                <Col :span="12">
                  <div class="bg-blue-500 text-white p-4 rounded">Col-12</div>
                </Col>
                <Col :span="12">
                  <div class="bg-blue-500 text-white p-4 rounded">Col-12</div>
                </Col>
              </Row>
              
              <Row :gutter="16" class="mb-4">
                <Col :span="8">
                  <div class="bg-green-500 text-white p-4 rounded">Col-8</div>
                </Col>
                <Col :span="8">
                  <div class="bg-green-500 text-white p-4 rounded">Col-8</div>
                </Col>
                <Col :span="8">
                  <div class="bg-green-500 text-white p-4 rounded">Col-8</div>
                </Col>
              </Row>
              
              <Row :gutter="16">
                <Col :span="6">
                  <div class="bg-purple-500 text-white p-4 rounded">Col-6</div>
                </Col>
                <Col :span="6">
                  <div class="bg-purple-500 text-white p-4 rounded">Col-6</div>
                </Col>
                <Col :span="6">
                  <div class="bg-purple-500 text-white p-4 rounded">Col-6</div>
                </Col>
                <Col :span="6">
                  <div class="bg-purple-500 text-white p-4 rounded">Col-6</div>
                </Col>
              </Row>
            </Container>
          </div>

          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">空间组件</h3>
            <Space direction="vertical">
              <Text>垂直排列的元素 1</Text>
              <Text>垂直排列的元素 2</Text>
              <Text>垂直排列的元素 3</Text>
            </Space>
          </div>

          <Divider />
        </section>

        <!-- Typography Section -->
        <section id="typography" class="mb-12">
          <h2 class="text-2xl font-bold mb-6">文本组件</h2>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">文本样式</h3>
            <Space direction="vertical">
              <Text color="primary">主要文本</Text>
              <Text color="secondary">次要文本</Text>
              <Text color="success">成功文本</Text>
              <Text color="warning">警告文本</Text>
              <Text color="danger">危险文本</Text>
            </Space>
          </div>

          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">链接</h3>
            <Space>
              <Link href="https://github.com/expcats/Tigercat" target="_blank">GitHub 仓库</Link>
              <Link href="#" disabled>禁用链接</Link>
            </Space>
          </div>

          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">图标</h3>
            <Space>
              <Icon>
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              </Icon>
              <Icon>
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </Icon>
              <Icon>
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              </Icon>
              <Icon>
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>
              </Icon>
            </Space>
          </div>
        </section>
      </Content>
    </Layout>
    
    <Footer class="bg-gray-800 text-white p-4 mt-8">
      <div class="container mx-auto text-center">
        <Text class="text-gray-300">
          Tigercat UI Library © 2024 - Built with Vue 3 and Tailwind CSS
        </Text>
      </div>
    </Footer>
  </Layout>
</template>
