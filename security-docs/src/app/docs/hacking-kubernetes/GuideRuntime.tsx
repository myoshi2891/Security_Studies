'use client';
import { useEffect, useRef, type ReactNode } from 'react';
/** Preserve the source checklist DOM and update its live count within this guide only. */
export function GuideRuntime({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const guide = root.current;
    const update = () => {
      const done = guide?.querySelector('#chkDone');
      if (done) { done.textContent = String(guide?.querySelectorAll('.check-card input:checked').length ?? 0); done.setAttribute('aria-live', 'polite'); }
    };
    guide?.addEventListener('change', update); update();
    return () => { guide?.removeEventListener('change', update); };
  }, []);
  return <div className="kubernetes-guide" ref={root}>{children}</div>;
}
