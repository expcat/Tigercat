/**
 * Advanced table filtering utilities.
 *
 * `FilterRule.column` is a **column key**. Cell values are read through
 * `dataKey || key` when `columns` are passed.
 *
 * Empty `value` (and empty `valueTo` for `between`) skips the rule — it does
 * not match every row. Use `isEmpty` to target blank cells.
 */

import type { FilterRule, TableColumn } from '../types/table'
import { devWarn } from './dev-warn'
import { getTableColumnDataKey } from './table-utils'

function isEmptyRuleValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function isEmptyCell(cellValue: unknown): boolean {
  return cellValue === undefined || cellValue === null || cellValue === ''
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value)
    if (Number.isFinite(numeric)) return numeric
  }
  return null
}

function cellsEqual(cellValue: unknown, ruleValue: unknown): boolean {
  if (cellValue === ruleValue) return true
  return String(cellValue).toLowerCase() === String(ruleValue).toLowerCase()
}

function compareNumbers(
  cellValue: unknown,
  ruleValue: unknown,
  operator: 'gt' | 'lt' | 'gte' | 'lte'
): boolean {
  const cell = toFiniteNumber(cellValue)
  const bound = toFiniteNumber(ruleValue)
  if (cell === null || bound === null) {
    devWarn(
      `Table.filter.${operator}.nan`,
      `Table advanced filter ${operator} needs numeric cell and rule values`
    )
    return false
  }
  if (operator === 'gt') return cell > bound
  if (operator === 'lt') return cell < bound
  if (operator === 'gte') return cell >= bound
  return cell <= bound
}

/**
 * Apply a single filter rule to a cell value.
 *
 * Empty rule values are ignored (the rule does not filter), except `isEmpty`.
 */
function applyRule(cellValue: unknown, rule: FilterRule): boolean {
  const { operator, value, valueTo } = rule

  if (operator === 'isEmpty') {
    return isEmptyCell(cellValue)
  }

  if (isEmptyRuleValue(value)) {
    return true
  }

  switch (operator) {
    case 'equals':
      return cellsEqual(cellValue, value)

    case 'notEquals':
      return !cellsEqual(cellValue, value)

    case 'contains':
      return String(cellValue).toLowerCase().includes(String(value).toLowerCase())

    case 'gt':
    case 'lt':
    case 'gte':
    case 'lte':
      return compareNumbers(cellValue, value, operator)

    case 'between': {
      if (isEmptyRuleValue(valueTo)) return true
      const cell = toFiniteNumber(cellValue)
      const from = toFiniteNumber(value)
      const to = toFiniteNumber(valueTo)
      if (cell === null || from === null || to === null) {
        devWarn(
          'Table.filter.between.nan',
          'Table advanced filter between needs numeric cell and rule values'
        )
        return false
      }
      return cell >= from && cell <= to
    }

    default:
      return true
  }
}

function resolveRuleCellValue<T>(record: T, rule: FilterRule, columns?: TableColumn<T>[]): unknown {
  const column = columns?.find((item) => item.key === rule.column)
  const field = column ? getTableColumnDataKey(column) : rule.column
  return (record as Record<string, unknown>)[field]
}

/**
 * Filter data using advanced filter rules with AND/OR logic.
 * Rules are evaluated left-to-right with standard boolean precedence:
 * AND binds tighter than OR. Groups of AND-connected rules form clauses
 * that are OR-ed together. The first rule's `logic` is ignored.
 *
 * Pass `columns` so `rule.column` resolves through `dataKey`.
 */
export function filterDataAdvanced<T>(
  data: T[],
  rules: FilterRule[],
  columns?: TableColumn<T>[]
): T[] {
  if (!rules || rules.length === 0) return data

  return data.filter((record) => {
    let clauseResult = true
    let finalResult = false
    let firstRule = true

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      const cellValue = resolveRuleCellValue(record, rule, columns)
      const matches = applyRule(cellValue, rule)

      if (firstRule) {
        clauseResult = matches
        firstRule = false
      } else if (rule.logic === 'or') {
        finalResult = finalResult || clauseResult
        clauseResult = matches
      } else {
        clauseResult = clauseResult && matches
      }
    }

    finalResult = finalResult || clauseResult
    return finalResult
  })
}
