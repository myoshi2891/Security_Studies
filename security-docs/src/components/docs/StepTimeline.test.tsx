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

    // より堅牢なセレクタでの検証 (正規表現マッチの失敗を回避)
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: "Step 1" })).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: "Step 2" })).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });
});
