import prompts from 'prompts'
import { TEMPLATES, type TemplateName } from '../constants'
import { logError } from './logger'

export type Framework = 'vue3' | 'react'

/**
 * Subset of the npm package name rules (see validate-npm-package-name):
 * optional `@scope/`, then a name of url-safe lowercase characters that may not
 * start with a dot or underscore. Enough to reject names that would make the
 * generated `package.json` fail `npm install`.
 */
const PACKAGE_NAME_REGEX = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/

/** Returns an error message when `name` is not a valid npm package name, otherwise `null`. */
export function validateProjectName(name: string): string | null {
  if (name.trim().length === 0) return 'Project name must not be empty'
  if (name.trim() !== name) return 'Project name must not have leading or trailing spaces'
  if (name.length > 214) return 'Project name must be 214 characters or fewer'
  if (/[A-Z]/.test(name)) return 'Project name must not contain uppercase letters'
  if (!PACKAGE_NAME_REGEX.test(name)) {
    return 'Project name is not a valid npm package name (use lowercase letters, digits, "-", "_" or ".")'
  }
  return null
}

/** Best-effort suggestion of a valid npm package name derived from arbitrary input. */
export function suggestProjectName(name: string): string {
  const sanitizeSegment = (segment: string) =>
    segment
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-._~]+/g, '-')
      .replace(/^[-._~]+|[-._~]+$/g, '')
      .replace(/-{2,}/g, '-')

  const scopeMatch = /^@(.+?)\/(.+)$/.exec(name.trim())
  const suggestion = scopeMatch
    ? `@${sanitizeSegment(scopeMatch[1])}/${sanitizeSegment(scopeMatch[2])}`
    : sanitizeSegment(name)

  return suggestion || 'tigercat-app'
}

export function isFramework(value: string): value is Framework {
  return value === 'vue3' || value === 'react'
}

/**
 * Resolves the template/framework option shared by `create` and `playground`:
 * - undefined → interactive select prompt
 * - a valid template → returned as-is
 * - an invalid value → fail fast listing the valid templates (no silent prompt fallback)
 */
export async function resolveTemplateOption(
  arg: string | undefined,
  promptMessage: string
): Promise<TemplateName> {
  if (arg !== undefined) {
    if (!TEMPLATES.includes(arg as TemplateName)) {
      logError(`Invalid template "${arg}". Valid templates: ${TEMPLATES.join(', ')}`)
      process.exit(1)
    }
    return arg as TemplateName
  }

  const response = await prompts({
    type: 'select',
    name: 'template',
    message: promptMessage,
    choices: [
      { title: 'Vue 3', value: 'vue3' },
      { title: 'React', value: 'react' }
    ]
  })

  if (!response.template) {
    logError('Operation cancelled')
    process.exit(1)
  }

  return response.template as TemplateName
}
