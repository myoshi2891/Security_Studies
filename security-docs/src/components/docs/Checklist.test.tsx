import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { Checklist } from './Checklist';

describe('Checklist', () => {
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
    if (checkboxButton) {
      fireEvent.click(checkboxButton);
      // Status change should be reflected in aria-pressed
      expect(checkboxButton).toHaveAttribute('aria-pressed', 'true');
    }
  });
});
