import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { DocsSubheading } from './DocsSubheading';

describe('DocsSubheading', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders children with default level 3 and default blue color', () => {
    render(<DocsSubheading>Threat Landscape</DocsSubheading>);

    expect(screen.getByText('Threat Landscape')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Threat Landscape');
    expect(heading.className).toContain('before:bg-blue-500');
  });

  test('applies emerald color class when color="emerald"', () => {
    render(<DocsSubheading color="emerald">Defense</DocsSubheading>);

    expect(screen.getByRole('heading').className).toContain('before:bg-emerald-500');
  });

  test('applies red color class when color="red"', () => {
    render(<DocsSubheading color="red">Critical</DocsSubheading>);

    expect(screen.getByRole('heading').className).toContain('before:bg-red-500');
  });

  test('respects level prop via aria-level', () => {
    render(<DocsSubheading level={2}>Section</DocsSubheading>);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section');
  });
});
