import { Dropdown } from '@expcat/tigercat-react/Dropdown'

const items = [
  { key: 'edit', label: '编辑', shortcut: 'E' },
  { key: 'pin', type: 'checkbox' as const, label: '固定', checked: true },
  { key: 'drop', type: 'danger' as const, label: '删除' }
]

export default function App() {
  return <Dropdown items={items}>操作</Dropdown>
}
