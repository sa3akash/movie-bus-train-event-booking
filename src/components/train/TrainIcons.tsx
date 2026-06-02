import { LucideProps } from 'lucide-react';

export const TrainIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className || 'w-6 h-6'}
  >
    <rect x="4" y="3" width="16" height="16" rx="2" ry="2" />
    <path d="M4 11h16" /><path d="M12 3v8" />
    <path d="m8 19-2 3" /><path d="m18 22-2-3" />
    <path d="M8 15h0" /><path d="M16 15h0" />
  </svg>
);

export const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
