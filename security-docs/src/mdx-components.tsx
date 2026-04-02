import type { MDXComponents } from 'mdx/types';
import * as Docs from './components/docs';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">{children}</h1>,
    h2: ({ children }) => <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4">{children}</h3>,
    p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-6 text-gray-700 dark:text-gray-300">{children}</p>,
    ul: ({ children }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
    li: ({ children }) => <li>{children}</li>,
    code: ({ children }) => <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">{children}</code>,
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
    ...components,
  };
}
