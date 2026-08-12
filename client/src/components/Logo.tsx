interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
}

const SIZES = {
  sm: { img: 'h-7 w-7', text: 'text-base', tagline: 'text-[10px]' },
  md: { img: 'h-9 w-9', text: 'text-lg', tagline: 'text-xs' },
  lg: { img: 'h-12 w-12', text: 'text-2xl', tagline: 'text-sm' },
};

export default function Logo({ size = 'md', variant = 'auto', showTagline = true }: LogoProps) {
  const s = SIZES[size];
  
  let textColor = 'text-slate-900 dark:text-white';
  let taglineColor = 'text-slate-500 dark:text-slate-400';

  if (variant === 'light') {
    textColor = 'text-white';
    taglineColor = 'text-slate-300';
  } else if (variant === 'dark') {
    textColor = 'text-slate-900';
    taglineColor = 'text-slate-500';
  }

  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src="/logo.jpeg"
        alt="IRUR logo"
        className={`${s.img} rounded-lg object-cover ring-1 ring-slate-900/10 dark:ring-white/10 shadow-sm`}
      />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-extrabold tracking-tight ${s.text} ${textColor}`}>
          IRUR
        </span>
        {showTagline && (
          <span className={`font-sans font-medium ${s.tagline} ${taglineColor} mt-0.5`}>
            I Rent U Rent
          </span>
        )}
      </span>
    </span>
  );
}
