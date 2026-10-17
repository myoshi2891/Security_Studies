import { ShieldCheck, ExternalLink } from 'lucide-react';
const icons = { 'ti-shield-lock': ShieldCheck, 'ti-external-link': ExternalLink };
export function GuideIcon({ name }: { name: keyof typeof icons }) {
  const Icon = icons[name];
  return <i className={`ti ${name}`} aria-hidden="true"><Icon aria-hidden="true" /></i>;
}
