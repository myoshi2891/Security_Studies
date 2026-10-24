import {Info,Check,Play} from 'lucide-react';
function ShieldLock(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 4v6c0 4-5 7-8 8-3-1-8-4-8-8V7l8-4Z"/><rect x={8} y={11} width={8} height={6} rx={1}/><path d="M10 11V9a2 2 0 014 0v2"/></svg>;}
const icons={'ti-shield-lock':ShieldLock,'ti-player-play':Play,'ti-info-circle':Info,'ti-check':Check};
export function GuideIcon({name,className}:{name:keyof typeof icons;className:string}){const Icon=icons[name];return <i className={className} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
