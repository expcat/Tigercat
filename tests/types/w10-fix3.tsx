import { createRef } from 'react'
import type { VueCodeEditorProps } from '../../packages/vue/src/components/CodeEditor'
import type { VueRichTextEditorProps } from '../../packages/vue/src/components/RichTextEditor'
import { ColorPicker, type ColorPickerRef } from '../../packages/react/src/components/ColorPicker'

const editor: VueCodeEditorProps = {
  theme: 'auto',
  bind: {
    query: 'const',
    replacement: 'let',
    caret: 0,
    scrollTop: 0,
    viewportHeight: 120,
    lineHeight: 20,
    lineCount: 4,
    language: { id: 'js', keywords: ['const'] }
  }
}

const richText: VueRichTextEditorProps = {
  bind: true
}

export const colorPickerRef = <ColorPicker ref={createRef<ColorPickerRef>()} />

void editor
void richText
