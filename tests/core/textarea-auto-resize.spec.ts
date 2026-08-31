import { describe, expect, it } from 'vitest'
import { autoResizeTextarea, clearTextareaAutoResize } from '@expcat/tigercat-core'

describe('autoResizeTextarea', () => {
  it('includes border when box-sizing is border-box and caps overflow at maxRows', () => {
    const el = {
      style: { height: '', overflowY: '' },
      scrollHeight: 40
    } as HTMLTextAreaElement

    const original = globalThis.getComputedStyle
    globalThis.getComputedStyle = () =>
      ({
        lineHeight: '20px',
        fontSize: '16px',
        paddingTop: '4px',
        paddingBottom: '4px',
        borderTopWidth: '2px',
        borderBottomWidth: '2px',
        boxSizing: 'border-box'
      }) as CSSStyleDeclaration

    autoResizeTextarea(el, { minRows: 1, maxRows: 1 })
    expect(el.style.height).toBe('32px')
    expect(el.style.overflowY).toBe('auto')

    clearTextareaAutoResize(el)
    expect(el.style.height).toBe('')
    expect(el.style.overflowY).toBe('')

    globalThis.getComputedStyle = original
  })
})
