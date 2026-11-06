import {ShieldCheck,TriangleAlert,Lightbulb,Code,Info,ExternalLink} from 'lucide-react';
const icons={'ti-shield-lock':ShieldCheck,'ti-alert-triangle':TriangleAlert,'ti-bulb':Lightbulb,'ti-code':Code,'ti-info-circle':Info,'ti-external-link':ExternalLink};
/** 原本の Tabler アイコンクラスを、CDN を使わないローカル SVG に置き換えて描画する */
export function GuideIcon({name,className}:{name:string;className:string}){const Icon=icons[name as keyof typeof icons];return <i className={className} aria-hidden="true">{Icon&&<Icon aria-hidden="true"/>}</i>;}
