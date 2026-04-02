import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { SourceReferences } from './SourceReferences';

describe('SourceReferences', () => {
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
    expect(screen.getByText('OpenSSF Guide')).toBeInTheDocument();
  });
});
