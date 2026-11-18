import { useEffect, useRef, useState } from 'react';

export function Popover({ trigger, children, align = 'right', width = 228, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`popover-wrap ${className}`} ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={`popover popover--${align}`} style={{ width }} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ icon, children, onClick, danger = false, hint }) {
  return (
    <button type="button" className={`menu-item ${danger ? 'menu-item--danger' : ''}`} onClick={onClick}>
      {icon && <span className="menu-item__icon">{icon}</span>}
      <span className="menu-item__label">{children}</span>
      {hint && <span className="menu-item__hint">{hint}</span>}
    </button>
  );
}

export function MenuDivider() {
  return <div className="menu-divider" />;
}
