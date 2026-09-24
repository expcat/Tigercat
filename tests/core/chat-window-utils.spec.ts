/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  canSendChatMessage,
  didChatPrepend,
  isChatEnterComposing,
  isChatScrollerNearBottom,
  planChatScroll,
  shouldSendChatOnEnter
} from '@expcat/tigercat-core'

describe('chat-window-utils', () => {
  it('treats the scroller as pinned within 32px of the bottom', () => {
    expect(
      isChatScrollerNearBottom({ scrollHeight: 1000, scrollTop: 968, clientHeight: 400 })
    ).toBe(true)
    expect(
      isChatScrollerNearBottom({ scrollHeight: 1000, scrollTop: 400, clientHeight: 400 })
    ).toBe(false)
  })

  it('does not send without a handler, while sending, or on composing Enter', () => {
    expect(canSendChatMessage({ value: 'hi', hasSendHandler: false })).toBe(false)
    expect(canSendChatMessage({ value: 'hi', sending: true })).toBe(false)
    expect(canSendChatMessage({ value: 'hi' })).toBe(true)
    expect(canSendChatMessage({ value: 'hi', sending: false })).toBe(true)
    expect(isChatEnterComposing({ isComposing: true })).toBe(true)
    expect(isChatEnterComposing({ keyCode: 229 })).toBe(true)
    expect(
      shouldSendChatOnEnter(
        { key: 'Enter', isComposing: true },
        { sendOnEnter: true, inputType: 'textarea' }
      )
    ).toBe(false)
    expect(
      shouldSendChatOnEnter({ key: 'Enter' }, { sendOnEnter: true, inputType: 'textarea' })
    ).toBe(true)
  })

  it('sticks to the last message id and keeps the anchor when not pinned', () => {
    const messages = [{ id: 'a' }, { id: 'b' }]
    expect(
      planChatScroll({
        messages,
        stickToBottom: true,
        sessionChanged: false,
        anchorId: 'a'
      })
    ).toEqual({ anchorId: 'b', align: 'end', stickToBottom: true })
    expect(
      planChatScroll({
        messages,
        stickToBottom: false,
        sessionChanged: false,
        anchorId: 'a'
      })
    ).toEqual({ anchorId: 'a', align: 'auto', stickToBottom: false })
    expect(
      planChatScroll({
        messages,
        stickToBottom: false,
        sessionChanged: true,
        anchorId: 'a'
      })
    ).toEqual({ anchorId: 'b', align: 'end', stickToBottom: true })
    expect(didChatPrepend('a', 'old', 2, 3)).toBe(true)
    expect(didChatPrepend('a', 'a', 2, 3)).toBe(false)
  })
})
