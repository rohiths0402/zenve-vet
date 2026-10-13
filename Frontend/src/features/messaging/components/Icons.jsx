const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const SearchIcon = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const ImageIcon = () => (
  <svg {...base}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m21 16-5-5-8 8" />
  </svg>
);

export const ClipIcon = () => (
  <svg {...base}>
    <path d="m21 11-8.6 8.6a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4L15 7" />
  </svg>
);

export const SmileIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9.5h.01M15 9.5h.01" />
  </svg>
);

export const DotsIcon = () => (
  <svg {...base} fill="currentColor" stroke="none">
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

export const StarIcon = ({ filled = false }) => (
  <svg {...base} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
  </svg>
);

export const MuteIcon = () => (
  <svg {...base}>
    <path d="M18 8a6 6 0 0 0-9.3-5M6 6.3A6 6 0 0 0 6 8c0 7-3 9-3 9h14" />
    <path d="M10.3 21a2 2 0 0 0 3.4 0M3 3l18 18" />
  </svg>
);

export const FileIcon = () => (
  <svg {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const ChatIcon = () => (
  <svg {...base} width="26" height="26" strokeWidth="1.5">
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </svg>
);
