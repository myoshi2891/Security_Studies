import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import tailwindnext from '@tailwindcss/next';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

// Tailwind v4 プラグインと MDX プラグインを統合
export default tailwindnext()(withMDX(nextConfig));
