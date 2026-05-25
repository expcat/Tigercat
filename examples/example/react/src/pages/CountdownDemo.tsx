import { useMemo, useState } from 'react'
import { Card, Countdown, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Space size={32}>
  <Countdown title="活动结束" value={Date.now() + 2 * 60 * 60 * 1000} />
  <Countdown title="发售倒计时" value={Date.now() + 15 * 60 * 1000} format="mm:ss" />
</Space>`

const formatSnippet = `<Space size={32}>
  <Countdown title="跨天任务" value={Date.now() + 26 * 60 * 60 * 1000} format="D 天 HH:mm:ss" />
  <Countdown title="紧急窗口" value={Date.now() + 90 * 1000} prefix="T-" suffix=" remaining" />
</Space>`

const eventSnippet = `<Countdown
  title="付款保留时间"
  value={Date.now() + 10 * 1000}
  now={Date.now()}
  onFinish={() => setStatus('订单已释放')}
/>`

const CountdownDemo: React.FC = () => {
  const now = useMemo(() => Date.now(), [])
  const [status, setStatus] = useState('等待付款')

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">Countdown 倒计时</h1>
      <p className="text-gray-500 mb-8">
        展示目标时间的剩余时长，支持格式化、结束事件和稳定初始值。
      </p>

      <DemoBlock title="基本用法" description="使用目标时间展示剩余时长" code={basicSnippet}>
        <Space size={32}>
          <Countdown title="活动结束" value={now + 2 * 60 * 60 * 1000} now={now} />
          <Countdown title="发售倒计时" value={now + 15 * 60 * 1000} now={now} format="mm:ss" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="格式与前后缀"
        description="format 可组合天、时、分、秒和毫秒"
        code={formatSnippet}>
        <Space size={32}>
          <Countdown
            title="跨天任务"
            value={now + 26 * 60 * 60 * 1000}
            now={now}
            format="D 天 HH:mm:ss"
          />
          <Countdown
            title="紧急窗口"
            value={now + 90 * 1000}
            now={now}
            prefix="T-"
            suffix=" remaining"
          />
        </Space>
      </DemoBlock>

      <DemoBlock title="结束事件" description="倒计时归零时触发 onFinish" code={eventSnippet}>
        <Card style={{ width: 260 }}>
          <Countdown
            title="付款保留时间"
            value={now + 10 * 1000}
            now={now}
            onFinish={() => setStatus('订单已释放')}
          />
          <div className="mt-3 text-sm text-gray-500">{status}</div>
        </Card>
      </DemoBlock>
    </div>
  )
}

export default CountdownDemo
