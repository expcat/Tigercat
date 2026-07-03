import { NumberKeyboard } from '@expcat/tigercat-react/NumberKeyboard'
import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './NumberKeyboardDemo.tsx?raw'

const amountSnippet = `const [amount, setAmount] = useState('')

<Input value={amount} readonly prefix="¥" placeholder="输入金额" />
<NumberKeyboard
  mode="amount"
  value={amount}
  confirmText="完成"
  deleteText="退格"
  onChange={setAmount} />`

const phoneSnippet = `const [phone, setPhone] = useState('')

<Input value={phone} readonly placeholder="手机号" />
<NumberKeyboard mode="phone" value={phone} onChange={setPhone} />`

const idCardSnippet = `const [idCard, setIdCard] = useState('')

<Input value={idCard} readonly placeholder="身份证号" />
<NumberKeyboard mode="id-card" value={idCard} onChange={setIdCard} />`

export default function NumberKeyboardDemo() {
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [idCard, setIdCard] = useState('')
  const [confirmed, setConfirmed] = useState('')

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">NumberKeyboard 数字键盘</h1>
      <p className="text-gray-500 mb-8">移动端数字键盘，支持金额、手机号和身份证输入模式。</p>

      <DemoBlock
        title="金额输入"
        description="amount 模式支持小数点和默认两位小数"
        code={fullPageSnippet}>
        <div className="max-w-sm space-y-3">
          <Input value={amount} readonly prefix="¥" placeholder="输入金额" />
          <NumberKeyboard
            mode="amount"
            value={amount}
            confirmText="完成"
            deleteText="退格"
            onChange={setAmount}
            onConfirm={(value) => setConfirmed(value)}
          />
          <p className="text-sm text-gray-500">{confirmed ? `已确认：¥${confirmed}` : '未确认'}</p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="手机号输入"
        description="phone 模式默认限制 11 位数字"
        code={fullPageSnippet}>
        <div className="max-w-sm space-y-3">
          <Input value={phone} readonly placeholder="手机号" />
          <NumberKeyboard
            mode="phone"
            value={phone}
            onChange={setPhone}
            confirmText="完成"
            deleteText="退格"
          />
        </div>
      </DemoBlock>

      <DemoBlock title="身份证输入" description="id-card 模式允许末位输入 X" code={fullPageSnippet}>
        <div className="max-w-sm space-y-3">
          <Input value={idCard} readonly placeholder="身份证号" />
          <NumberKeyboard
            mode="id-card"
            value={idCard}
            onChange={setIdCard}
            confirmText="完成"
            deleteText="退格"
          />
        </div>
      </DemoBlock>
    </div>
  )
}
