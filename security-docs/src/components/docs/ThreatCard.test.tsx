import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { ThreatCard } from './ThreatCard';

describe('ThreatCard', () => {
  test('renders title, severity badge, and children', () => {
    render(
      <ThreatCard title="Slopsquatting" severity="critical">
        <p>AI generates fake package names.</p>
      </ThreatCard>
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Slopsquatting');
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('AI generates fake package names.')).toBeInTheDocument();
  });
});
