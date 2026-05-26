import { defineComponent, h, ref, computed, PropType } from 'vue'
import {
  virtualListContainerClasses,
  virtualListInnerClasses,
  fixedSizeStrategy,
  variableSizeStrategy,
  dynamicSizeStrategy,
  classNames,
  coerceClassValue,
  type VirtualListSizeStrategy
} from '@expcat/tigercat-core'

export type VueVirtualListProps = InstanceType<typeof VirtualList>['$props']

export const VirtualList = defineComponent({
  name: 'TigerVirtualList',
  props: {
    itemCount: { type: Number, default: 0 },
    itemHeight: { type: Number, default: 40 },
    estimatedItemHeight: { type: Number, default: undefined },
    getItemHeight: {
      type: Function as PropType<(index: number) => number>,
      default: undefined
    },
    sizeStrategy: {
      type: Object as PropType<VirtualListSizeStrategy>,
      default: undefined
    },
    height: { type: Number, default: 400 },
    overscan: { type: Number, default: 5 }
  },
  emits: ['scroll'],
  setup(props, { emit, attrs, slots }) {
    const scrollTop = ref(0)
    const containerRef = ref<HTMLElement | null>(null)

    const strategy = computed<VirtualListSizeStrategy>(() => {
      if (props.sizeStrategy) return props.sizeStrategy
      if (props.getItemHeight) {
        return variableSizeStrategy(props.getItemHeight, props.itemCount)
      }
      if (props.estimatedItemHeight !== undefined) {
        return dynamicSizeStrategy(props.estimatedItemHeight, props.itemCount)
      }
      return fixedSizeStrategy(props.itemHeight)
    })

    const range = computed(() =>
      strategy.value.getRange(scrollTop.value, props.height, props.itemCount, props.overscan)
    )

    function handleScroll() {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
        emit('scroll', scrollTop.value)
      }
    }

    return () => {
      const { startIndex, endIndex, totalHeight } = range.value
      const currentStrategy = strategy.value
      const items: ReturnType<typeof h>[] = []

      for (let i = startIndex; i <= endIndex; i++) {
        const itemH = currentStrategy.getItemHeight(i)
        const slotContent = slots.default?.({ index: i })
        items.push(
          h(
            'div',
            {
              key: i,
              style: {
                height: `${itemH}px`,
                width: '100%'
              }
            },
            slotContent
          )
        )
      }

      const offsetTop = startIndex >= 0 ? currentStrategy.getItemOffset(startIndex) : 0

      return h(
        'div',
        {
          ref: containerRef,
          class: classNames(virtualListContainerClasses, coerceClassValue(attrs.class)),
          style: { height: `${props.height}px` },
          onScroll: handleScroll
        },
        [
          h(
            'div',
            {
              class: virtualListInnerClasses,
              style: { height: `${totalHeight}px` }
            },
            [
              h(
                'div',
                {
                  style: {
                    transform: `translateY(${offsetTop}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                  }
                },
                items
              )
            ]
          )
        ]
      )
    }
  }
})

export default VirtualList
