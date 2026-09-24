import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  inject,
  useId,
  type PropType,
  type VNode
} from 'vue'
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
  coerceArrayFormValue,
  coerceClassValue,
  dedupeTransferKeys,
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
  partitionTransferSelection,
  resolveFormItemSeed,
  resolveLocaleText,
  resolveTransferValue,
  sameTransferKeys,
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
  getTransferPanelBodyStyle,
  getTransferVirtualWindow,
  transferListNeedsWindow,
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
  children?: VNode
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
      defaultValue: { type: Array as PropType<(string | number)[]>, default: undefined },
      readOnly: { type: Boolean, default: false },
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
      'update:searchValue',
      'update:selectedKeys'
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
      const formBound = computed(
        () => props.modelValue === undefined && Boolean(formItemControl?.name.value)
      )
      const seededKeys = computed(() =>
        resolveFormItemSeed(
          props.modelValue,
          formItemControl?.name.value,
          formItemControl?.value.value,
          coerceArrayFormValue<string | number>
        )
      )
      const controlledKeys = computed(() =>
        props.modelValue !== undefined || formBound.value
          ? resolveTransferValue(seededKeys.value ?? [])
          : undefined
      )

      const internalTarget = ref<(string | number)[]>(dedupeTransferKeys(props.defaultValue ?? []))
      if (
        formItemControl?.name.value &&
        props.modelValue === undefined &&
        (formItemControl.value.value === '' || formItemControl.value.value == null) &&
        props.defaultValue !== undefined
      ) {
        formItemControl.onChange(dedupeTransferKeys(props.defaultValue))
      }
      const targetValue = computed(() => controlledKeys.value ?? internalTarget.value)
      const canMutate = computed(
        () => !effectiveDisabled.value && !props.readOnly
      )
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

      function setTarget(next: (string | number)[]) {
        if (sameTransferKeys(next, targetValue.value)) return
        if (controlledKeys.value === undefined) internalTarget.value = next
        emit('update:modelValue', next)
        formItemControl?.onChange(next)
      }

      function setSelected(next: TransferSelectedKeys) {
        if (props.selectedKeys === undefined) internalSelected.value = next
        emit('update:selectedKeys', next)
      }

      function updateSearch(panel: keyof TransferSearchValue, value: string) {
        if ((search.value[panel] ?? '') === value) return
        const next = { ...search.value, [panel]: value }
        if (props.searchValue === undefined) internalSearch.value = next
        emit('update:searchValue', next)
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
      const sourceSelection = computed(() =>
        partitionTransferSelection(selected.value.source, filteredSource.value)
      )
      const targetSelection = computed(() =>
        partitionTransferSelection(selected.value.target, filteredTarget.value)
      )
      const canMoveRight = computed(() =>
        canMoveTransferItems(sourceSelection.value.visible, props.dataSource, !canMutate.value)
      )
      const canMoveLeft = computed(() =>
        canMoveTransferItems(targetSelection.value.visible, props.dataSource, !canMutate.value)
      )

      function move(direction: 'left' | 'right') {
        if (!canMutate.value) return
        if (direction === 'right' && !canMoveRight.value) return
        if (direction === 'left' && !canMoveLeft.value) return
        const selectedKeys =
          direction === 'right' ? sourceSelection.value.visible : targetSelection.value.visible
        const result = moveTransferItems(
          direction,
          targetValue.value,
          selectedKeys,
          props.dataSource
        )
        const movedIds = new Set(result.movedKeys.map(transferKeyId))
        setTarget(result.targetKeys)
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

      const sourceScroll = ref(0)
      const targetScroll = ref(0)

      function renderTransferRow(item: TransferItem, selectedKeys: (string | number)[], panel: 'source' | 'target') {
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
              onChange: () => {
                if (!canMutate.value) return
                setSelected({
                  ...selected.value,
                  [panel]: toggleTransferKey(selected.value[panel], item.key)
                })
              },
              children: h('span', { class: 'min-w-0' }, [
                h('span', { class: 'block truncate' }, item.label),
                item.description
                  ? h('span', { class: transferItemDescriptionClasses }, item.description)
                  : null
              ])
            })
          ]
        )
      }

      function renderTransferRows(
        panel: 'source' | 'target',
        items: TransferItem[],
        selectedKeys: (string | number)[]
      ) {
        if (!transferListNeedsWindow(items, props.size)) {
          return items.map((item) => renderTransferRow(item, selectedKeys, panel))
        }
        const scrollTop = panel === 'source' ? sourceScroll.value : targetScroll.value
        const range = getTransferVirtualWindow(items, scrollTop, props.size)
        const slice = items.slice(range.startIndex, range.endIndex + 1)
        return h(
          'div',
          { style: { height: `${range.totalHeight}px`, position: 'relative' } },
          [
            h(
              'div',
              { style: { transform: `translateY(${range.offsetTop}px)` } },
              slice.map((item) => renderTransferRow(item, selectedKeys, panel))
            )
          ]
        )
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
                if (!canMutate.value) return
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
                { class: 'font-medium text-[var(--tiger-text)]' },
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
                readonly: props.readOnly || undefined,
                'aria-label': labels.value.searchAriaLabel.replace('{title}', title),
                onInput: (event: Event) => {
                  if (!canMutate.value) return
                  updateSearch(panel, (event.target as HTMLInputElement).value)
                },
                onKeydown: (event: KeyboardEvent) => {
                  if (event.key === 'Enter') event.preventDefault()
                }
              })
            : null,
          h(
            'div',
            {
              class: transferPanelBodyClasses,
              style: getTransferPanelBodyStyle(),
              onScroll: (event: Event) => {
                const top = (event.target as HTMLElement).scrollTop
                if (panel === 'source') sourceScroll.value = top
                else targetScroll.value = top
              }
            },
            [
              visibleItems.length > 0
                ? renderTransferRows(panel, visibleItems, selectedKeys)
                : h(
                    'div',
                    { class: transferEmptyClasses },
                    resolveLocaleText(
                      'No data',
                      props.emptyText,
                      mergedLocale.value?.common?.emptyText
                    )
                  )
            ]
          ),
          (() => {
            const hidden = partitionTransferSelection(selectedKeys, visibleItems).hidden
            if (hidden.length === 0) return null
            const clearText = mergedLocale.value?.common?.clearText ?? 'Clear'
            return h(
              'div',
              {
                class:
                  'flex items-center justify-between gap-2 border-t border-[var(--tiger-border)] px-3 py-1 text-xs'
              },
              [
                h('span', { role: 'status' }, `${hidden.length} selected hidden by search`),
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'text-[var(--tiger-primary)]',
                    disabled: !canMutate.value,
                    'aria-label': clearText,
                    onClick: () => {
                      const hiddenIds = new Set(hidden.map(transferKeyId))
                      setSelected({
                        ...selected.value,
                        [panel]: selectedKeys.filter((key) => !hiddenIds.has(transferKeyId(key)))
                      })
                    }
                  },
                  clearText
                )
              ]
            )
          })()
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
              status.value === 'error' && 'ring-1 ring-[var(--tiger-error)]',
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
              ? targetValue.value.length > 0
                ? targetValue.value.map((key) =>
                    h('input', {
                      key: transferKeyId(key),
                      type: 'hidden',
                      name: fieldName.value,
                      value: String(key),
                      disabled: effectiveDisabled.value || undefined
                    })
                  )
                : h('input', {
                    type: 'hidden',
                    name: fieldName.value,
                    value: '',
                    disabled: effectiveDisabled.value || undefined
                  })
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
