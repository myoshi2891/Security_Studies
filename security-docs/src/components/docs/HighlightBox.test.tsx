import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { HighlightBox } from './HighlightBox';

describe('HighlightBox', () => {
  afterEach(() => {
    cleanup();
  });
  test('renders children with blue variant', () => {
    render(<HighlightBox color="blue">Highlighted content</HighlightBox>);
    const element = screen.getByText('Highlighted content');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('bg-blue-400/10');
  });

  test('applies blue variant as default color when omitted', () => {
    render(<HighlightBox>Default Highlighted content</HighlightBox>);
    const element = screen.getByText('Default Highlighted content');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('bg-blue-400/10');
  });

  test('applies yellow color class when color="yellow"', () => {
    render(<HighlightBox color="yellow">Yellow content</HighlightBox>);
    const element = screen.getByText('Yellow content');
    expect(element).toHaveClass('bg-yellow-400/10');
  });

  test('applies red color class when color="red"', () => {
    render(<HighlightBox color="red">Red content</HighlightBox>);
    const element = screen.getByText('Red content');
    expect(element).toHaveClass('bg-red-400/10');
  });

  test('applies green color class when color="green"', () => {
    render(<HighlightBox color="green">Green content</HighlightBox>);
    const element = screen.getByText('Green content');
    expect(element).toHaveClass('bg-emerald-400/10');
  });

  test('applies cyan color class when color="cyan"', () => {
    render(<HighlightBox color="cyan">Cyan content</HighlightBox>);
    const element = screen.getByText('Cyan content');
    expect(element).toHaveClass('bg-cyan-400/10');
  });

  test('applies custom className to container', () => {
    render(<HighlightBox className="custom-box">Content</HighlightBox>);
    const element = screen.getByText('Content');
    expect(element).toHaveClass('custom-box');
  });
});
