import { computed, defineComponent, h, PropType, ref } from 'vue'
import {
  assertWorkflowActionComment,
  buildWorkflowActionPayload,
  classNames,
  coerceClassValue,
  getWorkflowActionConfirmCopy,
  getWorkflowStepActorsPresentation,
  getWorkflowStepRuntimeChrome,
  getWorkflowTimelineLabels,
  isWorkflowActionBarItemDisabled,
  listWorkflowReturnTargets,
  mergeStyleValues,
  mergeTigerLocale,
  resolveAddsignPositions,
  resolveWorkflowActionBarItems,
  resolveWorkflowActionButtonProps,
  resolveWorkflowSignMode,
  resolveWorkflowStepKind,
  shouldConfirmWorkflowAction,
  shouldShowWorkflowActionCommentInput,
  shouldShowWorkflowActions,
  shouldShowWorkflowSignMode,
  sortWorkflowActionBarItems,
  splitWorkflowActionBarItems,
  timelineDescriptionClasses,
  timelineLabelClasses,
  workflowActionBarCommentRequired,
  workflowActionBarItemDisabledReason,
  workflowActionNeedsPicker,
  workflowSignModeLabel,
  workflowStepActorCurrentClasses,
  workflowStepActorMetaClasses,
  workflowStepActorProgressClasses,
  workflowStepActorRowClasses,
  workflowStepActorsListClasses,
  workflowStepsToTimelineItems,
  workflowStepStatusColor,
  workflowStepStatusDotClasses,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  workflowTaskRowStatusLabel,
  workflowTimelineOffPathClasses,
  workflowViewerReturnTargetLabelClasses,
  type TimelineMode,
  type TigerLocale,
  type TigerLocaleWorkflowTimeline,
  type WorkflowActionBarItem,
  type WorkflowActionBarProps as CoreWorkflowActionBarProps,
  type WorkflowActionBarViewerRole,
  type WorkflowActionPayload,
  type WorkflowAddsignPosition,
  type WorkflowAssigneePickerContext,
  type WorkflowNodeButtonPolicy,
  type WorkflowReturnPickerContext,
  type WorkflowReturnTarget,
  type WorkflowSignMode,
  type WorkflowStepActorsPresentation,
  type WorkflowTask,
  type WorkflowTimelineActor,
  type WorkflowTimelineItem,
  type WorkflowTimelineProps as CoreWorkflowTimelineProps,
  type WorkflowTimelineStep,
  type WorkflowTimelineStepStatus
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import { Dropdown, DropdownItem, DropdownMenu } from './Dropdown'
import { Popconfirm } from './Popconfirm'
import { Radio } from './Radio'
import { RadioGroup } from './RadioGroup'
import { Tag } from './Tag'
import { Textarea } from './Textarea'
import { Timeline } from './Timeline'

type HChildren = Parameters<typeof h>[2]

export interface VueWorkflowActionBarProps extends CoreWorkflowActionBarProps {
  style?: Record<string, unknown>
  renderReturnPicker?: (ctx: WorkflowReturnPickerContext) => unknown
  renderAssigneePicker?: (ctx: WorkflowAssigneePickerContext) => unknown
}

export interface VueWorkflowTimelineProps extends CoreWorkflowTimelineProps {
  style?: Record<string, unknown>
  renderReturnPicker?: (ctx: WorkflowReturnPickerContext) => unknown
  renderAssigneePicker?: (ctx: WorkflowAssigneePickerContext) => unknown
}

interface ActionDraft {
  comment: string
  targetNodeKey?: string
  position?: WorkflowAddsignPosition
  signMode?: WorkflowSignMode
  assignee?: WorkflowTimelineActor
  error?: string
}

function emptyActionDraft(
  item: WorkflowActionBarItem,
  returnTargets: WorkflowReturnTarget[],
  addsignPositions: WorkflowAddsignPosition[]
): ActionDraft {
  const draft: ActionDraft = { comment: '' }
  if (item.action === 'return' && returnTargets[0]) draft.targetNodeKey = returnTargets[0].key
  if (item.action === 'addsign' && addsignPositions[0]) draft.position = addsignPositions[0]
  return draft
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

function renderWorkflowStepActors(
  presentation: WorkflowStepActorsPresentation,
  labels: Required<TigerLocaleWorkflowTimeline>
) {
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
      h(
        'div',
        {
          key: actor.key,
          class: classNames(
            workflowStepActorRowClasses,
            actor.current ? workflowStepActorCurrentClasses : null
          ),
          'data-workflow-current': actor.current ? 'true' : undefined
        },
        [
          actor.avatar
            ? h(Avatar, { size: 'sm', src: actor.avatar, alt: '', 'aria-hidden': true })
            : null,
          renderStatusDot(actor.status),
          h('div', { class: 'min-w-0 flex-1' }, [
            h('div', { class: 'flex flex-wrap items-center gap-1.5' }, [
              actor.name ? h('span', null, actor.name) : null,
              actor.addsign
                ? h(
                    Tag,
                    { variant: 'primary', size: 'sm', pill: true },
                    { default: () => labels.addsignTag }
                  )
                : null,
              presentation.fromTasks
                ? h(
                    'span',
                    { class: workflowStepActorMetaClasses },
                    workflowTaskRowStatusLabel(actor, labels)
                  )
                : null
            ]),
            actor.actedAt ? h('div', { class: workflowStepActorMetaClasses }, actor.actedAt) : null,
            actor.comment ? h('div', { class: workflowStepCommentClasses }, actor.comment) : null
          ])
        ]
      )
    )
  ])
}

function renderStepContent(
  item: WorkflowTimelineItem,
  labels: Required<TigerLocaleWorkflowTimeline>,
  tasks?: WorkflowTask[]
) {
  const step = item.step
  const title = step.title ?? step.label
  const kind = resolveWorkflowStepKind(step)
  const statusLabel = workflowStepStatusLabel(item.status, labels, kind)
  const signMode = resolveWorkflowSignMode(step)
  const showSignMode = shouldShowWorkflowSignMode(kind, signMode)
  const chrome = getWorkflowStepRuntimeChrome(step, labels, {
    onPath: item.onPath,
    returnTarget: item.returnTarget,
    conditionBranch: item.conditionBranch
  })

  return h(
    'div',
    {
      class: classNames('min-w-0', !item.onPath ? workflowTimelineOffPathClasses : null),
      'data-workflow-path': item.onPath ? 'on' : 'off',
      'data-workflow-addsign': chrome.addsign ? (step.origin?.position ?? 'true') : undefined,
      'data-workflow-return-target': item.returnTarget ? 'true' : undefined
    },
    [
      step.time ? h('div', { class: timelineLabelClasses }, step.time) : null,
      h('div', { class: workflowStepHeaderClasses }, [
        title
          ? h('div', { class: timelineDescriptionClasses }, title as unknown as HChildren)
          : null,
        showSignMode
          ? h(
              Tag,
              { variant: 'primary', size: 'sm', pill: true },
              { default: () => workflowSignModeLabel(signMode, labels) }
            )
          : null,
        chrome.addsignTag
          ? h(
              Tag,
              { variant: 'primary', size: 'sm', pill: true },
              { default: () => chrome.addsignTag }
            )
          : null,
        chrome.addsignPositionLabel
          ? h(
              Tag,
              { variant: 'default', size: 'sm', pill: true },
              { default: () => chrome.addsignPositionLabel }
            )
          : null,
        chrome.branchPathLabel
          ? h(
              Tag,
              { variant: item.onPath ? 'success' : 'default', size: 'sm', pill: true },
              { default: () => chrome.branchPathLabel }
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
      renderWorkflowStepActors(getWorkflowStepActorsPresentation(step, labels, tasks), labels),
      step.comment ? h('div', { class: workflowStepCommentClasses }, step.comment) : null,
      chrome.returnTargetLabel
        ? h('div', { class: workflowViewerReturnTargetLabelClasses }, chrome.returnTargetLabel)
        : null,
      chrome.pendingAfterAddsignLabel
        ? h('div', { class: workflowStepActorMetaClasses }, chrome.pendingAfterAddsignLabel)
        : null
    ]
  )
}

export const WorkflowActionBar = defineComponent({
  name: 'TigerWorkflowActionBar',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<WorkflowActionBarItem[]>,
      default: undefined
    },
    buttonPolicy: {
      type: Object as PropType<WorkflowNodeButtonPolicy>,
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
    returnTargets: {
      type: Array as PropType<WorkflowReturnTarget[]>,
      default: undefined
    },
    addsignPositions: {
      type: Array as PropType<WorkflowAddsignPosition[]>,
      default: undefined
    },
    currentSignMode: {
      type: String as PropType<WorkflowSignMode>,
      default: undefined
    },
    isStarter: Boolean,
    viewerRole: {
      type: String as PropType<WorkflowActionBarViewerRole>,
      default: undefined
    },
    moreLabel: {
      type: String,
      default: undefined
    },
    renderReturnPicker: {
      type: Function as PropType<(ctx: WorkflowReturnPickerContext) => unknown>,
      default: undefined
    },
    renderAssigneePicker: {
      type: Function as PropType<(ctx: WorkflowAssigneePickerContext) => unknown>,
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
    action: (_item: WorkflowActionBarItem, _payload?: WorkflowActionPayload) => true
  },
  setup(props, { emit, attrs, slots }) {
    const config = useTigerConfig()
    const stepLabels = computed(() => getWorkflowTimelineLabels(config.value.locale))
    const toolbarClasses = computed(() =>
      classNames(workflowActionBarClasses, props.className, coerceClassValue(attrs.class))
    )
    const toolbarStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const drafts = ref<Record<string, ActionDraft>>({})
    const moreItem = ref<WorkflowActionBarItem | null>(null)
    const moreWrapEl = ref<HTMLElement | null>(null)

    const resolvedItems = computed(() =>
      resolveWorkflowActionBarItems({
        items: props.items,
        buttonPolicy: props.buttonPolicy,
        labels: stepLabels.value,
        isStarter: props.isStarter,
        viewerRole: props.viewerRole
      })
    )
    const splitItems = computed(() => splitWorkflowActionBarItems(resolvedItems.value))
    const positions = computed(() =>
      resolveAddsignPositions(props.addsignPositions, props.buttonPolicy)
    )

    return () => {
      const labels = stepLabels.value
      const targets = props.returnTargets ?? []
      const returnPickerFn = props.renderReturnPicker ?? slots.returnPicker
      const assigneePickerFn = props.renderAssigneePicker ?? slots.assigneePicker
      const hasReturnPicker = returnPickerFn != null || props.returnTargets != null
      const hasAssigneePicker = assigneePickerFn != null
      const disableOptions = {
        barDisabled: props.disabled,
        hasReturnPicker,
        hasAssigneePicker,
        returnTargetCount: props.returnTargets == null ? undefined : targets.length
      }

      const getDraft = (item: WorkflowActionBarItem): ActionDraft =>
        drafts.value[item.key] ?? emptyActionDraft(item, targets, positions.value)

      const patchDraft = (item: WorkflowActionBarItem, patch: Partial<ActionDraft>) => {
        drafts.value = {
          ...drafts.value,
          [item.key]: { ...getDraft(item), ...patch }
        }
      }

      const clearDraft = (item: WorkflowActionBarItem) => {
        if (!(item.key in drafts.value)) return
        const next = { ...drafts.value }
        delete next[item.key]
        drafts.value = next
      }

      const emitReadyAction = (
        item: WorkflowActionBarItem,
        event?: { preventDefault: () => void }
      ): boolean => {
        if (isWorkflowActionBarItemDisabled(item, disableOptions)) return false
        const confirming = shouldConfirmWorkflowAction(item, props.confirm)
        if (!confirming) {
          emit('action', item)
          return true
        }
        const required = workflowActionBarCommentRequired(item, props.commentRequired)
        const showComment = shouldShowWorkflowActionCommentInput(
          item.action,
          props.commentInput,
          required
        )
        const draft = getDraft(item)
        const picker = workflowActionNeedsPicker(item.action)
        if (showComment && !assertWorkflowActionComment(draft.comment, required)) {
          patchDraft(item, { error: labels.commentRequiredBlock })
          event?.preventDefault()
          return false
        }
        if (picker === 'return' && !draft.targetNodeKey) {
          patchDraft(item, { error: labels.returnNoTargets })
          event?.preventDefault()
          return false
        }
        if (picker === 'assignee' && !draft.assignee) {
          event?.preventDefault()
          return false
        }
        const payload = buildWorkflowActionPayload({
          action: item.action,
          comment: draft.comment,
          showComment,
          targetNodeKey: draft.targetNodeKey,
          position: draft.position,
          signMode: draft.signMode ?? props.currentSignMode,
          assignee: draft.assignee,
          assignees: draft.assignee ? [draft.assignee] : undefined
        })
        if (payload) emit('action', item, payload)
        else emit('action', item)
        clearDraft(item)
        return true
      }

      const renderPickerFields = (item: WorkflowActionBarItem, copyDescription?: string) => {
        const required = workflowActionBarCommentRequired(item, props.commentRequired)
        const showComment = shouldShowWorkflowActionCommentInput(
          item.action,
          props.commentInput,
          required
        )
        const draft = getDraft(item)
        const picker = workflowActionNeedsPicker(item.action)
        const confirmCopy = getWorkflowActionConfirmCopy(item.action, labels, {
          commentRequired: required
        })
        const returnPickerCtx: WorkflowReturnPickerContext = {
          targets,
          value: draft.targetNodeKey,
          onChange: (key) => patchDraft(item, { targetNodeKey: key, error: undefined }),
          emptyText: labels.returnNoTargets,
          title: labels.returnPickerTitle
        }
        const assigneeCtx: WorkflowAssigneePickerContext = {
          action: item.action,
          value: draft.assignee,
          values: draft.assignee ? [draft.assignee] : undefined,
          onChange: (actor) => patchDraft(item, { assignee: actor, error: undefined }),
          multiple: item.action === 'addsign'
        }
        const customReturn = returnPickerFn?.(returnPickerCtx)
        const customAssignee = assigneePickerFn?.(assigneeCtx)

        return [
          copyDescription ? h('div', null, copyDescription) : null,
          picker === 'return'
            ? h('div', { class: 'mt-2' }, [
                h('div', { class: 'mb-1 text-sm font-medium' }, labels.returnPickerTitle),
                customReturn
                  ? customReturn
                  : targets.length === 0
                    ? h(
                        'div',
                        { class: 'text-sm text-[var(--tiger-text-muted,#6b7280)]' },
                        labels.returnNoTargets
                      )
                    : h(
                        RadioGroup,
                        {
                          size: 'sm',
                          modelValue: draft.targetNodeKey,
                          'aria-label': labels.returnPickerTitle,
                          'onUpdate:modelValue': (value: string | number) =>
                            patchDraft(item, { targetNodeKey: String(value), error: undefined })
                        },
                        {
                          default: () =>
                            targets.map((target) =>
                              h(
                                Radio,
                                { key: target.key, value: target.key },
                                {
                                  default: () =>
                                    `${target.title ?? target.key}${
                                      target.actorName ? `  ${target.actorName}` : ''
                                    }`
                                }
                              )
                            )
                        }
                      )
              ])
            : null,
          item.action === 'addsign' && positions.value.length > 1
            ? h('div', { class: 'mt-2' }, [
                h(
                  RadioGroup,
                  {
                    size: 'sm',
                    modelValue: draft.position,
                    'aria-label': labels.actionAddsign,
                    'onUpdate:modelValue': (value: string | number) =>
                      patchDraft(item, {
                        position: value as WorkflowAddsignPosition,
                        error: undefined
                      })
                  },
                  {
                    default: () =>
                      positions.value.map((position) =>
                        h(
                          Radio,
                          { key: position, value: position },
                          {
                            default: () =>
                              position === 'after' ? labels.addsignAfter : labels.addsignBefore
                          }
                        )
                      )
                  }
                )
              ])
            : null,
          picker === 'assignee' && customAssignee
            ? h('div', { class: 'mt-2' }, [customAssignee])
            : null,
          showComment
            ? h(Textarea, {
                size: 'sm',
                rows: 2,
                className: 'mt-2 w-full',
                modelValue: draft.comment,
                placeholder: confirmCopy?.commentPlaceholder,
                'aria-label': confirmCopy?.commentPlaceholder,
                'aria-required': required ? true : undefined,
                'onUpdate:modelValue': (value: string) =>
                  patchDraft(item, { comment: value, error: undefined })
              })
            : null,
          draft.error
            ? h(
                'div',
                { role: 'alert', class: 'mt-2 text-sm text-[var(--tiger-error,#dc2626)]' },
                draft.error
              )
            : null
        ]
      }

      const renderBarButton = (item: WorkflowActionBarItem) => {
        const buttonProps = resolveWorkflowActionButtonProps(item)
        const itemDisabled = isWorkflowActionBarItemDisabled(item, disableOptions)
        const reason = workflowActionBarItemDisabledReason(item, {
          ...disableOptions,
          returnNoTargets: labels.returnNoTargets
        })
        const required = workflowActionBarCommentRequired(item, props.commentRequired)
        const confirmCopy = shouldConfirmWorkflowAction(item, props.confirm)
          ? getWorkflowActionConfirmCopy(item.action, labels, { commentRequired: required })
          : null
        const showComment =
          confirmCopy != null &&
          shouldShowWorkflowActionCommentInput(item.action, props.commentInput, required)
        const extra =
          confirmCopy != null &&
          (showComment ||
            workflowActionNeedsPicker(item.action) != null ||
            (item.action === 'addsign' && positions.value.length > 1))

        const button = h(
          Button,
          {
            key: item.key,
            size: 'sm',
            variant: buttonProps.variant,
            danger: buttonProps.danger,
            disabled: itemDisabled,
            title: reason,
            'aria-description': reason,
            onClick: confirmCopy ? undefined : () => emitReadyAction(item)
          },
          { default: () => item.label }
        )
        if (!confirmCopy) return button

        const popconfirmSlots: Record<string, () => unknown> = {
          default: () => button
        }
        if (extra) {
          popconfirmSlots.description = () => renderPickerFields(item, confirmCopy.description)
        }

        return h(
          Popconfirm,
          {
            key: item.key,
            asChild: true,
            title: confirmCopy.title,
            description: extra ? undefined : confirmCopy.description,
            okType: confirmCopy.okType,
            disabled: itemDisabled,
            onConfirm: (event?: { preventDefault: () => void }) => emitReadyAction(item, event)
          },
          popconfirmSlots
        )
      }

      const pendingMore = moreItem.value
      const moreRequired = pendingMore
        ? workflowActionBarCommentRequired(pendingMore, props.commentRequired)
        : false
      const moreConfirmCopy =
        pendingMore && shouldConfirmWorkflowAction(pendingMore, props.confirm)
          ? getWorkflowActionConfirmCopy(pendingMore.action, labels, {
              commentRequired: moreRequired
            })
          : null
      const moreShowComment =
        pendingMore != null &&
        moreConfirmCopy != null &&
        shouldShowWorkflowActionCommentInput(pendingMore.action, props.commentInput, moreRequired)
      const moreExtra =
        pendingMore != null &&
        moreConfirmCopy != null &&
        (moreShowComment ||
          workflowActionNeedsPicker(pendingMore.action) != null ||
          (pendingMore.action === 'addsign' && positions.value.length > 1))

      const moreNode =
        splitItems.value.more.length > 0
          ? h('div', { ref: moreWrapEl, class: 'relative inline-flex' }, [
              h(
                Dropdown,
                { asChild: true },
                {
                  default: () => [
                    h(
                      Button,
                      { size: 'sm', variant: 'outline' },
                      () => props.moreLabel ?? labels.moreActions
                    ),
                    h(DropdownMenu, null, {
                      default: () =>
                        splitItems.value.more.map((item) => {
                          const itemDisabled = isWorkflowActionBarItemDisabled(item, disableOptions)
                          const reason = workflowActionBarItemDisabledReason(item, {
                            ...disableOptions,
                            returnNoTargets: labels.returnNoTargets
                          })
                          const needsDialog = shouldConfirmWorkflowAction(item, props.confirm)
                          return h(
                            DropdownItem,
                            {
                              key: item.key,
                              disabled: itemDisabled,
                              title: reason,
                              onClick: () => {
                                if (itemDisabled) return
                                if (needsDialog) moreItem.value = item
                                else emitReadyAction(item)
                              }
                            },
                            { default: () => item.label }
                          )
                        })
                    })
                  ]
                }
              ),
              h(
                Popconfirm,
                {
                  open: pendingMore != null,
                  title: moreConfirmCopy?.title,
                  description: moreExtra ? undefined : moreConfirmCopy?.description,
                  okType: moreConfirmCopy?.okType,
                  disabled: pendingMore == null,
                  'onUpdate:open': (open: boolean) => {
                    if (!open) {
                      moreItem.value = null
                      moreWrapEl.value?.querySelector('button')?.focus()
                    }
                  },
                  'onOpen-change': (open: boolean) => {
                    if (!open) {
                      moreItem.value = null
                      moreWrapEl.value?.querySelector('button')?.focus()
                    }
                  },
                  onConfirm: (event?: { preventDefault: () => void }) => {
                    if (!moreItem.value) return
                    if (emitReadyAction(moreItem.value, event)) moreItem.value = null
                  }
                },
                {
                  default: () =>
                    h('span', {
                      class: 'pointer-events-none absolute inset-0',
                      'aria-hidden': 'true'
                    }),
                  description:
                    pendingMore && moreExtra
                      ? () => renderPickerFields(pendingMore, moreConfirmCopy?.description)
                      : undefined
                }
              )
            ])
          : null

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
            labels.actionsAriaLabel
        },
        [...splitItems.value.bar.map((item) => renderBarButton(item)), moreNode]
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
    tasks: {
      type: Array as PropType<WorkflowTask[]>,
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
    buttonPolicy: {
      type: Object as PropType<WorkflowNodeButtonPolicy>,
      default: undefined
    },
    returnTargets: {
      type: Array as PropType<WorkflowReturnTarget[]>,
      default: undefined
    },
    addsignPositions: {
      type: Array as PropType<WorkflowAddsignPosition[]>,
      default: undefined
    },
    isStarter: Boolean,
    viewerRole: {
      type: String as PropType<WorkflowActionBarViewerRole>,
      default: undefined
    },
    renderReturnPicker: {
      type: Function as PropType<(ctx: WorkflowReturnPickerContext) => unknown>,
      default: undefined
    },
    renderAssigneePicker: {
      type: Function as PropType<(ctx: WorkflowAssigneePickerContext) => unknown>,
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
    action: (_item: WorkflowActionBarItem, _payload?: WorkflowActionPayload) => true
  },
  setup(props, { emit, slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const stepLabels = computed(() => getWorkflowTimelineLabels(mergedLocale.value, props.labels))
    const timelineItems = computed(() =>
      workflowStepsToTimelineItems(props.steps, { tasks: props.tasks })
    )
    const resolvedActions = computed(() =>
      resolveWorkflowActionBarItems({
        items: props.actions,
        buttonPolicy: props.buttonPolicy,
        labels: stepLabels.value,
        isStarter: props.isStarter,
        viewerRole: props.viewerRole
      })
    )
    const sortedActions = computed(() => sortWorkflowActionBarItems(resolvedActions.value))
    const derivedReturnTargets = computed(() =>
      props.returnTargets !== undefined
        ? props.returnTargets
        : listWorkflowReturnTargets(props.steps)
    )
    const showActionBar = computed(() =>
      shouldShowWorkflowActions(props.steps, sortedActions.value, props.showActions)
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
          return renderStepContent(slotProps.item, stepLabels.value, props.tasks)
        }
        return null
      }

      const actionBar =
        showActionBar.value && sortedActions.value.length > 0
          ? slots.actions
            ? slots.actions({ actions: sortedActions.value })
            : h(
                WorkflowActionBar,
                {
                  items: sortedActions.value,
                  buttonPolicy: props.buttonPolicy,
                  confirm: props.confirm,
                  commentInput: props.commentInput,
                  commentRequired: props.commentRequired,
                  returnTargets: derivedReturnTargets.value,
                  addsignPositions: props.addsignPositions,
                  isStarter: props.isStarter,
                  viewerRole: props.viewerRole,
                  renderReturnPicker: props.renderReturnPicker,
                  renderAssigneePicker: props.renderAssigneePicker,
                  ariaLabel: stepLabels.value.actionsAriaLabel,
                  onAction: (item: WorkflowActionBarItem, payload?: WorkflowActionPayload) => {
                    if (payload) emit('action', item, payload)
                    else emit('action', item)
                  }
                },
                {
                  returnPicker: slots.returnPicker,
                  assigneePicker: slots.assigneePicker
                }
              )
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
