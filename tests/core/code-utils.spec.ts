/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  codeBlockContainerClasses,
  codeBlockCopyButtonBaseClasses,
  codeBlockCopyButtonCopiedClasses,
  codeBlockCopyButtonFailedClasses,
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
})
