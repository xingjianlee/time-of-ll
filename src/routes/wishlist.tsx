import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Heart,
  ImagePlus,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useWishes, uploadImage, type WishItem, type WishOwner } from "@/lib/journal";
import { useAuth } from "@/lib/auth";

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

type Owner = WishOwner;
type Filter = "todo" | Owner | "done" | "all";
type Wish = WishItem;

const ownerMeta: Record<
  Owner,
  { name: string; emoji: string; ring: string; bubble: string; tail: string; chip: string; dot: string; tint: string }
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
    tint: "text-rose",
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
    tint: "text-[oklch(0.5_0.13_230)]",
  },
};

function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function fmtDateTime(ts: number) {
  const d = new Date(ts);
  return `${fmtDate(ts)} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

function WishlistPage() {
  const { items: wishes, add: addWish, update: updateWish, remove: removeWish } = useWishes();
  const { user } = useAuth();
  const canEdit = !!user;

  const [text, setText] = useState("");
  const [owner, setOwner] = useState<Owner>("sunny");
  const [filter, setFilter] = useState<Filter>("todo");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [completing, setCompleting] = useState<Wish | null>(null);

  const add = () => {
    const v = text.trim();
    if (!v || !canEdit) return;
    void addWish(owner, v);
    setText("");
  };

  const remove = (id: string) => {
    if (!canEdit) return;
    void removeWish(id);
  };

  const startEdit = (w: Wish) => {
    if (!canEdit) return;
    setEditingId(w.id);
    setEditText(w.text);
  };
  const saveEdit = () => {
    if (!editingId) return;
    const v = editText.trim();
    if (!v) return;
    void updateWish(editingId, { text: v });
    setEditingId(null);
  };

  const reopen = (id: string) => {
    if (!canEdit) return;
    void updateWish(id, {
      done: false,
      completedAt: undefined,
      completionNote: undefined,
      completionPhoto: undefined,
    });
  };

  const completeWish = (id: string, note: string, photo?: string) => {
    void updateWish(id, {
      done: true,
      completedAt: Date.now(),
      completionNote: note.trim() || undefined,
      completionPhoto: photo,
    });
  };
  const visible = wishes
    .filter((w) => {
      if (filter === "todo") return !w.done;
      if (filter === "done") return w.done;
      if (filter === "all") return true;
      // owner filter — only undone for that person
      return w.owner === filter && !w.done;
    })
    .sort((a, b) => {
      // done items: most recently completed first; todo: newest first
      if (a.done && b.done) return (b.completedAt ?? 0) - (a.completedAt ?? 0);
      return b.createdAt - a.createdAt;
    });

  const stats = {
    total: wishes.length,
    done: wishes.filter((w) => w.done).length,
    sunnyTodo: wishes.filter((w) => w.owner === "sunny" && !w.done).length,
    felixTodo: wishes.filter((w) => w.owner === "felix" && !w.done).length,
    todo: wishes.filter((w) => !w.done).length,
  };

  const filters: Array<{ key: Filter; label: string; count: number }> = [
    { key: "todo", label: "未完成", count: stats.todo },
    { key: "sunny", label: "🌸 Sunny", count: stats.sunnyTodo },
    { key: "felix", label: "🌊 Felix", count: stats.felixTodo },
    { key: "done", label: "✓ 已完成", count: stats.done },
    { key: "all", label: "全部", count: stats.total },
  ];

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
      </section>

      {/* Composer (only when signed in) */}
      <section className="mx-auto max-w-3xl px-6">
        {canEdit && (
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
                      active ? "bg-cream shadow text-wine" : "text-muted-foreground hover:text-wine"
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
        )}

        {/* Filter */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          {filters.map(({ key, label, count }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 uppercase tracking-widest transition ${
                  active
                    ? "border-rose bg-rose text-primary-foreground"
                    : "border-border bg-background/60 text-muted-foreground hover:text-wine hover:border-rose/40"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] tracking-normal ${
                    active ? "bg-cream/30 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
              {visible.map((w) => (
                <WishRow
                  key={w.id}
                  wish={w}
                  canEdit={canEdit}
                  editing={editingId === w.id}
                  editText={editText}
                  onEditTextChange={setEditText}
                  onStartEdit={() => startEdit(w)}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onRemove={() => remove(w.id)}
                  onComplete={() => setCompleting(w)}
                  onReopen={() => reopen(w.id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {/* Complete dialog */}
      <AnimatePresence>
        {completing && (
          <CompleteDialog
            wish={completing}
            onClose={() => setCompleting(null)}
            onSubmit={(note, photo) => {
              completeWish(completing.id, note, photo);
              setCompleting(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------- Row -------------------------------- */

function WishRow(props: {
  wish: Wish;
  editing: boolean;
  editText: string;
  onEditTextChange: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
  onComplete: () => void;
  onReopen: () => void;
}) {
  const {
    wish: w,
    editing,
    editText,
    onEditTextChange,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onRemove,
    onComplete,
    onReopen,
  } = props;

  const m = ownerMeta[w.owner];
  const isFelix = w.owner === "felix";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: isFelix ? 40 : -40, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={`flex items-start gap-3 ${isFelix ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`shrink-0 grid h-11 w-11 place-items-center rounded-full bg-cream ring-2 ${m.ring} text-lg shadow-sm`}
      >
        {m.emoji}
      </div>

      <div className={`relative max-w-[78%] min-w-0 ${isFelix ? "items-end text-right" : ""}`}>
        <div
          className={`relative rounded-3xl border px-5 py-3.5 shadow-[0_10px_30px_-15px_oklch(0.4_0.08_30/0.45)] ${m.bubble}`}
        >
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
            {m.name} · {fmtDate(w.createdAt)}
          </div>

          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSaveEdit();
                  if (e.key === "Escape") onCancelEdit();
                }}
                className="flex-1 rounded-lg border border-white/40 bg-white/60 px-3 py-1.5 text-sm text-wine outline-none focus:border-wine/40"
              />
              <button
                onClick={onSaveEdit}
                className="rounded-full bg-wine/90 p-1.5 text-cream hover:bg-wine"
                aria-label="Save"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onCancelEdit}
                className="rounded-full bg-white/70 p-1.5 text-wine hover:bg-white"
                aria-label="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <p className="font-script text-xl leading-snug">{w.text}</p>
          )}

          {/* Completion record */}
          {w.done && !editing && (
            <div className="mt-3 rounded-2xl border border-white/50 bg-white/55 backdrop-blur-sm p-3 text-left">
              <div
                className={`mb-1.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${m.tint}`}
              >
                <Heart className="h-3 w-3 fill-current" />
                完成于 {w.completedAt ? fmtDateTime(w.completedAt) : "—"}
              </div>
              {w.completionPhoto && (
                <div className="mb-2 overflow-hidden rounded-lg border border-white/70 shadow-sm">
                  <img
                    src={w.completionPhoto}
                    alt="completion"
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                </div>
              )}
              {w.completionNote && (
                <p className="font-script text-base leading-snug text-wine/85">
                  {w.completionNote}
                </p>
              )}
            </div>
          )}
        </div>

        {/* actions */}
        {!editing && (
          <div
            className={`mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground ${
              isFelix ? "justify-end" : ""
            }`}
          >
            {w.done ? (
              <button
                onClick={onReopen}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition ${m.chip} hover:scale-105`}
              >
                <X className="h-3 w-3" />
                取消完成
              </button>
            ) : (
              <button
                onClick={onComplete}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition ${m.chip} hover:scale-105`}
              >
                <Check className="h-3 w-3" />
                完成
              </button>
            )}
            <button
              onClick={onStartEdit}
              className="inline-flex items-center gap-1 rounded-full bg-background/60 border border-border px-2.5 py-1 hover:text-wine"
            >
              <Pencil className="h-3 w-3" />
              编辑
            </button>
            <button
              onClick={onRemove}
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
}

/* ----------------------------- Complete Dialog ----------------------------- */

function CompleteDialog({
  wish,
  onClose,
  onSubmit,
}: {
  wish: Wish;
  onClose: () => void;
  onSubmit: (note: string, photo?: string) => void;
}) {
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const m = ownerMeta[wish.owner];

  const onPick = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, 1200, 0.82);
      setPhoto(url);
    } catch (e) {
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-wine/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="w-full max-w-md rounded-3xl border border-rose/20 bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest ${m.tint}`}>
            <Heart className="h-3.5 w-3.5 fill-current" />
            记录这次完成
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-wine"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-2 font-display text-2xl text-wine leading-tight">
          {wish.text}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          完成时间将记录为 <span className="font-medium text-wine">{fmtDateTime(Date.now())}</span>
        </p>

        <label className="mt-5 block text-xs uppercase tracking-widest text-muted-foreground">
          这一刻想说什么
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="一句话留住此刻的心情…"
          className="mt-1.5 w-full resize-none rounded-2xl border border-rose/20 bg-background/70 px-4 py-3 text-sm font-script text-wine outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20"
        />

        <div className="mt-4">
          <label className="block text-xs uppercase tracking-widest text-muted-foreground">
            小照片（可选）
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />

          {photo ? (
            <div className="mt-2 group relative overflow-hidden rounded-2xl border border-rose/20">
              <img src={photo} alt="preview" className="h-48 w-full object-cover" />
              <button
                onClick={() => setPhoto(undefined)}
                className="absolute right-2 top-2 rounded-full bg-cream/90 p-1.5 text-wine opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute left-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-cream/90 px-3 py-1 text-xs text-wine opacity-0 group-hover:opacity-100 transition"
              >
                <Camera className="h-3 w-3" /> 重新选择
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="mt-2 flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-rose/30 bg-background/50 text-sm text-muted-foreground transition hover:border-rose/60 hover:text-wine disabled:opacity-50"
            >
              <ImagePlus className="h-5 w-5" />
              {busy ? "处理中…" : "点击上传一张小照片"}
            </button>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-wine"
          >
            取消
          </button>
          <button
            onClick={() => onSubmit(note, photo)}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose px-5 py-2 text-sm text-primary-foreground shadow-md hover:scale-[1.02] transition"
          >
            <Check className="h-4 w-4" />
            完成它 ♡
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
