import { useState } from "react";
import { motion } from "framer-motion";

export interface Photo {
  src: string;
  alt: string;
  caption: string;       // front: location / date
  date: string;
  note: string;          // back: feelings
  tilt?: number;         // degrees
}

interface Props {
  photo: Photo;
  size?: "sm" | "md" | "lg";
  onExpand?: () => void;
}

const sizeMap = {
  sm: "w-44 md:w-52",
  md: "w-56 md:w-64",
  lg: "w-72 md:w-80",
};

export function Polaroid({ photo, size = "md", onExpand }: Props) {
  const [flipped, setFlipped] = useState(false);
  const tilt = photo.tilt ?? 0;

  return (
    <div
      className={`${sizeMap[size]} aspect-[4/5] [perspective:1200px] cursor-pointer select-none`}
      style={{ ["--tilt" as string]: `${tilt}deg` }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0, rotate: tilt }}
        transition={{ rotateY: { duration: 0.6 }, rotate: { duration: 0.4 } }}
        whileHover={{ scale: 1.04, rotate: tilt * 0.4 }}
        onClick={(e) => {
          e.stopPropagation();
          setFlipped((f) => !f);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onExpand?.();
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-card p-3 pb-12 shadow-[var(--shadow-polaroid)] [backface-visibility:hidden]"
          style={{ borderRadius: 4 }}
        >
          <div className="relative h-full w-full overflow-hidden bg-muted">
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
              draggable={false}
            />
            {/* film grain */}
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
          </div>
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center px-3">
            <span className="font-script text-lg text-wine/80 truncate">
              {photo.caption}
            </span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-[oklch(0.96_0.04_60)] p-5 shadow-[var(--shadow-polaroid)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ borderRadius: 4 }}
        >
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between text-xs text-wine/60 uppercase tracking-widest">
              <span>S &amp; F</span>
              <span>{photo.date}</span>
            </div>
            <div className="my-3 h-px bg-wine/20" />
            <p className="font-script text-xl leading-snug text-wine flex-1 overflow-hidden">
              {photo.note}
            </p>
            <div className="mt-3 self-end font-script text-rose">— with love</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
