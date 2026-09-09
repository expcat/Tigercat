import { computed, defineComponent, h, ref, watch, type PropType, type VNode } from 'vue'
import {
  buildWorkflowDesignerNodes,
  classNames,
  cloneWorkflowSteps,
  coerceClassValue,
  createWorkflowDesignerStep,
  getWorkflowDesignerLabels,
  getWorkflowTimelineLabels,
  insertWorkflowStepAtPath,
  mergeStyleValues,
  mergeTigerLocale,
  moveWorkflowStepAtPath,
  patchWorkflowStepAtPath,
  removeWorkflowStepAtPath,
  resolveWorkflowDesignerView,
  workflowDesignerActionButtonClasses,
  workflowDesignerCardClassName,
  workflowDesignerChildrenClasses,
  workflowDesignerControlClasses,
  workflowDesignerEmptyClasses,
  workflowDesignerFieldClasses,
  workflowDesignerFieldsClasses,
  workflowDesignerItemClasses,
  workflowDesignerKindOptions,
  workflowDesignerLabelClasses,
  workflowDesignerListClasses,
  workflowDesignerRootClasses,
  workflowDesignerSignModeOptions,
  workflowDesignerToolbarClasses,
  type TigerLocale,
  type TigerLocaleWorkflowDesigner,
  type WorkflowDesignerNode,
  type WorkflowDesignerPath,
  type WorkflowDesignerProps as CoreWorkflowDesignerProps,
  type WorkflowDesignerStepPatch,
  type WorkflowSignMode,
  type WorkflowStepKind,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueWorkflowDesignerProps extends Omit<
  CoreWorkflowDesignerProps,
  'value' | 'onChange' | 'onSelect'
> {
  modelValue?: WorkflowTimelineStep[]
  style?: Record<string, unknown>
}

export type WorkflowDesignerProps = VueWorkflowDesignerProps

function pathKey(path: WorkflowDesignerPath): string {
  return path.join('\0')
}

function renderActionButton(label: string, disabled: boolean, onClick: () => void): VNode {
  return h(
    'button',
    {
      type: 'button',
      class: workflowDesignerActionButtonClasses,
      disabled,
      onClick
    },
    label
  )
}

export const WorkflowDesigner = defineComponent({
  name: 'TigerWorkflowDesigner',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Array as PropType<WorkflowTimelineStep[]>,
      default: undefined
    },
    defaultValue: {
      type: Array as PropType<WorkflowTimelineStep[]>,
      default: undefined
    },
    path: {
      type: Array as PropType<string[]>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleWorkflowDesigner>>,
      default: undefined
    },
    ariaLabel: {
      type: String,
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
  emits: ['update:modelValue', 'change', 'select'],
  setup(props, { attrs, emit }) {
    const config = useTigerConfig()
    const innerValue = ref<WorkflowTimelineStep[]>(cloneWorkflowSteps(props.defaultValue))
    const selectedKey = ref<string | null>(null)

    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined) innerValue.value = value
      }
    )

    const sourceSteps = computed(() =>
      props.modelValue !== undefined ? props.modelValue : innerValue.value
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const designerLabels = computed(() =>
      getWorkflowDesignerLabels(mergedLocale.value, props.labels)
    )
    const timelineLabels = computed(() => getWorkflowTimelineLabels(mergedLocale.value))
    const view = computed(() => resolveWorkflowDesignerView(sourceSteps.value, props.path))
    const nodes = computed(() => buildWorkflowDesignerNodes(view.value.list, view.value.parentPath))
    const locked = computed(() => props.disabled || props.readonly)
    const rootClasses = computed(() =>
      classNames(workflowDesignerRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const kindOptions = computed(() => workflowDesignerKindOptions(timelineLabels.value))
    const signModeOptions = computed(() => workflowDesignerSignModeOptions(timelineLabels.value))

    function commit(next: WorkflowTimelineStep[]): void {
      if (props.modelValue === undefined) innerValue.value = next
      emit('update:modelValue', next)
      emit('change', next)
    }

    function patchNode(path: WorkflowDesignerPath, patch: WorkflowDesignerStepPatch): void {
      commit(patchWorkflowStepAtPath(sourceSteps.value, path, patch))
    }

    function selectNode(node: WorkflowDesignerNode): void {
      selectedKey.value = pathKey(node.path)
      emit('select', node.path, node.step)
    }

    function renderFields(node: WorkflowDesignerNode): VNode {
      const labels = designerLabels.value
      const lockedNow = locked.value
      return h('div', { class: workflowDesignerFieldsClasses }, [
        h('label', { class: workflowDesignerFieldClasses }, [
          h('span', { class: workflowDesignerLabelClasses }, labels.titleLabel),
          h('input', {
            class: workflowDesignerControlClasses,
            value: node.title,
            placeholder: labels.titlePlaceholder,
            disabled: lockedNow,
            'aria-label': labels.titleLabel,
            onInput: (event: Event) => {
              patchNode(node.path, { title: (event.target as HTMLInputElement).value })
            }
          })
        ]),
        h('label', { class: workflowDesignerFieldClasses }, [
          h('span', { class: workflowDesignerLabelClasses }, labels.kindLabel),
          h(
            'select',
            {
              class: workflowDesignerControlClasses,
              value: node.kind,
              disabled: lockedNow,
              'aria-label': labels.kindLabel,
              onChange: (event: Event) => {
                patchNode(node.path, {
                  kind: (event.target as HTMLSelectElement).value as WorkflowStepKind
                })
              }
            },
            kindOptions.value.map((option) => h('option', { value: option.value }, option.label))
          )
        ]),
        node.kind === 'approve'
          ? h('label', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.signModeLabel),
              h(
                'select',
                {
                  class: workflowDesignerControlClasses,
                  value: node.signMode,
                  disabled: lockedNow,
                  'aria-label': labels.signModeLabel,
                  onChange: (event: Event) => {
                    patchNode(node.path, {
                      signMode: (event.target as HTMLSelectElement).value as WorkflowSignMode
                    })
                  }
                },
                signModeOptions.value.map((option) =>
                  h('option', { value: option.value }, option.label)
                )
              )
            ])
          : null,
        h('label', { class: workflowDesignerFieldClasses }, [
          h('span', { class: workflowDesignerLabelClasses }, labels.actorLabel),
          h('input', {
            class: workflowDesignerControlClasses,
            value: node.actorName,
            placeholder: labels.actorPlaceholder,
            disabled: lockedNow,
            'aria-label': labels.actorLabel,
            onInput: (event: Event) => {
              patchNode(node.path, {
                actor: { ...node.step.actor, name: (event.target as HTMLInputElement).value }
              })
            }
          })
        ])
      ])
    }

    function renderNode(node: WorkflowDesignerNode): VNode {
      const labels = designerLabels.value
      const selected = selectedKey.value === pathKey(node.path)
      const groupName = node.title || node.key
      return h('li', { class: workflowDesignerItemClasses }, [
        h(
          'div',
          {
            class: workflowDesignerCardClassName(selected),
            role: 'group',
            'aria-label': groupName,
            'aria-selected': selected ? 'true' : undefined,
            onClick: () => selectNode(node)
          },
          [
            renderFields(node),
            h('div', { class: workflowDesignerToolbarClasses }, [
              renderActionButton(labels.moveUp, locked.value || !node.canMoveUp, () => {
                commit(moveWorkflowStepAtPath(sourceSteps.value, node.path, -1))
              }),
              renderActionButton(labels.moveDown, locked.value || !node.canMoveDown, () => {
                commit(moveWorkflowStepAtPath(sourceSteps.value, node.path, 1))
              }),
              renderActionButton(labels.addChild, locked.value, () => {
                commit(
                  insertWorkflowStepAtPath(
                    sourceSteps.value,
                    node.path,
                    createWorkflowDesignerStep(sourceSteps.value)
                  )
                )
              }),
              renderActionButton(labels.removeStep, locked.value, () => {
                if (selectedKey.value === pathKey(node.path)) selectedKey.value = null
                commit(removeWorkflowStepAtPath(sourceSteps.value, node.path))
              })
            ])
          ]
        ),
        node.children.length > 0
          ? h('div', { class: workflowDesignerChildrenClasses }, [renderList(node.children)])
          : null
      ])
    }

    function renderList(list: WorkflowDesignerNode[]): VNode {
      return h(
        'ol',
        { class: workflowDesignerListClasses },
        list.map((node) => renderNode(node))
      )
    }

    return () => {
      const {
        class: _class,
        style: _style,
        'aria-label': ariaLabelAttr,
        ...restAttrs
      } = attrs as Record<string, unknown>
      const labels = designerLabels.value
      const emptyCopy = view.value.valid ? labels.emptyText : labels.subpathEmpty
      const showEmpty = nodes.value.length === 0

      return h(
        'div',
        {
          ...restAttrs,
          class: rootClasses.value,
          style: rootStyle.value,
          role: 'region',
          'aria-label':
            props.ariaLabel ??
            (typeof ariaLabelAttr === 'string' ? ariaLabelAttr : undefined) ??
            labels.ariaLabel
        },
        [
          showEmpty ? h('p', { class: workflowDesignerEmptyClasses }, emptyCopy) : null,
          showEmpty ? null : renderList(nodes.value),
          renderActionButton(labels.addStep, locked.value || !view.value.valid, () => {
            const created = createWorkflowDesignerStep(sourceSteps.value)
            if (view.value.parentPath.length === 0 && sourceSteps.value.length === 0) {
              created.kind = 'start'
            }
            commit(insertWorkflowStepAtPath(sourceSteps.value, view.value.parentPath, created))
          })
        ]
      )
    }
  }
})

export default WorkflowDesigner
