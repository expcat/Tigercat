// CommentThread visual recipes shared by the React and Vue bindings.
import { classNames } from '../utils/class-names'
const buttonBaseClasses =
  'tiger-motion-aware px-2 py-0.5 h-auto min-h-0 text-xs rounded-[var(--tiger-radius-md)] [transition:var(--tiger-transition-base)]'

export const commentThreadActionButtonClasses = `${buttonBaseClasses} text-[var(--tiger-text-secondary)] font-medium flex items-center gap-1.5`
export const commentThreadPrimaryButtonClasses = `${buttonBaseClasses} text-[var(--tiger-primary)] hover:text-[var(--tiger-primary-hover)] font-semibold hover:bg-[var(--tiger-outline-bg-hover)]`
export const commentThreadLikeButtonClasses =
  'hover:text-[var(--tiger-primary)] hover:bg-[var(--tiger-outline-bg-hover)]'
export const commentThreadLikedButtonClasses =
  'text-[var(--tiger-primary)] bg-[var(--tiger-outline-bg-hover)] font-semibold border-[var(--tiger-primary)]/40'
export const commentThreadReplyButtonClasses =
  'hover:text-[var(--tiger-success)] hover:bg-[var(--tiger-surface-muted)]'
export const commentThreadNeutralButtonClasses =
  'hover:text-[var(--tiger-text)] hover:bg-[var(--tiger-surface-muted)]'
export const commentThreadLikeIconClasses =
  'tiger-motion-aware w-3.5 h-3.5 transition-transform active:scale-125'
/** Shared reply indent: parent avatar (2.5rem) plus the row gap (0.75rem). */
export const commentThreadListClasses = '[--tiger-comment-reply-indent:3.25rem]'

export const commentThreadReplyItemClasses =
  'mt-4 border-s-2 border-s-[var(--tiger-border)] ps-[var(--tiger-spacing-lg)]'

/**
 * Inset rule between root comments. It starts under the parent text, not at the card edge,
 * and is not drawn between a comment and its replies.
 */
export const commentThreadDividerClasses =
  "relative before:pointer-events-none before:absolute before:top-0 before:z-0 before:start-[var(--tiger-comment-reply-indent)] before:end-0 before:h-px before:bg-[var(--tiger-border)] before:content-['']"

export function getCommentThreadItemClasses(options: {
  depth: number
  showDivider: boolean
  hasPreviousRoot: boolean
}): string {
  const reply = options.depth > 1
  return classNames(
    'tiger-comment-thread-item',
    !reply && 'py-5',
    !reply && options.hasPreviousRoot && options.showDivider && commentThreadDividerClasses,
    reply && commentThreadReplyItemClasses
  )
}

export function getCommentThreadItemStyle(
  depth: number
): { marginInlineStart: string } | undefined {
  if (depth <= 1) return undefined
  return {
    marginInlineStart: `calc(${depth - 1} * var(--tiger-comment-reply-indent))`
  }
}
export const commentThreadAvatarClasses =
  'tiger-motion-aware shrink-0 mt-0.5 ring-1 ring-[var(--tiger-border)] shadow-sm [transition:var(--tiger-transition-base)] hover:scale-105'
export const commentThreadAuthorClasses =
  'tiger-motion-aware text-[var(--tiger-text)] hover:text-[var(--tiger-primary)] transition-colors cursor-pointer'
export const commentThreadUserTitleClasses =
  'bg-[var(--tiger-surface-muted)] px-1.5 py-0.5 rounded text-[var(--tiger-text-secondary)] font-medium'
export const commentThreadTimeClasses = 'ml-auto text-[var(--tiger-text-secondary)] font-normal'
export const commentThreadContentClasses =
  'text-sm text-[var(--tiger-text-secondary)] leading-relaxed break-words mt-2 mb-3 pr-2'
export const commentThreadReplyEditorClasses =
  'tiger-motion-aware mt-3 space-y-3 bg-[var(--tiger-surface-muted)] border border-[var(--tiger-border)] p-4 rounded-[var(--tiger-radius-lg)] shadow-sm [transition:var(--tiger-transition-base)]'
export const commentThreadReplyTextareaClasses =
  'tiger-motion-aware bg-[var(--tiger-surface)] border-[var(--tiger-border)] focus:ring-2 focus:ring-[var(--tiger-primary)]/20 focus:border-[var(--tiger-primary)] rounded-[var(--tiger-radius-md)] shadow-inner [transition:var(--tiger-transition-base)]'
export const commentThreadCancelButtonClasses =
  'tiger-motion-aware px-3 py-1.5 text-xs text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-text)] rounded-[var(--tiger-radius-md)] transition-colors'
export const commentThreadSubmitButtonClasses =
  'tiger-motion-aware px-3 py-1.5 text-xs font-semibold shadow-sm hover:shadow rounded-[var(--tiger-radius-md)] [transition:var(--tiger-transition-base)]'
export const commentThreadRepliesClasses =
  'tiger-motion-aware mt-4 ml-1 pl-4 border-l-2 border-[var(--tiger-border)] hover:border-[var(--tiger-primary)]/40 space-y-4 transition-colors'
export const commentThreadEmptyClasses =
  'tiger-motion-aware flex flex-col items-center justify-center border border-dashed border-[var(--tiger-border)] rounded-[var(--tiger-radius-lg)] py-12 px-4 bg-[var(--tiger-surface-muted)] transition-colors'
export const commentThreadEmptyIconClasses = 'w-10 h-10 text-[var(--tiger-text-secondary)] mb-3'
