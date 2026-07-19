import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('input-otp')

export default function InputOtpDemo() {
  return (
    <DemoPage
      title="InputOTP 验证码输入"
      description="分格输入一次性验证码/PIN，支持粘贴分发、自动聚焦推进与掩码模式。"
      modules={modules}
    />
  )
}
