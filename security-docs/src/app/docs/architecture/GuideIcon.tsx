import {Menu,X,ShieldCheck,Lightbulb,TriangleAlert,BookOpen,Copy,Check,ExternalLink} from 'lucide-react';
const icons={'ti-menu-2':Menu,'ti-x':X,'ti-shield-check':ShieldCheck,'ti-bulb':Lightbulb,'ti-alert-triangle':TriangleAlert,'ti-book':BookOpen,'ti-copy':Copy,'ti-check':Check,'ti-external-link':ExternalLink};
/** Local SVG equivalents retain original icon containers and source colors. */
export function GuideIcon({name,className}:{name:string;className:string}){
 const Icon=icons[name as keyof typeof icons];
 return <i className={className} aria-hidden="true">{Icon&&<Icon aria-hidden="true"/>}</i>;
}
