import {
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  provide,
  ref,
  type ComputedRef,
  type InjectionKey,
  type PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  getPrintLayoutBoxStyle,
  getPrintLayoutClasses,
  getPrintLayoutLabels,
  getPrintLayoutPageKey,
  injectPrintLayoutStyles,
  mergeStyleValues,
  mergeTigerLocale,
  printLayoutFooterClasses,
  printLayoutHeaderClasses,
  printLayoutPageBreakClasses,
  printLayoutPageBreakLabelClasses,
  printPrintLayoutRoot,
  resolvePrintPageBox,
  type PrintLayoutInstance,
  type PrintLayoutProps as CorePrintLayoutProps,
  type PrintOrientation,
  type PrintPageSize,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

const PrintLayoutShowPageBreaksKey: InjectionKey<ComputedRef<boolean>> = Symbol(
  'tigerPrintShowPageBreaks'
)
const PrintLayoutLocaleKey: InjectionKey<ComputedRef<Partial<TigerLocale> | undefined>> = Symbol(
  'tigerPrintLocale'
)

export interface VuePrintLayoutProps extends CorePrintLayoutProps {
  className?: string
  locale?: Partial<TigerLocale>
}

export type PrintLayoutProps = VuePrintLayoutProps

export const PrintLayout = defineComponent({
  name: 'TigerPrintLayout',
  inheritAttrs: false,
  props: {
    pageSize: { type: String as PropType<PrintPageSize>, default: 'A4' },
    orientation: { type: String as PropType<PrintOrientation>, default: 'portrait' },
    showHeader: { type: Boolean, default: false },
    showFooter: { type: Boolean, default: false },
    headerText: { type: String, default: undefined },
    footerText: { type: String, default: undefined },
    showPageBreaks: { type: Boolean, default: true },
    pageWidth: { type: [Number, String] as PropType<number | string>, default: undefined },
    pageHeight: { type: [Number, String] as PropType<number | string>, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    className: { type: String, default: undefined }
  },
  setup(props, { slots, attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null)
    provide(
      PrintLayoutShowPageBreaksKey,
      computed(() => props.showPageBreaks)
    )
    provide(
      PrintLayoutLocaleKey,
      computed(() => props.locale)
    )

    onMounted(() => injectPrintLayoutStyles())

    const box = computed(() =>
      resolvePrintPageBox(props.pageSize, props.orientation, props.pageWidth, props.pageHeight)
    )
    const pageKey = computed(() => getPrintLayoutPageKey(box.value))

    expose({
      print: () => printPrintLayoutRoot(rootRef.value),
      getRoot: () => rootRef.value
    } satisfies PrintLayoutInstance)

    return () => {
      const header = props.showHeader ? (slots.header?.() ?? props.headerText) : null
      const footer = props.showFooter ? (slots.footer?.() ?? props.footerText) : null

      return h(
        'div',
        {
          ...attrs,
          ref: rootRef,
          class: classNames(getPrintLayoutClasses(props.className), coerceClassValue(attrs.class)),
          style: mergeStyleValues(getPrintLayoutBoxStyle(box.value), attrs.style),
          'data-tiger-print': pageKey.value
        },
        [
          h('table', { class: 'w-full border-collapse' }, [
            header
              ? h('thead', {}, [
                  h('tr', {}, [h('th', { class: printLayoutHeaderClasses }, header)])
                ])
              : null,
            h('tbody', {}, [
              h('tr', {}, [h('td', { class: 'tiger-print-content' }, slots.default?.())])
            ]),
            footer
              ? h('tfoot', {}, [
                  h('tr', {}, [h('td', { class: printLayoutFooterClasses }, footer)])
                ])
              : null
          ])
        ]
      )
    }
  }
})

export interface VuePrintPageBreakProps {
  className?: string
  locale?: Partial<TigerLocale>
}

export type PrintPageBreakProps = VuePrintPageBreakProps

export const PrintPageBreak = defineComponent({
  name: 'TigerPrintPageBreak',
  inheritAttrs: false,
  props: {
    className: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  setup(props, { attrs, slots }) {
    const showPageBreaks = inject(PrintLayoutShowPageBreaksKey, null)
    const layoutLocale = inject(PrintLayoutLocaleKey, null)
    const config = useTigerConfig()
    return () => {
      const label = getPrintLayoutLabels(
        mergeTigerLocale(mergeTigerLocale(config.value.locale, layoutLocale?.value), props.locale)
      ).pageBreak
      const hidden = attrs['aria-hidden']
      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            'print:break-before-page',
            props.className,
            coerceClassValue(attrs.class)
          ),
          'aria-hidden': hidden === undefined ? 'true' : hidden
        },
        (showPageBreaks?.value ?? true)
          ? h(
              'div',
              { class: classNames(printLayoutPageBreakClasses, printLayoutPageBreakLabelClasses) },
              slots.default?.() ?? label
            )
          : null
      )
    }
  }
})

export default PrintLayout
