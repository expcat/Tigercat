export interface CopyButtonProps {
  /** Text passed to the shared clipboard helper. */
  text: string
  /** Accessible name when no children are provided. @default Copy */
  label?: string
  /** When true the button does not write to the clipboard. @default false */
  disabled?: boolean
}
