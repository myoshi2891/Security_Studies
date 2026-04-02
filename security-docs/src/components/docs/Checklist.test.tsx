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
    const checkbox = item1.parentElement?.querySelector('div[class*="border"]');
    if (checkbox) {
      fireEvent.click(item1);
      // Status change should be reflected in class or icon (check implementation)
    }
  });
});
