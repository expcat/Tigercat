import { computed, defineComponent, h, ref, watch, type PropType, type VNode } from 'vue'
import {
  actorsFromApproverSource,
  applyWorkflowDesignerFieldPermissionColumn,
  buildWorkflowDesignerNodes,
  classNames,
  cloneWorkflowDesignerStepWithNewKeys,
  cloneWorkflowSteps,
  coerceClassValue,
  createWorkflowDesignerPaletteStep,
  createWorkflowDesignerStep,
  findWorkflowDesignerNode,
  getWorkflowDesignerLabels,
  getWorkflowStepAtPath,
  getWorkflowTimelineLabels,
  insertWorkflowDesignerPaletteStep,
  insertWorkflowStepAfterPath,
  insertWorkflowStepAtPath,
  mergeStyleValues,
  mergeTigerLocale,
  moveWorkflowStepAtPath,
  patchWorkflowDesignerButton,
  patchWorkflowStepAtPath,
  removeWorkflowStepAtPath,
  resolveWorkflowDesignerView,
  validateWorkflowDesigner,
  workflowDesignerActionButtonClasses,
  workflowDesignerActionLabel,
  workflowDesignerActorRowClasses,
  workflowDesignerAdvancedFromStep,
  workflowDesignerApproverSourceFromStep,
  workflowDesignerApproverSourceOfType,
  workflowDesignerApproverSourceOptions,
  workflowDesignerApproverSummary,
  workflowDesignerAutoDecideOptions,
  workflowDesignerCardClassName,
  workflowDesignerChildrenClasses,
  workflowDesignerControlClasses,
  workflowDesignerDefaultInspectorTab,
  workflowDesignerEditableButtonPolicy,
  workflowDesignerEmptyApproverOptions,
  workflowDesignerEmptyClasses,
  workflowDesignerEmptyInspectorClasses,
  workflowDesignerFieldClasses,
  workflowDesignerFieldPermissionLabel,
  workflowDesignerFieldPermissionRows,
  workflowDesignerFieldsClasses,
  workflowDesignerHintClasses,
  workflowDesignerInsertButtonClasses,
  workflowDesignerInsertGlyph,
  workflowDesignerInsertRowClasses,
  workflowDesignerInspectorTabEnabled,
  workflowDesignerInspectorTabLabel,
  workflowDesignerIssueBannerClasses,
  workflowDesignerIssueListClasses,
  workflowDesignerIssueMessage,
  workflowDesignerItemClasses,
  workflowDesignerKindColor,
  workflowDesignerKindDotClasses,
  workflowDesignerKindOptions,
  workflowDesignerLabelClasses,
  workflowDesignerListClasses,
  workflowDesignerPaletteClasses,
  workflowDesignerPanelClasses,
  workflowDesignerPathKey,
  workflowDesignerRootClasses,
  workflowDesignerShellClasses,
  workflowDesignerSignModeHint,
  workflowDesignerSignModeOptions,
  workflowDesignerSummaryActorsClasses,
  workflowDesignerSummaryClasses,
  workflowDesignerSummaryRowClasses,
  workflowDesignerSummaryTitleClasses,
  workflowDesignerTabClassName,
  workflowDesignerTabListClasses,
  workflowDesignerTableCellClasses,
  workflowDesignerTableClasses,
  workflowDesignerTableHeadClasses,
  workflowDesignerTimeoutActionOptions,
  workflowDesignerToolbarClasses,
  workflowDesignerTreeClasses,
  workflowSignModeLabel,
  WORKFLOW_DESIGNER_INSPECTOR_TABS,
  WORKFLOW_DESIGNER_PALETTE_KINDS,
  WORKFLOW_FIELD_PERMISSIONS,
  type ApproverSource,
  type FieldPermission,
  type SchemaFormSchema,
  type TigerLocale,
  type TigerLocaleWorkflowDesigner,
  type WorkflowAutoDecide,
  type WorkflowDesignerInspectorTab,
  type WorkflowDesignerNode,
  type WorkflowDesignerPath,
  type WorkflowDesignerProps as CoreWorkflowDesignerProps,
  type WorkflowDesignerStepPatch,
  type WorkflowEmptyApprover,
  type WorkflowNodeAdvanced,
  type WorkflowSignMode,
  type WorkflowStepKind,
  type WorkflowTimeoutAction,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { Tag } from './Tag'

export interface VueWorkflowDesignerProps extends Omit<
  CoreWorkflowDesignerProps,
  'value' | 'onChange' | 'onSelect'
> {
  modelValue?: WorkflowTimelineStep[]
  schema?: SchemaFormSchema
  style?: Record<string, unknown>
}

export type WorkflowDesignerProps = VueWorkflowDesignerProps

function renderActionButton(
  label: string,
  disabled: boolean,
  onClick: () => void,
  ariaLabel?: string,
  expanded?: boolean,
  className?: string
): VNode {
  return h(
    'button',
    {
      type: 'button',
      class: className ?? workflowDesignerActionButtonClasses,
      disabled,
      'aria-label': ariaLabel,
      'aria-expanded': expanded,
      'aria-haspopup': expanded == null ? undefined : 'menu',
      onClick: (event: Event) => {
        event.stopPropagation()
        onClick()
      }
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
    schema: {
      type: Object as PropType<SchemaFormSchema>,
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
    const inspectorTab = ref<WorkflowDesignerInspectorTab>('approvers')
    const insertMenuPath = ref<string | null>(null)

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
    const selectedNode = computed(() => {
      if (!selectedKey.value) return undefined
      return findWorkflowDesignerNode(nodes.value, selectedKey.value.split('\0'))
    })
    const issues = computed(() => validateWorkflowDesigner(sourceSteps.value))

    function commit(next: WorkflowTimelineStep[]): void {
      if (props.modelValue === undefined) innerValue.value = next
      emit('update:modelValue', next)
      emit('change', next)
    }

    function patchNode(path: WorkflowDesignerPath, patch: WorkflowDesignerStepPatch): void {
      commit(patchWorkflowStepAtPath(sourceSteps.value, path, patch))
    }

    function selectNode(node: WorkflowDesignerNode): void {
      selectedKey.value = workflowDesignerPathKey(node.path)
      inspectorTab.value = workflowDesignerDefaultInspectorTab(node.kind)
      emit('select', node.path, node.step)
    }

    function insertKindAt(path: WorkflowDesignerPath, kind: WorkflowStepKind): void {
      const result = insertWorkflowDesignerPaletteStep(sourceSteps.value, path, kind, {
        ...timelineLabels.value,
        ...designerLabels.value
      })
      commit(result.steps)
      insertMenuPath.value = null
      selectedKey.value = workflowDesignerPathKey(result.path)
      inspectorTab.value = workflowDesignerDefaultInspectorTab(kind)
      emit('select', result.path, getWorkflowStepAtPath(result.steps, result.path))
    }

    function copyNode(path: WorkflowDesignerPath): void {
      const source = findWorkflowDesignerNode(nodes.value, path)?.step
      if (!source) return
      const copy = cloneWorkflowDesignerStepWithNewKeys(source, sourceSteps.value)
      commit(insertWorkflowStepAfterPath(sourceSteps.value, path, copy))
      const nextPath = [...path.slice(0, -1), copy.key]
      selectedKey.value = workflowDesignerPathKey(nextPath)
      emit('select', nextPath, copy)
    }

    function removeNode(path: WorkflowDesignerPath): void {
      if (selectedKey.value === workflowDesignerPathKey(path)) selectedKey.value = null
      commit(removeWorkflowStepAtPath(sourceSteps.value, path))
    }

    function renderSummary(node: WorkflowDesignerNode): VNode {
      const groupName = node.title || node.key
      const summary = workflowDesignerApproverSummary(node.step, designerLabels.value)
      return h('div', { class: workflowDesignerSummaryClasses }, [
        h('div', { class: workflowDesignerSummaryRowClasses }, [
          h('span', {
            class: workflowDesignerKindDotClasses,
            style: { backgroundColor: workflowDesignerKindColor(node.kind) },
            'aria-hidden': 'true'
          }),
          h('span', { class: workflowDesignerSummaryTitleClasses }, groupName),
          node.kind === 'approve'
            ? h(
                Tag,
                { variant: 'primary', size: 'sm', pill: true },
                { default: () => workflowSignModeLabel(node.signMode, timelineLabels.value) }
              )
            : null
        ]),
        summary ? h('div', { class: workflowDesignerSummaryActorsClasses }, summary) : null
      ])
    }

    function renderApproversTab(node: WorkflowDesignerNode): VNode {
      const labels = designerLabels.value
      if (!workflowDesignerInspectorTabEnabled('approvers', node.kind)) {
        return h('p', { class: workflowDesignerHintClasses }, labels.tabNotApplicable)
      }
      const source = workflowDesignerApproverSourceFromStep(node.step)
      const lockedNow = locked.value
      const advanced = workflowDesignerAdvancedFromStep(node.step)
      const patchSource = (next: ApproverSource) => {
        patchNode(node.path, {
          approverPolicy: next,
          actors: actorsFromApproverSource(next)
        })
      }
      const patchAdvanced = (patch: Partial<WorkflowNodeAdvanced>) => {
        patchNode(node.path, {
          advanced: {
            ...advanced,
            ...patch,
            timeout: patch.timeout ? { ...advanced.timeout, ...patch.timeout } : advanced.timeout
          }
        })
      }
      return h('div', { class: workflowDesignerFieldsClasses }, [
        h('label', { class: workflowDesignerFieldClasses }, [
          h('span', { class: workflowDesignerLabelClasses }, labels.sourceLabel),
          h(
            'select',
            {
              class: workflowDesignerControlClasses,
              value: source.type,
              disabled: lockedNow,
              'aria-label': labels.sourceLabel,
              onChange: (event: Event) => {
                patchSource(
                  workflowDesignerApproverSourceOfType(
                    (event.target as HTMLSelectElement).value as ApproverSource['type'],
                    source
                  )
                )
              }
            },
            workflowDesignerApproverSourceOptions(labels).map((option) =>
              h('option', { value: option.value }, option.label)
            )
          )
        ]),
        source.type === 'fixed'
          ? h('div', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.actorsLabel),
              ...source.actors.map((actor, index) =>
                h('div', { key: index, class: workflowDesignerActorRowClasses }, [
                  h('input', {
                    class: workflowDesignerControlClasses,
                    value: actor.id,
                    placeholder: labels.actorIdPlaceholder,
                    disabled: lockedNow,
                    'aria-label': `${labels.actorIdPlaceholder} ${index + 1}`,
                    onInput: (event: Event) => {
                      const actors = source.actors.map((item, actorIndex) =>
                        actorIndex === index
                          ? { ...item, id: (event.target as HTMLInputElement).value }
                          : item
                      )
                      patchSource({ type: 'fixed', actors })
                    }
                  }),
                  h('input', {
                    class: workflowDesignerControlClasses,
                    value: actor.name ?? '',
                    placeholder: labels.actorPlaceholder,
                    disabled: lockedNow,
                    'aria-label': `${labels.actorsLabel} ${index + 1}`,
                    onInput: (event: Event) => {
                      const actors = source.actors.map((item, actorIndex) =>
                        actorIndex === index
                          ? { ...item, name: (event.target as HTMLInputElement).value }
                          : item
                      )
                      patchSource({ type: 'fixed', actors })
                    }
                  }),
                  renderActionButton(labels.removeActor, lockedNow, () => {
                    patchSource({
                      type: 'fixed',
                      actors: source.actors.filter((_, actorIndex) => actorIndex !== index)
                    })
                  })
                ])
              ),
              renderActionButton(labels.addActor, lockedNow, () => {
                patchSource({ type: 'fixed', actors: [...source.actors, { id: '', name: '' }] })
              })
            ])
          : null,
        source.type === 'role' || source.type === 'group'
          ? h('label', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.sourceKeyLabel),
              h('input', {
                class: workflowDesignerControlClasses,
                value: source.key,
                placeholder: labels.sourceKeyPlaceholder,
                disabled: lockedNow,
                'aria-label': labels.sourceKeyLabel,
                onInput: (event: Event) => {
                  patchSource({ ...source, key: (event.target as HTMLInputElement).value })
                }
              })
            ])
          : null,
        source.type === 'dept_leader'
          ? h('label', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.sourceLevelLabel),
              h('input', {
                type: 'number',
                class: workflowDesignerControlClasses,
                value: source.level ?? 1,
                disabled: lockedNow,
                'aria-label': labels.sourceLevelLabel,
                onInput: (event: Event) => {
                  patchSource({
                    type: 'dept_leader',
                    level: Number((event.target as HTMLInputElement).value) || 1
                  })
                }
              })
            ])
          : null,
        source.type === 'manager_chain'
          ? h('label', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.sourceUpToLabel),
              h('input', {
                type: 'number',
                class: workflowDesignerControlClasses,
                value: source.upTo ?? 1,
                disabled: lockedNow,
                'aria-label': labels.sourceUpToLabel,
                onInput: (event: Event) => {
                  patchSource({
                    type: 'manager_chain',
                    upTo: Number((event.target as HTMLInputElement).value) || 1
                  })
                }
              })
            ])
          : null,
        source.type === 'starter_pick'
          ? h('label', { class: workflowDesignerActorRowClasses }, [
              h('input', {
                type: 'checkbox',
                checked: Boolean(source.multiple),
                disabled: lockedNow,
                'aria-label': labels.sourceMultiple,
                onChange: (event: Event) => {
                  patchSource({
                    ...source,
                    type: 'starter_pick',
                    multiple: (event.target as HTMLInputElement).checked
                  })
                }
              }),
              h('span', { class: workflowDesignerLabelClasses }, labels.sourceMultiple)
            ])
          : null,
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
              ),
              h(
                'span',
                { class: workflowDesignerHintClasses },
                workflowDesignerSignModeHint(node.signMode, timelineLabels.value)
              )
            ])
          : null,
        node.kind === 'approve'
          ? h('label', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.emptyApproverLabel),
              h(
                'select',
                {
                  class: workflowDesignerControlClasses,
                  value: advanced.emptyApprover ?? 'pause',
                  disabled: lockedNow,
                  'aria-label': labels.emptyApproverLabel,
                  onChange: (event: Event) => {
                    patchAdvanced({
                      emptyApprover: (event.target as HTMLSelectElement)
                        .value as WorkflowEmptyApprover
                    })
                  }
                },
                workflowDesignerEmptyApproverOptions(timelineLabels.value).map((option) =>
                  h('option', { value: option.value }, option.label)
                )
              )
            ])
          : null
      ])
    }

    function renderButtonsTab(node: WorkflowDesignerNode): VNode {
      const labels = designerLabels.value
      if (!workflowDesignerInspectorTabEnabled('buttons', node.kind)) {
        return h('p', { class: workflowDesignerHintClasses }, labels.tabNotApplicable)
      }
      const lockedNow = locked.value
      const buttonPolicy = workflowDesignerEditableButtonPolicy(node.step)
      const timeline = timelineLabels.value
      return h('div', { class: workflowDesignerFieldsClasses }, [
        h('table', { class: workflowDesignerTableClasses }, [
          h('thead', [
            h('tr', [
              h('th', { class: workflowDesignerTableHeadClasses }, labels.buttonEnabled),
              h('th', { class: workflowDesignerTableHeadClasses }, labels.kindLabel),
              h('th', { class: workflowDesignerTableHeadClasses }, labels.buttonDisplayName),
              h('th', { class: workflowDesignerTableHeadClasses }, labels.buttonCommentRequired),
              h('th', { class: workflowDesignerTableHeadClasses }, labels.buttonPlacement)
            ])
          ]),
          h(
            'tbody',
            buttonPolicy.buttons.map((button) =>
              h('tr', { key: button.action }, [
                h('td', { class: workflowDesignerTableCellClasses }, [
                  h('input', {
                    type: 'checkbox',
                    checked: button.enabled,
                    disabled: lockedNow,
                    'aria-label': `${workflowDesignerActionLabel(button.action, timeline)} ${labels.buttonEnabled}`,
                    onChange: (event: Event) => {
                      patchNode(node.path, {
                        buttonPolicy: patchWorkflowDesignerButton(buttonPolicy, button.action, {
                          enabled: (event.target as HTMLInputElement).checked
                        })
                      })
                    }
                  })
                ]),
                h(
                  'td',
                  { class: workflowDesignerTableCellClasses },
                  workflowDesignerActionLabel(button.action, timeline)
                ),
                h('td', { class: workflowDesignerTableCellClasses }, [
                  h('input', {
                    class: workflowDesignerControlClasses,
                    value: button.label ?? '',
                    disabled: lockedNow,
                    'aria-label': `${workflowDesignerActionLabel(button.action, timeline)} ${labels.buttonDisplayName}`,
                    onInput: (event: Event) => {
                      patchNode(node.path, {
                        buttonPolicy: patchWorkflowDesignerButton(buttonPolicy, button.action, {
                          label: (event.target as HTMLInputElement).value
                        })
                      })
                    }
                  })
                ]),
                h('td', { class: workflowDesignerTableCellClasses }, [
                  h('input', {
                    type: 'checkbox',
                    checked: Boolean(button.commentRequired),
                    disabled: lockedNow,
                    'aria-label': `${workflowDesignerActionLabel(button.action, timeline)} ${labels.buttonCommentRequired}`,
                    onChange: (event: Event) => {
                      patchNode(node.path, {
                        buttonPolicy: patchWorkflowDesignerButton(buttonPolicy, button.action, {
                          commentRequired: (event.target as HTMLInputElement).checked
                        })
                      })
                    }
                  })
                ]),
                h('td', { class: workflowDesignerTableCellClasses }, [
                  h(
                    'select',
                    {
                      class: workflowDesignerControlClasses,
                      value: button.placement ?? 'bar',
                      disabled: lockedNow,
                      'aria-label': `${workflowDesignerActionLabel(button.action, timeline)} ${labels.buttonPlacement}`,
                      onChange: (event: Event) => {
                        patchNode(node.path, {
                          buttonPolicy: patchWorkflowDesignerButton(buttonPolicy, button.action, {
                            placement: (event.target as HTMLSelectElement).value as 'bar' | 'more'
                          })
                        })
                      }
                    },
                    [
                      h('option', { value: 'bar' }, labels.buttonPlacementBar),
                      h('option', { value: 'more' }, labels.buttonPlacementMore)
                    ]
                  )
                ])
              ])
            )
          )
        ]),
        buttonPolicy.buttons.some((button) => button.action === 'addsign' && button.enabled)
          ? h('fieldset', { class: workflowDesignerFieldClasses }, [
              h('legend', { class: workflowDesignerLabelClasses }, labels.addsignPositions),
              ...(['before', 'after'] as const).map((position) => {
                const checked = buttonPolicy.addsign?.positions.includes(position) ?? false
                return h('label', { key: position, class: workflowDesignerActorRowClasses }, [
                  h('input', {
                    type: 'checkbox',
                    checked,
                    disabled: lockedNow,
                    'aria-label': `${labels.addsignPositions} ${position}`,
                    onChange: (event: Event) => {
                      const current = new Set(buttonPolicy.addsign?.positions ?? [])
                      if ((event.target as HTMLInputElement).checked) current.add(position)
                      else current.delete(position)
                      patchNode(node.path, {
                        buttonPolicy: { ...buttonPolicy, addsign: { positions: [...current] } }
                      })
                    }
                  }),
                  h(
                    'span',
                    null,
                    position === 'before' ? timeline.addsignBefore : timeline.addsignAfter
                  )
                ])
              })
            ])
          : null
      ])
    }

    function renderPermissionsTab(node: WorkflowDesignerNode): VNode {
      const labels = designerLabels.value
      if (!workflowDesignerInspectorTabEnabled('fieldPermissions', node.kind)) {
        return h('p', { class: workflowDesignerHintClasses }, labels.tabNotApplicable)
      }
      const rows = workflowDesignerFieldPermissionRows(props.schema, node.step)
      if (rows.length === 0) {
        return h('p', { class: workflowDesignerHintClasses }, labels.fieldPermissionsEmpty)
      }
      const lockedNow = locked.value
      const timeline = timelineLabels.value
      return h('div', { class: workflowDesignerFieldsClasses }, [
        h(
          'div',
          { class: workflowDesignerToolbarClasses },
          WORKFLOW_FIELD_PERMISSIONS.map((permission) =>
            renderActionButton(
              `${labels.fieldPermissionAll}: ${workflowDesignerFieldPermissionLabel(permission, timeline)}`,
              lockedNow,
              () => {
                patchNode(node.path, {
                  fieldPermissions: applyWorkflowDesignerFieldPermissionColumn(
                    props.schema,
                    node.step.fieldPermissions,
                    permission
                  )
                })
              }
            )
          )
        ),
        h('table', { class: workflowDesignerTableClasses }, [
          h('thead', [
            h('tr', [
              h('th', { class: workflowDesignerTableHeadClasses }, labels.titleLabel),
              ...WORKFLOW_FIELD_PERMISSIONS.map((permission) =>
                h(
                  'th',
                  { key: permission, class: workflowDesignerTableHeadClasses },
                  workflowDesignerFieldPermissionLabel(permission, timeline)
                )
              )
            ])
          ]),
          h(
            'tbody',
            rows.map((row) =>
              h('tr', { key: row.name }, [
                h('td', { class: workflowDesignerTableCellClasses }, row.label),
                ...WORKFLOW_FIELD_PERMISSIONS.map((permission) =>
                  h('td', { key: permission, class: workflowDesignerTableCellClasses }, [
                    h('input', {
                      type: 'radio',
                      name: `field-perm-${node.key}-${row.name}`,
                      checked: row.permission === permission,
                      disabled: lockedNow,
                      'aria-label': `${row.label} ${workflowDesignerFieldPermissionLabel(permission, timeline)}`,
                      onChange: () => {
                        patchNode(node.path, {
                          fieldPermissions: {
                            ...node.step.fieldPermissions,
                            [row.name]: permission as FieldPermission
                          }
                        })
                      }
                    })
                  ])
                )
              ])
            )
          )
        ])
      ])
    }

    function renderAdvancedTab(node: WorkflowDesignerNode): VNode {
      const labels = designerLabels.value
      const lockedNow = locked.value
      const advanced = workflowDesignerAdvancedFromStep(node.step)
      const patchAdvanced = (patch: Partial<WorkflowNodeAdvanced>) => {
        patchNode(node.path, {
          advanced: {
            ...advanced,
            ...patch,
            timeout: patch.timeout ? { ...advanced.timeout, ...patch.timeout } : advanced.timeout
          }
        })
      }
      const branches = node.kind === 'condition' ? (node.step.children ?? []) : []
      const showAuto = node.kind === 'approve' || node.kind === 'start'
      return h('div', { class: workflowDesignerFieldsClasses }, [
        showAuto
          ? h('label', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.autoDecideLabel),
              h(
                'select',
                {
                  class: workflowDesignerControlClasses,
                  value: advanced.autoDecide ?? 'manual',
                  disabled: lockedNow,
                  'aria-label': labels.autoDecideLabel,
                  onChange: (event: Event) => {
                    patchAdvanced({
                      autoDecide: (event.target as HTMLSelectElement).value as WorkflowAutoDecide
                    })
                  }
                },
                workflowDesignerAutoDecideOptions(timelineLabels.value).map((option) =>
                  h('option', { value: option.value }, option.label)
                )
              )
            ])
          : null,
        showAuto
          ? h('label', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.timeoutActionLabel),
              h(
                'select',
                {
                  class: workflowDesignerControlClasses,
                  value: advanced.timeout?.action ?? 'remind',
                  disabled: lockedNow,
                  'aria-label': labels.timeoutActionLabel,
                  onChange: (event: Event) => {
                    patchAdvanced({
                      timeout: {
                        ...advanced.timeout,
                        action: (event.target as HTMLSelectElement).value as WorkflowTimeoutAction
                      }
                    })
                  }
                },
                workflowDesignerTimeoutActionOptions({
                  ...labels,
                  ...timelineLabels.value
                }).map((option) => h('option', { value: option.value }, option.label))
              )
            ])
          : null,
        showAuto
          ? h('label', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.timeoutDurationLabel),
              h('input', {
                class: workflowDesignerControlClasses,
                value: advanced.timeout?.durationLabel ?? '',
                disabled: lockedNow,
                'aria-label': labels.timeoutDurationLabel,
                onInput: (event: Event) => {
                  patchAdvanced({
                    timeout: {
                      ...advanced.timeout,
                      durationLabel: (event.target as HTMLInputElement).value
                    }
                  })
                }
              })
            ])
          : null,
        node.kind === 'condition'
          ? h('div', { class: workflowDesignerFieldClasses }, [
              h('span', { class: workflowDesignerLabelClasses }, labels.branchLabel),
              ...branches.map((branch, index) =>
                h('div', { key: branch.key, class: workflowDesignerFieldsClasses }, [
                  h('div', { class: workflowDesignerActorRowClasses }, [
                    h('input', {
                      class: workflowDesignerControlClasses,
                      value: branch.title ?? '',
                      placeholder: labels.branchLabel,
                      disabled: lockedNow,
                      'aria-label': `${labels.branchLabel} ${index + 1}`,
                      onInput: (event: Event) => {
                        patchNode([...node.path, branch.key], {
                          title: (event.target as HTMLInputElement).value
                        })
                      }
                    }),
                    renderActionButton(labels.removeBranch, lockedNow, () => {
                      removeNode([...node.path, branch.key])
                    })
                  ]),
                  h('input', {
                    class: workflowDesignerControlClasses,
                    value: branch.expression ?? '',
                    placeholder: labels.branchExpressionPlaceholder,
                    disabled: lockedNow,
                    'aria-label': `${labels.branchExpression} ${index + 1}`,
                    onInput: (event: Event) => {
                      patchNode([...node.path, branch.key], {
                        expression: (event.target as HTMLInputElement).value
                      })
                    }
                  })
                ])
              ),
              renderActionButton(labels.addBranch, lockedNow, () => {
                const created = createWorkflowDesignerStep(
                  [node.step, ...(node.step.children ?? [])],
                  {
                    kind: 'approve',
                    title: `${labels.branchLabel} ${(node.step.children?.length ?? 0) + 1}`,
                    expression: ''
                  }
                )
                commit(insertWorkflowStepAtPath(sourceSteps.value, node.path, created))
              })
            ])
          : null,
        !showAuto && node.kind !== 'condition'
          ? h('p', { class: workflowDesignerHintClasses }, labels.tabNotApplicable)
          : null
      ])
    }

    function renderEmptyInspector(): VNode {
      const labels = designerLabels.value
      return h(
        'div',
        {
          class: workflowDesignerPanelClasses,
          role: 'region',
          'aria-label': labels.editPanelAriaLabel,
          'data-slot': 'inspector'
        },
        [h('p', { class: workflowDesignerEmptyInspectorClasses }, labels.inspectorEmpty)]
      )
    }

    function renderEditPanel(node: WorkflowDesignerNode): VNode {
      const labels = designerLabels.value
      const lockedNow = locked.value
      const tab = workflowDesignerInspectorTabEnabled(inspectorTab.value, node.kind)
        ? inspectorTab.value
        : workflowDesignerDefaultInspectorTab(node.kind)
      return h(
        'div',
        {
          class: workflowDesignerPanelClasses,
          role: 'region',
          'aria-label': labels.editPanelAriaLabel,
          'data-slot': 'inspector'
        },
        [
          h('div', { class: workflowDesignerFieldsClasses, 'data-slot': 'inspector-fields' }, [
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
                kindOptions.value.map((option) =>
                  h('option', { value: option.value }, option.label)
                )
              )
            ])
          ]),
          h(
            'div',
            {
              class: workflowDesignerTabListClasses,
              role: 'tablist',
              'aria-label': labels.editPanelAriaLabel
            },
            WORKFLOW_DESIGNER_INSPECTOR_TABS.map((item) => {
              const enabled = workflowDesignerInspectorTabEnabled(item, node.kind)
              const selected = tab === item
              return h(
                'button',
                {
                  key: item,
                  type: 'button',
                  role: 'tab',
                  class: workflowDesignerTabClassName(selected),
                  'aria-selected': selected,
                  disabled: !enabled,
                  onClick: () => {
                    if (enabled) inspectorTab.value = item
                  }
                },
                workflowDesignerInspectorTabLabel(item, labels)
              )
            })
          ),
          h(
            'div',
            { role: 'tabpanel' },
            tab === 'approvers'
              ? renderApproversTab(node)
              : tab === 'buttons'
                ? renderButtonsTab(node)
                : tab === 'fieldPermissions'
                  ? renderPermissionsTab(node)
                  : renderAdvancedTab(node)
          )
        ]
      )
    }

    function renderNode(node: WorkflowDesignerNode): VNode {
      const labels = designerLabels.value
      const selected = selectedKey.value === workflowDesignerPathKey(node.path)
      const groupName = node.title || node.key
      const pathKey = workflowDesignerPathKey(node.path)
      const insertOpen = insertMenuPath.value === pathKey
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
            renderSummary(node),
            h('div', { class: workflowDesignerToolbarClasses }, [
              renderActionButton(labels.moveUp, locked.value || !node.canMoveUp, () => {
                commit(moveWorkflowStepAtPath(sourceSteps.value, node.path, -1))
              }),
              renderActionButton(labels.moveDown, locked.value || !node.canMoveDown, () => {
                commit(moveWorkflowStepAtPath(sourceSteps.value, node.path, 1))
              }),
              renderActionButton(labels.copyStep, locked.value, () => copyNode(node.path)),
              renderActionButton(labels.addChild, locked.value, () => {
                const created =
                  node.kind === 'condition'
                    ? createWorkflowDesignerStep(sourceSteps.value, {
                        kind: 'approve',
                        title: labels.branchLabel,
                        expression: ''
                      })
                    : createWorkflowDesignerStep(sourceSteps.value)
                commit(insertWorkflowStepAtPath(sourceSteps.value, node.path, created))
              }),
              renderActionButton(labels.removeStep, locked.value, () => removeNode(node.path))
            ])
          ]
        ),
        node.children.length > 0
          ? h('div', { class: workflowDesignerChildrenClasses }, [renderList(node.children)])
          : null,
        h('div', { class: workflowDesignerInsertRowClasses }, [
          renderActionButton(
            workflowDesignerInsertGlyph,
            locked.value,
            () => {
              insertMenuPath.value = insertOpen ? null : pathKey
            },
            `${labels.insertSibling} (${groupName})`,
            insertOpen,
            workflowDesignerInsertButtonClasses
          ),
          insertOpen
            ? h(
                'div',
                {
                  role: 'menu',
                  'aria-label': labels.paletteAriaLabel,
                  class: workflowDesignerPaletteClasses
                },
                WORKFLOW_DESIGNER_PALETTE_KINDS.map((kind) =>
                  h(
                    'button',
                    {
                      key: kind,
                      type: 'button',
                      role: 'menuitem',
                      class: workflowDesignerActionButtonClasses,
                      disabled: locked.value,
                      onClick: (event: Event) => {
                        event.stopPropagation()
                        insertKindAt(node.path, kind)
                      }
                    },
                    kindOptions.value.find((option) => option.value === kind)?.label
                  )
                )
              )
            : null
        ])
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
      const emptyCopy = view.value.valid ? labels.emptyHint : labels.subpathEmpty
      const showEmpty = nodes.value.length === 0
      const editing = selectedNode.value
      const issueItems = issues.value

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
          issueItems.length > 0
            ? h(
                'div',
                {
                  class: workflowDesignerIssueBannerClasses,
                  role: 'status',
                  'aria-label': labels.validationAriaLabel
                },
                [
                  h('div', null, labels.publishBlocked),
                  h(
                    'ul',
                    { class: workflowDesignerIssueListClasses },
                    issueItems.map((issue, index) =>
                      h(
                        'li',
                        { key: `${issue.code}-${issue.path.join('.')}-${index}` },
                        workflowDesignerIssueMessage(issue, labels)
                      )
                    )
                  )
                ]
              )
            : null,
          h('div', { class: workflowDesignerShellClasses }, [
            h('div', { class: workflowDesignerTreeClasses, 'data-slot': 'canvas' }, [
              h(
                'div',
                {
                  class: workflowDesignerPaletteClasses,
                  role: 'toolbar',
                  'aria-label': labels.paletteAriaLabel
                },
                WORKFLOW_DESIGNER_PALETTE_KINDS.map((kind) =>
                  renderActionButton(
                    kindOptions.value.find((option) => option.value === kind)?.label ?? kind,
                    locked.value || !view.value.valid,
                    () => {
                      const created = createWorkflowDesignerPaletteStep(sourceSteps.value, kind, {
                        ...timelineLabels.value,
                        ...labels
                      })
                      commit(
                        insertWorkflowStepAtPath(sourceSteps.value, view.value.parentPath, created)
                      )
                      const nextPath = [...view.value.parentPath, created.key]
                      selectedKey.value = workflowDesignerPathKey(nextPath)
                      inspectorTab.value = workflowDesignerDefaultInspectorTab(kind)
                      emit('select', nextPath, created)
                    }
                  )
                )
              ),
              showEmpty ? h('p', { class: workflowDesignerEmptyClasses }, emptyCopy) : null,
              showEmpty ? null : renderList(nodes.value),
              renderActionButton(labels.addStep, locked.value || !view.value.valid, () => {
                const created = createWorkflowDesignerStep(sourceSteps.value)
                if (view.value.parentPath.length === 0 && sourceSteps.value.length === 0) {
                  created.kind = 'start'
                }
                commit(insertWorkflowStepAtPath(sourceSteps.value, view.value.parentPath, created))
              })
            ]),
            editing ? renderEditPanel(editing) : renderEmptyInspector()
          ])
        ]
      )
    }
  }
})

export default WorkflowDesigner
