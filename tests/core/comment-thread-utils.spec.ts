import { describe, expect, it } from 'vitest'
import {
  nextCommentLikeState,
  resolveCommentLikeState,
  writeCommentLikeOverlay
} from '@expcat/tigercat-core'

describe('comment-thread-utils like overlay', () => {
  it('resolveCommentLikeState uses the node when the overlay is empty', () => {
    expect(resolveCommentLikeState({ id: 1, likes: 3, liked: false }, new Map())).toEqual({
      liked: false,
      likes: 3
    })
    expect(resolveCommentLikeState({ id: 1 })).toEqual({
      liked: false,
      likes: 0
    })
  })

  it('nextCommentLikeState toggles { likes: 3, liked: false } to liked 4', () => {
    const node = { id: 1, likes: 3, liked: false }
    const overlay = new Map()
    expect(nextCommentLikeState(node, overlay)).toEqual({ liked: true, likes: 4 })
  })

  it('second toggle returns { liked: false, likes: 3 }', () => {
    const node = { id: 1, likes: 3, liked: false }
    const liked = nextCommentLikeState(node, new Map())
    const overlay = writeCommentLikeOverlay(new Map(), node.id, liked)
    expect(nextCommentLikeState(node, overlay)).toEqual({ liked: false, likes: 3 })
  })

  it('likes never go below 0', () => {
    expect(nextCommentLikeState({ id: 1, likes: 0, liked: true }, new Map())).toEqual({
      liked: false,
      likes: 0
    })
  })

  it('overlay values are absolute and win over a later node', () => {
    const overlay = writeCommentLikeOverlay(new Map(), 1, { liked: true, likes: 4 })
    expect(resolveCommentLikeState({ id: 1, likes: 3, liked: false }, overlay)).toEqual({
      liked: true,
      likes: 4
    })
  })
})
