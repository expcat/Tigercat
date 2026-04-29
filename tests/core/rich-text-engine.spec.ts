import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  builtinRichTextEngine,
  createBuiltinRichTextEngine,
  defaultToolbar,
  type RichTextEngineMountContext,
  type RichTextEngineInstance
} from '../../packages/core/src'

function makeContext(overrides: Partial<RichTextEngineMountContext> = {}): {
  ctx: RichTextEngineMountContext
  changes: string[]
  formats: Set<string>[]
} {
  const element = document.createElement('div')
  document.body.appendChild(element)
  const changes: string[] = []
  const formats: Set<string>[] = []
  const ctx: RichTextEngineMountContext = {
    element,
    initialValue: '',
    readOnly: false,
    disabled: false,
    placeholder: undefined,
    toolbar: defaultToolbar,
    notifyChange(html) {
      changes.push(html)
    },
    notifyActiveFormats(set) {
      formats.push(set)
    },
    ...overrides
  }
  return { ctx, changes, formats }
}

describe('rich-text-engine', () => {
  let instance: RichTextEngineInstance | null = null

  afterEach(() => {
    instance?.destroy()
    instance = null
    document.body.innerHTML = ''
  })

  it('builtinRichTextEngine is the singleton instance', () => {
    expect(builtinRichTextEngine.name).toBe('builtin')
    expect(typeof builtinRichTextEngine.create).toBe('function')
  })

  it('createBuiltinRichTextEngine returns a fresh factory', () => {
    const a = createBuiltinRichTextEngine()
    const b = createBuiltinRichTextEngine()
    expect(a).not.toBe(b)
    expect(a.name).toBe('builtin')
  })

  it('mounts editor as contenteditable when not read-only', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    expect(ctx.element.contentEditable).toBe('true')
  })

  it('mounts editor as non-editable when read-only', () => {
    const { ctx } = makeContext({ readOnly: true })
    instance = builtinRichTextEngine.create(ctx)
    expect(ctx.element.contentEditable).toBe('false')
  })

  it('writes initial sanitised value into the host element', () => {
    const { ctx } = makeContext({ initialValue: '<p>Hello <script>x</script></p>' })
    instance = builtinRichTextEngine.create(ctx)
    expect(ctx.element.innerHTML).toContain('<p>Hello')
    expect(ctx.element.innerHTML).not.toContain('<script>')
  })

  it('setValue replaces content', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    instance.setValue('<p>Updated</p>')
    expect(ctx.element.innerHTML).toBe('<p>Updated</p>')
  })

  it('setValue is a no-op when content already matches', () => {
    const { ctx } = makeContext({ initialValue: '<p>Same</p>' })
    instance = builtinRichTextEngine.create(ctx)
    const beforeRef = ctx.element.firstChild
    instance.setValue('<p>Same</p>')
    // DOM node identity preserved when content is already equal
    expect(ctx.element.firstChild).toBe(beforeRef)
  })

  it('getValue returns sanitised current content', () => {
    const { ctx } = makeContext({ initialValue: '<b>x</b>' })
    instance = builtinRichTextEngine.create(ctx)
    expect(instance.getValue()).toBe('<b>x</b>')
  })

  it('emits notifyChange on input events', () => {
    const { ctx, changes } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    ctx.element.innerHTML = '<p>typed</p>'
    ctx.element.dispatchEvent(new Event('input', { bubbles: true }))
    expect(changes).toContain('<p>typed</p>')
  })

  it('setReadOnly toggles contenteditable without remount', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    expect(ctx.element.contentEditable).toBe('true')
    instance.setReadOnly(true, false)
    expect(ctx.element.contentEditable).toBe('false')
    instance.setReadOnly(false, false)
    expect(ctx.element.contentEditable).toBe('true')
    instance.setReadOnly(false, true)
    expect(ctx.element.contentEditable).toBe('false')
  })

  it('exec is a no-op when read-only', () => {
    const { ctx, changes } = makeContext({ readOnly: true })
    instance = builtinRichTextEngine.create(ctx)
    instance.exec('bold')
    expect(changes).toHaveLength(0)
  })

  it('destroy removes input listener', () => {
    const { ctx, changes } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    instance.destroy()
    instance = null
    ctx.element.dispatchEvent(new Event('input', { bubbles: true }))
    expect(changes).toHaveLength(0)
  })

  it('refreshActiveFormats notifies subscribers (jsdom returns empty set)', () => {
    const { ctx, formats } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    formats.length = 0
    instance.refreshActiveFormats()
    expect(formats.length).toBeGreaterThanOrEqual(1)
    expect(formats[formats.length - 1]).toBeInstanceOf(Set)
  })
})
