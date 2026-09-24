import {
  computed,
  defineComponent,
  h,
  inject,
  reactive,
  ref,
  useId,
  watch,
  type PropType
} from 'vue'
import type {
  CronEditorSize,
  CronFieldDraft,
  CronFieldKey,
  CronFieldMeta,
  CronFieldMode,
  CronPreset,
  InputStatus,
  TigerLocale,
  TigerLocaleCronEditor
} from '@expcat/tigercat-core'
import {
  applyCronFieldMode,
  buildCronFieldValueFromDraft,
  classNames,
  coerceClassValue,
  cronDraftErrorMessage,
  cronFormValue,
  cronEditorBaseClasses,
  cronEditorErrorClasses,
  cronEditorFieldClasses,
  cronEditorFieldsClasses,
  cronEditorLabelClasses,
  cronFieldMetas,
  cronFieldModes,
  formatCronControlLabel,
  getCronEditorControlClasses,
  getCronEditorLabels,
  getCronExpressionIssue,
  getCronFieldIssue,
  getCronModeLabels,
  getDefaultCronPresets,
  isCronExpressionEmpty,
  isCronFieldCountValid,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  parseOptionalInt,
  seedCronFieldDrafts,
  updateCronExpressionField,
  validateCronExpressionWithLabels,
  describeCronExpression,
  nextCronRun
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export type VueCronEditorProps = InstanceType<typeof CronEditor>['$props']
export type CronEditorProps = VueCronEditorProps

export const CronEditor = markFormItemGroupControl(
  defineComponent({
    name: 'TigerCronEditor',
    inheritAttrs: false,
    props: {
      modelValue: { type: String as PropType<string | null>, default: undefined },
      defaultValue: { type: String as PropType<string | null>, default: undefined },
      disabled: { type: Boolean, default: false },
      readOnly: { type: Boolean, default: false },
      size: { type: String as PropType<CronEditorSize>, default: 'md' },
      presets: { type: Array as PropType<CronPreset[]>, default: undefined },
      ariaLabel: { type: String, default: undefined },
      locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
      labels: { type: Object as PropType<Partial<TigerLocaleCronEditor>>, default: undefined },
      name: String,
      id: String,
      status: { type: String as PropType<InputStatus>, default: undefined },
      className: String
    },
    emits: ['update:modelValue', 'validate', 'blur'],
    setup(props, { attrs, emit, expose }) {
      const config = useTigerConfig()
      const formItemControl = inject<VueFormItemControlContext | null>(
        FORM_ITEM_CONTROL_INJECTION_KEY,
        null
      )
      const initialRaw = props.modelValue ?? props.defaultValue ?? ''
      const innerValue = ref<string | null>(cronFormValue(initialRaw))
      const expressionDraft = ref(initialRaw ?? '')
      const expressionInput = ref<HTMLInputElement | null>(null)
      const stickyModes = reactive<Partial<Record<CronFieldKey, CronFieldMode>>>({})
      const drafts = reactive<Record<CronFieldKey, CronFieldDraft>>(
        seedCronFieldDrafts(expressionDraft.value, stickyModes)
      )
      const instanceId = useId()
      let echoed: string | null | undefined

      function applyDrafts(expression: string) {
        const seeded = seedCronFieldDrafts(expression, stickyModes)
        for (const meta of cronFieldMetas) drafts[meta.key] = seeded[meta.key]
      }

      const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
      const labels = computed(() => getCronEditorLabels(mergedLocale.value, props.labels))
      const fieldLabels = computed<Record<CronFieldKey, string>>(() => ({
        minute: labels.value.minuteLabel,
        hour: labels.value.hourLabel,
        dayOfMonth: labels.value.dayOfMonthLabel,
        month: labels.value.monthLabel,
        dayOfWeek: labels.value.dayOfWeekLabel
      }))
      const localizedMetas = computed<CronFieldMeta[]>(() =>
        cronFieldMetas.map((meta) => ({ ...meta, label: fieldLabels.value[meta.key] }))
      )
      const resolvedPresets = computed<CronPreset[]>(() =>
        props.presets === undefined ? getDefaultCronPresets(labels.value) : props.presets
      )
      const modeLabels = computed(() => getCronModeLabels(labels.value))
      const effectiveDisabled = computed(
        () => props.disabled || (formItemControl?.disabled.value ?? false)
      )
      const status = computed(() => props.status ?? formItemControl?.status.value ?? 'default')
      const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
      const effectiveName = computed(() => props.name ?? formItemControl?.name.value)

      const modelRaw = computed(() => {
        if (props.modelValue !== undefined) return props.modelValue ?? ''
        if (formItemControl?.value.value !== undefined) {
          return formItemControl.value.value == null ? '' : String(formItemControl.value.value)
        }
        return innerValue.value ?? ''
      })

      watch(modelRaw, (next) => {
        if (echoed !== undefined && (echoed ?? '') === next) {
          echoed = undefined
          return
        }
        if (next === expressionDraft.value) return
        if (next === (cronFormValue(expressionDraft.value) ?? '') && next === '') return
        expressionDraft.value = next
        applyDrafts(next)
      })

      const validation = computed(() =>
        validateCronExpressionWithLabels(expressionDraft.value, labels.value, fieldLabels.value)
      )
      const fieldsReady = computed(
        () =>
          !isCronExpressionEmpty(expressionDraft.value) &&
          isCronFieldCountValid(expressionDraft.value)
      )
      const submittedValue = computed(() => cronFormValue(expressionDraft.value) ?? '')

      watch(
        () => cronDraftErrorMessage(expressionDraft.value, validation.value),
        (message, previous) => {
          if (message) formItemControl?.setError(message)
          else if (previous) formItemControl?.setError(null)
        },
        { immediate: true }
      )

      function writeValue(nextValue: string) {
        if (effectiveDisabled.value || props.readOnly) return
        expressionDraft.value = nextValue
        const stored = cronFormValue(nextValue)
        const nextValidation = validateCronExpressionWithLabels(
          nextValue,
          labels.value,
          fieldLabels.value
        )
        const currentStored = cronFormValue(modelRaw.value)
        if (currentStored !== stored) {
          echoed = stored
          if (props.modelValue === undefined && formItemControl?.value.value === undefined) {
            innerValue.value = stored
          }
          emit('update:modelValue', stored)
          formItemControl?.onChange(stored)
        }
        emit('validate', nextValidation)
      }

      function handleRawExpressionChange(nextValue: string) {
        if (props.readOnly) return
        for (const key of Object.keys(stickyModes) as CronFieldKey[]) {
          delete stickyModes[key]
        }
        expressionDraft.value = nextValue
        applyDrafts(nextValue)
        writeValue(nextValue)
      }

      function writeField(meta: CronFieldMeta, draft: CronFieldDraft) {
        if (!fieldsReady.value && isCronExpressionEmpty(expressionDraft.value)) {
          const parts = ['*', '*', '*', '*', '*']
          const index = cronFieldMetas.findIndex((item) => item.key === meta.key)
          parts[index] = buildCronFieldValueFromDraft(draft, meta)
          writeValue(parts.join(' '))
          return
        }
        if (!fieldsReady.value) return
        const raw = buildCronFieldValueFromDraft(draft, meta)
        const updated = updateCronExpressionField(expressionDraft.value, meta.key, raw)
        if (updated == null) return
        writeValue(updated)
      }

      function handleModeChange(meta: CronFieldMeta, mode: CronFieldMode) {
        if (effectiveDisabled.value || props.readOnly || !fieldsReady.value) return
        stickyModes[meta.key] = mode
        const next = applyCronFieldMode(drafts[meta.key], mode, meta)
        drafts[meta.key] = next
        writeField(meta, next)
      }

      function handleFocusout(event: FocusEvent) {
        const next = event.relatedTarget as Node | null
        const root = (event.currentTarget as HTMLElement | null)?.closest('[data-tiger-croneditor]')
        if (root && next && root.contains(next)) return
        formItemControl?.onBlur()
        emit('blur', event)
      }

      expose({
        focus: () => expressionInput.value?.focus()
      })

      function renderFieldControl(meta: CronFieldMeta, draft: CronFieldDraft, invalid: boolean) {
        if (draft.mode === 'any') return undefined

        if (draft.mode === 'every') {
          return h('input', {
            type: 'text',
            inputmode: 'numeric',
            class: getCronEditorControlClasses(props.size, invalid),
            value: draft.stepText,
            disabled: effectiveDisabled.value || !fieldsReady.value,
            readonly: props.readOnly,
            'aria-label': formatCronControlLabel(labels.value.stepAriaLabel, meta.label),
            onInput: (event: Event) => {
              if (props.readOnly) return
              const text = (event.target as HTMLInputElement).value
              drafts[meta.key] = { ...draft, stepText: text, mode: 'every' }
              if (parseOptionalInt(text) != null) writeField(meta, drafts[meta.key])
            }
          })
        }

        if (draft.mode === 'specific') {
          return h('input', {
            type: 'text',
            inputmode: 'numeric',
            class: getCronEditorControlClasses(props.size, invalid),
            value: draft.valueText,
            disabled: effectiveDisabled.value || !fieldsReady.value,
            readonly: props.readOnly,
            'aria-label': formatCronControlLabel(labels.value.valueAriaLabel, meta.label),
            onInput: (event: Event) => {
              if (props.readOnly) return
              const text = (event.target as HTMLInputElement).value
              drafts[meta.key] = { ...draft, valueText: text, mode: 'specific' }
              if (parseOptionalInt(text) != null) writeField(meta, drafts[meta.key])
            }
          })
        }

        if (draft.mode === 'range') {
          return h('div', { class: 'grid grid-cols-2 gap-1' }, [
            h('input', {
              type: 'text',
              inputmode: 'numeric',
              class: getCronEditorControlClasses(props.size, invalid),
              value: draft.startText,
              disabled: effectiveDisabled.value || !fieldsReady.value,
              readonly: props.readOnly,
              'aria-label': formatCronControlLabel(labels.value.rangeStartAriaLabel, meta.label),
              onInput: (event: Event) => {
                if (props.readOnly) return
                const text = (event.target as HTMLInputElement).value
                drafts[meta.key] = { ...draft, startText: text, mode: 'range' }
                if (
                  parseOptionalInt(text) != null &&
                  parseOptionalInt(drafts[meta.key].endText) != null
                ) {
                  writeField(meta, drafts[meta.key])
                }
              }
            }),
            h('input', {
              type: 'text',
              inputmode: 'numeric',
              class: getCronEditorControlClasses(props.size, invalid),
              value: draft.endText,
              disabled: effectiveDisabled.value || !fieldsReady.value,
              readonly: props.readOnly,
              'aria-label': formatCronControlLabel(labels.value.rangeEndAriaLabel, meta.label),
              onInput: (event: Event) => {
                if (props.readOnly) return
                const text = (event.target as HTMLInputElement).value
                drafts[meta.key] = { ...draft, endText: text, mode: 'range' }
                if (
                  parseOptionalInt(drafts[meta.key].startText) != null &&
                  parseOptionalInt(text) != null
                ) {
                  writeField(meta, drafts[meta.key])
                }
              }
            })
          ])
        }

        return h('input', {
          type: 'text',
          class: getCronEditorControlClasses(props.size, invalid),
          value: draft.raw,
          disabled: effectiveDisabled.value || !fieldsReady.value,
          readonly: props.readOnly,
          'aria-label': formatCronControlLabel(labels.value.customValueAriaLabel, meta.label),
          onInput: (event: Event) => {
            if (props.readOnly) return
            const text = (event.target as HTMLInputElement).value
            drafts[meta.key] = { ...draft, raw: text, mode: 'custom' }
            writeField(meta, drafts[meta.key])
          }
        })
      }

      return () => {
        const attrRecord = attrs as Record<string, unknown>
        const labelledby =
          typeof attrRecord['aria-labelledby'] === 'string' &&
          (attrRecord['aria-labelledby'] as string).trim()
            ? (attrRecord['aria-labelledby'] as string)
            : formItemControl?.labelId.value
        const describedBy = mergeAriaDescribedBy(
          typeof attrRecord['aria-describedby'] === 'string'
            ? (attrRecord['aria-describedby'] as string)
            : undefined,
          formItemControl?.describedBy.value
        )
        const expressionIssue = getCronExpressionIssue(validation.value)
        const expressionInvalid =
          Boolean(expressionIssue) && !isCronExpressionEmpty(expressionDraft.value)
        const errorId = `${instanceId}-error`
        const groupName = props.ariaLabel ?? labels.value.ariaLabel

        return h(
          'div',
          {
            class: classNames(
              cronEditorBaseClasses,
              props.className,
              coerceClassValue(attrs.class)
            ),
            role: 'group',
            'data-tiger-croneditor': '',
            'aria-label': labelledby ? undefined : groupName,
            'aria-labelledby': labelledby,
            'aria-describedby': describedBy,
            'aria-invalid': status.value === 'error' || expressionInvalid ? true : undefined,
            'aria-readonly': props.readOnly || undefined,
            onFocusout: handleFocusout
          },
          [
            effectiveName.value
              ? h('input', {
                  type: 'hidden',
                  name: effectiveName.value,
                  value: submittedValue.value,
                  disabled: effectiveDisabled.value || undefined
                })
              : null,
            h('div', { class: 'flex flex-col gap-2 sm:flex-row' }, [
              h('input', {
                ref: expressionInput,
                type: 'text',
                id: effectiveId.value,
                class: classNames(
                  getCronEditorControlClasses(props.size, expressionInvalid),
                  'flex-1'
                ),
                value: expressionDraft.value,
                disabled: effectiveDisabled.value,
                readonly: props.readOnly,
                'aria-label': labels.value.expressionAriaLabel,
                'aria-invalid': expressionInvalid || undefined,
                'aria-describedby': expressionIssue ? errorId : describedBy,
                onInput: (event: Event) =>
                  handleRawExpressionChange((event.target as HTMLInputElement).value)
              }),
              resolvedPresets.value.length > 0
                ? h(
                    'select',
                    {
                      class: getCronEditorControlClasses(props.size),
                      value: resolvedPresets.value.some(
                        (preset) => preset.value === expressionDraft.value
                      )
                        ? expressionDraft.value
                        : '',
                      disabled: effectiveDisabled.value,
                      'aria-label': labels.value.presetAriaLabel,
                      onChange: (event: Event) => {
                        if (props.readOnly) return
                        const nextValue = (event.target as HTMLSelectElement).value
                        if (nextValue) {
                          for (const key of Object.keys(stickyModes) as CronFieldKey[]) {
                            delete stickyModes[key]
                          }
                          expressionDraft.value = nextValue
                          applyDrafts(nextValue)
                          writeValue(nextValue)
                        }
                      }
                    },
                    [
                      h('option', { value: '' }, labels.value.presetPlaceholder),
                      ...resolvedPresets.value.map((preset) =>
                        h('option', { key: preset.value, value: preset.value }, preset.label)
                      )
                    ]
                  )
                : undefined
            ]),
            expressionIssue
              ? h(
                  'div',
                  { id: errorId, class: cronEditorErrorClasses, 'aria-live': 'polite' },
                  expressionIssue.message
                )
              : undefined,
            h(
              'div',
              { class: cronEditorFieldsClasses },
              localizedMetas.value.map((meta) => {
                const draft = drafts[meta.key]
                const issue = getCronFieldIssue(validation.value, meta.key)
                const modeId = `${instanceId}-${meta.key}-mode`
                const fieldErrorId = `${instanceId}-${meta.key}-error`

                return h('div', { key: meta.key, class: cronEditorFieldClasses }, [
                  h('label', { class: cronEditorLabelClasses, for: modeId }, meta.label),
                  h(
                    'select',
                    {
                      id: modeId,
                      class: getCronEditorControlClasses(props.size, !!issue),
                      value: fieldsReady.value ? draft.mode : '',
                      disabled: effectiveDisabled.value || !fieldsReady.value,
                      'aria-invalid': issue ? true : undefined,
                      'aria-describedby': issue ? fieldErrorId : undefined,
                      'aria-label': formatCronControlLabel(labels.value.modeAriaLabel, meta.label),
                      onChange: (event: Event) =>
                        handleModeChange(
                          meta,
                          (event.target as HTMLSelectElement).value as CronFieldMode
                        )
                    },
                    [
                      fieldsReady.value ? null : h('option', { value: '' }, '\u00a0'),
                      ...cronFieldModes.map((mode) =>
                        h('option', { key: mode, value: mode }, modeLabels.value[mode])
                      )
                    ]
                  ),
                  renderFieldControl(meta, draft, !!issue),
                  issue
                    ? h('div', { id: fieldErrorId, class: cronEditorErrorClasses }, issue.message)
                    : undefined
                ])
              })
            ),
            validation.value.valid && expressionDraft.value
              ? h(
                  'p',
                  {
                    class: 'text-sm text-[var(--tiger-text-secondary)]',
                    'data-tiger-cron-summary': ''
                  },
                  [
                    describeCronExpression(expressionDraft.value),
                    ' ',
                    nextCronRun(expressionDraft.value)?.toISOString() ?? ''
                  ]
                )
              : null
          ]
        )
      }
    }
  })
)

export default CronEditor
