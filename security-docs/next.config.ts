import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  output: 'standalone',
  experimental: {
    // src/lib/search.ts がランタイムに MDX ファイルを fs で読むため、
    // standalone バンドルに明示的に含める必要がある
    outputFileTracingIncludes: {
      '/api/search': ['./src/app/docs/**/*.mdx'],
    },
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [['remark-frontmatter'], ['remark-mdx-frontmatter'], ['remark-gfm']],
  }
});

export default withMDX(nextConfig);
