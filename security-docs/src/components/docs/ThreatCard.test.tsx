import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { ThreatCard } from './ThreatCard';

describe('ThreatCard', () => {
  afterEach(() => {
    cleanup();
  });
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

  test('applies critical severity gradient colors', () => {
    const { container } = render(
      <ThreatCard title="Slopsquatting" severity="critical">
        <p>AI generates fake package names.</p>
      </ThreatCard>
    );
    // Gradient element is the absolute positioned div at the top.
    // It should have the 'from-red-500' class.
    const gradientBar = container.querySelector('.absolute.top-0');
    expect(gradientBar).toBeInTheDocument();
    expect(gradientBar).toHaveClass('from-red-500');
  });

  test('applies high severity gradient colors', () => {
    const { container } = render(
      <ThreatCard title="Slopsquatting" severity="high">
        <p>Content</p>
      </ThreatCard>
    );
    const gradientBar = container.querySelector('.absolute.top-0');
    expect(gradientBar).toHaveClass('from-yellow-400');
  });

  test('applies medium severity gradient colors', () => {
    const { container } = render(
      <ThreatCard title="Slopsquatting" severity="medium">
        <p>Content</p>
      </ThreatCard>
    );
    const gradientBar = container.querySelector('.absolute.top-0');
    expect(gradientBar).toHaveClass('from-blue-500');
  });

  test('applies info severity gradient colors', () => {
    const { container } = render(
      <ThreatCard title="Slopsquatting" severity="info">
        <p>Content</p>
      </ThreatCard>
    );
    const gradientBar = container.querySelector('.absolute.top-0');
    expect(gradientBar).toHaveClass('from-cyan-400');
  });

  test('renders title and children as ReactNode elements correctly', () => {
    render(
      <ThreatCard 
        title={<span data-testid="custom-threat-title">Custom Title</span>} 
        severity="medium"
      >
        <div data-testid="custom-threat-body">Custom Content</div>
      </ThreatCard>
    );

    expect(screen.getByTestId('custom-threat-title')).toBeInTheDocument();
    expect(screen.getByTestId('custom-threat-title')).toHaveTextContent('Custom Title');
    expect(screen.getByTestId('custom-threat-body')).toBeInTheDocument();
    expect(screen.getByTestId('custom-threat-body')).toHaveTextContent('Custom Content');
  });

  test('applies custom className to container', () => {
    const { container } = render(
      <ThreatCard title="Slopsquatting" severity="critical" className="custom-threat-card">
        <p>Content</p>
      </ThreatCard>
    );
    expect(container.firstChild).toHaveClass('custom-threat-card');
  });
});
