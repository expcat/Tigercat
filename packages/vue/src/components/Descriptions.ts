import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getDescriptionsClasses,
  getDescriptionsTableClasses,
  getDescriptionsLabelClasses,
  getDescriptionsContentClasses,
  getDescriptionsVerticalItemClasses,
  groupItemsIntoRows,
  descriptionsWrapperClasses,
  descriptionsHeaderClasses,
  descriptionsTitleClasses,
  descriptionsExtraClasses,
  descriptionsVerticalWrapperClasses,
  type DescriptionsSize,
  type DescriptionsLayout,
  type DescriptionsItem
} from '@expcat/tigercat-core'

type HChildren = Parameters<typeof h>[2]

export interface VueDescriptionsProps {
  title?: string | number
  extra?: unknown
  bordered?: boolean
  column?: number
  size?: DescriptionsSize
  layout?: DescriptionsLayout
  colon?: boolean
  labelStyle?: Record<string, string | number>
  contentStyle?: Record<string, string | number>
  items?: DescriptionsItem[]
  className?: string
  style?: Record<string, string | number> | string
}

export const Descriptions = defineComponent({
  name: 'TigerDescriptions',
  inheritAttrs: false,
  props: {
    /**
     * Descriptions title
     */
    title: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    /**
     * Extra content (actions, links, etc.)
     */
    extra: {
      type: null as unknown as PropType<unknown>,
      default: undefined
    },
    /**
     * Whether to show border
     * @default false
     */
    bordered: {
      type: Boolean,
      default: false
    },
    /**
     * Number of columns per row
     * @default 3
     */
    column: {
      type: Number,
      default: 3,
      validator: (value: number) => value > 0
    },
    /**
     * Descriptions size
     * @default 'md'
     */
    size: {
      type: String as PropType<DescriptionsSize>,
      default: 'md' as DescriptionsSize
    },
    /**
     * Descriptions layout
     * @default 'horizontal'
     */
    layout: {
      type: String as PropType<DescriptionsLayout>,
      default: 'horizontal' as DescriptionsLayout
    },
    /**
     * Whether to show colon after label
     * @default true
     */
    colon: {
      type: Boolean,
      default: true
    },
    /**
     * Label style
     */
    labelStyle: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    /**
     * Content style
     */
    contentStyle: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    /**
     * Items data source (alternative to using slots)
     */
    items: {
      type: Array as PropType<DescriptionsItem[]>,
      default: () => []
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: [Object, String] as PropType<Record<string, string | number> | string>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const descriptionsClasses = computed(() => {
      return getDescriptionsClasses(props.size)
    })

    const tableClasses = computed(() => {
      return getDescriptionsTableClasses(props.bordered)
    })

    // Render header section
    function renderHeader() {
      if (!props.title && !slots.title && !props.extra && !slots.extra) {
        return null
      }

      return h('div', { class: descriptionsHeaderClasses }, [
        props.title || slots.title
          ? h('div', { class: descriptionsTitleClasses }, slots.title?.() || props.title)
          : null,
        props.extra || slots.extra
          ? h(
              'div',
              { class: descriptionsExtraClasses },
              slots.extra?.() || (props.extra as HChildren)
            )
          : null
      ])
    }

    // Render horizontal layout (table-based)
    function renderHorizontalLayout() {
      const items = props.items
      if (items.length === 0 && !slots.default) {
        return null
      }

      const rows = groupItemsIntoRows(items, props.column)

      return h('table', { class: tableClasses.value }, [
        h(
          'tbody',
          {},
          rows.map((row) => renderRow(row))
        )
      ])
    }

    // Render a single row in horizontal layout
    function renderRow(rowItems: DescriptionsItem[]) {
      const cells: ReturnType<typeof h>[] = []

      rowItems.forEach((item) => {
        const span = Math.min(item.span || 1, props.column)
        const labelClass = classNames(
          getDescriptionsLabelClasses(props.bordered, props.size, props.layout),
          item.labelClassName
        )
        const contentClass = classNames(
          getDescriptionsContentClasses(props.bordered, props.size, props.layout),
          item.contentClassName
        )

        // Label cell
        cells.push(
          h(
            'th',
            {
              class: labelClass,
              style: props.labelStyle
            },
            [item.label, props.colon ? ':' : '']
          )
        )

        // Content cell
        cells.push(
          h(
            'td',
            {
              class: contentClass,
              style: props.contentStyle,
              colspan: span > 1 ? span * 2 - 1 : 1
            },
            item.content as HChildren
          )
        )
      })

      return h('tr', {}, cells)
    }

    // Render vertical layout (stacked)
    function renderVerticalLayout() {
      const items = props.items
      if (items.length === 0 && !slots.default) {
        return null
      }

      if (props.bordered) {
        // Use table for bordered vertical layout
        return h('table', { class: tableClasses.value }, [
          h(
            'tbody',
            {},
            items.map((item) => renderVerticalItem(item))
          )
        ])
      }

      return h(
        'dl',
        { class: descriptionsVerticalWrapperClasses },
        items.map((item) => renderVerticalItem(item))
      )
    }

    // Render a single item in vertical layout
    function renderVerticalItem(item: DescriptionsItem) {
      const labelClass = classNames(
        getDescriptionsLabelClasses(props.bordered, props.size, props.layout),
        item.labelClassName
      )
      const contentClass = classNames(
        getDescriptionsContentClasses(props.bordered, props.size, props.layout),
        item.contentClassName
      )

      if (props.bordered) {
        // Table row for bordered layout
        return h('tr', {}, [
          h(
            'th',
            {
              class: labelClass,
              style: props.labelStyle
            },
            [item.label, props.colon ? ':' : '']
          ),
          h(
            'td',
            {
              class: contentClass,
              style: props.contentStyle
            },
            item.content as HChildren
          )
        ])
      }

      // Simple div for non-bordered layout
      const itemClasses = getDescriptionsVerticalItemClasses(props.size)
      return h('div', { class: itemClasses }, [
        h(
          'dt',
          {
            class: labelClass,
            style: props.labelStyle
          },
          [item.label, props.colon ? ':' : '']
        ),
        h(
          'dd',
          {
            class: contentClass,
            style: props.contentStyle
          },
          item.content as HChildren
        )
      ])
    }

    return () => {
      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            descriptionsWrapperClasses,
            descriptionsClasses.value,
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: mergeStyleValues(props.style, attrs.style)
        },
        [
          renderHeader(),
          props.layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout(),
          slots.default?.()
        ]
      )
    }
  }
})

export default Descriptions
