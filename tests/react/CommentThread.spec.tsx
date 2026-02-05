/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { CommentThread } from '@expcat/tigercat-react'
import type { CommentNode } from '@expcat/tigercat-core'

describe('CommentThread (React)', () => {
  it('renders nested replies when expanded', () => {
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Root comment',
        user: { name: 'A' },
        children: [
          {
            id: 2,
            parentId: 1,
            content: 'Child reply',
            user: { name: 'B' }
          }
        ]
      }
    ]

    render(<CommentThread nodes={nodes} defaultExpandedKeys={[1]} />)

    expect(screen.getByText('Root comment')).toBeInTheDocument()
    expect(screen.getByText('Child reply')).toBeInTheDocument()
  })

  it('submits reply content', async () => {
    const onReply = vi.fn()
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Root comment',
        user: { name: 'A' }
      }
    ]

    render(
      <CommentThread
        nodes={nodes}
        replyButtonText="发送回复"
        replyPlaceholder="写下回复"
        onReply={onReply}
      />
    )

    const replyAction = screen.getByRole('button', { name: '回复' })
    await userEvent.click(replyAction)

    const input = screen.getByPlaceholderText('写下回复') as HTMLTextAreaElement
    await userEvent.type(input, 'Hello')

    const submit = screen.getByRole('button', { name: '发送回复' })
    await userEvent.click(submit)

    expect(onReply).toHaveBeenCalledTimes(1)
    expect(onReply).toHaveBeenCalledWith(nodes[0], 'Hello')
  })
})
