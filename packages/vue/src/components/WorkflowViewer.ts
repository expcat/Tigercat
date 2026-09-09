import { computed, defineComponent, h, PropType, type VNode } from 'vue'
import {
  buildWorkflowViewerTree,
  classNames,
  coerceClassValue,
  getWorkflowRollbackStep,
  getWorkflowStepActorsPresentation,
  getWorkflowTimelineLabels,
  getWorkflowViewerLegendItems,
  mergeStyleValues,
  mergeTigerLocale,
  shouldShowWorkflowSignMode,
  timelineDescriptionClasses,
  workflowSignModeLabel,
  workflowStepActorProgressClasses,
  workflowStepActorRowClasses,
  workflowStepActorsListClasses,
  workflowStepKindLabel,
  workflowStepStatusColor,
  workflowStepStatusDotClasses,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  workflowViewerActiveTitleClasses,
  workflowViewerBranchClasses,
  workflowViewerCardClassName,
  workflowViewerChildLayout,
  workflowViewerConnectorClasses,
  workflowViewerItemClasses,
  workflowViewerKindRowClasses,
  workflowViewerLegendClasses,
  workflowViewerLegendItemClasses,
  workflowViewerListClasses,
  workflowViewerRollbackLabelClasses,
  workflowViewerRootClasses,
  type TigerLocale,
  type TigerLocaleWorkflowTimeline,
  type WorkflowStepActorsPresentation,
  type WorkflowTimelineStep,
  type WorkflowTimelineStepStatus,
  type WorkflowViewerLegendItem,
  type WorkflowViewerNode,
  type WorkflowViewerProps as CoreWorkflowViewerProps
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { useTigerConfig } from './ConfigProvider'
import { Tag } from './Tag'

type HChildren = Parameters<typeof h>[2]

export interface VueWorkflowViewerProps extends CoreWorkflowViewerProps {
  style?: Record<string, unknown>
}

export type WorkflowViewerProps = VueWorkflowViewerProps

const workflowStepActorClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
const workflowStepCommentClasses = 'text-sm text-[var(--tiger-text-secondary,#4b5563)] mt-1'

function renderStatusDot(status: WorkflowTimelineStepStatus): VNode {
  return h('span', {
    class: workflowStepStatusDotClasses,
    style: { backgroundColor: workflowStepStatusColor(status) },
    'aria-hidden': 'true'
  })
}

function renderWorkflowStepActors(presentation: WorkflowStepActorsPresentation): VNode | null {
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

function renderViewerLegend(items: WorkflowViewerLegendItem[], ariaLabel: string): VNode | null {
  if (items.length === 0) return null
  return h(
    'div',
    { class: workflowViewerLegendClasses, role: 'group', 'aria-label': ariaLabel },
    items.map((item) =>
      h('span', { key: item.key, class: workflowViewerLegendItemClasses }, [
        h('span', { class: item.swatchClassName, 'aria-hidden': 'true' }),
        item.label
      ])
    )
  )
}

function renderViewerCard(
  node: WorkflowViewerNode,
  labels: Required<TigerLocaleWorkflowTimeline>,
  highlightPath: boolean,
  showRollbackPoint: boolean
): VNode {
  const step = node.step
  const title = step.title ?? step.label
  const statusLabel = workflowStepStatusLabel(node.status, labels, node.kind)
  const kindLabel = workflowStepKindLabel(node.kind, labels)
  const showSignMode = shouldShowWorkflowSignMode(node.kind, node.signMode)
  const rollbackLabel = showRollbackPoint && node.rollbackPoint ? labels.rollbackPoint : null
  const isActive = node.status === 'active'

  return h(
    'div',
    {
      class: workflowViewerCardClassName(node, { highlightPath, showRollbackPoint }),
      'aria-current': isActive ? 'step' : undefined
    },
    [
      h('div', { class: workflowViewerKindRowClasses }, [
        renderStatusDot(node.status),
        h(Tag, { variant: 'default', size: 'sm', pill: true }, { default: () => kindLabel }),
        showSignMode
          ? h(
              Tag,
              { variant: 'primary', size: 'sm', pill: true },
              { default: () => workflowSignModeLabel(node.signMode, labels) }
            )
          : null,
        h(
          Tag,
          {
            variant: workflowStepStatusTagVariant(node.status),
            size: 'sm',
            pill: true
          },
          { default: () => statusLabel }
        )
      ]),
      title
        ? h(
            'div',
            {
              class: classNames(
                timelineDescriptionClasses,
                'mt-1',
                isActive ? workflowViewerActiveTitleClasses : null
              )
            },
            title as unknown as HChildren
          )
        : null,
      renderWorkflowStepActors(getWorkflowStepActorsPresentation(step, labels)),
      step.comment ? h('div', { class: workflowStepCommentClasses }, step.comment) : null,
      rollbackLabel ? h('div', { class: workflowViewerRollbackLabelClasses }, rollbackLabel) : null
    ]
  )
}

function renderViewerSequence(
  nodes: WorkflowViewerNode[],
  labels: Required<TigerLocaleWorkflowTimeline>,
  highlightPath: boolean,
  showRollbackPoint: boolean,
  layout: 'stack' | 'branch'
): VNode {
  return h(
    'ol',
    { class: layout === 'branch' ? workflowViewerBranchClasses : workflowViewerListClasses },
    nodes.map((node, index) =>
      h('li', { key: node.key, class: workflowViewerItemClasses }, [
        layout === 'stack' && index > 0
          ? h('div', { class: workflowViewerConnectorClasses, 'aria-hidden': 'true' })
          : null,
        renderViewerCard(node, labels, highlightPath, showRollbackPoint),
        node.children.length > 0
          ? [
              h('div', { class: workflowViewerConnectorClasses, 'aria-hidden': 'true' }),
              renderViewerSequence(
                node.children,
                labels,
                highlightPath,
                showRollbackPoint,
                workflowViewerChildLayout(node)
              )
            ]
          : null
      ])
    )
  )
}

export const WorkflowViewer = defineComponent({
  name: 'TigerWorkflowViewer',
  inheritAttrs: false,
  props: {
    steps: {
      type: Array as PropType<WorkflowTimelineStep[]>,
      default: undefined
    },
    highlightPath: {
      type: Boolean,
      default: true
    },
    showRollbackPoint: {
      type: Boolean,
      default: true
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
  setup(props, { attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const stepLabels = computed(() => getWorkflowTimelineLabels(mergedLocale.value, props.labels))
    const tree = computed(() => buildWorkflowViewerTree(props.steps))
    const rootClasses = computed(() =>
      classNames(workflowViewerRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const legendItems = computed(() => {
      if (props.highlightPath === false) return []
      return getWorkflowViewerLegendItems(stepLabels.value, {
        showRollbackPoint:
          props.showRollbackPoint !== false && getWorkflowRollbackStep(props.steps) != null
      })
    })

    return () => {
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
          style: rootStyle.value,
          role: 'region',
          'aria-label':
            (typeof ariaLabel === 'string' ? ariaLabel : undefined) ??
            stepLabels.value.viewerAriaLabel
        },
        [
          renderViewerLegend(legendItems.value, stepLabels.value.legendAriaLabel),
          renderViewerSequence(
            tree.value,
            stepLabels.value,
            props.highlightPath !== false,
            props.showRollbackPoint !== false,
            'stack'
          )
        ]
      )
    }
  }
})

export default WorkflowViewer
