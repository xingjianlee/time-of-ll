import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Polaroid } from "@/components/Polaroid";
import { timeline } from "@/data/photos";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "旅行时光轴 · Time of L&L" },
      {
        name: "description",
        content: "L&L 共同走过的城市与故事，一条慢慢生长的浪漫时光轴。",
      },
      { property: "og:title", content: "旅行时光轴 · Time of L&L" },
      {
        property: "og:description",
        content: "L&L 共同走过的城市与故事。",
      },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 pt-6 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-rose/80">our journey</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl text-wine">
          Travel Timeline
        </h1>
        <p className="mt-5 font-script text-2xl text-wine/70">
          一条慢慢生长的小路，每一颗心都是我们去过的地方。
        </p>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 pb-32">
        {/* central spine */}
        <div className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-rose/40 to-transparent md:left-1/2 md:-translate-x-1/2" />

        <div className="space-y-20">
          {timeline.map((entry, i) => {
            const right = i % 2 === 1;
            return (
              <motion.div
                key={entry.title + i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`relative grid grid-cols-[3rem_1fr] gap-4 md:grid-cols-2 md:gap-12 ${
                  right ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* node */}
                <div className="absolute left-6 top-6 -translate-x-1/2 md:left-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-rose/30 animate-ping" />
                    <div className="relative grid h-9 w-9 place-items-center rounded-full bg-cream border border-rose/40 shadow-md">
                      <Heart className="h-4 w-4 fill-rose text-rose animate-heartbeat" />
                    </div>
                  </div>
                </div>

                {/* image side */}
                <div className={`flex justify-center md:justify-${right ? "start" : "end"} pl-12 md:pl-0`}>
                  <Polaroid photo={entry} size="md" />
                </div>

                {/* text side */}
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
                  <p className="mt-4 leading-relaxed text-wine/75">
                    {entry.story}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* end marker */}
        <div className="relative mt-24 flex justify-center md:justify-center">
          <div className="font-script text-2xl text-rose">to be continued ♡</div>
        </div>
      </section>
    </div>
  );
}
