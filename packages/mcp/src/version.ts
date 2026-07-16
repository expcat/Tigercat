import { readFileSync } from 'node:fs'

// src/ 与 dist/ 均位于包根下一层,../package.json 在两种布局下都指向本包清单;
// 版本由 scripts/sync-version.mjs 统一写入,运行时读取避免再出现硬编码漂移。
export const PACKAGE_VERSION: string = (() => {
  try {
    const raw = readFileSync(new URL('../package.json', import.meta.url), 'utf8')
    const version = (JSON.parse(raw) as { version?: unknown }).version
    return typeof version === 'string' && version ? version : '0.0.0'
  } catch {
    return '0.0.0'
  }
})()
