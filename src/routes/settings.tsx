import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Heart,
  User as UserIcon,
  Users,
  Calendar,
  Mail,
  Send,
  Unlink,
  LogOut,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Petals } from "@/components/Petals";
import { useAuth } from "@/lib/auth";
import { useCouple, useProfile, useOutgoingInvites } from "@/lib/couple";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "设置 · Time of Us" },
      { name: "description", content: "管理个人资料、情侣绑定与首页文案。" },
    ],
  }),
  component: SettingsPage,
});

const input =
  "w-full rounded-lg border border-wine/15 bg-white/70 px-3 py-2 text-wine outline-none focus:border-rose";

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-rose/20 bg-card/70 backdrop-blur-sm p-7 shadow-[0_20px_60px_-30px_oklch(0.4_0.1_20/0.3)]">
      <h2 className="mb-5 flex items-center gap-2 font-display text-2xl text-wine">
        <Icon className="h-5 w-5 text-rose" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-wine/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, update: updateProfile } = useProfile();
  const { couple, update: updateCouple, sendInvite, unbind } = useCouple();
  const { items: outgoing, cancel: cancelInvite } = useOutgoingInvites();
  const nav = useNavigate();

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <Petals />
        <div className="relative z-10">
          <SiteHeader />
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <h1 className="font-display text-3xl text-wine">需要先登录</h1>
            <Link to="/login" className="mt-6 inline-flex rounded-full bg-rose px-5 py-2.5 text-sm text-cream hover:bg-rose/90">
              去登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 个人信息 form state
  const [displayName, setDisplayName] = useState("");
  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  // 情侣空间 form state
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [slogan, setSlogan] = useState("");
  useEffect(() => {
    if (couple) {
      setNameA(couple.name_a);
      setNameB(couple.name_b);
      setAnniversary(couple.anniversary ?? "");
      setSlogan(couple.slogan);
    }
  }, [couple]);

  // 邀请
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string>("");

  const pendingOut = outgoing.find((i) => i.status === "pending");

  const onSaveProfile = async () => {
    setBusy(true);
    await updateProfile({ display_name: displayName.trim() });
    setBusy(false);
    setHint("已保存个人资料 ♡");
    setTimeout(() => setHint(""), 1800);
  };

  const onSaveCouple = async () => {
    if (!couple) return;
    setBusy(true);
    const r = await updateCouple({
      name_a: nameA.trim() || "A",
      name_b: nameB.trim() || "B",
      anniversary: anniversary || null,
      slogan: slogan.trim(),
    });
    setBusy(false);
    if (r.error) setHint("保存失败：" + r.error);
    else {
      setHint("已保存到首页 ♡");
      setTimeout(() => setHint(""), 1800);
    }
  };

  const onSendInvite = async () => {
    if (!partnerEmail.trim()) return;
    setBusy(true);
    const r = await sendInvite(partnerEmail.trim(), inviteMsg.trim());
    setBusy(false);
    if (r.error) setHint("发送失败：" + r.error);
    else {
      setHint("邀请已发送，等对方在收信箱接受 ♡");
      setPartnerEmail("");
      setInviteMsg("");
      setTimeout(() => setHint(""), 2400);
    }
  };

  const onUnbind = async () => {
    if (!confirm("确认解除当前情侣绑定？双方的数据会保留，但 RLS 将无法继续读写。")) return;
    setBusy(true);
    await unbind();
    setBusy(false);
    setHint("已解除绑定");
    setTimeout(() => setHint(""), 1800);
  };


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
            <p className="mt-2 font-script text-xl text-wine/60">管理你们的小空间 ♡</p>
            {hint && (
              <div className="mt-4 inline-block rounded-full bg-rose/10 px-4 py-1.5 text-xs text-rose">
                {hint}
              </div>
            )}
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
                <button
                  disabled={busy}
                  onClick={onSaveProfile}
                  className="rounded-full bg-rose px-5 py-2 text-sm text-cream hover:bg-rose/90 disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </Card>

            {/* 情侣绑定 */}
            <Card title="情侣绑定" icon={Users}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose/10 px-3 py-1 text-xs uppercase tracking-widest text-rose">
                当前状态：
                {couple
                  ? `已绑定 ♡ ${couple.name_a} & ${couple.name_b}`
                  : pendingOut
                  ? `已发送邀请到 ${pendingOut.to_email}，等待对方`
                  : "未绑定"}
              </div>

              {!couple && (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="对方邮箱">
                      <input
                        className={input}
                        type="email"
                        placeholder="partner@example.com"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                      />
                    </Field>
                    <Field label="附言（可选）">
                      <input
                        className={input}
                        placeholder="一起来记录我们的故事吧"
                        value={inviteMsg}
                        onChange={(e) => setInviteMsg(e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      disabled={busy || !partnerEmail.trim()}
                      onClick={onSendInvite}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose px-5 py-2 text-sm text-cream hover:bg-rose/90 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      发送邀请
                    </button>
                  </div>

                  {outgoing.length > 0 && (
                    <div className="mt-6">
                      <div className="text-xs uppercase tracking-widest text-wine/50 mb-2">
                        我发出的邀请
                      </div>
                      <div className="space-y-2">
                        {outgoing.map((i) => (
                          <div
                            key={i.id}
                            className="flex items-center justify-between rounded-lg border border-rose/15 bg-cream/40 px-3 py-2 text-sm"
                          >
                            <span className="truncate">
                              {i.to_email}
                              <span className="ml-2 text-xs text-wine/50">[{i.status}]</span>
                            </span>
                            {i.status === "pending" && (
                              <button
                                onClick={() => void cancelInvite(i.id)}
                                className="text-xs text-rose hover:underline inline-flex items-center gap-1"
                              >
                                <X className="h-3 w-3" />
                                撤回
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {couple && (
                <button
                  disabled={busy}
                  onClick={onUnbind}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose/40 bg-cream/60 px-4 py-2 text-sm text-rose hover:bg-cream disabled:opacity-50"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  解除绑定
                </button>
              )}
            </Card>

            {/* 情侣空间 */}
            {couple && (
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
                  <button
                    disabled={busy}
                    onClick={onSaveCouple}
                    className="rounded-full bg-rose px-5 py-2 text-sm text-cream hover:bg-rose/90 disabled:opacity-50"
                  >
                    保存到首页
                  </button>
                </div>
              </Card>
            )}

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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
