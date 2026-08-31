import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import {
  classNames,
  checkboxCheckPathD,
  checkboxIconSizeClasses,
  checkboxIconViewBox,
  checkboxIndeterminatePathD,
  checkboxGroupIncludes,
  devWarn,
  getCheckboxLabelClasses,
  getCheckboxLabelTextClasses,
  getCheckboxVisualClasses,
  mergeAriaDescribedBy,
  runShakeAnimation,
  type CheckboxProps as CoreCheckboxProps,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { useCheckboxGroup } from './CheckboxGroup'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'

export interface CheckboxProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'onChange' | 'checked' | 'defaultChecked' | 'value'
    >,
    CoreCheckboxProps {
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked: controlledChecked,
    defaultChecked = false,
    value,
    size: propSize,
    disabled: propDisabled,
    indeterminate = false,
    status: statusProp,
    onChange,
    children,
    className,
    id,
    name,
    onBlur,
    ...props
  },
  ref
) {
  const groupContext = useCheckboxGroup()
  const formItemControl = useFormItemControlContext()
  const inGroup = Boolean(groupContext)

  if (inGroup && value === undefined) {
    devWarn(
      'Checkbox.groupValue',
      'Checkbox inside CheckboxGroup must set `value`. Independent `checked` is ignored while grouped.'
    )
  }

  const [checkedState, setChecked] = useControlledState({
    value: inGroup ? undefined : controlledChecked,
    defaultValue: defaultChecked,
    onChange
  })

  const effectiveSize: ComponentSize = propSize || groupContext?.size || 'md'
  const effectiveDisabled = Boolean(
    propDisabled || groupContext?.disabled || formItemControl?.disabled
  )
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const shakeTrigger = formItemControl?.shakeTrigger
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name

  const checked = inGroup
    ? value !== undefined && checkboxGroupIncludes(groupContext!.value, value)
    : checkedState

  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLLabelElement>(null)

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [])

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  useEffect(() => {
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, shakeTrigger])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (effectiveDisabled) return
    const next = event.target.checked
    if (inGroup && value !== undefined) {
      groupContext!.updateValue(value, next)
      return
    }
    setChecked(next, event)
    formItemControl?.onChange?.(next)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event)
    formItemControl?.onBlur?.()
  }

  const describedBy = mergeAriaDescribedBy(
    typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )

  const visual = (
    <span
      className={getCheckboxVisualClasses({
        size: effectiveSize,
        checked,
        indeterminate,
        disabled: effectiveDisabled,
        status
      })}
      aria-hidden="true">
      {(checked || indeterminate) && (
        <svg
          className={checkboxIconSizeClasses[effectiveSize]}
          viewBox={checkboxIconViewBox}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d={indeterminate ? checkboxIndeterminatePathD : checkboxCheckPathD} />
        </svg>
      )}
    </span>
  )

  const input = (
    <input
      {...props}
      ref={inputRef}
      id={effectiveId}
      name={effectiveName}
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      disabled={effectiveDisabled}
      value={typeof value === 'boolean' ? String(value) : (value as string | number | undefined)}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-invalid={status === 'error' ? true : props['aria-invalid']}
      aria-required={formItemControl?.required || props['aria-required'] ? true : undefined}
      aria-describedby={describedBy}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )

  return (
    <label
      ref={rootRef}
      className={classNames(getCheckboxLabelClasses(effectiveSize, effectiveDisabled), className)}>
      {input}
      {visual}
      {children != null && children !== false && (
        <span className={getCheckboxLabelTextClasses(effectiveSize, effectiveDisabled)}>
          {children}
        </span>
      )}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'
