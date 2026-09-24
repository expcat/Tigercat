/**
 * Optional workflow detail layout. Slots (host integration; Admin wires a
 * real page later):
 * - `header` — title / status / meta
 * - `form` — SchemaForm (derive schema with `applyWorkflowFieldPermissions`)
 * - `tabs` — Timeline | Viewer (or any tab set)
 * - `action` — sticky WorkflowActionBar
 * - default — extra body content after form/tabs
 *
 * Not a second Timeline and not a form designer. Host gives a bounded height
 * (`h-full` / `flex-1 min-h-0`); do not hand-calc magic rem. Action stays pinned
 * while form/tabs scroll. `submit()` merges through `mergeWorkflowFormValues`.
 */

import { computed, defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getWorkflowDetailShellLabels,
  getWorkflowDetailShellRootClasses,
  mergeStyleValues,
  mergeTigerLocale,
  submitWorkflowDetailAction,
  submitWorkflowDetailForm,
  workflowDetailShellActionClasses,
  workflowDetailShellBodyClasses,
  workflowDetailShellFormClasses,
  workflowDetailShellHeaderClasses,
  workflowDetailShellTabsClasses,
  type FieldPermission,
  type FormValues,
  type SchemaFormSchema,
  type TigerLocale,
  type WorkflowDetailShellProps as CoreWorkflowDetailShellProps,
  type WorkflowFieldPermissionMode,
  type WorkflowInstance,
  type WorkflowRuntimeAction,
  type WorkflowStepKind
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export interface VueWorkflowDetailShellProps extends CoreWorkflowDetailShellProps {}

export type WorkflowDetailShellProps = VueWorkflowDetailShellProps

export interface WorkflowDetailShellHandle {
  submit: (submitted?: FormValues) => FormValues
  submitAction: (
    action: WorkflowRuntimeAction,
    submitted?: FormValues
  ) => { values: FormValues; instance: WorkflowInstance }
}

function hasSlotContent(nodes: unknown): boolean {
  return Array.isArray(nodes) && nodes.length > 0
}

export const WorkflowDetailShell = defineComponent({
  name: 'TigerWorkflowDetailShell',
  inheritAttrs: false,
  props: {
    /**
     * When false, omit the sticky action region even if `#action` is filled.
     * @default true
     */
    showActions: { type: Boolean, default: true },
    /**
     * Accessible name for the detail region.
     * Omitted: locale `workflowDetailShell.ariaLabel`.
     */
    ariaLabel: { type: String, default: undefined },
    title: { type: String, default: undefined },
    instance: { type: Object as PropType<WorkflowInstance>, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    originalValues: { type: Object as PropType<FormValues>, default: undefined },
    values: { type: Object as PropType<FormValues>, default: undefined },
    schema: { type: Object as PropType<SchemaFormSchema>, default: undefined },
    fieldPermissions: {
      type: Object as PropType<Record<string, FieldPermission>>,
      default: undefined
    },
    permissionMode: {
      type: String as PropType<WorkflowFieldPermissionMode | string>,
      default: 'readonly'
    },
    nodeKind: { type: String as PropType<WorkflowStepKind>, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  emits: ['submit', 'detail-action'],
  setup(props, { slots, attrs, emit, expose }) {
    const config = useTigerConfig()
    const labels = computed(() =>
      getWorkflowDetailShellLabels(mergeTigerLocale(config.value.locale, props.locale))
    )
    const rootClasses = computed(() =>
      classNames(getWorkflowDetailShellRootClasses(props.className), coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const submit = (submitted?: FormValues): FormValues => {
      const merged = submitWorkflowDetailForm({
        original: props.originalValues,
        submitted: submitted ?? props.values,
        schema: props.schema,
        permissions: props.fieldPermissions,
        mode: props.permissionMode,
        kind: props.nodeKind
      })
      emit('submit', merged)
      return merged
    }
    const submitAction = (action: WorkflowRuntimeAction, submitted?: FormValues) => {
      const result = submitWorkflowDetailAction({
        original: props.originalValues,
        submitted: submitted ?? props.values,
        schema: props.schema,
        permissions: props.fieldPermissions,
        mode: props.permissionMode,
        kind: props.nodeKind,
        instance: props.instance ?? { steps: [] },
        action
      })
      emit('submit', result.values)
      emit('detail-action', { ...result, action })
      return result
    }
    expose({ submit, submitAction })

    return () => {
      const header = slots.header?.()
      const form = slots.form?.()
      const tabs = slots.tabs?.()
      const extra = slots.default?.()
      const action = props.showActions ? slots.action?.() : undefined
      const body = [
        hasSlotContent(form)
          ? h('div', { class: workflowDetailShellFormClasses, 'data-slot': 'form' }, form)
          : null,
        hasSlotContent(tabs)
          ? h('div', { class: workflowDetailShellTabsClasses, 'data-slot': 'tabs' }, tabs)
          : null,
        hasSlotContent(extra) ? extra : null
      ]

      const { class: _class, style: _style, ...restAttrs } = attrs

      return h(
        'div',
        {
          ...restAttrs,
          class: rootClasses.value,
          style: rootStyle.value,
          role: 'region',
          'aria-label': props.ariaLabel || labels.value.ariaLabel,
          'data-tiger-workflow-detail-shell': ''
        },
        [
          h(
            'div',
            { class: workflowDetailShellHeaderClasses, 'data-slot': 'header' },
            hasSlotContent(header)
              ? header
              : h('h1', { class: 'text-base font-semibold' }, props.title || labels.value.title)
          ),
          h('div', { class: workflowDetailShellBodyClasses, 'data-slot': 'body' }, body),
          hasSlotContent(action)
            ? h('div', { class: workflowDetailShellActionClasses, 'data-slot': 'action' }, action)
            : null
        ]
      )
    }
  }
})
