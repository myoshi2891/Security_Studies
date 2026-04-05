import type { MDXComponents } from 'mdx/types';
import * as Docs from './components/docs';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Provide a default MDX component mapping with styled HTML element renderers and project-specific components, merged with any caller-provided overrides.
 *
 * @param components - MDX component overrides that will replace or extend the default mappings
 * @returns An `MDXComponents` object mapping MDX element names (e.g., `h1`, `p`, `code`) and custom component keys (e.g., `HeroSection`, `RiskBadge`) to React components; entries from `components` take precedence over the defaults
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => <h1 className={twMerge(clsx("text-4xl font-extrabold tracking-tight lg:text-5xl mb-6", className))} {...props} />,
    h2: ({ className, ...props }) => <h2 className={twMerge(clsx("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4", className))} {...props} />,
    h3: ({ className, ...props }) => <h3 className={twMerge(clsx("scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4", className))} {...props} />,
    p: ({ className, ...props }) => <p className={twMerge(clsx("leading-7 [&:not(:first-child)]:mt-6 text-gray-700 dark:text-slate-200", className))} {...props} />,
    ul: ({ className, ...props }) => <ul className={twMerge(clsx("my-6 ml-6 list-disc [&>li]:mt-2 text-gray-700 dark:text-slate-200", className))} {...props} />,
    ol: ({ className, ...props }) => <ol className={twMerge(clsx("my-6 ml-6 list-decimal [&>li]:mt-2 text-gray-700 dark:text-slate-200", className))} {...props} />,
    li: ({ className, ...props }) => <li className={twMerge(clsx("text-gray-700 dark:text-slate-200", className))} {...props} />,
    code: ({ className, ...props }) => <code className={twMerge(clsx("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className))} {...props} />,
    table: ({ className, ...props }) => <div className="my-6 w-full overflow-x-auto"><table className={twMerge(clsx("w-full text-zinc-700 dark:text-zinc-300", className))} {...props} /></div>,
    tr: ({ className, ...props }) => <tr className={twMerge(clsx("m-0 border-t p-0 even:bg-zinc-50 dark:even:bg-zinc-900/50", className))} {...props} />,
    th: ({ className, ...props }) => <th className={twMerge(clsx("border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right text-zinc-900 dark:text-zinc-100", className))} {...props} />,
    td: ({ className, ...props }) => <td className={twMerge(clsx("border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className))} {...props} />,
    // Custom Components
    HeroSection: Docs.HeroSection,
    SectionCard: Docs.SectionCard,
    RiskBadge: Docs.RiskBadge,
    ThreatCard: Docs.ThreatCard,
    AttackFlow: Docs.AttackFlow,
    DefenseList: Docs.DefenseList,
    Terminal: Docs.Terminal,
    CompareGrid: Docs.CompareGrid,
    StepTimeline: Docs.StepTimeline,
    Callout: Docs.Callout,
    HighlightBox: Docs.HighlightBox,
    SourceReferences: Docs.SourceReferences,
    Checklist: Docs.Checklist,
    DataTable: Docs.DataTable,
    Tag: Docs.Tag,
    DocsSubheading: Docs.DocsSubheading,
    ...components,
  };
}
