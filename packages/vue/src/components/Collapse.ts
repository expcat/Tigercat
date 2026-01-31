import {
  defineComponent,
  computed,
  ref,
  provide,
  PropType,
  h,
  reactive,
  watch,
  getCurrentInstance,
  type VNode
} from 'vue'
import {
  classNames,
  getCollapseContainerClasses,
  normalizeActiveKeys,
  togglePanelKey,
  type ExpandIconPosition,
  coerceClassValue
} from '@expcat/tigercat-core'

// Collapse context key
export const CollapseContextKey = Symbol('CollapseContext')

// Collapse context interface
export interface CollapseContext {
  activeKeys: (string | number)[]
  accordion: boolean
  expandIconPosition: ExpandIconPosition
  bordered: boolean
  ghost: boolean
  handlePanelClick: (key: string | number) => void
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

export const Collapse = defineComponent({
  name: 'TigerCollapse',
  props: {
    /**
     * Currently active panel keys (controlled mode)
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
     * Accordion mode - only one panel can be expanded at a time
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
    // Internal state for uncontrolled mode
    const internalActiveKeys = ref<(string | number)[]>(
      normalizeActiveKeys(props.defaultActiveKey)
    )

    // Computed active keys (controlled or uncontrolled)
    const currentActiveKeys = computed(() => {
      return props.activeKey !== undefined
        ? normalizeActiveKeys(props.activeKey)
        : internalActiveKeys.value
    })

    // Handle panel click
    const handlePanelClick = (key: string | number) => {
      const newKeys = togglePanelKey(key, currentActiveKeys.value, props.accordion)

      // Update internal state if uncontrolled
      if (props.activeKey === undefined) {
        internalActiveKeys.value = newKeys
      }

      // Emit events
      emit('update:activeKey', props.accordion ? newKeys[0] : newKeys)
      emit('change', props.accordion ? newKeys[0] : newKeys)
    }

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getCollapseContainerClasses(props.bordered, props.ghost, props.className),
        coerceClassValue(attrs.class)
      )
    })

    // Provide collapse context to child components (make it reactive)
    const collapseContextValue = reactive<CollapseContext>({
      activeKeys: currentActiveKeys.value,
      accordion: props.accordion,
      expandIconPosition: props.expandIconPosition,
      bordered: props.bordered,
      ghost: props.ghost,
      handlePanelClick
    })

    // Watch props that need to sync to context
    watch(
      () =>
        [
          currentActiveKeys.value,
          props.accordion,
          props.expandIconPosition,
          props.bordered,
          props.ghost
        ] as const,
      ([activeKeys, accordion, expandIconPosition, bordered, ghost]) => {
        collapseContextValue.activeKeys = activeKeys
        collapseContextValue.accordion = accordion
        collapseContextValue.expandIconPosition = expandIconPosition
        collapseContextValue.bordered = bordered
        collapseContextValue.ghost = ghost
      }
    )

    provide<CollapseContext>(CollapseContextKey, collapseContextValue)

    return () => {
      const children = slots.default?.() || []

      return h(
        'div',
        {
          class: containerClasses.value,
          style: props.style,
          role: 'region'
        },
        children
      )
    }
  }
})

export default Collapse
