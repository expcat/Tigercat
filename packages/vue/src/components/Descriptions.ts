import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  devWarn,
  getDescriptionsClasses,
  getDescriptionsContentClasses,
  getDescriptionsHorizontalColSpan,
  getDescriptionsLabelClasses,
  getDescriptionsLabels,
  getDescriptionsTableClasses,
  getDescriptionsVerticalGridStyle,
  getDescriptionsVerticalItemClasses,
  groupItemsIntoRows,
  descriptionsCaptionClasses,
  descriptionsExtraClasses,
  descriptionsHeaderClasses,
  descriptionsTitleClasses,
  isResponsiveMap,
  mergeStyleValues,
  mergeTigerLocale,
  observeElementSize,
  resolveResponsiveValue,
  type ComponentSize,
  type DescriptionsItem,
  type DescriptionsLayout,
  type DescriptionsProps as CoreDescriptionsProps,
  type ResponsiveBreakpoint,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

type HChildren = Parameters<typeof h>[2]

export interface VueDescriptionsProps extends Omit<
  CoreDescriptionsProps,
  'title' | 'extra' | 'labelStyle' | 'contentStyle'
> {
  title?: string | number
  extra?: unknown
  labelStyle?: Record<string, string | number>
  contentStyle?: Record<string, string | number>
  items?: DescriptionsItem[]
  column?: number | Partial<Record<ResponsiveBreakpoint, number>>
  locale?: Partial<TigerLocale>
  className?: string
  style?: Record<string, string | number> | string
}

export type DescriptionsProps = VueDescriptionsProps

let descriptionsId = 0

export const Descriptions = defineComponent({
  name: 'TigerDescriptions',
  inheritAttrs: false,
  props: {
    title: { type: [String, Number] as PropType<string | number>, default: undefined },
    extra: { type: null as unknown as PropType<unknown>, default: undefined },
    bordered: { type: Boolean, default: false },
    column: {
      type: [Number, Object] as PropType<number | Partial<Record<ResponsiveBreakpoint, number>>>,
      default: 3
    },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    layout: {
      type: String as PropType<DescriptionsLayout>,
      default: 'horizontal' as DescriptionsLayout
    },
    colon: { type: Boolean, default: true },
    labelStyle: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    contentStyle: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    items: { type: Array as PropType<DescriptionsItem[]>, default: () => [] },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    className: { type: String, default: undefined },
    style: {
      type: [Object, String] as PropType<Record<string, string | number> | string>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const colonGlyph = computed(() => getDescriptionsLabels(mergedLocale.value).colon)
    const titleId = `tiger-descriptions-title-${++descriptionsId}`
    const rootRef = ref<HTMLElement | null>(null)
    const containerWidth = ref(0)
    let stopSize: (() => void) | undefined

    const bindSize = (): void => {
      stopSize?.()
      stopSize = undefined
      if (!isResponsiveMap(props.column)) {
        containerWidth.value = 0
        return
      }
      stopSize = observeElementSize(rootRef.value, ({ width }) => {
        containerWidth.value = width
      })
    }

    onMounted(bindSize)
    onBeforeUnmount(() => stopSize?.())
    watch(
      () => props.column,
      () => bindSize()
    )

    const column = computed(() => resolveResponsiveValue(props.column, containerWidth.value, 3))
    const rows = computed(() => groupItemsIntoRows(props.items, column.value))
    const useCaption = computed(() =>
      Boolean(
        props.title &&
        !props.extra &&
        !slots.extra &&
        (props.layout === 'horizontal' || props.bordered)
      )
    )
    const showHeader = computed(() =>
      Boolean(props.extra || slots.extra || slots.title || (props.title && !useCaption.value))
    )

    function labelText(item: DescriptionsItem): HChildren {
      return [item.label, props.colon ? colonGlyph.value : '']
    }

    function renderHorizontal() {
      if (props.items.length === 0) return null
      return h(
        'table',
        {
          class: getDescriptionsTableClasses(props.bordered),
          'aria-labelledby': props.title ? titleId : undefined
        },
        [
          useCaption.value
            ? h('caption', { class: descriptionsCaptionClasses, id: titleId }, props.title)
            : null,
          h(
            'tbody',
            {},
            rows.value.map((rowItems) =>
              h(
                'tr',
                {},
                rowItems.flatMap((item) => [
                  h(
                    'th',
                    {
                      scope: 'row',
                      class: classNames(
                        getDescriptionsLabelClasses(props.bordered, props.size, 'horizontal'),
                        item.labelClassName
                      ),
                      style: props.labelStyle
                    },
                    labelText(item)
                  ),
                  h(
                    'td',
                    {
                      class: classNames(
                        getDescriptionsContentClasses(props.bordered, props.size, 'horizontal'),
                        item.contentClassName
                      ),
                      style: props.contentStyle,
                      colspan: getDescriptionsHorizontalColSpan(item.span || 1)
                    },
                    item.content as HChildren
                  )
                ])
              )
            )
          )
        ]
      )
    }

    function renderVertical() {
      if (props.items.length === 0) return null
      if (props.bordered) {
        return h(
          'table',
          {
            class: getDescriptionsTableClasses(true),
            'aria-labelledby': props.title ? titleId : undefined
          },
          [
            useCaption.value
              ? h('caption', { class: descriptionsCaptionClasses, id: titleId }, props.title)
              : null,
            h(
              'tbody',
              {},
              rows.value.map((rowItems) =>
                h(
                  'tr',
                  {},
                  rowItems.map((item) =>
                    h(
                      'td',
                      {
                        colspan: item.span || 1,
                        class: getDescriptionsVerticalItemClasses(props.size, true)
                      },
                      [
                        h(
                          'div',
                          {
                            class: classNames(
                              getDescriptionsLabelClasses(true, props.size, 'vertical'),
                              item.labelClassName
                            ),
                            style: props.labelStyle
                          },
                          labelText(item)
                        ),
                        h(
                          'div',
                          {
                            class: classNames(
                              getDescriptionsContentClasses(true, props.size, 'vertical'),
                              item.contentClassName
                            ),
                            style: props.contentStyle
                          },
                          item.content as HChildren
                        )
                      ]
                    )
                  )
                )
              )
            )
          ]
        )
      }

      return h(
        'dl',
        {
          class: 'grid w-full',
          style: getDescriptionsVerticalGridStyle(column.value),
          'aria-labelledby': props.title ? titleId : undefined
        },
        rows.value.flatMap((rowItems) =>
          rowItems.map((item) =>
            h(
              'div',
              {
                class: getDescriptionsVerticalItemClasses(props.size, false),
                style: { gridColumn: `span ${item.span || 1}` }
              },
              [
                h(
                  'dt',
                  {
                    class: classNames(
                      getDescriptionsLabelClasses(false, props.size, 'vertical'),
                      item.labelClassName
                    ),
                    style: props.labelStyle
                  },
                  labelText(item)
                ),
                h(
                  'dd',
                  {
                    class: classNames(
                      getDescriptionsContentClasses(false, props.size, 'vertical'),
                      item.contentClassName
                    ),
                    style: props.contentStyle
                  },
                  item.content as HChildren
                )
              ]
            )
          )
        )
      )
    }

    return () => {
      if (slots.default && props.items.length === 0) {
        devWarn(
          'Descriptions.children',
          'Descriptions: `items` is the data source. Default slot content is ignored and is not description rows.'
        )
      }

      return h(
        'div',
        {
          ...attrs,
          ref: rootRef,
          class: classNames(
            getDescriptionsClasses(props.size, props.bordered),
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: mergeStyleValues(props.style, attrs.style)
        },
        [
          showHeader.value
            ? h('div', { class: descriptionsHeaderClasses }, [
                props.title || slots.title
                  ? h(
                      'div',
                      { class: descriptionsTitleClasses, id: titleId },
                      slots.title?.() || props.title
                    )
                  : null,
                props.extra || slots.extra
                  ? h(
                      'div',
                      { class: descriptionsExtraClasses },
                      slots.extra?.() || (props.extra as HChildren)
                    )
                  : null
              ])
            : null,
          props.layout === 'horizontal' ? renderHorizontal() : renderVertical()
        ]
      )
    }
  }
})

export default Descriptions
