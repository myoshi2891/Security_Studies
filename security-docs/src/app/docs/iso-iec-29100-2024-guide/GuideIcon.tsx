import {Menu,X,ShieldCheck,TriangleAlert,BookOpen,Lightbulb,Check,ChevronDown,CircleCheck,Eye,EyeOff,Info,RefreshCw} from 'lucide-react';
import type {CSSProperties} from 'react';
const icons={"ti-menu-2":Menu,"ti-x":X,"ti-shield-lock":ShieldCheck,"ti-alert-triangle":TriangleAlert,"ti-book":BookOpen,"ti-bulb":Lightbulb,"ti-check":Check,"ti-chevron-down":ChevronDown,"ti-circle-check":CircleCheck,"ti-eye":Eye,"ti-eye-off":EyeOff,"ti-info-circle":Info,"ti-refresh":RefreshCw};
export function GuideIcon({name,className,style}:{name:string;className:string;style?:CSSProperties}){const Icon=icons[name as keyof typeof icons];return <i className={className} style={style} aria-hidden="true">{Icon && <Icon aria-hidden="true" />}</i>;}
