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
    expect(canSendChatMessage({ value: 'hi', lastSent: 'hi' })).toBe(false)
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

  it('follows the latest only when pinned and compensates prepends otherwise', () => {
    expect(
      planChatScroll({
        stickToBottom: true,
        autoScrollToBottom: true,
        prepended: false,
        previousScrollHeight: 1000,
        nextScrollHeight: 1300
      })
    ).toEqual({ scrollTop: 1300 })
    expect(
      planChatScroll({
        stickToBottom: false,
        autoScrollToBottom: true,
        prepended: true,
        previousScrollHeight: 1000,
        nextScrollHeight: 1300
      })
    ).toEqual({ compensate: 300 })
    expect(
      planChatScroll({
        stickToBottom: false,
        autoScrollToBottom: true,
        prepended: false,
        previousScrollHeight: 1000,
        nextScrollHeight: 1300
      })
    ).toEqual({})
    expect(didChatPrepend('a', 'old', 2, 3)).toBe(true)
    expect(didChatPrepend('a', 'a', 2, 3)).toBe(false)
  })
})
