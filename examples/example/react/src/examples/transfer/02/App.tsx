import { useState } from 'react'
import type { TransferDirection, TransferItem, TransferSearchValue } from '@expcat/tigercat-core'
import { Transfer } from '@expcat/tigercat-react/Transfer'

const dataSource: TransferItem[] = [
  { key: 'auth', label: '鉴权服务', description: '核心权限' },
  { key: 'billing', label: '计费服务', description: '财务商业' },
  { key: 'search', label: '搜索服务', description: '内容检索' },
  { key: 'legacy', label: '旧版报表（只读）', description: '归档系统', disabled: true },
  { key: 'observability', label: '监控服务', description: '核心运维' }
]

export default function ControlledTransferExample() {
  const [targetKeys, setTargetKeys] = useState<Array<string | number>>(['observability'])
  const [searchValue, setSearchValue] = useState<TransferSearchValue>({})
  const [lastMove, setLastMove] = useState('尚未移动项目')

  const handleChange = (
    nextTargetKeys: Array<string | number>,
    direction: TransferDirection,
    movedKeys: Array<string | number>
  ) => {
    setTargetKeys(nextTargetKeys)
    setLastMove(`${direction === 'right' ? '加入' : '移出'}：${movedKeys.join(', ')}`)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">默认过滤会匹配名称和 description，例如搜「核心」。</p>
      <Transfer
        value={targetKeys}
        dataSource={dataSource}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onChange={handleChange}
        searchable
        size="sm"
        sourceTitle="待分配服务"
        targetTitle="已启用服务"
        className="max-w-3xl"
      />
      <p role="status" className="text-sm text-gray-500">
        已选 {targetKeys.length} 项；{lastMove}
      </p>
    </div>
  )
}
