import { Text } from '@expcat/tigercat-react/Text'

export default function App() {
  return (
    <div className="space-y-4">
      <Text tag="h1" size="2xl" weight="semibold">
        页面标题
      </Text>
      <Text tag="label" htmlFor="display-name">
        显示名
      </Text>
      <input id="display-name" type="text" className="block rounded border p-2" />
      <div dir="rtl" className="space-y-1">
        <Text align="start">start 贴起始边</Text>
        <Text align="end">end 贴结束边</Text>
      </div>
    </div>
  )
}
