import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { Callout } from './Callout';

describe('Callout', () => {
  test('renders title and children with info variant', () => {
    render(
      <Callout type="info" title="Note">
        <p>Information content</p>
      </Callout>
    );

    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Information content')).toBeInTheDocument();
  });

  test('renders warning variant', () => {
    render(
      <Callout type="warning">
        <p>Warning content</p>
      </Callout>
    );

    expect(screen.getByText('Warning content')).toBeInTheDocument();
  });
});
