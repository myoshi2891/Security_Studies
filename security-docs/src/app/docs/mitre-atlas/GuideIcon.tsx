import { ArrowLeftRight, Bot, Bug, ClockAlert, FileText, Flag, Info, Layers, Lightbulb, Link2, ListChecks, ListOrdered, Network, Route, ShieldCheck, TriangleAlert, Wrench } from 'lucide-react';

const icons = {
  'ti-shield-lock': ShieldCheck, 'ti-robot': Bot, 'ti-info-circle': Info,
  'ti-arrows-diff': ArrowLeftRight, 'ti-hierarchy-3': Network, 'ti-list-numbers': ListOrdered,
  'ti-bug': Bug, 'ti-route': Route, 'ti-shield-check': ShieldCheck, 'ti-file-text': FileText,
  'ti-checklist': ListChecks, 'ti-stack-2': Layers, 'ti-tools': Wrench, 'ti-flag-check': Flag,
  'ti-link': Link2, 'ti-bulb': Lightbulb, 'ti-clock-exclamation': ClockAlert, 'ti-alert-triangle': TriangleAlert,
};
export type IconName = keyof typeof icons;
/** Local SVG replacement retains original icon classes and color hooks. */
export function GuideIcon({ name }: { name: IconName }) {
  const Icon = icons[name];
  return <Icon className={`ti ${name}`} aria-hidden="true" />;
}
