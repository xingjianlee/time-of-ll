import { createFileRoute, Link } from "@tanstack/react-router";
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
import { useInbox, type Notification, type NotificationType } from "@/lib/couple";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "收信箱 · Time of Us" },
      { name: "description", content: "情侣绑定邀请、纪念日提醒与近期更新。" },
    ],
  }),
  component: InboxPage,
});

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  couple_invite: Users,
  couple_invite_accepted: Heart,
  couple_invite_declined: X,
  anniversary_milestone: Cake,
  wish_added: Star,
  wish_completed: Check,
  gift_added: Gift,
  gift_given: Gift,
  photo_added: Camera,
  timeline_added: Camera,
  system: Bell,
};

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

function InboxPage() {
  const { user } = useAuth();
  const {
    items,
    unread,
    markRead,
    markAllRead,
    remove,
    acceptInvite,
    declineInvite,
  } = useInbox();

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

  const handleInvite = async (n: Notification, accept: boolean) => {
    const inviteId = (n.payload as { invite_id?: string })?.invite_id;
    if (!inviteId) {
      await markRead(n.id);
      return;
    }
    const r = accept ? await acceptInvite(inviteId) : await declineInvite(inviteId);
    if (r.error) alert(r.error);
    await markRead(n.id);
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
            <h1 className="mt-3 font-display text-4xl md:text-5xl text-wine">收信箱</h1>
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
              onClick={() => void markAllRead()}
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
              const Icon = ICONS[n.type] ?? Bell;
              const read = !!n.read_at;
              return (
                <div
                  key={n.id}
                  className={`group relative flex gap-4 rounded-2xl border p-5 backdrop-blur-sm transition ${
                    read
                      ? "border-rose/15 bg-card/50"
                      : "border-rose/40 bg-card/80 shadow-[0_15px_40px_-25px_oklch(0.4_0.1_20/0.3)]"
                  }`}
                >
                  {!read && (
                    <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-rose" />
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose/10 text-rose">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-lg text-wine">{n.title}</h3>
                      <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.body && <p className="mt-1 text-sm text-wine/70">{n.body}</p>}

                    {n.type === "couple_invite" && !read && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => void handleInvite(n, true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-1.5 text-xs uppercase tracking-widest text-cream hover:bg-rose/90"
                        >
                          <Check className="h-3 w-3" />
                          同意
                        </button>
                        <button
                          onClick={() => void handleInvite(n, false)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-cream/60 px-4 py-1.5 text-xs uppercase tracking-widest text-wine hover:bg-cream"
                        >
                          <X className="h-3 w-3" />
                          拒绝
                        </button>
                      </div>
                    )}

                    <div className="mt-3 flex gap-3 text-xs uppercase tracking-widest">
                      {!read && (
                        <button onClick={() => void markRead(n.id)} className="text-rose hover:underline">
                          标记已读
                        </button>
                      )}
                      <button onClick={() => void remove(n.id)} className="text-wine/50 hover:text-rose">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
