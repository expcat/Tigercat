import { computed, defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getWorkflowActionConfirmCopy,
  getWorkflowTimelineLabels,
  mergeStyleValues,
  mergeTigerLocale,
  resolveWorkflowActionButtonProps,
  resolveWorkflowSignMode,
  shouldConfirmWorkflowAction,
  shouldShowWorkflowActions,
  timelineDescriptionClasses,
  timelineLabelClasses,
  workflowSignModeLabel,
  workflowStepsToTimelineItems,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  type TimelineMode,
  type TigerLocale,
  type TigerLocaleWorkflowTimeline,
  type WorkflowActionBarItem,
  type WorkflowActionBarProps as CoreWorkflowActionBarProps,
  type WorkflowTimelineItem,
  type WorkflowTimelineProps as CoreWorkflowTimelineProps,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import { Popconfirm } from './Popconfirm'
import { Tag } from './Tag'
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

function renderStepContent(
  item: WorkflowTimelineItem,
  labels: Required<TigerLocaleWorkflowTimeline>
) {
  const step = item.step
  const title = step.title ?? step.label
  const statusLabel = workflowStepStatusLabel(item.status, labels)
  const signMode = resolveWorkflowSignMode(step)
  const showSignMode = signMode !== 'sequential'

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
    step.actor?.name ? h('div', { class: workflowStepActorClasses }, step.actor.name) : null,
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
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['action'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const stepLabels = computed(() => getWorkflowTimelineLabels(config.value.locale))
    const toolbarClasses = computed(() =>
      classNames(workflowActionBarClasses, props.className, coerceClassValue(attrs.class))
    )
    const toolbarStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    return () => {
      const items = props.items ?? []
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
            ? getWorkflowActionConfirmCopy(item.action, stepLabels.value)
            : null
          const button = h(
            Button,
            {
              key: item.key,
              size: 'sm',
              variant: buttonProps.variant,
              danger: buttonProps.danger,
              disabled,
              onClick: confirmCopy
                ? undefined
                : () => {
                    if (disabled) return
                    emit('action', item)
                  }
            },
            { default: () => item.label }
          )
          if (!confirmCopy) return button
          return h(
            Popconfirm,
            {
              key: item.key,
              asChild: true,
              title: confirmCopy.title,
              okType: confirmCopy.okType,
              disabled,
              onConfirm: () => {
                if (disabled) return
                emit('action', item)
              }
            },
            { default: () => button }
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
  emits: ['action'],
  setup(props, { emit, slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const stepLabels = computed(() => getWorkflowTimelineLabels(mergedLocale.value, props.labels))
    const timelineItems = computed(() => workflowStepsToTimelineItems(props.steps))
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
            ? slots.actions({ actions: props.actions })
            : h(WorkflowActionBar, {
                items: props.actions,
                confirm: props.confirm,
                ariaLabel: stepLabels.value.actionsAriaLabel,
                onAction: (item: WorkflowActionBarItem) => emit('action', item)
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
