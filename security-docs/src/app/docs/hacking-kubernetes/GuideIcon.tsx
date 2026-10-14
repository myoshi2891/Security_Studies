import { ShieldCheck, ExternalLink, Info, AlertTriangle, Menu, X } from 'lucide-react';
const icons = { 'ti-shield-lock': ShieldCheck, 'ti-external-link': ExternalLink, 'ti-info-circle': Info, 'ti-alert-triangle': AlertTriangle, 'ti-menu-2': Menu, 'ti-x': X };
export function GuideIcon({ name }: { name: keyof typeof icons }) {
  const Icon = icons[name];
  return <i className={`ti ${name}`} aria-hidden="true"><Icon aria-hidden="true" /></i>;
}
