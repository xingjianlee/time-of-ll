import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Heart, Pencil, Plus, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Polaroid } from "@/components/Polaroid";
import { JournalEditor } from "@/components/JournalEditor";
import { useTimeline, type TimelineItem } from "@/lib/journal";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "旅行时光轴 · Time of L&L" },
      {
        name: "description",
        content: "L&L 共同走过的城市与故事，一条慢慢生长的浪漫时光轴。",
      },
      { property: "og:title", content: "旅行时光轴 · Time of L&L" },
      { property: "og:description", content: "L&L 共同走过的城市与故事。" },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { items, setItems } = useTimeline();
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 pt-6 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-rose/80">our journey</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl text-wine">Travel Timeline</h1>
        <p className="mt-5 font-script text-2xl text-wine/70">
          一条慢慢生长的小路，每一颗心都是我们去过的地方。
        </p>
        <button
          onClick={() => setEditMode((v) => !v)}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-rose/40 bg-cream/70 px-4 py-1.5 text-xs uppercase tracking-widest text-rose hover:bg-cream"
        >
          {editMode ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editMode ? "完成" : "编辑模式"}
        </button>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 pb-32">
        <div className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-rose/40 to-transparent md:left-1/2 md:-translate-x-1/2" />

        <div className="space-y-20">
          {items.map((entry, i) => {
            const right = i % 2 === 1;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`group relative grid grid-cols-[3rem_1fr] gap-4 md:grid-cols-2 md:gap-12 ${
                  right ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="absolute left-6 top-6 -translate-x-1/2 md:left-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-rose/30 animate-ping" />
                    <div className="relative grid h-9 w-9 place-items-center rounded-full bg-cream border border-rose/40 shadow-md">
                      <Heart className="h-4 w-4 fill-rose text-rose animate-heartbeat" />
                    </div>
                  </div>
                </div>

                <div className={`flex justify-center md:justify-${right ? "start" : "end"} pl-12 md:pl-0`}>
                  <Polaroid photo={entry} size="md" />
                </div>

                <div className={`pl-12 md:pl-0 ${right ? "md:text-right" : "md:text-left"}`}>
                  <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-rose/80">
                    <span>{entry.date}</span>
                    <span className="h-px w-6 bg-rose/40" />
                    <span className="font-script text-base text-wine/70 normal-case tracking-normal">
                      {entry.mood}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-3xl md:text-4xl text-wine">
                    {entry.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-wine/75">{entry.story}</p>

                  {editMode && (
                    <div className="mt-4 flex gap-2 md:justify-end">
                      <button
                        onClick={() => setEditing(entry)}
                        className="inline-flex items-center gap-1 rounded-full border border-wine/20 bg-cream/80 px-3 py-1 text-xs text-wine hover:bg-cream"
                      >
                        <Pencil className="h-3 w-3" /> 编辑
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("删除这段时光？")) {
                            setItems((arr) => arr.filter((x) => x.id !== entry.id));
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-rose/30 bg-cream/80 px-3 py-1 text-xs text-rose hover:bg-cream"
                      >
                        <Trash2 className="h-3 w-3" /> 删除
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {editMode && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-rose/50 bg-cream/60 px-6 py-3 text-rose hover:bg-cream"
            >
              <Plus className="h-4 w-4" /> 添加一段时光
            </button>
          </div>
        )}

        <div className="relative mt-24 flex justify-center md:justify-center">
          <div className="font-script text-2xl text-rose">to be continued ♡</div>
        </div>
      </section>

      <JournalEditor
        open={creating || !!editing}
        kind="timeline"
        initial={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={(data) => {
          if (editing) {
            setItems((arr) =>
              arr.map((x) => (x.id === editing.id ? { ...x, ...(data as TimelineItem) } : x)),
            );
          } else {
            setItems((arr) => [...arr, { ...(data as TimelineItem), id: newId() }]);
          }
        }}
      />
    </div>
  );
}
