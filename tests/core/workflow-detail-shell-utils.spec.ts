/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getWorkflowDetailShellRootClasses,
  workflowDetailShellActionClasses,
  workflowDetailShellBodyClasses,
  workflowDetailShellRootClasses
} from '@expcat/tigercat-core'

describe('workflow-detail-shell layout recipe', () => {
  it('pins action below a flex-1 scrolling body when the host is bounded', () => {
    expect(workflowDetailShellRootClasses).toContain('flex')
    expect(workflowDetailShellRootClasses).toContain('h-full')
    expect(workflowDetailShellRootClasses).toContain('min-h-0')
    expect(workflowDetailShellRootClasses).toContain('flex-col')
    expect(workflowDetailShellBodyClasses).toContain('flex-1')
    expect(workflowDetailShellBodyClasses).toContain('min-h-0')
    expect(workflowDetailShellBodyClasses).toContain('overflow-auto')
    expect(workflowDetailShellActionClasses).toContain('shrink-0')
    expect(workflowDetailShellActionClasses).toContain('sticky')
    expect(getWorkflowDetailShellRootClasses('flex-1')).toContain('h-full')
    expect(getWorkflowDetailShellRootClasses('flex-1')).toContain('flex-1')
  })
})
