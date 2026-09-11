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
 * while form/tabs scroll.
 */

import { computed, defineComponent, h, PropType } from 'vue'
import {
  WORKFLOW_DETAIL_SHELL_DEFAULT_ARIA_LABEL,
  classNames,
  coerceClassValue,
  getWorkflowDetailShellRootClasses,
  mergeStyleValues,
  workflowDetailShellActionClasses,
  workflowDetailShellBodyClasses,
  workflowDetailShellFormClasses,
  workflowDetailShellHeaderClasses,
  workflowDetailShellTabsClasses,
  type WorkflowDetailShellProps as CoreWorkflowDetailShellProps
} from '@expcat/tigercat-core'

export interface VueWorkflowDetailShellProps extends CoreWorkflowDetailShellProps {}

export type WorkflowDetailShellProps = VueWorkflowDetailShellProps

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
     * @default 'Workflow detail'
     */
    ariaLabel: { type: String, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, unknown>>, default: undefined }
  },
  setup(props, { slots, attrs }) {
    const rootClasses = computed(() =>
      classNames(getWorkflowDetailShellRootClasses(props.className), coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style))

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
          'aria-label': props.ariaLabel || WORKFLOW_DETAIL_SHELL_DEFAULT_ARIA_LABEL,
          'data-tiger-workflow-detail-shell': ''
        },
        [
          hasSlotContent(header)
            ? h(
                'header',
                { class: workflowDetailShellHeaderClasses, 'data-slot': 'header' },
                header
              )
            : null,
          h('div', { class: workflowDetailShellBodyClasses, 'data-slot': 'body' }, body),
          hasSlotContent(action)
            ? h(
                'footer',
                { class: workflowDetailShellActionClasses, 'data-slot': 'action' },
                action
              )
            : null
        ]
      )
    }
  }
})
