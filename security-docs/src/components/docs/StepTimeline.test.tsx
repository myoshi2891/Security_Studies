import { render, screen, within, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { StepTimeline } from './StepTimeline';

describe('StepTimeline', () => {
  afterEach(() => {
    cleanup();
  });
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

  test('renders safely with empty steps array', () => {
    const { container } = render(<StepTimeline steps={[]} />);
    expect(container.querySelectorAll('article').length).toBe(0);
    // Vertical line should not exist (since steps.length === 0, lines checking top-[2.75rem] should be absent)
    expect(container.querySelector('.absolute')).toBeNull();
  });

  test('renders title and content as ReactNode elements correctly', () => {
    render(
      <StepTimeline 
        steps={[
          { 
            title: <span data-testid="custom-step-title">Custom Step Title</span>, 
            content: <p data-testid="custom-step-content">Custom Step Content</p> 
          }
        ]}
      />
    );

    expect(screen.getByTestId('custom-step-title')).toBeInTheDocument();
    expect(screen.getByTestId('custom-step-title')).toHaveTextContent('Custom Step Title');
    expect(screen.getByTestId('custom-step-content')).toBeInTheDocument();
    expect(screen.getByTestId('custom-step-content')).toHaveTextContent('Custom Step Content');
  });

  test('applies custom className to container', () => {
    const { container } = render(
      <StepTimeline steps={[]} className="custom-timeline-class" />
    );
    expect(container.firstChild).toHaveClass('custom-timeline-class');
  });
});
