#!/usr/bin/env node

/**
 * check-doc-links.mjs — Markdown 链接与锚点校验
 *
 * 校验仓库内全部 Markdown 的相对链接目标存在，且 `#anchor` 片段能对应到目标
 * 文件的实际标题。外部 http(s) 链接不做网络请求，只校验协议格式。
 *
 * 用法：node scripts/check-doc-links.mjs [--json]
 */

import { existsSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectFiles, readText } from './utils/files.mjs'
import { c } from './utils/term.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jsonMode = process.argv.includes('--json')

const SKIP_DIRS = [
  'node_modules',
  '.git',
  'dist',
  '.nuxt',
  '.next',
  '.output',
  'playwright-report',
  'test-results',
  '.tigercat-playground'
]

const issues = []

function addIssue(file, line, rule, message) {
  issues.push({ file: relative(ROOT, file), line, rule, message })
}

/**
 * GitHub 风格的标题 slug：小写、去除非字母数字（保留连字符与 CJK）、空格转连字符。
 * 重复标题按出现顺序追加 `-1`、`-2`。
 */
function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

const anchorCache = new Map()

function collectAnchors(filePath) {
  if (anchorCache.has(filePath)) return anchorCache.get(filePath)

  const anchors = new Set()
  const seen = new Map()
  let inFence = false

  for (const rawLine of readText(filePath).split(/\r?\n/)) {
    if (/^\s*```/.test(rawLine)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const heading = rawLine.match(/^#{1,6}\s+(.*)$/)
    if (heading) {
      const slug = slugify(heading[1])
      if (!slug) continue
      const count = seen.get(slug) ?? 0
      seen.set(slug, count + 1)
      anchors.add(count === 0 ? slug : `${slug}-${count}`)
      continue
    }

    // 显式锚点：<a id="x"> / <a name="x">
    for (const match of rawLine.matchAll(/<a\s+(?:id|name)=["']([^"']+)["']/g)) {
      anchors.add(match[1].toLowerCase())
    }
  }

  anchorCache.set(filePath, anchors)
  return anchors
}

const markdownFiles = collectFiles(ROOT, ['.md'], { skip: SKIP_DIRS })

for (const filePath of markdownFiles) {
  const lines = readText(filePath).split(/\r?\n/)
  let inFence = false

  lines.forEach((rawLine, index) => {
    if (/^\s*```/.test(rawLine)) {
      inFence = !inFence
      return
    }
    if (inFence) return

    const lineNumber = index + 1
    // 行内代码里的链接不算引用
    const line = rawLine.replace(/`[^`]*`/g, '')

    for (const match of line.matchAll(/(!?)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const isImage = match[1] === '!'
      const target = match[2]

      if (/^(https?:|mailto:|tel:)/i.test(target)) continue
      if (target.startsWith('<')) continue

      // 纯页内锚点
      if (target.startsWith('#')) {
        const anchor = decodeURIComponent(target.slice(1)).toLowerCase()
        if (!collectAnchors(filePath).has(anchor)) {
          addIssue(filePath, lineNumber, 'anchor', `页内锚点 "${target}" 无对应标题`)
        }
        continue
      }

      const [rawPath, rawAnchor] = target.split('#')
      const resolvedPath = resolve(dirname(filePath), decodeURIComponent(rawPath))

      if (!existsSync(resolvedPath)) {
        addIssue(filePath, lineNumber, 'link', `链接目标不存在："${target}"`)
        continue
      }

      if (isImage || !rawAnchor) continue

      if (statSync(resolvedPath).isDirectory()) {
        addIssue(filePath, lineNumber, 'anchor', `目录链接不能带锚点："${target}"`)
        continue
      }

      if (!resolvedPath.endsWith('.md')) continue

      const anchor = decodeURIComponent(rawAnchor).toLowerCase()
      if (!collectAnchors(resolvedPath).has(anchor)) {
        addIssue(
          filePath,
          lineNumber,
          'anchor',
          `"${relative(ROOT, resolvedPath)}" 中无锚点 "#${rawAnchor}"`
        )
      }
    }
  })
}

if (jsonMode) {
  console.log(JSON.stringify({ files: markdownFiles.length, issues }, null, 2))
  process.exit(issues.length > 0 ? 1 : 0)
}

if (issues.length === 0) {
  console.log(c('green', `✅ ${markdownFiles.length} 个 Markdown 文件的链接与锚点全部有效`))
  process.exit(0)
}

console.error(c('red', `❌ 发现 ${issues.length} 处失效链接/锚点：`))
for (const issue of issues) {
  console.error(`  ${c('yellow', `${issue.file}:${issue.line}`)} [${issue.rule}] ${issue.message}`)
}
process.exit(1)
