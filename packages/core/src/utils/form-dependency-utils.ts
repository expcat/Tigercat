/**
 * Form field dependency utilities
 * Manages field-to-field dependency graph for conditional validation and visibility
 */

/**
 * Get fields that depend on a given field
 * When `fieldName` changes, all returned fields should be re-evaluated
 */
export function getDependentFields(
  fieldName: string,
  dependencies: Map<string, string[]> | undefined
): string[] {
  if (!dependencies) return []
  const result: string[] = []

  for (const [dependent, deps] of dependencies.entries()) {
    if (deps.includes(fieldName)) {
      result.push(dependent)
    }
  }

  return result
}

/**
 * Get all fields that a given field depends on
 */
export function getFieldDependencies(
  fieldName: string,
  dependencies: Map<string, string[]> | undefined
): string[] {
  if (!dependencies) return []
  return dependencies.get(fieldName) ?? []
}

/**
 * Build a topological order for validating dependent fields
 * Ensures fields are validated after their dependencies
 */
export function getValidationOrder(
  fieldNames: string[],
  dependencies: Map<string, string[]> | undefined
): string[] {
  if (!dependencies) return [...fieldNames]
  const depMap = dependencies
  const visited = new Set<string>()
  const result: string[] = []

  function visit(field: string) {
    if (visited.has(field)) return
    visited.add(field)

    const deps = depMap.get(field) ?? []
    for (const dep of deps) {
      if (fieldNames.includes(dep)) {
        visit(dep)
      }
    }

    result.push(field)
  }

  for (const field of fieldNames) {
    visit(field)
  }

  return result
}
