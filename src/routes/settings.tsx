import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  User as UserIcon,
  Users,
  Calendar,
  Mail,
  Send,
  Unlink,
  LogOut,
  Trash2,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Petals } from "@/components/Petals";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "设置 · Time of Us" },
      { name: "description", content: "管理个人资料、情侣绑定与首页文案。" },
    ],
  }),
  component: SettingsPage,
});

// ----- Phase 1: mock data only -----
type BindingStatus = "unbound" | "pending_out" | "pending_in" | "bound";

function SettingsPage() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  // 未登录时引导去登录
  if (!user) {
    return (
      <div className="relative min-h-screen">
        <Petals />
        <div className="relative z-10">
          <SiteHeader />
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <h1 className="font-display text-3xl text-wine">需要先登录</h1>
            <p className="mt-3 text-sm text-wine/70">设置页需要登录后查看。</p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm text-cream hover:bg-rose/90"
            >
              去登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // mock state（Phase 2 接 DB）
  const [displayName, setDisplayName] = useState("Sunny");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [binding, setBinding] = useState<BindingStatus>("bound");
  const [nameA, setNameA] = useState("Sunny");
  const [nameB, setNameB] = useState("Felix");
  const [anniversary, setAnniversary] = useState("2026-02-24");
  const [slogan, setSlogan] = useState(
    "把走过的城市、吃过的甜、笑过的瞬间，全部贴进这本只属于我们的手账。",
  );

  const Card = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
  }) => (
    <section className="rounded-3xl border border-rose/20 bg-card/70 backdrop-blur-sm p-7 shadow-[0_20px_60px_-30px_oklch(0.4_0.1_20/0.3)]">
      <h2 className="mb-5 flex items-center gap-2 font-display text-2xl text-wine">
        <Icon className="h-5 w-5 text-rose" />
        {title}
      </h2>
      {children}
    </section>
  );

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-wine/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );

  const input =
    "w-full rounded-lg border border-wine/15 bg-white/70 px-3 py-2 text-wine outline-none focus:border-rose";

  return (
    <div className="relative min-h-screen">
      <Petals />
      <div className="relative z-10">
        <SiteHeader />

        <div className="mx-auto max-w-3xl px-6 pb-24">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-rose/80">
              <Heart className="h-3.5 w-3.5 fill-rose text-rose" />
              settings
              <Heart className="h-3.5 w-3.5 fill-rose text-rose" />
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl text-wine">设置</h1>
            <p className="mt-2 font-script text-xl text-wine/60">
              管理你们的小空间 ♡
            </p>
          </div>

          <div className="space-y-6">
            {/* 个人信息 */}
            <Card title="个人信息" icon={UserIcon}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="昵称">
                  <input
                    className={input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </Field>
                <Field label="邮箱（不可修改）">
                  <input className={input + " opacity-60"} value={user.email ?? ""} readOnly />
                </Field>
              </div>
              <div className="mt-5 flex justify-end">
                <button className="rounded-full bg-rose px-5 py-2 text-sm text-cream hover:bg-rose/90">
                  保存
                </button>
              </div>
            </Card>

            {/* 情侣绑定 */}
            <Card title="情侣绑定" icon={Users}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose/10 px-3 py-1 text-xs uppercase tracking-widest text-rose">
                当前状态：
                {binding === "unbound" && "未绑定"}
                {binding === "pending_out" && "已发送邀请，等待对方"}
                {binding === "pending_in" && "对方邀请你，去收信箱处理"}
                {binding === "bound" && `已绑定 ♡ ${nameB}`}
              </div>

              {binding !== "bound" && (
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="flex-1">
                    <Field label="对方邮箱">
                      <input
                        className={input}
                        type="email"
                        placeholder="partner@example.com"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                      />
                    </Field>
                  </div>
                  <button
                    onClick={() => setBinding("pending_out")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-rose px-5 py-2 text-sm text-cream hover:bg-rose/90"
                  >
                    <Send className="h-3.5 w-3.5" />
                    发送邀请
                  </button>
                </div>
              )}

              {binding === "bound" && (
                <button
                  onClick={() => setBinding("unbound")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose/40 bg-cream/60 px-4 py-2 text-sm text-rose hover:bg-cream"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  解除绑定
                </button>
              )}
            </Card>

            {/* 情侣空间 */}
            <Card title="情侣空间" icon={Heart}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="名字 A">
                  <input className={input} value={nameA} onChange={(e) => setNameA(e.target.value)} />
                </Field>
                <Field label="名字 B">
                  <input className={input} value={nameB} onChange={(e) => setNameB(e.target.value)} />
                </Field>
                <Field label="纪念日">
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wine/40" />
                    <input
                      type="date"
                      className={input + " pl-9"}
                      value={anniversary}
                      onChange={(e) => setAnniversary(e.target.value)}
                    />
                  </div>
                </Field>
                <Field label="首页标题预览">
                  <div className={input + " bg-cream/40 italic"}>
                    Time of {nameA || "A"} & {nameB || "B"}
                  </div>
                </Field>
              </div>
              <div className="mt-4">
                <Field label="首页文案">
                  <textarea
                    className={input + " min-h-24"}
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                  />
                </Field>
              </div>
              <div className="mt-5 flex justify-end">
                <button className="rounded-full bg-rose px-5 py-2 text-sm text-cream hover:bg-rose/90">
                  保存到首页
                </button>
              </div>
            </Card>

            {/* 账号 */}
            <Card title="账号" icon={Mail}>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    await signOut();
                    nav({ to: "/" });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-cream/60 px-4 py-2 text-sm text-wine hover:bg-cream"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  退出登录
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive hover:bg-destructive/20"
                  title="该功能在 Phase 3 接入"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除账号
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                * 当前为静态预览，保存按钮还没有写入数据库（Phase 2 接入）。
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
