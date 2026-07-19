import { InputOTP } from '@expcat/tigercat-react/InputOTP'

export default function App() {
  return (
    <div className="w-full max-w-md space-y-4">
      <InputOTP length={4} size="sm" defaultValue="12" />
      <InputOTP length={4} size="md" status="error" errorMessage="验证码错误" defaultValue="99" />
      <InputOTP length={4} size="lg" disabled defaultValue="1234" />
    </div>
  )
}
