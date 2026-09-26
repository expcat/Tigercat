import { computed, defineComponent, h, PropType, type VNode } from 'vue'
import {
  buildWorkflowViewerTree,
  classNames,
  coerceClassValue,
  getWorkflowReturnTargetStep,
  getWorkflowRollbackStep,
  getWorkflowStepActorsPresentation,
  getWorkflowStepRuntimeChrome,
  getWorkflowTimelineLabels,
  getWorkflowViewerLegendItems,
  mergeStyleValues,
  mergeTigerLocale,
  shouldShowWorkflowSignMode,
  timelineDescriptionClasses,
  workflowSignModeLabel,
  workflowStepActorCurrentClasses,
  workflowStepActorMetaClasses,
  workflowStepActorProgressClasses,
  workflowStepActorRowClasses,
  workflowStepActorsListClasses,
  workflowStepKindLabel,
  workflowStepStatusColor,
  workflowStepStatusDotClasses,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  workflowTaskRowStatusLabel,
  layoutWorkflowViewer,
  workflowViewerActiveTitleClasses,
  workflowViewerBarClasses,
  workflowViewerCardClassName,
  workflowViewerCardGridStyle,
  workflowViewerCellClasses,
  workflowViewerEdgeForkClasses,
  workflowViewerEdgeGridStyle,
  workflowViewerEdgeJoinClasses,
  workflowViewerEdgeSequenceClasses,
  workflowViewerForkDropClasses,
  workflowViewerGraphClasses,
  workflowViewerGridStyle,
  workflowViewerJoinBarClasses,
  workflowViewerBarStyle,
  workflowViewerKindRowClasses,
  workflowViewerLegendClasses,
  workflowViewerLegendItemClasses,
  workflowViewerLoopClasses,
  workflowViewerLoopGridStyle,
  workflowViewerLoopLabelClasses,
  workflowViewerLoopLineClasses,
  workflowViewerLoopMarkStyle,
  workflowViewerLoopPieceStyle,
  workflowViewerRiserClasses,
  workflowViewerReturnTargetLabelClasses,
  workflowViewerRollbackLabelClasses,
  workflowViewerRootClasses,
  type TigerLocale,
  type TigerLocaleWorkflowTimeline,
  type WorkflowStepActorsPresentation,
  type WorkflowTask,
  type WorkflowTimelineStep,
  type WorkflowTimelineStepStatus,
  type WorkflowViewerLayout,
  type WorkflowViewerLayoutEdge,
  type WorkflowViewerLegendItem,
  type WorkflowViewerLoopPiece,
  type WorkflowViewerNode,
  type WorkflowViewerProps as CoreWorkflowViewerProps
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { useTigerConfig } from './tiger-config'
import { Tag } from './Tag'

type HChildren = Parameters<typeof h>[2]

export interface VueWorkflowViewerProps extends CoreWorkflowViewerProps {
  style?: Record<string, unknown>
}

export type WorkflowViewerProps = VueWorkflowViewerProps

const workflowStepActorClasses = 'text-sm text-[var(--tiger-text-secondary)]'
const workflowStepCommentClasses = 'text-sm text-[var(--tiger-text-secondary)] mt-1'

function renderStatusDot(status: WorkflowTimelineStepStatus): VNode {
  return h('span', {
    class: workflowStepStatusDotClasses,
    style: { backgroundColor: workflowStepStatusColor(status) },
    'aria-hidden': 'true'
  })
}

function renderWorkflowStepActors(
  presentation: WorkflowStepActorsPresentation,
  labels: Required<TigerLocaleWorkflowTimeline>
): VNode | null {
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
  showRollbackPoint: boolean,
  tasks?: WorkflowTask[]
): VNode {
  const step = node.step
  const title = step.title ?? step.label
  const statusLabel = workflowStepStatusLabel(node.status, labels, node.kind)
  const kindLabel = workflowStepKindLabel(node.kind, labels)
  const showSignMode = shouldShowWorkflowSignMode(node.kind, node.signMode)
  const rollbackLabel = showRollbackPoint && node.rollbackPoint ? labels.rollbackPoint : null
  const isActive = node.status === 'active'
  const chrome = getWorkflowStepRuntimeChrome(step, labels, {
    onPath: node.onPath,
    returnTarget: node.returnTarget,
    conditionBranch: node.conditionBranch,
    highlightPath
  })

  return h(
    'div',
    {
      class: workflowViewerCardClassName(node, { highlightPath, showRollbackPoint }),
      'aria-current': isActive ? 'step' : undefined,
      'data-workflow-path': node.onPath ? 'on' : 'off',
      'data-workflow-addsign': chrome.addsign ? (step.origin?.position ?? 'true') : undefined,
      'data-workflow-return-target': node.returnTarget ? 'true' : undefined
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
              { variant: node.onPath ? 'success' : 'default', size: 'sm', pill: true },
              { default: () => chrome.branchPathLabel }
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
      renderWorkflowStepActors(getWorkflowStepActorsPresentation(step, labels, tasks), labels),
      step.comment ? h('div', { class: workflowStepCommentClasses }, step.comment) : null,
      rollbackLabel ? h('div', { class: workflowViewerRollbackLabelClasses }, rollbackLabel) : null,
      chrome.returnTargetLabel
        ? h('div', { class: workflowViewerReturnTargetLabelClasses }, chrome.returnTargetLabel)
        : null,
      chrome.pendingAfterAddsignLabel
        ? h('div', { class: workflowStepActorMetaClasses }, chrome.pendingAfterAddsignLabel)
        : null
    ]
  )
}

const WORKFLOW_VIEWER_LOOP_PIECES: WorkflowViewerLoopPiece[] = [
  'stem-start',
  'stem-mid',
  'stem-end',
  'arm-start',
  'arm-end',
  'label'
]

function renderViewerEdge(edge: WorkflowViewerLayoutEdge): VNode | null {
  if (edge.kind === 'loop') return null
  if (edge.kind === 'riser') {
    return h('div', {
      key: `riser-${edge.from}-${edge.to}`,
      class: workflowViewerRiserClasses,
      style: workflowViewerEdgeGridStyle(edge),
      'data-workflow-edge': 'riser',
      'aria-hidden': 'true'
    })
  }
  const bar =
    edge.kind === 'fork' || edge.kind === 'join'
      ? h('span', {
          class: edge.kind === 'fork' ? workflowViewerBarClasses : workflowViewerJoinBarClasses,
          style: workflowViewerBarStyle(edge),
          'aria-hidden': 'true'
        })
      : null
  return h(
    'div',
    {
      key: `${edge.kind}-${edge.from}-${edge.to}`,
      class:
        edge.kind === 'fork'
          ? workflowViewerEdgeForkClasses
          : edge.kind === 'join'
            ? workflowViewerEdgeJoinClasses
            : workflowViewerEdgeSequenceClasses,
      style: workflowViewerEdgeGridStyle(edge),
      'data-workflow-edge': edge.kind,
      'aria-hidden': 'true'
    },
    bar ? [bar] : undefined
  )
}

function renderViewerLoop(
  layout: WorkflowViewerLayout,
  edge: WorkflowViewerLayoutEdge,
  labels: Required<TigerLocaleWorkflowTimeline>
): VNode | null {
  const style = workflowViewerLoopGridStyle(layout, edge)
  if (!style) return null
  const target = layout.placements.find((placement) => placement.key === edge.to)
  const title = target?.node.step.title ?? target?.node.step.label ?? edge.to
  const aria = `${labels.returnTarget}: ${title}`
  return h(
    'div',
    {
      key: `loop-${edge.from}-${edge.to}`,
      class: workflowViewerLoopClasses,
      style,
      role: 'img',
      'aria-label': aria,
      'data-workflow-edge': 'loop',
      'data-workflow-loop-from': edge.from,
      'data-workflow-loop-to': edge.to
    },
    WORKFLOW_VIEWER_LOOP_PIECES.map((piece) =>
      h(
        'div',
        {
          key: piece,
          style: workflowViewerLoopPieceStyle(piece),
          'data-workflow-loop-piece': piece,
          'aria-hidden': 'true'
        },
        [
          h(
            'span',
            {
              class:
                piece === 'label' ? workflowViewerLoopLabelClasses : workflowViewerLoopLineClasses,
              style: workflowViewerLoopMarkStyle(piece)
            },
            piece === 'label' ? title : undefined
          )
        ]
      )
    )
  )
}

function renderViewerGraph(
  nodes: WorkflowViewerNode[],
  labels: Required<TigerLocaleWorkflowTimeline>,
  highlightPath: boolean,
  showRollbackPoint: boolean,
  tasks?: WorkflowTask[]
): VNode {
  const layout = layoutWorkflowViewer(nodes)
  return h(
    'div',
    {
      class: workflowViewerGraphClasses,
      style: workflowViewerGridStyle(layout),
      'data-layout': 'graph',
      'data-workflow-fork': layout.hasFork ? 'true' : undefined,
      'data-workflow-loop': layout.hasLoop ? 'true' : undefined
    },
    [
      ...layout.edges.filter((edge) => edge.kind !== 'loop').map((edge) => renderViewerEdge(edge)),
      ...layout.edges
        .filter((edge) => edge.kind === 'loop')
        .map((edge) => renderViewerLoop(layout, edge, labels)),
      ...layout.placements.map((placement) =>
        h(
          'div',
          {
            key: placement.key,
            class: workflowViewerCellClasses,
            style: workflowViewerCardGridStyle(placement),
            'data-workflow-node': placement.key
          },
          [
            placement.forkChild
              ? h('div', { class: workflowViewerForkDropClasses, 'aria-hidden': 'true' })
              : null,
            renderViewerCard(placement.node, labels, highlightPath, showRollbackPoint, tasks)
          ]
        )
      )
    ]
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
    tasks: {
      type: Array as PropType<WorkflowTask[]>,
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
    const tree = computed(() => buildWorkflowViewerTree(props.steps, { tasks: props.tasks }))
    const rootClasses = computed(() =>
      classNames(workflowViewerRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const legendItems = computed(() => {
      if (props.highlightPath === false) return []
      return getWorkflowViewerLegendItems(stepLabels.value, {
        showRollbackPoint:
          props.showRollbackPoint !== false && getWorkflowRollbackStep(props.steps) != null,
        showReturnTarget: getWorkflowReturnTargetStep(props.steps, props.tasks) != null
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
          renderViewerGraph(
            tree.value,
            stepLabels.value,
            props.highlightPath !== false,
            props.showRollbackPoint !== false,
            props.tasks
          )
        ]
      )
    }
  }
})

export default WorkflowViewer
