import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { StepTimeline } from './StepTimeline';

describe('StepTimeline', () => {
  test('renders multiple steps', () => {
    render(
      <StepTimeline 
        steps={[
          { title: "Step 1", content: "Description 1" },
          { title: "Step 2", content: "Description 2" }
        ]}
      />
    );

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });
});
