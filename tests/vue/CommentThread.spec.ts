/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { CommentThread } from '@expcat/tigercat-vue'
import type { CommentNode } from '@expcat/tigercat-core'

describe('CommentThread (Vue)', () => {
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

    render(CommentThread, { props: { nodes, defaultExpandedKeys: [1] } })

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

    render(CommentThread, {
      props: {
        nodes,
        replyButtonText: '发送回复',
        replyPlaceholder: '写下回复',
        onReply
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: '回复' }))

    const input = screen.getByPlaceholderText('写下回复') as HTMLTextAreaElement
    await fireEvent.update(input, 'Hello')

    await fireEvent.click(screen.getByRole('button', { name: '发送回复' }))

    expect(onReply).toHaveBeenCalledTimes(1)
    expect(onReply).toHaveBeenCalledWith(nodes[0], 'Hello')
  })
})
