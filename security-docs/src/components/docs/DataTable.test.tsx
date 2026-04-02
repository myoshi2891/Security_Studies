import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { DataTable } from './DataTable';

describe('DataTable', () => {
  test('renders headers and data', () => {
    render(
      <DataTable 
        headers={["UniqueTool", "UniqueRisk"]}
        rows={[
          ["UniqueCopilot", "UniqueMedium"],
          ["UniqueCursor", "UniqueLow"]
        ]}
      />
    );

    expect(screen.getByText('UniqueTool')).toBeInTheDocument();
    expect(screen.getByText('UniqueRisk')).toBeInTheDocument();
    expect(screen.getByText('UniqueCopilot')).toBeInTheDocument();
    expect(screen.getByText('UniqueMedium')).toBeInTheDocument();
    expect(screen.getByText('UniqueCursor')).toBeInTheDocument();
    expect(screen.getByText('UniqueLow')).toBeInTheDocument();
  });
});
