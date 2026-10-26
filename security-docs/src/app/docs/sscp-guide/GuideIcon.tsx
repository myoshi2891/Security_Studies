import {Menu,X,Award,Info,Lightbulb,ExternalLink} from 'lucide-react';
const icons={'ti-menu-2':Menu,'ti-x':X,'ti-certificate':Award,'ti-info-circle':Info,'ti-bulb':Lightbulb,'ti-external-link':ExternalLink};
export function GuideIcon({name,className}:{name:string;className:string}){const Icon=icons[name as keyof typeof icons];return <i className={className} aria-hidden="true">{Icon&&<Icon aria-hidden="true"/>}</i>;}
