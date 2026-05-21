import { render, screen, within } from '@testing-library/react';
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

    const stepsElements = screen.getAllByRole('article');

    expect(stepsElements[0]).toHaveTextContent('01');
    expect(within(stepsElements[0]).getByRole('heading', { level: 4, name: "Step 1" })).toBeInTheDocument();
    expect(within(stepsElements[0]).getByText("Description 1")).toBeInTheDocument();

    expect(stepsElements[1]).toHaveTextContent('02');
    expect(within(stepsElements[1]).getByRole('heading', { level: 4, name: "Step 2" })).toBeInTheDocument();
    expect(within(stepsElements[1]).getByText("Description 2")).toBeInTheDocument();
  });
});
