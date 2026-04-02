import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { DataTable } from './DataTable';

describe('DataTable', () => {
  test('renders headers and data', () => {
    render(
      <DataTable 
        headers={["Tool", "Risk"]}
        rows={[
          ["Copilot", "Medium"],
          ["Cursor", "Low"]
        ]}
      />
    );

    expect(screen.getByText('Tool')).toBeInTheDocument();
    expect(screen.getByText('Risk')).toBeInTheDocument();
    expect(screen.getByText('Copilot')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
});
