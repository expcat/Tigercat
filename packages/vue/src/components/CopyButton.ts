import { defineComponent, h, mergeProps, ref, useId } from 'vue'
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

    async function onClick(): Promise<void> {
      if (props.disabled) return
      const ok = await copyTextToClipboard(props.text)
      status.value = ok ? 'copied' : 'failed'
      emit('copy', ok)
    }

    return () => {
      const { class: wrapperClass, style: wrapperStyle, ...buttonAttrs } = attrs
      return h(
        'span',
        {
          class: classNames(
            getSpaceClasses({ size: 'sm', align: 'center' }),
            coerceClassValue(wrapperClass)
          ),
          style: wrapperStyle,
          'data-tiger-copy': ''
        },
        [
          h(
            'button',
            mergeProps({ type: 'button' }, buttonAttrs, {
              class: resolveButtonClasses({
                variant: 'outline',
                size: 'sm',
                disabled: props.disabled
              }),
              disabled: props.disabled,
              'aria-invalid': status.value === 'failed' ? 'true' : buttonAttrs['aria-invalid'],
              'aria-describedby':
                status.value === 'failed'
                  ? [buttonAttrs['aria-describedby'], statusId].filter(Boolean).join(' ')
                  : buttonAttrs['aria-describedby'],
              onClick
            }),
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
  }
})

export default CopyButton
