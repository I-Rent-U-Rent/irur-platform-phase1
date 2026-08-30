interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  stacked?: boolean;
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
    icon: 'w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem]',
    title: 'text-[20px] sm:text-[24px]',
    tagline: 'text-[8px] sm:text-[9px]',
  },
};

export default function Logo({
  size = 'md',
  variant = 'light',
  showTagline = true,
  stacked = false,
}: LogoProps) {
  const s = SIZES[size];
  const gold = '#D2A66F';
  const onDark = variant === 'light';

  return (
    <div
      className={`inline-flex ${stacked ? 'flex-col items-start' : 'items-center'} gap-2 sm:gap-3 shrink-0 max-w-full`}
    >
      <img
        src="/logo.png"
        alt="IRENTURENT"
        className={`${s.icon} object-contain shrink-0`}
      />

      <div className="flex min-w-0 flex-col justify-center">
        <div
          className={`
            ${s.title}
            font-display
            font-extrabold
            uppercase
            tracking-[0.10em] sm:tracking-[0.14em]
            ${stacked ? 'whitespace-normal' : 'whitespace-nowrap'}
          `}
          style={{
            color: gold,
            lineHeight: '1.1',
          }}
        >
          IRENTURENT
        </div>

        {showTagline && (
          <div
            className={`
              ${s.tagline}
              mt-[6px]
              font-sans
              font-semibold
              uppercase
              leading-snug
              ${onDark ? 'hidden min-[380px]:block' : 'block'}
            `}
            style={{
              color: onDark ? '#E8E5DC' : undefined,
              letterSpacing: '0.16em',
            }}
          >
            <div className={onDark ? undefined : 'text-slate-600 dark:text-slate-300'}>
              RENTING MADE SIMPLE
            </div>
            <div className={onDark ? undefined : 'text-slate-600 dark:text-slate-300'}>
              LIVING MADE BEAUTIFUL
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
