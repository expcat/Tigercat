import React, { forwardRef, useCallback, useId, useMemo } from 'react'
import {
  chevronLeftSolidIcon20PathD,
  composeComponentClasses,
  getPageHeaderBackButtonClasses,
  getPageHeaderRootClasses,
  hasPageHeaderHeadingContent,
  hasPageHeaderNode,
  resolvePageHeaderHeadingTag,
  mergeTigerLocale,
  getPageHeaderLabels,
  icon20ViewBox,
  pageHeaderActionsClasses,
  pageHeaderBackIconClasses,
  pageHeaderBackWrapClasses,
  pageHeaderContentClasses,
  pageHeaderHeadingRowClasses,
  pageHeaderMainClasses,
  pageHeaderStartClasses,
  pageHeaderSubtitleClasses,
  pageHeaderTitleClasses,
  pageHeaderTitleRowClasses,
  resolvePageHeaderBackAriaLabel,
  resolvePageHeaderBackVisibility,
  type PageHeaderProps as CorePageHeaderProps,
  type TigerLocale,
  type TigerLocalePageHeader
} from '@expcat/tigercat-core'
import { Button } from './Button'
import { Link } from './Link'
import { useTigerConfig } from './ConfigProvider'

export interface PageHeaderProps
  extends
    Omit<CorePageHeaderProps, 'style' | 'title' | 'subTitle'>,
    Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /**
   * Page title. Accepts a node so it matches the Vue `#title` slot.
   */
  title?: React.ReactNode
  /**
   * Secondary text shown beside the title
   */
  subTitle?: React.ReactNode
  /**
   * Breadcrumb row, typically a Breadcrumb component
   */
  breadcrumb?: React.ReactNode
  /**
   * Right-aligned action area
   */
  actions?: React.ReactNode
  /**
   * Custom back control. Replaces the default Button / Link when provided.
   */
  back?: React.ReactNode
  /**
   * Called when the default back control is activated
   */
  onBack?: (event: React.MouseEvent<HTMLElement>) => void
  children?: React.ReactNode
  style?: React.CSSProperties
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocalePageHeader>
}

function BackIcon() {
  return (
    <svg
      className={pageHeaderBackIconClasses}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon20ViewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false">
      <path fillRule="evenodd" d={chevronLeftSolidIcon20PathD} clipRule="evenodd" />
    </svg>
  )
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      showBack,
      backHref,
      backAriaLabel,
      title,
      subTitle,
      breadcrumb,
      actions,
      back,
      onBack,
      headingLevel,
      className,
      style,
      children,
      locale,
      labels: labelsOverride,
      ...rest
    },
    ref
  ) => {
    const config = useTigerConfig()
    const titleId = `tiger-page-header-title-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const headerLabels = useMemo(
      () => getPageHeaderLabels(mergedLocale, labelsOverride),
      [mergedLocale, labelsOverride]
    )
    const hasBackOverride = hasPageHeaderNode(back)
    const hasBreadcrumb = hasPageHeaderNode(breadcrumb)
    const hasTitle = hasPageHeaderNode(title) && title !== ''
    const hasSubtitle = hasPageHeaderNode(subTitle) && subTitle !== ''
    const hasActions = hasPageHeaderNode(actions)
    const hasBody = hasPageHeaderNode(children)

    const showBackControl = resolvePageHeaderBackVisibility({
      showBack,
      hasHandler: typeof onBack === 'function',
      hasBackHref: Boolean(backHref),
      hasBackOverride
    })

    const showHeading = hasPageHeaderHeadingContent({
      showBack: showBackControl,
      hasBreadcrumb,
      hasTitle,
      hasSubtitle,
      hasActions
    })

    const resolvedBackAriaLabel = resolvePageHeaderBackAriaLabel(
      backAriaLabel,
      headerLabels.backAriaLabel
    )
    const TitleTag = resolvePageHeaderHeadingTag(headingLevel)
    const rootClasses = useMemo(
      () => composeComponentClasses(getPageHeaderRootClasses(className)),
      [className]
    )
    const backButtonClasses = useMemo(() => getPageHeaderBackButtonClasses(), [])

    const handleBack = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        onBack?.(event)
      },
      [onBack]
    )

    const defaultBackControl = backHref ? (
      <Link
        href={backHref}
        underline={false}
        variant="default"
        className={backButtonClasses}
        aria-label={resolvedBackAriaLabel}
        onClick={handleBack}>
        <BackIcon />
      </Link>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        className={backButtonClasses}
        aria-label={resolvedBackAriaLabel}
        onClick={handleBack}>
        <BackIcon />
      </Button>
    )

    return (
      <header
        {...rest}
        ref={ref}
        data-page-header=""
        className={rootClasses}
        style={style}
        aria-labelledby={hasTitle ? titleId : undefined}>
        {showHeading ? (
          <div className={pageHeaderHeadingRowClasses} data-page-header-heading="">
            <div className={pageHeaderStartClasses}>
              {showBackControl ? (
                <div className={pageHeaderBackWrapClasses} data-page-header-back="">
                  {hasBackOverride ? back : defaultBackControl}
                </div>
              ) : null}
              {hasBreadcrumb || hasTitle || hasSubtitle ? (
                <div className={pageHeaderMainClasses}>
                  {hasBreadcrumb ? breadcrumb : null}
                  {hasTitle || hasSubtitle ? (
                    <div className={pageHeaderTitleRowClasses}>
                      {hasTitle ? (
                        <TitleTag
                          id={titleId}
                          className={pageHeaderTitleClasses}
                          data-page-header-title="">
                          {title}
                        </TitleTag>
                      ) : null}
                      {hasSubtitle ? (
                        <div className={pageHeaderSubtitleClasses} data-page-header-subtitle="">
                          {subTitle}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            {hasActions ? (
              <div className={pageHeaderActionsClasses} data-page-header-actions="">
                {actions}
              </div>
            ) : null}
          </div>
        ) : null}
        {hasBody ? <div className={pageHeaderContentClasses}>{children}</div> : null}
      </header>
    )
  }
)
PageHeader.displayName = 'PageHeader'

export default PageHeader
