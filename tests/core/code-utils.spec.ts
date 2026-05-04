/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  codeBlockContainerClasses,
  codeBlockCopyButtonBaseClasses,
  codeBlockCopyButtonCopiedClasses,
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
    const idleClasses = getCodeBlockCopyButtonClasses(false)
    const copiedClasses = getCodeBlockCopyButtonClasses(true, 'custom-copy')

    expect(idleClasses).toContain(codeBlockCopyButtonBaseClasses)
    expect(idleClasses).not.toContain(codeBlockCopyButtonCopiedClasses)
    expect(copiedClasses).toContain(codeBlockCopyButtonBaseClasses)
    expect(copiedClasses).toContain(codeBlockCopyButtonCopiedClasses)
    expect(copiedClasses).toContain('custom-copy')
  })
})
