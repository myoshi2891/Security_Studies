import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  afterEach(() => {
    cleanup();
  });
  test('renders section, title, and chips', () => {
    render(
      <HeroSection 
        section="05" 
        title="AI コーディング安全利用"
        chips={["📅 2026-03-25", "👤 初学者〜中級者"]}
      />
    );

    expect(screen.getByText(/Section 05/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AI コーディング安全利用');
    expect(screen.getByText('📅 2026-03-25')).toBeInTheDocument();
    expect(screen.getByText('👤 初学者〜中級者')).toBeInTheDocument();
  });

  test('does not render description or chips when they are not provided', () => {
    const { container } = render(
      <HeroSection 
        section="05" 
        title="AI コーディング安全利用"
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AI コーディング安全利用');
    // description component is an optional paragraph element, check container has no description paragraph
    // According to HeroSection.tsx, {description && <p className="...">...
    expect(container.querySelector('p')).toBeNull();
    // chips container: {chips && chips.length > 0 && <div className="flex flex-wrap gap-2">...
    // Check if there are any spans other than the dot and Section text.
    // Let's check container.querySelector('.flex-wrap') is not on screen.
    expect(container.querySelector('.flex-wrap')).toBeNull();
  });

  test('renders title and description as ReactNode elements correctly', () => {
    render(
      <HeroSection 
        section="05" 
        title={<span data-testid="custom-title">Custom Title</span>}
        description={<strong data-testid="custom-description">Custom Description</strong>}
      />
    );

    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    expect(screen.getByTestId('custom-title')).toHaveTextContent('Custom Title');
    expect(screen.getByTestId('custom-description')).toBeInTheDocument();
    expect(screen.getByTestId('custom-description')).toHaveTextContent('Custom Description');
  });
});
