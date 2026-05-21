import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { Checklist } from './Checklist';

describe('Checklist', () => {
  afterEach(() => {
    cleanup();
  });
  test('renders items and toggles status', () => {
    render(
      <Checklist 
        items={[
          { text: "Item 1", tag: "REQUIRED" },
          { text: "Item 2" }
        ]}
      />
    );

    const item1 = screen.getByText('Item 1');
    expect(item1).toBeInTheDocument();
    expect(screen.getByText('REQUIRED')).toBeInTheDocument();
    
    // Check toggle
    const checkboxButton = item1.closest('button');
    expect(checkboxButton).toBeInTheDocument();
    fireEvent.click(checkboxButton!);
    // Status change should be reflected in aria-pressed
    expect(checkboxButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('calculates progress percentage correctly when items are toggled', () => {
    render(
      <Checklist 
        items={[
          { text: "Item 1" },
          { text: "Item 2" }
        ]}
      />
    );

    // Initial progress should be 0%
    expect(screen.getByText('0%')).toBeInTheDocument();

    const item1Button = screen.getByText('Item 1').closest('button');
    const item2Button = screen.getByText('Item 2').closest('button');
    
    // Toggle first item -> 50%
    fireEvent.click(item1Button!);
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Click second item -> 100%
    fireEvent.click(item2Button!);
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Click first item again -> toggle off -> 50%
    fireEvent.click(item1Button!);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('renders correctly with empty items array', () => {
    render(<Checklist items={[]} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('updates checkedItems status safely when items prop changes', () => {
    const { rerender } = render(
      <Checklist 
        items={[
          { text: "Item 1" },
          { text: "Item 2" }
        ]}
      />
    );

    const item1Button = screen.getByText('Item 1').closest('button');
    fireEvent.click(item1Button!);
    expect(item1Button).toHaveAttribute('aria-pressed', 'true');

    // Rerender with 3 items (expanded)
    rerender(
      <Checklist 
        items={[
          { text: "Item 1" },
          { text: "Item 2" },
          { text: "Item 3" }
        ]}
      />
    );

    const updatedItem1Button = screen.getByText('Item 1').closest('button');
    expect(updatedItem1Button).toHaveAttribute('aria-pressed', 'true'); // should retain checked state

    // Rerender with 1 item (shrunk)
    rerender(
      <Checklist 
        items={[
          { text: "Item 1" }
        ]}
      />
    );
    const shrunkItem1Button = screen.getByText('Item 1').closest('button');
    expect(shrunkItem1Button).toHaveAttribute('aria-pressed', 'true');
  });

  test('applies custom className to container', () => {
    const { container } = render(
      <Checklist items={[]} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
