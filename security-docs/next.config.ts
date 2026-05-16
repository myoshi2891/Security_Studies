import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Netlify ビルド時は Netlify Next.js Runtime が独自バンドルするため standalone を無効化
  output: process.env.NETLIFY ? undefined : 'standalone',
  // src/lib/search.ts がランタイムに MDX ファイルを fs で読むため、サーバレスバンドルに明示的に含める
  // Next.js 16 で experimental から安定版へ昇格しトップレベルに移動
  outputFileTracingIncludes: {
    '/api/search': ['./src/app/docs/**/*.mdx'],
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [['remark-frontmatter'], ['remark-mdx-frontmatter'], ['remark-gfm']],
  }
});

export default withMDX(nextConfig);
