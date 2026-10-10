import type { DeviceCategory } from '../shared/assessment';

export function DeviceIcon({ category }: { category: DeviceCategory }) {
  return <svg aria-hidden="true" viewBox="0 0 120 100" fill="none" className="device-icon">
    <ellipse cx="60" cy="85" rx="40" ry="5" fill="#d7e6ec" />
    {category === 'PHONE' && <>
      <rect x="39" y="10" width="42" height="73" rx="9" fill="#e2eff4" stroke="currentColor" strokeWidth="3" />
      <rect x="45" y="19" width="30" height="49" rx="3" fill="#ffffff" /><path d="M54 15h12M57 75h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m49 53 9-11 8 6 9-14" stroke="#267e7a" strokeWidth="3" strokeLinecap="round" />
    </>}
    {category === 'LAPTOP' && <>
      <rect x="20" y="20" width="80" height="53" rx="6" fill="#e2eff4" stroke="currentColor" strokeWidth="3" />
      <rect x="27" y="27" width="66" height="39" rx="2" fill="#fff" /><path d="M13 74h94l-8 9H21l-8-9Z" fill="#e2eff4" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="m39 51 14-13 10 8 16-13" stroke="#267e7a" strokeWidth="3" strokeLinecap="round" /><path d="M49 77h22" stroke="currentColor" strokeWidth="2" />
    </>}
    {category === 'POWER_BANK' && <>
      <rect x="30" y="25" width="60" height="57" rx="10" fill="#e2eff4" stroke="currentColor" strokeWidth="3" />
      <path d="M49 27v-7h22v7" stroke="currentColor" strokeWidth="3" /><path d="m64 38-13 19h12l-7 15 17-22H60l4-12Z" fill="#267e7a" />
      <circle cx="77" cy="34" r="2" fill="currentColor" />
    </>}
  </svg>;
}
