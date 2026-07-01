import {
  defineComponent,
  h,
  PropType,
  computed,
  provide,
  inject,
  type ComputedRef,
  type InjectionKey
} from 'vue'
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

/**
 * Shares `showPageBreaks` from a PrintLayout down to nested PrintPageBreak
 * indicators. Absent (standalone usage) defaults to showing indicators.
 */
const PrintLayoutShowPageBreaksKey: InjectionKey<ComputedRef<boolean>> = Symbol(
  'tigerPrintShowPageBreaks'
)

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
    provide(
      PrintLayoutShowPageBreaksKey,
      computed(() => props.showPageBreaks)
    )

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
    const showPageBreaks = inject(PrintLayoutShowPageBreaksKey, null)
    return () =>
      h('div', {
        ...attrs,
        // Always force the print page break; only show the on-screen dashed indicator
        // when the enclosing PrintLayout has `showPageBreaks` enabled.
        class: classNames(
          (showPageBreaks?.value ?? true) && printLayoutPageBreakClasses,
          'print:break-before-page'
        ),
        'aria-hidden': 'true'
      })
  }
})

export default PrintLayout
