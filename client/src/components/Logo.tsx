interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
}

const SIZES = {
  sm: {
    icon: 'w-11 h-11',
    title: 'text-[15px]',
    tagline: 'text-[6px]',
  },
  md: {
    icon: 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16',
    title: 'text-[16px] sm:text-[19px] lg:text-[22px]',
    tagline: 'text-[6px] sm:text-[7px] lg:text-[8px]',
  },
  lg: {
    icon: 'w-14 h-14 sm:w-16 sm:h-16',
    title: 'text-[20px] sm:text-[23px]',
    tagline: 'text-[7px] sm:text-[8px]',
  },
};

export default function Logo({
  size = 'md',
  variant = 'light',
  showTagline = true,
}: LogoProps) {
  const s = SIZES[size];

  // Fixed premium colors for the dark navbar
  const gold = '#D2A66F';
  const cream = '#E8E5DC';

  return (
    <div
      className="inline-flex items-center gap-2 sm:gap-3 shrink-0"
      style={{
        minWidth: 'max-content',
      }}
    >
      {/* Building Icon */}
      <img
        src="/logo.png"
        alt="IRENTURENT"
        className={`${s.icon} object-contain shrink-0`}
      />

      {/* Logo Text */}
      <div
        className="flex flex-col justify-center"
        style={{
          minWidth: 'max-content',
        }}
      >
        {/* IRENTURENT */}
        <div
          className={`
            ${s.title}
            font-display
            font-extrabold
            uppercase
            whitespace-nowrap
            tracking-[0.12em] sm:tracking-[0.18em]
          `}
          style={{
            color: gold,
            lineHeight: '1',
          }}
        >
          IRENTURENT
        </div>

        {/* Tagline */}
        {showTagline && (
          <div
            className={`
              ${s.tagline}
              mt-[5px]
              hidden min-[380px]:block
              font-sans
              font-semibold
              uppercase
              whitespace-nowrap
            `}
            style={{
              color: cream,
              letterSpacing: '0.20em',
              lineHeight: '1.45',
            }}
          >
            <div>RENTING MADE SIMPLE</div>
            <div>LIVING MADE BEAUTIFUL</div>
          </div>
        )}
      </div>
    </div>
  );
}
