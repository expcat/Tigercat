import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

const DEFAULT_SKIP = ['node_modules', 'dist']

export function readText(path) {
  return readFileSync(path, 'utf8')
}

export function writeText(path, text) {
  writeFileSync(path, text)
}

export function readJson(path) {
  return JSON.parse(readText(path))
}

export function writeJson(path, value) {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`)
}

export function readJsonc(path) {
  return JSON.parse(stripJsonComments(readText(path)))
}

/** Recursively yield every file path under `dir`, skipping the given directories. */
export async function* walkFiles(dir, { skip = DEFAULT_SKIP } = {}) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (skip.includes(entry.name)) continue
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath, { skip })
    } else if (entry.isFile()) {
      yield fullPath
    }
  }
}

/** Recursively collect files under `dir` matching one of `extensions`, skipping `skip` dirs. */
export function collectFiles(dir, extensions, { skip = DEFAULT_SKIP } = {}) {
  const results = []
  if (!existsSync(dir)) return results
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (!skip.includes(entry)) {
        results.push(...collectFiles(full, extensions, { skip }))
      }
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      results.push(full)
    }
  }
  return results
}

// Strip line and block comments from JSONC source, preserving string contents.
function stripJsonComments(source) {
  let result = ''
  let inString = false
  let escaped = false

  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    const next = source[index + 1]

    if (inString) {
      result += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      result += char
      continue
    }

    if (char === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') {
        index++
      }
      result += source[index] ?? ''
      continue
    }

    if (char === '/' && next === '*') {
      index += 2
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        index++
      }
      index++
      continue
    }

    result += char
  }

  return result
}
