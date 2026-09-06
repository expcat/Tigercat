import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  copyTextToClipboard,
  createCopyStatusReset,
  getCodeLabels,
  getIconDefinition,
  getTextClasses,
  isTextCopyable,
  mergeTigerLocale,
  resolveLocaleText,
  resolveTextCopyableOptions,
  resolveTextCopyContent,
  resolveTextTag,
  textCopyableBodyClasses,
  textCopyableButtonClasses,
  textCopyableLiveClasses,
  textCopyableRootClasses,
  type CodeCopyButtonStatus,
  type TextProps as CoreTextProps,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type TextProps = CoreTextProps &
  Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'children'> &
  Pick<React.LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> & {
    children?: React.ReactNode
    locale?: Partial<TigerLocale>
    onCopy?: (text: string) => void
  }

const copyIcon = getIconDefinition('copy')

function CopyGlyph() {
  if (!copyIcon) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={copyIcon.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true">
      {copyIcon.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    tag = 'p',
    size,
    weight,
    align,
    color,
    truncate,
    italic,
    underline,
    lineThrough,
    copyable,
    locale,
    children,
    className,
    onCopy,
    ...props
  },
  ref
) {
  const resolvedTag = resolveTextTag(tag)
  const copyEnabled = isTextCopyable(copyable)
  const copyOptions = resolveTextCopyableOptions(copyable)
  const textClasses = classNames(
    getTextClasses({
      size,
      weight,
      align,
      color,
      truncate,
      italic,
      underline,
      lineThrough,
      copyable
    }),
    !copyEnabled && className
  )
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getCodeLabels(mergedLocale), [mergedLocale])
  const idleLabel = resolveLocaleText(labels.copyLabel, copyOptions?.tooltip)
  const [copyStatus, setCopyStatus] = useState<CodeCopyButtonStatus>('idle')
  const resetRef = useRef<ReturnType<typeof createCopyStatusReset> | null>(null)
  if (resetRef.current == null) {
    resetRef.current = createCopyStatusReset(setCopyStatus)
  }
  useEffect(() => {
    const machine = resetRef.current
    return () => machine?.dispose()
  }, [])
  const bodyRef = useRef<HTMLSpanElement | null>(null)
  const buttonLabel =
    copyStatus === 'failed'
      ? labels.copyFailedLabel
      : copyStatus === 'copied'
        ? labels.copiedLabel
        : idleLabel
  const liveText = copyStatus === 'idle' ? '' : buttonLabel

  const handleCopy = async () => {
    if (!copyOptions) return
    const fallback = bodyRef.current?.textContent ?? ''
    const text = resolveTextCopyContent(copyOptions, fallback)
    const ok = await copyTextToClipboard(text)
    if (ok) {
      resetRef.current?.schedule('copied')
      copyOptions.onCopy?.(text)
      onCopy?.(text)
    } else {
      resetRef.current?.schedule('failed')
    }
  }

  if (!copyEnabled) {
    return React.createElement(resolvedTag, { ...props, ref, className: textClasses }, children)
  }

  return React.createElement(
    resolvedTag,
    { ...props, ref, className: classNames(textCopyableRootClasses, className) },
    <span
      ref={bodyRef}
      className={classNames(textCopyableBodyClasses, truncate && 'truncate', textClasses)}>
      {children}
    </span>,
    <button
      type="button"
      className={textCopyableButtonClasses}
      aria-label={buttonLabel}
      title={buttonLabel}
      onClick={() => {
        void handleCopy()
      }}>
      <CopyGlyph />
    </button>,
    <span className={textCopyableLiveClasses} aria-live="polite">
      {liveText}
    </span>
  )
})
Text.displayName = 'Text'
