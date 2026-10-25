import { Ghost, Menu, X, ExternalLink } from 'lucide-react';
const icons = {'ti-ghost-2': Ghost, 'ti-menu-2': Menu, 'ti-x': X, 'ti-external-link': ExternalLink};
export function GuideIcon({name,className}: {name: string; className: string}) {
  const Icon = icons[name as keyof typeof icons];
  return <i className={className} aria-hidden="true">{Icon && <Icon aria-hidden="true" />}</i>;
}
