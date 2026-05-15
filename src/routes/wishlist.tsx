import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "想做的事 · Time of Sunny & Felix" },
      {
        name: "description",
        content: "Sunny & Felix 想一起完成的事 — 两个人的愿望清单。",
      },
      { property: "og:title", content: "想做的事 · Sunny & Felix" },
      { property: "og:description", content: "两个人的愿望清单。" },
    ],
  }),
  component: WishlistPage,
});

type Owner = "sunny" | "felix";

interface Wish {
  id: string;
  owner: Owner;
  text: string;
  done: boolean;
  createdAt: number;
}

const STORAGE_KEY = "snf-wishlist-v1";

const ownerMeta: Record<
  Owner,
  { name: string; emoji: string; ring: string; bubble: string; tail: string; chip: string; dot: string }
> = {
  sunny: {
    name: "Sunny",
    emoji: "🌸",
    ring: "ring-rose-300/60",
    bubble:
      "bg-gradient-to-br from-[oklch(0.93_0.06_25)] to-[oklch(0.88_0.09_18)] text-wine border-rose-200",
    tail: "bg-[oklch(0.88_0.09_18)]",
    chip: "bg-rose/15 text-rose border border-rose/30",
    dot: "bg-rose",
  },
  felix: {
    name: "Felix",
    emoji: "🌊",
    ring: "ring-sky-300/60",
    bubble:
      "bg-gradient-to-br from-[oklch(0.94_0.04_220)] to-[oklch(0.86_0.08_220)] text-[oklch(0.28_0.08_240)] border-sky-200",
    tail: "bg-[oklch(0.86_0.08_220)]",
    chip:
      "bg-[oklch(0.86_0.08_220)/30] text-[oklch(0.32_0.1_240)] border border-[oklch(0.7_0.1_220)/40]",
    dot: "bg-[oklch(0.6_0.13_230)]",
  },
};

const seed: Wish[] = [
  { id: "s1", owner: "sunny", text: "去看一次北海道的雪", done: false, createdAt: Date.now() - 5e7 },
  { id: "s2", owner: "felix", text: "一起做一顿超丰盛的早餐", done: true, createdAt: Date.now() - 4e7 },
  { id: "s3", owner: "sunny", text: "拍一组复古胶片合照", done: false, createdAt: Date.now() - 3e7 },
  { id: "s4", owner: "felix", text: "周末去看流星雨", done: false, createdAt: Date.now() - 2e7 },
];

function loadWishes(): Wish[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Wish[];
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

function WishlistPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [text, setText] = useState("");
  const [owner, setOwner] = useState<Owner>("sunny");
  const [filter, setFilter] = useState<"all" | Owner | "done">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    setWishes(loadWishes());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  }, [wishes, hydrated]);

  const add = () => {
    const v = text.trim();
    if (!v) return;
    setWishes((w) => [
      { id: crypto.randomUUID(), owner, text: v, done: false, createdAt: Date.now() },
      ...w,
    ]);
    setText("");
  };

  const toggle = (id: string) =>
    setWishes((w) => w.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const remove = (id: string) => setWishes((w) => w.filter((x) => x.id !== id));

  const startEdit = (w: Wish) => {
    setEditingId(w.id);
    setEditText(w.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const v = editText.trim();
    if (!v) return;
    setWishes((w) => w.map((x) => (x.id === editingId ? { ...x, text: v } : x)));
    setEditingId(null);
  };

  const visible = wishes.filter((w) => {
    if (filter === "all") return true;
    if (filter === "done") return w.done;
    return w.owner === filter;
  });

  const stats = {
    total: wishes.length,
    done: wishes.filter((w) => w.done).length,
    sunny: wishes.filter((w) => w.owner === "sunny").length,
    felix: wishes.filter((w) => w.owner === "felix").length,
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 pt-6 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-rose/80">our wishlist</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl text-wine">
          Things to Do <span className="italic text-rose">Together</span>
        </h1>
        <p className="mt-5 font-script text-2xl text-wine/70">
          一个人写下，两个人完成 ♡
        </p>

        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span>共 {stats.total} 个心愿</span>
          <span className="opacity-40">·</span>
          <span className="text-rose">🌸 Sunny {stats.sunny}</span>
          <span className="opacity-40">·</span>
          <span className="text-[oklch(0.5_0.13_230)]">🌊 Felix {stats.felix}</span>
          <span className="opacity-40">·</span>
          <span>已完成 {stats.done}</span>
        </div>
      </section>

      {/* Composer */}
      <section className="mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-rose/20 bg-card/70 backdrop-blur-sm p-5 shadow-[0_20px_60px_-30px_oklch(0.4_0.1_20/0.4)]">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-rose" />
            写一个新的小心愿
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="inline-flex rounded-full bg-muted/60 p-1 self-start sm:self-auto">
              {(["sunny", "felix"] as Owner[]).map((o) => {
                const active = owner === o;
                const m = ownerMeta[o];
                return (
                  <button
                    key={o}
                    onClick={() => setOwner(o)}
                    className={`px-4 py-1.5 text-sm rounded-full transition ${
                      active
                        ? "bg-cream shadow text-wine"
                        : "text-muted-foreground hover:text-wine"
                    }`}
                  >
                    <span className="mr-1">{m.emoji}</span>
                    {m.name}
                  </button>
                );
              })}
            </div>

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder={`以 ${ownerMeta[owner].name} 的口吻写一个心愿…`}
              className="flex-1 rounded-full border border-rose/20 bg-background/70 px-5 py-2.5 text-sm outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20"
            />

            <button
              onClick={add}
              disabled={!text.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose px-5 py-2.5 text-sm text-primary-foreground shadow-md transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              添加
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          {([
            ["all", "全部"],
            ["sunny", "🌸 Sunny"],
            ["felix", "🌊 Felix"],
            ["done", "✓ 已完成"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full border px-3 py-1.5 uppercase tracking-widest transition ${
                filter === k
                  ? "border-rose bg-rose text-primary-foreground"
                  : "border-border bg-background/60 text-muted-foreground hover:text-wine hover:border-rose/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* List */}
      <section className="mx-auto max-w-3xl px-6 py-12 pb-32">
        {visible.length === 0 ? (
          <div className="py-20 text-center font-script text-2xl text-muted-foreground">
            这里还空空的，写下第一个心愿吧 ♡
          </div>
        ) : (
          <ul className="space-y-5">
            <AnimatePresence initial={false}>
              {visible.map((w) => {
                const m = ownerMeta[w.owner];
                const isFelix = w.owner === "felix";
                const editing = editingId === w.id;

                return (
                  <motion.li
                    key={w.id}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: isFelix ? 40 : -40, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                    className={`flex items-start gap-3 ${isFelix ? "flex-row-reverse" : ""}`}
                  >
                    {/* avatar */}
                    <div
                      className={`shrink-0 grid h-11 w-11 place-items-center rounded-full bg-cream ring-2 ${m.ring} text-lg shadow-sm`}
                    >
                      {m.emoji}
                    </div>

                    {/* bubble */}
                    <div className={`relative max-w-[78%] ${isFelix ? "items-end text-right" : ""}`}>
                      <div
                        className={`relative rounded-3xl border px-5 py-3.5 shadow-[0_10px_30px_-15px_oklch(0.4_0.08_30/0.45)] ${m.bubble} ${
                          w.done ? "opacity-70" : ""
                        }`}
                      >
                        {/* tail */}
                        <span
                          className={`absolute top-4 h-3 w-3 rotate-45 ${m.tail} ${
                            isFelix ? "-right-1" : "-left-1"
                          }`}
                          aria-hidden
                        />
                        <div
                          className={`mb-1 flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70 ${
                            isFelix ? "justify-end" : ""
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                          {m.name} · {new Date(w.createdAt).toLocaleDateString("zh-CN")}
                        </div>

                        {editing ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="flex-1 rounded-lg border border-white/40 bg-white/60 px-3 py-1.5 text-sm text-wine outline-none focus:border-wine/40"
                            />
                            <button
                              onClick={saveEdit}
                              className="rounded-full bg-wine/90 p-1.5 text-cream hover:bg-wine"
                              aria-label="Save"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-full bg-white/70 p-1.5 text-wine hover:bg-white"
                              aria-label="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <p
                            className={`font-script text-xl leading-snug ${
                              w.done ? "line-through decoration-wine/50" : ""
                            }`}
                          >
                            {w.text}
                          </p>
                        )}
                      </div>

                      {/* actions */}
                      {!editing && (
                        <div
                          className={`mt-2 flex items-center gap-1 text-xs text-muted-foreground ${
                            isFelix ? "justify-end" : ""
                          }`}
                        >
                          <button
                            onClick={() => toggle(w.id)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition ${m.chip} hover:scale-105`}
                          >
                            {w.done ? <Heart className="h-3 w-3 fill-current" /> : <Check className="h-3 w-3" />}
                            {w.done ? "已完成" : "完成"}
                          </button>
                          <button
                            onClick={() => startEdit(w)}
                            className="inline-flex items-center gap-1 rounded-full bg-background/60 border border-border px-2.5 py-1 hover:text-wine"
                          >
                            <Pencil className="h-3 w-3" />
                            编辑
                          </button>
                          <button
                            onClick={() => remove(w.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-background/60 border border-border px-2.5 py-1 hover:text-destructive hover:border-destructive/40"
                          >
                            <Trash2 className="h-3 w-3" />
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}
