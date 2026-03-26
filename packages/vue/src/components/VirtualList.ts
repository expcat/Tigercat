import { defineComponent, h, ref, computed, onMounted, onBeforeUnmount, type PropType } from 'vue'
import {
  virtualListContainerClasses,
  virtualListInnerClasses,
  getFixedVirtualRange,
  classNames,
  coerceClassValue
} from '@expcat/tigercat-core'

export type VueVirtualListProps = InstanceType<typeof VirtualList>['$props']

export const VirtualList = defineComponent({
  name: 'TigerVirtualList',
  props: {
    itemCount: { type: Number, default: 0 },
    itemHeight: { type: Number, default: 40 },
    height: { type: Number, default: 400 },
    overscan: { type: Number, default: 5 }
  },
  emits: ['scroll'],
  setup(props, { emit, attrs, slots }) {
    const scrollTop = ref(0)
    const containerRef = ref<HTMLElement | null>(null)

    const range = computed(() =>
      getFixedVirtualRange(
        scrollTop.value,
        props.height,
        props.itemHeight,
        props.itemCount,
        props.overscan
      )
    )

    function handleScroll() {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
        emit('scroll', scrollTop.value)
      }
    }

    return () => {
      const { startIndex, endIndex, offsetTop, totalHeight } = range.value
      const items: ReturnType<typeof h>[] = []

      for (let i = startIndex; i <= endIndex; i++) {
        const slotContent = slots.default?.({ index: i })
        items.push(
          h(
            'div',
            {
              key: i,
              style: {
                height: `${props.itemHeight}px`,
                width: '100%'
              }
            },
            slotContent
          )
        )
      }

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
