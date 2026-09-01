import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle
} from 'react'
import { useControlledState } from '../hooks/useControlledState'
import {
  classNames,
  getRichTextContainerClasses,
  getToolbarButtonClasses,
  getEditorAreaClasses,
  richTextToolbarClasses,
  richTextToolbarSeparatorClasses,
  richTextPlaceholderClasses,
  createDefaultRichTextToolbar,
  findHotkeyMatch,
  isContentEmpty,
  parseHeight,
  builtinRichTextEngine,
  isToolbarSeparator,
  mergeTigerLocale,
  getRichTextEditorLabels,
  getToolbarButtons,
  nextToolbarRovingIndex,
  type RichTextEditorMode,
  type ToolbarButton,
  type ToolbarItem,
  type RichTextEngine,
  type RichTextEngineInstance,
  type TigerLocale,
  type TigerLocaleRichTextEditor
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'

export interface RichTextEditorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  value?: string
  defaultValue?: string
  placeholder?: string
  mode?: RichTextEditorMode
  toolbar?: ToolbarItem[]
  height?: number | string
  readOnly?: boolean
  disabled?: boolean
  onChange?: (html: string) => void
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleRichTextEditor>
  /**
   * Optional pluggable editor engine. Custom engines are TRUSTED and
   * must sanitise untrusted HTML themselves.
   */
  engine?: RichTextEngine
  ariaLabel?: string
  name?: string
  onRequestUrl?: (kind: 'link' | 'image') => string | null
}

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      defaultValue = '',
      placeholder,
      mode = 'html',
      toolbar,
      height = 300,
      readOnly = false,
      disabled = false,
      onChange,
      locale,
      labels: labelsOverride,
      className,
      engine,
      ariaLabel,
      name,
      id,
      onRequestUrl,
      onFocus,
      onBlur,
      ...restProps
    },
    ref
  ) {
    const config = useTigerConfig()
    const formItemControl = useFormItemControlContext()
    const editorRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<RichTextEngineInstance | null>(null)
    const formBoundValue = formItemControl?.value
    const resolvedValue =
      value !== undefined ? value : typeof formBoundValue === 'string' ? formBoundValue : undefined
    const [currentContent, setContent] = useControlledState({
      value: resolvedValue,
      defaultValue,
      onChange: (next) => {
        onChange?.(next)
        formItemControl?.onChange?.(next)
      }
    })
    const isControlled = value !== undefined
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
    const [toolbarIndex, setToolbarIndex] = useState(0)
    const empty = isContentEmpty(currentContent)
    const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
    const effectiveId = id ?? formItemControl?.id
    const effectiveName = name ?? formItemControl?.name
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const labels = useMemo(
      () => getRichTextEditorLabels(mergedLocale, labelsOverride),
      [mergedLocale, labelsOverride]
    )
    const toolbarItems = useMemo(
      () => (mode === 'plain' ? [] : (toolbar ?? createDefaultRichTextToolbar(labels))),
      [toolbar, labels, mode]
    )
    const toolbarButtons = useMemo(() => getToolbarButtons(toolbarItems), [toolbarItems])

    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement)

    useEffect(() => {
      if (!editorRef.current) return
      const factory = engine ?? builtinRichTextEngine
      const instance = factory.create({
        element: editorRef.current,
        initialValue: isControlled ? value! : defaultValue,
        mode,
        readOnly,
        disabled: effectiveDisabled,
        placeholder,
        toolbar: toolbarItems,
        requestUrl: onRequestUrl,
        notifyChange(html) {
          setContent(html)
        },
        notifyActiveFormats(next) {
          setActiveFormats(next)
        }
      })
      engineRef.current = instance
      return () => {
        instance.destroy()
        engineRef.current = null
      }
    }, [engine])

    useEffect(() => {
      if (isControlled && engineRef.current && value !== undefined) {
        engineRef.current.setValue(value)
      }
    }, [value, isControlled])

    useEffect(() => {
      engineRef.current?.setReadOnly(readOnly, effectiveDisabled)
    }, [readOnly, effectiveDisabled])

    useEffect(() => {
      engineRef.current?.setMode(mode)
    }, [mode])

    useEffect(() => {
      engineRef.current?.setToolbar(toolbarItems)
    }, [toolbarItems])

    const execButtonAction = useCallback(
      (btn: ToolbarButton) => {
        if (readOnly || effectiveDisabled) return
        engineRef.current?.exec(btn.name)
      },
      [readOnly, effectiveDisabled]
    )

    const handleKeydown = useCallback(
      (e: React.KeyboardEvent) => {
        if (readOnly || effectiveDisabled) return
        const match = findHotkeyMatch(toolbarItems, e.nativeEvent)
        if (match) {
          e.preventDefault()
          execButtonAction(match)
        }
      },
      [toolbarItems, execButtonAction, readOnly, effectiveDisabled]
    )

    const handleToolbarKeydown = useCallback(
      (e: React.KeyboardEvent) => {
        const next = nextToolbarRovingIndex(toolbarIndex, toolbarButtons.length, e.key)
        if (next === null) return
        e.preventDefault()
        setToolbarIndex(next)
        const root = (e.currentTarget as HTMLElement).querySelectorAll('button')
        root[next]?.focus()
      },
      [toolbarIndex, toolbarButtons.length]
    )

    const containerClasses = useMemo(
      () => classNames(getRichTextContainerClasses(effectiveDisabled, className)),
      [effectiveDisabled, className]
    )

    const editorAreaClasses = useMemo(() => getEditorAreaClasses(readOnly), [readOnly])

    const containerStyle: React.CSSProperties | undefined = useMemo(() => {
      const ht = parseHeight(height)
      if (!ht) return undefined
      return { height: ht }
    }, [height])

    const hostRest: Record<string, unknown> = {}
    const containerRest: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(restProps)) {
      if (
        key === 'id' ||
        key === 'name' ||
        key.startsWith('data-') ||
        key.startsWith('aria-') ||
        key === 'onFocus' ||
        key === 'onBlur'
      ) {
        hostRest[key] = val
      } else {
        containerRest[key] = val
      }
    }

    return (
      <div className={containerClasses} style={containerStyle} data-tiger-rte="" {...containerRest}>
        {toolbarItems.length > 0 && (
          <div
            className={richTextToolbarClasses}
            role="toolbar"
            aria-label={labels.formattingToolbarAriaLabel}
            onKeyDown={handleToolbarKeydown}>
            {toolbarItems.map((item, idx) => {
              if (isToolbarSeparator(item)) {
                return (
                  <div
                    key={`sep-${idx}`}
                    className={richTextToolbarSeparatorClasses}
                    role="separator"
                    aria-orientation="vertical"
                  />
                )
              }
              const btn = item
              const buttonIndex = toolbarButtons.findIndex((entry) => entry.name === btn.name)
              return (
                <button
                  key={btn.name}
                  type="button"
                  className={getToolbarButtonClasses(activeFormats.has(btn.name))}
                  title={btn.tooltip ?? btn.label}
                  aria-label={btn.label}
                  aria-pressed={activeFormats.has(btn.name)}
                  tabIndex={buttonIndex === toolbarIndex ? 0 : -1}
                  disabled={effectiveDisabled || readOnly}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execButtonAction(btn)}>
                  {btn.icon ? <span dangerouslySetInnerHTML={{ __html: btn.icon }} /> : btn.label}
                </button>
              )
            })}
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={editorRef}
            className={editorAreaClasses}
            role="textbox"
            id={effectiveId}
            aria-label={
              ariaLabel ?? (hostRest['aria-label'] as string | undefined) ?? labels.editorAriaLabel
            }
            aria-labelledby={
              (hostRest['aria-labelledby'] as string | undefined) ?? formItemControl?.labelId
            }
            aria-multiline={true}
            aria-readonly={readOnly || undefined}
            aria-disabled={effectiveDisabled || undefined}
            aria-placeholder={placeholder}
            data-placeholder={placeholder}
            data-name={effectiveName}
            tabIndex={readOnly && !effectiveDisabled ? 0 : undefined}
            onKeyDown={handleKeydown}
            onFocus={onFocus}
            onBlur={(event) => {
              formItemControl?.onBlur?.()
              onBlur?.(event)
            }}
            suppressContentEditableWarning
            {...hostRest}
          />
          {empty && placeholder && (
            <div
              className={`${richTextPlaceholderClasses} absolute top-0 start-0 p-4 pointer-events-none text-sm`}
              aria-hidden={true}>
              {placeholder}
            </div>
          )}
        </div>
      </div>
    )
  }
)

export default RichTextEditor
