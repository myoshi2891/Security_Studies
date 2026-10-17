import { LockKeyhole, ShieldCheck, TriangleAlert, Quote, Lightbulb, Info, ChevronRight } from 'lucide-react';
/** Local SVGs replace the original Tabler font without a network dependency. */
export const guideIcons = {'ti-lock':LockKeyhole,'ti-shield-lock':ShieldCheck,'ti-alert-triangle':TriangleAlert,'ti-quote':Quote,'ti-bulb':Lightbulb,'ti-info-circle':Info,'ti-chevron-right':ChevronRight} as const;
export function GuideIcon({name}:{name:keyof typeof guideIcons}){const Icon=guideIcons[name];return <i className={`ti ${name}`} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
