import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { SectionCard } from './SectionCard';

describe('SectionCard', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders eyebrow, title, and children', () => {
    render(
      <SectionCard eyebrow="Section 01" title="Test Title Alpha">
        <p>Test Content Alpha</p>
      </SectionCard>
    );

    expect(screen.getByText('Section 01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title Alpha');
    expect(screen.getByText('Test Content Alpha')).toBeInTheDocument();
  });

  test('renders subtitle when sub prop is provided', () => {
    render(
      <SectionCard title="Title Beta" sub="Unique Subtitle Beta">
        <p>Content Beta</p>
      </SectionCard>
    );

    expect(screen.getByText('Unique Subtitle Beta')).toBeInTheDocument();
  });

  test('does not render subtitle when sub prop is omitted', () => {
    render(
      <SectionCard title="Title Gamma">
        <p>Content Gamma</p>
      </SectionCard>
    );

    expect(screen.queryByText('Unique Subtitle Beta')).toBeNull();
  });
});
