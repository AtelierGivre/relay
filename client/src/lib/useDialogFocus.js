import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogFocus(open, containerRef) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const container = containerRef.current;

    const focusTarget = () => {
      const preferred = container?.querySelector('[data-autofocus]');
      (preferred || container)?.focus?.();
    };
    const timer = window.setTimeout(focusTarget, 30);

    const onKey = (e) => {
      if (e.key !== 'Tab' || !container) return;
      const items = [...container.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
      );
      if (!items.length) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [open, containerRef]);
}
