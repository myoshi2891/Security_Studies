import { LockKeyhole, Menu, X, TriangleAlert, Quote, Lightbulb, Info, ChevronRight } from 'lucide-react';
function ShieldLock(){return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7Z"/><rect x="8" y="10" width="8" height="6" rx="1"/><path d="M10 10V8a2 2 0 0 1 4 0v2"/></svg>;}
/** Local SVGs replace the original Tabler font without a network dependency. */
export const guideIcons = {'ti-lock':LockKeyhole,'ti-shield-lock':ShieldLock,'ti-alert-triangle':TriangleAlert,'ti-quote':Quote,'ti-bulb':Lightbulb,'ti-info-circle':Info,'ti-chevron-right':ChevronRight,'ti-menu-2':Menu,'ti-x':X} as const;
export function GuideIcon({name}:{name:keyof typeof guideIcons}){const Icon=guideIcons[name];return <i className={`ti ${name}`} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
