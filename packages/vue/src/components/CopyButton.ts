import { defineComponent, h, ref, useId } from 'vue'
import {
  classNames,
  coerceClassValue,
  copyTextToClipboard,
  getSpaceClasses,
  getTextLabels,
  resolveButtonClasses
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export type VueCopyButtonProps = InstanceType<typeof CopyButton>['$props']

export const CopyButton = defineComponent({
  name: 'TigerCopyButton',
  inheritAttrs: false,
  props: {
    text: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: undefined }
  },
  emits: ['copy'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const statusId = `tiger-copy-status-${useId()}`
    const status = ref<'copied' | 'failed' | null>(null)

    async function onClick(event: MouseEvent): Promise<void> {
      if (props.disabled) return
      const button = event.currentTarget
      const ok = await copyTextToClipboard(props.text)
      status.value = ok ? 'copied' : 'failed'
      emit('copy', ok)
      if (button instanceof HTMLElement) button.focus()
    }

    return () =>
      h(
        'span',
        {
          ...attrs,
          class: classNames(
            getSpaceClasses({ size: 'sm', align: 'center' }),
            coerceClassValue(attrs.class)
          ),
          'data-tiger-copy': ''
        },
        [
          h(
            'button',
            {
              type: 'button',
              class: resolveButtonClasses({
                variant: 'outline',
                size: 'sm',
                disabled: props.disabled
              }),
              disabled: props.disabled,
              'aria-invalid': status.value === 'failed' ? 'true' : undefined,
              'aria-describedby': status.value === 'failed' ? statusId : undefined,
              onClick
            },
            slots.default?.() ?? props.label ?? getTextLabels(config.value.locale).copyLabel
          ),
          status.value
            ? h(
                'span',
                { id: statusId, role: 'status' },
                status.value === 'copied'
                  ? getTextLabels(config.value.locale).copiedLabel
                  : getTextLabels(config.value.locale).copyFailedLabel
              )
            : null
        ]
      )
  }
})

export default CopyButton
