import {Info,ExternalLink,Lightbulb,Menu} from 'lucide-react';
const icons={'ti-info-circle':Info,'ti-external-link':ExternalLink,'ti-bulb':Lightbulb,'ti-menu-2':Menu};
export function GuideIcon({name,className}:{name:keyof typeof icons;className:string}){const Icon=icons[name];return <i className={className} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
