import { defineComponent, getCurrentInstance, h, PropType } from 'vue'
import {
  chevronLeftSolidIcon20PathD,
  coerceClassValue,
  composeComponentClasses,
  getPageHeaderBackButtonClasses,
  getPageHeaderRootClasses,
  hasPageHeaderHeadingContent,
  icon20ViewBox,
  mergeStyleValues,
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
  resolvePageHeaderBackVisibility
} from '@expcat/tigercat-core'
import { Button } from './Button'
import { Link } from './Link'

export interface VuePageHeaderProps {
  showBack?: boolean
  backHref?: string
  backAriaLabel?: string
  title?: string
  subTitle?: string
  className?: string
  style?: Record<string, unknown>
}

function hasSlotContent(nodes: unknown): boolean {
  return Array.isArray(nodes) && nodes.length > 0
}

function createBackIcon() {
  return h(
    'svg',
    {
      class: pageHeaderBackIconClasses,
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: icon20ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true',
      focusable: 'false'
    },
    [
      h('path', {
        'fill-rule': 'evenodd',
        d: chevronLeftSolidIcon20PathD,
        'clip-rule': 'evenodd'
      })
    ]
  )
}

export const PageHeader = defineComponent({
  name: 'TigerPageHeader',
  inheritAttrs: false,
  props: {
    /**
     * Whether to show the back control.
     * When omitted, the control is shown if `@back`, `backHref`, or a `#back`
     * slot is provided. Set `false` to force-hide.
     */
    showBack: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    /**
     * Navigation URL for the default back control. Renders a Link instead of
     * a Button when set and no `#back` slot is provided.
     */
    backHref: {
      type: String,
      default: undefined
    },
    /**
     * Accessible name for the default back control
     * @default 'Back'
     */
    backAriaLabel: {
      type: String,
      default: undefined
    },
    /**
     * Page title
     */
    title: {
      type: String,
      default: undefined
    },
    /**
     * Secondary text shown beside the title
     */
    subTitle: {
      type: String,
      default: undefined
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Inline styles
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: {
    /**
     * Emitted when the default back control is activated
     */
    back: (event: MouseEvent) => event instanceof MouseEvent
  },
  setup(props, { slots, emit, attrs }) {
    const instance = getCurrentInstance()

    const handleBack = (event: MouseEvent) => {
      emit('back', event)
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const vnodeProps = instance?.vnode.props as Record<string, unknown> | undefined
      const breadcrumb = slots.breadcrumb?.()
      const titleSlot = slots.title?.()
      const subTitleSlot = slots.subTitle?.()
      const actions = slots.actions?.()
      const backOverride = slots.back?.()
      const body = slots.default?.()

      const hasBreadcrumb = hasSlotContent(breadcrumb)
      const hasTitleSlot = hasSlotContent(titleSlot)
      const hasSubTitleSlot = hasSlotContent(subTitleSlot)
      const hasActions = hasSlotContent(actions)
      const hasBackOverride = hasSlotContent(backOverride)
      const hasBody = hasSlotContent(body)
      const titleContent = hasTitleSlot ? titleSlot : props.title
      const subTitleContent = hasSubTitleSlot ? subTitleSlot : props.subTitle
      const hasTitle = hasTitleSlot || Boolean(props.title)
      const hasSubtitle = hasSubTitleSlot || Boolean(props.subTitle)

      const showBack = resolvePageHeaderBackVisibility({
        showBack: props.showBack,
        hasHandler: Boolean(vnodeProps && 'onBack' in vnodeProps),
        hasBackHref: Boolean(props.backHref),
        hasBackOverride
      })

      const showHeading = hasPageHeaderHeadingContent({
        showBack,
        hasBreadcrumb,
        hasTitle,
        hasSubtitle,
        hasActions
      })

      const backAriaLabel = resolvePageHeaderBackAriaLabel(props.backAriaLabel)
      const backControl = showBack
        ? h('div', { class: pageHeaderBackWrapClasses, 'data-page-header-back': '' }, [
            hasBackOverride
              ? backOverride
              : props.backHref
                ? h(
                    Link,
                    {
                      href: props.backHref,
                      underline: false,
                      variant: 'default' as const,
                      class: getPageHeaderBackButtonClasses(),
                      'aria-label': backAriaLabel,
                      onClick: handleBack
                    },
                    { default: () => [createBackIcon()] }
                  )
                : h(
                    Button,
                    {
                      variant: 'ghost' as const,
                      size: 'sm' as const,
                      className: getPageHeaderBackButtonClasses(),
                      'aria-label': backAriaLabel,
                      onClick: handleBack
                    },
                    { default: () => [createBackIcon()] }
                  )
          ])
        : null

      const mainColumn =
        hasBreadcrumb || hasTitle || hasSubtitle
          ? h('div', { class: pageHeaderMainClasses }, [
              hasBreadcrumb ? breadcrumb : null,
              hasTitle || hasSubtitle
                ? h('div', { class: pageHeaderTitleRowClasses }, [
                    hasTitle
                      ? h(
                          'div',
                          { class: pageHeaderTitleClasses, 'data-page-header-title': '' },
                          titleContent
                        )
                      : null,
                    hasSubtitle
                      ? h(
                          'div',
                          { class: pageHeaderSubtitleClasses, 'data-page-header-subtitle': '' },
                          subTitleContent
                        )
                      : null
                  ])
                : null
            ])
          : null

      const heading = showHeading
        ? h('div', { class: pageHeaderHeadingRowClasses, 'data-page-header-heading': '' }, [
            h('div', { class: pageHeaderStartClasses }, [backControl, mainColumn]),
            hasActions
              ? h(
                  'div',
                  { class: pageHeaderActionsClasses, 'data-page-header-actions': '' },
                  actions
                )
              : null
          ])
        : null

      return h(
        'header',
        {
          ...attrs,
          class: composeComponentClasses(
            getPageHeaderRootClasses(props.className),
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          'data-page-header': ''
        },
        [heading, hasBody ? h('div', { class: pageHeaderContentClasses }, body) : null]
      )
    }
  }
})

export default PageHeader
