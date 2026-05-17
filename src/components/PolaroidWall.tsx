import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Polaroid, type Photo } from "./Polaroid";

interface Props<T extends Photo> {
  photos: T[];
  editable?: boolean;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function PolaroidWall<T extends Photo & { id?: string }>({
  photos,
  editable,
  onAdd,
  onEdit,
  onDelete,
}: Props<T>) {
  const [active, setActive] = useState<Photo | null>(null);

  return (
    <>
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 px-4 sm:grid-cols-3 md:gap-x-10 md:gap-y-16 lg:grid-cols-4">
        {photos.map((p, i) => (
          <motion.div
            key={p.id ?? p.src + i}
            initial={{ opacity: 0, y: 30, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: p.tilt ?? 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
            className="group relative flex justify-center"
          >
            <Polaroid photo={p} size="md" onExpand={() => setActive(p)} />
            {editable && (
              <div className="absolute -top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(p);
                  }}
                  className="rounded-full bg-cream/95 p-1.5 text-wine shadow hover:bg-cream"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("确认删除这张拍立得？")) onDelete?.(p);
                  }}
                  className="rounded-full bg-cream/95 p-1.5 text-rose shadow hover:bg-cream"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {editable && (
          <button
            onClick={onAdd}
            className="flex aspect-[4/5] w-56 md:w-64 flex-col items-center justify-center self-center rounded border-2 border-dashed border-rose/40 bg-cream/40 text-rose/70 transition hover:border-rose hover:bg-cream/70 hover:text-rose"
          >
            <Plus className="h-8 w-8" />
            <span className="mt-2 font-script text-xl">添加拍立得</span>
          </button>
        )}
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
