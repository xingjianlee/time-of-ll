import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  Bell,
  Check,
  X,
  Gift,
  Star,
  Camera,
  Cake,
  Users,
  CheckCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Petals } from "@/components/Petals";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "收信箱 · Time of Us" },
      { name: "description", content: "情侣绑定邀请、纪念日提醒与近期更新。" },
    ],
  }),
  component: InboxPage,
});

type NotifType =
  | "couple_invite"
  | "anniversary_milestone"
  | "wish_added"
  | "wish_completed"
  | "gift_added"
  | "gift_given"
  | "photo_added"
  | "timeline_added";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  actor?: string;
  createdAt: string;
  read: boolean;
}

const MOCK: Notif[] = [
  {
    id: "n1",
    type: "couple_invite",
    title: "Felix 邀请你绑定为情侣",
    body: "felix@example.com 想和你共享一本手账。",
    actor: "Felix",
    createdAt: "刚刚",
    read: false,
  },
  {
    id: "n2",
    type: "anniversary_milestone",
    title: "🎉 在一起 100 天啦",
    body: "今天是你们在一起的第 100 天，去主页看看时间吧。",
    createdAt: "今天",
    read: false,
  },
  {
    id: "n3",
    type: "wish_added",
    title: "Felix 在心愿单加了一条",
    body: "「一起去看一次海边日落」",
    actor: "Felix",
    createdAt: "昨天",
    read: true,
  },
  {
    id: "n4",
    type: "gift_given",
    title: "礼物罐：一条已送出",
    body: "Felix 标记了「手写信」为已送出。",
    actor: "Felix",
    createdAt: "3 天前",
    read: true,
  },
  {
    id: "n5",
    type: "photo_added",
    title: "Sunny 新贴了一张拍立得",
    body: "「在京都吃到的抹茶冰激凌」",
    actor: "Sunny",
    createdAt: "上周",
    read: true,
  },
];

const ICONS: Record<NotifType, React.ComponentType<{ className?: string }>> = {
  couple_invite: Users,
  anniversary_milestone: Cake,
  wish_added: Star,
  wish_completed: Check,
  gift_added: Gift,
  gift_given: Gift,
  photo_added: Camera,
  timeline_added: Camera,
};

function InboxPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <Petals />
        <div className="relative z-10">
          <SiteHeader />
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <h1 className="font-display text-3xl text-wine">需要先登录</h1>
            <p className="mt-3 text-sm text-wine/70">收信箱需要登录后查看。</p>
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

  const [items, setItems] = useState<Notif[]>(MOCK);
  const unread = items.filter((n) => !n.read).length;

  const markAll = () => setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) =>
    setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const dismiss = (id: string) =>
    setItems((arr) => arr.filter((n) => n.id !== id));

  const handleInvite = (id: string, accept: boolean) => {
    markOne(id);
    // Phase 2 会写库；这里只做视觉反馈
    setItems((arr) =>
      arr.map((n) =>
        n.id === id
          ? {
              ...n,
              title: accept ? "已接受邀请 ♡" : "已拒绝邀请",
              body: accept
                ? "你们已成为情侣，去主页看看吧。"
                : "已通知对方。",
              type: "anniversary_milestone",
            }
          : n,
      ),
    );
  };

  return (
    <div className="relative min-h-screen">
      <Petals />
      <div className="relative z-10">
        <SiteHeader />

        <div className="mx-auto max-w-2xl px-6 pb-24">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-rose/80">
              <Heart className="h-3.5 w-3.5 fill-rose text-rose" />
              inbox
              <Heart className="h-3.5 w-3.5 fill-rose text-rose" />
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl text-wine">
              收信箱
            </h1>
            <p className="mt-2 font-script text-xl text-wine/60">
              {unread > 0 ? `你有 ${unread} 条未读 ♡` : "全部已读 ♡"}
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-sm text-wine/70">
              <Bell className="h-4 w-4 text-rose" />
              全部通知 · {items.length}
            </div>
            <button
              onClick={markAll}
              disabled={unread === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-cream/60 px-3 py-1 text-xs uppercase tracking-widest text-rose hover:bg-cream disabled:opacity-40"
            >
              <CheckCheck className="h-3 w-3" />
              全部已读
            </button>
          </div>

          <div className="space-y-3">
            {items.length === 0 && (
              <div className="rounded-3xl border border-rose/20 bg-card/70 p-10 text-center text-wine/60">
                还没有任何通知 🤍
              </div>
            )}

            {items.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <div
                  key={n.id}
                  className={`group relative flex gap-4 rounded-2xl border p-5 backdrop-blur-sm transition ${
                    n.read
                      ? "border-rose/15 bg-card/50"
                      : "border-rose/40 bg-card/80 shadow-[0_15px_40px_-25px_oklch(0.4_0.1_20/0.3)]"
                  }`}
                >
                  {!n.read && (
                    <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-rose" />
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose/10 text-rose">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-lg text-wine">{n.title}</h3>
                      <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
                        {n.createdAt}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-wine/70">{n.body}</p>

                    {n.type === "couple_invite" && !n.read && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleInvite(n.id, true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-1.5 text-xs uppercase tracking-widest text-cream hover:bg-rose/90"
                        >
                          <Check className="h-3 w-3" />
                          同意
                        </button>
                        <button
                          onClick={() => handleInvite(n.id, false)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-cream/60 px-4 py-1.5 text-xs uppercase tracking-widest text-wine hover:bg-cream"
                        >
                          <X className="h-3 w-3" />
                          拒绝
                        </button>
                      </div>
                    )}

                    <div className="mt-3 flex gap-3 text-xs uppercase tracking-widest">
                      {!n.read && (
                        <button
                          onClick={() => markOne(n.id)}
                          className="text-rose hover:underline"
                        >
                          标记已读
                        </button>
                      )}
                      <button
                        onClick={() => dismiss(n.id)}
                        className="text-wine/50 hover:text-rose"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            * 当前为静态预览，通知数据将在 Phase 2 接入。
          </p>
        </div>
      </div>
    </div>
  );
}
