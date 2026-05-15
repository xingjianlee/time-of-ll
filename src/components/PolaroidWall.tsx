import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Polaroid, type Photo } from "./Polaroid";

interface Props {
  photos: Photo[];
}

export function PolaroidWall({ photos }: Props) {
  const [active, setActive] = useState<Photo | null>(null);

  return (
    <>
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 px-4 sm:grid-cols-3 md:gap-x-10 md:gap-y-16 lg:grid-cols-4">
        {photos.map((p, i) => (
          <motion.div
            key={p.src}
            initial={{ opacity: 0, y: 30, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: p.tilt ?? 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
            className="flex justify-center"
          >
            <Polaroid photo={p} size="md" onExpand={() => setActive(p)} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-wine/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Polaroid photo={{ ...active, tilt: 0 }} size="lg" />
            </motion.div>
            <button
              onClick={() => setActive(null)}
              className="absolute top-6 right-6 rounded-full bg-cream/90 p-2 text-wine hover:bg-cream"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
