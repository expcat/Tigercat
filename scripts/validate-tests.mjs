#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

import { c } from './utils/term.mjs'

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(fullPath)
    } else if (entry.isFile()) {
      yield fullPath
    }
  }
}

function countArrayItems(source) {
  const body = source.trim().replace(/^\[/, '').replace(/\]$/, '').trim()
  if (!body) return 0

  let depth = 0
  let count = 1
  let quote = null

  for (let index = 0; index < body.length; index++) {
    const char = body[index]
    const prev = body[index - 1]

    if (quote) {
      if (char === quote && prev !== '\\') quote = null
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
    } else if (char === '[' || char === '{' || char === '(') {
      depth++
    } else if (char === ']' || char === '}' || char === ')') {
      depth--
    } else if (char === ',' && depth === 0) {
      count++
    }
  }

  return count
}

function getArrayConstantCounts(content) {
  const counts = new Map()
  const regex = /(?:const|let|var)\s+(\w+)\s*=\s*(\[[\s\S]*?\])\s*(?:as\s+const)?/g
  let match

  while ((match = regex.exec(content))) {
    counts.set(match[1], countArrayItems(match[2]))
  }

  return counts
}

function countTests(content) {
  let total = (content.match(/\bit\s*\(/g) || []).length
  total += (content.match(/\btest\s*\(/g) || []).length

  const arrayCounts = getArrayConstantCounts(content)
  const eachRegex = /\b(?:it|test)\.each\s*\(\s*([\s\S]*?)\s*\)\s*\(/g
  let match

  while ((match = eachRegex.exec(content))) {
    const expression = match[1].trim()
    if (expression.startsWith('[')) {
      total += countArrayItems(expression)
    } else {
      total += arrayCounts.get(expression) ?? 1
    }
  }

  return total
}

function hasFocusedTests(content) {
  const stripped = stripCommentLines(content)
  return /\b(?:describe|it|test)\.only\s*\(/.test(stripped)
}

function stripCommentLines(content) {
  return content
    .split(/\r?\n/g)
    .filter((line) => {
      const trimmed = line.trim()
      return !(
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('*/')
      )
    })
    .join('\n')
}

function checkTestStructure(filePath, content, counters) {
  const describeCount = (content.match(/\bdescribe\s*\(/g) || []).length
  if (describeCount === 0) {
    console.log(c('yellow', '  ⚠ No describe blocks — consider grouping tests'))
    counters.warnings++
    return false
  }
  return true
}

const descriptiveNameWords = [
  'should',
  'snapshot',
  'render',
  'display',
  'emit',
  'trigger',
  'accept',
  'reject',
  'throw',
  'return',
  'call',
  'when',
  'with',
  'without',
  'not ',
  'handle',
  'support',
  'allow',
  'prevent',
  'disable',
  'enable',
  'show',
  'hide',
  'open',
  'close',
  'toggle',
  'update',
  'set',
  'clear',
  'reset',
  'apply',
  'remove',
  'add',
  'create',
  'delete',
  'select',
  'validate',
  'format',
  'parse',
  'convert',
  'calculate',
  'compute',
  'respond',
  'fire',
  'navigate',
  'focus',
  'blur',
  'scroll',
  'resize',
  'change',
  'submit',
  'cancel',
  'confirm',
  'dismiss',
  'load',
  'fetch',
  'default'
]

function getTestNames(content) {
  const names = []
  const directRegex =
    /\b(?:it|test)(?:\.(?:skip|todo|concurrent|fails))?\s*\(\s*(['"`])([\s\S]*?)\1/g
  const eachRegex = /\b(?:it|test)\.each\s*\([\s\S]*?\)\s*\(\s*(['"`])([\s\S]*?)\1/g
  let match

  while ((match = directRegex.exec(content))) {
    names.push(match[2])
  }

  while ((match = eachRegex.exec(content))) {
    names.push(match[2])
  }

  return names
}

function isDescriptiveTestName(name) {
  const lower = name.toLowerCase()
  return descriptiveNameWords.some((word) => lower.includes(word))
}

function checkTestNaming(filePath, content, counters) {
  const names = getTestNames(content)
  const total = names.length
  const descriptive = names.filter(isDescriptiveTestName).length

  if (total > 0 && descriptive / total < 0.5) {
    console.log(c('yellow', `  ⚠ Low descriptive naming ratio (${descriptive}/${total})`))
    counters.warnings++
    return false
  }

  return true
}

function checkEdgeCases(content, counters) {
  if (/describe\s*\([^\n]*(Edge Cases|Boundary)/m.test(content)) return true
  console.log(c('yellow', '  ⚠ No Edge Cases or Boundary tests'))
  counters.warnings++
  return false
}

function checkAccessibility(filePath, content, counters) {
  if (/^use[A-Z].*\.spec\.(ts|tsx)$/.test(path.basename(filePath))) return true

  if (content.includes('expectNoA11yViolations')) return true
  console.log(c('yellow', '  ⚠ No accessibility checks'))
  counters.warnings++
  return false
}

function checkTypeSafety(content, counters) {
  const stripped = stripCommentLines(content)
  if (/:\s*any\b/.test(stripped)) {
    console.log(c('yellow', "  ⚠ Found 'any' type usage"))
    counters.warnings++
    return false
  }
  return true
}

// Component specs must have at least this many tests to pass.
function hardMinTests() {
  return 3
}

// Soft minimum: below this count triggers a warning
function softMinTestsForFile(filename) {
  if (
    filename.includes('Upload') ||
    filename.includes('DatePicker') ||
    filename.includes('TimePicker')
  )
    return 30
  return 15
}

function isComponentSpec(filePath) {
  return (
    filePath.startsWith(`tests${path.sep}react${path.sep}`) ||
    filePath.startsWith(`tests${path.sep}vue${path.sep}`)
  )
}

async function main() {
  const counters = {
    totalFiles: 0,
    passedFiles: 0,
    failedFiles: 0,
    warnings: 0
  }

  console.log('🐯 Tigercat Test Quality Validation')
  console.log('====================================')
  console.log('')

  console.log('Scanning test files...')
  console.log('')

  const testDirsEnv = process.env.TEST_DIRS
  const testDirs = (
    testDirsEnv ? testDirsEnv.split(/\s+/g) : ['tests/core', 'tests/react', 'tests/vue']
  ).filter(Boolean)

  const testFiles = []
  for (const dir of testDirs) {
    try {
      for await (const filePath of walk(dir)) {
        if (filePath.endsWith('.spec.ts') || filePath.endsWith('.spec.tsx'))
          testFiles.push(filePath)
      }
    } catch {
      // ignore missing dir
    }
  }

  if (testFiles.length === 0) {
    console.log(c('red', `No test files found in: ${testDirs.join(' ')}`))
    console.log('Set TEST_DIRS to customize directories.')
    process.exit(1)
  }

  for (const filePath of testFiles) {
    counters.totalFiles++
    const filename = path.basename(filePath)

    console.log(c('blue', `Checking: ${filename}`))

    const content = readFileSync(filePath, 'utf8')

    const testCount = countTests(content)
    const componentSpec = isComponentSpec(filePath)
    const hardMin = hardMinTests()
    const softMin = softMinTestsForFile(filename)

    console.log(`  📊 Test count: ${testCount}`)

    let errors = 0 // hard failures
    let softIssues = 0 // warnings only

    // --- Hard checks (cause file to fail) ---
    if (componentSpec && testCount < hardMin) {
      console.log(c('red', `  ✗ Below hard minimum (${hardMin})`))
      errors++
    }
    if (hasFocusedTests(content)) {
      console.log(c('red', '  ✗ Focused test detected (.only)'))
      errors++
    }
    if (!checkTypeSafety(content, counters)) errors++

    // --- Soft checks (warnings, don't cause failure) ---
    if (testCount < softMin && (!componentSpec || testCount >= hardMin)) {
      console.log(c('yellow', `  ⚠ Below recommended minimum (${softMin})`))
      counters.warnings++
    }
    if (!checkTestStructure(filePath, content, counters)) softIssues++
    if (!checkTestNaming(filePath, content, counters)) softIssues++
    if (!checkEdgeCases(content, counters)) softIssues++
    if (componentSpec && !checkAccessibility(filePath, content, counters)) softIssues++

    if (errors === 0) {
      if (softIssues === 0) {
        console.log(c('green', '  ✓ All checks passed'))
      } else {
        console.log(c('green', `  ✓ Passed (${softIssues} suggestion(s))`))
      }
      counters.passedFiles++
    } else {
      console.log(c('red', `  ✗ ${errors} error(s), ${softIssues} suggestion(s)`))
      counters.failedFiles++
    }

    console.log('')
  }

  console.log('====================================')
  console.log('📈 Summary')
  console.log('====================================')
  console.log(
    `Total: ${counters.totalFiles} | ${c(
      'green',
      `Passed: ${counters.passedFiles}`
    )} | ${c('red', `Failed: ${counters.failedFiles}`)} | ${c(
      'yellow',
      `Warnings: ${counters.warnings}`
    )}`
  )
  console.log('')

  if (counters.failedFiles > 0) {
    console.log(c('red', '❌ Validation failed'))
    console.log('See tests/TEST_QUALITY_GUIDELINES.md for standards.')
    process.exit(1)
  }

  console.log(c('green', '✅ All tests meet quality standards'))
  if (counters.warnings > 0)
    console.log(
      c('yellow', `Note: ${counters.warnings} warning(s) - consider addressing for better quality`)
    )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
