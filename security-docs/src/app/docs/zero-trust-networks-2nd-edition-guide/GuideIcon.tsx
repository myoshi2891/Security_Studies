import { createLucideIcon, BookOpen, Info, List, CircleHelp, ChevronDown, ExternalLink } from 'lucide-react';
// This installed Lucide version lacks ShieldLock; keep the original shield-and-padlock meaning locally.
const ShieldLock=createLucideIcon('ShieldLock',[
 ['path',{d:'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11',key:'shield'}],
 ['rect',{x:'9',y:'10',width:'6',height:'5',rx:'1',key:'lock'}],
 ['path',{d:'M10 10V8a2 2 0 0 1 4 0v2',key:'shackle'}],
]);
const icons={"ti-shield-lock":ShieldLock,"ti-book-2":BookOpen,"ti-info-circle":Info,"ti-list-details":List,"ti-help-circle":CircleHelp,"ti-chevron-down":ChevronDown,"ti-external-link":ExternalLink};
/** Bundled icons retain original classes without remote font dependencies. */
export function GuideIcon({name,className}:{name:keyof typeof icons;className:string}){const Icon=icons[name];return <i className={className} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
