import { LockKeyhole, TriangleAlert, ExternalLink, Info } from 'lucide-react';
const icons={"ti-lock-square":LockKeyhole,"ti-alert-triangle":TriangleAlert,"ti-external-link":ExternalLink,"ti-info-circle":Info};
export function GuideIcon({name,className}:{name:keyof typeof icons;className:string}){const Icon=icons[name];return <i className={className} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
