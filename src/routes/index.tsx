import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Pencil, Sparkles, Check } from "lucide-react";
import { AnniversaryCounter } from "@/components/AnniversaryCounter";
import { PolaroidWall } from "@/components/PolaroidWall";
import { Petals } from "@/components/Petals";
import { SiteHeader } from "@/components/SiteHeader";
import { JournalEditor } from "@/components/JournalEditor";
import { usePhotos, newId, type PhotoItem } from "@/lib/journal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Time of L&L · 我们的电子手账" },
      {
        name: "description",
        content:
          "属于 L&L 的浪漫电子手账：纪念日实时计时、拍立得照片墙与旅行时光轴。",
      },
      { property: "og:title", content: "Time of L&L · 我们的电子手账" },
      {
        property: "og:description",
        content: "纪念日计时 · 拍立得照片墙 · 旅行时光轴。",
      },
    ],
  }),
  component: HomePage,
});

const ANNIVERSARY = "2026-02-24";
const NAMES = "Sunny & Felix";

function HomePage() {
  const { items, setItems } = usePhotos();
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<PhotoItem | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Petals />
      <div className="relative z-10">
        <SiteHeader />

        {/* HERO */}
        <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-10 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-rose/80"
          >
            <Sparkles className="h-3.5 w-3.5" />
            a love journal
            <Sparkles className="h-3.5 w-3.5" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="mt-6 font-display text-6xl md:text-8xl font-medium text-wine leading-[0.95]"
          >
            Time of <span className="italic text-rose">Sunny &amp; Felix</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-5 max-w-xl font-script text-2xl text-wine/70"
          >
            把走过的城市、吃过的甜、笑过的瞬间，全部贴进这本只属于我们的手账。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-14"
          >
            <AnniversaryCounter startDate={ANNIVERSARY} />
          </motion.div>
        </section>

        {/* DIVIDER */}
        <div className="mx-auto flex max-w-3xl items-center gap-6 px-6">
          <span className="h-px flex-1 bg-rose/30" />
          <Heart className="h-4 w-4 fill-rose text-rose" />
          <span className="font-script text-2xl text-wine/70">our polaroids</span>
          <Heart className="h-4 w-4 fill-rose text-rose" />
          <span className="h-px flex-1 bg-rose/30" />
        </div>

        {/* POLAROID WALL */}
        <section className="relative py-20">
          <div className="mb-10 px-6 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-wine">
              Polaroid Wall
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              点击翻转看背面 · 双击放大查看
            </p>
            <button
              onClick={() => setEditMode((v) => !v)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-rose/40 bg-cream/70 px-4 py-1.5 text-xs uppercase tracking-widest text-rose hover:bg-cream"
            >
              {editMode ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              {editMode ? "完成" : "编辑模式"}
            </button>
          </div>
          <PolaroidWall
            photos={items}
            editable={editMode}
            onAdd={() => setCreating(true)}
            onEdit={(p) => setEditing(p)}
            onDelete={(p) => setItems((arr) => arr.filter((x) => x.id !== p.id))}
          />
        </section>

        <JournalEditor
          open={creating || !!editing}
          kind="photo"
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(data) => {
            if (editing) {
              setItems((arr) =>
                arr.map((x) => (x.id === editing.id ? { ...x, ...(data as PhotoItem) } : x)),
              );
            } else {
              setItems((arr) => [{ id: newId(), ...(data as PhotoItem) }, ...arr]);
            }
          }}
        />

        {/* FOOTER */}
        <footer className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="font-script text-3xl text-rose">— {NAMES} —</div>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            kept with love · since {ANNIVERSARY}
          </p>
        </footer>
      </div>
    </div>
  );
}
