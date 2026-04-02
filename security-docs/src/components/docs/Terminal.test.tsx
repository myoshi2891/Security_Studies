import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { Terminal } from './Terminal';

describe('Terminal', () => {
  test('renders title and commands', () => {
    render(
      <Terminal title="package-verify.sh">
        {`$ npm install fast-json-parser-v2
# Check if package exists`}
      </Terminal>
    );

    expect(screen.getByText('package-verify.sh')).toBeInTheDocument();
    expect(screen.getByText(/npm install fast-json-parser-v2/)).toBeInTheDocument();
  });
});
