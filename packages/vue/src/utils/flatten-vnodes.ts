import { Comment, Fragment, Text, type VNode } from 'vue'

/**
 * Flatten Vue slot trees: unwrap Fragments, drop Comment placeholders
 * (`v-if="false"`). Does not unpack element children. Text nodes are kept
 * (SplitButton labels); AvatarGroup filters them when counting avatars.
 */
export function flattenSlotVNodes(nodes: VNode[] | undefined): VNode[] {
  const out: VNode[] = []
  for (const node of nodes ?? []) {
    if (!node || node.type === Comment) continue
    if (node.type === Fragment && Array.isArray(node.children)) {
      out.push(...flattenSlotVNodes(node.children as VNode[]))
      continue
    }
    out.push(node)
  }
  return out
}

/** Flatten Fragments and drop Comment + Text so layout items stay real nodes. */
export function flattenElementVNodes(nodes: VNode[] | undefined): VNode[] {
  return flattenSlotVNodes(nodes).filter((node) => node.type !== Text)
}
