import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { RiskBadge } from './RiskBadge';

describe('RiskBadge', () => {
  test('renders critical badge', () => {
    render(<RiskBadge level="critical">Critical Risk</RiskBadge>);
    const badge = screen.getByText('Critical Risk');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-red-400');
  });

  test('renders high badge', () => {
    render(<RiskBadge level="high">High Risk</RiskBadge>);
    const badge = screen.getByText('High Risk');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-yellow-400');
  });
});
