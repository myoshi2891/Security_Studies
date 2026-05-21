import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { DataTable } from './DataTable';

describe('DataTable', () => {
  afterEach(() => {
    cleanup();
  });
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

  test('renders safely with empty headers and rows', () => {
    const { container } = render(
      <DataTable 
        headers={[]}
        rows={[]}
      />
    );

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(container.querySelector('thead tr')).toBeEmptyDOMElement();
    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  test('renders ReactNode elements in cells correctly', () => {
    render(
      <DataTable 
        headers={["Header"]}
        rows={[
          [<span key="cell-1" data-testid="custom-cell-1">ReactNode Cell 1</span>],
          [<strong key="cell-2" data-testid="custom-cell-2">ReactNode Cell 2</strong>]
        ]}
      />
    );

    expect(screen.getByTestId('custom-cell-1')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cell-1')).toHaveTextContent('ReactNode Cell 1');
    expect(screen.getByTestId('custom-cell-2')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cell-2')).toHaveTextContent('ReactNode Cell 2');
  });

  test('applies custom className to container', () => {
    const { container } = render(
      <DataTable headers={[]} rows={[]} className="custom-table-class" />
    );
    expect(container.firstChild).toHaveClass('custom-table-class');
  });
});
