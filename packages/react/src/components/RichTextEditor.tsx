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
  toolbarForRichTextMode,
  sanitizeHtml,
  manageLiveRegion,
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
      style,
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
    const isControlled = value !== undefined || typeof formBoundValue === 'string'
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
    const [urlPrompt, setUrlPrompt] = useState<'link' | 'image' | null>(null)
    const [urlDraft, setUrlDraft] = useState('')
    const urlRef = useRef<string | null>(null)
    const liveRef = useRef<ReturnType<typeof manageLiveRegion> | null>(null)
    const toolbarItems = useMemo(
      () => toolbarForRichTextMode(toolbar ?? createDefaultRichTextToolbar(labels), mode),
      [toolbar, labels, mode]
    )
    const toolbarButtons = useMemo(() => getToolbarButtons(toolbarItems), [toolbarItems])

    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement)

    useEffect(() => {
      const region = manageLiveRegion('polite')
      liveRef.current = region
      return () => {
        region.destroy()
        liveRef.current = null
      }
    }, [])

    const createOptionsRef = useRef({
      isControlled,
      value: resolvedValue,
      defaultValue,
      mode,
      readOnly,
      effectiveDisabled,
      placeholder,
      toolbarItems,
      onRequestUrl,
      setContent
    })
    createOptionsRef.current = {
      isControlled,
      value: resolvedValue,
      defaultValue,
      mode,
      readOnly,
      effectiveDisabled,
      placeholder,
      toolbarItems,
      onRequestUrl,
      setContent
    }

    useEffect(() => {
      if (!editorRef.current) return
      const options = createOptionsRef.current
      const factory = engine ?? builtinRichTextEngine
      const instance = factory.create({
        element: editorRef.current,
        initialValue: options.value ?? options.defaultValue ?? '',
        mode: options.mode,
        readOnly: options.readOnly,
        disabled: options.effectiveDisabled,
        placeholder: options.placeholder,
        toolbar: options.toolbarItems,
        requestUrl: (kind) => {
          const external = createOptionsRef.current.onRequestUrl
          if (external) return external(kind)
          return urlRef.current
        },
        announce(message) {
          liveRef.current?.announce(message)
        },
        notifyChange(html) {
          const currentMode = createOptionsRef.current.mode ?? 'html'
          createOptionsRef.current.setContent(currentMode === 'html' ? sanitizeHtml(html) : html)
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
      if (isControlled && engineRef.current && resolvedValue !== undefined) {
        engineRef.current.setValue(resolvedValue)
      }
    }, [resolvedValue, isControlled])

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
        if ((btn.name === 'link' || btn.name === 'image') && !onRequestUrl) {
          setUrlPrompt(btn.name)
          setUrlDraft('')
          return
        }
        engineRef.current?.exec(btn.name)
      },
      [onRequestUrl, readOnly, effectiveDisabled]
    )

    const submitUrlPrompt = useCallback(() => {
      if (!urlPrompt) return
      urlRef.current = urlDraft.trim() || null
      engineRef.current?.exec(urlPrompt)
      urlRef.current = null
      setUrlPrompt(null)
      setUrlDraft('')
    }, [urlDraft, urlPrompt])

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
      const heightStyle = ht ? { height: ht } : undefined
      if (!heightStyle && !style) return undefined
      return { ...heightStyle, ...style }
    }, [height, style])

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
                  {btn.icon ? (
                    <svg
                      viewBox={btn.icon.viewBox ?? '0 0 24 24'}
                      width="16"
                      height="16"
                      aria-hidden="true">
                      <path d={btn.icon.path} fill="currentColor" />
                    </svg>
                  ) : (
                    btn.label
                  )}
                </button>
              )
            })}
          </div>
        )}
        {urlPrompt ? (
          <form
            className="flex items-center gap-2 border-b border-[var(--tiger-border)] px-2 py-1.5"
            onSubmit={(event) => {
              event.preventDefault()
              submitUrlPrompt()
            }}>
            <input
              className="min-w-0 flex-1 rounded border border-[var(--tiger-border)] bg-transparent px-2 py-1 text-sm"
              aria-label={urlPrompt === 'image' ? labels.image : labels.link}
              placeholder="https://"
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
            />
            <button type="submit" className={getToolbarButtonClasses(false)}>
              {urlPrompt === 'image' ? labels.image : labels.link}
            </button>
          </form>
        ) : null}

        <div className="relative flex-1 min-h-0">
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
