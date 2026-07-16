import { access, readFile, realpath } from 'node:fs/promises'
import { isAbsolute, join, relative } from 'node:path'

import { PACKAGE_VERSION } from './version'
import type { SkillSource } from './types'

export const DEFAULT_REMOTE_BASE_URL = 'https://expcat.github.io/Tigercat/mcp/'
export const DEFAULT_FETCH_TIMEOUT_MS = 15_000

export function createFsSource(root: string): SkillSource {
  return {
    kind: 'fs',
    origin: root,
    async readText(path) {
      const rootPath = await realpath(root)
      const filePath = await realpath(join(root, path))
      const relativePath = relative(rootPath, filePath)

      if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
        throw new Error(`Reference path escapes the Tigercat repo: ${path}`)
      }

      return readFile(filePath, 'utf8')
    },
    async probe(path) {
      await access(join(root, path))
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
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        accept: 'text/markdown, application/json;q=0.9, */*;q=0.8',
        'user-agent': `tigercat-mcp/${PACKAGE_VERSION}`
      }
    })

  const fetchText = async (path: string): Promise<string> => {
    const url = new URL(path, base)
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

export function normalizeBaseUrl(input: string): string {
  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    throw new Error(`Invalid Tigercat skills base URL: ${input}`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Tigercat skills base URL must use http or https: ${input}`)
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
