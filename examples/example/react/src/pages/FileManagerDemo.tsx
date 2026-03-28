import { useState, useCallback } from 'react'
import { FileManager } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const files = [
  { key: '1', name: 'README.md', type: 'file' as const, size: 2048, modified: '2024-01-15' },
  { key: '2', name: 'src', type: 'folder' as const, modified: '2024-01-14' },
  { key: '3', name: 'package.json', type: 'file' as const, size: 512, modified: '2024-01-10' },
  { key: '4', name: 'dist', type: 'folder' as const, modified: '2024-01-13' },
  { key: '5', name: 'index.ts', type: 'file' as const, size: 1024, modified: '2024-01-12' }
]

const nestedFiles = [
  { key: '1', name: 'docs', type: 'folder' as const, children: [
    { key: '1-1', name: 'guide.md', type: 'file' as const, size: 1500 },
    { key: '1-2', name: 'api.md', type: 'file' as const, size: 3200 }
  ]},
  { key: '2', name: 'src', type: 'folder' as const, children: [
    { key: '2-1', name: 'index.ts', type: 'file' as const, size: 800 }
  ]},
  { key: '3', name: 'README.md', type: 'file' as const, size: 2048 }
]

const listSnippet = `<FileManager files={files} viewMode="list" searchable />`

const gridSnippet = `<FileManager files={files} viewMode="grid" />`

const multiSnippet = `<FileManager
  files={files} viewMode="list" multiple searchable
  currentPath={path} onNavigate={setPath} />`

const FileManagerDemo: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>([])

  const onNavigate = useCallback((path: string[]) => {
    setCurrentPath(path)
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">FileManager 文件管理器</h1>
      <p className="text-gray-500 mb-8">文件浏览管理组件，支持列表/网格视图和搜索。</p>

      <DemoBlock title="列表视图" description="默认列表模式，支持搜索" code={listSnippet}>
        <div style={{ height: 350, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <FileManager files={files} viewMode="list" searchable />
        </div>
      </DemoBlock>

      <DemoBlock title="网格视图" description="viewMode='grid'" code={gridSnippet}>
        <div style={{ height: 350, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <FileManager files={files} viewMode="grid" />
        </div>
      </DemoBlock>

      <DemoBlock title="多选 & 面包屑导航" description="multiple 多选" code={multiSnippet}>
        <div style={{ height: 350, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <FileManager
            files={nestedFiles}
            viewMode="list"
            multiple
            searchable
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        </div>
      </DemoBlock>
    </div>
  )
}

export default FileManagerDemo
