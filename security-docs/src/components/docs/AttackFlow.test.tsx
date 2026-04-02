import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { AttackFlow } from './AttackFlow';

describe('AttackFlow', () => {
  test('renders label and children', () => {
    render(
      <AttackFlow label="ATTACK CHAIN">
        <p>Step 1: Attacker registers fake package.</p>
      </AttackFlow>
    );

    expect(screen.getByText('ATTACK CHAIN')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Attacker registers fake package.')).toBeInTheDocument();
  });

  test('renders default label if not provided', () => {
    render(
      <AttackFlow>
        <p>Attack step</p>
      </AttackFlow>
    );

    expect(screen.getByText('ATTACK FLOW')).toBeInTheDocument();
  });
});
