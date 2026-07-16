import { useRef, useState } from 'react'
import { FileManager } from '@expcat/tigercat-react/FileManager'
import type { FileItem } from '@expcat/tigercat-core'

const initialFiles: FileItem[] = [
  { key: 'design', name: 'design.fig', type: 'file', extension: 'fig', size: 3_200_000 },
  { key: 'brief', name: 'brief.md', type: 'file', extension: 'md', size: 4_800 },
  { key: 'cover', name: 'cover.png', type: 'file', extension: 'png', size: 860_000 },
  { key: 'notes', name: 'notes.txt', type: 'file', extension: 'txt', size: 2_100 },
  { key: 'archive', name: 'archive.zip', type: 'file', extension: 'zip', size: 8_400_000 }
]

export default function App() {
  const [files, setFiles] = useState(initialFiles)
  const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>([])
  const [searchText, setSearchText] = useState('')
  const [activity, setActivity] = useState('选择、搜索、新建或删除文件以查看受控状态变化。')
  const nextFileId = useRef(1)

  const addFile = () => {
    const id = nextFileId.current++
    setFiles((current) => [
      ...current,
      { key: `draft-${id}`, name: `draft-${id}.md`, type: 'file', extension: 'md', size: 0 }
    ])
    setActivity(`已新建 draft-${id}.md`)
  }

  const removeSelectedFiles = () => {
    setFiles((current) => current.filter((item) => !selectedKeys.includes(item.key)))
    setActivity(`已删除 ${selectedKeys.length} 个文件`)
    setSelectedKeys([])
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
          onClick={addFile}>
          新建文件
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
          disabled={selectedKeys.length === 0}
          onClick={removeSelectedFiles}>
          删除选中
        </button>
      </div>
      <div className="h-96 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <FileManager
          files={files}
          viewMode="grid"
          multiple
          searchable
          selectedKeys={selectedKeys}
          searchText={searchText}
          onSelectedKeysChange={(keys) => {
            setSelectedKeys(keys)
            setActivity(`已选择 ${keys.length} 个文件`)
          }}
          onSearchTextChange={(text) => {
            setSearchText(text)
            setActivity(text ? `正在筛选“${text}”` : '已清除筛选')
          }}
          onOpen={(item) => setActivity(`打开文件：${item.name}`)}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
        {activity}
      </p>
    </div>
  )
}
