import {createLucideIcon,Lightbulb,Info,TriangleAlert,Check,ExternalLink,Calendar} from 'lucide-react';
// Keep the original lock inside its square without a remote icon font.
const LockSquare=createLucideIcon('LockSquare',[
 ['rect',{x:'3',y:'3',width:'18',height:'18',rx:'3',key:'square'}],
 ['rect',{x:'8',y:'11',width:'8',height:'6',rx:'1',key:'lock'}],
 ['path',{d:'M10 11V9a2 2 0 0 1 4 0v2',key:'shackle'}],
]);
const icons={'ti-lock-square':LockSquare,'ti-bulb':Lightbulb,'ti-info-circle':Info,'ti-alert-triangle':TriangleAlert,'ti-check':Check,'ti-external-link':ExternalLink,'ti-calendar':Calendar};
export function GuideIcon({name,className}:{name:keyof typeof icons;className:string}){const Icon=icons[name];return <i className={className} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
