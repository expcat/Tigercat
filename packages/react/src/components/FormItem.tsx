import React, { useMemo, useEffect, useState, useCallback, useId, useRef } from 'react'
import {
  classNames,
  devWarn,
  extractFormChangeValue,
  getFormItemAsteriskClasses,
  getFormItemClasses,
  getFormItemContentClasses,
  getFormItemErrorBlockClasses,
  getFormItemErrorClasses,
  getFormItemErrorPopupClasses,
  getFormItemErrorSrOnlyClasses,
  getFormItemFieldClasses,
  getFormItemLabelClasses,
  hasRequiredRule,
  isFormItemGroupControl,
  withRequiredRule,
  coerceTextFormValue,
  mergeAriaDescribedBy,
  type ComponentSize,
  type FormItemProps as CoreFormItemProps,
  type InputStatus
} from '@expcat/tigercat-core'
import { schemaFormExtraClasses } from '@expcat/tigercat-core/schema-form'
import { useFormContext } from './Form'
import { FormItemControlProvider } from './FormItemContext'
export { useFormItemControlContext } from './FormItemContext'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

export interface FormItemProps extends CoreFormItemProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

type NativeFieldProps = {
  id?: string
  name?: string
  type?: string
  value?: unknown
  checked?: boolean
  disabled?: boolean
  onBlur?: React.FocusEventHandler<HTMLElement>
  onChange?: React.ChangeEventHandler<HTMLElement>
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-describedby'?: string
  'aria-required'?: boolean | 'true' | 'false'
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
  style,
  condition,
  extra,
  disabled = false,
  ...rest
}) => {
  const formContext = useFormContext()
  const [shakeTrigger, setShakeTrigger] = useState(0)
  const [popupActive, setPopupActive] = useState(false)
  const prevFormErrorRef = useRef<string>('')
  const contentRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const reactId = useId()
  const baseId = `tiger-form-item-${reactId}`
  const labelId = `${baseId}-label`
  const fieldId = `${baseId}-field`
  const errorId = `${baseId}-error`

  const actualSize: ComponentSize = size || formContext?.size || 'md'
  const labelPosition = formContext?.labelPosition || 'left'
  const labelAlign = formContext?.labelAlign

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

  const fieldIsRequired = useMemo(() => {
    if (required !== undefined) return required
    if (hasRequiredRule(rules)) return true
    if (name && hasRequiredRule(formContext?.rules?.[name])) return true
    return conditionState.required
  }, [required, rules, name, formContext?.rules, conditionState.required])

  const showAsterisk = fieldIsRequired && (formContext?.showRequiredAsterisk ?? true)

  const formError = name ? formContext?.errorsByField[name] : undefined
  const errorMessage = controlledError !== undefined ? controlledError : (formError ?? '')
  const hasError = !!errorMessage
  const itemRules = useMemo(
    () => (required ? withRequiredRule(rules) : rules),
    [required, rules]
  )
  const formContextRef = useRef(formContext)
  formContextRef.current = formContext

  useEffect(() => {
    if (errorMessage && errorMessage !== prevFormErrorRef.current) {
      setShakeTrigger((prev) => prev + 1)
    }
    prevFormErrorRef.current = errorMessage
  }, [errorMessage])

  const controlDisabled = Boolean(
    disabled || formContext?.disabled || formContext?.loading || conditionState.disabled
  )

  useEffect(() => {
    const ctx = formContextRef.current
    if (!name || !ctx) return undefined
    ctx.registerFieldRules(name, itemRules)
    ctx.registerFieldCondition(name, condition)
    ctx.registerFieldDisabled(name, controlDisabled)
    return () => {
      const current = formContextRef.current
      current?.registerFieldRules(name, undefined)
      current?.registerFieldCondition(name, undefined)
      current?.registerFieldDisabled(name, null)
    }
  }, [name, itemRules, condition, controlDisabled])

  const handleBlur = useCallback(() => {
    const ctx = formContextRef.current
    if (name && ctx) {
      ctx.validateField(name, itemRules, 'blur')
    }
  }, [name, itemRules])

  const handleValueChange = useCallback(
    (next: unknown) => {
      const ctx = formContextRef.current
      if (!name || !ctx) return
      ctx.updateValue(name, next)
      ctx.validateField(name, itemRules, 'change')
    },
    [name, itemRules]
  )

  const handleNativeChange = useCallback(
    (argument?: unknown) => {
      const extracted = extractFormChangeValue(argument)
      const ctx = formContextRef.current
      if (extracted.found) {
        handleValueChange(extracted.value)
      } else if (name && ctx) {
        ctx.validateField(name, itemRules, 'change')
      }
    },
    [handleValueChange, name, itemRules]
  )

  const setError = useCallback(
    (message: string | null) => {
      const ctx = formContextRef.current
      if (!name || !ctx) return
      ctx.setFieldError(name, message)
    },
    [name]
  )

  const effectiveShowMessage = showMessage && (formContext?.inlineMessage ?? true)
  const popupErrorVisible =
    effectiveShowMessage && hasError && errorDisplayMode === 'popup' && popupActive
  const overlay = useAnchoredOverlay({
    enabled: popupErrorVisible,
    referenceRef: contentRef,
    floatingRef: errorRef,
    placement: 'bottom-start',
    offset: 4
  })

  const describedById = hasError ? errorId : undefined
  const fieldValue = name ? formContext?.getFieldValue(name) : undefined

  const childArray = React.Children.toArray(children)
  const onlyChild = childArray[0] ?? null
  const isNativeElement =
    React.isValidElement<NativeFieldProps>(onlyChild) && typeof onlyChild.type === 'string'
  const nativeId = isNativeElement ? onlyChild.props.id : undefined
  const effectiveFieldId = nativeId ?? fieldId
  const useGroup = childArray.length !== 1
  const isGroupControl = React.isValidElement(onlyChild) && isFormItemGroupControl(onlyChild.type)

  const enhancedChild = useMemo(() => {
    if (!isNativeElement || !React.isValidElement<NativeFieldProps>(onlyChild)) {
      return onlyChild
    }

    const nativeType =
      typeof onlyChild.props.type === 'string' ? onlyChild.props.type.toLowerCase() : ''
    const nextProps: Partial<NativeFieldProps> = {
      id: effectiveFieldId,
      name: onlyChild.props.name ?? name,
      'aria-invalid': hasError ? true : onlyChild.props['aria-invalid'],
      'aria-required': fieldIsRequired ? true : onlyChild.props['aria-required'],
      disabled: controlDisabled ? true : onlyChild.props.disabled,
      'aria-describedby': mergeAriaDescribedBy(onlyChild.props['aria-describedby'], describedById),
      onBlur: (event) => {
        onlyChild.props.onBlur?.(event)
        handleBlur()
      },
      onChange: (event) => {
        onlyChild.props.onChange?.(event)
        handleNativeChange(event)
      }
    }

    if (nativeType === 'checkbox') {
      nextProps.checked = Boolean(fieldValue)
    } else if (nativeType === 'radio') {
      nextProps.checked = onlyChild.props.value === fieldValue
    } else {
      nextProps.value = coerceTextFormValue(fieldValue ?? onlyChild.props.value ?? '')
    }

    return React.cloneElement(onlyChild, nextProps)
  }, [
    isNativeElement,
    onlyChild,
    effectiveFieldId,
    name,
    hasError,
    fieldIsRequired,
    controlDisabled,
    describedById,
    handleBlur,
    handleNativeChange,
    fieldValue
  ])

  useEffect(() => {
    if (useGroup && name) {
      devWarn(
        'FormItem.multipleControls',
        'FormItem supports a single field control. Extra children do not receive value or validation bindings.'
      )
    }
  }, [useGroup, name])

  const controlValue = useMemo(
    () => ({
      id: effectiveFieldId,
      labelId: label ? labelId : undefined,
      name,
      status: (hasError ? 'error' : undefined) as InputStatus | undefined,
      shakeTrigger: hasError ? shakeTrigger : undefined,
      disabled: controlDisabled,
      describedBy: describedById,
      required: fieldIsRequired,
      value: name ? (fieldValue ?? '') : fieldValue,
      onChange: handleValueChange,
      onBlur: handleBlur,
      setError
    }),
    [
      effectiveFieldId,
      label,
      labelId,
      name,
      hasError,
      shakeTrigger,
      controlDisabled,
      describedById,
      fieldIsRequired,
      fieldValue,
      handleValueChange,
      handleBlur,
      setError
    ]
  )

  const formItemClasses = classNames(
    getFormItemClasses({
      size: actualSize,
      labelPosition,
      hasError,
      disabled: controlDisabled
    }),
    className
  )

  const labelClasses = getFormItemLabelClasses({
    size: actualSize,
    labelAlign,
    labelPosition,
    isRequired: showAsterisk
  })

  const labelStyles: React.CSSProperties =
    labelPosition === 'top' ? {} : actualLabelWidth ? { width: actualLabelWidth } : {}

  const errorNode = (() => {
    if (!hasError) return null
    const announcement = formContext?.errorAnnouncement ?? 'polite'
    const popupOpen = effectiveShowMessage && errorDisplayMode === 'popup' && popupActive
    const hidden = !effectiveShowMessage || (errorDisplayMode === 'popup' && !popupOpen)
    const errorClass = hidden
      ? getFormItemErrorSrOnlyClasses()
      : errorDisplayMode === 'block'
        ? getFormItemErrorBlockClasses(actualSize)
        : errorDisplayMode === 'popup'
          ? classNames(getFormItemErrorPopupClasses(), overlay.floatingClasses)
          : getFormItemErrorClasses(actualSize, { visible: true })
    const node = (
      <div
        ref={errorRef}
        id={errorId}
        aria-live={announcement}
        role={announcement === 'assertive' ? 'alert' : 'status'}
        className={errorClass}
        style={popupOpen ? overlay.floatingStyles : undefined}
        data-positioned={popupOpen ? overlay.positioned : undefined}>
        {errorMessage}
      </div>
    )
    if (!popupOpen) return node
    return renderOverlayPortal(node, overlay.target, false)
  })()

  if (!conditionState.shown) {
    return null
  }

  const fieldWrapperProps = useGroup && label ? { 'aria-labelledby': labelId } : {}

  return (
    <div className={formItemClasses} style={style} {...rest}>
      {label && (
        <label
          id={labelId}
          className={labelClasses}
          style={labelStyles}
          htmlFor={isGroupControl ? undefined : effectiveFieldId}>
          {showAsterisk && (
            <span className={ASTERISK_CLASSES} aria-hidden="true">
              *
            </span>
          )}
          {label}
        </label>
      )}
      <div
        ref={contentRef}
        className={classNames(
          getFormItemContentClasses(labelPosition),
          errorDisplayMode === 'popup' && 'relative'
        )}
        onMouseEnter={() => setPopupActive(true)}
        onMouseLeave={() => setPopupActive(false)}
        onFocus={() => setPopupActive(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPopupActive(false)
          }
        }}>
        <div className={FIELD_CLASSES} {...fieldWrapperProps}>
          {enhancedChild ? (
            <FormItemControlProvider value={controlValue}>{enhancedChild}</FormItemControlProvider>
          ) : null}
          {childArray.slice(1)}
        </div>
        {extra ? <p className={schemaFormExtraClasses}>{extra}</p> : null}
        {errorNode}
      </div>
    </div>
  )
}

FormItem.displayName = 'TigerFormItem'
