import React, { forwardRef, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  devWarn,
  getDescriptionsClasses,
  getDescriptionsContentClasses,
  getDescriptionsHorizontalColSpan,
  getDescriptionsLabelClasses,
  getDescriptionsTableClasses,
  getDescriptionsVerticalGridStyle,
  getDescriptionsVerticalItemClasses,
  getDescriptionsLabels,
  groupItemsIntoRows,
  descriptionsCaptionClasses,
  descriptionsExtraClasses,
  descriptionsHeaderClasses,
  descriptionsTitleClasses,
  isResponsiveMap,
  mergeTigerLocale,
  observeElementSize,
  resolveResponsiveValue,
  type ComponentSize,
  type DescriptionsItem,
  type DescriptionsLayout,
  type DescriptionsProps as CoreDescriptionsProps,
  type ResponsiveBreakpoint,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface DescriptionsProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    Omit<CoreDescriptionsProps, 'title' | 'extra' | 'labelStyle' | 'contentStyle'> {
  title?: React.ReactNode
  extra?: React.ReactNode
  labelStyle?: React.CSSProperties
  contentStyle?: React.CSSProperties
  items?: DescriptionsItem[]
  column?: number | Partial<Record<ResponsiveBreakpoint, number>>
  locale?: Partial<TigerLocale>
}

function renderColon(show: boolean, glyph: string): string {
  return show ? glyph : ''
}

export const Descriptions = forwardRef<HTMLDivElement, DescriptionsProps>(function Descriptions(
  {
    title,
    extra,
    bordered = false,
    column: columnProp = 3,
    size = 'md' as ComponentSize,
    layout = 'horizontal' as DescriptionsLayout,
    colon = true,
    labelStyle,
    contentStyle,
    items = [],
    className,
    children,
    locale,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const colonGlyph = getDescriptionsLabels(mergedLocale).colon
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const isResponsive = isResponsiveMap(columnProp)
  const [containerWidth, setContainerWidth] = useState(0)

  useLayoutEffect(() => {
    if (!isResponsive) return undefined
    return observeElementSize(rootRef.current, ({ width }) => setContainerWidth(width))
  }, [isResponsive])

  const column = useMemo(
    () => resolveResponsiveValue(columnProp, containerWidth, 3),
    [columnProp, containerWidth]
  )

  if (children && items.length === 0) {
    devWarn(
      'Descriptions.children',
      'Descriptions: `items` is the data source. Default children are ignored and are not description rows.'
    )
  }

  const rows = groupItemsIntoRows(items, column)
  const labelledBy = title ? titleId : undefined
  const rootClasses = classNames(getDescriptionsClasses(size, bordered), className)

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const renderLabel = (item: DescriptionsItem) => (
    <>
      {item.label}
      {renderColon(colon, colonGlyph)}
    </>
  )

  const renderHorizontal = () => {
    if (items.length === 0) return null
    return (
      <table className={getDescriptionsTableClasses(bordered)} aria-labelledby={labelledBy}>
        {useCaption ? (
          <caption className={descriptionsCaptionClasses} id={titleId}>
            {title}
          </caption>
        ) : null}
        <tbody>
          {rows.map((rowItems, rowIndex) => (
            <tr key={rowIndex}>
              {rowItems.map((item, itemIndex) => {
                const span = item.span || 1
                return (
                  <React.Fragment key={`${rowIndex}-${itemIndex}`}>
                    <th
                      scope="row"
                      className={classNames(
                        getDescriptionsLabelClasses(bordered, size, 'horizontal'),
                        item.labelClassName
                      )}
                      style={labelStyle}>
                      {renderLabel(item)}
                    </th>
                    <td
                      className={classNames(
                        getDescriptionsContentClasses(bordered, size, 'horizontal'),
                        item.contentClassName
                      )}
                      style={contentStyle}
                      colSpan={getDescriptionsHorizontalColSpan(span)}>
                      {item.content as React.ReactNode}
                    </td>
                  </React.Fragment>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const renderVertical = () => {
    if (items.length === 0) return null

    if (bordered) {
      return (
        <table className={getDescriptionsTableClasses(true)} aria-labelledby={labelledBy}>
          {useCaption ? (
            <caption className={descriptionsCaptionClasses} id={titleId}>
              {title}
            </caption>
          ) : null}
          <tbody>
            {rows.map((rowItems, rowIndex) => (
              <tr key={rowIndex}>
                {rowItems.map((item, itemIndex) => (
                  <td
                    key={`${rowIndex}-${itemIndex}`}
                    colSpan={item.span || 1}
                    className={getDescriptionsVerticalItemClasses(size, true)}>
                    <div
                      className={classNames(
                        getDescriptionsLabelClasses(true, size, 'vertical'),
                        item.labelClassName
                      )}
                      style={labelStyle}>
                      {renderLabel(item)}
                    </div>
                    <div
                      className={classNames(
                        getDescriptionsContentClasses(true, size, 'vertical'),
                        item.contentClassName
                      )}
                      style={contentStyle}>
                      {item.content as React.ReactNode}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    return (
      <dl
        className={classNames('grid w-full')}
        style={getDescriptionsVerticalGridStyle(column)}
        aria-labelledby={labelledBy}>
        {rows.flatMap((rowItems, rowIndex) =>
          rowItems.map((item, itemIndex) => (
            <div
              key={`${rowIndex}-${itemIndex}`}
              className={getDescriptionsVerticalItemClasses(size, false)}
              style={{ gridColumn: `span ${item.span || 1}` }}>
              <dt
                className={classNames(
                  getDescriptionsLabelClasses(false, size, 'vertical'),
                  item.labelClassName
                )}
                style={labelStyle}>
                {renderLabel(item)}
              </dt>
              <dd
                className={classNames(
                  getDescriptionsContentClasses(false, size, 'vertical'),
                  item.contentClassName
                )}
                style={contentStyle}>
                {item.content as React.ReactNode}
              </dd>
            </div>
          ))
        )}
      </dl>
    )
  }

  const useCaption = Boolean(title && !extra && (layout === 'horizontal' || bordered))
  const showHeader = Boolean(extra || (title && !useCaption))

  return (
    <div ref={setRootRef} className={rootClasses} {...props}>
      {showHeader ? (
        <div className={descriptionsHeaderClasses}>
          {title ? (
            <div className={descriptionsTitleClasses} id={titleId}>
              {title}
            </div>
          ) : null}
          {extra ? <div className={descriptionsExtraClasses}>{extra}</div> : null}
        </div>
      ) : null}
      {layout === 'horizontal' ? renderHorizontal() : renderVertical()}
    </div>
  )
})

Descriptions.displayName = 'Descriptions'

export default Descriptions
