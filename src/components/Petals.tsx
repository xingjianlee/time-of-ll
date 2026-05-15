import { useMemo } from "react";

export function Petals({ count = 14 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 14,
        duration: 12 + Math.random() * 10,
        size: 10 + Math.random() * 14,
        opacity: 0.5 + Math.random() * 0.4,
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
