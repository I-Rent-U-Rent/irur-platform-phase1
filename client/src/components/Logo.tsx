interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

const SIZES = {
  sm: { img: 'h-8 w-8', text: 'text-base', tagline: 'text-[10px]' },
  md: { img: 'h-10 w-10', text: 'text-lg', tagline: 'text-xs' },
  lg: { img: 'h-14 w-14', text: 'text-2xl', tagline: 'text-sm' },
};

export default function Logo({ size = 'md', variant = 'dark', showTagline = true }: LogoProps) {
  const s = SIZES[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-navy-900';
  const taglineColor = variant === 'light' ? 'text-white/70' : 'text-gray-500';

  return (
    <span className="flex items-center gap-2.5">
      <img
        src="/logo.jpeg"
        alt="IRUR logo"
        className={`${s.img} rounded-xl object-cover ring-1 ring-black/5 shadow-sm`}
      />
      <span className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight ${s.text} ${textColor}`}>
          IRUR
        </span>
        {showTagline && (
          <span className={`font-normal ${s.tagline} ${taglineColor} mt-0.5`}>
            I Rent U Rent
          </span>
        )}
      </span>
    </span>
  );
}
