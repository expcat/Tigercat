import { bench, describe } from 'vitest'
import {
  validateForm,
  validateFormFields,
  type FormRules,
  type FormValues
} from '@expcat/tigercat-core'

function makeFormFixture(fieldCount: number): { values: FormValues; rules: FormRules } {
  const values: FormValues = {}
  const rules: FormRules = {}

  for (let index = 0; index < fieldCount; index++) {
    const fieldName = `field_${index}`
    values[fieldName] = index % 5 === 0 ? '' : `value-${index}`
    rules[fieldName] = [
      { required: true, message: `${fieldName} is required` },
      { min: 3, max: 40 },
      ...(index % 3 === 0 ? [{ pattern: /^value-|^$/ }] : [])
    ]
  }

  return { values, rules }
}

describe('Form validation scale', () => {
  for (const fieldCount of [10, 30, 50] as const) {
    const fixture = makeFormFixture(fieldCount)
    const changedFields = [`field_${fieldCount - 1}`]

    bench(`${fieldCount} fields: validate full form`, async () => {
      await validateForm(fixture.values, fixture.rules)
    })

    bench(`${fieldCount} fields: validate changed field only`, async () => {
      await validateFormFields(fixture.values, fixture.rules, changedFields, 'change')
    })
  }
})
