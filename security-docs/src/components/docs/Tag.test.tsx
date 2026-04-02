import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { Tag } from './Tag';

describe('Tag', () => {
  test('renders text with color variant', () => {
    render(<Tag color="blue">Copilot</Tag>);
    const tag = screen.getByText('Copilot');
    expect(tag).toBeInTheDocument();
    expect(tag.className).toContain('text-blue-400');
  });
});
