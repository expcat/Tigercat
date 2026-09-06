import { useState } from 'react'
import { AutoComplete } from '@expcat/tigercat-react/AutoComplete'

const options = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' }
]

export default function App() {
  const [value, setValue] = useState<string | number | undefined>()
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--tiger-text-muted)]">
        打字只改 searchValue；点选或回车才改 value。
      </p>
      <AutoComplete
        value={value}
        onChange={setValue}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        options={options}
        allowFreeInput
        placeholder="输入或选择框架"
        className="w-full max-w-sm"
      />
      <p className="text-sm text-[var(--tiger-text-muted)]">
        query: {searchValue || '空'} · value: {value ?? '未提交'}
      </p>
    </div>
  )
}
