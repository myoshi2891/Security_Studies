import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { SourceReferences } from './SourceReferences';

describe('SourceReferences', () => {
  afterEach(() => {
    cleanup();
  });
  test('renders references list after click', () => {
    render(
      <SourceReferences 
        sources={[
          { title: "OpenSSF Guide", url: "https://openssf.org" }
        ]}
      />
    );

    const button = screen.getByRole('button');
    expect(screen.getByText('SOURCES & REFERENCES')).toBeInTheDocument();
    
    // Initially hidden
    expect(screen.queryByText('OpenSSF Guide')).not.toBeInTheDocument();
    
    // Open accordion
    fireEvent.click(button);
    
    const link = screen.getByRole('link', { name: /OpenSSF Guide/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://openssf.org');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toMatch(/noopener/);
    expect(link.getAttribute('rel')).toMatch(/noreferrer/);
  });

  test('renders descriptions when provided and hides them when omitted', () => {
    const { container } = render(
      <SourceReferences 
        sources={[
          { title: "With Desc", url: "https://example.com/1", description: "Detailed description here" },
          { title: "No Desc", url: "https://example.com/2" }
        ]}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('With Desc')).toBeInTheDocument();
    expect(screen.getByText('Detailed description here')).toBeInTheDocument();
    expect(screen.getByText('No Desc')).toBeInTheDocument();
    
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(1);
  });

  test('formats item numbers sequentially with zero-padding', () => {
    render(
      <SourceReferences 
        sources={[
          { title: "First Source", url: "https://example.com/1" },
          { title: "Second Source", url: "https://example.com/2" }
        ]}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  test('applies custom className to container', () => {
    const { container } = render(
      <SourceReferences sources={[]} className="custom-refs-class" />
    );
    expect(container.firstChild).toHaveClass('custom-refs-class');
  });
});
