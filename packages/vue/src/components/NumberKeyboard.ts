import { computed, defineComponent, h, ref, type PropType } from 'vue'
import {
  applyNumberKeyboardInput,
  classNames,
  coerceClassValue,
  deleteNumberKeyboardValue,
  getNumberKeyboardAction,
  getNumberKeyboardKeyClasses,
  getNumberKeyboardKeys,
  mergeStyleValues,
  normalizeNumberKeyboardValue,
  numberKeyboardGridClasses,
  numberKeyboardRootClasses,
  type NumberKeyboardChangePayload,
  type NumberKeyboardKey,
  type NumberKeyboardMode
} from '@expcat/tigercat-core'

export type VueNumberKeyboardProps = InstanceType<typeof NumberKeyboard>['$props']

export const NumberKeyboard = defineComponent({
  name: 'TigerNumberKeyboard',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    mode: { type: String as PropType<NumberKeyboardMode>, default: 'number' },
    maxLength: { type: Number, default: undefined },
    precision: { type: Number, default: undefined },
    decimalSeparator: { type: String, default: '.' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    confirmText: { type: String, default: 'Done' },
    deleteText: { type: String, default: 'Delete' },
    ariaLabel: { type: String, default: 'Number keyboard' },
    showConfirm: { type: Boolean, default: true },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'change', 'key-press', 'delete', 'confirm'],
  setup(props, { attrs, emit }) {
    const innerValue = ref(normalizeNumberKeyboardValue(props.defaultValue))
    const isControlled = computed(() => props.modelValue !== undefined)
    const currentValue = computed(() =>
      isControlled.value ? normalizeNumberKeyboardValue(props.modelValue) : innerValue.value
    )
    const isDisabled = computed(() => props.disabled || props.readonly)
    const keys = computed(() =>
      getNumberKeyboardKeys({
        mode: props.mode,
        decimalSeparator: props.decimalSeparator,
        deleteText: props.deleteText,
        confirmText: props.confirmText,
        showConfirm: props.showConfirm
      })
    )

    function emitChange(nextValue: string, payload: NumberKeyboardChangePayload) {
      if (!isControlled.value) innerValue.value = nextValue
      emit('update:modelValue', nextValue)
      emit('change', nextValue, payload)
    }

    function handleKeyClick(key: NumberKeyboardKey) {
      if (isDisabled.value || key.type === 'empty') return

      const action = getNumberKeyboardAction(key)
      const nextValue =
        action === 'delete'
          ? deleteNumberKeyboardValue(currentValue.value)
          : action === 'input'
            ? applyNumberKeyboardInput(currentValue.value, key.value, {
                mode: props.mode,
                maxLength: props.maxLength,
                precision: props.precision,
                decimalSeparator: props.decimalSeparator
              })
            : currentValue.value

      const payload: NumberKeyboardChangePayload = {
        value: nextValue,
        key: key.value,
        action,
        mode: props.mode
      }

      emit('key-press', key, payload)

      if (action === 'confirm') {
        emit('confirm', currentValue.value, { ...payload, value: currentValue.value })
        return
      }

      if (action === 'delete') emit('delete', nextValue, payload)
      if (nextValue !== currentValue.value) emitChange(nextValue, payload)
    }

    const rootClasses = computed(() =>
      classNames(numberKeyboardRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() =>
      mergeStyleValues(props.style, (attrs as Record<string, unknown>).style)
    )

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      return h(
        'div',
        {
          ...forwardedAttrs,
          class: rootClasses.value,
          style: rootStyle.value,
          role: 'group',
          'aria-label': props.ariaLabel,
          'aria-disabled': isDisabled.value || undefined
        },
        [
          h(
            'div',
            { class: numberKeyboardGridClasses },
            keys.value.map((key, index) =>
              h(
                'button',
                {
                  key: `${key.type}-${key.value}-${index}`,
                  type: 'button',
                  class: getNumberKeyboardKeyClasses(key, isDisabled.value),
                  disabled: isDisabled.value || key.disabled,
                  'aria-label': key.ariaLabel,
                  'data-key': key.value,
                  onClick: () => handleKeyClick(key)
                },
                key.label
              )
            )
          )
        ]
      )
    }
  }
})

export default NumberKeyboard
