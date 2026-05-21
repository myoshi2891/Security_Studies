import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { Tag } from './Tag';

describe('Tag', () => {
  afterEach(() => {
    cleanup();
  });
  test('renders text with color variant', () => {
    render(<Tag color="blue">Copilot</Tag>);
    const tag = screen.getByText('Copilot');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass('text-blue-400');
  });

  test('applies blue variant as default color when omitted', () => {
    render(<Tag>Default Tag</Tag>);
    const tag = screen.getByText('Default Tag');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass('text-blue-400');
  });

  test('applies yellow color class when color="yellow"', () => {
    render(<Tag color="yellow">Yellow Tag</Tag>);
    const tag = screen.getByText('Yellow Tag');
    expect(tag).toHaveClass('text-yellow-400');
  });

  test('applies red color class when color="red"', () => {
    render(<Tag color="red">Red Tag</Tag>);
    const tag = screen.getByText('Red Tag');
    expect(tag).toHaveClass('text-red-400');
  });

  test('applies green color class when color="green"', () => {
    render(<Tag color="green">Green Tag</Tag>);
    const tag = screen.getByText('Green Tag');
    expect(tag).toHaveClass('text-emerald-400');
  });

  test('applies cyan color class when color="cyan"', () => {
    render(<Tag color="cyan">Cyan Tag</Tag>);
    const tag = screen.getByText('Cyan Tag');
    expect(tag).toHaveClass('text-cyan-400');
  });

  test('applies custom className to container', () => {
    render(<Tag className="custom-tag-class">Tag Content</Tag>);
    const tag = screen.getByText('Tag Content');
    expect(tag).toHaveClass('custom-tag-class');
  });
});
