import { useCallback, useState } from 'react'
import { FileManager } from '@expcat/tigercat-react/FileManager'

const files = [
  { key: '1', name: 'README.md', type: 'file' as const, size: 2048, modified: '2024-01-15' },
  { key: '2', name: 'src', type: 'folder' as const, modified: '2024-01-14' },
  { key: '3', name: 'package.json', type: 'file' as const, size: 512, modified: '2024-01-10' },
  { key: '4', name: 'dist', type: 'folder' as const, modified: '2024-01-13' }
]

const nestedFiles = [
  {
    key: '1',
    name: 'docs',
    type: 'folder' as const,
    children: [
      { key: '1-1', name: 'guide.md', type: 'file' as const, size: 1500 },
      { key: '1-2', name: 'api.md', type: 'file' as const, size: 3200 }
    ]
  },
  { key: '2', name: 'README.md', type: 'file' as const, size: 2048 }
]

export default function FileManagerDemoFixture() {
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const onNavigate = useCallback((path: string[]) => setCurrentPath(path), [])

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">列表视图</h3>
        <div style={{ height: 320, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <FileManager files={files} viewMode="list" searchable />
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          多选 & 面包屑导航
        </h3>
        <div style={{ height: 320, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <FileManager
            files={nestedFiles}
            viewMode="list"
            multiple
            searchable
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        </div>
      </section>
    </div>
  )
}
