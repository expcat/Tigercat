---
name: tigercat-generated-props
description: Props tables generated from packages/core/src/types TypeScript interfaces
---

<!-- LLM-INDEX
type: generated-props-reference
source: packages/core/src/types/*.ts
update-command: pnpm docs:api
-->

# Generated Props From TypeScript

> 自动生成 — `pnpm docs:api`。手写 Props 文档用于说明交互语义；本文件用于核对 TS 源码中的字段、类型与默认值。

## Basic

### alert.ts.ts

#### AlertProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| type? | `AlertType` | 'info' | Alert type (success, warning, error, info) |
| size? | `AlertSize` | 'md' | Alert size |
| title? | `string` | - | Alert title (main message) |
| description? | `string` | - | Alert description (detailed content) |
| showIcon? | `boolean` | true | Whether to show the type icon |
| closable? | `boolean` | false | Whether the alert can be closed |
| duration? | `number` | - | Auto-close duration in milliseconds. Set to 0 or undefined to disable auto-close. Requires closable to be true. |
| closeAriaLabel? | `string` | 'Close alert' | Accessible label for the close button (when `closable` is true) |
| banner? | `boolean` | false | Whether to display as full-width banner across the page |
| showCountdown? | `boolean` | false | Whether to show countdown progress bar (requires `duration` and `closable`) |
| className? | `string` | - | Additional CSS classes |

### avatar.ts.ts

#### AvatarProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `AvatarSize` | 'md' | Avatar size |
| shape? | `AvatarShape` | 'circle' | Avatar shape |
| src? | `string` | - | Image source URL |
| alt? | `string` | - | Alternative text for image |
| text? | `string` | - | Text content to display (e.g., initials) Used when src is not provided or fails to load |
| bgColor? | `string` | - | Background color for text/icon avatars Uses Tailwind color classes or CSS color value |
| textColor? | `string` | - | Text color for text/icon avatars Uses Tailwind color classes or CSS color value |
| className? | `string` | - | Additional CSS classes |

#### AvatarGroupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| max? | `number` | - | Maximum number of avatars to display Excess avatars will be shown as a "+N" indicator |
| size? | `AvatarSize` | 'md' | Size applied to all avatars in the group |
| className? | `string` | - | Additional CSS classes |

### badge.ts.ts

#### BadgeProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant? | `BadgeVariant` | - | Badge variant style @default 'danger' |
| size? | `BadgeSize` | - | Badge size @default 'md' |
| type? | `BadgeType` | - | Badge display type @default 'number' |
| content? | `number \| string` | - | Badge content (number or text). Ignored when type='dot'. |
| max? | `number` | - | Maximum count (type='number' only). Exceeds shows 'max+'. @default 99 |
| showZero? | `boolean` | - | Whether to show zero count @default false |
| position? | `BadgePosition` | - | Badge position in non-standalone mode @default 'top-right' |
| standalone? | `boolean` | - | Standalone (inline) or wrapping children @default true |
| className? | `string` | - | Additional CSS classes |

### button.ts.ts

#### ButtonProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant? | `ButtonVariant` | 'primary' | Button variant style |
| size? | `ButtonSize` | 'md' | Button size |
| disabled? | `boolean` | false | Whether the button is disabled |
| loading? | `boolean` | false | Whether the button is in loading state |
| block? | `boolean` | false | Whether the button should take full width of its parent |
| iconPosition? | `ButtonIconPosition` | 'left' | Position of the icon relative to button text |
| htmlType? | `ButtonHtmlType` | 'button' | HTML button type attribute |
| danger? | `boolean` | false | Whether to apply danger/destructive styling Overrides variant colors with error/danger colors |

#### ButtonGroupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `ButtonSize` | - | Size applied to all buttons in the group |
| vertical? | `boolean` | false | Whether to render buttons vertically |

### code.ts.ts

#### CodeProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| code | `string` | - | - |
| copyable? | `boolean` | - | - |
| copyLabel? | `string` | - | - |
| copiedLabel? | `string` | - | - |

### divider.ts.ts

#### DividerProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| orientation? | `DividerOrientation` | 'horizontal' | Orientation of the divider |
| lineStyle? | `DividerLineStyle` | 'solid' | Line style of the divider |
| spacing? | `DividerSpacing` | 'md' | Spacing (margin) around the divider |
| color? | `string` | undefined (uses default border color) | Custom color for the divider Can be a CSS color value or CSS variable |
| thickness? | `string` | undefined (uses default 1px for horizontal, 1px for vertical) | Custom thickness of the divider line |

### empty.ts.ts

#### EmptyProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| preset? | `EmptyPreset` | 'default' | Preset empty state style |
| description? | `string` | - | Description text below the illustration |
| showImage? | `boolean` | true | Whether to show the built-in SVG illustration |
| className? | `string` | - | Additional CSS class name |

### icon.ts.ts

#### IconProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `IconSize` | 'md' | Icon size |
| color? | `string` | - | Icon color Uses CSS color value |
| className? | `string` | - | Additional CSS classes |

### image.ts.ts

#### ImageProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| src? | `string` | - | Image source URL |
| alt? | `string` | - | Alternative text for image |
| width? | `number \| string` | - | Image width (CSS value) |
| height? | `number \| string` | - | Image height (CSS value) |
| fit? | `ImageFit` | 'cover' | Object-fit behavior for the image |
| fallbackSrc? | `string` | - | Fallback image source when loading fails |
| preview? | `boolean` | true | Whether clicking the image triggers preview |
| lazy? | `boolean` | false | Whether to lazy load the image using IntersectionObserver |
| className? | `string` | - | Additional CSS classes |

#### ImagePreviewProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| open? | `boolean` | - | Whether the preview is open |
| images | `string[]` | - | Array of image URLs to preview |
| currentIndex? | `number` | 0 | Current image index (for multi-image preview) |
| zIndex? | `number` | 1050 | Custom z-index for the preview overlay |
| maskClosable? | `boolean` | true | Whether clicking the mask closes the preview |
| scaleStep? | `number` | 0.5 | Scale step for zoom in/out |
| minScale? | `number` | 0.25 | Minimum scale factor |
| maxScale? | `number` | 5 | Maximum scale factor |

#### ImageGroupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| preview? | `boolean` | true | Whether to enable preview for all child images |

#### ImageCropperProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| src | `string` | - | Image source URL to crop |
| aspectRatio? | `number` | - | Fixed aspect ratio (width / height). Leave undefined for free cropping. |
| minWidth? | `number` | 20 | Minimum crop width in pixels |
| minHeight? | `number` | 20 | Minimum crop height in pixels |
| outputType? | `'image/png' \| 'image/jpeg' \| 'image/webp'` | 'image/png' | Output image MIME type |
| quality? | `number` | 0.92 | Output image quality (0-1, only for jpeg/webp) |
| guides? | `boolean` | true | Whether to show crop guide lines (rule of thirds) |
| className? | `string` | - | Additional CSS classes |

#### CropUploadProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| accept? | `string` | 'image/*' | Accepted file types |
| disabled? | `boolean` | false | Whether the component is disabled |
| maxSize? | `number` | - | Maximum file size in bytes |
| cropperProps? | `Partial<Omit<ImageCropperProps, 'src'>>` | - | Props to pass to the internal ImageCropper |
| modalTitle? | `string` | '裁剪图片' | Title for the crop modal |
| modalWidth? | `number` | 520 | Width of the crop modal |
| className? | `string` | - | Additional CSS classes |

### link.ts.ts

#### LinkProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant? | `LinkVariant` | 'primary' | Link variant style |
| size? | `LinkSize` | 'md' | Link size |
| disabled? | `boolean` | false | Whether the link is disabled |
| href? | `string` | - | The URL to navigate to |
| target? | `'_blank' \| '_self' \| '_parent' \| '_top'` | undefined | Where to open the linked document |
| rel? | `string` | - | Relationship between current document and linked document Automatically set to 'noopener noreferrer' when target="_blank" |
| underline? | `boolean` | true | Whether to show underline |

### qrcode.ts.ts

#### QRCodeProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value | `string` | - | Text / URL to encode |
| size? | `number` | - | Size in pixels |
| color? | `string` | - | Foreground color |
| bgColor? | `string` | - | Background color |
| level? | `QRCodeLevel` | - | Error correction level |
| status? | `QRCodeStatus` | - | Status |
| className? | `string` | - | Custom class name |

### rate.ts.ts

#### RateProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| count? | `number` | - | Number of stars |
| allowHalf? | `boolean` | - | Whether to allow half stars |
| disabled? | `boolean` | - | Whether the component is disabled / read-only |
| size? | `RateSize` | - | Component size |
| allowClear? | `boolean` | - | Whether to allow clearing by clicking the same value |
| className? | `string` | - | Custom class name |
| character? | `string` | - | Character to use (text or emoji) — renders text instead of star icon |

### result.ts.ts

#### ResultProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| status? | `ResultStatus` | 'info' | Result status — determines the icon and color scheme |
| title? | `string` | - | Title text |
| subTitle? | `string` | - | Subtitle / description text |
| className? | `string` | - | Additional CSS class name |

### segmented.ts.ts

#### SegmentedProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| options? | `SegmentedOption[]` | - | Available options |
| disabled? | `boolean` | - | Whether the whole control is disabled |
| size? | `SegmentedSize` | - | Component size |
| block? | `boolean` | - | Whether the control fills full width |
| className? | `string` | - | Custom class name |

### statistic.ts.ts

#### StatisticProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| title? | `string` | - | Title / label text |
| value? | `string \| number` | - | The numeric or text value |
| precision? | `number` | - | Precision (decimal places) for numeric values |
| prefix? | `string` | - | Prefix text or symbol before the value |
| suffix? | `string` | - | Suffix text or symbol after the value |
| groupSeparator? | `boolean` | - | Whether to show grouping separator (e.g. 1,000) |
| animated? | `boolean` | - | Whether to animate numeric values |
| animationDuration? | `number` | - | Numeric animation duration in milliseconds |
| size? | `StatisticSize` | - | Component size |
| className? | `string` | - | Custom class name |

### tag.ts.ts

#### TagProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant? | `TagVariant` | 'default' | Tag variant style |
| size? | `TagSize` | 'md' | Tag size |
| closable? | `boolean` | false | Whether the tag can be closed |
| closeAriaLabel? | `string` | 'Close tag' | Accessible label for the close button (when `closable` is true) |

### text.ts.ts

#### TextProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| tag? | `TextTag` | 'p' | HTML tag to render |
| size? | `TextSize` | 'base' | Text size |
| weight? | `TextWeight` | 'normal' | Text weight |
| align? | `TextAlign` | - | Text alignment |
| color? | `TextColor` | 'default' | Text color |
| truncate? | `boolean` | false | Whether to truncate text with ellipsis |
| italic? | `boolean` | false | Whether text should be italic |
| underline? | `boolean` | false | Whether text should have underline |
| lineThrough? | `boolean` | false | Whether text should have line-through |

### watermark.ts.ts

#### WatermarkProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| content? | `string \| string[]` | - | Watermark text content. Array means multi-line. |
| image? | `string` | - | Image URL to use as watermark (takes priority over content) |
| width? | `number` | 120 | Watermark width in px |
| height? | `number` | 64 | Watermark height in px |
| rotate? | `number` | -22 | Rotation angle in degrees |
| zIndex? | `number` | 9 | Z-index of the watermark layer |
| gapX? | `number` | 100 | Horizontal gap between watermarks in px |
| gapY? | `number` | 100 | Vertical gap between watermarks in px |
| offsetX? | `number` | 0 | X-axis offset in px |
| offsetY? | `number` | 0 | Y-axis offset in px |
| font? | `WatermarkFont` | - | Font configuration |
| className? | `string` | - | Additional CSS class name |

## Form

### auto-complete.ts.ts

#### AutoCompleteProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| options? | `AutoCompleteOption[]` | - | Options list |
| placeholder? | `string` | - | Placeholder text |
| size? | `AutoCompleteSize` | - | Component size |
| disabled? | `boolean` | - | Whether the component is disabled |
| clearable? | `boolean` | - | Whether to show clear button |
| notFoundText? | `string` | - | Text shown when no options match |
| filterOption? | `boolean \| ((inputValue: string, option: AutoCompleteOption) => boolean)` | - | Whether to filter options locally based on input value (default: true) |
| className? | `string` | - | Custom class name |
| defaultActiveFirstOption? | `boolean` | - | Whether to select the first match automatically when losing focus |
| allowFreeInput? | `boolean` | - | Whether to allow free-form text input (not limited to options) |

### cascader.ts.ts

#### CascaderProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| options? | `CascaderOption[]` | - | Cascader options data |
| placeholder? | `string` | 'Please select' | Placeholder text |
| size? | `CascaderSize` | 'md' | Component size |
| disabled? | `boolean` | false | Whether the cascader is disabled |
| clearable? | `boolean` | true | Whether to allow clearing the selection |
| showSearch? | `boolean \| CascaderShowSearch` | false | Whether to allow search/filter |
| expandTrigger? | `CascaderExpandTrigger` | 'click' | Trigger type for expanding sub-options |
| changeOnSelect? | `boolean` | false | Whether to select value on each level (not just leaf) |
| separator? | `string` | ' / ' | Separator for display text |
| notFoundText? | `string` | 'No results found' | Text to display when no options match search |
| className? | `string` | - | Additional CSS classes |

### checkbox.ts.ts

#### CheckboxProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `CheckboxSize` | 'md' | Checkbox size |
| disabled? | `boolean` | false | Whether the checkbox is disabled |
| value? | `CheckboxValue` | - | Checkbox value (for use in checkbox groups) |
| indeterminate? | `boolean` | false | Whether the checkbox is in indeterminate state |

#### CheckboxGroupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| disabled? | `boolean` | false | Whether the checkbox group is disabled |
| size? | `CheckboxSize` | 'md' | Checkbox size for all checkboxes in the group |

### color-picker.ts.ts

#### ColorPickerProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| disabled? | `boolean` | - | Whether the picker is disabled |
| size? | `ColorPickerSize` | - | Component size |
| showAlpha? | `boolean` | - | Whether to show alpha channel |
| format? | `ColorFormat` | - | Default format for input display |
| presets? | `string[]` | - | Preset color swatches |
| className? | `string` | - | Custom class name |

### datepicker.ts.ts

#### DatePickerProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| locale? | `DatePickerLocaleInput` | - | Locale used for month/day names in the calendar UI. Example: 'zh-CN', 'en-US' |
| labels? | `Partial<DatePickerLabels>` | - | UI labels for i18n. When provided, merges with locale-based defaults. |
| size? | `DatePickerSize` | 'md' | DatePicker size |
| value? | `DatePickerModelValue \| null` | - | Selected date value (for controlled mode) |
| defaultValue? | `DatePickerModelValue \| null` | - | Default date value (for uncontrolled mode) |
| range? | `boolean` | false | Enable range selection (start/end). When true, value/defaultValue use a tuple: [start, end]. |
| format? | `DateFormat` | 'yyyy-MM-dd' | Date format string |
| placeholder? | `string` | 'Select date' | Placeholder text |
| disabled? | `boolean` | false | Whether the datepicker is disabled |
| readonly? | `boolean` | false | Whether the datepicker is readonly |
| required? | `boolean` | false | Whether the datepicker is required |
| minDate? | `DatePickerInputDate \| null` | - | Minimum selectable date |
| maxDate? | `DatePickerInputDate \| null` | - | Maximum selectable date |
| clearable? | `boolean` | true | Whether to show the clear button |
| name? | `string` | - | Input name attribute |
| id? | `string` | - | Input id attribute |
| shortcuts? | `DatePickerShortcut[]` | - | Shortcut presets for quick date selection. Each shortcut has a label and a value (or getter function). |

### form.ts.ts

#### FormProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| model? | `FormValues` | - | Form values |
| rules? | `FormRules` | - | Form validation rules |
| labelWidth? | `string \| number` | - | Label width (applies when labelPosition is 'left' or 'right') |
| labelPosition? | `FormLabelPosition` | 'right' | Label position |
| labelAlign? | `FormLabelAlign` | 'right' | Label alignment |
| size? | `FormSize` | 'md' | Form size |
| inlineMessage? | `boolean` | true | Whether to show validation messages inline |
| showRequiredAsterisk? | `boolean` | true | Whether to show asterisk for required fields |
| disabled? | `boolean` | false | Whether to disable the entire form |
| loading? | `boolean` | false | Whether the form is in a loading state (prevents submit) |
| dynamicFields? | `boolean` | false | Enable dynamic field management (addField/removeField) |
| fieldDependencies? | `Map<string, string[]>` | - | Field dependency map: key is the dependent field, value is array of fields it depends on When a dependency changes, the dependent field is re-validated |
| undoable? | `boolean` | false | Enable undo/redo for form values |
| maxHistorySize? | `number` | 50 | Maximum undo history size |

#### FormItemProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| name? | `string` | - | Field name (must match key in form model) |
| label? | `string` | - | Label text |
| labelWidth? | `string \| number` | - | Label width (overrides form's labelWidth) |
| required? | `boolean` | - | Whether the field is required |
| rules? | `FormRule \| FormRule[]` | - | Validation rules for this field |
| error? | `string` | - | Error message (controlled mode) |
| showMessage? | `boolean` | true | Whether to show validation message |
| size? | `FormSize` | - | Size (overrides form's size) |
| errorDisplayMode? | `FormErrorDisplayMode` | 'inline' | Error display mode - 'inline': shows error below the field (default) - 'popup': shows error in a tooltip/popup on hover - 'block': shows error in a block-level alert |

### input.ts.ts

#### InputProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `InputSize` | 'md' | Input size |
| status? | `InputStatus` | 'default' | Validation status |
| errorMessage? | `string` | - | Error message to display |
| type? | `InputType` | 'text' | Input type |
| value? | `string \| number` | - | Input value (for controlled mode) |
| defaultValue? | `string \| number` | - | Default value (for uncontrolled mode) |
| placeholder? | `string` | - | Placeholder text |
| disabled? | `boolean` | false | Whether the input is disabled |
| readonly? | `boolean` | false | Whether the input is readonly |
| required? | `boolean` | false | Whether the input is required |
| maxLength? | `number` | - | Maximum length of input |
| minLength? | `number` | - | Minimum length of input |
| name? | `string` | - | Input name attribute |
| id? | `string` | - | Input id attribute |
| autoComplete? | `string` | - | Input autocomplete attribute |
| autoFocus? | `boolean` | false | Whether to autofocus on mount |
| clearable? | `boolean` | false | Whether to show a clear button when the input has value |
| showPassword? | `boolean` | false | Whether to show a password toggle button (only works with type='password') |
| showCount? | `boolean` | false | Whether to show a character count (requires maxLength to show "current/max") |

### input-group.ts.ts

#### InputGroupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `InputGroupSize` | 'md' | Size applied to all children in the group |
| compact? | `boolean` | false | Whether to use compact mode (merged borders) |
| className? | `string` | - | Additional CSS classes |

#### InputGroupAddonProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| type? | `'text' \| 'icon'` | 'text' | Addon type |
| className? | `string` | - | Additional CSS classes |

### input-number.ts.ts

#### InputNumberProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `InputSize` | 'md' | Input size |
| status? | `InputStatus` | 'default' | Validation status |
| value? | `number \| null` | - | Current value (controlled mode) |
| defaultValue? | `number \| null` | - | Default value (uncontrolled mode) |
| min? | `number` | -Infinity | Minimum value |
| max? | `number` | Infinity | Maximum value |
| step? | `number` | 1 | Step increment |
| precision? | `number` | - | Number of decimal places |
| disabled? | `boolean` | false | Whether the input is disabled |
| readonly? | `boolean` | false | Whether the input is read-only |
| placeholder? | `string` | - | Placeholder text |
| name? | `string` | - | Input name attribute |
| id? | `string` | - | Input id attribute |
| keyboard? | `boolean` | true | Whether to enable keyboard up/down arrow stepping |
| controls? | `boolean` | true | Whether to show +/- step buttons |
| controlsPosition? | `'right' \| 'both'` | 'right' | Position of step controls |
| formatter? | `(value: number \| undefined) => string` | - | Format the display value |
| parser? | `(displayValue: string) => number` | - | Parse the displayed string back to number |
| autoFocus? | `boolean` | false | Whether to auto-focus on mount |

### mentions.ts.ts

#### MentionsProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| prefix? | `string` | - | Trigger character |
| options? | `MentionOption[]` | - | Available mention options |
| placeholder? | `string` | - | Placeholder text |
| disabled? | `boolean` | - | Disabled state |
| size? | `MentionsSize` | - | Size variant |
| rows? | `number` | - | Number of visible rows |
| className? | `string` | - | Custom class name |

### radio.ts.ts

#### RadioProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value | `string \| number` | - | The value of the radio |
| size? | `RadioSize` | 'md' | Radio size |
| disabled? | `boolean` | false | Whether the radio is disabled |
| name? | `string` | - | Name attribute for the radio input (for grouping) |
| checked? | `boolean` | - | Whether the radio is checked (controlled mode) |
| defaultChecked? | `boolean` | false | Default checked state (uncontrolled mode) |

#### RadioGroupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value? | `string \| number` | - | Current selected value (controlled mode) |
| defaultValue? | `string \| number` | - | Default selected value (uncontrolled mode) |
| name? | `string` | - | Name attribute for radio inputs in the group |
| disabled? | `boolean` | false | Whether all radios in the group are disabled |
| size? | `RadioSize` | 'md' | Radio size for all radios in the group |

### select.ts.ts

#### SelectProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `SelectSize` | 'md' | Select size |
| disabled? | `boolean` | false | Whether the select is disabled |
| placeholder? | `string` | - | Placeholder text when no option is selected |
| searchable? | `boolean` | false | Whether to allow search/filter |
| multiple? | `boolean` | false | Whether to allow multiple selection |
| clearable? | `boolean` | true | Whether to clear the selection |
| options? | `SelectOptions` | - | Options list (can be flat list or grouped) |
| noOptionsText? | `string` | 'No options found' | Text to display when no options match search |
| noDataText? | `string` | 'No options available' | Text to display when options list is empty |
| maxTagCount? | `number` | - | Maximum number of tags to display in multi-select mode. Remaining selections are shown as "+N more". |
| virtual? | `boolean` | false | Whether to use virtual scrolling for large option lists. When enabled, only visible options are rendered for better performance. |
| remote? | `boolean` | false | Whether search is handled remotely. When true, local option filtering is skipped. |
| searchDebounce? | `number` | 0 | Debounce delay for search callbacks in milliseconds. |
| listHeight? | `number` | 256 | Height of the dropdown panel in pixels (relevant when virtual is true) |

### slider.ts.ts

#### SliderProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value? | `number \| [number, number]` | - | Current value of the slider For single slider, this is a number For range slider, this is a tuple [min, max] |
| defaultValue? | `number \| [number, number]` | - | Default value |
| min? | `number` | 0 | Minimum value |
| max? | `number` | 100 | Maximum value |
| step? | `number` | 1 | Step value for slider movement |
| disabled? | `boolean` | false | Whether the slider is disabled |
| marks? | `boolean \| Record<number, string>` | false | Whether to show marks on the slider |
| tooltip? | `boolean` | true | Whether to show tooltip |
| size? | `SliderSize` | 'md' | Slider size |
| range? | `boolean` | false | Whether to enable range selection |

### stepper.ts.ts

#### StepperProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| min? | `number` | - | Minimum value |
| max? | `number` | - | Maximum value |
| step? | `number` | - | Step increment |
| disabled? | `boolean` | - | Whether the stepper is disabled |
| size? | `StepperSize` | - | Component size |
| precision? | `number` | - | Precision (decimal places) |
| className? | `string` | - | Custom class name |

### switch.ts.ts

#### SwitchProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| checked? | `boolean` | false | Whether the switch is checked |
| disabled? | `boolean` | false | Whether the switch is disabled |
| size? | `SwitchSize` | 'md' | Switch size |

### textarea.ts.ts

#### TextareaProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `TextareaSize` | 'md' | Textarea size |
| value? | `string` | - | Textarea value (for controlled mode) |
| defaultValue? | `string` | - | Default value (for uncontrolled mode) |
| disabled? | `boolean` | false | Whether the textarea is disabled |
| readonly? | `boolean` | false | Whether the textarea is readonly |
| required? | `boolean` | false | Whether the textarea is required |
| placeholder? | `string` | - | Placeholder text |
| rows? | `number` | 3 | Number of visible text rows |
| autoResize? | `boolean` | false | Enable auto-resize to fit content |
| maxRows? | `number` | - | Maximum number of rows when autoResize is enabled |
| minRows? | `number` | - | Minimum number of rows when autoResize is enabled |
| maxLength? | `number` | - | Maximum character length |
| minLength? | `number` | - | Minimum character length |
| name? | `string` | - | Textarea name attribute |
| id? | `string` | - | Textarea id attribute |
| autoComplete? | `string` | - | Autocomplete attribute |
| autoFocus? | `boolean` | false | Whether to autofocus on mount |
| showCount? | `boolean` | false | Show character count |

### timepicker.ts.ts

#### TimePickerProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| locale? | `string` | - | Locale used for UI labels (e.g. AM/PM) and display formatting. Example: 'zh-CN', 'en-US' |
| labels? | `Partial<TimePickerLabels>` | - | UI labels for i18n. When provided, merges with locale-based defaults. |
| size? | `TimePickerSize` | 'md' | TimePicker size |
| value? | `TimePickerModelValue` | - | Controlled value. Format: 'HH:mm' or 'HH:mm:ss' |
| defaultValue? | `TimePickerModelValue` | - | Uncontrolled default value. Format: 'HH:mm' or 'HH:mm:ss' |
| range? | `boolean` | false | Enable range selection (start/end). When true, value/defaultValue use a tuple: [start, end]. |
| format? | `TimeFormat` | '24' | Time format (12-hour or 24-hour) |
| showSeconds? | `boolean` | false | Whether to show seconds |
| hourStep? | `number` | 1 | Hour step |
| minuteStep? | `number` | 1 | Minute step |
| secondStep? | `number` | 1 | Second step |
| placeholder? | `string` | 'Select time' | Placeholder text |
| disabled? | `boolean` | false | Whether the timepicker is disabled |
| readonly? | `boolean` | false | Whether the timepicker is readonly |
| required? | `boolean` | false | Whether the timepicker is required |
| minTime? | `string \| null` | - | Minimum selectable time (HH:mm format) |
| maxTime? | `string \| null` | - | Maximum selectable time (HH:mm format) |
| clearable? | `boolean` | true | Whether to show the clear button |
| name? | `string` | - | Input name attribute |
| id? | `string` | - | Input id attribute |

### transfer.ts.ts

#### TransferProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| dataSource? | `TransferItem[]` | - | All available data items |
| targetKeys? | `(string \| number)[]` | - | Keys of items in the right (target) list |
| size? | `TransferSize` | - | Component size |
| disabled? | `boolean` | - | Whether the component is disabled |
| showSearch? | `boolean` | - | Whether to show search input in each panel |
| sourceTitle? | `string` | - | Title for left panel |
| targetTitle? | `string` | - | Title for right panel |
| notFoundText? | `string` | - | Text shown when a panel has no items |
| className? | `string` | - | Custom class name |
| filterOption? | `(inputValue: string, item: TransferItem) => boolean` | - | Custom filter function |

### tree-select.ts.ts

#### TreeSelectProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| treeData? | `TreeNode[]` | - | Tree data |
| placeholder? | `string` | - | Placeholder text |
| size? | `TreeSelectSize` | - | Component size |
| disabled? | `boolean` | - | Whether the component is disabled |
| clearable? | `boolean` | - | Whether to show clear button |
| multiple? | `boolean` | - | Whether to allow multiple selection |
| showSearch? | `boolean` | - | Whether to show search input in dropdown |
| notFoundText? | `string` | - | Text shown when no results found |
| defaultExpandAll? | `boolean` | - | Whether to expand all tree nodes by default |
| className? | `string` | - | Custom class name |

### upload.ts.ts

#### UploadProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| accept? | `string` | - | Accepted file types (same as HTML accept attribute) |
| multiple? | `boolean` | false | Whether to allow multiple file selection |
| limit? | `number` | - | Maximum number of files |
| maxSize? | `number` | - | Maximum file size in bytes |
| disabled? | `boolean` | false | Whether the upload is disabled |
| drag? | `boolean` | false | Whether to enable drag and drop |
| listType? | `UploadListType` | 'text' | List type for displaying files |
| fileList? | `UploadFile[]` | - | List of uploaded files |
| showFileList? | `boolean` | true | Whether to show the file list |
| autoUpload? | `boolean` | true | Whether to auto upload when file is selected |
| customRequest? | `(options: UploadRequestOptions) => void` | - | Custom upload request |
| onChange? | `(file: UploadFile, fileList: UploadFile[]) => void` | - | File change callback |
| onRemove? | `(file: UploadFile, fileList: UploadFile[]) => void \| boolean` | - | File remove callback |
| onPreview? | `(file: UploadFile) => void` | - | File preview callback |
| beforeUpload? | `(file: File) => boolean \| Promise<boolean>` | - | Before upload callback - return false to prevent upload |
| onProgress? | `(progress: number, file: UploadFile) => void` | - | Upload progress callback |
| onSuccess? | `(response: unknown, file: UploadFile) => void` | - | Upload success callback |
| onError? | `(error: Error, file: UploadFile) => void` | - | Upload error callback |
| onExceed? | `(files: File[], fileList: UploadFile[]) => void` | - | Exceed limit callback |
| locale? | `Partial<TigerLocale>` | - | Locale overrides for Upload UI text. |
| labels? | `Partial<UploadLabels>` | - | Upload UI labels for i18n. When provided, merges with locale-based defaults. |

## Feedback

### drawer.ts.ts

#### DrawerProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| open? | `boolean` | false | Whether the drawer is open |
| placement? | `DrawerPlacement` | 'right' | Drawer placement |
| size? | `DrawerSize` | 'md' | Drawer size |
| width? | `string \| number` | - | Custom width/height (overrides size). Accepts CSS value like '400px' or '50%'. Applied as width for left/right placement, height for top/bottom. |
| title? | `string` | - | Drawer title |
| closable? | `boolean` | true | Whether to show close button |
| mask? | `boolean` | true | Whether to show mask/backdrop |
| maskClosable? | `boolean` | true | Whether clicking mask closes the drawer |
| zIndex? | `number` | 1000 | z-index of the drawer |
| className? | `string` | - | Additional CSS class for the drawer container |
| bodyClassName? | `string` | - | Additional CSS class for the drawer body |
| destroyOnClose? | `boolean` | false | Whether to destroy content on close |
| locale? | `Partial<TigerLocale>` | - | Locale overrides for common texts |

### loading.ts.ts

#### LoadingProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant? | `LoadingVariant` | 'spinner' | Loading spinner variant - determines animation style |
| size? | `LoadingSize` | 'md' | Size of the loading indicator |
| color? | `LoadingColor` | 'primary' | Color variant |
| text? | `string` | - | Custom text to display below the spinner |
| fullscreen? | `boolean` | false | Whether to show loading as fullscreen overlay |
| delay? | `number` | 0 | Delay before showing the loading indicator (ms) Useful to prevent flashing on quick operations |
| background? | `string` | 'rgba(255, 255, 255, 0.9)' | Custom background color (for fullscreen mode) |
| customColor? | `string` | - | Custom spinner color (overrides color variant) |
| lockScroll? | `boolean` | true | Whether fullscreen loading locks document scrolling |
| className? | `string` | - | Additional CSS classes |

### message.ts.ts

#### MessageProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| type? | `MessageType` | 'info' | Message type |
| content? | `string` | - | Message content |
| duration? | `number` | 3000 | Duration in milliseconds before auto-close (0 means no auto-close) |
| closable? | `boolean` | false | Whether the message can be closed manually |
| onClose? | `() => void` | - | Callback when message is closed |
| icon? | `string` | - | Custom icon (overrides default type icon) |
| className? | `string` | - | Additional CSS classes |
| position? | `MessagePosition` | 'top' | Message position on screen |

### modal.ts.ts

#### ModalProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| open? | `boolean` | false | Whether the modal is open |
| size? | `ModalSize` | 'md' | Modal size |
| width? | `string \| number` | - | Custom width (overrides size). Accepts CSS value like '600px' or '80%'. |
| title? | `string` | - | Modal title |
| closable? | `boolean` | true | Whether to show the close button |
| mask? | `boolean` | true | Whether to show the mask (overlay) |
| maskClosable? | `boolean` | true | Whether clicking the mask should close the modal |
| centered? | `boolean` | false | Whether the modal should be centered vertically |
| mobileSheet? | `boolean` | false | Whether the modal should render as a mobile bottom sheet below the md breakpoint. |
| destroyOnClose? | `boolean` | false | Whether to destroy the modal content when closed |
| zIndex? | `number` | 1000 | z-index of the modal |
| className? | `string` | - | Custom class name for modal content |
| draggable? | `boolean` | false | Whether the modal can be dragged by its title bar |
| locale? | `Partial<TigerLocale>` | - | Locale overrides for common texts |

### notification.ts.ts

#### NotificationProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| type? | `NotificationType` | 'info' | Notification type |
| title? | `string` | - | Notification title |
| description? | `string` | - | Notification description/content |
| duration? | `number` | 4500 | Duration in milliseconds before auto-close (0 means no auto-close) |
| closable? | `boolean` | true | Whether the notification can be closed manually |
| onClose? | `() => void` | - | Callback when notification is closed |
| onClick? | `() => void` | - | Callback when notification is clicked |
| icon? | `string` | - | Custom icon (overrides default type icon) |
| className? | `string` | - | Additional CSS classes |
| position? | `NotificationPosition` | 'top-right' | Notification position on screen |

### popconfirm.ts.ts

#### PopconfirmProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| open? | `boolean` | - | Whether the popconfirm is open (controlled mode) |
| defaultOpen? | `boolean` | false | Default open state (uncontrolled mode) |
| title? | `string` | - | Popconfirm title/question text |
| description? | `string` | - | Popconfirm description text (optional, displayed below title) |
| icon? | `PopconfirmIconType` | 'warning' | Icon type to display |
| showIcon? | `boolean` | true | Whether to show icon |
| okText? | `string` | '确定' (Chinese) / 'Confirm' (English) | Confirm button text |
| cancelText? | `string` | '取消' (Chinese) / 'Cancel' (English) | Cancel button text |
| okType? | `'primary' \| 'danger'` | 'primary' | Confirm button type |
| placement? | `FloatingPlacement` | 'top' | Popconfirm placement relative to trigger |
| disabled? | `boolean` | false | Whether the popconfirm is disabled |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

### popover.ts.ts

#### PopoverProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| open? | `boolean` | - | Whether the popover is open (controlled mode) |
| defaultOpen? | `boolean` | false | Default open state (uncontrolled mode) |
| title? | `string` | - | Popover title text |
| content? | `string` | - | Popover content text (can be overridden by content slot/prop) |
| trigger? | `PopoverTrigger` | 'click' | Trigger type for showing/hiding popover |
| placement? | `FloatingPlacement` | 'top' | Popover placement relative to trigger |
| disabled? | `boolean` | false | Whether the popover is disabled |
| width? | `string \| number` | - | Popover width (pixel number or Tailwind class) |
| offset? | `number` | 8 | Offset distance from trigger (in pixels) |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

### progress.ts.ts

#### ProgressProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant? | `ProgressVariant` | 'primary' | Progress variant style |
| size? | `ProgressSize` | 'md' | Progress size |
| type? | `ProgressType` | 'line' | Progress type (shape) |
| percentage? | `number` | 0 | Current progress percentage (0-100) |
| status? | `ProgressStatus` | 'normal' | Progress status When set, overrides variant color |
| showText? | `boolean` | true for line, false for circle | Whether to show progress text inside the progress bar |
| text? | `string` | - | Custom text to display instead of percentage |
| format? | `(percentage: number) => string` | - | Format function for custom text |
| striped? | `boolean` | false | Whether to show striped animation Only applicable for line type |
| stripedAnimation? | `boolean` | false | Whether the striped animation should be animated Only applicable when striped is true |
| strokeWidth? | `number` | 6 | Stroke width for circle type (in pixels) |
| width? | `string \| number` | 'auto' | Width of the progress bar for line type Auto for responsive, or specific value |
| height? | `number` | - | Height of the progress bar for line type (in pixels) If not specified, uses size-based height |
| className? | `string` | - | Additional CSS classes |

### tooltip.ts.ts

#### TooltipProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| open? | `boolean` | - | Whether the tooltip is open (controlled mode) |
| defaultOpen? | `boolean` | false | Default open state (uncontrolled mode) |
| content? | `string` | - | Tooltip content text |
| trigger? | `TooltipTrigger` | 'hover' | Trigger type for showing/hiding tooltip |
| placement? | `FloatingPlacement` | 'top' | Tooltip placement relative to trigger |
| disabled? | `boolean` | false | Whether the tooltip is disabled |
| offset? | `number` | 8 | Offset distance from trigger (in pixels) |
| className? | `string` | - | Additional CSS classes |

### tour.ts.ts

#### TourProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| steps | `TourStep[]` | - | Array of tour steps |
| open? | `boolean` | false | Whether the tour is open |
| current? | `number` | - | Current step index (controlled) |
| nextText? | `string` | 'Next' | Text for the "Next" button |
| prevText? | `string` | 'Previous' | Text for the "Previous" button |
| finishText? | `string` | 'Finish' | Text for the "Finish" button (last step) |
| closable? | `boolean` | true | Whether to show the close button |
| showIndicators? | `boolean` | true | Whether to show step indicators (e.g. 1/3) |
| className? | `string` | - | Additional CSS class name |

## Layout

### card.ts.ts

#### CardProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant? | `CardVariant` | 'default' | Card variant style |
| size? | `CardSize` | 'md' | Card size (affects padding) |
| hoverable? | `boolean` | false | Whether the card is hoverable (shows hover effect) |
| direction? | `CardDirection` | 'vertical' | Card layout direction |
| className? | `string` | - | Additional CSS classes |

### carousel.ts.ts

#### CarouselProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| autoplay? | `boolean` | false | Whether to enable automatic slide switching |
| autoplaySpeed? | `number` | 3000 | Time interval for auto-play in milliseconds |
| dots? | `boolean` | true | Whether to show navigation dots |
| dotPosition? | `CarouselDotPosition` | 'bottom' | Position of navigation dots |
| effect? | `CarouselEffect` | 'scroll' | Transition effect type |
| arrows? | `boolean` | false | Whether to show prev/next arrows |
| infinite? | `boolean` | true | Whether to enable infinite loop |
| speed? | `number` | 500 | Transition animation duration in milliseconds |
| initialSlide? | `number` | 0 | Initial slide index (0-based) |
| pauseOnHover? | `boolean` | true | Whether to pause autoplay on hover |
| pauseOnFocus? | `boolean` | true | Whether to pause autoplay on focus |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

### container.ts.ts

#### ContainerProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| maxWidth? | `ContainerMaxWidth` | false | Maximum width constraint for the container - 'sm': max-w-screen-sm (640px) - 'md': max-w-screen-md (768px) - 'lg': max-w-screen-lg (1024px) - 'xl': max-w-screen-xl (1280px) - '2xl': max-w-screen-2xl (1536px) - 'full': w-full (100%) - false: no max-width constraint |
| center? | `boolean` | true | Whether to center the container horizontally |
| padding? | `boolean` | true | Whether to add horizontal padding |

### descriptions.ts.ts

#### DescriptionsProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| title? | `string` | - | Descriptions title |
| extra? | `unknown` | - | Extra content (actions, links, etc.) |
| bordered? | `boolean` | false | Whether to show border |
| column? | `number \| Partial<Record<'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl', number>>` | 3 | Number of columns per row. Can be a number or responsive object { xs?: number, sm?: number, md?: number, lg?: number, xl?: number, xxl?: number } |
| size? | `DescriptionsSize` | 'md' | Descriptions size |
| layout? | `DescriptionsLayout` | 'horizontal' | Descriptions layout |
| colon? | `boolean` | true | Whether to show colon after label |
| labelStyle? | `Record<string, string>` | - | Label style (CSS properties object) |
| contentStyle? | `Record<string, string>` | - | Content style (CSS properties object) |
| className? | `string` | - | Additional CSS classes |

### grid.ts.ts

#### RowProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| gutter? | `GutterSize` | 0 | Grid gutter, could be horizontal or [horizontal, vertical] |
| align? | `Align` | 'top' | Vertical alignment of flex layout |
| justify? | `Justify` | 'start' | Horizontal arrangement of flex layout |
| wrap? | `boolean` | true | Whether to wrap |

#### ColProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| span? | `ColSpan` | 24 | Number of cells to span, or responsive object |
| offset? | `number \| Partial<Record<Breakpoint, number>>` | 0 | Number of cells to offset |
| order? | `number \| Partial<Record<Breakpoint, number>>` | - | Number of cells to order |
| flex? | `string \| number` | - | Flex layout fill |

### layout.ts.ts

#### LayoutProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| className? | `string` | - | Additional CSS classes |

#### HeaderProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| className? | `string` | - | Additional CSS classes |
| height? | `string` | '64px' | Header height |

#### SidebarProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| className? | `string` | - | Additional CSS classes |
| width? | `string` | '256px' | Sidebar width |
| collapsedWidth? | `string` | '64px' | Width when collapsed (mini mode). Set to '0px' to fully hide the sidebar when collapsed. |
| collapsed? | `boolean` | false | Whether sidebar is collapsed |

#### ContentProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| className? | `string` | - | Additional CSS classes |

#### FooterProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| className? | `string` | - | Additional CSS classes |
| height? | `string` | 'auto' | Footer height |

### list.ts.ts

#### ListProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `ListSize` | 'md' | List size |
| bordered? | `ListBorderStyle` | 'divided' | List border style |
| loading? | `boolean` | false | Loading state |
| emptyText? | `string` | 'No data' | Empty state text |
| split? | `boolean` | true | Whether to show split line between items |
| itemLayout? | `ListItemLayout` | 'horizontal' | Item layout |
| header? | `unknown` | - | List header content |
| footer? | `unknown` | - | List footer content |
| pagination? | `ListPaginationConfig \| false` | - | Pagination configuration, set to false to disable |
| virtual? | `boolean` | false | Enable fixed-height virtual rendering via VirtualList. Recommended for large non-grid lists. |
| virtualHeight? | `number` | 400 | Virtual viewport height in pixels. |
| virtualItemHeight? | `number` | 40 | Fixed virtual item height in pixels. |
| virtualOverscan? | `number` | 5 | Number of extra virtual items to render above/below the viewport. |
| grid? | `{ gutter?: number column?: number xs?: number sm?: number md?: number lg?: number xl?: number xxl?: number }` | - | Grid configuration for grid layout |
| className? | `string` | - | Additional CSS classes |
| draggable? | `boolean` | false | Whether list items are draggable for reorder |

### resizable.ts.ts

#### ResizableProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| defaultWidth? | `number` | - | Default width in pixels |
| defaultHeight? | `number` | - | Default height in pixels |
| minWidth? | `number` | 0 | Minimum width in pixels |
| minHeight? | `number` | 0 | Minimum height in pixels |
| maxWidth? | `number` | - | Maximum width in pixels |
| maxHeight? | `number` | - | Maximum height in pixels |
| handles? | `ResizeHandlePosition[]` | ['right', 'bottom', 'bottom-right'] | Which handles to show |
| axis? | `ResizeAxis` | 'both' | Constraint axis |
| disabled? | `boolean` | false | Whether resizing is disabled |
| lockAspectRatio? | `boolean` | false | Whether to maintain aspect ratio |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

### skeleton.ts.ts

#### SkeletonProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant? | `SkeletonVariant` | 'text' | Skeleton variant - determines the placeholder shape |
| animation? | `SkeletonAnimation` | 'pulse' | Animation type |
| width? | `string` | undefined (uses variant defaults) | Width of the skeleton Can be a CSS value (e.g., '100px', '50%', '100%') |
| height? | `string` | undefined (uses variant defaults) | Height of the skeleton Can be a CSS value (e.g., '20px', '100px') |
| shape? | `SkeletonShape` | 'circle' | Shape of the skeleton (for avatar variant) |
| rows? | `number` | 1 | Number of skeleton items to render (for text variant) |
| paragraph? | `boolean` | false | Whether to render as a paragraph with varying widths (for text variant) |
| className? | `string` | - | Additional CSS classes |

### space.ts.ts

#### SpaceProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| direction? | `SpaceDirection` | 'horizontal' | Space direction |
| size? | `SpaceSize` | 'md' | Space size between items Can be a preset size ('sm' \| 'md' \| 'lg') or a custom number (in pixels) |
| align? | `SpaceAlign` | 'start' | Align items in the space |
| wrap? | `boolean` | false | Whether to wrap items |

### splitter.ts.ts

#### SplitterProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| direction? | `SplitDirection` | 'horizontal' | Direction of the split |
| sizes? | `number[]` | - | Initial sizes of each pane in pixels. If not provided, panes split equally. |
| min? | `number` | 0 | Minimum size of any pane in pixels |
| max? | `number` | - | Maximum size of any pane in pixels |
| gutterSize? | `number` | 4 | Width of the gutter/divider in pixels |
| disabled? | `boolean` | false | Whether the splitter is disabled |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

## Navigation

### affix.ts.ts

#### AffixProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| offsetTop? | `number` | 0 | Distance from the top of the viewport to trigger fixed positioning (px) Mutually exclusive with `offsetBottom`. |
| offsetBottom? | `number` | - | Distance from the bottom of the viewport to trigger fixed positioning (px) When set, the element affixes to the bottom. |
| target? | `string` | - | The scrollable container. Defaults to `window`. CSS selector string. |
| zIndex? | `number` | 10 | Z-index of the affixed element |
| className? | `string` | - | Additional CSS class name |

### anchor.ts.ts

#### AnchorProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| affix? | `boolean` | true | Whether to fix the anchor to the viewport |
| bounds? | `number` | 5 | Anchor detection boundary in pixels |
| offsetTop? | `number` | 0 | Offset from top of viewport when fixed |
| showInkInFixed? | `boolean` | false | Whether to show ink indicator when in fixed mode |
| targetOffset? | `number` | - | Offset when scrolling to target anchor |
| getCurrentAnchor? | `(activeLink: string) => string` | - | Custom function to determine current active anchor |
| getContainer? | `() => HTMLElement \| Window` | () => window | Get the scroll container |
| direction? | `AnchorDirection` | 'vertical' | Direction of the anchor navigation |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

#### AnchorLinkProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| href | `string` | - | Target anchor ID (with #) |
| title? | `string` | - | Link title/text |
| target? | `string` | - | Link target attribute |
| className? | `string` | - | Additional CSS classes |

### back-top.ts.ts

#### BackTopProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| visibilityHeight? | `number` | 400 | Scroll height to show the BackTop button |
| duration? | `number` | 450 | Use immediate scroll when set to 0; positive values use native smooth scrolling |

### breadcrumb.ts.ts

#### BreadcrumbProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| separator? | `BreadcrumbSeparator` | '/' | Custom separator between breadcrumb items |
| extra? | `unknown` | - | Extra content aligned to the end of the breadcrumb |
| maxItems? | `number` | - | Maximum number of visible items before collapsing. When set, middle items are collapsed into '...' with expand capability. |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, unknown>` | - | Inline styles |

#### BreadcrumbItemProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| href? | `string` | - | Navigation link URL |
| target? | `'_blank' \| '_self' \| '_parent' \| '_top'` | - | Link target attribute |
| current? | `boolean` | false | Whether this is the current/last item |
| separator? | `BreadcrumbSeparator` | - | Custom separator for this item (overrides global separator) |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, unknown>` | - | Inline styles |

### dropdown.ts.ts

#### DropdownProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| trigger? | `DropdownTrigger` | 'hover' | Trigger mode - click or hover |
| disabled? | `boolean` | false | Whether the dropdown is disabled |
| open? | `boolean` | - | Whether the dropdown is open (controlled mode) |
| defaultOpen? | `boolean` | false | Default open state (uncontrolled mode) |
| closeOnClick? | `boolean` | true | Whether to close dropdown on menu item click |
| showArrow? | `boolean` | true | Whether to show the dropdown arrow/chevron indicator |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, unknown>` | - | Custom styles |

#### DropdownMenuProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, unknown>` | - | Custom styles |

#### DropdownItemProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| key? | `string \| number` | - | Unique key for the dropdown item |
| disabled? | `boolean` | false | Whether the item is disabled |
| divided? | `boolean` | false | Whether the item is divided from previous item |
| icon? | `unknown` | - | Icon for the dropdown item |
| className? | `string` | - | Additional CSS classes |

### float-button.ts.ts

#### FloatButtonProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| shape? | `FloatButtonShape` | 'circle' | Shape of the button |
| size? | `FloatButtonSize` | 'md' | Button size |
| tooltip? | `string` | - | Tooltip text shown on hover |
| type? | `'primary' \| 'default'` | 'primary' | Button type / variant |
| disabled? | `boolean` | false | Whether the button is disabled |
| ariaLabel? | `string` | - | Accessible label |
| className? | `string` | - | Additional CSS class name |

#### FloatButtonGroupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| shape? | `FloatButtonShape` | 'circle' | Shape applied to all child buttons |
| trigger? | `'click' \| 'hover'` | 'click' | Whether the group expands on trigger |
| open? | `boolean` | - | Whether the group is open (controlled) |
| className? | `string` | - | Additional CSS class name |

### menu.ts.ts

#### MenuProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| mode? | `MenuMode` | 'vertical' | Menu mode - horizontal, vertical, or inline |
| theme? | `MenuTheme` | 'light' | Menu theme - light or dark |
| selectedKeys? | `MenuKey[]` | - | Currently selected menu item keys |
| defaultSelectedKeys? | `MenuKey[]` | - | Default selected menu item keys |
| openKeys? | `MenuKey[]` | - | Currently opened submenu keys (for vertical/inline mode) |
| defaultOpenKeys? | `MenuKey[]` | - | Default opened submenu keys |
| collapsed? | `boolean` | false | Whether the menu is collapsed (for vertical mode) |
| multiple? | `boolean` | true | Whether multiple submenus can be opened at once |
| inlineIndent? | `number` | true | Whether to allow inline indentation of submenus |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

#### MenuItemProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| itemKey | `MenuKey` | - | Unique key for the menu item |
| disabled? | `boolean` | - | Whether the menu item is disabled |
| icon? | `unknown` | - | Icon for the menu item |
| className? | `string` | - | Additional CSS classes |

#### SubMenuProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| itemKey | `MenuKey` | - | Unique key for the submenu |
| title? | `string` | - | Submenu title |
| icon? | `unknown` | - | Icon for the submenu |
| disabled? | `boolean` | - | Whether the submenu is disabled |
| className? | `string` | - | Additional CSS classes |

#### MenuItemGroupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| title? | `string` | - | Group title |
| className? | `string` | - | Additional CSS classes |

### pagination.ts.ts

#### PaginationProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| current? | `number` | 1 | Current page number (1-indexed) |
| defaultCurrent? | `number` | 1 | Default current page (for uncontrolled mode) |
| total? | `number` | 0 | Total number of items |
| pageSize? | `number` | 10 | Number of items per page |
| defaultPageSize? | `number` | 10 | Default page size (for uncontrolled mode) |
| pageSizeOptions? | `PaginationPageSizeOptionItem[]` | [10, 20, 50, 100] | Available page size options |
| showQuickJumper? | `boolean` | false | Whether to show quick jumper (input for page number) |
| quickJumperValidation? | `PaginationQuickJumperValidationOptions` | - | Quick jumper delayed validation timing. |
| showSizeChanger? | `boolean` | false | Whether to show page size selector |
| showTotal? | `boolean` | true | Whether to show total count |
| totalText? | `(total: number, range: [number, number]) => string` | - | Custom total text renderer |
| simple? | `boolean` | false | Simple mode - only show prev/next buttons |
| size? | `PaginationSize` | 'medium' | Size of pagination |
| align? | `PaginationAlign` | 'center' | Alignment of pagination |
| disabled? | `boolean` | false | Whether pagination is disabled |
| hideOnSinglePage? | `boolean` | false | Whether to hide pagination on single page |
| showLessItems? | `boolean` | false | Whether to show fewer page buttons around current page |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |
| locale? | `TigerLocaleInput` | - | Locale configuration. Accepts a sync locale, promise, or lazy loader. |

### steps.ts.ts

#### StepsProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| current? | `number` | 0 | Current step index (0-based) |
| status? | `StepStatus` | 'process' | Step status (for current step) |
| direction? | `StepsDirection` | 'horizontal' | Steps direction/orientation |
| size? | `StepSize` | 'default' | Step size |
| simple? | `boolean` | false | Whether to use simple style (no description, smaller icons) |
| clickable? | `boolean` | false | Whether steps are clickable for navigation |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, unknown>` | - | Additional styles |

### tabs.ts.ts

#### TabsProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| activeKey? | `string \| number` | - | Currently active tab key |
| defaultActiveKey? | `string \| number` | - | Default active tab key (for uncontrolled mode) |
| type? | `TabType` | 'line' | Tab type - line, card, or editable-card |
| tabPosition? | `TabPosition` | 'top' | Tab position - top, bottom, left, or right |
| size? | `TabSize` | 'medium' | Tab size - small, medium, or large |
| closable? | `boolean` | false | Whether tabs can be closed (only works with editable-card type) |
| centered? | `boolean` | false | Whether tabs are centered |
| destroyInactiveTabPane? | `boolean` | false | Whether to destroy inactive tab panes |
| lazy? | `boolean` | false | Whether to lazily render tab panes (only render when first activated) |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

#### TabPaneProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| tabKey | `string \| number` | - | Unique key for the tab pane (required) |
| label | `string` | - | Tab label/title |
| disabled? | `boolean` | false | Whether the tab is disabled |
| closable? | `boolean` | - | Whether the tab can be closed (overrides parent closable) |
| icon? | `unknown` | - | Icon for the tab |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

### tree.ts.ts

#### TreeProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| treeData? | `TreeNode[]` | - | Tree data source |
| selectionMode? | `TreeSelectionMode` | 'none' | Selection mode |
| checkable? | `boolean` | false | Whether to show checkboxes |
| showIcon? | `boolean` | true | Whether to show expand/collapse icon |
| showLine? | `boolean` | false | Whether to show connecting lines |
| defaultExpandedKeys? | `(string \| number)[]` | - | Default expanded node keys |
| defaultSelectedKeys? | `(string \| number)[]` | - | Default selected node keys |
| defaultCheckedKeys? | `(string \| number)[]` | - | Default checked node keys |
| expandedKeys? | `(string \| number)[]` | - | Expanded node keys (controlled) |
| selectedKeys? | `(string \| number)[]` | - | Selected node keys (controlled) |
| checkedKeys? | `(string \| number)[] \| TreeCheckedState` | - | Checked node keys (controlled) |
| defaultExpandAll? | `boolean` | false | Whether to expand all nodes by default |
| checkStrictly? | `boolean` | false | Whether parent and children are associated when checked |
| checkStrategy? | `TreeCheckStrategy` | 'all' | Check strategy for return values |
| selectable? | `boolean` | true | Whether to allow node selection |
| multiple? | `boolean` | false | Whether multiple nodes can be selected |
| loadData? | `TreeLoadDataFn` | - | Whether to load data asynchronously |
| filterValue? | `string` | - | Filter value for highlighting matched nodes |
| searchable? | `boolean` | false | Whether to show built-in search input |
| filterFn? | `TreeFilterFn` | - | Custom filter function |
| autoExpandParent? | `boolean` | true | Whether to auto expand parent nodes when filtering |
| virtual? | `boolean` | false | Enable virtualized rendering. The tree is flattened to its currently visible items and rendered through `VirtualList` with fixed item height. Recommended for large trees (> ~200 visible items). |
| height? | `number \| string` | 400 | Pixel height of the virtualized scroll viewport. |
| itemHeight? | `number` | 32 | Pixel height of each virtualized tree row. |
| draggable? | `boolean` | false | Whether nodes are draggable |
| blockNode? | `boolean` | false | Block node style (full width) |
| className? | `string` | - | Additional CSS classes |
| ariaLabel? | `string` | 'Tree' | Accessible label for the tree container |

## Data

### calendar.ts.ts

#### CalendarProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| mode? | `CalendarMode` | - | Calendar display mode |
| fullscreen? | `boolean` | - | Whether the calendar is full-screen or card-style |
| disabledDate? | `(date: Date) => boolean` | - | Function that determines if a date is disabled |
| className? | `string` | - | Custom class name |

### collapse.ts.ts

#### CollapseProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| activeKey? | `string \| number \| (string \| number)[]` | - | Currently active panel keys (controlled mode) |
| defaultActiveKey? | `string \| number \| (string \| number)[]` | - | Default active panel keys (uncontrolled mode) |
| accordion? | `boolean` | false | Accordion mode - only one panel can be expanded at a time |
| bordered? | `boolean` | true | Whether to show border |
| expandIconPosition? | `ExpandIconPosition` | 'start' | Position of the expand icon |
| ghost? | `boolean` | false | Ghost mode - transparent without border |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

#### CollapsePanelProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| panelKey | `string \| number` | - | Unique key for the panel (required) |
| header? | `string` | - | Panel header/title |
| disabled? | `boolean` | false | Whether the panel is disabled |
| showArrow? | `boolean` | true | Whether to show arrow icon |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

### table.ts.ts

#### TableProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| columns | `TableColumn<T>[]` | - | Table columns configuration |
| columnLockable? | `boolean` | false | Whether to show a lock button in each column header. Clicking the lock toggles the column fixed state. |
| dataSource? | `T[]` | [] | Table data source |
| sort? | `SortState` | - | Controlled sort state. When provided, internal sort state will not be mutated. |
| defaultSort? | `SortState` | - | Default sort state for uncontrolled mode. |
| filters? | `Record<string, unknown>` | - | Controlled filters. When provided, internal filter state will not be mutated. |
| defaultFilters? | `Record<string, unknown>` | - | Default filters for uncontrolled mode. |
| size? | `TableSize` | 'md' | Table size |
| bordered? | `boolean` | false | Whether to show border |
| striped? | `boolean` | false | Whether to show striped rows |
| hoverable? | `boolean` | true | Whether to highlight row on hover |
| loading? | `boolean` | false | Loading state |
| emptyText? | `string` | 'No data' | Empty state text |
| pagination? | `PaginationConfig \| false` | - | Pagination configuration Set to false to disable pagination |
| rowSelection? | `RowSelectionConfig<T>` | - | Row selection configuration |
| expandable? | `ExpandableConfig<T>` | - | Row expansion configuration. Adds an expand toggle column and renders expanded content below each row. |
| rowKey? | `string \| ((record: T) => string \| number)` | (record) => record.id | Function to get row key |
| rowClassName? | `string \| ((record: T, index: number) => string)` | - | Custom row class name |
| stickyHeader? | `boolean` | false | Whether table head is sticky |
| maxHeight? | `string \| number` | - | Max height for scrollable table |
| tableLayout? | `'auto' \| 'fixed'` | 'auto' | Table layout algorithm |
| virtual? | `boolean` | false | Enable virtual scrolling for large datasets |
| autoVirtual? | `boolean` | true | Automatically enable Table's virtual scroll container for very large data sets. |
| virtualHeight? | `number` | 400 | Virtual scroll viewport height (px) |
| virtualItemHeight? | `number` | 40 | Virtual scroll row height (px) |
| autoVirtualThreshold? | `number` | 10000 | Row count at which Table enables virtual mode automatically when `autoVirtual` is true. |
| virtualThreshold? | `number` | 1000 | Row count at which Table marks virtual rendering as recommended. Table does not enable virtualization automatically; use this signal to switch to `virtual` or the dedicated `VirtualTable` component. |
| editable? | `boolean` | false | Enable cell editing |
| editableCells? | `Map<string, Set<number>>` | - | Set of editable cells: Map<columnKey, Set<rowIndex>> If not provided and editable=true, all cells are editable |
| filterMode? | `'basic' \| 'advanced'` | 'basic' | Filter mode |
| advancedFilterRules? | `FilterRule[]` | - | Advanced filter rules (used when filterMode='advanced') |
| columnDraggable? | `boolean` | false | Enable column drag reorder |
| summaryRow? | `{ show: boolean; data: Record<string, unknown> }` | - | Summary row configuration |
| groupBy? | `string` | - | Group rows by column key |
| exportable? | `boolean` | false | Enable CSV export |
| exportFilename? | `string` | 'export' | Export filename (without extension) |

## Charts

### chart.ts.ts

#### BaseChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| width? | `number` | 320 | Chart width |
| height? | `number` | 200 | Chart height |
| padding? | `ChartPadding` | 24 | Chart padding |
| title? | `string` | - | Accessible title for the SVG |
| desc? | `string` | - | Accessible description for the SVG |
| className? | `string` | - | Additional CSS classes |

#### ChartInteractionProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| hoverable? | `boolean` | false | Enable hover highlight |
| hoveredIndex? | `number \| null` | - | Hovered index (controlled) |
| activeOpacity? | `number` | 1 | Opacity for active/hovered element |
| inactiveOpacity? | `number` | 0.25 | Opacity for inactive elements when one is active |
| selectable? | `boolean` | false | Enable click selection |
| selectedIndex? | `number \| null` | - | Selected index (controlled) |

#### ChartLegendProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| showLegend? | `boolean` | false | Whether to show legend |
| legendPosition? | `ChartLegendPosition` | 'bottom' | Legend position |
| legendMarkerSize? | `number` | 10 | Legend marker size in px |
| legendGap? | `number` | 8 | Legend item gap in px |

#### ChartTooltipProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| showTooltip? | `boolean` | true | Whether to show tooltip |

#### ChartWithAxesProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| xScale? | `ChartScale` | - | Custom x scale |
| yScale? | `ChartScale` | - | Custom y scale |
| showGrid? | `boolean` | true | Whether to show grid |
| showAxis? | `boolean` | true | Whether to show axes |
| showXAxis? | `boolean` | true | Whether to show X axis |
| showYAxis? | `boolean` | true | Whether to show Y axis |
| xAxisLabel? | `string` | - | X axis label |
| yAxisLabel? | `string` | - | Y axis label |
| xTicks? | `number` | 5 | X ticks |
| yTicks? | `number` | 5 | Y ticks |
| xTickValues? | `ChartScaleValue[]` | - | X tick values |
| yTickValues? | `number[]` | - | Y tick values |
| xTickFormat? | `(value: ChartScaleValue) => string` | - | X tick format |
| yTickFormat? | `(value: ChartScaleValue) => string` | - | Y tick format |
| gridLineStyle? | `ChartGridLineStyle` | 'solid' | Grid line style |
| gridStrokeWidth? | `number` | 1 | Grid stroke width |

#### ChartCanvasProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| width? | `number` | 320 | SVG width |
| height? | `number` | 200 | SVG height |
| responsive? | `boolean` | false | Resize the SVG to its parent container using ResizeObserver |
| padding? | `ChartPadding` | 24 | Inner padding for chart drawing area |
| className? | `string` | - | Additional CSS classes |
| title? | `string` | - | Accessible title for the SVG |
| desc? | `string` | - | Accessible description for the SVG |

#### ChartAxisProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| orientation? | `ChartAxisOrientation` | 'bottom' | Axis orientation |
| scale | `ChartScale` | - | Axis scale |
| ticks? | `number` | 5 | Number of ticks (only for linear scale) |
| tickValues? | `ChartScaleValue[]` | - | Explicit tick values |
| tickFormat? | `(value: ChartScaleValue) => string` | - | Tick label formatter |
| tickSize? | `number` | 6 | Tick size in px |
| tickPadding? | `number` | 4 | Tick padding in px |
| label? | `string` | - | Axis label |
| labelOffset? | `number` | 28 | Label offset in px |
| x? | `number` | 0 | X offset |
| y? | `number` | 0 | Y offset |
| className? | `string` | - | Additional CSS classes |

#### ChartGridProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| xScale? | `ChartScale` | - | X axis scale |
| yScale? | `ChartScale` | - | Y axis scale |
| show? | `ChartGridLine` | 'both' | Show grid lines |
| xTicks? | `number` | 5 | X axis tick count |
| yTicks? | `number` | 5 | Y axis tick count |
| xTickValues? | `ChartScaleValue[]` | - | Explicit X tick values |
| yTickValues? | `ChartScaleValue[]` | - | Explicit Y tick values |
| lineStyle? | `ChartGridLineStyle` | 'solid' | Grid line style |
| strokeWidth? | `number` | 1 | Line stroke width |
| x? | `number` | 0 | X offset |
| y? | `number` | 0 | Y offset |
| className? | `string` | - | Additional CSS classes |

#### ChartSeriesProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `T[]` | - | Series data |
| name? | `string` | - | Series name |
| color? | `string` | - | Series color |
| opacity? | `number` | - | Series opacity |
| type? | `ChartSeriesType` | - | Series type hint |
| className? | `string` | - | Additional CSS classes |

#### BarChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `BarChartDatum[]` | - | Chart data |
| xScale? | `ChartScale` | - | Custom x scale |
| yScale? | `ChartScale` | - | Custom y scale |
| barColor? | `string` | - | Bar color |
| colors? | `string[]` | - | Custom colors for bars |
| barRadius? | `number` | 4 | Bar corner radius |
| barPaddingInner? | `number` | 0.2 | Inner padding ratio for bars |
| barPaddingOuter? | `number` | 0.1 | Outer padding ratio for bars |
| showGrid? | `boolean` | true | Whether to show grid |
| showAxis? | `boolean` | true | Whether to show axes |
| showXAxis? | `boolean` | true | Whether to show X axis |
| showYAxis? | `boolean` | true | Whether to show Y axis |
| xAxisLabel? | `string` | - | X axis label |
| yAxisLabel? | `string` | - | Y axis label |
| xTicks? | `number` | 5 | X ticks |
| yTicks? | `number` | 5 | Y ticks |
| xTickValues? | `ChartScaleValue[]` | - | X tick values |
| yTickValues? | `ChartScaleValue[]` | - | Y tick values |
| xTickFormat? | `(value: ChartScaleValue) => string` | - | X tick format |
| yTickFormat? | `(value: ChartScaleValue) => string` | - | Y tick format |
| gridLineStyle? | `ChartGridLineStyle` | 'solid' | Grid line style |
| gridStrokeWidth? | `number` | 1 | Grid stroke width |
| showValueLabels? | `boolean` | false | Show value labels above or inside bars |
| valueLabelPosition? | `BarValueLabelPosition` | 'top' | Value label position |
| valueLabelFormatter? | `(datum: BarChartDatum, index: number) => string` | - | Value label formatter |
| barMinHeight? | `number` | 0 | Minimum bar height in px (ensures near-zero values remain visible) |
| barMaxWidth? | `number` | - | Maximum bar width in px (prevents overly wide bars with few data points) |
| gradient? | `boolean` | false | Enable linear gradient fill on bars (top-to-bottom, lighter to full) |
| animated? | `boolean` | false | Enable CSS transitions for smooth bar updates |
| tooltipFormatter? | `(datum: BarChartDatum, index: number) => string` | - | Tooltip formatter |
| legendFormatter? | `(datum: BarChartDatum, index: number) => string` | - | Legend formatter |

#### ScatterChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `ScatterChartDatum[]` | - | Chart data |
| pointSize? | `number` | 6 | Point size (radius) |
| pointColor? | `string` | - | Point color |
| pointOpacity? | `number` | - | Point opacity |
| pointStyle? | `'circle' \| 'square' \| 'triangle' \| 'diamond'` | 'circle' | Point shape |
| gradient? | `boolean` | false | Enable radial gradient fill for points |
| animated? | `boolean` | false | Enable entrance animation with stagger |
| pointBorderWidth? | `number` | 0 | Point border (stroke) width |
| pointBorderColor? | `string` | 'white' | Point border (stroke) color |
| includeZero? | `boolean` | false | Include zero in domain |
| colors? | `string[]` | - | Custom colors for points |
| tooltipFormatter? | `(datum: ScatterChartDatum, index: number) => string` | - | Tooltip formatter |
| legendFormatter? | `(datum: ScatterChartDatum, index: number) => string` | - | Legend formatter |

#### PieChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `PieChartDatum[]` | - | Chart data |
| innerRadius? | `number` | 0 | Inner radius for donut |
| outerRadius? | `number` | - | Outer radius |
| startAngle? | `number` | 0 | Start angle in radians |
| endAngle? | `number` | Math.PI * 2 | End angle in radians |
| padAngle? | `number` | 0 | Padding angle in radians |
| colors? | `string[]` | - | Custom colors |
| showLabels? | `boolean` | false | Whether to show labels |
| labelFormatter? | `(value: number, datum: PieChartDatum, index: number) => string` | - | Label formatter |
| tooltipFormatter? | `(datum: PieChartDatum, index: number) => string` | - | Tooltip formatter |
| legendFormatter? | `(datum: PieChartDatum, index: number) => string` | - | Legend formatter |
| borderWidth? | `number` | 2 | Border width between slices |
| borderColor? | `string` | '#ffffff' | Border color between slices |
| hoverOffset? | `number` | 8 | Distance slices translate outward on hover (ECharts emphasis style) |
| labelPosition? | `'inside' \| 'outside'` | 'inside' | Label position: inside the slice or outside with leader lines |
| shadow? | `boolean` | false | Enable drop shadow on slices |
| gradient? | `boolean` | false | Enable per-slice top→bottom alpha gradient fill (1.0 → 0.7). Opt-in; default `false` keeps the original solid `arc.color` fill. |

#### DonutChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| innerRadiusRatio? | `number` | 0.6 | Inner radius ratio based on outer radius |
| centerValue? | `string \| number` | - | Text shown as the main value in the donut center |
| centerLabel? | `string` | - | Descriptive label shown below centerValue in the donut center |
| animated? | `boolean` | false | Enable entrance animation (fade + scale) |

#### LineChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data? | `LineChartDatum[]` | - | Chart data (single series) |
| series? | `LineChartSeries[]` | - | Multiple series |
| xScale? | `ChartScale` | - | Custom x scale |
| yScale? | `ChartScale` | - | Custom y scale |
| lineColor? | `string` | - | Line color (for single series) |
| strokeWidth? | `number` | 2 | Line stroke width |
| curve? | `ChartCurveType` | 'linear' | Curve interpolation type |
| showPoints? | `boolean` | true | Whether to show data points |
| pointSize? | `number` | 4 | Point size |
| pointColor? | `string` | - | Point color |
| showGrid? | `boolean` | true | Whether to show grid |
| showAxis? | `boolean` | true | Whether to show axes |
| showXAxis? | `boolean` | true | Whether to show X axis |
| showYAxis? | `boolean` | true | Whether to show Y axis |
| includeZero? | `boolean` | false | Include zero in Y domain |
| xAxisLabel? | `string` | - | X axis label |
| yAxisLabel? | `string` | - | Y axis label |
| xTicks? | `number` | 5 | X ticks |
| yTicks? | `number` | 5 | Y ticks |
| xTickValues? | `ChartScaleValue[]` | - | X tick values |
| yTickValues? | `number[]` | - | Y tick values |
| xTickFormat? | `(value: ChartScaleValue) => string` | - | X tick format |
| yTickFormat? | `(value: ChartScaleValue) => string` | - | Y tick format |
| gridLineStyle? | `ChartGridLineStyle` | 'solid' | Grid line style |
| gridStrokeWidth? | `number` | 1 | Grid stroke width |
| colors? | `string[]` | - | Custom colors for multi-series |
| showArea? | `boolean` | false | Show gradient area fill under lines |
| areaOpacity? | `number` | 0.15 | Area fill opacity |
| pointHollow? | `boolean` | false | Hollow point style (stroke + white fill, ECharts emptyCircle) |
| animated? | `boolean` | false | Enable line draw entrance animation |
| strokeGradient? | `boolean` | false | Render line stroke as a 3-stop gradient (lighter → base → darker) derived from each series color via `color-mix(in oklab, …)`. Provides a subtle modern brightness ramp without requiring palette knowledge. |
| pointGradient? | `boolean` | false | Render data point fill as a per-series `<radialGradient>` (bright center → series color edge) for a hollow / 3D-sphere look. Has no effect on points where `pointHollow` is true (those keep the white-fill + colored-stroke style). |
| tooltipFormatter? | `( datum: LineChartDatum, seriesIndex: number, index: number, series?: LineChartSeries ) => string` | - | Tooltip formatter |
| legendFormatter? | `(series: LineChartSeries, index: number) => string` | - | Legend formatter |

#### AreaChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data? | `AreaChartDatum[]` | - | Chart data (single series) |
| series? | `AreaChartSeries[]` | - | Multiple series |
| xScale? | `ChartScale` | - | Custom x scale |
| yScale? | `ChartScale` | - | Custom y scale |
| areaColor? | `string` | - | Line/area color (for single series) |
| strokeWidth? | `number` | 2 | Line stroke width |
| fillOpacity? | `number` | 0.2 | Fill opacity |
| curve? | `ChartCurveType` | 'linear' | Curve interpolation type |
| showPoints? | `boolean` | false | Whether to show data points |
| pointSize? | `number` | 4 | Point size |
| pointColor? | `string` | - | Point color |
| stacked? | `boolean` | false | Whether to stack areas |
| showGrid? | `boolean` | true | Whether to show grid |
| showAxis? | `boolean` | true | Whether to show axes |
| showXAxis? | `boolean` | true | Whether to show X axis |
| showYAxis? | `boolean` | true | Whether to show Y axis |
| includeZero? | `boolean` | true (different from LineChart) | Include zero in Y domain |
| xAxisLabel? | `string` | - | X axis label |
| yAxisLabel? | `string` | - | Y axis label |
| xTicks? | `number` | 5 | X ticks |
| yTicks? | `number` | 5 | Y ticks |
| xTickValues? | `ChartScaleValue[]` | - | X tick values |
| yTickValues? | `number[]` | - | Y tick values |
| xTickFormat? | `(value: ChartScaleValue) => string` | - | X tick format |
| yTickFormat? | `(value: ChartScaleValue) => string` | - | Y tick format |
| gridLineStyle? | `ChartGridLineStyle` | 'solid' | Grid line style |
| gridStrokeWidth? | `number` | 1 | Grid stroke width |
| colors? | `string[]` | - | Custom colors for multi-series |
| gradient? | `boolean` | false | Enable linear gradient fill (top-to-bottom, ECharts style) |
| pointHollow? | `boolean` | false | Hollow point style (stroke + white fill, ECharts emptyCircle) |
| animated? | `boolean` | false | Enable line draw entrance animation |
| strokeGradient? | `boolean` | false | Render line stroke as a 3-stop horizontal gradient (lighter → base → darker) derived from each series color via `color-mix(in oklab, …)`. Provides a subtle modern brightness ramp without requiring palette knowledge. |
| pointGradient? | `boolean` | false | Render data point fill as a per-series `<radialGradient>` (bright center → series color edge) for a hollow / 3D-sphere look. Has no effect on points where `pointHollow` is true (those keep the white-fill + colored-stroke style). |
| tooltipFormatter? | `( datum: AreaChartDatum, seriesIndex: number, index: number, series?: AreaChartSeries ) => string` | - | Tooltip formatter |
| legendFormatter? | `(series: AreaChartSeries, index: number) => string` | - | Legend formatter |

#### RadarChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data? | `RadarChartDatum[]` | - | Chart data (single series) |
| series? | `RadarChartSeries[]` | - | Multiple series |
| maxValue? | `number` | - | Max value for radius scaling |
| startAngle? | `number` | -Math.PI / 2 | Start angle in radians |
| levels? | `number` | 5 | Grid levels |
| showLevelLabels? | `boolean` | false | Whether to show level labels |
| showGrid? | `boolean` | true | Whether to show grid |
| showAxis? | `boolean` | true | Whether to show axis lines |
| showLabels? | `boolean` | true | Whether to show labels |
| labelOffset? | `number` | 12 | Label offset from outer radius |
| labelFormatter? | `(datum: RadarChartDatum, index: number) => string` | - | Label formatter |
| levelLabelFormatter? | `(value: number, level: number) => string` | - | Level label formatter |
| levelLabelOffset? | `number` | 8 | Level label offset |
| hoverable? | `boolean` | false | Enable hover highlight |
| hoveredIndex? | `number \| null` | - | Hovered series index (controlled) |
| activeOpacity? | `number` | 1 | Opacity for active/hovered series |
| inactiveOpacity? | `number` | 0.25 | Opacity for inactive series |
| selectable? | `boolean` | false | Enable click selection |
| selectedIndex? | `number \| null` | - | Selected series index (controlled) |
| tooltipFormatter? | `( datum: RadarChartDatum, seriesIndex: number, index: number, series?: RadarChartSeries ) => string` | - | Tooltip formatter |
| legendFormatter? | `(series: RadarChartSeries, index: number) => string` | - | Legend formatter |
| colors? | `string[]` | - | Colors for series |
| gridLineStyle? | `ChartGridLineStyle` | 'solid' | Grid line style |
| gridStrokeWidth? | `number` | 1 | Grid stroke width |
| strokeColor? | `string` | - | Polygon stroke color |
| strokeWidth? | `number` | 2 | Polygon stroke width |
| fillColor? | `string` | - | Polygon fill color |
| fillOpacity? | `number` | 0.2 | Polygon fill opacity |
| showPoints? | `boolean` | true | Whether to show data points |
| pointSize? | `number` | 3 | Point size |
| pointColor? | `string` | - | Point color |
| gridShape? | `'polygon' \| 'circle'` | 'polygon' | Grid shape: polygon (default) or circle (ECharts style) |
| showSplitArea? | `boolean` | false | Show alternating split area fills between grid levels |
| splitAreaOpacity? | `number` | 0.06 | Split area fill opacity |
| splitAreaColors? | `string[]` | - | Split area colors (alternates between entries) |
| pointBorderWidth? | `number` | 2 | Point border width (white ring around data points) |
| pointBorderColor? | `string` | '#fff' | Point border color |
| pointHoverSize? | `number` | - | Point size when hovered (enlargement effect) |
| labelAutoAlign? | `boolean` | true | Auto-align axis labels based on their angle position |
| strokeGradient? | `boolean` | false | Render each series polygon stroke as a 3-stop vertical gradient (lighter → base → darker) derived from the series color via `color-mix(in oklab, …)`. Provides a subtle modern brightness ramp without requiring palette knowledge. Opt-in; defaults to flat stroke. |
| pointGradient? | `boolean` | false | Render data point fill as a per-series `<radialGradient>` (bright center → series color edge) for a 3D-sphere look. Only applies when `showPoints` is true (default). |

#### FunnelChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `FunnelChartDatum[]` | - | Data items — ordered from widest to narrowest |
| direction? | `'vertical' \| 'horizontal'` | 'vertical' | Vertical or horizontal layout |
| gap? | `number` | 2 | Gap between funnel segments in px |
| pinch? | `boolean` | false | Whether the last segment tapers to a point |
| colors? | `string[]` | - | Palette of colors |
| gradient? | `boolean` | false | Render each segment with a vertical alpha gradient (top opaque → bottom faded). Opt-in; defaults to flat fill so existing visuals stay 1:1. |

#### GaugeChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value | `number` | - | Current value |
| min? | `number` | 0 | Minimum value of the scale |
| max? | `number` | 100 | Maximum value of the scale |
| startAngle? | `number` | 135 | Start angle in degrees (0 = 3 o'clock, counter-clockwise) |
| endAngle? | `number` | 405 | End angle in degrees |
| arcWidth? | `number` | 20 | Arc stroke width in px |
| showTicks? | `boolean` | true | Whether to show tick marks |
| tickCount? | `number` | 5 | Number of major ticks |
| valueFormatter? | `(value: number) => string` | - | Value label format function |
| label? | `string` | - | Label shown below the value |
| segments? | `Array<{ range: [number, number] color: string }>` | - | Color segments along the arc. Array of { range: [from, to], color } |
| trackColor? | `string` | 'var(--tiger-border,#e5e7eb)' | Default arc track color |
| color? | `string` | 'var(--tiger-primary,#2563eb)' | Default arc fill color |
| colors? | `string[]` | - | Palette of colors |
| gradient? | `boolean` | false | When true, the value arc is rendered with a vertical alpha gradient (top: full opacity → bottom: low opacity) using a per-instance `<linearGradient>` definition. Opt-in; default keeps the solid arc fill. |

#### HeatmapChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `HeatmapChartDatum[]` | - | Data points |
| xLabels | `string[]` | - | X-axis labels |
| yLabels | `string[]` | - | Y-axis labels |
| minColor? | `string` | '#f0f9ff' | Min color (for lowest value) |
| maxColor? | `string` | 'var(--tiger-primary,#2563eb)' | Max color (for highest value) |
| cellRadius? | `number` | 2 | Cell border radius in px |
| cellGap? | `number` | 1 | Gap between cells in px |
| showValues? | `boolean` | false | Whether to show value labels inside cells |
| valueFormatter? | `(value: number) => string` | - | Value format function |
| colors? | `string[]` | - | Palette of colors |
| colorSpace? | `'rgb' \| 'oklch'` | 'rgb' | Colour interpolation space for cell fills. - `'rgb'` (default): legacy linear hex interpolation between `minColor` and `maxColor`. - `'oklch'`: emit a CSS `color-mix(in oklch, ...)` expression so the browser performs perceptually-uniform shading. Recommended when `minColor`/`maxColor` are CSS colour functions or theme tokens. |
| renderMode? | `'svg' \| 'canvas' \| 'auto'` | 'auto' | Rendering backend for heatmap cells. - `'svg'`: render one `<rect>` per cell. - `'canvas'`: draw cells into a canvas layer for large matrices. - `'auto'`: switch to canvas when cell count exceeds `canvasThreshold`. |
| canvasThreshold? | `number` | 1000 | Cell count threshold used when `renderMode` is `'auto'`. |

#### TreeMapChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `TreeMapChartDatum[]` | - | Hierarchical data |
| gap? | `number` | 2 | Gap between nodes in px |
| showLabels? | `boolean` | true | Whether to show labels inside nodes |
| minLabelSize? | `number` | 10 | Minimum font size for labels (hide if cell too small) |
| colors? | `string[]` | - | Palette of colors |
| gradient? | `boolean` | false | Whether to apply a top-to-bottom alpha gradient to each node fill for a subtle "lit from above" depth effect (opt-in, default `false`). |

#### SunburstChartProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `SunburstChartDatum[]` | - | Hierarchical data |
| innerRadiusRatio? | `number` | 0 | Inner radius ratio (0 = no hole, 0.3 = donut-like) |
| showLabels? | `boolean` | true | Whether to show labels on arcs |
| colors? | `string[]` | - | Palette of colors |
| gradient? | `boolean` | false | Whether to apply a top-to-bottom alpha gradient to each arc fill for a subtle "lit from above" depth effect (opt-in, default `false`). |

## Advanced

### code-editor.ts.ts

#### CodeEditorProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value? | `string` | - | The code content |
| defaultValue? | `string` | - | Default code content (uncontrolled mode) |
| language? | `CodeLanguage` | 'plain' | Programming language for syntax highlighting |
| theme? | `CodeEditorTheme` | 'light' | Editor theme |
| readOnly? | `boolean` | false | Whether the editor is read-only |
| lineNumbers? | `boolean` | true | Whether to show line numbers |
| highlightActiveLine? | `boolean` | true | Whether to highlight the current line |
| tabSize? | `number` | 2 | Tab size in spaces |
| placeholder? | `string` | - | Placeholder text when empty |
| wordWrap? | `boolean` | false | Whether to wrap long lines |
| minLines? | `number` | 3 | Minimum number of visible lines |
| maxLines? | `number` | 0 | Maximum number of visible lines (0 = no limit) |
| disabled? | `boolean` | false | Whether the editor is disabled |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, string \| number>` | - | Custom styles |

### file-manager.ts.ts

#### FileManagerProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| files? | `FileItem[]` | - | File/folder tree data |
| viewMode? | `FileViewMode` | - | View mode |
| selectedKeys? | `(string \| number)[]` | - | Currently selected file keys |
| multiple? | `boolean` | - | Allow multiple selection |
| columns? | `FileSortField[]` | - | Which columns to show in list view |
| sortField? | `FileSortField` | - | Sort field |
| sortOrder? | `FileSortOrder` | - | Sort order |
| currentPath? | `string[]` | - | Current directory path (breadcrumb) |
| showHidden? | `boolean` | - | Show hidden files (prefixed with .) |
| draggable? | `boolean` | - | Enable drag and drop |
| loading? | `boolean` | - | Loading state |
| emptyText? | `string` | - | Empty text |
| searchable? | `boolean` | - | Searchable |
| searchText? | `string` | - | Search text |
| className? | `string` | - | Custom class |

### image-viewer.ts.ts

#### ImageViewerProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| images | `string[]` | - | Array of image URLs to display |
| open? | `boolean` | false | Whether the viewer is visible |
| currentIndex? | `number` | 0 | Current image index |
| zoomable? | `boolean` | true | Whether to enable zoom controls |
| rotatable? | `boolean` | true | Whether to enable rotation controls |
| showNav? | `boolean` | true | Whether to show navigation arrows |
| showCounter? | `boolean` | true | Whether to show image counter (e.g. "1 / 5") |
| maskClosable? | `boolean` | true | Whether to close on mask/backdrop click |
| minZoom? | `number` | 0.5 | Minimum zoom scale |
| maxZoom? | `number` | 3 | Maximum zoom scale |
| className? | `string` | - | Additional CSS classes |

### infinite-scroll.ts.ts

#### InfiniteScrollProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| hasMore? | `boolean` | - | Whether more data is available |
| loading? | `boolean` | - | Whether a load is currently in progress |
| threshold? | `number` | - | Distance (px) from bottom to trigger load |
| loadingText? | `string` | - | Custom loading text |
| endText? | `string` | - | Custom end text shown when !hasMore |
| direction? | `'vertical' \| 'horizontal'` | - | Scroll direction |
| inverse? | `boolean` | - | Inverse scroll (load at top, e.g. chat) |
| disabled? | `boolean` | - | Disable the infinite scroll trigger |
| className? | `string` | - | Custom CSS class |

### kanban.ts.ts

#### KanbanProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| swimlanes? | `KanbanSwimlane[]` | - | Enable swim-lane grouping (horizontal lanes across columns) |
| swimlaneField? | `string` | - | Card field used to assign swim-lanes |

### print-layout.ts.ts

#### PrintLayoutProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| pageSize? | `PrintPageSize` | 'A4' | Page size preset |
| orientation? | `PrintOrientation` | 'portrait' | Page orientation |
| showHeader? | `boolean` | false | Whether to show print-only header |
| showFooter? | `boolean` | false | Whether to show print-only footer |
| headerText? | `string` | - | Header text content (appears only in print) |
| footerText? | `string` | - | Footer text content (appears only in print) |
| showPageBreaks? | `boolean` | true | Whether to show page break indicators in screen view |
| className? | `string` | - | Additional CSS classes |

### rich-text-editor.ts.ts

#### RichTextEditorProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value? | `string` | - | Current HTML content (controlled) |
| defaultValue? | `string` | - | Default content (uncontrolled) |
| placeholder? | `string` | - | Placeholder text |
| mode? | `RichTextEditorMode` | - | Editing mode |
| toolbar? | `ToolbarItem[]` | - | Toolbar items configuration (buttons and separators) |
| height? | `number \| string` | - | Editor height |
| readOnly? | `boolean` | - | Read-only mode |
| disabled? | `boolean` | - | Disabled state |
| className? | `string` | - | Additional CSS class |

### virtual-list.ts.ts

#### VirtualListProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| itemCount? | `number` | - | Total number of items |
| itemHeight? | `number` | - | Fixed item height (px) — used when itemSize is 'fixed' |
| estimatedItemHeight? | `number` | - | Estimated item height for variable-height mode |
| getItemHeight? | `(index: number) => number` | - | Function returning the height for a given index (variable mode) |
| sizeStrategy? | `VirtualListSizeStrategy` | - | Custom size strategy — overrides itemSize / itemHeight / getItemHeight |
| height? | `number` | - | Visible container height (px) |
| overscan? | `number` | - | Overscan count: extra items to render above/below viewport |
| className? | `string` | - | Custom class name |

### virtual-table.ts.ts

#### VirtualTableProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| data | `T[]` | - | Data rows |
| columns | `TableColumn<T>[]` | - | Column definitions — reuses Table's TableColumn type |
| rowHeight? | `number` | - | Fixed row height in px (required for accurate virtualization) |
| height? | `number` | - | Viewport height in px |
| width? | `number \| 'auto'` | - | Viewport width in px or auto |
| overscan? | `number` | - | Number of extra rows rendered above/below viewport |
| stickyHeader? | `boolean` | - | Enable fixed (sticky) header |
| virtualizeColumns? | `boolean` | - | Enable horizontal column virtualization |
| rowKey? | `keyof T \| ((row: T, index: number) => string \| number)` | - | Unique row key field |
| rowClassName? | `string \| ((row: T, index: number) => string)` | - | Row class name |
| loading? | `boolean` | - | Loading state |
| emptyText? | `string` | - | Empty state text |
| selectable? | `boolean` | - | Enable row selection |
| selectedKeys? | `(string \| number)[]` | - | Selected row keys (controlled) |
| striped? | `boolean` | - | Striped rows |
| bordered? | `boolean` | - | Bordered variant |
| className? | `string` | - | Additional CSS class |

## Composite

### composite.ts.ts

#### ChatWindowProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| messages? | `ChatMessage[]` | - | Message list |
| value? | `string` | - | Input value (controlled) |
| defaultValue? | `string` | - | Default input value (uncontrolled) |
| placeholder? | `string` | - | Input placeholder |
| disabled? | `boolean` | false | Whether the input is disabled |
| maxLength? | `number` | - | Maximum length of input |
| emptyText? | `string` | - | Empty state text |
| sendText? | `string` | - | Send button text |
| messageListAriaLabel? | `string` | - | Aria label for message list container |
| inputAriaLabel? | `string` | - | Aria label for input |
| sendAriaLabel? | `string` | - | Aria label for send button |
| statusText? | `string` | - | Status bar text (e.g. typing, delivered) |
| statusVariant? | `BadgeVariant` | 'info' | Status bar variant |
| showAvatar? | `boolean` | true | Show avatar in message item |
| showName? | `boolean` | true | Show user name in message item |
| showTime? | `boolean` | false | Show time in message item |
| inputType? | `'input' \| 'textarea'` | 'textarea' | Input type |
| inputRows? | `number` | 3 | Textarea rows |
| sendOnEnter? | `boolean` | true | Send on Enter |
| allowShiftEnter? | `boolean` | true | Allow Shift+Enter to create new line |
| allowEmpty? | `boolean` | false | Allow sending empty content |
| clearOnSend? | `boolean` | true | Clear input after send |
| virtual? | `boolean` | false | Enable virtualized rendering for the message list. Recommended when the conversation has more than ~100 messages. When enabled, message item heights are fixed (`virtualItemHeight`) and the list scroll height is fixed (`virtualHeight`). |
| virtualItemHeight? | `number` | 88 | Pixel height of each virtualized message row. |
| virtualHeight? | `number` | 400 | Pixel height of the virtualized message list viewport. |
| autoScrollToBottom? | `boolean` | true | Automatically scroll to the latest message when the list updates. Uses `requestAnimationFrame` so it runs after the DOM has been painted. |
| onChange? | `(value: string) => void` | - | Input change callback |
| onSend? | `(value: string) => void` | - | Send callback |

#### ActivityFeedProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| items? | `ActivityItem[]` | - | Activity items (flat list) |
| groups? | `ActivityGroup[]` | - | Activity groups |
| groupBy? | `(item: ActivityItem) => string` | - | Group by function (used when `groups` not provided) |
| groupOrder? | `string[]` | - | Optional group order |
| loading? | `boolean` | false | Whether to show loading state |
| loadingText? | `string` | - | Loading text |
| emptyText? | `string` | - | Empty state text |
| showAvatar? | `boolean` | true | Show avatar |
| showTime? | `boolean` | true | Show time label |
| showGroupTitle? | `boolean` | true | Show group title |
| renderItem? | `(item: ActivityItem, index: number, group?: ActivityGroup) => unknown` | - | Custom render for activity item |
| renderGroupHeader? | `(group: ActivityGroup) => unknown` | - | Custom render for group header |

#### CommentThreadProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| nodes? | `CommentNode[]` | - | Comment nodes (tree) |
| items? | `CommentNode[]` | - | Comment items (flat list) |
| maxDepth? | `number` | 3 | Maximum nesting depth |
| maxReplies? | `number` | 3 | Maximum replies to show per node |
| defaultExpandedKeys? | `Array<string \| number>` | - | Default expanded reply keys |
| expandedKeys? | `Array<string \| number>` | - | Expanded reply keys (controlled) |
| emptyText? | `string` | - | Empty state text |
| replyPlaceholder? | `string` | - | Reply input placeholder |
| replyButtonText? | `string` | - | Reply submit button text |
| cancelReplyText? | `string` | - | Reply cancel button text |
| likeText? | `string` | - | Like button text |
| likedText? | `string` | - | Liked button text |
| replyText? | `string` | - | Reply action text |
| moreText? | `string` | - | More action text |
| loadMoreText? | `string` | - | Load more text |
| showAvatar? | `boolean` | true | Show avatar |
| showDivider? | `boolean` | true | Show divider |
| showLike? | `boolean` | true | Show like action |
| showReply? | `boolean` | true | Show reply action |
| showMore? | `boolean` | true | Show more action |
| onLike? | `(node: CommentNode, liked: boolean) => void` | - | Like callback |
| onReply? | `(node: CommentNode, value: string) => void` | - | Reply submit callback |
| onMore? | `(node: CommentNode) => void` | - | More action callback |
| onAction? | `(node: CommentNode, action: CommentAction) => void` | - | Custom action callback |
| onExpandedChange? | `(keys: Array<string \| number>) => void` | - | Expanded keys change callback |
| onLoadMore? | `(node: CommentNode) => void` | - | Load more callback |

#### NotificationCenterProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| items? | `NotificationItem[]` | - | Notification items (flat list) |
| groups? | `NotificationGroup[]` | - | Notification groups |
| groupBy? | `(item: NotificationItem) => string` | - | Group by function (used when `groups` not provided) |
| groupOrder? | `string[]` | - | Optional group order |
| activeGroupKey? | `string \| number` | - | Active group key (controlled) |
| defaultActiveGroupKey? | `string \| number` | - | Default active group key (uncontrolled) |
| readFilter? | `NotificationReadFilter` | 'all' | Read filter (controlled) |
| defaultReadFilter? | `NotificationReadFilter` | 'all' | Default read filter (uncontrolled) |
| loading? | `boolean` | false | Loading state |
| loadingText? | `string` | - | Loading text |
| emptyText? | `string` | - | Empty state text |
| title? | `string` | - | Title text |
| allLabel? | `string` | - | Label for "all" filter |
| unreadLabel? | `string` | - | Label for "unread" filter |
| readLabel? | `string` | - | Label for "read" filter |
| markAllReadText? | `string` | - | Mark all as read button text |
| markReadText? | `string` | - | Mark as read button text |
| markUnreadText? | `string` | - | Mark as unread button text |
| onGroupChange? | `(key: string \| number) => void` | - | Group change callback |
| onReadFilterChange? | `(filter: NotificationReadFilter) => void` | - | Read filter change callback |
| onMarkAllRead? | `(groupKey: string \| number \| undefined, items: NotificationItem[]) => void` | - | Mark all read callback |
| onItemClick? | `(item: NotificationItem, index: number) => void` | - | Item click callback |
| onItemReadChange? | `(item: NotificationItem, read: boolean) => void` | - | Item read change callback |
| manageReadState? | `boolean` | false | Whether to manage read state internally. When true, the component tracks read/unread state itself, so you don't need to wire up onItemReadChange / onMarkAllRead handlers. Callbacks are still fired for external side-effects (e.g. API calls). |

#### TableToolbarProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| searchValue? | `string` | - | Search value (controlled) |
| defaultSearchValue? | `string` | - | Default search value (uncontrolled) |
| searchPlaceholder? | `string` | - | Search input placeholder |
| searchButtonText? | `string` | '搜索' | Search button text |
| showSearchButton? | `boolean` | true | Whether to show search button |
| onSearchChange? | `(value: string) => void` | - | Search value change callback |
| onSearch? | `(value: string) => void` | - | Search submit callback |
| filters? | `TableToolbarFilter[]` | - | Filter definitions |
| onFiltersChange? | `(filters: Record<string, TableToolbarFilterValue>) => void` | - | Filters change callback |
| bulkActions? | `TableToolbarAction[]` | - | Bulk actions |
| selectedKeys? | `(string \| number)[]` | - | Selected row keys |
| selectedCount? | `number` | - | Selected row count |
| bulkActionsLabel? | `string` | '已选择' | Bulk actions label prefix |
| onBulkAction? | `(action: TableToolbarAction, selectedKeys: (string \| number)[]) => void` | - | Bulk action click callback |

#### DataTableWithToolbarProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| toolbar? | `TableToolbarProps` | - | Toolbar configuration |
| pagination? | `PaginationConfig \| false` | - | Pagination configuration Set to false to disable |
| onPageChange? | `(current: number, pageSize: number) => void` | - | Page change callback |
| onPageSizeChange? | `(current: number, pageSize: number) => void` | - | Page size change callback |

#### FormWizardProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| steps | `WizardStep[]` | - | Steps configuration |
| current? | `number` | - | Current step index (0-based) |
| defaultCurrent? | `number` | 0 | Default step index (uncontrolled) |
| clickable? | `boolean` | false | Whether steps are clickable |
| direction? | `StepsDirection` | 'horizontal' | Steps direction |
| size? | `StepSize` | 'default' | Steps size |
| simple? | `boolean` | false | Whether to use simple steps style |
| showSteps? | `boolean` | true | Whether to show steps header |
| showActions? | `boolean` | true | Whether to show action buttons |
| prevText? | `string` | - | Previous button text |
| nextText? | `string` | - | Next button text |
| finishText? | `string` | - | Finish button text |
| locale? | `Partial<TigerLocale>` | - | Locale overrides for FormWizard UI text |
| beforeNext? | `FormWizardValidator` | - | Validation hook before moving to next step |
| onChange? | `(current: number, prev: number) => void` | - | Step change callback |
| onFinish? | `(current: number, steps: WizardStep[]) => void` | - | Finish callback |
| autoSave? | `(current: number, step: WizardStep) => void \| Promise<void>` | - | Auto-save callback invoked on each step change |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, unknown>` | - | Custom styles |

#### TaskBoardProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| columns? | `TaskBoardColumn[]` | - | Controlled column data (with nested cards). When provided the component is fully controlled — the consumer must update this value in response to move events. |
| defaultColumns? | `TaskBoardColumn[]` | - | Initial column data for uncontrolled usage. |
| draggable? | `boolean` | true | Enable card drag-and-drop. |
| columnDraggable? | `boolean` | true | Enable column (stage) drag-and-drop reordering. |
| enforceWipLimit? | `boolean` | false | Enforce WIP limit — when `true`, cards cannot be dropped into a column that has already reached its `wipLimit`. |
| beforeCardMove? | `TaskBoardMoveValidator<TaskBoardCardMoveEvent>` | - | Async / sync validation before a card move is committed. Return `false` to cancel the move (the card snaps back). |
| beforeColumnMove? | `TaskBoardMoveValidator<TaskBoardColumnMoveEvent>` | - | Async / sync validation before a column reorder is committed. Return `false` to cancel the reorder. |
| onCardMove? | `(event: TaskBoardCardMoveEvent) => void` | - | Callback fired after a card is moved. |
| onColumnMove? | `(event: TaskBoardColumnMoveEvent) => void` | - | Callback fired after a column is reordered. |
| onColumnsChange? | `(columns: TaskBoardColumn[]) => void` | - | Callback fired whenever the columns data changes (card move, column reorder, etc.). In controlled mode the consumer should use this to update the `columns` prop. |
| onCardAdd? | `(columnId: string \| number) => void` | - | Callback fired when the "add card" button of a column is clicked. If not provided the add-card button is hidden. |
| renderCard? | `(card: TaskBoardCard, columnId: string \| number) => unknown` | - | Custom card renderer (framework-agnostic signature — each framework layer narrows the return type to its own node type). |
| renderColumnHeader? | `(column: TaskBoardColumn) => unknown` | - | Custom column header renderer. |
| renderColumnFooter? | `(column: TaskBoardColumn) => unknown` | - | Custom column footer renderer (e.g. an "add card" form). |
| renderEmptyColumn? | `(column: TaskBoardColumn) => unknown` | - | Custom empty-column placeholder renderer. |
| filterText? | `string` | - | Quick filter / search term applied to card titles. When non-empty, only cards whose title or description contain the term are shown; hidden-column filtering is also applied. |
| hiddenColumns? | `(string \| number)[]` | - | Column IDs to hide from the board (e.g. for saved views). |
| showCardCount? | `boolean` | false | Show column card-count badges in the header. |
| allowAddCard? | `boolean` | false | Show an inline "add card" button in each column footer. |
| allowAddColumn? | `boolean` | false | Show an inline "add column" button after all columns. |
| onColumnAdd? | `() => void` | - | Callback fired when the "add column" button is clicked. If not provided (and `allowAddColumn` is true), the button is still rendered. |
| locale? | `Partial<import('./locale').TigerLocale>` | - | Locale overrides for TaskBoard UI text |
| className? | `string` | - | Additional CSS classes |
| style? | `Record<string, unknown>` | - | Custom styles |

## Core

### base.ts.ts

#### BaseInteractiveProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| disabled? | `boolean` | - | Whether the component is disabled |
| size? | `ComponentSize` | - | Component size |
| loading? | `boolean` | - | Whether the component shows a loading indicator |

#### BaseFormControlProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value? | `T` | - | Controlled value |
| defaultValue? | `T` | - | Default (uncontrolled) value |
| name? | `string` | - | Form field name attribute |
| required? | `boolean` | - | Whether the field is required |
| disabled? | `boolean` | - | Whether the field is disabled |
| size? | `ComponentSize` | - | Component size |
| placeholder? | `string` | - | Placeholder text |

#### BaseLayoutProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| direction? | `'horizontal' \| 'vertical'` | - | Layout direction |
| align? | `'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch'` | - | Cross-axis alignment |
| justify? | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | - | Main-axis justification |
| wrap? | `boolean` | - | Whether children should wrap |

### floating-popup.ts.ts

#### BaseFloatingPopupProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| open? | `boolean` | - | Whether the popup is open (controlled mode) |
| defaultOpen? | `boolean` | - | Default open state (uncontrolled mode) @default false |
| placement? | `FloatingPlacement` | - | Placement relative to trigger @default 'top' |
| disabled? | `boolean` | - | Whether the popup is disabled @default false |
| offset? | `number` | - | Offset distance from trigger in pixels @default 8 |
| className? | `string` | - | Additional CSS classes |

### generics.ts.ts

#### GenericTableProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| columns | `GenericTableColumn<T>[]` | - | Column definitions |
| columnLockable? | `boolean` | - | Whether column headers show a lock toggle @default false |
| dataSource? | `T[]` | - | Table data @default [] |
| sort? | `SortState` | - | Controlled sort state |
| defaultSort? | `SortState` | - | Default sort state (uncontrolled) |
| filters? | `Record<string, unknown>` | - | Controlled filters |
| defaultFilters? | `Record<string, unknown>` | - | Default filters (uncontrolled) |
| size? | `TableSize` | - | Table size @default 'md' |
| bordered? | `boolean` | - | Show border @default false |
| striped? | `boolean` | - | Show striped rows @default false |
| hoverable? | `boolean` | - | Highlight on hover @default true |
| loading? | `boolean` | - | Loading state @default false |
| emptyText? | `string` | - | Empty text @default 'No data' |
| pagination? | `PaginationConfig \| false` | - | Pagination config (false to disable) |
| rowSelection? | `GenericRowSelection<T>` | - | Row selection config |
| expandable? | `GenericExpandable<T>` | - | Row expansion config |
| rowKey? | `string \| ((record: T) => string \| number)` | - | Row key accessor @default (record) => record.id |
| rowClassName? | `string \| ((record: T, index: number) => string)` | - | Row class name |
| stickyHeader? | `boolean` | - | Sticky header @default false |
| maxHeight? | `string \| number` | - | Max height for scrollable table |
| tableLayout? | `'auto' \| 'fixed'` | - | Table layout @default 'auto' |

#### GenericSelectProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| size? | `'sm' \| 'md' \| 'lg'` | - | Select size @default 'md' |
| disabled? | `boolean` | - | Whether disabled @default false |
| placeholder? | `string` | - | Placeholder text |
| searchable? | `boolean` | - | Allow search @default false |
| multiple? | `boolean` | - | Allow multiple selection @default false |
| clearable? | `boolean` | - | Allow clearing @default true |
| options? | `Array<GenericSelectOption<T> \| GenericSelectOptionGroup<T>>` | - | Typed options list |
| noOptionsText? | `string` | - | Text when no search match @default 'No options found' |
| noDataText? | `string` | - | Text when list is empty @default 'No options available' |

#### GenericFormFieldProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| name? | `string` | - | Field name (key in form model) |
| label? | `string` | - | Label text |
| labelWidth? | `string \| number` | - | Label width |
| required? | `boolean` | - | Whether required |
| rules? | `GenericFormRule<T> \| GenericFormRule<T>[]` | - | Validation rules |
| error? | `string` | - | Controlled error message |
| showMessage? | `boolean` | - | Show validation message @default true |
| size? | `'sm' \| 'md' \| 'lg'` | - | Field size |

## Other

### timeline.ts.ts

#### TimelineProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| mode? | `TimelineMode` | 'left' | Timeline mode/direction |
| pending? | `boolean` | false | Whether to show the connector line in pending state |
| pendingDot? | `unknown` | - | Pending item dot content |
| reverse? | `boolean` | false | Whether to reverse the timeline order |
| className? | `string` | - | Additional CSS classes |

