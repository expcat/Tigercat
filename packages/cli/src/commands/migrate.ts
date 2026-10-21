import { Command } from 'commander'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import removed from '../removed-names.json' with { type: 'json' }
import { logError, logInfo, logSuccess } from '../utils/logger'
import { writeFileSafe } from '../utils/fs'

const SKIP_DIRS = new Set(['node_modules', 'dist', 'dist-ssr', '.git', 'coverage'])
const FILE_RE = /\.(?:[cm]?[jt]sx?|vue)$/
const JSX_FILE_RE = /\.[jt]sx$/

type TigercatPackage = 'core' | 'vue' | 'react'

const REMOVED_NAMES = removed.names as Record<string, string>
const REMOVED_NAMES_BY_PACKAGE = removed.namesByPackage as Record<
  string,
  Record<TigercatPackage, string>
>
const REMOVED_SPECIFIERS = removed.specifiers as Record<string, string>

function tigercatPackage(specifier: string): TigercatPackage | null {
  const match = /^@expcat\/tigercat-(core|vue|react)(?:\/|$)/.exec(specifier)
  return (match?.[1] as TigercatPackage | undefined) ?? null
}

function replacementName(oldName: string, pkg: TigercatPackage): string | undefined {
  return REMOVED_NAMES_BY_PACKAGE[oldName]?.[pkg] ?? REMOVED_NAMES[oldName]
}

/**
 * Rewrite only the module specifier: a removed subpath owns its exact path and
 * any slash-delimited suffix, then a trailing segment can be a removed module
 * name (component subpaths).
 */
function rewriteSpecifier(specifier: string): string {
  const exact = REMOVED_SPECIFIERS[specifier]
  if (exact) return exact
  for (const [oldSpecifier, newSpecifier] of Object.entries(REMOVED_SPECIFIERS)) {
    if (specifier.startsWith(`${oldSpecifier}/`)) {
      return `${newSpecifier}${specifier.slice(oldSpecifier.length)}`
    }
  }
  for (const [oldName, newName] of Object.entries(REMOVED_NAMES)) {
    if (specifier.endsWith(`/${oldName}`)) {
      return `${specifier.slice(0, -oldName.length)}${newName}`
    }
  }
  return specifier
}

/** A half-open [start, end) span in the source text. */
interface Span {
  start: number
  end: number
}

/** One `name` or `name as alias` entry of an import/export `{ ... }` clause. */
interface NamedBinding {
  /** Span of the imported/exported name token; the alias is never rewritten. */
  name: Span
  value: string
  hasAlias: boolean
}

/** An import/export declaration with a static string module specifier. */
interface ModuleDeclaration {
  /** Offset just past the specifier's closing quote. */
  end: number
  /** Span of the specifier text between its quotes. */
  specifier: Span
  /** `{ ... }` clause entries; empty for the other import forms. */
  bindings: NamedBinding[]
}

/**
 * Cursor over source text that treats whitespace and comments as trivia, so
 * declarations survive line breaks and comments inside the binding clause.
 */
class Cursor {
  pos: number

  constructor(
    private readonly text: string,
    start: number
  ) {
    this.pos = start
  }

  skipTrivia(): void {
    for (;;) {
      const ch = this.text[this.pos]
      if (ch !== undefined && /\s/.test(ch)) {
        this.pos += 1
        continue
      }
      if (ch === '/' && this.text[this.pos + 1] === '/') {
        const end = this.text.indexOf('\n', this.pos + 2)
        this.pos = end === -1 ? this.text.length : end + 1
        continue
      }
      if (ch === '/' && this.text[this.pos + 1] === '*') {
        const end = this.text.indexOf('*/', this.pos + 2)
        this.pos = end === -1 ? this.text.length : end + 2
        continue
      }
      return
    }
  }

  readIdent(): (Span & { value: string }) | null {
    this.skipTrivia()
    const start = this.pos
    const first = this.text[start]
    if (first === undefined || !/[A-Za-z_$]/.test(first)) return null
    let end = start + 1
    while (end < this.text.length && /[$\w]/.test(this.text[end])) end += 1
    this.pos = end
    return { start, end, value: this.text.slice(start, end) }
  }

  /** Reads a quoted string; the returned span excludes the quotes. */
  readString(): Span | null {
    this.skipTrivia()
    const quote = this.text[this.pos]
    if (quote !== "'" && quote !== '"') return null
    let i = this.pos + 1
    while (i < this.text.length) {
      const ch = this.text[i]
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote) {
        const span = { start: this.pos + 1, end: i }
        this.pos = i + 1
        return span
      }
      i += 1
    }
    return null
  }

  readPunct(ch: string): boolean {
    this.skipTrivia()
    if (this.text[this.pos] !== ch) return false
    this.pos += 1
    return true
  }

  peekPunct(ch: string): boolean {
    this.skipTrivia()
    return this.text[this.pos] === ch
  }
}

/**
 * Parses the entries of a `{ ... }` clause and keeps the span of every
 * imported/exported name. `type` is an inline modifier only when another name
 * follows (`import { type } from ...` imports the name `type`). Returns null
 * when the tokens cannot form a clause; the caller then leaves the whole
 * statement untouched instead of rewriting only its specifier.
 */
function parseNamedBindings(cursor: Cursor): NamedBinding[] | null {
  const bindings: NamedBinding[] = []
  for (;;) {
    cursor.skipTrivia()
    if (cursor.readPunct('}')) return bindings
    let name = cursor.readIdent()
    if (!name) return null
    if (name.value === 'type') {
      const save = cursor.pos
      const next = cursor.readIdent()
      if (next && next.value !== 'as') {
        name = next
      } else {
        cursor.pos = save
      }
    }
    let hasAlias = false
    const save = cursor.pos
    const maybeAs = cursor.readIdent()
    if (maybeAs?.value === 'as') {
      if (!cursor.readIdent()) return null
      hasAlias = true
    } else {
      cursor.pos = save
    }
    bindings.push({ name: { start: name.start, end: name.end }, value: name.value, hasAlias })
    cursor.skipTrivia()
    if (cursor.readPunct(',')) continue
    if (cursor.readPunct('}')) return bindings
    return null
  }
}

/** Parses a `{ ... }` clause or a `* as ns` namespace. */
function parseNamedOrNamespace(cursor: Cursor, bindings: NamedBinding[]): boolean {
  if (cursor.readPunct('{')) {
    const named = parseNamedBindings(cursor)
    if (named === null) return false
    bindings.push(...named)
    return true
  }
  if (!cursor.readPunct('*')) return false
  const asKeyword = cursor.readIdent()
  return asKeyword?.value === 'as' && cursor.readIdent() !== null
}

/** Parses `from '...'` and returns the specifier span. */
function readFromSpecifier(cursor: Cursor): Span | null {
  const fromKeyword = cursor.readIdent()
  if (fromKeyword?.value !== 'from') return null
  return cursor.readString()
}

function parseImportTail(cursor: Cursor): ModuleDeclaration | null {
  // `import '...'` and `import('...')` with a static string.
  const direct = cursor.readString()
  if (direct) return { end: cursor.pos, specifier: direct, bindings: [] }
  if (cursor.readPunct('(')) {
    const argument = cursor.readString()
    if (!argument || !cursor.readPunct(')')) return null
    return { end: cursor.pos, specifier: argument, bindings: [] }
  }

  const bindings: NamedBinding[] = []
  if (cursor.peekPunct('{') || cursor.peekPunct('*')) {
    if (!parseNamedOrNamespace(cursor, bindings)) return null
  } else {
    const name = cursor.readIdent()
    if (!name) return null
    if (name.value === 'type') {
      if (cursor.peekPunct('{') || cursor.peekPunct('*')) {
        // `import type { ... }` / `import type * as ns`.
        if (!parseNamedOrNamespace(cursor, bindings)) return null
        const specifier = readFromSpecifier(cursor)
        return specifier ? { end: cursor.pos, specifier, bindings } : null
      }
      const save = cursor.pos
      const next = cursor.readIdent()
      if (!next) return null
      // `import type from '...'`: `type` is the default binding; put `from`
      // back for the shared tail. Otherwise `next` is the default binding of
      // a type-only import and an optional `, { ... }` / `, * as ns` follows.
      if (next.value === 'from') cursor.pos = save
    }
    if (cursor.readPunct(',') && !parseNamedOrNamespace(cursor, bindings)) return null
  }

  const specifier = readFromSpecifier(cursor)
  return specifier ? { end: cursor.pos, specifier, bindings } : null
}

/**
 * Parses `export * from`, `export * as ns from`, `export { ... } from` and
 * `export type { ... } from`. Other export forms (const, function, class,
 * default, assignments) return null, so expressions such as
 * `export const text = ...` are never mistaken for re-export declarations.
 */
function parseExportTail(cursor: Cursor): ModuleDeclaration | null {
  const bindings: NamedBinding[] = []
  if (cursor.readPunct('*')) {
    const save = cursor.pos
    const asKeyword = cursor.readIdent()
    if (asKeyword?.value === 'as') {
      if (!cursor.readIdent()) return null
    } else {
      cursor.pos = save
    }
  } else {
    const save = cursor.pos
    const typeKeyword = cursor.readIdent()
    if (!(typeKeyword?.value === 'type' && cursor.peekPunct('{'))) cursor.pos = save
    if (!parseNamedOrNamespace(cursor, bindings)) return null
  }
  const specifier = readFromSpecifier(cursor)
  return specifier ? { end: cursor.pos, specifier, bindings } : null
}

/**
 * Parses the import/export declaration whose keyword starts at `start`, or
 * returns null when the tokens cannot form one with a static string specifier
 * (`import.meta`, `import(expr)`, arbitrary `export` expressions).
 */
function parseModuleDeclaration(
  text: string,
  start: number,
  keyword: 'import' | 'export'
): ModuleDeclaration | null {
  const cursor = new Cursor(text, start + keyword.length)
  return keyword === 'import' ? parseImportTail(cursor) : parseExportTail(cursor)
}

/**
 * Rewrites the declaration at `start`; non-Tigercat declarations are returned
 * unchanged so the scanner can skip them. Local bindings are preserved: an
 * unaliased `Kanban` becomes `TaskBoard as Kanban`, an existing alias only
 * renames the imported name. `type` modifiers and comments stay untouched.
 */
function rewriteDeclaration(
  text: string,
  start: number,
  keyword: 'import' | 'export'
): { next: string; end: number } | null {
  const declaration = parseModuleDeclaration(text, start, keyword)
  if (!declaration) return null
  const end = declaration.end
  const specifier = text.slice(declaration.specifier.start, declaration.specifier.end)
  const pkg = tigercatPackage(specifier)
  if (!pkg) return { next: text.slice(start, end), end }

  const edits: Array<{ span: Span; text: string }> = []
  const nextSpecifier = rewriteSpecifier(specifier)
  if (nextSpecifier !== specifier) {
    edits.push({ span: declaration.specifier, text: nextSpecifier })
  }
  for (const binding of declaration.bindings) {
    const replacement = replacementName(binding.value, pkg)
    if (!replacement) continue
    edits.push({
      span: binding.name,
      text: binding.hasAlias ? replacement : `${replacement} as ${binding.value}`
    })
  }
  if (edits.length === 0) return { next: text.slice(start, end), end }

  edits.sort((a, b) => a.span.start - b.span.start)
  let next = ''
  let copied = start
  for (const edit of edits) {
    next += text.slice(copied, edit.span.start) + edit.text
    copied = edit.span.end
  }
  next += text.slice(copied, end)
  return { next, end }
}

const EXPRESSION_PREFIX_WORDS = new Set([
  'return',
  'throw',
  'case',
  'delete',
  'void',
  'typeof',
  'new',
  'in',
  'instanceof',
  'yield',
  'await',
  'of',
  'else',
  'do',
  'try',
  'finally',
  'export',
  'default'
])
const CONTROL_PAREN_WORDS = new Set(['if', 'while', 'for', 'with', 'switch', 'catch'])
const BLOCK_PREFIX_WORDS = new Set(['else', 'do', 'try', 'finally'])

/**
 * Rewrite real declarations only. Comments, regex/ordinary string literals,
 * template literals and JSX text are copied verbatim, so quoted, commented-out or
 * rendered imports such as `const text = "import ..."` or
 * `<code>import '...'</code>` are never touched. Template `${...}`
 * expressions and JSX `{...}` expressions are code and are scanned.
 */
function rewriteCode(text: string, isJsx: boolean): string {
  let out = ''
  let i = 0
  let state: 'code' | 'line' | 'block' | 'string' | 'regex' | 'template' | 'jsxtext' | 'jsxtag' =
    'code'
  let quote = ''
  let regexClass = false
  let expressionAllowed = true
  let previousToken = ''
  // A control condition or statement block ends at a new statement position;
  // a call/grouping, object literal or arrow body ends with a value instead.
  const parenRegexAfter: boolean[] = []
  const braceRegexAfter: boolean[] = []
  let braces = 0
  const templateExprDepths: number[] = []
  // Brace depths at which a JSX expression closes, counted after the opening
  // brace, with the state to return to (text or tag).
  const jsxExprDepths: Array<{ depth: number; returnTo: 'jsxtext' | 'jsxtag' }> = []
  // States to resume when each open JSX tag or element ends, innermost last:
  // elements opened inside an expression close back to code, elements opened
  // in text close back to text.
  const jsxReturns: Array<'code' | 'jsxtext'> = []
  let stringReturn: 'code' | 'jsxtag' = 'code'

  while (i < text.length) {
    const ch = text[i]

    if (state === 'line') {
      out += ch
      i += 1
      if (ch === '\n') state = 'code'
      continue
    }

    if (state === 'block') {
      if (ch === '*' && text[i + 1] === '/') {
        out += '*/'
        i += 2
        state = 'code'
      } else {
        out += ch
        i += 1
      }
      continue
    }

    if (state === 'regex') {
      out += ch
      i += 1
      if (ch === '\\') {
        out += text[i] ?? ''
        i += 1
      } else if (ch === '[') {
        regexClass = true
      } else if (ch === ']') {
        regexClass = false
      } else if (ch === '/' && !regexClass) {
        while (i < text.length && /[$\w]/.test(text[i])) out += text[i++]
        state = 'code'
        expressionAllowed = false
        previousToken = 'value'
      }
      continue
    }

    if (state === 'string') {
      out += ch
      i += 1
      if (ch === '\\') {
        out += text[i] ?? ''
        i += 1
      } else if (ch === quote) {
        state = stringReturn
        expressionAllowed = false
        previousToken = 'value'
      }
      continue
    }

    if (state === 'template') {
      if (ch === '\\') {
        out += ch + (text[i + 1] ?? '')
        i += 2
        continue
      }
      if (ch === '`') {
        out += ch
        i += 1
        state = 'code'
        expressionAllowed = false
        previousToken = 'value'
        continue
      }
      if (ch === '$' && text[i + 1] === '{') {
        out += '${'
        i += 2
        templateExprDepths.push(braces)
        state = 'code'
        expressionAllowed = true
        previousToken = '('
        continue
      }
      out += ch
      i += 1
      continue
    }

    if (state === 'jsxtext') {
      if (ch === '{') {
        out += ch
        i += 1
        braces += 1
        jsxExprDepths.push({ depth: braces, returnTo: 'jsxtext' })
        state = 'code'
        expressionAllowed = true
        previousToken = '('
        continue
      }
      if (ch === '<') {
        const next = text[i + 1]
        if (next === '/') {
          // Closing tags contain no strings or expressions.
          const end = text.indexOf('>', i + 2)
          if (end !== -1) {
            out += text.slice(i, end + 1)
            i = end + 1
            state = jsxReturns.pop() ?? 'code'
            expressionAllowed = false
            previousToken = 'value'
            continue
          }
        } else if (next !== undefined && /[A-Za-z]/.test(next)) {
          out += ch
          i += 1
          jsxReturns.push('jsxtext')
          state = 'jsxtag'
          continue
        } else if (next === '>') {
          out += '<>'
          i += 2
          jsxReturns.push('jsxtext')
          continue
        }
      }
      out += ch
      i += 1
      continue
    }

    if (state === 'jsxtag') {
      // Attribute names, `=` and spread markers are copied verbatim; only
      // strings, `{...}` expressions and the tag end matter. Comments are not
      // recognized here: a stray `>` inside one would close the tag early,
      // which only falls back to copying text.
      if (ch === '/' && text[i + 1] === '>') {
        out += '/>'
        i += 2
        state = jsxReturns.pop() ?? 'code'
        expressionAllowed = false
        previousToken = 'value'
        continue
      }
      if (ch === '>') {
        out += ch
        i += 1
        state = 'jsxtext'
        continue
      }
      if (ch === "'" || ch === '"') {
        out += ch
        i += 1
        quote = ch
        stringReturn = 'jsxtag'
        state = 'string'
        continue
      }
      if (ch === '{') {
        out += ch
        i += 1
        braces += 1
        jsxExprDepths.push({ depth: braces, returnTo: 'jsxtag' })
        state = 'code'
        expressionAllowed = true
        previousToken = '('
        continue
      }
      if (ch === ',') {
        // `,` is never valid inside a tag; this was a type parameter list
        // such as `<T,>`, so fall back to code.
        out += ch
        i += 1
        jsxReturns.pop()
        state = 'code'
        continue
      }
      out += ch
      i += 1
      continue
    }

    // code
    if (ch === '/' && text[i + 1] === '/') {
      out += '//'
      i += 2
      state = 'line'
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      out += '/*'
      i += 2
      state = 'block'
      continue
    }
    if (ch === '/' && expressionAllowed) {
      out += ch
      i += 1
      regexClass = false
      state = 'regex'
      continue
    }
    if (ch === "'" || ch === '"') {
      out += ch
      i += 1
      quote = ch
      stringReturn = 'code'
      state = 'string'
      continue
    }
    if (ch === '`') {
      out += ch
      i += 1
      state = 'template'
      continue
    }
    if (ch === '{') {
      braceRegexAfter.push(
        previousToken !== '=>' &&
          (!expressionAllowed ||
            ['', ';', '{', '}', ')'].includes(previousToken) ||
            BLOCK_PREFIX_WORDS.has(previousToken))
      )
      braces += 1
      expressionAllowed = true
      previousToken = ch
      out += ch
      i += 1
      continue
    } else if (ch === '}') {
      if (templateExprDepths[templateExprDepths.length - 1] === braces) {
        templateExprDepths.pop()
        state = 'template'
      } else if (jsxExprDepths[jsxExprDepths.length - 1]?.depth === braces) {
        braces -= 1
        state = jsxExprDepths.pop()?.returnTo ?? 'code'
      } else if (braces > 0) {
        braces -= 1
        expressionAllowed = braceRegexAfter.pop() ?? true
      }
      previousToken = ch
      out += ch
      i += 1
      continue
    }
    if (isJsx && expressionAllowed && ch === '<' && /[A-Za-z>]/.test(text[i + 1] ?? '')) {
      jsxReturns.push('code')
      if (text[i + 1] === '>') {
        out += '<>'
        i += 2
        state = 'jsxtext'
        continue
      }
      out += ch
      i += 1
      state = 'jsxtag'
      continue
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let end = i + 1
      while (end < text.length && /[$\w]/.test(text[end])) end += 1
      const word = text.slice(i, end)
      if (previousToken !== '.' && (word === 'import' || word === 'export')) {
        const rewritten = rewriteDeclaration(text, i, word)
        if (rewritten) {
          out += rewritten.next
          i = rewritten.end
          expressionAllowed = text[i - 1] !== ')'
          previousToken = expressionAllowed ? ';' : 'value'
          continue
        }
      }
      expressionAllowed =
        previousToken !== '.' &&
        (EXPRESSION_PREFIX_WORDS.has(word) || CONTROL_PAREN_WORDS.has(word))
      previousToken = word
      out += word
      i = end
      continue
    }
    if (ch === '(') {
      parenRegexAfter.push(expressionAllowed && CONTROL_PAREN_WORDS.has(previousToken))
      expressionAllowed = true
    } else if (ch === ')') {
      expressionAllowed = parenRegexAfter.pop() ?? false
    } else if ((ch === '+' || ch === '-') && text[i + 1] === ch) {
      // Prefix ++/-- still expects an operand; postfix ++/-- remains a value.
      previousToken = ch + ch
      out += previousToken
      i += 2
      continue
    } else if (ch === '=' && text[i + 1] === '>') {
      previousToken = '=>'
      expressionAllowed = true
      out += previousToken
      i += 2
      continue
    } else if (!/\s/.test(ch)) {
      expressionAllowed = '[,;:?=+-*/%<>!~^|&'.includes(ch)
    }
    if (!/\s/.test(ch)) previousToken = ch
    out += ch
    i += 1
  }
  return out
}

/**
 * Vue SFCs are only rewritten inside their <script> blocks; template, style
 * and other sections are copied byte for byte.
 */
function rewriteVueSfc(source: string): string {
  const SCRIPT_OPEN_RE = /<script\b[^>]*>/gi
  let result = ''
  let copiedUntil = 0
  for (;;) {
    const open = SCRIPT_OPEN_RE.exec(source)
    if (!open) break
    const contentStart = open.index + open[0].length
    const close = /<\/script\s*>/i.exec(source.slice(contentStart))
    if (!close) break
    const contentEnd = contentStart + close.index
    result += source.slice(copiedUntil, contentStart)
    result += rewriteCode(source.slice(contentStart, contentEnd), false)
    copiedUntil = contentEnd
    SCRIPT_OPEN_RE.lastIndex = contentEnd
  }
  return result + source.slice(copiedUntil)
}

/**
 * Rewrite deleted Tigercat import/export names and module specifiers. Only
 * `@expcat/tigercat-*` declarations are touched: relative imports such as
 * `./other`, ordinary strings, comments, JSX text and props are never
 * rewritten.
 */
export function rewriteSource(source: string, isVue = false, isJsx = false): string {
  return isVue ? rewriteVueSfc(source) : rewriteCode(source, isJsx)
}

export function collectMigrateFiles(root: string): string[] {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue
      const full = join(dir, entry)
      const stat = statSync(full)
      if (stat.isDirectory()) walk(full)
      else if (FILE_RE.test(entry)) files.push(full)
    }
  }
  walk(root)
  return files
}

export function planMigrate(root: string): Array<{ file: string; next: string }> {
  const planned: Array<{ file: string; next: string }> = []
  for (const file of collectMigrateFiles(root)) {
    const source = readFileSync(file, 'utf8')
    const next = rewriteSource(source, file.endsWith('.vue'), JSX_FILE_RE.test(file))
    if (next !== source) planned.push({ file, next })
  }
  return planned
}

export function createMigrateCommand() {
  return new Command('migrate')
    .option('--write', 'Write the listed files. Default is a preview.')
    .option('--dir <dir>', 'Directory to scan', process.cwd())
    .description('Rewrite deleted import names and specifiers. Does not change props.')
    .action((opts: { write?: boolean; dir?: string }) => {
      const root = opts.dir ?? process.cwd()
      let planned: Array<{ file: string; next: string }>
      try {
        planned = planMigrate(root)
      } catch (error) {
        logError(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
      if (planned.length === 0) {
        logSuccess('No import specifiers or deleted names to rewrite.')
        return
      }
      logInfo('Files:')
      for (const item of planned) console.log(`  ${relative(root, item.file)}`)
      if (!opts.write) {
        logInfo('Preview only. Re-run with --write to update these files.')
        return
      }
      for (const item of planned) writeFileSafe(item.file, item.next)
      logSuccess(`Updated ${planned.length} file(s).`)
    })
}
