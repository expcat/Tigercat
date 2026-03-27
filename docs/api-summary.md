# Tigercat API Summary

> 自动生成 — `node scripts/generate-api-docs.mjs`

## Basic

| File | Exported Types |
|------|---------------|
| button.ts | `ButtonVariant`, `ButtonSize`, `ButtonIconPosition`, `ButtonHtmlType`, `ButtonProps`, `ButtonGroupProps` |
| link.ts | `LinkVariant`, `LinkSize`, `LinkProps` |
| icon.ts | `IconSize`, `IconProps` |
| text.ts | `TextTag`, `TextSize`, `TextWeight`, `TextAlign`, `TextColor`, `TextProps` |
| image.ts | `ImageFit`, `CropRect`, `CropResult`, `CropHandle`, `ImagePreviewToolbarAction`, `PreviewNavState`, `ImageProps`, `ImagePreviewProps`, `ImageGroupProps`, `ImageCropperProps`, `CropUploadProps` |
| avatar.ts | `AvatarSize`, `AvatarShape`, `AvatarProps`, `AvatarGroupProps` |
| badge.ts | `BadgeVariant`, `BadgeSize`, `BadgeType`, `BadgePosition`, `BadgeProps` |
| tag.ts | `TagVariant`, `TagSize`, `TagProps` |
| divider.ts | `DividerOrientation`, `DividerLineStyle`, `DividerSpacing`, `DividerProps` |
| code.ts | `CodeProps` |

## Form

| File | Exported Types |
|------|---------------|
| input.ts | `InputSize`, `InputType`, `InputStatus`, `InputProps` |
| input-number.ts | `InputNumberProps` |
| input-group.ts | `InputGroupSize`, `InputGroupProps`, `InputGroupAddonProps` |
| textarea.ts | `TextareaSize`, `TextareaProps` |
| select.ts | `SelectValue`, `SelectValues`, `SelectModelValue`, `SelectOption`, `SelectOptionGroup`, `SelectOptions`, `SelectSize`, `SelectProps` |
| cascader.ts | `CascaderOption`, `CascaderValue`, `CascaderSize`, `CascaderExpandTrigger`, `CascaderFilterFn`, `CascaderShowSearch`, `CascaderFlattenedOption`, `CascaderProps` |
| auto-complete.ts | `AutoCompleteOption`, `AutoCompleteSize`, `AutoCompleteProps` |
| transfer.ts | `TransferItem`, `TransferSize`, `TransferDirection`, `TransferProps` |
| tree-select.ts | `TreeSelectSize`, `TreeSelectValue`, `TreeSelectProps` |
| checkbox.ts | `CheckboxValue`, `CheckboxGroupValue`, `CheckboxSize`, `CheckboxProps`, `CheckboxGroupProps` |
| radio.ts | `RadioSize`, `RadioProps`, `RadioGroupProps` |
| switch.ts | `SwitchSize`, `SwitchProps` |
| slider.ts | `SliderSize`, `SliderProps` |
| datepicker.ts | `DatePickerInputDate`, `DatePickerSingleModelValue`, `DatePickerRangeModelValue`, `DatePickerModelValue`, `DatePickerSingleValue`, `DatePickerRangeValue`, `DatePickerLabels`, `DatePickerSize`, `DateFormat`, `DatePickerProps`, `DatePickerShortcut` |
| timepicker.ts | `TimePickerSize`, `TimeFormat`, `TimePickerSingleValue`, `TimePickerRangeValue`, `TimePickerModelValue`, `TimePickerLabels`, `TimePickerProps` |
| color-picker.ts | `ColorPickerSize`, `ColorFormat`, `ColorPickerProps` |
| rate.ts | `RateSize`, `RateProps` |
| upload.ts | `UploadFileStatus`, `UploadListType`, `UploadFile`, `UploadProps`, `UploadLabels`, `UploadRequestOptions` |
| mentions.ts | `MentionsSize`, `MentionOption`, `MentionsProps` |
| form.ts | `FormRuleType`, `FormRuleTrigger`, `FormRule`, `FormRules`, `FormError`, `FormValues`, `FormValidationResult`, `FormLabelAlign`, `FormLabelPosition`, `FormSize`, `FormProps`, `FormErrorDisplayMode`, `FormItemProps` |
| stepper.ts | `StepperSize`, `StepperProps` |

## Data Display

| File | Exported Types |
|------|---------------|
| table.ts | `TableSize`, `SortDirection`, `SortState`, `ColumnAlign`, `FilterType`, `FilterOption`, `ColumnFilter`, `TableColumn`, `PaginationConfig`, `RowSelectionConfig`, `ExpandableConfig`, `TableProps`, `FilterRule` |
| virtual-table.ts | `VirtualTableProps`, `VirtualTableRange` |
| card.ts | `CardVariant`, `CardSize`, `CardDirection`, `CardProps` |
| list.ts | `ListSize`, `ListItemLayout`, `ListBorderStyle`, `ListItem`, `ListPaginationConfig`, `ListProps` |
| descriptions.ts | `DescriptionsSize`, `DescriptionsLayout`, `DescriptionsItem`, `DescriptionsProps` |
| timeline.ts | `TimelineMode`, `TimelineItemPosition`, `TimelineItem`, `TimelineProps` |
| tree.ts | `TreeNode`, `TreeSelectionMode`, `TreeCheckStrategy`, `TreeExpandedState`, `TreeCheckedState`, `TreeLoadDataFn`, `TreeFilterFn`, `TreeProps` |
| progress.ts | `ProgressVariant`, `ProgressSize`, `ProgressType`, `ProgressStatus`, `ProgressProps` |
| skeleton.ts | `SkeletonVariant`, `SkeletonAnimation`, `SkeletonShape`, `SkeletonProps` |
| statistic.ts | `StatisticSize`, `StatisticProps` |
| calendar.ts | `CalendarMode`, `CalendarProps` |
| qrcode.ts | `QRCodeLevel`, `QRCodeStatus`, `QRCodeProps` |
| segmented.ts | `SegmentedSize`, `SegmentedOption`, `SegmentedProps` |
| empty.ts | `EmptyPreset`, `EmptyProps` |
| collapse.ts | `ExpandIconPosition`, `CollapseProps`, `CollapsePanelProps` |

## Navigation

| File | Exported Types |
|------|---------------|
| menu.ts | `MenuMode`, `MenuTheme`, `MenuKey`, `MenuItem`, `MenuProps`, `MenuItemProps`, `SubMenuProps`, `MenuItemGroupProps` |
| tabs.ts | `TabType`, `TabPosition`, `TabSize`, `TabsProps`, `TabPaneProps`, `TabChangeInfo`, `TabEditInfo` |
| breadcrumb.ts | `BreadcrumbSeparator`, `BreadcrumbProps`, `BreadcrumbItemProps` |
| dropdown.ts | `DropdownTrigger`, `DropdownPlacement`, `DropdownProps`, `DropdownMenuProps`, `DropdownItemProps` |
| pagination.ts | `PaginationSize`, `PaginationAlign`, `PaginationPageSizeOption`, `PaginationPageSizeOptionItem`, `PaginationProps`, `PageChangeInfo`, `PageSizeChangeInfo` |
| steps.ts | `StepsDirection`, `StepStatus`, `StepSize`, `StepItem`, `StepsProps` |
| anchor.ts | `AnchorDirection`, `AnchorProps`, `AnchorLinkProps`, `AnchorClickInfo`, `AnchorChangeInfo` |

## Feedback

| File | Exported Types |
|------|---------------|
| alert.ts | `AlertType`, `AlertSize`, `AlertProps` |
| modal.ts | `ModalSize`, `ModalProps` |
| drawer.ts | `DrawerPlacement`, `DrawerSize`, `DrawerProps` |
| message.ts | `MessageType`, `MessagePosition`, `MessageInstance`, `MessageProps`, `MessageConfig`, `MessageOptions` |
| notification.ts | `NotificationType`, `NotificationPosition`, `NotificationInstance`, `NotificationProps`, `NotificationConfig`, `NotificationOptions` |
| loading.ts | `LoadingVariant`, `LoadingSize`, `LoadingColor`, `LoadingProps` |
| popconfirm.ts | `PopconfirmIconType`, `PopconfirmProps` |
| popover.ts | `PopoverTrigger`, `PopoverProps` |
| tooltip.ts | `TooltipTrigger`, `TooltipProps` |
| result.ts | `ResultStatus`, `ResultProps` |
| watermark.ts | `WatermarkFont`, `WatermarkProps` |

## Layout

| File | Exported Types |
|------|---------------|
| space.ts | `SpaceDirection`, `SpaceSize`, `SpaceAlign`, `SpaceProps` |
| container.ts | `ContainerMaxWidth`, `ContainerProps` |
| grid.ts | `Breakpoint`, `GutterSize`, `ColSpan`, `Align`, `Justify`, `RowProps`, `ColProps` |
| layout.ts | `LayoutProps`, `HeaderProps`, `SidebarProps`, `ContentProps`, `FooterProps` |
| splitter.ts | `SplitDirection`, `SplitterPaneConfig`, `SplitterProps` |
| resizable.ts | `ResizeHandlePosition`, `ResizeAxis`, `ResizableProps`, `ResizeEvent` |

## Charts

| File | Exported Types |
|------|---------------|
| chart.ts | `ChartScaleType`, `ChartAxisOrientation`, `ChartScaleValue`, `ChartPadding`, `ChartCurveType`, `ChartLegendPosition`, `BaseChartProps`, `ChartInteractionProps`, `ChartLegendProps`, `ChartTooltipProps`, `ChartWithAxesProps`, `ChartLegendItem`, `ChartCanvasProps`, `ChartScale`, `BandScaleOptions`, `PointScaleOptions`, `ChartAxisProps`, `ChartAxisTick`, `ChartGridLine`, `ChartGridLineStyle`, `ChartGridProps`, `ChartSeriesType`, `ChartSeriesPoint`, `ChartSeriesProps`, `BarValueLabelPosition`, `BarChartDatum`, `BarChartProps`, `ScatterChartDatum`, `ScatterChartProps`, `PieChartDatum`, `PieChartProps`, `DonutChartDatum`, `DonutChartProps`, `RadarChartDatum`, `RadarChartSeries`, `LineChartDatum`, `LineChartSeries`, `LineChartProps`, `AreaChartDatum`, `AreaChartSeries`, `AreaChartProps`, `RadarChartProps`, `FunnelChartDatum`, `FunnelChartProps`, `GaugeChartProps`, `HeatmapChartDatum`, `HeatmapChartProps`, `TreeMapChartDatum`, `TreeMapChartProps`, `SunburstChartDatum`, `SunburstChartProps` |

## Advanced

| File | Exported Types |
|------|---------------|
| code-editor.ts | `CodeLanguage`, `CodeEditorTheme`, `CodeEditorProps` |
| rich-text-editor.ts | `RichTextEditorMode`, `ToolbarButton`, `ToolbarAction`, `RichTextEditorProps` |
| kanban.ts | `KanbanCard`, `KanbanColumn`, `KanbanCardMoveEvent`, `KanbanColumnMoveEvent`, `KanbanSwimlane`, `KanbanProps` |
| file-manager.ts | `FileType`, `FileViewMode`, `FileSortField`, `FileSortOrder`, `FileItem`, `FileManagerProps` |
| virtual-list.ts | `VirtualListItemSize`, `VirtualListProps` |
| infinite-scroll.ts | `InfiniteScrollProps` |
| drag.ts | `DragItem`, `DragDirection`, `DragAxis`, `DragConfig`, `DragState`, `DragStartEvent`, `DragOverEvent`, `DragDropEvent`, `DragEndEvent`, `DragCallbacks`, `DragReorderResult`, `DragMoveResult` |
| tour.ts | `TourPlacement`, `TourStep`, `TourProps` |
| float-button.ts | `FloatButtonShape`, `FloatButtonSize`, `FloatButtonProps`, `FloatButtonGroupProps` |
| affix.ts | `AffixProps` |
| print-layout.ts | `PrintPageSize`, `PrintOrientation`, `PrintLayoutProps` |
| image-viewer.ts | `ImageViewerProps` |

## Composite

| File | Exported Types |
|------|---------------|

## Core

| File | Exported Types |
|------|---------------|
| generics.ts | `GenericTableColumn`, `GenericRowSelection`, `GenericExpandable`, `GenericTableProps`, `GenericSelectOption`, `GenericSelectOptionGroup`, `GenericSelectProps`, `GenericFormRule`, `GenericFormFieldProps` |
| events.ts | `StringChangeHandler`, `NumberChangeHandler`, `BooleanChangeHandler`, `SelectChangeHandler`, `MultiSelectChangeHandler`, `OpenChangeHandler`, `FormValidateHandler`, `FormSubmitHandler`, `FormFieldChangeHandler`, `TableSortChangeHandler`, `TableFilterChangeHandler`, `TableSelectionChangeHandler`, `TableExpandChangeHandler`, `PaginationChangeHandler`, `TableRowClickHandler`, `MenuSelectHandler`, `TabChangeHandler`, `StepChangeHandler`, `ItemClickHandler`, `CloseHandler`, `ConfirmHandler`, `CancelHandler`, `SearchHandler` |
| slots.ts | `TableEmptySlotContext`, `TableCellSlotContext`, `TableExpandSlotContext`, `OverlayFooterSlotContext`, `OverlayHeaderSlotContext`, `FormItemSlotContext`, `SelectOptionSlotContext`, `MenuItemSlotContext`, `ListItemSlotContext`, `EmptySlotContext` |
| locale.ts | `TigerLocaleCommon`, `TigerLocaleModal`, `TigerLocaleDrawer`, `TigerLocaleUpload`, `TigerLocalePagination`, `TigerLocaleFormWizard`, `TigerLocaleTaskBoard`, `TigerLocale` |
| theme.ts | `ThemeColorScale`, `ThemeSemanticColors`, `ThemeTypography`, `ThemeRadius`, `ThemeShadows`, `ThemeSpacing`, `ThemeMotion`, `ThemeConfig`, `ThemePresetName`, `ThemePreset`, `ColorScheme` |

---

Total exported types: **462**
