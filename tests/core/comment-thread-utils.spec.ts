import { describe, expect, it } from 'vitest'
import {
  buildCommentTree,
  clipCommentTreeDepth,
  nextCommentLikeState,
  resolveCommentLikeState,
  resolveCommentNodes,
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

  it('overlay wins over the same snapshot until the parent writes back', () => {
    const overlay = writeCommentLikeOverlay(new Map(), 1, { liked: true, likes: 4 })
    expect(resolveCommentLikeState({ id: 1, likes: 3, liked: false }, overlay)).toEqual({
      liked: true,
      likes: 4
    })
  })
})

describe('comment-thread-utils tree', () => {
  it('does not fall back to items when nodes is an empty array', () => {
    expect(resolveCommentNodes([], [{ id: 1, content: 'orphan' }])).toEqual([])
  })

  it('builds a tree from items only when nodes is omitted', () => {
    const tree = resolveCommentNodes(undefined, [
      { id: 1, content: 'root' },
      { id: 2, content: 'child', parentId: 1 }
    ])
    expect(tree).toHaveLength(1)
    expect(tree[0]?.children).toHaveLength(1)
  })

  it('promotes missing parents and self-references to roots', () => {
    const tree = buildCommentTree([
      { id: 1, content: 'orphan', parentId: 99 },
      { id: 2, content: 'loop', parentId: 2 }
    ])
    expect(tree.map((node) => node.id)).toEqual([1, 2])
  })

  it('last duplicate id wins and appears once', () => {
    const tree = buildCommentTree([
      { id: 1, content: 'first' },
      { id: 1, content: 'second' }
    ])
    expect(tree).toHaveLength(1)
    expect(tree[0]?.content).toBe('second')
  })

  it('clips children past maxDepth', () => {
    const clipped = clipCommentTreeDepth(
      [{ id: 1, content: 'a', children: [{ id: 2, content: 'b' }] }],
      1
    )
    expect(clipped[0]?.children).toEqual([])
  })
})
