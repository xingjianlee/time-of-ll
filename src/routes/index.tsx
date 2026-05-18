import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Pencil, Sparkles, Check, Users } from "lucide-react";
import { AnniversaryCounter } from "@/components/AnniversaryCounter";
import { PolaroidWall } from "@/components/PolaroidWall";
import { Petals } from "@/components/Petals";
import { SiteHeader } from "@/components/SiteHeader";
import { JournalEditor } from "@/components/JournalEditor";
import { PublicHero } from "@/components/PublicHero";
import { usePhotos, type PhotoItem } from "@/lib/journal";
import { useAuth } from "@/lib/auth";
import { useCouple, useProfile } from "@/lib/couple";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Time of Us · 情侣的电子手账" },
      {
        name: "description",
        content: "属于你们的浪漫电子手账：纪念日实时计时、拍立得照片墙与旅行时光轴。",
      },
      { property: "og:title", content: "Time of Us · 情侣的电子手账" },
      { property: "og:description", content: "纪念日计时 · 拍立得照片墙 · 旅行时光轴。" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { couple, loading: coupleLoading } = useCouple();
  const canEdit = !!user && !!couple;
  const { items, add, update, remove } = usePhotos();
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<PhotoItem | null>(null);
  const [creating, setCreating] = useState(false);

  // 未登录 → Hero
  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <Petals />
        <div className="relative z-10">
          <SiteHeader />
          <PublicHero />
        </div>
      </div>
    );
  }

  // 已登录但还没绑定情侣 → 引导
  if (!coupleLoading && !couple) {
    const name = profile?.display_name || user.email?.split("@")[0] || "你";
    return (
      <div className="relative min-h-screen overflow-hidden">
        <Petals />
        <div className="relative z-10">
          <SiteHeader />
          <section className="mx-auto flex max-w-2xl flex-col items-center px-6 pt-24 pb-24 text-center">
            <Users className="h-10 w-10 text-rose" />
            <h1 className="mt-6 font-display text-5xl text-wine">Welcome, {name} ♡</h1>
            <p className="mt-5 text-wine/70">
              你还没有绑定情侣，去设置页发送一封邀请，开始你们的手账吧。
            </p>
            <Link
              to="/settings"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm uppercase tracking-widest text-cream hover:bg-rose/90"
            >
              去绑定情侣
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const nameA = couple?.name_a || "A";
  const nameB = couple?.name_b || "B";
  const anniversary = couple?.anniversary || "";
  const slogan =
    couple?.slogan ||
    "把走过的城市、吃过的甜、笑过的瞬间，全部贴进这本只属于我们的手账。";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Petals />
      <div className="relative z-10">
        <SiteHeader />

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
            Time of <span className="italic text-rose">{nameA} &amp; {nameB}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-5 max-w-xl font-script text-2xl text-wine/70"
          >
            {slogan}
          </motion.p>

          {anniversary && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-14"
            >
              <AnniversaryCounter startDate={anniversary} />
            </motion.div>
          )}
          {!anniversary && (
            <Link
              to="/settings"
              className="mt-10 text-sm text-rose underline-offset-4 hover:underline"
            >
              在设置中填入你们的纪念日 →
            </Link>
          )}
        </section>

        <div className="mx-auto flex max-w-3xl items-center gap-6 px-6">
          <span className="h-px flex-1 bg-rose/30" />
          <Heart className="h-4 w-4 fill-rose text-rose" />
          <span className="font-script text-2xl text-wine/70">our polaroids</span>
          <Heart className="h-4 w-4 fill-rose text-rose" />
          <span className="h-px flex-1 bg-rose/30" />
        </div>

        <section className="relative py-20">
          <div className="mb-10 px-6 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-wine">Polaroid Wall</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              点击翻转看背面 · 双击放大查看
            </p>
            {canEdit && (
              <button
                onClick={() => setEditMode((v) => !v)}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-rose/40 bg-cream/70 px-4 py-1.5 text-xs uppercase tracking-widest text-rose hover:bg-cream"
              >
                {editMode ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                {editMode ? "完成" : "编辑模式"}
              </button>
            )}
          </div>
          <PolaroidWall
            photos={items}
            editable={canEdit && editMode}
            onAdd={() => setCreating(true)}
            onEdit={(p) => setEditing(p)}
            onDelete={(p) => void remove(p.id)}
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
              void update(editing.id, data as Partial<PhotoItem>);
            } else {
              void add(data as Omit<PhotoItem, "id">);
            }
          }}
        />

        <footer className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="font-script text-3xl text-rose">— {nameA} &amp; {nameB} —</div>
          {anniversary && (
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              kept with love · since {anniversary}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
