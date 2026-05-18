import { useMemo } from "react";

export function Petals({ count = 14 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: (i * 37 + 11) % 100,
        delay: (i * 2.7 + 1.3) % 14,
        duration: 12 + ((i * 5.1 + 3) % 10),
        size: 10 + ((i * 4.3 + 2) % 14),
        opacity: 0.5 + (((i * 13) % 40) / 100),
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute -top-10 block animate-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <svg viewBox="0 0 24 24" className="h-full w-full">
            <path
              d="M12 2c2 4 6 6 6 10a6 6 0 0 1-12 0c0-4 4-6 6-10z"
              fill="oklch(0.85 0.1 25)"
              opacity="0.85"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
