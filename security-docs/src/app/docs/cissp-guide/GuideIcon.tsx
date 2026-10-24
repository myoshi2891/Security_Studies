import {Menu,ShieldCheck,Info,Lightbulb,ChevronRight,Check,ExternalLink} from 'lucide-react';
const icons={'ti-menu-2':Menu,'ti-shield-check':ShieldCheck,'ti-info-circle':Info,'ti-bulb':Lightbulb,'ti-chevron-right':ChevronRight,'ti-check':Check,'ti-external-link':ExternalLink};
export function GuideIcon({name,className}:{name:keyof typeof icons;className:string}){const Icon=icons[name];return <i className={className} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
