/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import {
  CODE_COPY_STATUS_RESET_MS,
  codeBlockContainerClasses,
  codeBlockCopyButtonBaseClasses,
  codeBlockCopyButtonCopiedClasses,
  codeBlockCopyButtonFailedClasses,
  createCopyStatusReset,
  getCodeBlockContainerClasses,
  getCodeBlockCopyButtonClasses
} from '@expcat/tigercat-core'

describe('code-utils', () => {
  it('composes code block container classes with custom classes', () => {
    const classes = getCodeBlockContainerClasses('custom-code')

    expect(classes).toContain(codeBlockContainerClasses)
    expect(classes).toContain('custom-code')
  })

  it('composes copy button classes for idle and copied states', () => {
    const idleClasses = getCodeBlockCopyButtonClasses('idle')
    const copiedClasses = getCodeBlockCopyButtonClasses('copied', 'custom-copy')

    expect(idleClasses).toContain(codeBlockCopyButtonBaseClasses)
    expect(idleClasses).not.toContain(codeBlockCopyButtonCopiedClasses)
    expect(idleClasses).not.toContain(codeBlockCopyButtonFailedClasses)
    expect(copiedClasses).toContain(codeBlockCopyButtonBaseClasses)
    expect(copiedClasses).toContain(codeBlockCopyButtonCopiedClasses)
    expect(copiedClasses).not.toContain(codeBlockCopyButtonFailedClasses)
    expect(copiedClasses).toContain('custom-copy')
  })

  it('composes copy button classes for the failed state', () => {
    const failedClasses = getCodeBlockCopyButtonClasses('failed')

    expect(failedClasses).toContain(codeBlockCopyButtonBaseClasses)
    expect(failedClasses).toContain(codeBlockCopyButtonFailedClasses)
    expect(failedClasses).not.toContain(codeBlockCopyButtonCopiedClasses)
  })

  it('places the copy control on the logical end edge with a 24px minimum box', () => {
    const tokens = codeBlockCopyButtonBaseClasses.split(/\s+/)
    expect(tokens).toContain('end-3')
    expect(tokens).not.toContain('right-3')
    expect(tokens).toContain('min-h-6')
    expect(tokens).toContain('min-w-6')
  })

  it('resets copy status after the shared timeout', () => {
    vi.useFakeTimers()
    const setStatus = vi.fn()
    const machine = createCopyStatusReset(setStatus)
    machine.schedule('copied')
    expect(setStatus).toHaveBeenCalledWith('copied')
    vi.advanceTimersByTime(CODE_COPY_STATUS_RESET_MS)
    expect(setStatus).toHaveBeenCalledWith('idle')
    machine.dispose()
    vi.useRealTimers()
  })
})
