import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  classNames,
  type FormProps as CoreFormProps,
  type FormRules,
  type FormValues,
  type FormError,
  type FormLabelPosition,
  type FormLabelAlign,
  type FormSize,
  type FormRule,
  type FormRuleTrigger,
  validateForm,
  validateField as validateFieldUtil,
  getValueByPath,
} from "@tigercat/core";

// Form context type
export interface FormContextValue {
  model: FormValues;
  rules?: FormRules;
  labelWidth?: string | number;
  labelPosition: FormLabelPosition;
  labelAlign: FormLabelAlign;
  size: FormSize;
  inlineMessage: boolean;
  showRequiredAsterisk: boolean;
  disabled: boolean;
  errors: FormError[];
  registerFieldRules: (
    fieldName: string,
    rules?: FormRule | FormRule[]
  ) => void;
  validateField: (
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger
  ) => Promise<void>;
  clearValidate: (fieldNames?: string | string[]) => void;
  updateValue: (fieldName: string, value: unknown) => void;
}

// Form context
const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  return context;
};

// Form handle type for imperative methods
export interface FormHandle {
  validate: () => Promise<boolean>;
  validateField: (
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger
  ) => Promise<void>;
  clearValidate: (fieldNames?: string | string[]) => void;
  resetFields: () => void;
}

// Form submit event
export interface FormSubmitEvent {
  valid: boolean;
  values: FormValues;
  errors: FormError[];
}

export interface FormProps extends CoreFormProps {
  /**
   * Form content
   */
  children?: React.ReactNode;

  /**
   * Submit handler
   */
  onSubmit?: (event: FormSubmitEvent) => void;

  /**
   * Validation handler
   */
  onValidate?: (
    fieldName: string,
    valid: boolean,
    error?: string | null
  ) => void;

  /**
   * Value change handler
   */
  onChange?: (values: FormValues) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Form = forwardRef<FormHandle, FormProps>(
  (
    {
      model = {},
      rules,
      labelWidth,
      labelPosition = "right",
      labelAlign = "right",
      size = "md",
      inlineMessage = true,
      showRequiredAsterisk = true,
      disabled = false,
      children,
      onSubmit,
      onValidate,
      onChange,
      className,
      ...props
    },
    ref
  ) => {
    const [errors, setErrors] = useState<FormError[]>([]);
    const [formValues, setFormValues] = useState<FormValues>(model);
    const fieldRulesRef = React.useRef<FormRules>({});

    // Update form values when model changes
    React.useEffect(() => {
      setFormValues(model);
    }, [model]);

    const registerFieldRules = useCallback(
      (fieldName: string, nextRules?: FormRule | FormRule[]) => {
        if (!fieldName) {
          return;
        }

        if (!nextRules) {
          delete fieldRulesRef.current[fieldName];
          return;
        }

        fieldRulesRef.current[fieldName] = nextRules;
      },
      []
    );

    const getEffectiveRules = useCallback((): FormRules | undefined => {
      const fromForm = rules ?? {};
      const fromItems = fieldRulesRef.current;
      const merged = { ...fromForm, ...fromItems };
      return Object.keys(merged).length > 0 ? merged : undefined;
    }, [rules]);

    const validateField = useCallback(
      async (
        fieldName: string,
        rulesOverride?: FormRule | FormRule[],
        trigger?: FormRuleTrigger
      ): Promise<void> => {
        const fieldRules =
          rulesOverride ??
          fieldRulesRef.current[fieldName] ??
          rules?.[fieldName];

        if (!fieldRules) {
          return;
        }

        const value = getValueByPath(formValues, fieldName);
        const error = await validateFieldUtil(
          fieldName,
          value,
          fieldRules,
          formValues,
          trigger
        );

        setErrors((prevErrors) => {
          // Remove existing errors for this field
          const filtered = prevErrors.filter((e) => e.field !== fieldName);

          // Add new error if validation failed
          if (error) {
            return [...filtered, { field: fieldName, message: error }];
          }

          return filtered;
        });

        onValidate?.(fieldName, !error, error);
      },
      [rules, formValues, onValidate]
    );

    const validate = useCallback(async (): Promise<boolean> => {
      const effectiveRules = getEffectiveRules();

      if (!effectiveRules) {
        setErrors([]);
        return true;
      }

      const result = await validateForm(formValues, effectiveRules);
      setErrors(result.errors);
      return result.valid;
    }, [getEffectiveRules, formValues]);

    const clearValidate = useCallback(
      (fieldNames?: string | string[]): void => {
        if (!fieldNames) {
          setErrors([]);
          return;
        }

        const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
        setErrors((prevErrors) =>
          prevErrors.filter((error) => !fields.includes(error.field))
        );
      },
      []
    );

    const resetFields = useCallback((): void => {
      clearValidate();
      setFormValues(model);
    }, [model, clearValidate]);

    const updateValue = useCallback(
      (fieldName: string, value: unknown): void => {
        const setValueByPath = (
          target: FormValues,
          path: string,
          nextValue: unknown
        ): FormValues => {
          if (!path.includes(".")) {
            return { ...target, [path]: nextValue };
          }

          const segments = path.split(".").filter(Boolean);
          if (segments.length === 0) {
            return target;
          }

          const clone: FormValues = { ...target };
          let cursor: Record<string, unknown> = clone;

          for (let i = 0; i < segments.length; i++) {
            const key = segments[i];
            const isLast = i === segments.length - 1;

            if (isLast) {
              cursor[key] = nextValue;
              break;
            }

            const existing = cursor[key];
            const next =
              existing &&
              typeof existing === "object" &&
              !Array.isArray(existing)
                ? { ...(existing as Record<string, unknown>) }
                : {};

            cursor[key] = next;
            cursor = next;
          }

          return clone;
        };

        setFormValues((prevValues) => {
          const newValues = setValueByPath(prevValues, fieldName, value);
          onChange?.(newValues);
          return newValues;
        });
      },
      [onChange]
    );

    const handleSubmit = useCallback(
      async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        const effectiveRules = getEffectiveRules();
        if (!effectiveRules) {
          setErrors([]);
          onSubmit?.({ valid: true, values: formValues, errors: [] });
          return;
        }

        const result = await validateForm(formValues, effectiveRules);
        setErrors(result.errors);

        onSubmit?.({
          valid: result.valid,
          values: formValues,
          errors: result.errors,
        });
      },
      [getEffectiveRules, formValues, onSubmit]
    );

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        validate,
        validateField,
        clearValidate,
        resetFields,
      }),
      [validate, validateField, clearValidate, resetFields]
    );

    const contextValue: FormContextValue = useMemo(
      () => ({
        model: formValues,
        rules,
        labelWidth,
        labelPosition,
        labelAlign,
        size,
        inlineMessage,
        showRequiredAsterisk,
        disabled,
        errors,
        registerFieldRules,
        validateField,
        clearValidate,
        updateValue,
      }),
      [
        formValues,
        rules,
        labelWidth,
        labelPosition,
        labelAlign,
        size,
        inlineMessage,
        showRequiredAsterisk,
        disabled,
        errors,
        registerFieldRules,
        validateField,
        clearValidate,
        updateValue,
      ]
    );

    const formClasses = classNames(
      "tiger-form",
      `tiger-form--label-${labelPosition}`,
      disabled && "tiger-form--disabled",
      className
    );

    return (
      <FormContext.Provider value={contextValue}>
        <form className={formClasses} onSubmit={handleSubmit} {...props}>
          {children}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = "TigerForm";
