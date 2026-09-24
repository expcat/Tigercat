import { defineComponent, h, ref, computed, type PropType } from 'vue'
import { toggleInplace } from '@expcat/tigercat-core'

export const Inplace = defineComponent({
  name: 'TigerInplace',
  inheritAttrs: false,
  props: {
    editing: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    defaultEditing: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  emits: ['editingChange', 'update:editing'],
  setup(props, { slots, emit, attrs }) {
    const unmanaged = ref(props.defaultEditing)
    const isControlled = computed(() => props.editing !== undefined)
    const editing = computed(() => (isControlled.value ? Boolean(props.editing) : unmanaged.value))

    function publish(next: boolean, action: 'edit' | 'commit' | 'cancel'): void {
      const state = toggleInplace({ editing: editing.value }, action)
      const value = state.editing && next ? true : state.editing
      if (!isControlled.value) unmanaged.value = value
      emit('editingChange', value)
      emit('update:editing', value)
    }

    function startEdit(): void {
      if (props.disabled || editing.value) return
      publish(true, 'edit')
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Enter') {
        event.preventDefault()
        publish(false, 'commit')
      } else if (event.key === 'Escape') {
        event.preventDefault()
        publish(false, 'cancel')
      }
    }

    return () =>
      h(
        'span',
        { ...attrs, 'data-tiger-inplace': '', 'data-editing': editing.value ? 'true' : 'false' },
        editing.value
          ? h('span', { onKeydown }, slots.input?.())
          : h(
              'button',
              { type: 'button', disabled: props.disabled, onClick: startEdit },
              slots.display?.()
            )
      )
  }
})

export default Inplace
