import { compileScript, compileStyle, compileTemplate, parse } from '@vue/compiler-sfc'

function hashText(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

// Compile a single-file component to a JS module + collected CSS. The script
// still carries TypeScript types at this point; the worker runs the returned
// `code` through sucrase to erase them before it reaches the sandbox.
export function compileVueFile(filename: string, source: string): { code: string; css: string } {
  const parsed = parse(source, { filename })
  if (parsed.errors.length > 0) throw parsed.errors[0]

  const descriptor = parsed.descriptor
  const id = hashText(`${filename}:${source}`)
  let code: string

  if (descriptor.script || descriptor.scriptSetup) {
    const script = compileScript(descriptor, {
      id,
      inlineTemplate: true,
      genDefaultAs: '__sfc__'
    })
    code = `${script.content}\nexport default __sfc__`
  } else if (descriptor.template) {
    const template = compileTemplate({
      id,
      filename,
      source: descriptor.template.content,
      scoped: descriptor.styles.some((style) => style.scoped)
    })
    if (template.errors.length > 0) throw template.errors[0]
    code = `${template.code.replace('export function render', 'function render')}\nexport default { render }`
  } else {
    code = 'export default {}'
  }

  if (descriptor.styles.some((style) => style.scoped)) {
    code += `\n__sfc__.__scopeId = "data-v-${id}"`
  }

  const css = descriptor.styles
    .map((style, index) => {
      if (style.lang && style.lang !== 'css') {
        throw new Error(`浏览器示例仅支持原生 CSS，不支持 <style lang="${style.lang}">`)
      }
      const result = compileStyle({
        id: `data-v-${id}`,
        filename: `${filename}?style=${index}`,
        source: style.content,
        scoped: style.scoped
      })
      if (result.errors.length > 0) throw result.errors[0]
      return result.code
    })
    .join('\n')

  return { code, css }
}
