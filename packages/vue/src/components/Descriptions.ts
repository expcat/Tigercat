import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
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
  type DescriptionsItem,
} from '@tigercat/core'

export const Descriptions = defineComponent({
  name: 'TigerDescriptions',
  props: {
    /**
     * Descriptions title
     */
    title: {
      type: String,
      default: undefined,
    },
    /**
     * Whether to show border
     * @default false
     */
    bordered: {
      type: Boolean,
      default: false,
    },
    /**
     * Number of columns per row
     * @default 3
     */
    column: {
      type: Number,
      default: 3,
      validator: (value: number) => value > 0,
    },
    /**
     * Descriptions size
     * @default 'md'
     */
    size: {
      type: String as PropType<DescriptionsSize>,
      default: 'md' as DescriptionsSize,
    },
    /**
     * Descriptions layout
     * @default 'horizontal'
     */
    layout: {
      type: String as PropType<DescriptionsLayout>,
      default: 'horizontal' as DescriptionsLayout,
    },
    /**
     * Whether to show colon after label
     * @default true
     */
    colon: {
      type: Boolean,
      default: true,
    },
    /**
     * Label style
     */
    labelStyle: {
      type: Object as PropType<Record<string, string>>,
      default: undefined,
    },
    /**
     * Content style
     */
    contentStyle: {
      type: Object as PropType<Record<string, string>>,
      default: undefined,
    },
    /**
     * Items data source (alternative to using slots)
     */
    items: {
      type: Array as PropType<DescriptionsItem[]>,
      default: () => [],
    },
  },
  setup(props, { slots }) {
    const descriptionsClasses = computed(() => {
      return getDescriptionsClasses(props.bordered, props.size)
    })

    const tableClasses = computed(() => {
      return getDescriptionsTableClasses(props.bordered)
    })

    // Render header section
    function renderHeader() {
      if (!props.title && !slots.title && !slots.extra) {
        return null
      }

      return h('div', { class: descriptionsHeaderClasses }, [
        h('div', { class: descriptionsTitleClasses }, slots.title?.() || props.title),
        slots.extra && h('div', { class: descriptionsExtraClasses }, slots.extra()),
      ])
    }

    // Render horizontal layout (table-based)
    function renderHorizontalLayout() {
      const items = props.items
      if (items.length === 0 && !slots.default) {
        return null
      }

      // Group items into rows
      const rows = groupItemsIntoRows(items, props.column)

      return h('table', { class: tableClasses.value }, [
        h('tbody', {}, rows.map(row => renderRow(row))),
      ])
    }

    // Render a single row in horizontal layout
    function renderRow(rowItems: DescriptionsItem[]) {
      const cells: any[] = []

      rowItems.forEach(item => {
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
          h('th', {
            class: labelClass,
            style: props.labelStyle,
          }, [
            item.label,
            props.colon && props.layout === 'horizontal' ? ':' : '',
          ])
        )

        // Content cell
        cells.push(
          h('td', {
            class: contentClass,
            style: props.contentStyle,
            colspan: span > 1 ? span * 2 - 1 : 1,
          }, item.content as any)
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
          h('tbody', {},
            items.map(item => renderVerticalItem(item))
          ),
        ])
      }

      // Use simple div layout for non-bordered vertical
      return h('div', { class: descriptionsVerticalWrapperClasses },
        items.map(item => renderVerticalItem(item))
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
          h('th', {
            class: labelClass,
            style: props.labelStyle,
          }, [
            item.label,
            props.colon ? ':' : '',
          ]),
          h('td', {
            class: contentClass,
            style: props.contentStyle,
          }, item.content as any),
        ])
      }

      // Simple div for non-bordered layout
      const itemClasses = getDescriptionsVerticalItemClasses(props.bordered, props.size)
      return h('div', { class: itemClasses }, [
        h('div', {
          class: labelClass,
          style: props.labelStyle,
        }, [
          item.label,
          props.colon ? ':' : '',
        ]),
        h('div', {
          class: contentClass,
          style: props.contentStyle,
        }, item.content as any),
      ])
    }

    return () => {
      return h('div', { class: classNames(descriptionsWrapperClasses, descriptionsClasses.value) }, [
        renderHeader(),
        props.layout === 'horizontal'
          ? renderHorizontalLayout()
          : renderVerticalLayout(),
        slots.default?.(),
      ])
    }
  },
})

export default Descriptions
