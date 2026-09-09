import { computed, defineComponent, h, PropType, ref } from 'vue'
import {
  classNames,
  coerceClassValue,
  getWorkflowActionConfirmCopy,
  getWorkflowStepActorsPresentation,
  getWorkflowTimelineLabels,
  mergeStyleValues,
  mergeTigerLocale,
  resolveWorkflowActionButtonProps,
  resolveWorkflowSignMode,
  resolveWorkflowStepKind,
  shouldConfirmWorkflowAction,
  shouldShowWorkflowActionCommentInput,
  shouldShowWorkflowActions,
  shouldShowWorkflowSignMode,
  sortWorkflowActionBarItems,
  timelineDescriptionClasses,
  timelineLabelClasses,
  workflowSignModeLabel,
  workflowStepActorProgressClasses,
  workflowStepActorRowClasses,
  workflowStepActorsListClasses,
  workflowStepsToTimelineItems,
  workflowStepStatusColor,
  workflowStepStatusDotClasses,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  type TimelineMode,
  type TigerLocale,
  type TigerLocaleWorkflowTimeline,
  type WorkflowActionBarItem,
  type WorkflowActionBarProps as CoreWorkflowActionBarProps,
  type WorkflowStepActorsPresentation,
  type WorkflowTimelineItem,
  type WorkflowTimelineProps as CoreWorkflowTimelineProps,
  type WorkflowTimelineStep,
  type WorkflowTimelineStepStatus
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import { Popconfirm } from './Popconfirm'
import { Tag } from './Tag'
import { Textarea } from './Textarea'
import { Timeline } from './Timeline'

type HChildren = Parameters<typeof h>[2]

export interface VueWorkflowActionBarProps extends CoreWorkflowActionBarProps {
  style?: Record<string, unknown>
}

export interface VueWorkflowTimelineProps extends CoreWorkflowTimelineProps {
  style?: Record<string, unknown>
}

export type WorkflowActionBarProps = VueWorkflowActionBarProps
export type WorkflowTimelineProps = VueWorkflowTimelineProps

const workflowTimelineRootClasses = 'flex flex-col gap-4'
const workflowActionBarClasses = 'flex flex-wrap items-center gap-2'
const workflowStepHeaderClasses = 'flex flex-wrap items-center gap-2'
const workflowStepActorClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
const workflowStepCommentClasses = 'text-sm text-[var(--tiger-text-secondary,#4b5563)] mt-1'

function isWorkflowTimelineItem(item: unknown): item is WorkflowTimelineItem {
  return (
    typeof item === 'object' &&
    item != null &&
    'step' in item &&
    'status' in item &&
    typeof (item as WorkflowTimelineItem).status === 'string'
  )
}

function renderStatusDot(status: WorkflowTimelineStepStatus): ReturnType<typeof h> {
  return h('span', {
    class: workflowStepStatusDotClasses,
    style: { backgroundColor: workflowStepStatusColor(status) },
    'aria-hidden': 'true'
  })
}

function renderWorkflowStepActors(presentation: WorkflowStepActorsPresentation) {
  if (presentation.actors.length === 0) return null
  if (!presentation.list) {
    const only = presentation.actors[0]
    if (!only?.name) return null
    return h('div', { class: workflowStepActorClasses }, only.name)
  }

  return h('div', { class: workflowStepActorsListClasses }, [
    presentation.progressLabel
      ? h('div', { class: workflowStepActorProgressClasses }, presentation.progressLabel)
      : null,
    ...presentation.actors.map((actor) =>
      h('div', { key: actor.key, class: workflowStepActorRowClasses }, [
        actor.avatar
          ? h(Avatar, { size: 'sm', src: actor.avatar, alt: '', 'aria-hidden': true })
          : null,
        renderStatusDot(actor.status),
        actor.name ? h('span', null, actor.name) : null
      ])
    )
  ])
}

function renderStepContent(
  item: WorkflowTimelineItem,
  labels: Required<TigerLocaleWorkflowTimeline>
) {
  const step = item.step
  const title = step.title ?? step.label
  const kind = resolveWorkflowStepKind(step)
  const statusLabel = workflowStepStatusLabel(item.status, labels, kind)
  const signMode = resolveWorkflowSignMode(step)
  const showSignMode = shouldShowWorkflowSignMode(kind, signMode)

  return h('div', { class: 'min-w-0' }, [
    step.time ? h('div', { class: timelineLabelClasses }, step.time) : null,
    h('div', { class: workflowStepHeaderClasses }, [
      title ? h('div', { class: timelineDescriptionClasses }, title as unknown as HChildren) : null,
      showSignMode
        ? h(
            Tag,
            { variant: 'primary', size: 'sm', pill: true },
            { default: () => workflowSignModeLabel(signMode, labels) }
          )
        : null,
      h(
        Tag,
        {
          variant: workflowStepStatusTagVariant(item.status),
          size: 'sm',
          pill: true
        },
        { default: () => statusLabel }
      )
    ]),
    renderWorkflowStepActors(getWorkflowStepActorsPresentation(step, labels)),
    step.comment ? h('div', { class: workflowStepCommentClasses }, step.comment) : null
  ])
}

export const WorkflowActionBar = defineComponent({
  name: 'TigerWorkflowActionBar',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<WorkflowActionBarItem[]>,
      default: undefined
    },
    disabled: Boolean,
    ariaLabel: {
      type: String,
      default: undefined
    },
    confirm: Boolean,
    commentInput: {
      type: Boolean,
      default: undefined
    },
    commentRequired: {
      type: Boolean,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: {
    action: (_item: WorkflowActionBarItem, _payload?: { comment?: string }) => true
  },
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const stepLabels = computed(() => getWorkflowTimelineLabels(config.value.locale))
    const toolbarClasses = computed(() =>
      classNames(workflowActionBarClasses, props.className, coerceClassValue(attrs.class))
    )
    const toolbarStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const comments = ref<Record<string, string>>({})

    return () => {
      const items = sortWorkflowActionBarItems(props.items ?? [])
      return h(
        'div',
        {
          ...attrs,
          class: toolbarClasses.value,
          style: toolbarStyle.value,
          role: 'toolbar',
          'aria-label':
            props.ariaLabel ??
            (attrs['aria-label'] as string | undefined) ??
            stepLabels.value.actionsAriaLabel
        },
        items.map((item) => {
          const buttonProps = resolveWorkflowActionButtonProps(item)
          const disabled = Boolean(props.disabled || item.disabled)
          const confirmCopy = shouldConfirmWorkflowAction(item, props.confirm)
            ? getWorkflowActionConfirmCopy(item.action, stepLabels.value, {
                commentRequired: props.commentRequired
              })
            : null
          const showComment =
            confirmCopy != null &&
            shouldShowWorkflowActionCommentInput(item.action, props.commentInput)

          const emitAction = () => {
            if (disabled) return
            if (showComment) {
              emit('action', item, { comment: comments.value[item.key] ?? '' })
              if (item.key in comments.value) {
                const next = { ...comments.value }
                delete next[item.key]
                comments.value = next
              }
              return
            }
            emit('action', item)
          }

          const button = h(
            Button,
            {
              key: item.key,
              size: 'sm',
              variant: buttonProps.variant,
              danger: buttonProps.danger,
              disabled,
              onClick: confirmCopy ? undefined : emitAction
            },
            { default: () => item.label }
          )
          if (!confirmCopy) return button

          const popconfirmSlots: Record<string, () => unknown> = {
            default: () => button
          }
          if (showComment) {
            popconfirmSlots.description = () => [
              confirmCopy.description ? h('div', null, confirmCopy.description) : null,
              h(Textarea, {
                size: 'sm',
                rows: 2,
                className: 'mt-2 w-full',
                modelValue: comments.value[item.key] ?? '',
                placeholder: confirmCopy.commentPlaceholder,
                'aria-label': confirmCopy.commentPlaceholder,
                'aria-required': props.commentRequired ? true : undefined,
                'onUpdate:modelValue': (value: string) => {
                  comments.value = { ...comments.value, [item.key]: value }
                }
              })
            ]
          }

          return h(
            Popconfirm,
            {
              key: item.key,
              asChild: true,
              title: confirmCopy.title,
              description: showComment ? undefined : confirmCopy.description,
              okType: confirmCopy.okType,
              disabled,
              onConfirm: emitAction
            },
            popconfirmSlots
          )
        })
      )
    }
  }
})

export const WorkflowTimeline = defineComponent({
  name: 'TigerWorkflowTimeline',
  inheritAttrs: false,
  props: {
    steps: {
      type: Array as PropType<WorkflowTimelineStep[]>,
      default: undefined
    },
    actions: {
      type: Array as PropType<WorkflowActionBarItem[]>,
      default: undefined
    },
    showActions: {
      type: Boolean,
      default: undefined
    },
    confirm: Boolean,
    commentInput: {
      type: Boolean,
      default: undefined
    },
    commentRequired: {
      type: Boolean,
      default: undefined
    },
    mode: {
      type: String as PropType<TimelineMode>,
      default: 'left' as TimelineMode
    },
    pending: {
      type: Boolean,
      default: false
    },
    pendingDot: {
      type: [String, Object] as PropType<unknown>,
      default: undefined
    },
    reverse: {
      type: Boolean,
      default: false
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleWorkflowTimeline>>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: {
    action: (_item: WorkflowActionBarItem, _payload?: { comment?: string }) => true
  },
  setup(props, { emit, slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const stepLabels = computed(() => getWorkflowTimelineLabels(mergedLocale.value, props.labels))
    const timelineItems = computed(() => workflowStepsToTimelineItems(props.steps))
    const sortedActions = computed(() => sortWorkflowActionBarItems(props.actions ?? []))
    const showActionBar = computed(() =>
      shouldShowWorkflowActions(props.steps, props.actions, props.showActions)
    )
    const rootClasses = computed(() =>
      classNames(workflowTimelineRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    return () => {
      const timelineSlots: Record<string, unknown> = {}
      if (slots.dot) timelineSlots.dot = slots.dot
      if (slots.pending) timelineSlots.pending = slots.pending
      timelineSlots.item = (slotProps: { item: unknown; index: number }) => {
        if (slots.item) return slots.item(slotProps)
        if (isWorkflowTimelineItem(slotProps.item)) {
          return renderStepContent(slotProps.item, stepLabels.value)
        }
        return null
      }

      const actionBar =
        showActionBar.value && props.actions
          ? slots.actions
            ? slots.actions({ actions: sortedActions.value })
            : h(WorkflowActionBar, {
                items: sortedActions.value,
                confirm: props.confirm,
                commentInput: props.commentInput,
                commentRequired: props.commentRequired,
                ariaLabel: stepLabels.value.actionsAriaLabel,
                onAction: (item: WorkflowActionBarItem, payload?: { comment?: string }) => {
                  if (payload) emit('action', item, payload)
                  else emit('action', item)
                }
              })
          : null

      const {
        class: _class,
        style: _style,
        'aria-label': ariaLabel,
        ...restAttrs
      } = attrs as Record<string, unknown>

      return h(
        'div',
        {
          ...restAttrs,
          class: rootClasses.value,
          style: rootStyle.value
        },
        [
          h(
            Timeline,
            {
              items: timelineItems.value,
              mode: props.mode,
              pending: props.pending,
              pendingDot: props.pendingDot,
              reverse: props.reverse,
              'aria-label':
                (typeof ariaLabel === 'string' ? ariaLabel : undefined) ??
                stepLabels.value.ariaLabel
            },
            timelineSlots
          ),
          actionBar
        ]
      )
    }
  }
})

export default WorkflowTimeline
