import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Sparkles, Camera, MapPin, Gift } from "lucide-react";

export function PublicHero() {
  const features = [
    {
      icon: Heart,
      title: "纪念日计时",
      text: "把那个最重要的日子留在屏幕上，每一秒都在数着你。",
    },
    {
      icon: Camera,
      title: "拍立得照片墙",
      text: "把走过的城市、吃过的甜，全部贴成一张张可翻转的拍立得。",
    },
    {
      icon: MapPin,
      title: "旅行时光轴",
      text: "按时间排好的合照与碎碎念，回看时像在重新一起出发。",
    },
    {
      icon: Gift,
      title: "心愿单 & 礼物罐",
      text: "悄悄记下想送的礼物、想一起做的事，等对方拆开。",
    },
  ];

  return (
    <main className="relative">
      {/* HERO */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-rose/80"
        >
          <Sparkles className="h-3.5 w-3.5" />
          a love journal for two
          <Sparkles className="h-3.5 w-3.5" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="mt-6 font-display text-6xl md:text-8xl font-medium text-wine leading-[0.95]"
        >
          属于你们的 <span className="italic text-rose">电子手账</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 max-w-xl font-script text-2xl text-wine/70"
        >
          一本只属于你们俩的小书 —— 记下纪念日、贴上合照、写下心愿，慢慢翻，慢慢爱。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex items-center gap-3"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm uppercase tracking-widest text-cream shadow-[0_20px_50px_-20px_oklch(0.6_0.18_20/0.7)] hover:bg-rose/90 transition"
          >
            <Heart className="h-4 w-4 fill-cream" />
            开始我们的故事
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-cream/60 px-6 py-3 text-sm uppercase tracking-widest text-wine hover:bg-cream transition"
          >
            登录
          </Link>
        </motion.div>

        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          免费 · 两个人的私密空间
        </p>
      </section>

      {/* DIVIDER */}
      <div className="mx-auto flex max-w-3xl items-center gap-6 px-6">
        <span className="h-px flex-1 bg-rose/30" />
        <Heart className="h-4 w-4 fill-rose text-rose" />
        <span className="font-script text-2xl text-wine/70">what's inside</span>
        <Heart className="h-4 w-4 fill-rose text-rose" />
        <span className="h-px flex-1 bg-rose/30" />
      </div>

      {/* FEATURES */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-rose/20 bg-card/70 backdrop-blur-sm p-7 shadow-[0_20px_60px_-30px_oklch(0.4_0.1_20/0.3)]"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose/10 blur-2xl transition group-hover:bg-rose/20" />
              <f.icon className="h-6 w-6 text-rose" />
              <h3 className="mt-4 font-display text-2xl text-wine">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-wine/70">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-display text-4xl md:text-5xl text-wine">
          准备好为<span className="italic text-rose">「我们」</span>开一本了吗？
        </h2>
        <p className="mt-4 font-script text-2xl text-wine/70">
          注册 → 邀请 ta → 一起写下第一页。
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose px-7 py-3 text-sm uppercase tracking-widest text-cream shadow-[0_20px_50px_-20px_oklch(0.6_0.18_20/0.7)] hover:bg-rose/90 transition"
        >
          <Heart className="h-4 w-4 fill-cream" />
          立即开始
        </Link>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-12 text-center">
        <div className="font-script text-2xl text-rose">— Time of Us —</div>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          kept with love
        </p>
      </footer>
    </main>
  );
}
