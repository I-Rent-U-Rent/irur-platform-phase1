interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /**
   * 'light'  — wordmark for a dark surface (navbar / footer brand chrome).
   * 'auto'   — wordmark follows the active theme (light pages).
   */
  variant?: 'light' | 'auto';
  showTagline?: boolean;
  stacked?: boolean;
}

const SIZES = {
  sm: {
    tile: 'w-9 h-9 rounded-lg',
    title: 'text-[15px]',
    tagline: 'text-[6px]',
    gap: 'gap-2',
  },
  md: {
    tile: 'w-11 h-11 sm:w-12 sm:h-12 lg:w-[3.25rem] lg:h-[3.25rem] rounded-xl',
    title: 'text-[16px] sm:text-[19px] lg:text-[21px]',
    tagline: 'text-[6px] sm:text-[7px] lg:text-[8px]',
    gap: 'gap-2.5 sm:gap-3',
  },
  lg: {
    tile: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl',
    title: 'text-[20px] sm:text-[24px]',
    tagline: 'text-[8px] sm:text-[9px]',
    gap: 'gap-3 sm:gap-4',
  },
};

export default function Logo({
  size = 'md',
  variant = 'auto',
  showTagline = true,
  stacked = false,
}: LogoProps) {
  const s = SIZES[size];
  const onDark = variant === 'light';

  // On a light page the brand gold has to darken to stay legible.
  const titleColor = onDark
    ? 'text-[#D2A66F]'
    : 'text-[#9A6B2F] dark:text-[#D2A66F]';
  const taglineColor = onDark
    ? 'text-white/70'
    : 'text-slate-500 dark:text-[#E8E5DC]/70';

  return (
    <div
      className={`group/logo inline-flex ${stacked ? 'flex-col items-start' : 'items-center'} ${s.gap} shrink-0 max-w-full`}
    >
      {/* The mark carries its own navy ground, so it reads on any background. */}
      <span
        className={`
          ${s.tile}
          brand-logo-tile
          relative shrink-0 overflow-hidden
          ring-1 ring-[#D2A66F]/25
          shadow-[0_2px_10px_rgba(2,6,12,0.35)]
          transition-transform duration-500 ease-out
          group-hover/logo:scale-[1.04]
        `}
      >
        <img
          src="/logo-tile.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      </span>

      <div className="flex min-w-0 flex-col justify-center">
        <div
          className={`
            ${s.title}
            ${titleColor}
            font-display font-extrabold uppercase
            leading-[1.1]
            tracking-[0.10em] sm:tracking-[0.14em]
            transition-colors duration-300
            ${stacked ? 'whitespace-normal' : 'whitespace-nowrap'}
          `}
        >
          IRENTURENT
        </div>

        {showTagline && (
          <div
            className={`
              ${s.tagline}
              ${taglineColor}
              mt-[5px]
              font-sans font-semibold uppercase
              leading-snug tracking-[0.16em]
              transition-colors duration-300
              ${onDark ? 'hidden min-[380px]:block' : 'block'}
            `}
          >
            <div>RENTING MADE SIMPLE</div>
            <div>LIVING MADE BEAUTIFUL</div>
          </div>
        )}
      </div>
    </div>
  );
}
