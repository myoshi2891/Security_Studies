import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { DefenseList } from './DefenseList';

describe('DefenseList', () => {
  test('renders label and list items', () => {
    render(
      <DefenseList label="DEFENSE STRATEGY">
        <li>Use explicit package versions.</li>
        <li>Review supply chain alerts.</li>
      </DefenseList>
    );

    expect(screen.getByText('DEFENSE STRATEGY')).toBeInTheDocument();
    expect(screen.getByText('Use explicit package versions.')).toBeInTheDocument();
    expect(screen.getByText('Review supply chain alerts.')).toBeInTheDocument();
  });

  test('renders default label if not provided', () => {
    render(
      <DefenseList>
        <li>Defend</li>
      </DefenseList>
    );

    expect(screen.getByText('DEFENSE MEASURES')).toBeInTheDocument();
  });
});
