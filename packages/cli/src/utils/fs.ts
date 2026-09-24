import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'

export function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

export function writeFileSafe(filePath: string, content: string) {
  ensureDir(dirname(filePath))
  writeFileSync(filePath, content, 'utf-8')
}

export function isDirEmpty(dir: string): boolean {
  if (!existsSync(dir)) return true
  return readdirSync(dir).length === 0
}

export function readFileSafe(filePath: string): string | null {
  if (!existsSync(filePath)) return null
  return readFileSync(filePath, 'utf-8')
}

/** Refuse a write whose resolved path leaves the target project. */
export function assertInsideProject(projectRoot: string, target: string): void {
  const root = resolve(projectRoot)
  const resolved = resolve(target)
  const relativePath = relative(root, resolved)
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Refusing to write outside the project: ${resolved}`)
  }
}
