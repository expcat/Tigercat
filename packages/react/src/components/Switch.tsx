import React, { forwardRef, useEffect, useRef } from 'react'
import {
  type SwitchProps as CoreSwitchProps,
  getSwitchRootClasses,
  getSwitchThumbClasses,
  getSwitchTrackClasses,
  mergeAriaDescribedBy,
  runShakeAnimation,
  type InputStatus
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'

export interface SwitchProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'onChange' | 'size' | 'value' | 'defaultChecked' | 'checked' | 'type'
    >,
    CoreSwitchProps {
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  children?: React.ReactNode
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    checked: checkedProp,
    defaultChecked,
    disabled = false,
    size = 'md',
    name,
    value = 'on',
    status: statusProp,
    onChange,
    className,
    onClick,
    children,
    id,
    onBlur,
    ...props
  },
  ref
) {
  const formItemControl = useFormItemControlContext()
  const [checked, setChecked] = useControlledState({
    value: checkedProp,
    defaultValue: defaultChecked ?? false,
    onChange
  })
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const shakeTrigger = formItemControl?.shakeTrigger
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const rootRef = useRef<HTMLLabelElement>(null)

  useEffect(() => {
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, shakeTrigger])

  const skipToggleRef = useRef(false)

  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) skipToggleRef.current = true
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (effectiveDisabled) return
    if (skipToggleRef.current) {
      skipToggleRef.current = false
      return
    }
    const next = event.target.checked
    setChecked(next)
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

  return (
    <label ref={rootRef} className={getSwitchRootClasses(effectiveDisabled, className)}>
      <span className="relative inline-flex items-center">
        <input
          {...props}
          ref={ref}
          id={effectiveId}
          name={effectiveName}
          type="checkbox"
          role="switch"
          className="sr-only peer"
          checked={checked}
          disabled={effectiveDisabled}
          value={value}
          aria-checked={checked}
          aria-invalid={status === 'error' ? true : props['aria-invalid']}
          aria-required={formItemControl?.required || props['aria-required'] ? true : undefined}
          aria-describedby={describedBy}
          onClick={handleClick}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <span
          className={getSwitchTrackClasses(size, checked, effectiveDisabled, status)}
          aria-hidden="true">
          <span className={getSwitchThumbClasses(size, checked)} />
        </span>
      </span>
      {children}
    </label>
  )
})

Switch.displayName = 'Switch'
