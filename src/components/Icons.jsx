import React from "react";

const wrap = (path) => (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18}
       fill="none" stroke="currentColor" strokeWidth={p.weight || 2}
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
       className={p.className}>
    {path}
  </svg>
);

export const Spark = wrap(<>
  <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
</>);
export const Door = wrap(<><path d="M13 4H6v16h7" /><path d="M13 12h9M19 9l3 3-3 3" /></>);
export const Users = wrap(<>
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
</>);
export const Copy = wrap(<>
  <rect x="9" y="9" width="13" height="13" rx="2" />
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
</>);
export const Logout = wrap(<>
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
  <path d="M16 17l5-5-5-5M21 12H9" />
</>);
export const Plus = wrap(<path d="M12 5v14M5 12h14" />);
export const Trash = wrap(<>
  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
</>);
export const Reset = wrap(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>);
export const Dice = wrap(<>
  <rect x="3" y="3" width="18" height="18" rx="3" />
  <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
</>);
export const Bolt = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="currentColor" aria-hidden="true">
    <path d="M13 2L4 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
);
export const Clock = wrap(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const Check = wrap(<path d="M4 12l5 5L20 6" />);
export const Arrow = wrap(<path d="M5 12h14M13 5l7 7-7 7" />);
export const Cloud = wrap(<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 1 0 6 14h11.5z" />);
export const CloudOff = wrap(<>
  <path d="M3 3l18 18" />
  <path d="M9.5 4.95A6 6 0 0 1 18 9.18 4.5 4.5 0 0 1 19 18h-1" />
  <path d="M14 18H7A4 4 0 0 1 5 10.42" />
</>);
export const Alert = wrap(<>
  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
</>);
export const QrCode = wrap(<>
  <rect x="3" y="3" width="7" height="7" rx="1" />
  <rect x="14" y="3" width="7" height="7" rx="1" />
  <rect x="3" y="14" width="7" height="7" rx="1" />
  <path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h4v-4" />
</>);
