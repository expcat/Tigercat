import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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

  // happy-dom does not implement document.execCommand or window.prompt;
  // install stubs so vi.spyOn() works in the exec() branches below.
  function installDomStubs(): () => void {
    const docAny = document as unknown as { execCommand?: unknown; queryCommandState?: unknown }
    const winAny = window as unknown as { prompt?: unknown }
    const restorers: Array<() => void> = []
    if (typeof docAny.execCommand !== 'function') {
      docAny.execCommand = () => true
      restorers.push(() => {
        delete docAny.execCommand
      })
    }
    if (typeof docAny.queryCommandState !== 'function') {
      docAny.queryCommandState = () => false
      restorers.push(() => {
        delete docAny.queryCommandState
      })
    }
    if (typeof winAny.prompt !== 'function') {
      winAny.prompt = () => null
      restorers.push(() => {
        delete winAny.prompt
      })
    }
    return () => restorers.forEach((fn) => fn())
  }
  let restoreStubs: (() => void) | null = null
  beforeEach(() => {
    restoreStubs = installDomStubs()
  })

  afterEach(() => {
    instance?.destroy()
    instance = null
    document.body.innerHTML = ''
    restoreStubs?.()
    restoreStubs = null
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

  it('refreshActiveFormats reports active inline formats when queryCommandState returns true', () => {
    const { ctx, formats } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    formats.length = 0
    const stateMap: Record<string, boolean> = {
      bold: true,
      italic: true,
      underline: true,
      strikeThrough: true,
      insertUnorderedList: true,
      insertOrderedList: true
    }
    const spy = vi
      .spyOn(document, 'queryCommandState')
      .mockImplementation((cmd: string) => stateMap[cmd] ?? false)
    instance.refreshActiveFormats()
    const last = formats[formats.length - 1]
    expect(last.has('bold')).toBe(true)
    expect(last.has('italic')).toBe(true)
    expect(last.has('underline')).toBe(true)
    expect(last.has('strikethrough')).toBe(true)
    expect(last.has('bulletList')).toBe(true)
    expect(last.has('orderedList')).toBe(true)
    spy.mockRestore()
  })

  it('exec dispatches mapped toolbar actions through document.execCommand', () => {
    const { ctx, changes } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    instance.exec('bold')
    expect(exec).toHaveBeenCalledWith('bold', false, undefined)
    // mapped path also triggers handleInput → notifyChange
    expect(changes.length).toBeGreaterThanOrEqual(1)
    exec.mockRestore()
  })

  it('exec passes argument for formatBlock-style mappings', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    instance.exec('heading2')
    expect(exec).toHaveBeenCalledWith('formatBlock', false, 'H2')
    exec.mockRestore()
  })

  it('exec handles codeBlock action via formatBlock=PRE', () => {
    const { ctx, changes } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    instance.exec('codeBlock')
    expect(exec).toHaveBeenCalledWith('formatBlock', false, 'PRE')
    expect(changes.length).toBeGreaterThanOrEqual(1)
    exec.mockRestore()
  })

  it('exec link prompts for URL and createLink with valid URL', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com')
    instance.exec('link')
    expect(prompt).toHaveBeenCalled()
    expect(exec).toHaveBeenCalledWith('createLink', false, 'https://example.com')
    exec.mockRestore()
    prompt.mockRestore()
  })

  it('exec link with cancelled prompt is a no-op', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null)
    instance.exec('link')
    expect(exec).not.toHaveBeenCalled()
    exec.mockRestore()
    prompt.mockRestore()
  })

  it('exec link with invalid URL is a no-op', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('not a url')
    instance.exec('link')
    expect(exec).not.toHaveBeenCalled()
    exec.mockRestore()
    prompt.mockRestore()
  })

  it('exec image prompts for URL and insertImage with valid URL', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com/x.png')
    instance.exec('image')
    expect(exec).toHaveBeenCalledWith('insertImage', false, 'https://example.com/x.png')
    exec.mockRestore()
    prompt.mockRestore()
  })

  it('exec image with cancelled prompt is a no-op', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null)
    instance.exec('image')
    expect(exec).not.toHaveBeenCalled()
    exec.mockRestore()
    prompt.mockRestore()
  })

  it('exec image with invalid URL is a no-op', () => {
    const { ctx } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('javascript:alert(1)')
    instance.exec('image')
    expect(exec).not.toHaveBeenCalled()
    exec.mockRestore()
    prompt.mockRestore()
  })

  it('exec ignores unknown action names', () => {
    const { ctx, changes } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    instance.exec('nope-not-a-real-action')
    expect(exec).not.toHaveBeenCalled()
    expect(changes).toHaveLength(0)
    exec.mockRestore()
  })

  it('exec is a no-op when disabled', () => {
    const { ctx, changes } = makeContext({ disabled: true })
    instance = builtinRichTextEngine.create(ctx)
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    instance.exec('bold')
    expect(exec).not.toHaveBeenCalled()
    expect(changes).toHaveLength(0)
    exec.mockRestore()
  })

  it('selectionchange event triggers refreshActiveFormats', () => {
    const { ctx, formats } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    formats.length = 0
    document.dispatchEvent(new Event('selectionchange'))
    expect(formats.length).toBeGreaterThanOrEqual(1)
  })

  it('destroy removes selectionchange listener', () => {
    const { ctx, formats } = makeContext()
    instance = builtinRichTextEngine.create(ctx)
    instance.destroy()
    instance = null
    formats.length = 0
    document.dispatchEvent(new Event('selectionchange'))
    expect(formats).toHaveLength(0)
  })

  it('createBuiltinRichTextEngine without initial value leaves element empty', () => {
    const { ctx } = makeContext({ initialValue: '' })
    instance = builtinRichTextEngine.create(ctx)
    expect(ctx.element.innerHTML).toBe('')
  })
})
