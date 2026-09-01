import { FileManager } from '@expcat/tigercat-react/FileManager'

const files = [
  {
    key: 'docs',
    name: 'docs',
    type: 'folder' as const,
    children: [{ key: 'guide', name: 'guide.md', type: 'file' as const, size: 1500 }]
  },
  {
    key: 'src',
    name: 'src',
    type: 'folder' as const,
    children: [{ key: 'index', name: 'index.ts', type: 'file' as const, size: 800 }]
  },
  { key: 'readme', name: 'README.md', type: 'file' as const, size: 2048 }
]

export default function App() {
  return <FileManager files={files} viewMode="list" multiple searchable style={{ height: 360 }} />
}
