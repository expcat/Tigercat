import { Select, type SelectSingleProps } from '../../packages/react/src/components/Select'

const onChange: NonNullable<SelectSingleProps['onChange']> = (_value) => {
  const clearedValue: typeof _value = null
  const uncontrolledValue: typeof _value = undefined
  void clearedValue
  void uncontrolledValue
}

export const controlledEmptySingle = <Select value={null} onChange={onChange} />
export const defaultEmptySingle = <Select defaultValue={null} onChange={onChange} />
