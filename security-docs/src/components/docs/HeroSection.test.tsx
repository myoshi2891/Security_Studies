import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  test('renders section, title, and chips', () => {
    render(
      <HeroSection 
        section="05" 
        title="AI コーディング安全利用"
        chips={["📅 2026-03-25", "👤 初学者〜中級者"]}
      />
    );

    expect(screen.getByText('Section 05')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AI コーディング安全利用');
    expect(screen.getByText('📅 2026-03-25')).toBeInTheDocument();
    expect(screen.getByText('👤 初学者〜中級者')).toBeInTheDocument();
  });
});
