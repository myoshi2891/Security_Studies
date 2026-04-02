import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { HighlightBox } from './HighlightBox';

describe('HighlightBox', () => {
  test('renders children with blue variant', () => {
    render(<HighlightBox color="blue">Highlighted content</HighlightBox>);
    expect(screen.getByText('Highlighted content')).toBeInTheDocument();
  });
});
