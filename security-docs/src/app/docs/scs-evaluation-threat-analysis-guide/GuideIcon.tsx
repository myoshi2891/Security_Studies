import {Menu,X,Info} from 'lucide-react';
const icons={'ti-menu-2':Menu,'ti-x':X,'ti-info-circle':Info};
/** Replace the remote icon font with decorative local SVGs. */
export function GuideIcon({name,className}:{name:string;className:string}){const Icon=icons[name as keyof typeof icons];return <i className={className} aria-hidden="true">{Icon&&<Icon aria-hidden="true"/>}</i>;}
