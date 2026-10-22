import { ShieldCheck, BadgeCheck, Lightbulb, ChevronRight, Info, TriangleAlert } from 'lucide-react';
export const guideIcons={'ti-shield-check':ShieldCheck,'ti-assurance':BadgeCheck,'ti-bulb':Lightbulb,'ti-chevron-right':ChevronRight,'ti-info-circle':Info,'ti-alert-triangle':TriangleAlert} as const;
export function GuideIcon({name,className}:{name:keyof typeof guideIcons;className:string}){const Icon=guideIcons[name];return <i className={className} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
