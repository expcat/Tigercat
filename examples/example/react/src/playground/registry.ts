import type {
  DemoModuleDescriptor,
  DemoModuleMeta,
  DemoSourceBundle
} from '@demo-shared/playground/types'

type SourceLoader = () => Promise<string>

const metadata = import.meta.glob('../examples/*/*/demo.json', {
  eager: true,
  import: 'default'
}) as Record<string, DemoModuleMeta>

const sourceLoaders = import.meta.glob('../examples/*/*/*.{ts,tsx,js,jsx,css,json}', {
  query: '?raw',
  import: 'default'
}) as Record<string, SourceLoader>

function hashSources(files: Record<string, string>): string {
  let hash = 2166136261
  for (const [name, source] of Object.entries(files).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const text = `${name}\0${source}`
    for (let index = 0; index < text.length; index++) {
      hash ^= text.charCodeAt(index)
      hash = Math.imul(hash, 16777619)
    }
  }
  return (hash >>> 0).toString(36)
}

function parseMetadataPath(path: string): { route: string; directory: string } {
  const match = /^\.\.\/examples\/([^/]+)\/([^/]+)\/demo\.json$/.exec(path)
  if (!match) throw new Error(`无效的 React 示例元数据路径：${path}`)
  return { route: match[1], directory: `../examples/${match[1]}/${match[2]}/` }
}

function createDescriptor(path: string, meta: DemoModuleMeta): DemoModuleDescriptor {
  const { route, directory } = parseMetadataPath(path)
  return {
    framework: 'react',
    route,
    meta,
    async loadSource(): Promise<DemoSourceBundle> {
      const entries = Object.entries(sourceLoaders).filter(
        ([sourcePath]) => sourcePath.startsWith(directory) && !sourcePath.endsWith('/demo.json')
      )
      const files: Record<string, string> = {}
      await Promise.all(
        entries.map(async ([sourcePath, load]) => {
          files[`/${sourcePath.slice(directory.length)}`] = await load()
        })
      )
      if (!files[`/${meta.entry}`])
        throw new Error(`示例入口不存在：${route}/${meta.id}/${meta.entry}`)
      return { entry: `/${meta.entry}`, files, sourceHash: hashSources(files) }
    }
  }
}

const descriptors = Object.entries(metadata).map(([path, meta]) => createDescriptor(path, meta))

export function getDemoModules(route: string): DemoModuleDescriptor[] {
  return descriptors
    .filter((descriptor) => descriptor.route === route)
    .sort((left, right) => left.meta.order - right.meta.order)
}
