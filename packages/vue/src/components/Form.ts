import {
  defineComponent,
  provide,
  reactive,
  computed,
  h,
  PropType,
  type ComputedRef,
} from "vue";
import {
  classNames,
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

// Form context key
export const FormContextKey = Symbol("FormContext");

// Form context type
export interface FormContext {
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
}

export const Form = defineComponent({
  name: "TigerForm",
  props: {
    /**
     * Form data model
     * @default {}
     */
    model: {
      type: Object as PropType<FormValues>,
      default: () => ({}),
    },
    /**
     * Form validation rules
     */
    rules: {
      type: Object as PropType<FormRules>,
    },
    /**
     * Label width (string or number in pixels)
     */
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
    },
    /**
     * Label position
     * @default 'right'
     */
    labelPosition: {
      type: String as PropType<FormLabelPosition>,
      default: "right" as FormLabelPosition,
    },
    /**
     * Label alignment
     * @default 'right'
     */
    labelAlign: {
      type: String as PropType<FormLabelAlign>,
      default: "right" as FormLabelAlign,
    },
    /**
     * Form size (applies to all form items)
     * @default 'md'
     */
    size: {
      type: String as PropType<FormSize>,
      default: "md" as FormSize,
    },
    /**
     * Show inline validation messages
     * @default true
     */
    inlineMessage: {
      type: Boolean,
      default: true,
    },
    /**
     * Show required asterisk on required fields
     * @default true
     */
    showRequiredAsterisk: {
      type: Boolean,
      default: true,
    },
    /**
     * Disable all form controls
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    /**
     * Emitted when form is submitted
     */
    submit: (_data: {
      valid: boolean;
      values: FormValues;
      errors: FormError[];
    }) => true,
    /**
     * Emitted when field is validated
     */
    validate: (fieldName: string, isValid: boolean, _errorMessage?: string) =>
      typeof fieldName === "string" && typeof isValid === "boolean",
  },
  setup(props, { slots, emit, expose }) {
    const errors = reactive<FormError[]>([]);
    const fieldRules = reactive<Record<string, FormRule | FormRule[]>>({});

    const registerFieldRules = (
      fieldName: string,
      rules?: FormRule | FormRule[]
    ): void => {
      if (!fieldName) {
        return;
      }

      if (!rules) {
        delete fieldRules[fieldName];
        return;
      }

      fieldRules[fieldName] = rules;
    };

    const getEffectiveRules = (): FormRules | undefined => {
      const merged = {
        ...(props.rules ?? {}),
        ...fieldRules,
      };
      return Object.keys(merged).length > 0 ? merged : undefined;
    };

    const validateField = async (
      fieldName: string,
      rulesOverride?: FormRule | FormRule[],
      trigger?: FormRuleTrigger
    ): Promise<void> => {
      const fieldRules = rulesOverride ?? props.rules?.[fieldName];
      if (!fieldRules) {
        return;
      }

      const value = getValueByPath(props.model, fieldName);
      const error = await validateFieldUtil(
        fieldName,
        value,
        fieldRules,
        props.model,
        trigger
      );

      // Remove existing errors for this field
      const index = errors.findIndex((e) => e.field === fieldName);
      if (index !== -1) {
        errors.splice(index, 1);
      }

      // Add new error if validation failed
      if (error) {
        errors.push({
          field: fieldName,
          message: error,
        });
      }

      emit("validate", fieldName, !error, error || undefined);
    };

    const validate = async (): Promise<boolean> => {
      const effectiveRules = getEffectiveRules();
      if (!effectiveRules) {
        return true;
      }

      const result = await validateForm(props.model, effectiveRules);

      // Clear all errors
      errors.splice(0, errors.length);

      // Add new errors
      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }

      return result.valid;
    };

    const clearValidate = (fieldNames?: string | string[]): void => {
      if (!fieldNames) {
        errors.splice(0, errors.length);
        return;
      }

      const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

      fields.forEach((fieldName) => {
        const index = errors.findIndex((e) => e.field === fieldName);
        if (index !== -1) {
          errors.splice(index, 1);
        }
      });
    };

    const resetFields = (): void => {
      clearValidate();
    };

    const handleSubmit = async (event: Event): Promise<void> => {
      event.preventDefault();

      const effectiveRules = getEffectiveRules();
      if (!effectiveRules) {
        errors.splice(0, errors.length);
        emit("submit", { valid: true, values: props.model, errors });
        return;
      }

      const result = await validateForm(props.model, effectiveRules);

      errors.splice(0, errors.length);
      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }

      emit("submit", {
        valid: result.valid,
        values: props.model,
        errors,
      });
    };

    // Provide form context to child FormItems
    const formContextValue = computed<FormContext>(() => ({
      model: props.model,
      rules: props.rules,
      labelWidth: props.labelWidth,
      labelPosition: props.labelPosition,
      labelAlign: props.labelAlign,
      size: props.size,
      inlineMessage: props.inlineMessage,
      showRequiredAsterisk: props.showRequiredAsterisk,
      disabled: props.disabled,
      errors,
      registerFieldRules,
      validateField,
      clearValidate,
    }));

    provide<ComputedRef<FormContext>>(FormContextKey, formContextValue);

    // Expose methods
    expose({
      validate,
      validateField,
      clearValidate,
      resetFields,
    });

    const formClasses = computed(() => {
      return classNames(
        "tiger-form",
        `tiger-form--label-${props.labelPosition}`,
        props.disabled && "tiger-form--disabled"
      );
    });

    return () => {
      return h(
        "form",
        {
          class: formClasses.value,
          onSubmit: handleSubmit,
        },
        slots.default?.()
      );
    };
  },
});

export default Form;
