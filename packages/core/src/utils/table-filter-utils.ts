/**
 * Advanced table filtering utilities
 */

import type { FilterRule } from '../types/table'

/**
 * Apply a single filter rule to a cell value
 */
function applyRule(cellValue: unknown, rule: FilterRule): boolean {
  const { operator, value, valueTo } = rule

  if (value === undefined || value === null || value === '') {
    return true
  }

  const cell = cellValue
  const val = value

  switch (operator) {
    case 'equals':
      return String(cell).toLowerCase() === String(val).toLowerCase()

    case 'notEquals':
      return String(cell).toLowerCase() !== String(val).toLowerCase()

    case 'contains':
      return String(cell).toLowerCase().includes(String(val).toLowerCase())

    case 'gt':
      return Number(cell) > Number(val)

    case 'lt':
      return Number(cell) < Number(val)

    case 'between': {
      const num = Number(cell)
      return num >= Number(val) && num <= Number(valueTo ?? val)
    }

    default:
      return true
  }
}

/**
 * Filter data using advanced filter rules with AND/OR logic.
 * Rules are evaluated left-to-right with standard boolean precedence:
 * AND binds tighter than OR. Groups of AND-connected rules form clauses
 * that are OR-ed together.
 */
export function filterDataAdvanced<T>(data: T[], rules: FilterRule[]): T[] {
  if (!rules || rules.length === 0) return data

  return data.filter((record) => {
    // Split rules into OR-separated groups (clauses)
    // Each clause is a set of AND-connected rules
    let clauseResult = true // current AND-clause accumulator
    let finalResult = false // OR accumulator across clauses
    let firstRule = true

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      const cellValue = (record as Record<string, unknown>)[rule.column]
      const matches = applyRule(cellValue, rule)

      if (firstRule) {
        clauseResult = matches
        firstRule = false
      } else if (rule.logic === 'or') {
        // Finish current clause and start a new one
        finalResult = finalResult || clauseResult
        clauseResult = matches
      } else {
        // AND: continue current clause
        clauseResult = clauseResult && matches
      }
    }

    // Include last clause
    finalResult = finalResult || clauseResult
    return finalResult
  })
}
