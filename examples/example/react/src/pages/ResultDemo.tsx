import { Result, Button, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const statusSnippet = `<Result status="success" title="操作成功" subTitle="订单已提交，预计2小时内送达" />
<Result status="error" title="提交失败" subTitle="请检查网络连接后重试" />
<Result status="warning" title="警告提示" subTitle="当前操作存在风险" />
<Result status="info" title="提示信息" subTitle="这是一条普通信息提示" />`

const httpSnippet = `<Result status="403" title="403" subTitle="抱歉，您没有权限访问此页面" />
<Result status="404" title="404" subTitle="抱歉，您访问的页面不存在" />
<Result status="500" title="500" subTitle="服务器出错了，请稍后重试" />`

const customSnippet = `<Result status="success" title="购买成功"
  extra={<Space><Button variant="primary">返回首页</Button><Button variant="secondary">查看订单</Button></Space>}
/>`

const ResultDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Result 结果页</h1>
      <p className="text-gray-500 mb-8">用于反馈操作结果，包括成功、失败、警告和 HTTP 状态码。</p>

      <DemoBlock title="状态类型" description="success / error / warning / info 四种基础状态" code={statusSnippet}>
        <Space direction="vertical" size={24} className="w-full">
          <div className="border rounded-lg p-6"><Result status="success" title="操作成功" subTitle="订单已提交，预计2小时内送达" /></div>
          <div className="border rounded-lg p-6"><Result status="error" title="提交失败" subTitle="请检查网络连接后重试" /></div>
          <div className="border rounded-lg p-6"><Result status="warning" title="警告提示" subTitle="当前操作存在风险" /></div>
          <div className="border rounded-lg p-6"><Result status="info" title="提示信息" subTitle="这是一条普通信息提示" /></div>
        </Space>
      </DemoBlock>

      <DemoBlock title="HTTP 状态码" description="403 / 404 / 500 页面" code={httpSnippet}>
        <Space direction="vertical" size={24} className="w-full">
          <div className="border rounded-lg p-6"><Result status="403" title="403" subTitle="抱歉，您没有权限访问此页面" /></div>
          <div className="border rounded-lg p-6"><Result status="404" title="404" subTitle="抱歉，您访问的页面不存在" /></div>
          <div className="border rounded-lg p-6"><Result status="500" title="500" subTitle="服务器出错了，请稍后重试" /></div>
        </Space>
      </DemoBlock>

      <DemoBlock title="自定义操作按钮" description="通过 extra 添加操作按钮" code={customSnippet}>
        <div className="border rounded-lg p-6">
          <Result status="success" title="购买成功"
            extra={<Space><Button variant="primary">返回首页</Button><Button variant="secondary">查看订单</Button></Space>} />
        </div>
      </DemoBlock>
    </div>
  )
}

export default ResultDemo
