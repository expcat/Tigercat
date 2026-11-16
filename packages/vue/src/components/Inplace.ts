import { computed, defineComponent, h, nextTick, ref, type PropType } from 'vue'
import { resolveButtonClasses, toggleInplace } from '@expcat/tigercat-core'

const INPLACE_FOCUSABLE =
  'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href], [contenteditable="true"], [tabindex]:not([tabindex="-1"])'

function focusInplaceEditor(container: HTMLElement | null): void {
  if (!container) return
  const target = container.querySelector<HTMLElement>(INPLACE_FOCUSABLE)
  if (target) {
    target.focus()
    return
  }
  container.focus()
}

export type VueInplaceProps = InstanceType<typeof Inplace>['$props']

export const Inplace = defineComponent({
  name: 'TigerInplace',
  inheritAttrs: false,
  props: {
    editing: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    defaultEditing: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  emits: ['editing-change', 'update:editing'],
  setup(props, { slots, emit, attrs }) {
    const unmanaged = ref(props.defaultEditing)
    const isControlled = computed(() => props.editing !== undefined)
    const editing = computed(() => (isControlled.value ? Boolean(props.editing) : unmanaged.value))
    const inputRef = ref<HTMLElement | null>(null)
    const buttonRef = ref<HTMLButtonElement | null>(null)
    let focusIntent: 'edit' | 'display' | null = null

    function publish(next: boolean, action: 'edit' | 'commit' | 'cancel'): void {
      const state = toggleInplace({ editing: editing.value }, action)
      const value = state.editing && next ? true : state.editing
      if (!isControlled.value) unmanaged.value = value
      emit('editing-change', value)
      emit('update:editing', value)
      focusIntent = value ? 'edit' : 'display'
      void settleFocus()
    }

    async function settleFocus(): Promise<void> {
      const intent = focusIntent
      await nextTick()
      if (!intent || focusIntent !== intent) return
      focusIntent = null
      if (intent === 'edit') focusInplaceEditor(inputRef.value)
      else buttonRef.value?.focus()
    }

    function startEdit(): void {
      if (props.disabled || editing.value) return
      publish(true, 'edit')
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.isComposing || event.defaultPrevented) return
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
          ? h('span', { ref: inputRef, tabindex: -1, onKeydown }, slots.input?.())
          : h(
              'button',
              {
                ref: buttonRef,
                type: 'button',
                class: resolveButtonClasses({
                  variant: 'ghost',
                  size: 'sm',
                  disabled: props.disabled
                }),
                disabled: props.disabled,
                onClick: startEdit
              },
              slots.display?.()
            )
      )
  }
})

export default Inplace
