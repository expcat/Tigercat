import { defineComponent, computed, h, inject, ref, watch, type PropType } from 'vue'
import {
  type ComponentSize,
  type InputStatus,
  callUnknownEventHandler,
  coerceClassValue,
  getSwitchRootClasses,
  getSwitchThumbClasses,
  getSwitchTrackClasses,
  mergeAriaDescribedBy,
  mergeStyleValues,
  runShakeAnimation
} from '@expcat/tigercat-core'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export interface VueSwitchProps {
  modelValue?: boolean
  defaultValue?: boolean
  disabled?: boolean
  size?: ComponentSize
  name?: string
  value?: string
  status?: InputStatus
  className?: string
  style?: Record<string, string | number>
}

export const Switch = defineComponent({
  name: 'TigerSwitch',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    defaultValue: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md' as ComponentSize
    },
    name: {
      type: String
    },
    value: {
      type: String,
      default: 'on'
    },
    status: {
      type: String as PropType<InputStatus>
    },
    className: {
      type: String
    },
    style: {
      type: Object as PropType<Record<string, string | number>>
    }
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    change: (value: boolean) => typeof value === 'boolean'
  },
  setup(props, { emit, attrs, slots, expose }) {
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const internalChecked = ref(props.defaultValue)
    const isControlled = computed(() => props.modelValue !== undefined)
    const checked = computed(() =>
      isControlled.value ? props.modelValue === true : internalChecked.value
    )
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const inputRef = ref<HTMLInputElement | null>(null)
    const rootRef = ref<HTMLLabelElement | null>(null)

    expose({
      focus: () => inputRef.value?.focus(),
      el: inputRef
    })

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      ([nextStatus], oldValue) => {
        if (oldValue === undefined) return
        if (nextStatus === 'error') runShakeAnimation(rootRef.value)
      },
      { flush: 'post' }
    )

    let skipToggle = false

    const handleClick = (event: MouseEvent) => {
      callUnknownEventHandler(attrs.onClick, event)
      if (event.defaultPrevented) skipToggle = true
    }

    const handleChange = (event: Event) => {
      if (effectiveDisabled.value) return
      if (skipToggle) {
        skipToggle = false
        return
      }
      const next = (event.target as HTMLInputElement).checked
      if (!isControlled.value) internalChecked.value = next
      emit('update:modelValue', next)
      emit('change', next)
      formItemControl?.onChange(next)
    }

    const handleBlur = (event: FocusEvent) => {
      callUnknownEventHandler(attrs.onBlur, event)
      formItemControl?.onBlur()
    }

    return () => {
      const {
        class: _class,
        style: _style,
        onClick: _onClick,
        onBlur: _onBlur,
        ...restAttrs
      } = attrs
      const attrId = typeof restAttrs.id === 'string' ? restAttrs.id : undefined
      const attrName = typeof restAttrs.name === 'string' ? restAttrs.name : undefined
      const describedBy = mergeAriaDescribedBy(
        typeof restAttrs['aria-describedby'] === 'string'
          ? (restAttrs['aria-describedby'] as string)
          : undefined,
        formItemControl?.describedBy.value
      )

      return h(
        'label',
        {
          ref: rootRef,
          class: getSwitchRootClasses(
            effectiveDisabled.value,
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: mergeStyleValues(attrs.style, props.style)
        },
        [
          h('span', { class: 'relative inline-flex items-center' }, [
            h('input', {
              ...restAttrs,
              ref: inputRef,
              id: attrId ?? formItemControl?.id.value,
              name: props.name ?? attrName ?? formItemControl?.name.value,
              type: 'checkbox',
              role: 'switch',
              class: 'sr-only peer',
              checked: checked.value,
              disabled: effectiveDisabled.value,
              value: props.value,
              'aria-disabled': effectiveDisabled.value || undefined,
              'aria-checked': checked.value,
              'aria-invalid': status.value === 'error' ? true : restAttrs['aria-invalid'],
              'aria-required': formItemControl?.required.value ? true : restAttrs['aria-required'],
              'aria-describedby': describedBy,
              onClick: handleClick,
              onChange: handleChange,
              onBlur: handleBlur
            }),
            h(
              'span',
              {
                class: getSwitchTrackClasses(
                  props.size,
                  checked.value,
                  effectiveDisabled.value,
                  status.value
                ),
                'aria-hidden': 'true'
              },
              [h('span', { class: getSwitchThumbClasses(props.size, checked.value) })]
            )
          ]),
          slots.default?.()
        ]
      )
    }
  }
})

export default Switch
