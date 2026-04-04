import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import { Terminal } from './Terminal';

describe('Terminal', () => {
  test('renders title and commands', async () => {
    const Component = await Terminal({
      title: "package-verify.sh",
      children: `$ npm install fast-json-parser-v2\n# Check if package exists`
    });
    
    const { container, unmount } = render(Component);

    expect(screen.getByText('package-verify.sh')).toBeInTheDocument();
    expect(container.textContent).toContain('npm install fast-json-parser-v2');
    unmount();
  });

  test('renders without title', async () => {
    const Component = await Terminal({
      children: `$ npm run build`
    });

    const { container, unmount } = render(Component);

    expect(screen.queryByText('package-verify.sh')).not.toBeInTheDocument();
    expect(container.textContent).toContain('npm run build');
    unmount();
  });
});
