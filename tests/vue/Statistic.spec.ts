/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Statistic } from '@expcat/tigercat-vue'
import { renderWithProps } from '../utils'

describe('Statistic', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    renderWithProps(Statistic, { title: 'Users', value: 1000 })
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
  })

  it('renders string value', () => {
    renderWithProps(Statistic, { title: 'Status', value: 'Active' })
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = renderWithProps(Statistic, { title: 'T', value: 1, className: 'my-stat' })
    expect(container.querySelector('.my-stat')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    renderWithProps(Statistic, { title: 'T', value: 1, size })
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  // --- Precision ---
  it('formats value with precision', () => {
    renderWithProps(Statistic, { title: 'T', value: 123.4, precision: 2 })
    expect(screen.getByText('123.40')).toBeInTheDocument()
  })

  // --- Group separator ---
  it('formats value with group separator enabled', () => {
    renderWithProps(Statistic, { title: 'T', value: 1234567, groupSeparator: true })
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('formats value without separator when disabled', () => {
    renderWithProps(Statistic, { title: 'T', value: 1234567, groupSeparator: false })
    expect(screen.getByText('1234567')).toBeInTheDocument()
  })

  // --- Prefix / Suffix ---
  it('renders prefix', () => {
    renderWithProps(Statistic, { title: 'T', value: 100, prefix: '$' })
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('renders suffix', () => {
    renderWithProps(Statistic, { title: 'T', value: 100, suffix: '%' })
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('renders both prefix and suffix', () => {
    renderWithProps(Statistic, { title: 'Price', value: 99, prefix: '$', suffix: 'USD' })
    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
  })
})
