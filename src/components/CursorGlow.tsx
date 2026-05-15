import { useEffect, useState } from "react";

/**
 * Heart trail that follows the cursor. Disabled on touch devices.
 */
export function CursorGlow() {
  const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    let lastTrail = 0;
    let nextId = 0;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTrail > 70) {
        lastTrail = now;
        const id = nextId++;
        setTrail((t) => [...t.slice(-12), { id, x: e.clientX, y: e.clientY }]);
        window.setTimeout(() => {
          setTrail((t) => t.filter((p) => p.id !== id));
        }, 1200);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[2]" aria-hidden>
        {trail.map((p, i) => (
          <span
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: p.x,
              top: p.y,
              animation: "heart-pop 1.2s ease-out forwards",
              opacity: Math.max(0.2, 1 - i * 0.04),
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="oklch(0.62 0.16 18)">
              <path d="M12 21s-7-4.35-9.5-9C1 8 3.5 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 20.5 4 23 8 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
            </svg>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes heart-pop {
          0% { transform: translate(-50%, -50%) scale(0.4) rotate(-10deg); opacity: 1; }
          40% { transform: translate(-50%, -70%) scale(1.1) rotate(5deg); opacity: 0.9; }
          100% { transform: translate(-50%, -120%) scale(0.6) rotate(-8deg); opacity: 0; }
        }
      `}</style>
    </>
  );
}
