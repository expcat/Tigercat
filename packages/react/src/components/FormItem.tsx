import React, { useMemo, useEffect, useState, useCallback, useId } from 'react'
import {
  classNames,
  type FormSize,
  type FormItemProps as CoreFormItemProps,
  getFieldError,
  getFormItemClasses,
  getFormItemLabelClasses,
  getFormItemContentClasses,
  getFormItemFieldClasses,
  getFormItemErrorClasses,
  getFormItemAsteriskClasses,
  getFormItemAsteriskStyle
} from '@expcat/tigercat-core'
import { useFormContext } from './Form'

export interface FormItemProps extends CoreFormItemProps {
  /**
   * Form item content
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string
}

export const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  labelWidth,
  required,
  rules,
  error: controlledError,
  showMessage = true,
  size,
  children,
  className
}) => {
  const formContext = useFormContext()
  const [errorMessage, setErrorMessage] = useState<string>('')

  const reactId = useId()
  const baseId = useMemo(() => `tiger-form-item-${reactId}`, [reactId])
  const labelId = `${baseId}-label`
  const fieldId = `${baseId}-field`
  const errorId = `${baseId}-error`

  const mergeAriaDescribedBy = useCallback(
    (existing: string | undefined, next: string | undefined): string | undefined => {
      if (!existing) {
        return next
      }
      if (!next) {
        return existing
      }
      const parts = new Set(
        `${existing} ${next}`
          .split(' ')
          .map((s) => s.trim())
          .filter(Boolean)
      )
      return Array.from(parts).join(' ')
    },
    []
  )

  // Simple logical operations - no need to memoize
  const actualSize: FormSize = size || formContext?.size || 'md'
  const labelPosition = formContext?.labelPosition || 'right'
  const labelAlign = formContext?.labelAlign || 'right'

  const actualLabelWidth = useMemo(() => {
    const width = labelWidth || formContext?.labelWidth
    if (typeof width === 'number') {
      return `${width}px`
    }
    return width
  }, [labelWidth, formContext?.labelWidth])

  const hasRequiredRule = useCallback((maybeRules: unknown): boolean => {
    if (!maybeRules) {
      return false
    }

    const unwrapped =
      typeof maybeRules === 'object' &&
      maybeRules &&
      'value' in (maybeRules as Record<string, unknown>)
        ? (maybeRules as { value?: unknown }).value
        : maybeRules

    const rules = Array.isArray(unwrapped) ? unwrapped : [unwrapped]

    return rules.some((rule) =>
      !!rule && typeof rule === 'object' && 'required' in (rule as Record<string, unknown>)
        ? !!(rule as { required?: boolean }).required
        : false
    )
  }, [])

  const showRequiredAsterisk = useMemo(() => {
    if (required !== undefined) {
      return required
    }

    // Check if any rule has required: true
    if (rules) {
      return hasRequiredRule(rules)
    }

    // Check form-level rules
    if (name && formContext?.rules) {
      const fieldRules = formContext.rules[name]
      if (fieldRules) {
        return hasRequiredRule(fieldRules)
      }
    }

    return false
  }, [required, rules, name, formContext?.rules, hasRequiredRule])

  const isRequired = useMemo(
    () => showRequiredAsterisk && (formContext?.showRequiredAsterisk ?? true),
    [showRequiredAsterisk, formContext?.showRequiredAsterisk]
  )

  // Watch for errors in form context
  useEffect(() => {
    if (name && formContext?.errors) {
      const error = getFieldError(name, formContext.errors)
      setErrorMessage(error || '')
    }
  }, [name, formContext?.errors])

  // Watch for controlled error prop
  useEffect(() => {
    if (controlledError !== undefined) {
      setErrorMessage(controlledError)
    }
  }, [controlledError])

  useEffect(() => {
    if (!name || !formContext) {
      return
    }

    if (rules) {
      formContext.registerFieldRules(name, rules)
    }

    return () => {
      formContext.registerFieldRules(name, undefined)
    }
  }, [name, rules, formContext])

  const handleBlur = useCallback(() => {
    if (name && formContext) {
      formContext.validateField(name, rules, 'blur')
    }
  }, [name, formContext, rules])

  const handleChange = useCallback(() => {
    if (name && formContext) {
      formContext.validateField(name, rules, 'change')
    }
  }, [name, formContext, rules])

  const hasError = useMemo(() => !!errorMessage, [errorMessage])

  const describedById = useMemo(
    () => (showMessage && hasError ? errorId : undefined),
    [showMessage, hasError, errorId]
  )

  type FieldLikeProps = {
    id?: string
    onBlur?: React.FocusEventHandler<unknown>
    onChange?: React.ChangeEventHandler<unknown>
    'aria-invalid'?: boolean | 'true' | 'false'
    'aria-describedby'?: string
    'aria-required'?: boolean | 'true' | 'false'
  }

  const onlyChild = useMemo(() => {
    const count = React.Children.count(children)
    if (count !== 1) {
      return null
    }
    return React.Children.toArray(children)[0] ?? null
  }, [children])

  const isClonableChild = React.isValidElement<FieldLikeProps>(onlyChild)
  const childId = isClonableChild ? onlyChild.props.id : undefined
  const effectiveFieldId = childId ?? fieldId

  const enhancedChild = useMemo(() => {
    if (!isClonableChild) {
      return children
    }

    const nextProps: Partial<FieldLikeProps> = {
      id: effectiveFieldId,
      'aria-invalid': hasError ? true : onlyChild.props['aria-invalid'],
      'aria-required': isRequired ? true : onlyChild.props['aria-required'],
      'aria-describedby': mergeAriaDescribedBy(onlyChild.props['aria-describedby'], describedById),
      onBlur: (event) => {
        onlyChild.props.onBlur?.(event)
        handleBlur()
      },
      onChange: (event) => {
        onlyChild.props.onChange?.(event)
        handleChange()
      }
    }

    return React.cloneElement(onlyChild, nextProps)
  }, [
    isClonableChild,
    children,
    onlyChild,
    effectiveFieldId,
    hasError,
    isRequired,
    mergeAriaDescribedBy,
    describedById,
    handleBlur,
    handleChange
  ])

  const formItemClasses = useMemo(
    () =>
      classNames(
        getFormItemClasses({
          size: actualSize,
          labelPosition,
          hasError,
          disabled: formContext?.disabled
        }),
        className
      ),
    [actualSize, labelPosition, hasError, formContext?.disabled, className]
  )

  const labelClasses = useMemo(
    () =>
      getFormItemLabelClasses({
        size: actualSize,
        labelAlign,
        labelPosition,
        isRequired
      }),
    [actualSize, labelAlign, labelPosition, isRequired]
  )

  const labelStyles = useMemo((): React.CSSProperties => {
    if (labelPosition === 'top') {
      return {}
    }
    return actualLabelWidth ? { width: actualLabelWidth } : {}
  }, [labelPosition, actualLabelWidth])

  const errorClasses = useMemo(
    () =>
      classNames(getFormItemErrorClasses(actualSize), hasError && 'tiger-form-item__error--show'),
    [actualSize, hasError]
  )

  const contentClasses = useMemo(() => getFormItemContentClasses(labelPosition), [labelPosition])

  const fieldClasses = useMemo(() => getFormItemFieldClasses(), [])

  const asteriskClasses = useMemo(() => getFormItemAsteriskClasses(), [])
  const asteriskStyle = useMemo(() => getFormItemAsteriskStyle(), [])

  return (
    <div className={formItemClasses}>
      {label && (
        <label
          id={labelId}
          className={labelClasses}
          style={labelStyles}
          htmlFor={isClonableChild ? effectiveFieldId : undefined}>
          {isRequired && (
            <span className={asteriskClasses} style={asteriskStyle}>
              *
            </span>
          )}
          {label}
        </label>
      )}
      <div className={contentClasses}>
        <div
          className={fieldClasses}
          role="group"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedById}
          aria-invalid={hasError ? true : undefined}
          aria-required={isRequired ? true : undefined}
          onBlur={isClonableChild ? undefined : handleBlur}
          onChange={isClonableChild ? undefined : handleChange}>
          {enhancedChild}
        </div>
        {showMessage && hasError && (
          <div id={errorId} role="alert" className={errorClasses}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}

FormItem.displayName = 'TigerFormItem'
