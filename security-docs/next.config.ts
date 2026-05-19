import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Netlify ビルド時は Netlify Next.js Runtime が独自バンドルするため standalone を無効化
  output: process.env.NETLIFY ? undefined : 'standalone',
  // Edge Runtime (proxy.ts) は process.env を直接参照できないため、
  // ビルド時に next.config.ts 経由で明示的にインライン展開する
  env: {
    IS_NETLIFY: process.env.NETLIFY ?? '',
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [['remark-frontmatter'], ['remark-mdx-frontmatter'], ['remark-gfm']],
  }
});

export default withMDX(nextConfig);
