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
  getFormItemFieldClasses,
  getFormItemLabelClasses,
  hasRequiredRule,
  isFormItemGroupControl,
  mergeAriaDescribedBy,
  type ComponentSize,
  type FormItemProps as CoreFormItemProps,
  type InputStatus
} from '@expcat/tigercat-core'
import { useFormContext } from './Form'
import { FormItemControlProvider } from './FormItemContext'
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

  useEffect(() => {
    if (errorMessage && errorMessage !== prevFormErrorRef.current) {
      setShakeTrigger((prev) => prev + 1)
    }
    prevFormErrorRef.current = errorMessage
  }, [errorMessage])

  useEffect(() => {
    if (!name || !formContext) {
      return
    }
    formContext.registerFieldRules(name, rules)
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

  const handleValueChange = useCallback(
    (next: unknown) => {
      if (!name || !formContext) return
      formContext.updateValue(name, next)
      formContext.validateField(name, rules, 'change')
    },
    [name, formContext, rules]
  )

  const handleNativeChange = useCallback(
    (argument?: unknown) => {
      const extracted = extractFormChangeValue(argument)
      if (extracted.found) {
        handleValueChange(extracted.value)
      } else if (name && formContext) {
        formContext.validateField(name, rules, 'change')
      }
    },
    [handleValueChange, name, formContext, rules]
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

  const describedById = effectiveShowMessage && hasError ? errorId : undefined
  const fieldValue = name ? formContext?.getFieldValue(name) : undefined
  const controlDisabled = Boolean(
    formContext?.disabled || formContext?.loading || conditionState.disabled
  )

  const childArray = React.Children.toArray(children)
  const onlyChild = childArray.length === 1 ? childArray[0] : null
  const isNativeElement =
    React.isValidElement<NativeFieldProps>(onlyChild) && typeof onlyChild.type === 'string'
  const nativeId = isNativeElement ? onlyChild.props.id : undefined
  const effectiveFieldId = nativeId ?? fieldId
  const useGroup = childArray.length !== 1
  const isGroupControl = React.isValidElement(onlyChild) && isFormItemGroupControl(onlyChild.type)

  const enhancedChild = useMemo(() => {
    if (!isNativeElement || !React.isValidElement<NativeFieldProps>(onlyChild)) {
      return children
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
    } else if (fieldValue !== undefined) {
      nextProps.value = fieldValue as string
    } else {
      nextProps.value = onlyChild.props.value ?? ''
    }

    return React.cloneElement(onlyChild, nextProps)
  }, [
    isNativeElement,
    onlyChild,
    children,
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
      onBlur: handleBlur
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
      handleBlur
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
    if (!effectiveShowMessage) return null
    if (errorDisplayMode === 'block' && !hasError) return null
    if (errorDisplayMode === 'popup' && !hasError) return null

    const errorClass =
      errorDisplayMode === 'block'
        ? getFormItemErrorBlockClasses(actualSize)
        : errorDisplayMode === 'popup'
          ? classNames(getFormItemErrorPopupClasses(), overlay.floatingClasses)
          : getFormItemErrorClasses(actualSize, { visible: hasError })

    return renderOverlayPortal(
      <div
        ref={errorRef}
        id={hasError ? errorId : undefined}
        role={hasError ? 'alert' : undefined}
        className={errorClass}
        style={errorDisplayMode === 'popup' ? overlay.floatingStyles : undefined}
        data-positioned={errorDisplayMode === 'popup' ? overlay.positioned : undefined}
        aria-hidden={hasError ? undefined : true}>
        {hasError ? errorMessage : ''}
      </div>,
      overlay.target,
      errorDisplayMode !== 'popup'
    )
  })()

  if (!conditionState.shown) {
    return null
  }

  const fieldWrapperProps = useGroup
    ? {
        role: 'group' as const,
        'aria-labelledby': label ? labelId : undefined,
        'aria-describedby': describedById,
        'aria-invalid': hasError ? true : undefined
      }
    : {}

  return (
    <div className={formItemClasses} style={style} {...rest}>
      {label && (
        <label
          id={labelId}
          className={labelClasses}
          style={labelStyles}
          htmlFor={isGroupControl ? undefined : effectiveFieldId}>
          {showAsterisk && <span className={ASTERISK_CLASSES}>*</span>}
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
          <FormItemControlProvider value={controlValue}>{enhancedChild}</FormItemControlProvider>
        </div>
        {errorNode}
      </div>
    </div>
  )
}

FormItem.displayName = 'TigerFormItem'
