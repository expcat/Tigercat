/**
 * @vitest-environment happy-dom
 */

import React, { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Inplace } from '../../packages/react/src/components/Inplace'

function ControlledTitle() {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('行内标题')
  return (
    <Inplace
      editing={editing}
      onEditingChange={setEditing}
      display={value}
      input={
        <input
          aria-label="编辑标题"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      }
    />
  )
}

describe('Inplace', () => {
  it('enters edit on click, commits with Enter, and cancels with Escape', () => {
    render(<Inplace display="Hello" input={<input data-testid="field" defaultValue="Hello" />} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hello' }))
    expect(screen.getByTestId('field')).toBeTruthy()
    fireEvent.keyDown(screen.getByTestId('field'), { key: 'Enter' })
    expect(screen.queryByTestId('field')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Hello' }))
    fireEvent.keyDown(screen.getByTestId('field'), { key: 'Escape' })
    expect(screen.queryByTestId('field')).toBeNull()
    expect(screen.getByRole('button', { name: 'Hello' })).toBeTruthy()
  })

  it('keeps id, className, style, title, data and aria attributes on the root', () => {
    const html = renderToStaticMarkup(
      <Inplace
        id="inline-title"
        className="review-class"
        style={{ color: 'red' }}
        title="标题"
        data-review="1"
        aria-describedby="hint"
        display="Hello"
      />
    )
    const host = document.createElement('div')
    host.innerHTML = html
    const root = host.querySelector('[data-tiger-inplace]')
    expect(root?.id).toBe('inline-title')
    expect(root?.className).toBe('review-class')
    expect(root?.getAttribute('style')?.replace(/\s/g, '')).toContain('color:red')
    expect(root?.getAttribute('title')).toBe('标题')
    expect(root?.getAttribute('data-review')).toBe('1')
    expect(root?.getAttribute('aria-describedby')).toBe('hint')
  })

  it('ignores composing keys and an enter the child already cancelled', () => {
    let cancelEnter = false
    function Field() {
      return (
        <input
          data-testid="field"
          onKeyDown={(event) => {
            if (cancelEnter && event.key === 'Enter') event.preventDefault()
          }}
        />
      )
    }
    render(<Inplace display="Hello" input={<Field />} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hello' }))
    fireEvent.keyDown(screen.getByTestId('field'), { key: 'Enter', isComposing: true })
    expect(screen.getByTestId('field')).toBeTruthy()
    fireEvent.keyDown(screen.getByTestId('field'), { key: 'Escape', isComposing: true })
    expect(screen.getByTestId('field')).toBeTruthy()
    cancelEnter = true
    fireEvent.keyDown(screen.getByTestId('field'), { key: 'Enter' })
    expect(screen.getByTestId('field')).toBeTruthy()
  })

  it('focuses the editor after activation and restores the trigger', () => {
    render(<ControlledTitle />)
    fireEvent.click(screen.getByRole('button', { name: '行内标题' }))
    const field = screen.getByRole('textbox', { name: '编辑标题' })
    expect(document.activeElement).toBe(field)
    fireEvent.keyDown(field, { key: 'Enter' })
    const committed = screen.getByRole('button', { name: '行内标题' })
    expect(document.activeElement).toBe(committed)
    fireEvent.click(committed)
    const again = screen.getByRole('textbox', { name: '编辑标题' })
    expect(document.activeElement).toBe(again)
    fireEvent.keyDown(again, { key: 'Escape' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '行内标题' }))
  })
})
