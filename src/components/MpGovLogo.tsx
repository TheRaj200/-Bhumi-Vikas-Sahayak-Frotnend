export function MpGovLogo({ className = 'h-11 w-11' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Madhya Pradesh Government Emblem"
    >
      {/* Outer 24 Stupa Beads Ring */}
      <circle cx="60" cy="60" r="56" fill="#7F1D1D" stroke="#B91C1C" strokeWidth="2" />
      <circle cx="60" cy="60" r="50" fill="#991B1B" stroke="#FBBF24" strokeWidth="1.5" />

      {/* Decorative beads around outer rim */}
      {[...Array(24)].map((_, i) => {
        const angle = (i * 360) / 24
        const rad = (angle * Math.PI) / 180
        const cx = 60 + 53 * Math.cos(rad)
        const cy = 60 + 53 * Math.sin(rad)
        return <circle key={i} cx={cx} cy={cy} r="2" fill="#FDE68A" />
      })}

      {/* Inner Golden Circle */}
      <circle cx="60" cy="60" r="42" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />

      {/* Wheat Sheaves on Left & Right */}
      <path
        d="M30 65C30 52 35 42 42 35M28 68C32 58 37 48 45 42"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M90 65C90 52 85 42 78 35M92 68C88 58 83 48 75 42"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Banyan Tree in Background */}
      <path
        d="M48 50C48 40 54 36 60 36C66 36 72 40 72 50C70 54 66 56 60 56C54 56 50 54 48 50Z"
        fill="#15803D"
        opacity="0.85"
      />
      <rect x="58.5" y="50" width="3" height="15" fill="#78350F" />

      {/* Ashoka Lion Capital of Sarnath (Emblem of India) */}
      <g transform="translate(48, 44) scale(0.4)">
        {/* Central Lion Head */}
        <path
          d="M30 10C24 10 20 15 20 22C20 28 25 34 30 36C35 34 40 28 40 22C40 15 36 10 30 10Z"
          fill="#B45309"
        />
        {/* Left Lion Head */}
        <path
          d="M14 16C10 16 8 20 8 25C8 30 12 34 16 36C19 32 19 24 18 18C17 17 15.5 16 14 16Z"
          fill="#92400E"
        />
        {/* Right Lion Head */}
        <path
          d="M46 16C50 16 52 20 52 25C52 30 48 34 44 36C41 32 41 24 42 18C43 17 44.5 16 46 16Z"
          fill="#92400E"
        />
        {/* Ashoka Chakra Base */}
        <rect x="12" y="38" width="36" height="6" rx="2" fill="#B45309" />
        <circle cx="30" cy="41" r="2.5" fill="#1E3A8A" />
        <rect x="8" y="44" width="44" height="4" rx="1" fill="#78350F" />
      </g>

      {/* Hindi Text: मध्य प्रदेश शासन */}
      <path id="curveTop" d="M28,60 A32,32 0 0,1 92,60" fill="none" />
      <text fill="#FEF3C7" fontSize="8" fontWeight="bold" letterSpacing="0.8">
        <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
          मध्य प्रदेश शासन
        </textPath>
      </text>

      {/* सत्यमेव जयते */}
      <text
        x="60"
        y="96"
        fill="#FEF3C7"
        fontSize="6.5"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        सत्यमेव जयते
      </text>
    </svg>
  )
}
