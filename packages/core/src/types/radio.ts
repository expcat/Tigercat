/**
 * Radio component types and interfaces
 */

/**
 * Radio size types
 */
export type RadioSize = 'sm' | 'md' | 'lg';

/**
 * Base radio props interface
 */
export interface RadioProps {
  /**
   * The value of the radio
   */
  value: string | number;

  /**
   * Radio size
   * @default 'md'
   */
  size?: RadioSize;

  /**
   * Whether the radio is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Name attribute for the radio input (for grouping)
   */
  name?: string;

  /**
   * Whether the radio is checked (controlled mode)
   */
  checked?: boolean;

  /**
   * Default checked state (uncontrolled mode)
   * @default false
   */
  defaultChecked?: boolean;
}

/**
 * Radio group props interface
 */
export interface RadioGroupProps {
  /**
   * Current selected value (controlled mode)
   */
  value?: string | number;

  /**
   * Default selected value (uncontrolled mode)
   */
  defaultValue?: string | number;

  /**
   * Name attribute for radio inputs in the group
   */
  name?: string;

  /**
   * Whether all radios in the group are disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Radio size for all radios in the group
   * @default 'md'
   */
  size?: RadioSize;
}
