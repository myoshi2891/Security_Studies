import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Netlify ビルド時は Netlify Next.js Runtime が独自バンドルするため standalone を無効化
  output: process.env.NETLIFY ? undefined : 'standalone',
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [['remark-frontmatter'], ['remark-mdx-frontmatter'], ['remark-gfm']],
  }
});

export default withMDX(nextConfig);
