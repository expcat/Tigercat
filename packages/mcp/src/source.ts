import { readFile, realpath } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { isAbsolute, join, relative } from 'node:path'

import { PACKAGE_VERSION } from './version'
import type { SkillSource } from './types'

export const DEFAULT_REMOTE_BASE_URL = 'https://expcat.github.io/Tigercat/mcp/'
export const DEFAULT_FETCH_TIMEOUT_MS = 15_000

/** Skill snapshot shipped next to this package (src/ and dist/ are both one level down). */
export function packagedSkillRoot(): string {
  return fileURLToPath(new URL('../snapshot', import.meta.url))
}

/**
 * Decode percent-encoding, then reject parent segments and absolute paths.
 * `skills/%2e%2e/package.json` must not leave the skill root.
 */
export function normalizeRelativePath(path: string): string {
  let decoded = path.replaceAll('\\', '/')
  for (let pass = 0; pass < 3; pass += 1) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch {
      throw new Error(`Reference path is not valid encoding: ${path}`)
    }
  }

  if (decoded.includes('\\') || decoded.includes('\0')) {
    throw new Error(`Reference path may not contain parent segments: ${path}`)
  }

  const normalized = decoded.replace(/^\.?\//, '')
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalized) || normalized.startsWith('//')) {
    throw new Error(`Reference path may not be absolute: ${path}`)
  }

  const parts = normalized.split('/').filter(Boolean)
  if (parts.some((part) => part === '..' || part === '.')) {
    throw new Error(`Reference path may not contain parent segments: ${path}`)
  }

  return parts.join('/')
}

async function resolveInsideRoot(root: string, path: string): Promise<string> {
  const normalized = normalizeRelativePath(path)
  const rootPath = await realpath(root)
  const filePath = await realpath(join(rootPath, normalized))
  const relativePath = relative(rootPath, filePath)

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Reference path escapes the Tigercat skill root: ${path}`)
  }

  return filePath
}

export function createFsSource(root: string): SkillSource {
  return {
    kind: 'fs',
    origin: root,
    async readText(path) {
      return readFile(await resolveInsideRoot(root, path), 'utf8')
    },
    async probe(path) {
      await resolveInsideRoot(root, path)
    }
  }
}

export function createHttpSource(
  baseUrl: string,
  options: { timeoutMs?: number } = {}
): SkillSource {
  const base = normalizeBaseUrl(baseUrl)
  const timeoutMs =
    Number.isFinite(options.timeoutMs) && (options.timeoutMs ?? 0) > 0
      ? Math.floor(options.timeoutMs as number)
      : DEFAULT_FETCH_TIMEOUT_MS
  // 缓存 Promise 以去重并发同路径请求;失败时移除,允许下次重试。
  const cache = new Map<string, Promise<string>>()

  const fetchOnce = (url: URL): Promise<Response> =>
    fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        accept: 'text/markdown, application/json;q=0.9, */*;q=0.8',
        'user-agent': `tigercat-mcp/${PACKAGE_VERSION}`
      }
    })

  const fetchText = async (path: string): Promise<string> => {
    const url = resolveRemoteSkillUrl(base, path)
    let response: Response
    try {
      try {
        response = await fetchOnce(url)
      } catch (error) {
        // 简单静态服务器（镜像站）在并发下可能重置连接；瞬时网络错误重试一次，超时不重试。
        if (error instanceof Error && error.name === 'TimeoutError') throw error
        response = await fetchOnce(url)
      }
    } catch (error) {
      throw new Error(
        fetchFailureMessage(url, error instanceof Error ? error.message : String(error)),
        { cause: error }
      )
    }

    if (response.status >= 300 && response.status < 400) {
      throw new Error(fetchFailureMessage(url, `redirect ${response.status} is not followed`))
    }

    if (!response.ok) {
      throw new Error(fetchFailureMessage(url, `HTTP ${response.status}`))
    }

    return response.text()
  }

  const readText = (path: string): Promise<string> => {
    let pending = cache.get(path)
    if (!pending) {
      pending = fetchText(path)
      pending.catch(() => cache.delete(path))
      cache.set(path, pending)
    }
    return pending
  }

  return {
    kind: 'http',
    origin: base,
    readText,
    async probe(path) {
      await readText(path)
    }
  }
}

export function resolveRemoteSkillUrl(base: string, path: string): URL {
  const normalized = normalizeRelativePath(path)
  const baseUrl = new URL(base)
  const url = new URL(normalized, baseUrl)

  if (url.origin !== baseUrl.origin) {
    throw new Error(`Reference URL leaves the skill origin: ${path}`)
  }

  const basePath = baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`
  if (!url.pathname.startsWith(basePath)) {
    throw new Error(`Reference URL leaves the skill directory: ${path}`)
  }

  return url
}

export function normalizeBaseUrl(input: string): string {
  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    throw new Error(`Invalid Tigercat skills base URL: ${input}`)
  }

  const loopback =
    parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost' || parsed.hostname === '::1'
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && loopback)) {
    throw new Error(`Tigercat skills base URL must use https: ${input}`)
  }

  // new URL(path, base) 会丢弃 base 中最后一段无尾斜杠的路径,必须补齐。
  if (!parsed.pathname.endsWith('/')) {
    parsed.pathname = `${parsed.pathname}/`
  }

  return parsed.toString()
}

function fetchFailureMessage(url: URL, reason: string): string {
  return `Failed to fetch Tigercat skill source (${reason}): ${url}. Use --root <repo> for local mode, or --base-url <mirror> if GitHub Pages is unreachable.`
}
