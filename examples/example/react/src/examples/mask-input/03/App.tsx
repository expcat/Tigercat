import { MaskInput } from '@expcat/tigercat-react/MaskInput'

export default function App() {
  return (
    <div className="w-full max-w-md space-y-4">
      <MaskInput mask="###-##-####" size="sm" defaultValue="123456789" clearable />
      <MaskInput
        mask="##/##/####"
        size="md"
        status="error"
        errorMessage="日期无效"
        defaultValue="1301"
      />
      <MaskInput mask="****-****" size="lg" defaultValue="ab12" clearable />
    </div>
  )
}
