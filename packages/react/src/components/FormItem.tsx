import React, { useMemo, useEffect, useState, useCallback, useId, useRef } from 'react'
import {
  classNames,
  type InputStatus,
  type ComponentSize,
  type FormRule,
  type FormItemProps as CoreFormItemProps,
  getFormItemClasses,
  getFormItemLabelClasses,
  getFormItemContentClasses,
  getFormItemFieldClasses,
  getFormItemErrorClasses,
  getFormItemAsteriskClasses
} from '@expcat/tigercat-core'
import { useFormContext } from './Form'
import { FormItemControlProvider } from './FormItemContext'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

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

type FieldLikeProps = {
  id?: string
  status?: string
  errorMessage?: string
  _shakeTrigger?: number
  onBlur?: React.FocusEventHandler<unknown>
  onChange?: React.ChangeEventHandler<unknown>
  disabled?: boolean
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-describedby'?: string
  'aria-required'?: boolean | 'true' | 'false'
}

function hasRequiredRule(maybeRules: FormRule | FormRule[] | undefined): boolean {
  if (!maybeRules) return false
  const ruleArr = Array.isArray(maybeRules) ? maybeRules : [maybeRules]
  return ruleArr.some((rule) => !!rule && typeof rule === 'object' && !!rule.required)
}

function mergeAriaDescribedBy(
  existing: string | undefined,
  next: string | undefined
): string | undefined {
  if (!existing) return next
  if (!next) return existing
  const parts = new Set(
    `${existing} ${next}`
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean)
  )
  return Array.from(parts).join(' ')
}

const FIELD_CLASSES = getFormItemFieldClasses()
const ASTERISK_CLASSES = getFormItemAsteriskClasses()

export const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  labelWidth,
  required,
  rules,
  error: controlledError,
  showMessage = true,
  errorDisplayMode = 'inline',
  size,
  children,
  className,
  condition
}) => {
  const formContext = useFormContext()
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [shakeTrigger, setShakeTrigger] = useState(0)
  const prevFormErrorRef = useRef<string>('')
  const contentRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const reactId = useId()
  const baseId = `tiger-form-item-${reactId}`
  const labelId = `${baseId}-label`
  const fieldId = `${baseId}-field`
  const errorId = `${baseId}-error`

  // Simple logical operations - no need to memoize
  const actualSize: ComponentSize = size || formContext?.size || 'md'
  const labelPosition = formContext?.labelPosition || 'right'
  const labelAlign = formContext?.labelAlign || 'right'

  const conditionState = useMemo(() => {
    if (!name || !formContext) {
      return { shown: true, disabled: false, required: false }
    }
    return formContext.getFieldConditionState(name, condition)
  }, [name, formContext, condition])

  const actualLabelWidth = useMemo(() => {
    const width = labelWidth || formContext?.labelWidth
    if (typeof width === 'number') {
      return `${width}px`
    }
    return width
  }, [labelWidth, formContext?.labelWidth])

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
  }, [required, rules, name, formContext?.rules])

  const isRequired = useMemo(
    () =>
      (showRequiredAsterisk || conditionState.required) &&
      (formContext?.showRequiredAsterisk ?? true),
    [showRequiredAsterisk, conditionState.required, formContext?.showRequiredAsterisk]
  )

  // Watch for errors in form context
  useEffect(() => {
    if (name && formContext?.errorsByField) {
      const error = formContext.errorsByField[name] || ''
      setErrorMessage(error)
      // Only trigger shake when error is newly set (transition from no-error to error,
      // or error message changes). Prevents re-shaking unrelated fields when another
      // field's validation updates the shared errors array.
      if (error && error !== prevFormErrorRef.current) {
        setShakeTrigger((prev) => prev + 1)
      }
      prevFormErrorRef.current = error
    }
  }, [name, formContext?.errorsByField])

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

    formContext.registerFieldCondition(name, condition)

    return () => {
      formContext.registerFieldRules(name, undefined)
      formContext.registerFieldCondition(name, undefined)
    }
  }, [name, rules, condition, formContext])

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

  const hasError = !!errorMessage
  const popupErrorVisible = showMessage && hasError && errorDisplayMode === 'popup'
  const overlay = useAnchoredOverlay({
    enabled: popupErrorVisible,
    referenceRef: contentRef,
    floatingRef: errorRef,
    placement: 'bottom-start',
    offset: 4
  })

  const describedById = useMemo(
    () => (showMessage && hasError ? errorId : undefined),
    [showMessage, hasError, errorId]
  )

  const onlyChild = useMemo(() => {
    const count = React.Children.count(children)
    if (count !== 1) {
      return null
    }
    return React.Children.toArray(children)[0] ?? null
  }, [children])

  const isClonableChild = React.isValidElement<FieldLikeProps>(onlyChild)
  const isNativeElement = isClonableChild && typeof onlyChild.type === 'string'
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
      disabled: conditionState.disabled || formContext?.disabled ? true : onlyChild.props.disabled,
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

    if (!isNativeElement) {
      nextProps.status = hasError ? 'error' : onlyChild.props.status
    }

    return React.cloneElement(onlyChild, nextProps)
  }, [
    isClonableChild,
    children,
    onlyChild,
    effectiveFieldId,
    hasError,
    isRequired,
    conditionState.disabled,
    formContext?.disabled,
    isNativeElement,
    describedById,
    handleBlur,
    handleChange
  ])

  const controlValue = useMemo(
    () => ({
      status: (hasError ? 'error' : undefined) as InputStatus | undefined,
      errorMessage: hasError && !showMessage ? errorMessage : undefined,
      shakeTrigger: hasError ? shakeTrigger : undefined
    }),
    [hasError, showMessage, errorMessage, shakeTrigger]
  )

  const formItemClasses = useMemo(
    () =>
      classNames(
        getFormItemClasses({
          size: actualSize,
          labelPosition,
          hasError,
          disabled: formContext?.disabled || conditionState.disabled
        }),
        className
      ),
    [actualSize, labelPosition, hasError, formContext?.disabled, conditionState.disabled, className]
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
    () => classNames(getFormItemErrorClasses(actualSize), hasError && 'opacity-100'),
    [actualSize, hasError]
  )

  const contentClasses = useMemo(
    () =>
      classNames(
        getFormItemContentClasses(labelPosition),
        errorDisplayMode === 'popup' && 'relative'
      ),
    [labelPosition, errorDisplayMode]
  )

  if (!conditionState.shown) {
    return null
  }

  return (
    <div className={formItemClasses}>
      {label && (
        <label
          id={labelId}
          className={labelClasses}
          style={labelStyles}
          htmlFor={isClonableChild ? effectiveFieldId : undefined}>
          {isRequired && <span className={ASTERISK_CLASSES}>*</span>}
          {label}
        </label>
      )}
      <div ref={contentRef} className={contentClasses}>
        <div
          className={FIELD_CLASSES}
          role="group"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedById}
          aria-invalid={hasError ? true : undefined}
          onBlur={isClonableChild ? undefined : handleBlur}
          onChange={isClonableChild ? undefined : handleChange}>
          <FormItemControlProvider value={controlValue}>{enhancedChild}</FormItemControlProvider>
        </div>
        {showMessage &&
          renderOverlayPortal(
            <div
              ref={errorRef}
              id={hasError ? errorId : undefined}
              role={hasError ? 'alert' : undefined}
              className={
                errorDisplayMode === 'block'
                  ? classNames(
                      'mt-1 p-2 rounded bg-red-50 border border-red-200 text-red-600 text-sm',
                      !hasError && 'hidden'
                    )
                  : errorDisplayMode === 'popup'
                    ? classNames(
                        'px-2 py-1 rounded bg-red-600 text-white text-xs shadow-lg',
                        overlay.floatingClasses,
                        !hasError && 'hidden'
                      )
                    : errorClasses
              }
              style={errorDisplayMode === 'popup' ? overlay.floatingStyles : undefined}
              data-positioned={errorDisplayMode === 'popup' ? overlay.positioned : undefined}
              aria-hidden={hasError ? undefined : true}>
              {hasError ? errorMessage : ''}
            </div>,
            overlay.target,
            errorDisplayMode !== 'popup'
          )}
      </div>
    </div>
  )
}

FormItem.displayName = 'TigerFormItem'
