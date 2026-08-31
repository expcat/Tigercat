import { defineComponent, h, ref, computed, watch, inject, useId, type PropType } from 'vue'
import type {
  TransferItem,
  TransferSearchValue,
  TransferSelectedKeys,
  ComponentSize,
  InputStatus
} from '@expcat/tigercat-core'
import {
  applyTransferSelectAll,
  canMoveTransferItems,
  checkboxCheckPathD,
  checkboxIconSizeClasses,
  checkboxIconViewBox,
  checkboxIndeterminatePathD,
  classNames,
  coerceClassValue,
  devWarn,
  emptyTransferSelectedKeys,
  filterTransferItems,
  getCheckboxLabelClasses,
  getCheckboxVisualClasses,
  getInputClasses,
  getTransferItemClasses,
  getTransferLabels,
  getTransferSelectAllState,
  hasTransferKey,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  moveTransferItems,
  resolveLocaleText,
  resolveTransferTargetKeys,
  runShakeAnimation,
  splitTransferData,
  toggleTransferKey,
  transferBaseClasses,
  transferEmptyClasses,
  transferItemDescriptionClasses,
  transferKeyId,
  transferMoveToSourceIconClasses,
  transferMoveToTargetIconClasses,
  transferOperationClasses,
  transferPanelBodyClasses,
  transferPanelClasses,
  transferPanelHeaderClasses
} from '@expcat/tigercat-core'
import type { TigerLocale, TigerLocaleTransfer } from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { Button } from './Button'
import { Icon } from './Icon'

export type VueTransferProps = InstanceType<typeof Transfer>['$props']
export type TransferProps = VueTransferProps

function TransferCheckbox(options: {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  size: ComponentSize
  onChange: () => void
  children?: unknown
}) {
  return h('label', { class: getCheckboxLabelClasses(options.size, Boolean(options.disabled)) }, [
    h('input', {
      type: 'checkbox',
      class: 'sr-only peer',
      checked: options.checked,
      indeterminate: Boolean(options.indeterminate),
      disabled: options.disabled,
      'aria-checked': options.indeterminate ? 'mixed' : options.checked,
      onChange: () => {
        if (!options.disabled) options.onChange()
      }
    }),
    h(
      'span',
      {
        class: getCheckboxVisualClasses({
          size: options.size,
          checked: options.checked,
          indeterminate: options.indeterminate,
          disabled: Boolean(options.disabled)
        }),
        'aria-hidden': 'true'
      },
      options.checked || options.indeterminate
        ? [
            h(
              'svg',
              {
                class: checkboxIconSizeClasses[options.size],
                viewBox: checkboxIconViewBox,
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              },
              [
                h('path', {
                  d: options.indeterminate ? checkboxIndeterminatePathD : checkboxCheckPathD
                })
              ]
            )
          ]
        : []
    ),
    options.children
  ])
}

export const Transfer = markFormItemGroupControl(
  defineComponent({
    name: 'TigerTransfer',
    inheritAttrs: false,
    props: {
      modelValue: { type: Array as PropType<(string | number)[]>, default: undefined },
      targetKeys: { type: Array as PropType<(string | number)[]>, default: undefined },
      defaultValue: { type: Array as PropType<(string | number)[]>, default: undefined },
      defaultTargetKeys: { type: Array as PropType<(string | number)[]>, default: undefined },
      selectedKeys: { type: Object as PropType<TransferSelectedKeys>, default: undefined },
      defaultSelectedKeys: { type: Object as PropType<TransferSelectedKeys>, default: undefined },
      dataSource: { type: Array as PropType<TransferItem[]>, default: () => [] },
      size: { type: String as PropType<ComponentSize>, default: 'md' },
      disabled: { type: Boolean, default: false },
      searchable: { type: Boolean, default: false },
      searchValue: { type: Object as PropType<TransferSearchValue>, default: undefined },
      defaultSearchValue: { type: Object as PropType<TransferSearchValue>, default: undefined },
      sourceTitle: { type: String, default: undefined },
      targetTitle: { type: String, default: undefined },
      emptyText: { type: String, default: undefined },
      filterOption: {
        type: Function as PropType<(inputValue: string, item: TransferItem) => boolean>,
        default: undefined
      },
      name: { type: String, default: undefined },
      status: { type: String as PropType<InputStatus>, default: undefined },
      className: { type: String, default: undefined },
      locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
      labels: { type: Object as PropType<Partial<TigerLocaleTransfer>>, default: undefined }
    },
    emits: [
      'update:modelValue',
      'update:targetKeys',
      'update:searchValue',
      'update:selectedKeys',
      'change',
      'search-change',
      'select-change'
    ],
    setup(props, { emit, attrs, expose }) {
      const config = useTigerConfig()
      const formItemControl = inject<VueFormItemControlContext | null>(
        FORM_ITEM_CONTROL_INJECTION_KEY,
        null
      )
      const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
      const labels = computed(() =>
        getTransferLabels(mergedLocale.value, {
          ...props.labels,
          sourceTitle: props.sourceTitle,
          targetTitle: props.targetTitle
        })
      )
      const resolved = computed(() => resolveTransferTargetKeys(props.modelValue, props.targetKeys))
      watch(
        () => resolved.value.conflict,
        (conflict) => {
          if (conflict) {
            devWarn(
              'Transfer.valueTargetKeys',
              'Transfer received both `modelValue` and `targetKeys`. `modelValue` wins.'
            )
          }
        },
        { immediate: true }
      )

      const internalTarget = ref<(string | number)[]>([
        ...(props.defaultValue ?? props.defaultTargetKeys ?? [])
      ])
      const targetValue = computed(() => resolved.value.keys ?? internalTarget.value)
      const internalSelected = ref<TransferSelectedKeys>(
        props.defaultSelectedKeys ?? emptyTransferSelectedKeys()
      )
      const selected = computed(() => props.selectedKeys ?? internalSelected.value)
      const internalSearch = ref<TransferSearchValue>({ ...(props.defaultSearchValue ?? {}) })
      const search = computed(() => props.searchValue ?? internalSearch.value)
      const effectiveDisabled = computed(
        () => props.disabled || (formItemControl?.disabled.value ?? false)
      )
      const status = computed<InputStatus>(
        () => props.status ?? formItemControl?.status.value ?? 'default'
      )
      const autoId = useId()
      const groupId = computed(() => formItemControl?.id.value ?? `tiger-transfer-${autoId}`)
      const fieldName = computed(() => props.name ?? formItemControl?.name.value)
      const rootRef = ref<HTMLElement | null>(null)

      watch(
        () => [status.value, formItemControl?.shakeTrigger.value] as const,
        (current, previous) => {
          if (!previous) return
          if (current[0] === 'error') runShakeAnimation(rootRef.value)
        },
        { flush: 'post' }
      )

      function setTarget(
        next: (string | number)[],
        direction: 'left' | 'right',
        moved: (string | number)[]
      ) {
        if (resolved.value.keys === undefined) internalTarget.value = next
        emit('update:modelValue', next)
        emit('update:targetKeys', next)
        emit('change', next, direction, moved)
        formItemControl?.onChange(next)
      }

      function setSelected(next: TransferSelectedKeys) {
        if (props.selectedKeys === undefined) internalSelected.value = next
        emit('update:selectedKeys', next)
        emit('select-change', next)
      }

      function updateSearch(panel: keyof TransferSearchValue, value: string) {
        const next = { ...search.value, [panel]: value }
        if (props.searchValue === undefined) internalSearch.value = next
        emit('update:searchValue', next)
        emit('search-change', next)
      }

      const computedData = computed(() => splitTransferData(props.dataSource, targetValue.value))
      const filteredSource = computed(() =>
        filterTransferItems(
          computedData.value.sourceItems,
          search.value.source ?? '',
          props.filterOption
        )
      )
      const filteredTarget = computed(() =>
        filterTransferItems(
          computedData.value.targetItems,
          search.value.target ?? '',
          props.filterOption
        )
      )
      const canMoveRight = computed(() =>
        canMoveTransferItems(selected.value.source, props.dataSource, effectiveDisabled.value)
      )
      const canMoveLeft = computed(() =>
        canMoveTransferItems(selected.value.target, props.dataSource, effectiveDisabled.value)
      )

      function move(direction: 'left' | 'right') {
        if (direction === 'right' && !canMoveRight.value) return
        if (direction === 'left' && !canMoveLeft.value) return
        const selectedKeys = direction === 'right' ? selected.value.source : selected.value.target
        const result = moveTransferItems(
          direction,
          targetValue.value,
          selectedKeys,
          props.dataSource
        )
        const movedIds = new Set(result.movedKeys.map(transferKeyId))
        setTarget(result.targetKeys, direction, result.movedKeys)
        setSelected({
          source:
            direction === 'right'
              ? selected.value.source.filter((key) => !movedIds.has(transferKeyId(key)))
              : selected.value.source,
          target:
            direction === 'left'
              ? selected.value.target.filter((key) => !movedIds.has(transferKeyId(key)))
              : selected.value.target
        })
      }

      expose({
        focus: () => rootRef.value?.querySelector<HTMLElement>('input,button')?.focus()
      })

      function renderPanel(
        panel: 'source' | 'target',
        title: string,
        allItems: TransferItem[],
        visibleItems: TransferItem[],
        query: string
      ) {
        const selectedKeys = selected.value[panel]
        const selectedCount = selectedKeys.filter((key) =>
          allItems.some((item) => transferKeyId(item.key) === transferKeyId(key))
        ).length
        const selectState = getTransferSelectAllState(visibleItems, selectedKeys)
        return h('div', { class: transferPanelClasses, role: 'group', 'aria-label': title }, [
          h('div', { class: transferPanelHeaderClasses }, [
            TransferCheckbox({
              checked: selectState.checked,
              indeterminate: selectState.indeterminate,
              disabled: effectiveDisabled.value || selectState.enabledKeys.length === 0,
              size: props.size,
              onChange: () => {
                setSelected({
                  ...selected.value,
                  [panel]: applyTransferSelectAll(
                    selected.value[panel],
                    selectState.enabledKeys,
                    !selectState.checked
                  )
                })
              },
              children: h(
                'span',
                { class: 'font-medium text-[var(--tiger-text,#111827)]' },
                `${title} (${selectedCount}/${allItems.length})`
              )
            })
          ]),
          props.searchable
            ? h('input', {
                type: 'search',
                class: getInputClasses({ status: status.value, size: 'sm' }),
                placeholder: resolveLocaleText(
                  'Search',
                  mergedLocale.value?.common?.searchPlaceholder
                ),
                value: query,
                disabled: effectiveDisabled.value,
                'aria-label': labels.value.searchAriaLabel.replace('{title}', title),
                onInput: (event: Event) =>
                  updateSearch(panel, (event.target as HTMLInputElement).value)
              })
            : null,
          h('div', { class: transferPanelBodyClasses }, [
            visibleItems.length > 0
              ? visibleItems.map((item) => {
                  const isSelected = hasTransferKey(selectedKeys, item.key)
                  const itemDisabled = effectiveDisabled.value || Boolean(item.disabled)
                  return h(
                    'div',
                    {
                      key: transferKeyId(item.key),
                      class: getTransferItemClasses(isSelected, itemDisabled, props.size)
                    },
                    [
                      TransferCheckbox({
                        checked: isSelected,
                        disabled: itemDisabled,
                        size: props.size,
                        onChange: () =>
                          setSelected({
                            ...selected.value,
                            [panel]: toggleTransferKey(selected.value[panel], item.key)
                          }),
                        children: h('span', { class: 'min-w-0' }, [
                          h('span', { class: 'block truncate' }, item.label),
                          item.description
                            ? h('span', { class: transferItemDescriptionClasses }, item.description)
                            : null
                        ])
                      })
                    ]
                  )
                })
              : h(
                  'div',
                  { class: transferEmptyClasses },
                  resolveLocaleText(
                    'No data',
                    props.emptyText,
                    mergedLocale.value?.common?.emptyText
                  )
                )
          ])
        ])
      }

      return () =>
        h(
          'div',
          {
            ...Object.fromEntries(
              Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'className')
            ),
            ref: rootRef,
            id: groupId.value,
            role: 'group',
            class: classNames(
              transferBaseClasses,
              status.value === 'error' && 'ring-1 ring-[var(--tiger-error,#dc2626)]',
              props.className,
              coerceClassValue(attrs.class),
              coerceClassValue((attrs as Record<string, unknown>).className)
            ),
            'aria-labelledby': formItemControl?.labelId.value,
            'aria-describedby': mergeAriaDescribedBy(
              typeof attrs['aria-describedby'] === 'string'
                ? (attrs['aria-describedby'] as string)
                : undefined,
              formItemControl?.describedBy.value
            ),
            'aria-invalid': status.value === 'error' ? true : undefined,
            'aria-required': formItemControl?.required.value ? true : undefined,
            'aria-disabled': effectiveDisabled.value || undefined,
            onFocusout: (event: FocusEvent) => {
              const next = event.relatedTarget as Node | null
              if (next && (event.currentTarget as Node).contains(next)) return
              formItemControl?.onBlur()
            }
          },
          [
            fieldName.value
              ? targetValue.value.map((key) =>
                  h('input', {
                    key: transferKeyId(key),
                    type: 'hidden',
                    name: fieldName.value,
                    value: String(key)
                  })
                )
              : null,
            renderPanel(
              'source',
              labels.value.sourceTitle,
              computedData.value.sourceItems,
              filteredSource.value,
              search.value.source ?? ''
            ),
            h('div', { class: transferOperationClasses }, [
              h(
                Button,
                {
                  type: 'button',
                  variant: 'outline',
                  size: 'sm',
                  disabled: !canMoveRight.value,
                  'aria-label': labels.value.moveToTargetAriaLabel,
                  onClick: () => move('right')
                },
                {
                  default: () =>
                    h(Icon, {
                      name: 'chevron-right',
                      class: transferMoveToTargetIconClasses,
                      'aria-hidden': true
                    })
                }
              ),
              h(
                Button,
                {
                  type: 'button',
                  variant: 'outline',
                  size: 'sm',
                  disabled: !canMoveLeft.value,
                  'aria-label': labels.value.moveToSourceAriaLabel,
                  onClick: () => move('left')
                },
                {
                  default: () =>
                    h(Icon, {
                      name: 'chevron-left',
                      class: transferMoveToSourceIconClasses,
                      'aria-hidden': true
                    })
                }
              )
            ]),
            renderPanel(
              'target',
              labels.value.targetTitle,
              computedData.value.targetItems,
              filteredTarget.value,
              search.value.target ?? ''
            )
          ]
        )
    }
  })
)

export default Transfer
