import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { CompareGrid } from './CompareGrid';

describe('CompareGrid', () => {
  afterEach(() => {
    cleanup();
  });
  test('renders bad and good practices', () => {
    render(
      <CompareGrid 
        bad={["Opening .env in IDE"]}
        good={["Excluding .env from AI"]}
      />
    );

    expect(screen.getByText('Opening .env in IDE')).toBeInTheDocument();
    expect(screen.getByText('Excluding .env from AI')).toBeInTheDocument();
    expect(screen.getByText('BAD PRACTICE')).toBeInTheDocument();
    expect(screen.getByText('GOOD PRACTICE')).toBeInTheDocument();
  });

  test('renders safely with empty bad or good arrays', () => {
    render(
      <CompareGrid 
        bad={[]}
        good={[]}
      />
    );

    expect(screen.getByText('BAD PRACTICE')).toBeInTheDocument();
    expect(screen.getByText('GOOD PRACTICE')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Bad practices list' })).toBeEmptyDOMElement();
    expect(screen.getByRole('list', { name: 'Good practices list' })).toBeEmptyDOMElement();
  });

  test('renders ReactNode elements inside bad and good lists', () => {
    render(
      <CompareGrid 
        bad={[<strong key="bad-1" data-testid="custom-bad">Bold Bad</strong>]}
        good={[<span key="good-1" data-testid="custom-good">Span Good</span>]}
      />
    );

    expect(screen.getByTestId('custom-bad')).toBeInTheDocument();
    expect(screen.getByTestId('custom-bad')).toHaveTextContent('Bold Bad');
    expect(screen.getByTestId('custom-good')).toBeInTheDocument();
    expect(screen.getByTestId('custom-good')).toHaveTextContent('Span Good');
  });

  test('applies custom className to container', () => {
    const { container } = render(
      <CompareGrid bad={[]} good={[]} className="custom-compare-grid" />
    );
    expect(container.firstChild).toHaveClass('custom-compare-grid');
  });
});
