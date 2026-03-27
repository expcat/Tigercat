import { defineComponent, h, PropType, computed } from 'vue'
import {
  classNames,
  coerceClassValue,
  getPrintLayoutClasses,
  printLayoutHeaderClasses,
  printLayoutFooterClasses,
  printLayoutPageBreakClasses,
  type PrintPageSize,
  type PrintOrientation
} from '@expcat/tigercat-core'

export interface VuePrintLayoutProps {
  pageSize?: PrintPageSize
  orientation?: PrintOrientation
  showHeader?: boolean
  showFooter?: boolean
  headerText?: string
  footerText?: string
  showPageBreaks?: boolean
  className?: string
}

export const PrintLayout = defineComponent({
  name: 'TigerPrintLayout',
  inheritAttrs: false,
  props: {
    pageSize: {
      type: String as PropType<PrintPageSize>,
      default: 'A4'
    },
    orientation: {
      type: String as PropType<PrintOrientation>,
      default: 'portrait'
    },
    showHeader: {
      type: Boolean,
      default: false
    },
    showFooter: {
      type: Boolean,
      default: false
    },
    headerText: {
      type: String,
      default: undefined
    },
    footerText: {
      type: String,
      default: undefined
    },
    showPageBreaks: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const classes = computed(() =>
      classNames(
        getPrintLayoutClasses(props.pageSize, props.orientation, props.className),
        coerceClassValue(attrs.class)
      )
    )

    return () => {
      const children = []

      if (props.showHeader && (props.headerText || slots.header)) {
        children.push(
          h(
            'div',
            { class: printLayoutHeaderClasses },
            slots.header ? slots.header() : props.headerText
          )
        )
      }

      children.push(h('div', { class: 'tiger-print-content' }, slots.default?.()))

      if (props.showFooter && (props.footerText || slots.footer)) {
        children.push(
          h(
            'div',
            { class: printLayoutFooterClasses },
            slots.footer ? slots.footer() : props.footerText
          )
        )
      }

      return h(
        'div',
        {
          ...attrs,
          class: classes.value
        },
        children
      )
    }
  }
})

export const PrintPageBreak = defineComponent({
  name: 'TigerPrintPageBreak',
  setup(_, { attrs }) {
    return () =>
      h('div', {
        ...attrs,
        class: classNames(printLayoutPageBreakClasses, 'print:break-before-page'),
        'aria-hidden': 'true'
      })
  }
})

export default PrintLayout
