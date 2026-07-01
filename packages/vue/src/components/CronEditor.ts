import { computed, defineComponent, h, ref, type PropType } from 'vue'
import type {
  CronEditorSize,
  CronFieldControl,
  CronFieldMeta,
  CronPreset,
  TigerLocale,
  TigerLocaleCronEditor
} from '@expcat/tigercat-core'
import {
  buildCronFieldValue,
  classNames,
  coerceClassValue,
  cronEditorBaseClasses,
  cronEditorErrorClasses,
  cronEditorFieldClasses,
  cronEditorFieldsClasses,
  cronEditorLabelClasses,
  cronFieldMetas,
  defaultCronExpression,
  getCronEditorControlClasses,
  getCronEditorLabels,
  getCronFieldIssue,
  getCronFieldValue,
  mergeTigerLocale,
  normalizeCronExpression,
  parseCronFieldControl,
  updateCronExpressionField,
  validateCronExpressionWithLabels
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type VueCronEditorProps = InstanceType<typeof CronEditor>['$props']

const modeOptions: Array<{ label: string; value: CronFieldControl['mode'] }> = [
  { label: 'Any', value: 'any' },
  { label: 'Every', value: 'every' },
  { label: 'Specific', value: 'specific' },
  { label: 'Range', value: 'range' },
  { label: 'Custom', value: 'custom' }
]

function formatCronControlLabel(template: string, field: string): string {
  return template.replace('{field}', field)
}

export const CronEditor = defineComponent({
  name: 'TigerCronEditor',
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: defaultCronExpression },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    size: { type: String as PropType<CronEditorSize>, default: 'md' },
    presets: { type: Array as PropType<CronPreset[]>, default: undefined },
    ariaLabel: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleCronEditor>>, default: undefined }
  },
  emits: ['update:modelValue', 'change', 'validate'],
  setup(props, { attrs, emit }) {
    const config = useTigerConfig()
    const innerValue = ref(props.defaultValue)
    const expression = computed(() => props.modelValue ?? innerValue.value)
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getCronEditorLabels(mergedLocale.value, props.labels))
    const fieldLabels = computed<Record<CronFieldMeta['key'], string>>(() => ({
      minute: labels.value.minuteLabel,
      hour: labels.value.hourLabel,
      dayOfMonth: labels.value.dayOfMonthLabel,
      month: labels.value.monthLabel,
      dayOfWeek: labels.value.dayOfWeekLabel
    }))
    const validation = computed(() =>
      validateCronExpressionWithLabels(expression.value, labels.value, fieldLabels.value)
    )
    const inactive = computed(() => props.disabled || props.readonly)
    const localizedMetas = computed<CronFieldMeta[]>(() =>
      cronFieldMetas.map((meta) => ({ ...meta, label: fieldLabels.value[meta.key] }))
    )
    const resolvedPresets = computed<CronPreset[]>(
      () =>
        props.presets ?? [
          { label: labels.value.everyMinutePreset, value: '* * * * *' },
          { label: labels.value.hourlyPreset, value: '0 * * * *' },
          { label: labels.value.dailyPreset, value: '0 0 * * *' },
          { label: labels.value.weeklyPreset, value: '0 0 * * 1' },
          { label: labels.value.monthlyPreset, value: '0 0 1 * *' }
        ]
    )
    const modeLabels = computed<Record<CronFieldControl['mode'], string>>(() => ({
      any: labels.value.modeAnyLabel,
      every: labels.value.modeEveryLabel,
      specific: labels.value.modeSpecificLabel,
      range: labels.value.modeRangeLabel,
      custom: labels.value.modeCustomLabel
    }))

    function commit(nextValue: string) {
      const normalized = normalizeCronExpression(nextValue)
      const nextValidation = validateCronExpressionWithLabels(
        normalized,
        labels.value,
        fieldLabels.value
      )
      if (props.modelValue === undefined) innerValue.value = normalized
      emit('update:modelValue', normalized)
      emit('change', normalized, nextValidation)
      emit('validate', nextValidation)
    }

    function handleRawExpressionChange(nextValue: string) {
      const nextValidation = validateCronExpressionWithLabels(
        nextValue,
        labels.value,
        fieldLabels.value
      )
      if (props.modelValue === undefined) innerValue.value = nextValue
      emit('update:modelValue', nextValue)
      emit('change', nextValue, nextValidation)
      emit('validate', nextValidation)
    }

    function handleFieldRawChange(meta: CronFieldMeta, raw: string) {
      commit(updateCronExpressionField(expression.value, meta.key, raw))
    }

    function handleModeChange(
      meta: CronFieldMeta,
      control: CronFieldControl,
      mode: CronFieldControl['mode']
    ) {
      const nextControl: CronFieldControl = {
        ...control,
        mode,
        value: control.value ?? meta.min,
        start: control.start ?? meta.min,
        end: control.end ?? meta.max,
        step: control.step ?? 1
      }
      handleFieldRawChange(meta, buildCronFieldValue(nextControl, meta))
    }

    function renderFieldControl(meta: CronFieldMeta, control: CronFieldControl) {
      if (control.mode === 'any') return undefined

      if (control.mode === 'every') {
        return h('input', {
          type: 'number',
          min: 1,
          max: meta.max,
          class: getCronEditorControlClasses(props.size),
          value: control.step ?? 1,
          disabled: inactive.value,
          'aria-label': formatCronControlLabel(labels.value.stepAriaLabel, meta.label),
          onInput: (event: Event) =>
            handleFieldRawChange(
              meta,
              buildCronFieldValue(
                { ...control, step: Number((event.target as HTMLInputElement).value) },
                meta
              )
            )
        })
      }

      if (control.mode === 'specific') {
        return h('input', {
          type: 'number',
          min: meta.min,
          max: meta.max,
          class: getCronEditorControlClasses(props.size),
          value: control.value ?? meta.min,
          disabled: inactive.value,
          'aria-label': formatCronControlLabel(labels.value.valueAriaLabel, meta.label),
          onInput: (event: Event) =>
            handleFieldRawChange(
              meta,
              buildCronFieldValue(
                { ...control, value: Number((event.target as HTMLInputElement).value) },
                meta
              )
            )
        })
      }

      if (control.mode === 'range') {
        return h('div', { class: 'grid grid-cols-2 gap-1' }, [
          h('input', {
            type: 'number',
            min: meta.min,
            max: meta.max,
            class: getCronEditorControlClasses(props.size),
            value: control.start ?? meta.min,
            disabled: inactive.value,
            'aria-label': formatCronControlLabel(labels.value.rangeStartAriaLabel, meta.label),
            onInput: (event: Event) =>
              handleFieldRawChange(
                meta,
                buildCronFieldValue(
                  { ...control, start: Number((event.target as HTMLInputElement).value) },
                  meta
                )
              )
          }),
          h('input', {
            type: 'number',
            min: meta.min,
            max: meta.max,
            class: getCronEditorControlClasses(props.size),
            value: control.end ?? meta.max,
            disabled: inactive.value,
            'aria-label': formatCronControlLabel(labels.value.rangeEndAriaLabel, meta.label),
            onInput: (event: Event) =>
              handleFieldRawChange(
                meta,
                buildCronFieldValue(
                  { ...control, end: Number((event.target as HTMLInputElement).value) },
                  meta
                )
              )
          })
        ])
      }

      return h('input', {
        type: 'text',
        class: getCronEditorControlClasses(props.size),
        value: control.raw,
        disabled: inactive.value,
        'aria-label': formatCronControlLabel(labels.value.customValueAriaLabel, meta.label),
        onInput: (event: Event) =>
          handleFieldRawChange(meta, (event.target as HTMLInputElement).value)
      })
    }

    return () =>
      h(
        'div',
        {
          class: classNames(cronEditorBaseClasses, coerceClassValue(attrs.class)),
          role: 'group',
          'aria-label': props.ariaLabel ?? labels.value.ariaLabel
        },
        [
          h('div', { class: 'flex flex-col gap-2 sm:flex-row' }, [
            h('input', {
              type: 'text',
              class: classNames(
                getCronEditorControlClasses(props.size, !validation.value.valid),
                'flex-1'
              ),
              value: expression.value,
              disabled: props.disabled,
              readonly: props.readonly,
              'aria-label': labels.value.expressionAriaLabel,
              onInput: (event: Event) =>
                handleRawExpressionChange((event.target as HTMLInputElement).value)
            }),
            resolvedPresets.value.length > 0
              ? h(
                  'select',
                  {
                    class: getCronEditorControlClasses(props.size),
                    value: resolvedPresets.value.some((preset) => preset.value === expression.value)
                      ? expression.value
                      : '',
                    disabled: inactive.value,
                    'aria-label': labels.value.presetAriaLabel,
                    onChange: (event: Event) => {
                      const nextValue = (event.target as HTMLSelectElement).value
                      if (nextValue) commit(nextValue)
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
          ...validation.value.issues
            .filter((issue) => issue.field === 'expression')
            .map((issue) =>
              h('div', { key: issue.message, class: cronEditorErrorClasses }, issue.message)
            ),
          h(
            'div',
            { class: cronEditorFieldsClasses },
            localizedMetas.value.map((meta) => {
              const raw = getCronFieldValue(expression.value, meta.key)
              const control = parseCronFieldControl(raw)
              const issue = getCronFieldIssue(validation.value, meta.key)

              return h('div', { key: meta.key, class: cronEditorFieldClasses }, [
                h('label', { class: cronEditorLabelClasses }, meta.label),
                h(
                  'select',
                  {
                    class: getCronEditorControlClasses(props.size, !!issue),
                    value: control.mode,
                    disabled: inactive.value,
                    'aria-label': formatCronControlLabel(labels.value.modeAriaLabel, meta.label),
                    onChange: (event: Event) =>
                      handleModeChange(
                        meta,
                        control,
                        (event.target as HTMLSelectElement).value as CronFieldControl['mode']
                      )
                  },
                  modeOptions.map((mode) =>
                    h(
                      'option',
                      { key: mode.value, value: mode.value },
                      modeLabels.value[mode.value]
                    )
                  )
                ),
                renderFieldControl(meta, control),
                issue ? h('div', { class: cronEditorErrorClasses }, issue.message) : undefined
              ])
            })
          )
        ]
      )
  }
})

export default CronEditor
