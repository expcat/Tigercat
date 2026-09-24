import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  getPrintLayoutBoxStyle,
  getPrintLayoutClasses,
  paginatePrintPreview,
  getPrintLayoutLabels,
  createPrintInstanceId,
  getPrintLayoutPageKey,
  mountPrintInstanceStyle,
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
import { useTigerConfig } from './tiger-config'

const PrintLayoutShowPageBreaksKey: InjectionKey<ComputedRef<boolean>> = Symbol(
  'tigerPrintShowPageBreaks'
)
const PrintLayoutPrintBreaksKey: InjectionKey<ComputedRef<boolean>> = Symbol('tigerPrintBreaks')
const PrintLayoutLocaleKey: InjectionKey<ComputedRef<Partial<TigerLocale> | undefined>> =
  Symbol('tigerPrintLocale')

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
    printBreaks: { type: Boolean, default: true },
    pageWidth: { type: [Number, String] as PropType<number | string>, default: undefined },
    pageHeight: { type: [Number, String] as PropType<number | string>, default: undefined },
    bind: {
      type: Object as PropType<{
        contentHeightMm?: number
        pageHeightMm?: number
        marginMm?: number
        manualBreaks?: number
      }>,
      default: undefined
    },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    className: { type: String, default: undefined }
  },
  setup(props, { slots, attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null)
    const instanceId = createPrintInstanceId()
    provide(
      PrintLayoutShowPageBreaksKey,
      computed(() => props.showPageBreaks)
    )
    provide(
      PrintLayoutPrintBreaksKey,
      computed(() => props.printBreaks)
    )
    provide(
      PrintLayoutLocaleKey,
      computed(() => props.locale)
    )

    const box = computed(() =>
      resolvePrintPageBox(props.pageSize, props.orientation, props.pageWidth, props.pageHeight)
    )
    const pageKey = computed(() => getPrintLayoutPageKey(box.value))

    let detachPage: (() => void) | null = null
    const attachPage = () => {
      detachPage?.()
      const doc = rootRef.value?.ownerDocument ?? document
      detachPage = mountPrintInstanceStyle(doc, instanceId, box.value)
    }
    onMounted(attachPage)
    watch(box, () => {
      if (rootRef.value) attachPage()
    })
    onBeforeUnmount(() => detachPage?.())

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
          'data-tiger-print': pageKey.value,
          'data-tiger-print-instance': instanceId,
          'data-tiger-print-size': box.value.pageSize
        },
        [
          props.bind
            ? h(
                'div',
                { 'data-tiger-print-preview': '' },
                paginatePrintPreview({
                  contentHeightMm: props.bind.contentHeightMm ?? 0,
                  pageHeightMm: props.bind.pageHeightMm ?? 297,
                  marginMm: props.bind.marginMm,
                  manualBreaks: props.bind.manualBreaks
                }).map((page) =>
                  h(
                    'span',
                    { key: page.index, 'data-page-number': page.numberLabel },
                    page.numberLabel
                  )
                )
              )
            : null,
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
  /**
   * Additional CSS classes on the break marker
   */
  className?: string
  /**
   * Locale overlay for the on-screen page-break label
   */
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
    const printBreaks = inject(PrintLayoutPrintBreaksKey, null)
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
            (printBreaks?.value ?? true) && 'print:break-before-page',
            props.className,
            coerceClassValue(attrs.class)
          ),
          'aria-hidden': hidden === undefined ? 'true' : hidden
        },
        (showPageBreaks?.value ?? true)
          ? h('div', { class: printLayoutPageBreakClasses }, [
              h('span', { class: printLayoutPageBreakLabelClasses }, slots.default?.() ?? label)
            ])
          : undefined
      )
    }
  }
})

export default PrintLayout
