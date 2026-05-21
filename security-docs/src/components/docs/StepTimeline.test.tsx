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

    // getAllByText で複数マッチ時も安全にインデックス指定
    expect(screen.getAllByText('01')[0]).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: "Step 1" })).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();

    expect(screen.getAllByText('02')[0]).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: "Step 2" })).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });
});
