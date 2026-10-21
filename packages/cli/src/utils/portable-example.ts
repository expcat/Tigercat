/**
 * Decide whether an example can run inside a consumer project: every import in
 * it has to resolve to a published package. Repo-only aliases (@demo-shared/*),
 * relative paths and path-alias imports make a sample unusable outside this
 * repository. Shared by the add command at runtime and by tsup.config.ts when
 * it selects which examples are copied into dist.
 */
const EXAMPLE_IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g
const BARE_SPECIFIER_RE = /^(?:@[\w.-]+\/)?[a-zA-Z0-9][\w.-]*(?:\/[\w./-]*)?$/

export function isPortableExample(source: string): boolean {
  for (const match of source.matchAll(EXAMPLE_IMPORT_RE)) {
    const specifier = match[1]
    if (specifier.startsWith('@demo-shared/')) return false
    if (!BARE_SPECIFIER_RE.test(specifier)) return false
  }
  return true
}
