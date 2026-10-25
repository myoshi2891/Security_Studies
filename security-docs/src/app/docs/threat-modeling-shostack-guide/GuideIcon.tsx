import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Code,
  ExternalLink,
  Info,
  Languages,
  Lightbulb,
  Menu,
  Shield,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  'ti-alert-triangle': AlertTriangle,
  'ti-book-2': BookOpen,
  'ti-bulb': Lightbulb,
  'ti-calendar': Calendar,
  'ti-code': Code,
  'ti-external-link': ExternalLink,
  'ti-info-circle': Info,
  'ti-language': Languages,
  'ti-menu-2': Menu,
  'ti-shield-lock': Shield,
  'ti-users': Users,
  'ti-x': X,
};

/** Bundle semantic icons locally rather than relying on a remote icon font. */
export function GuideIcon({ name, className }: { name: string; className: string }) {
  const Icon = icons[name];
  return <i className={className} aria-hidden="true">{Icon && <Icon aria-hidden="true" />}</i>;
}
