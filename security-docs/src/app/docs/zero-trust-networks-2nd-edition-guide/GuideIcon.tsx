import { ShieldCheck, BookOpen, Info, List, CircleHelp, ChevronDown, ExternalLink } from 'lucide-react';
const icons={"ti-shield-lock":ShieldCheck,"ti-book-2":BookOpen,"ti-info-circle":Info,"ti-list-details":List,"ti-help-circle":CircleHelp,"ti-chevron-down":ChevronDown,"ti-external-link":ExternalLink};
/** Bundled icons retain original classes without remote font dependencies. */
export function GuideIcon({name,className}:{name:keyof typeof icons;className:string}){const Icon=icons[name];return <i className={className} aria-hidden="true"><Icon aria-hidden="true" /></i>;}
