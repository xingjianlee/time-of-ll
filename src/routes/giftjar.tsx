import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Gift,
  Heart,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
  Check,
  PackageOpen,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/giftjar")({
  head: () => ({
    meta: [
      { title: "心愿罐子 · Time of Sunny & Felix" },
      {
        name: "description",
        content: "Sunny & Felix 的礼物心愿罐子 — 悄悄藏起来的惊喜。",
      },
      { property: "og:title", content: "心愿罐子 · Sunny & Felix" },
      { property: "og:description", content: "两个人的礼物心愿罐子。" },
    ],
  }),
  component: GiftJarPage,
});

type Owner = "sunny" | "felix";
type Recipient = "sunny" | "felix" | "both";
type Filter = "all" | "sunny" | "felix" | "given";

interface GiftIdea {
  id: string;
  owner: Owner; // who wrote it
  recipient: Recipient; // who it's for
  title: string;
  note?: string;
  tags: string[];
  price?: string;
  given: boolean;
  givenAt?: number;
  createdAt: number;
}

const STORAGE_KEY = "snf-giftjar-v1";

const ownerMeta: Record<
  Owner,
  {
    name: string;
    emoji: string;
    ring: string;
    gradient: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    chip: string;
    dot: string;
    tint: string;
    softBg: string;
  }
> = {
  sunny: {
    name: "Sunny",
    emoji: "🌸",
    ring: "ring-rose-300/60",
    gradient:
      "from-[oklch(0.93_0.06_25)] to-[oklch(0.88_0.09_18)]",
    border: "border-rose-200",
    badgeBg: "bg-rose/10",
    badgeText: "text-rose",
    chip: "bg-rose/15 text-rose border border-rose/30",
    dot: "bg-rose",
    tint: "text-rose",
    softBg: "bg-rose/5",
  },
  felix: {
    name: "Felix",
    emoji: "🌊",
    ring: "ring-sky-300/60",
    gradient:
      "from-[oklch(0.94_0.04_220)] to-[oklch(0.86_0.08_220)]",
    border: "border-sky-200",
    badgeBg: "bg-[oklch(0.86_0.08_220)/30]",
    badgeText: "text-[oklch(0.5_0.13_230)]",
    chip:
      "bg-[oklch(0.86_0.08_220)/30] text-[oklch(0.32_0.1_240)] border border-[oklch(0.7_0.1_220)/40]",
    dot: "bg-[oklch(0.6_0.13_230)]",
    tint: "text-[oklch(0.5_0.13_230)]",
    softBg: "bg-[oklch(0.9_0.04_220)/20]",
  },
};

const recipientLabel: Record<Recipient, string> = {
  sunny: "给 Sunny",
  felix: "给 Felix",
  both: "给我们",
};

const recipientDot: Record<Recipient, string> = {
  sunny: "bg-rose",
  felix: "bg-[oklch(0.6_0.13_230)]",
  both: "bg-gradient-to-br from-rose to-[oklch(0.6_0.13_230)]",
};

const seed: GiftIdea[] = [
  {
    id: "g1",
    owner: "sunny",
    recipient: "felix",
    title: "手工编织的羊毛围巾",
    note: "冬天快来了，想给他一个温暖的惊喜",
    tags: ["手工", "冬天"],
    price: "200-300",
    given: false,
    createdAt: Date.now() - 6e7,
  },
  {
    id: "g2",
    owner: "felix",
    recipient: "sunny",
    title: "她提过喜欢的那个香薰蜡烛",
    note: "Jo Malone 的英国梨与小苍兰",
    tags: ["香氛"],
    price: "500",
    given: true,
    givenAt: Date.now() - 1e6,
    createdAt: Date.now() - 5e7,
  },
  {
    id: "g3",
    owner: "sunny",
    recipient: "both",
    title: "一起去陶艺工坊做一对杯子",
    note: "可以用一辈子的小东西",
    tags: ["体验", "纪念"],
    given: false,
    createdAt: Date.now() - 3e7,
  },
  {
    id: "g4",
    owner: "felix",
    recipient: "sunny",
    title: "她收藏的绘本列表里缺的那几本",
    note: "已经悄悄记下来了",
    tags: ["书籍"],
    given: false,
    createdAt: Date.now() - 2e7,
  },
];

function loadGifts(): GiftIdea[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as GiftIdea[];
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function GiftJarPage() {
  const [gifts, setGifts] = useState<GiftIdea[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState<Owner>("sunny");
  const [recipient, setRecipient] = useState<Recipient>("felix");
  const [price, setPrice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setGifts(loadGifts());
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
    } catch (e) {
      console.warn("[giftjar] storage write failed", e);
    }
  }, [gifts, hydrated]);

  const resetForm = () => {
    setTitle("");
    setNote("");
    setPrice("");
    setTags([]);
    setTagInput("");
    setOwner("sunny");
    setRecipient("felix");
    setEditingId(null);
  };

  const startAdd = () => {
    resetForm();
    setOpen(true);
  };

  const startEdit = (g: GiftIdea) => {
    setEditingId(g.id);
    setTitle(g.title);
    setNote(g.note || "");
    setPrice(g.price || "");
    setTags(g.tags);
    setOwner(g.owner);
    setRecipient(g.recipient);
    setOpen(true);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const save = () => {
    const v = title.trim();
    if (!v) return;
    if (editingId) {
      setGifts((prev) =>
        prev.map((g) =>
          g.id === editingId
            ? {
                ...g,
                title: v,
                note: note.trim() || undefined,
                owner,
                recipient,
                price: price.trim() || undefined,
                tags,
              }
            : g,
        ),
      );
    } else {
      setGifts((prev) => [
        {
          id: crypto.randomUUID(),
          owner,
          recipient,
          title: v,
          note: note.trim() || undefined,
          price: price.trim() || undefined,
          tags,
          given: false,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    }
    setOpen(false);
    resetForm();
  };

  const remove = (id: string) => setGifts((prev) => prev.filter((g) => g.id !== id));

  const markGiven = (id: string) =>
    setGifts((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, given: true, givenAt: Date.now() } : g,
      ),
    );

  const unmarkGiven = (id: string) =>
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, given: false, givenAt: undefined } : g)));

  const visible = gifts
    .filter((g) => {
      if (filter === "all") return true;
      if (filter === "given") return g.given;
      // recipient filter
      return (g.recipient === filter || g.recipient === "both") && !g.given;
    })
    .sort((a, b) => {
      if (a.given !== b.given) return a.given ? 1 : -1; // undone first
      return b.createdAt - a.createdAt;
    });

  const stats = {
    total: gifts.length,
    given: gifts.filter((g) => g.given).length,
    forSunny: gifts.filter((g) => (g.recipient === "sunny" || g.recipient === "both") && !g.given).length,
    forFelix: gifts.filter((g) => (g.recipient === "felix" || g.recipient === "both") && !g.given).length,
  };

  const filters: Array<{ key: Filter; label: string; count: number }> = [
    { key: "all", label: "全部", count: stats.total },
    { key: "sunny", label: "🌸 给 Sunny", count: stats.forSunny },
    { key: "felix", label: "🌊 给 Felix", count: stats.forFelix },
    { key: "given", label: "✓ 已送出", count: stats.given },
  ];

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-6 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-rose/80">our gift jar</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl text-wine">
          Gift <span className="italic text-rose">Jar</span>
        </h1>
        <p className="mt-5 font-script text-2xl text-wine/70">
          把想送的惊喜，悄悄藏进罐子里 ♡
        </p>
      </section>

      {/* Add button + Filters */}
      <section className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center gap-5">
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm text-primary-foreground shadow-md transition hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            放入一个新心愿
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
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
        </div>
      </section>

      {/* Jar Grid */}
      <section className="mx-auto max-w-4xl px-6 py-12 pb-32">
        {visible.length === 0 ? (
          <div className="py-20 text-center font-script text-2xl text-muted-foreground">
            罐子里还空空的，放入第一个心愿吧 ♡
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {visible.map((g) => (
                <GiftCard
                  key={g.id}
                  gift={g}
                  onEdit={() => startEdit(g)}
                  onRemove={() => remove(g.id)}
                  onMarkGiven={() => markGiven(g.id)}
                  onUnmark={() => unmarkGiven(g.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Dialog */}
      <AnimatePresence>
        {open && (
          <GiftDialog
            title={title}
            note={note}
            owner={owner}
            recipient={recipient}
            price={price}
            tags={tags}
            tagInput={tagInput}
            editing={!!editingId}
            onTitleChange={setTitle}
            onNoteChange={setNote}
            onOwnerChange={setOwner}
            onRecipientChange={setRecipient}
            onPriceChange={setPrice}
            onTagInputChange={setTagInput}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onSave={save}
            onClose={() => {
              setOpen(false);
              resetForm();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------- GiftCard -------------------------------- */

function GiftCard({
  gift: g,
  onEdit,
  onRemove,
  onMarkGiven,
  onUnmark,
}: {
  gift: GiftIdea;
  onEdit: () => void;
  onRemove: () => void;
  onMarkGiven: () => void;
  onUnmark: () => void;
}) {
  const m = ownerMeta[g.owner];
  const isSunnyOwner = g.owner === "sunny";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={`relative rounded-3xl border p-5 shadow-[0_10px_30px_-15px_oklch(0.4_0.08_30/0.35)] transition hover:-translate-y-1 ${
        g.given
          ? "bg-muted/40 border-border opacity-70"
          : `bg-gradient-to-br ${m.gradient} ${m.border}`
      }`}
    >
      {/* owner avatar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`grid h-8 w-8 place-items-center rounded-full bg-cream text-sm ring-2 ${m.ring}`}
          >
            {m.emoji}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-wine/60">
            {m.name} 藏的
          </span>
        </div>
        {g.given && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2 py-0.5 text-[10px] font-medium text-emerald">
            <PackageOpen className="h-3 w-3" />
            已送出
          </span>
        )}
      </div>

      {/* recipient */}
      <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-wine/50">
        <span className={`h-2 w-2 rounded-full ${recipientDot[g.recipient]}`} />
        {recipientLabel[g.recipient]}
      </div>

      {/* title */}
      <h3 className={`font-display text-xl leading-snug ${g.given ? "text-muted-foreground line-through" : "text-wine"}`}>
        {g.title}
      </h3>

      {/* note */}
      {g.note && (
        <p className={`mt-2 font-script text-base leading-snug ${g.given ? "text-muted-foreground/70" : "text-wine/75"}`}>
          {g.note}
        </p>
      )}

      {/* tags + price */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {g.price && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${m.badgeBg} ${m.badgeText}`}>
            <Tag className="h-3 w-3" />
            {g.price}
          </span>
        )}
        {g.tags.map((t) => (
          <span
            key={t}
            className={`rounded-full px-2 py-0.5 text-[10px] ${m.badgeBg} ${m.badgeText}`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* date */}
      <div className="mt-3 text-[10px] tracking-widest text-wine/40">
        放入于 {fmtDate(g.createdAt)}
        {g.givenAt && ` · 送出于 ${fmtDate(g.givenAt)}`}
      </div>

      {/* actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {g.given ? (
          <button
            onClick={onUnmark}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] transition ${m.chip} hover:scale-105`}
          >
            <X className="h-3 w-3" />
            取消送出
          </button>
        ) : (
          <button
            onClick={onMarkGiven}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] transition ${m.chip} hover:scale-105`}
          >
            <Gift className="h-3 w-3" />
            标记已送
          </button>
        )}
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-full bg-background/60 border border-border px-2.5 py-1 text-[10px] text-muted-foreground hover:text-wine transition"
        >
          <Pencil className="h-3 w-3" />
          编辑
        </button>
        <button
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-full bg-background/60 border border-border px-2.5 py-1 text-[10px] text-muted-foreground hover:text-destructive hover:border-destructive/40 transition"
        >
          <Trash2 className="h-3 w-3" />
          删除
        </button>
      </div>
    </motion.div>
  );
}

/* -------------------------------- Dialog -------------------------------- */

function GiftDialog({
  title,
  note,
  owner,
  recipient,
  price,
  tags,
  tagInput,
  editing,
  onTitleChange,
  onNoteChange,
  onOwnerChange,
  onRecipientChange,
  onPriceChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onSave,
  onClose,
}: {
  title: string;
  note: string;
  owner: Owner;
  recipient: Recipient;
  price: string;
  tags: string[];
  tagInput: string;
  editing: boolean;
  onTitleChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onOwnerChange: (v: Owner) => void;
  onRecipientChange: (v: Recipient) => void;
  onPriceChange: (v: string) => void;
  onTagInputChange: (v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (t: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
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
        className="w-full max-w-lg rounded-3xl border border-rose/20 bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-rose">
            <Sparkles className="h-3.5 w-3.5" />
            {editing ? "编辑心愿" : "放入心愿罐子"}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-wine"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* owner */}
        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground">
          谁藏的
        </label>
        <div className="mt-1.5 inline-flex rounded-full bg-muted/60 p-1">
          {(["sunny", "felix"] as Owner[]).map((o) => {
            const active = owner === o;
            const m = ownerMeta[o];
            return (
              <button
                key={o}
                onClick={() => onOwnerChange(o)}
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

        {/* recipient */}
        <label className="mt-4 block text-[10px] uppercase tracking-widest text-muted-foreground">
          送给谁
        </label>
        <div className="mt-1.5 inline-flex rounded-full bg-muted/60 p-1">
          {(["sunny", "felix", "both"] as Recipient[]).map((r) => {
            const active = recipient === r;
            return (
              <button
                key={r}
                onClick={() => onRecipientChange(r)}
                className={`px-4 py-1.5 text-sm rounded-full transition ${
                  active ? "bg-cream shadow text-wine" : "text-muted-foreground hover:text-wine"
                }`}
              >
                {recipientLabel[r]}
              </button>
            );
          })}
        </div>

        {/* title */}
        <label className="mt-4 block text-[10px] uppercase tracking-widest text-muted-foreground">
          礼物名称
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          placeholder="例如：手工编织的围巾"
          className="mt-1.5 w-full rounded-2xl border border-rose/20 bg-background/70 px-4 py-2.5 text-sm outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20"
        />

        {/* note */}
        <label className="mt-4 block text-[10px] uppercase tracking-widest text-muted-foreground">
          备注（可选）
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={2}
          placeholder="链接、店铺、或者一点小提醒…"
          className="mt-1.5 w-full resize-none rounded-2xl border border-rose/20 bg-background/70 px-4 py-3 text-sm font-script text-wine outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20"
        />

        {/* price */}
        <label className="mt-4 block text-[10px] uppercase tracking-widest text-muted-foreground">
          预算范围（可选）
        </label>
        <input
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder="例如：200-300"
          className="mt-1.5 w-full rounded-2xl border border-rose/20 bg-background/70 px-4 py-2.5 text-sm outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20"
        />

        {/* tags */}
        <label className="mt-4 block text-[10px] uppercase tracking-widest text-muted-foreground">
          标签
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddTag();
              }
            }}
            placeholder="按回车添加标签"
            className="flex-1 rounded-2xl border border-rose/20 bg-background/70 px-4 py-2 text-sm outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20"
          />
          <button
            onClick={onAddTag}
            className="rounded-full bg-rose/10 px-3 py-2 text-sm text-rose hover:bg-rose/20 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-rose/10 px-2.5 py-0.5 text-xs text-rose"
              >
                {t}
                <button onClick={() => onRemoveTag(t)} className="hover:text-wine">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-wine"
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={!title.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose px-5 py-2 text-sm text-primary-foreground shadow-md hover:scale-[1.02] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Heart className="h-4 w-4" />
            {editing ? "保存" : "放入罐子 ♡"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
