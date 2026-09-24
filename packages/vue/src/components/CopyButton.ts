import { defineComponent, h, ref } from 'vue'
import { copyTextToClipboard } from '@expcat/tigercat-core'

export const CopyButton = defineComponent({
  name: 'TigerCopyButton',
  inheritAttrs: false,
  props: {
    text: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: 'Copy' }
  },
  emits: ['copy'],
  setup(props, { slots, emit, attrs }) {
    const failed = ref(false)
    const status = ref('')

    async function onClick(event: MouseEvent): Promise<void> {
      if (props.disabled) return
      const button = event.currentTarget
      const ok = await copyTextToClipboard(props.text)
      failed.value = !ok
      status.value = ok ? 'Copied' : 'Copy failed'
      emit('copy', ok)
      if (button instanceof HTMLElement) button.focus()
    }

    return () =>
      h('span', { ...attrs, 'data-tiger-copy': '' }, [
        h(
          'button',
          {
            type: 'button',
            disabled: props.disabled,
            'aria-invalid': failed.value ? 'true' : undefined,
            'aria-describedby': failed.value ? 'tiger-copy-status' : undefined,
            onClick
          },
          slots.default?.() ?? props.label
        ),
        status.value ? h('span', { id: 'tiger-copy-status', role: 'status' }, status.value) : null
      ])
  }
})

export default CopyButton
