import { computed, defineComponent, h, inject, provide, reactive, ref, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getCollapseContainerClasses,
  getCollapseHeaderTarget,
  normalizeActiveKeys,
  togglePanelKey,
  type CollapseHeaderFocusAction,
  type CollapseHeaderRecord,
  type ExpandIconPosition
} from '@expcat/tigercat-core'

export const CollapseContextKey = Symbol('CollapseContext')

export interface CollapseContext {
  activeKeys: (string | number)[]
  accordion: boolean
  expandIconPosition: ExpandIconPosition
  bordered: boolean
  ghost: boolean
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6
  handlePanelClick: (key: string | number) => void
  moveHeaderFocus: (current: HTMLButtonElement, action: CollapseHeaderFocusAction) => void
}

export function useCollapseContext(): CollapseContext | undefined {
  return inject<CollapseContext>(CollapseContextKey)
}

export interface VueCollapseProps {
  activeKey?: string | number | (string | number)[]
  defaultActiveKey?: string | number | (string | number)[]
  accordion?: boolean
  bordered?: boolean
  expandIconPosition?: ExpandIconPosition
  ghost?: boolean
  className?: string
  style?: Record<string, string | number>
}

export type CollapseProps = VueCollapseProps

export const Collapse = defineComponent({
  name: 'TigerCollapse',
  inheritAttrs: false,
  props: {
    /**
     * Currently active panel keys (controlled mode).
     * Empty `[]` is a controlled all-closed state.
     */
    activeKey: {
      type: [String, Number, Array] as PropType<string | number | (string | number)[]>,
      default: undefined
    },
    /**
     * Default active panel keys (uncontrolled mode)
     */
    defaultActiveKey: {
      type: [String, Number, Array] as PropType<string | number | (string | number)[]>,
      default: undefined
    },
    /**
     * Accordion mode — only one panel. Extra keys are dropped (last wins).
     * `update:activeKey` / `change` always emit an array.
     * @default false
     */
    accordion: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to show border
     * @default true
     */
    bordered: {
      type: Boolean,
      default: true
    },
    /**
     * Position of the expand icon
     * @default 'start'
     */
    expandIconPosition: {
      type: String as PropType<ExpandIconPosition>,
      default: 'start' as ExpandIconPosition
    },
    /**
     * Ghost mode - transparent without border
     * @default false
     */
    ghost: {
      type: Boolean,
      default: false
    },
    headingLevel: {
      type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>,
      default: 3
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['update:activeKey', 'change'],
  setup(props, { slots, emit, attrs }) {
    const internalActiveKeys = ref<(string | number)[]>(
      normalizeActiveKeys(props.defaultActiveKey, { accordion: props.accordion })
    )
    const rootRef = ref<HTMLElement | null>(null)

    const currentActiveKeys = computed(() => {
      return props.activeKey !== undefined
        ? normalizeActiveKeys(props.activeKey, { accordion: props.accordion })
        : internalActiveKeys.value
    })

    const handlePanelClick = (key: string | number) => {
      const newKeys = togglePanelKey(key, currentActiveKeys.value, props.accordion)

      if (props.activeKey === undefined) {
        internalActiveKeys.value = newKeys
      }

      emit('update:activeKey', newKeys)
      emit('change', newKeys)
    }

    const moveHeaderFocus = (current: HTMLButtonElement, action: CollapseHeaderFocusAction) => {
      const root = rootRef.value
      if (!root) return
      const buttons = Array.from(
        root.querySelectorAll<HTMLButtonElement>('[data-tiger-collapse-header]')
      ).filter((button) => !button.disabled && button.getAttribute('aria-disabled') !== 'true')
      const index = buttons.indexOf(current)
      const next = getCollapseHeaderTarget(
        buttons.map(() => ({ disabled: false })),
        index,
        action
      )
      if (next >= 0) buttons[next]?.focus()
    }

    const containerClasses = computed(() => {
      return classNames(
        getCollapseContainerClasses(props.bordered, props.ghost, props.className),
        coerceClassValue(attrs.class)
      )
    })

    const collapseContextValue = reactive<CollapseContext>({
      get activeKeys() {
        return currentActiveKeys.value
      },
      get accordion() {
        return props.accordion
      },
      get expandIconPosition() {
        return props.expandIconPosition
      },
      get bordered() {
        return props.bordered
      },
      get ghost() {
        return props.ghost
      },
      get headingLevel() {
        return props.headingLevel
      },
      handlePanelClick,
      moveHeaderFocus
    })

    provide<CollapseContext>(CollapseContextKey, collapseContextValue)

    return () => {
      const children = slots.default?.() || []

      return h(
        'div',
        {
          ...attrs,
          ref: rootRef,
          class: containerClasses.value,
          style: props.style,
          'data-tiger-collapse': ''
        },
        children
      )
    }
  }
})

export default Collapse
