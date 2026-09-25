export interface DemoSection {
  id: string
  label: string
}

export function slugifyDemoHeading(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function headingIdTakenByOther(id: string, owner: HTMLElement): boolean {
  const found = document.getElementById(id)
  return Boolean(found && found !== owner)
}

/**
 * Assign stable heading ids for the in-page section nav.
 * An id already on the heading is kept; `getElementById` must not treat the
 * heading as a collision with itself (that appended `-2` on every recollect).
 */
export function collectDemoSections(root: ParentNode): DemoSection[] {
  const headings = Array.from(root.querySelectorAll('h2')).filter(
    (el): el is HTMLHeadingElement =>
      el instanceof HTMLHeadingElement && Boolean(el.textContent?.trim())
  )
  const usedIds = new Set<string>()
  const sections: DemoSection[] = []

  for (const heading of headings) {
    const label = (heading.textContent ?? '').trim()
    const base = heading.id.trim() || slugifyDemoHeading(label)
    if (!base) continue

    let uniqueId = base
    let counter = 2
    while (usedIds.has(uniqueId) || headingIdTakenByOther(uniqueId, heading)) {
      uniqueId = `${base}-${counter}`
      counter += 1
    }

    usedIds.add(uniqueId)
    if (heading.id !== uniqueId) heading.id = uniqueId
    heading.setAttribute('data-demo-anchor', 'true')
    sections.push({ id: uniqueId, label })
  }

  return sections
}

export function sameDemoSections(current: DemoSection[], next: DemoSection[]): boolean {
  if (current.length !== next.length) return false
  return current.every(
    (section, index) => section.id === next[index]?.id && section.label === next[index]?.label
  )
}
