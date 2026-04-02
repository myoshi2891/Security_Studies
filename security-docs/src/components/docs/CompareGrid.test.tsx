import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { CompareGrid } from './CompareGrid';

describe('CompareGrid', () => {
  test('renders bad and good practices', () => {
    render(
      <CompareGrid 
        bad={["Opening .env in IDE"]}
        good={["Excluding .env from AI"]}
      />
    );

    expect(screen.getByText('Opening .env in IDE')).toBeInTheDocument();
    expect(screen.getByText('Excluding .env from AI')).toBeInTheDocument();
    expect(screen.getByText('BAD PRACTICE')).toBeInTheDocument();
    expect(screen.getByText('GOOD PRACTICE')).toBeInTheDocument();
  });
});
