/**
 * @vitest-environment happy-dom
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Row, Col } from '@tigercat/react';
import { expectNoA11yViolations } from '../utils/react';

describe('Grid (React)', () => {
  it('renders Row defaults and forwards div props', () => {
    render(<Row data-testid="row" />);

    const row = screen.getByTestId('row');
    expect(row).toHaveClass(
      'flex',
      'flex-wrap',
      'items-start',
      'justify-start'
    );
  });

  it('applies align/justify classes', () => {
    render(<Row data-testid="row" align="middle" justify="center" />);

    const row = screen.getByTestId('row');
    expect(row).toHaveClass('items-center', 'justify-center');
  });

  it('applies gutter styles to Row and Col', () => {
    render(
      <Row data-testid="row" gutter={16}>
        <Col data-testid="col">Content</Col>
      </Row>
    );

    const row = screen.getByTestId('row');
    const col = screen.getByTestId('col');

    expect(row).toHaveStyle({ marginLeft: '-8px', marginRight: '-8px' });
    expect(col).toHaveStyle({ paddingLeft: '8px', paddingRight: '8px' });
  });

  it('applies span/offset classes', () => {
    render(<Col data-testid="col" span={12} offset={4} />);

    const col = screen.getByTestId('col');
    expect(col.className).toContain('w-[50%]');
    expect(col.className).toContain('ml-[16.666667%]');
  });

  it('has no a11y violations for a basic grid', async () => {
    const { container } = render(
      <Row>
        <Col>Content</Col>
      </Row>
    );

    await expectNoA11yViolations(container);
  });
});
