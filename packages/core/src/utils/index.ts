/**
 * Core utils barrel.
 *
 * Each public name is exported from one module. `styles/` contributes class
 * strings; reducers and controllers are exported from their own modules.
 * Group folders are source layout, not package subpath exports.
 */

// Re-export all from organized sub-modules
export * from './helpers'
// Built-in registry helpers only. Extended `*Icon` constants stay on
// `@expcat/tigercat-core/icons/registry` so unused glyphs can tree-shake.
export {
  createIconRegistry,
  getIconDefinition,
  iconNames,
  iconRegistry,
  type IconDefinition,
  type IconName,
  type IconRegistry
} from './icons/registry'
export {
  ICON_STROKE_LINECAP,
  ICON_STROKE_LINEJOIN,
  ICON_STROKE_WIDTH,
  SVG_DEFAULT_VIEWBOX_20,
  SVG_DEFAULT_VIEWBOX_24,
  getSvgDefaultAttrs,
  mergeChildSvgAttrs,
  normalizeSvgAttrs,
  resolveIconPaintMode,
  resolveIconSvgAttrs,
  toVueSvgAttrs
} from './svg-attrs'
export * from './a11y'
export * from './i18n'
export * from './styles'
export * from './form-validation'
export * from './date-utils'
export * from './time-utils'
export * from './workflow-condition'
export * from './workflow-runtime'
export * from './tree-utils'
export * from './tree-controller'
export * from './menu-schema-utils'
export * from './menu-controller'
export * from './pagination-utils'
export * from './popup-menu-utils'
export * from './typeahead-highlight'
export * from './section-scroll-utils'
export * from './navigation-menu-controller'
export * from './container-utils'
export * from './layout-grid-styles'

// Motion utilities (animation + transition, consolidated)
export * from './motion'

// Floating UI positioning utilities
export * from './floating'
export * from './anchored-overlay'
export * from './portaled-overlay-lifecycle'

// Development-only warnings
export * from './dev-warn'

// ChatWindow utilities
export * from './chat-window-utils'

// ActivityFeed utilities
export {
  EMPTY_ACTIVITY_ITEMS,
  EMPTY_ACTIVITY_GROUPS,
  activityItemClasses,
  activityItemLayoutClasses,
  activityItemBodyClasses,
  activityItemHeaderClasses,
  activityItemTitleGroupClasses,
  activityItemDescriptionClasses,
  activityItemActionsClasses,
  sortActivityGroups,
  buildActivityGroups,
  resolveActivityCopy,
  toActivityTimelineItems
} from './activity-feed-utils'
export type { ActivityTimelineItem } from './activity-feed-utils'

// NotificationCenter utilities
export {
  EMPTY_NOTIFICATION_ITEMS,
  EMPTY_NOTIFICATION_GROUPS,
  sortNotificationGroups,
  buildNotificationGroups,
  shouldUseNotificationTabs,
  notificationItemKey,
  moveNotificationReadFilter,
  notificationItemsPendingRead
} from './notification-center-utils'

// CommentThread utilities
export {
  EMPTY_COMMENT_NODES,
  buildCommentTree,
  resolveCommentNodes,
  clipCommentTreeDepth,
  getCommentRepliesView,
  nextCommentRevealedCount,
  canSubmitCommentReply,
  commentIdKey,
  commentNodeAcceptsReply,
  formatCommentTreeError,
  resolveCommentLikeState,
  nextCommentLikeState,
  writeCommentLikeOverlay
} from './comment-thread-utils'
export type {
  CommentLikeOverlay,
  CommentLikeState,
  CommentLoadMoreKind,
  CommentRepliesView,
  CommentTreeBuild,
  CommentTreeError,
  CommentTreeErrorCode
} from './comment-thread-utils'

// Composite time helpers
export * from './composite-time-utils'
export * from './composite-list-utils'

// Countdown utilities
export * from './countdown-utils'

// TaskBoard utilities
export * from './task-board-utils'

// TaskBoard display view-model (filter / hidden / swimlane mapping)
export * from './task-board-view'

// TaskBoard drag controller (unified DnD + touch + keyboard)
export * from './task-board-drag'

// Cascader utilities
export * from './cascader-utils'

// AutoComplete utilities
export * from './auto-complete-utils'

// Signature utilities
export * from './signature-utils'

// NumberKeyboard utilities
export * from './number-keyboard-utils'

// InputOTP utilities
export * from './input-otp-utils'

// TagsInput utilities
export * from './tags-input-utils'

// MaskInput utilities
export * from './mask-input-utils'

// CronEditor utilities
export * from './cron-editor-utils'

// Picker (Select / AutoComplete / Cascader / ...) shared helpers
export * from './picker-utils'

// Spotlight utilities
export * from './spotlight-utils'

// ScrollSpy utilities
export * from './scroll-spy-utils'

// Transfer utilities
export * from './transfer-utils'

// TreeSelect utilities
export * from './tree-select-utils'

// Phase 1B/1C utilities (v0.6.0+)
export * from './rate-utils'
export * from './segmented-utils'
export * from './statistic-utils'
export * from './color-picker-utils'
export * from './color-swatch-utils'
export * from './virtual-list-utils'
export * from './calendar-utils'
export * from './calendar-controller'
export * from './caller-clock'
export * from './datepicker-controller'
export * from './timepicker-controller'
export * from './mentions-utils'
export * from './qrcode-utils'

// Table v0.6.0 upgrades
export * from './table-controller'
export * from './table-filter-utils'
export * from './table-group-utils'
export * from './table-resize-utils'

// Form v0.6.0 upgrades
export * from './form-dependency-utils'
export * from './form-history-utils'
export * from './form-control-utils'
export * from './form-controller'
export * from './i18n/w9/form-labels'
export * from './w9-form-enhancements'
export * from './form-item-value'
export * from './upload-queue-utils'
export * from './upload-controller'

// Responsive utilities
export * from './responsive'
export * from './viewport-utils'
export * from './viewport-floating-utils'
export * from './gesture-utils'

// Drag & Drop utilities (v0.8.0+)
export * from './drag'
export * from './list-reorder'
export * from './fullscreen-utils'

// Splitter utilities (v0.8.0+)
export * from './splitter-utils'

// Resizable utilities (v0.8.0+)
export * from './resizable-utils'

// ScrollArea utilities (v2.1.0+)
export * from './scroll-area-utils'

// CodeEditor utilities (v0.8.0+)
export * from './code-editor-utils'

// CodeEditor highlighter engine (PR-17)
export * from './code-highlighter'

// RichTextEditor utilities (v0.8.0+)
export * from './rich-text-editor-utils'

// MarkdownEditor utilities (v1.6+)
export * from './markdown-editor-utils'

// RichTextEditor engine (PR-17)
export * from './rich-text-engine'

// VirtualTable utilities (v0.8.0+)
export * from './virtual-table-utils'

// InfiniteScroll utilities (v0.8.0+)
export * from './infinite-scroll-utils'

// FileManager utilities (v0.8.0+)
export * from './file-utils'
export * from './file-manager-utils'

// ImageAnnotation utilities (v1.6+)
export * from './image-annotation-utils'

// OrgChart utilities (v1.6+)
export * from './org-chart-utils'

// Gantt utilities (v1.6+)
export * from './gantt-utils'

// InputGroup utilities (v0.9.0+)
export * from './input-group-utils'

// Repeated press utilities (v0.9.0+)
export * from './repeat-action-utils'

// Group component utilities (v0.9.0+)
export * from './group-utils'

// Chart resize utilities (v0.9.0+)
export * from './chart-resize-utils'
export * from './chart-interaction'

// Chart symbols reach this barrel once, through `styles` → `chart/`.

// PrintLayout utilities (v0.9.0+)
export * from './print-layout-utils'

export * from './image-lightbox'

// Composite shared helpers (FormWizard / CropUpload navigation + file pipeline)
export * from './form-wizard-utils'
export * from './workflow-detail-shell-utils'
export * from './table-toolbar-utils'
export * from './crop-upload-utils'

// AspectRatio utilities (v2.1.0+)
export * from './aspect-ratio-utils'

// Masonry utilities (v2.1.0+)
export * from './masonry-utils'

export * from './compose-classes'
export * from './chart-export-utils'
export * from './workflow-field-permissions'

export { resolveConfigDirection, resolveTigerConfig } from './config-provider-utils'
export type { ResolveTigerConfigInput } from './config-provider-utils'

export { createDocumentConfigHandle, readDocumentOwnerLocale } from './document-config'
export type { DocumentConfigHandle, DocumentConfigValues } from './document-config'

export { createRenderOutlet } from './overlay-outlet'
export type { RenderOutlet, RenderOutletItem } from './overlay-outlet'

export { createDismissActionEvent, settleDismissAction } from './confirm-action'

export {
  deriveAccentScale,
  accentScaleCssVars,
  ACCENT_STEP_COUNT,
  NEUTRAL_STEP_COUNT,
  SHADOW_STEP_COUNT
} from './accent-scale'
export type { AccentScale, AccentScaleOptions, RadiusScale } from './accent-scale'
export {
  relativeLuminance,
  contrastRatio,
  assertContrast,
  deriveInteractionStates,
  TEXT_CONTRAST_MIN,
  BOUNDARY_CONTRAST_MIN,
  ContrastError
} from './contrast'
export { colorSchemeInitScript } from './color-scheme-script'
export type { ColorSchemeInitOptions } from './color-scheme-script'
export { partAttrs, stateAttrs, COMPONENT_PARTS } from './part-state'
export type { PartAttrMap, StateAttrMap, ComponentPartName } from './part-state'
export { createRovingFocus } from './roving-focus'
export type { RovingFocus, RovingFocusOptions, RovingItem, RovingOrientation } from './roving-focus'
export { createDismissLayer } from './dismiss-layer'
export type { DismissLayer, DismissLayerOptions } from './dismiss-layer'
export {
  containerBreakpointCss,
  tigerContainer,
  CONTAINER_BREAKPOINT_NAMES
} from './container-breakpoints'
export type { ContainerBreakpointName } from './container-breakpoints'
export { chartStatusChannel, STATUS_CHANNELS, CHART_PALETTE_COUNT } from './status-channel'
export type { StatusChannel } from './status-channel'
export { createExportStream, printExchangeTokens } from './data-export-exchange'
export type { ExportStreamOptions, PrintExchangeTokens } from './data-export-exchange'
export { toggleInplace } from './inplace-utils'
export type { InplaceState, InplaceAction, InplaceActionType } from './inplace-utils'
export type { DismissActionEvent } from './confirm-action'

export {
  FEEDBACK_SCOPE_STACK,
  activateFeedbackScope,
  clearMessages,
  clearNotifications,
  createFeedbackScope,
  createModalQueue,
  destroyAllConfirmModals,
  dismissConfirmModal,
  enqueueConfirmModal,
  enqueueMessage,
  enqueueNotification,
  getActiveFeedbackScope,
  settleConfirmModalOk,
  settleMessage
} from './feedback-scope'
export type {
  ConfirmModalInput,
  ConfirmModalKind,
  FeedbackScope,
  ImperativeModalRecord,
  MessagePromisePhases,
  MessageQueueItem,
  ModalQueue
} from './feedback-scope'
