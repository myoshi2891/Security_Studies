import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { SectionCard } from './SectionCard';

describe('SectionCard', () => {
  test('renders eyebrow, title, and children', () => {
    render(
      <SectionCard eyebrow="Section 01" title="Test Title">
        <p>Test Content</p>
      </SectionCard>
    );

    expect(screen.getByText('Section 01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
