export function StickerMark() {
  return (
    <svg viewBox="0 0 44 44" width="30" height="30" aria-hidden focusable="false">
      <defs>
        <linearGradient id="sm-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8fab" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <g transform="rotate(-8 22 22)">
        <path
          d="M8 6h20a6 6 0 0 1 6 6v14l-10 10H8a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z"
          fill="url(#sm-mark-grad)"
        />
        <path d="M24 26h10L24 36V26z" fill="#f472b6" opacity="0.8" />
        <circle cx="15.5" cy="18" r="2.1" fill="#3b2145" />
        <circle cx="25.5" cy="18" r="2.1" fill="#3b2145" />
        <path
          d="M14.5 24c2.5 3 10.5 3 13 0"
          stroke="#3b2145"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
