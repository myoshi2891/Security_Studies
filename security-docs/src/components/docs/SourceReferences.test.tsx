import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { SourceReferences } from './SourceReferences';

describe('SourceReferences', () => {
  test('renders references list', () => {
    render(
      <SourceReferences 
        sources={[
          { title: "OpenSSF Guide", url: "https://openssf.org" }
        ]}
      />
    );

    expect(screen.getByText('SOURCES & REFERENCES')).toBeInTheDocument();
    expect(screen.getByText('OpenSSF Guide')).toBeInTheDocument();
  });
});
