import {Menu,X,Lightbulb,ExternalLink,Info} from 'lucide-react';
const icons={'ti-menu-2':Menu,'ti-x':X,'ti-bulb':Lightbulb,'ti-external-link':ExternalLink,'ti-info-circle':Info};
export function GuideIcon({name,className}:{name:string;className:string}){const Icon=icons[name as keyof typeof icons];return <i className={className} aria-hidden="true">{Icon&&<Icon aria-hidden="true"/>}</i>;}
