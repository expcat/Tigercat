import React, { useContext, useMemo, forwardRef } from 'react'
import {
  classNames,
  defaultRadioColors,
  devWarn,
  getRadioDotClasses,
  getRadioLabelClasses,
  getRadioVisualClasses,
  mergeAriaDescribedBy,
  radioRootBaseClasses,
  resolveRadioInputName,
  type RadioProps as CoreRadioProps
} from '@expcat/tigercat-core'
import { RadioGroupContext } from './RadioGroup'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'

export interface RadioProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'onChange' | 'checked' | 'defaultChecked' | 'value'
    >,
    CoreRadioProps {
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
  className?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    value,
    size,
    disabled,
    name,
    checked,
    defaultChecked = false,
    status: statusProp,
    onChange,
    children,
    className,
    style,
    id,
    onBlur,
    ...props
  },
  ref
) {
  const groupContext = useContext(RadioGroupContext)
  const formItemControl = useFormItemControlContext()
  const isInGroup = !!groupContext

  if (isInGroup && checked !== undefined) {
    devWarn(
      'Radio.groupChecked',
      'Radio inside RadioGroup follows the group value. Per-item `checked` is ignored.'
    )
  }

  const [checkedState, setChecked] = useControlledState<
    boolean,
    [React.ChangeEvent<HTMLInputElement>]
  >({
    value: isInGroup ? undefined : checked,
    defaultValue: defaultChecked,
    onChange
  })

  const actualSize = size || groupContext?.size || 'md'
  const actualDisabled = Boolean(disabled || groupContext?.disabled || formItemControl?.disabled)
  const actualName = resolveRadioInputName(name, groupContext?.name)
  const status = statusProp ?? formItemControl?.status ?? 'default'

  const isChecked = isInGroup ? groupContext!.value === value : checkedState

  const radioClasses = useMemo(
    () =>
      getRadioVisualClasses({
        size: actualSize,
        checked: isChecked,
        disabled: actualDisabled,
        colors: defaultRadioColors
      }),
    [actualSize, isChecked, actualDisabled]
  )

  const dotClasses = useMemo(
    () =>
      getRadioDotClasses({
        size: actualSize,
        checked: isChecked,
        colors: defaultRadioColors
      }),
    [actualSize, isChecked]
  )

  const labelClasses = useMemo(
    () =>
      getRadioLabelClasses({
        size: actualSize,
        disabled: actualDisabled,
        colors: defaultRadioColors
      }),
    [actualSize, actualDisabled]
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (actualDisabled) {
      event.preventDefault()
      return
    }
    const next = event.target.checked
    if (!next) return

    if (isInGroup) {
      groupContext!.onChange(value)
      return
    }

    setChecked(true, event)
    formItemControl?.onChange?.(value)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event)
    if (!isInGroup) formItemControl?.onBlur?.()
  }

  const describedBy = mergeAriaDescribedBy(
    typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
    isInGroup ? undefined : formItemControl?.describedBy
  )
  const effectiveId = isInGroup ? id : (id ?? formItemControl?.id)

  const input = (
    <input
      {...props}
      ref={ref}
      id={effectiveId}
      type="radio"
      className="sr-only peer"
      name={actualName}
      value={value}
      checked={isChecked}
      disabled={actualDisabled}
      aria-invalid={status === 'error' ? true : props['aria-invalid']}
      aria-describedby={describedBy}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )

  const visual = (
    <span className={radioClasses} aria-hidden="true">
      <span className={dotClasses} />
    </span>
  )

  if (!children) {
    return (
      <span className={classNames(radioRootBaseClasses, className)} style={style}>
        {input}
        {visual}
      </span>
    )
  }

  return (
    <label className={classNames(radioRootBaseClasses, className)} style={style}>
      {input}
      {visual}
      <span className={labelClasses}>{children}</span>
    </label>
  )
})

Radio.displayName = 'Radio'
