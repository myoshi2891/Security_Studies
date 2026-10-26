import {Menu,X,Flag,Compass,House,Lightbulb,Info,BookOpen,ExternalLink,Check,RefreshCw,ListChecks} from 'lucide-react';
const icons={'ti-menu-2':Menu,'ti-x':X,'ti-flag':Flag,'ti-compass':Compass,'ti-home':House,'ti-bulb':Lightbulb,'ti-info-circle':Info,'ti-book':BookOpen,'ti-external-link':ExternalLink,'ti-check':Check,'ti-refresh':RefreshCw,'ti-list-check':ListChecks};
export function GuideIcon({name,className}:{name:string;className:string}){const Icon=icons[name as keyof typeof icons];return <i className={className} aria-hidden="true">{Icon&&<Icon aria-hidden="true"/>}</i>;}
