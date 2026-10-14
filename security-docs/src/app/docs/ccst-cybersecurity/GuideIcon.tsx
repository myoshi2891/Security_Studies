import { BookOpen, ExternalLink, Info, Lightbulb, Target, Wrench } from 'lucide-react';

const icons = { 'ti-info-circle': Info, 'ti-external-link': ExternalLink, 'ti-book': BookOpen, 'ti-tool': Wrench, 'ti-bulb': Lightbulb, 'ti-target': Target };
export type IconName = keyof typeof icons;
/** Preserve original icon hooks and replace the remote webfont with local SVG. */
export function GuideIcon({ name }: { name: IconName }) {
  const Icon = icons[name];
  return <i className={`ti ${name}`} aria-hidden="true"><Icon aria-hidden="true" /></i>;
}
