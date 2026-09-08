import { computed, defineComponent, h, PropType } from 'vue'
import {
  buildWorkflowViewerTree,
  classNames,
  coerceClassValue,
  getWorkflowTimelineLabels,
  mergeStyleValues,
  mergeTigerLocale,
  timelineDescriptionClasses,
  workflowSignModeLabel,
  workflowStepKindLabel,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  workflowViewerBranchClasses,
  workflowViewerCardClassName,
  workflowViewerChildLayout,
  workflowViewerConnectorClasses,
  workflowViewerItemClasses,
  workflowViewerKindRowClasses,
  workflowViewerListClasses,
  workflowViewerRollbackLabelClasses,
  workflowViewerRootClasses,
  type TigerLocale,
  type TigerLocaleWorkflowTimeline,
  type WorkflowTimelineStep,
  type WorkflowViewerNode,
  type WorkflowViewerProps as CoreWorkflowViewerProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { Tag } from './Tag'

type HChildren = Parameters<typeof h>[2]

export interface VueWorkflowViewerProps extends CoreWorkflowViewerProps {
  style?: Record<string, unknown>
}

export type WorkflowViewerProps = VueWorkflowViewerProps

const workflowStepActorClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
const workflowStepCommentClasses = 'text-sm text-[var(--tiger-text-secondary,#4b5563)] mt-1'

function renderViewerCard(
  node: WorkflowViewerNode,
  labels: Required<TigerLocaleWorkflowTimeline>,
  highlightPath: boolean,
  showRollbackPoint: boolean
) {
  const step = node.step
  const title = step.title ?? step.label
  const statusLabel = workflowStepStatusLabel(node.status, labels)
  const kindLabel = workflowStepKindLabel(node.kind, labels)
  const showSignMode = node.kind === 'approve' && node.signMode !== 'sequential'
  const rollbackLabel = showRollbackPoint && node.rollbackPoint ? labels.rollbackPoint : null

  return h(
    'div',
    {
      class: workflowViewerCardClassName(node, { highlightPath, showRollbackPoint }),
      'aria-current': node.status === 'active' ? 'step' : undefined
    },
    [
      h('div', { class: workflowViewerKindRowClasses }, [
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
            { class: classNames(timelineDescriptionClasses, 'mt-1') },
            title as unknown as HChildren
          )
        : null,
      step.actor?.name ? h('div', { class: workflowStepActorClasses }, step.actor.name) : null,
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
) {
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
