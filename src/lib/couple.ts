import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/* ---------------- Types ---------------- */

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
}

export interface Couple {
  id: string;
  name_a: string;
  name_b: string;
  anniversary: string | null; // YYYY-MM-DD
  slogan: string;
  created_at: string;
}

export type NotificationType =
  | "couple_invite"
  | "couple_invite_accepted"
  | "couple_invite_declined"
  | "anniversary_milestone"
  | "wish_added"
  | "wish_completed"
  | "gift_added"
  | "gift_given"
  | "photo_added"
  | "timeline_added"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface InviteOut {
  id: string;
  to_email: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  created_at: string;
  responded_at: string | null;
}

/* ---------------- useProfile ---------------- */

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id,display_name,avatar_url,email")
      .eq("id", user.id)
      .maybeSingle();
    if (error) console.warn("[profile] load", error);
    setProfile((data as Profile | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const update = useCallback(
    async (patch: Partial<Pick<Profile, "display_name" | "avatar_url">>) => {
      if (!user) return;
      const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
      if (error) console.warn("[profile] update", error);
      await reload();
    },
    [user, reload],
  );

  return { profile, loading, update, reload };
}

/* ---------------- useCouple ---------------- */

export function useCouple() {
  const { user } = useAuth();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setCouple(null);
      setLoading(false);
      return;
    }
    // current_couple_id() via RLS: just select all visible couples and take the first active one
    const { data: members } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);
    const couple_id = members?.[0]?.couple_id;
    if (!couple_id) {
      setCouple(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("couples")
      .select("id,name_a,name_b,anniversary,slogan,created_at")
      .eq("id", couple_id)
      .maybeSingle();
    if (error) console.warn("[couple] load", error);
    setCouple((data as Couple | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const update = useCallback(
    async (patch: Partial<Pick<Couple, "name_a" | "name_b" | "anniversary" | "slogan">>) => {
      if (!couple) return { error: "no couple" };
      const { error } = await supabase.from("couples").update(patch).eq("id", couple.id);
      if (error) {
        console.warn("[couple] update", error);
        return { error: error.message };
      }
      await reload();
      return {};
    },
    [couple, reload],
  );

  const sendInvite = useCallback(async (email: string, message = "") => {
    const { data, error } = await supabase.rpc("send_couple_invite", {
      p_email: email,
      p_message: message,
    });
    if (error) return { error: error.message };
    return { id: data as string };
  }, []);

  const unbind = useCallback(async () => {
    const { error } = await supabase.rpc("unbind_couple");
    if (error) return { error: error.message };
    await reload();
    return {};
  }, [reload]);

  return { couple, loading, update, sendInvite, unbind, reload };
}

/* ---------------- useInbox ---------------- */

export function useInbox() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("notifications")
      .select("id,type,title,body,payload,action_url,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) console.warn("[inbox] load", error);
    setItems(((data as Notification[] | null) ?? []) as Notification[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void reload();
    if (!user) return;
    // realtime
    const ch = supabase
      .channel(`notif:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => void reload(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [user, reload]);

  const unread = items.filter((n) => !n.read_at).length;

  const markRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    await reload();
  }, [reload]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    await reload();
  }, [user, reload]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    await reload();
  }, [reload]);

  const acceptInvite = useCallback(async (inviteId: string) => {
    const { error } = await supabase.rpc("accept_couple_invite", { p_invite: inviteId });
    if (error) return { error: error.message };
    await reload();
    return {};
  }, [reload]);

  const declineInvite = useCallback(async (inviteId: string) => {
    const { error } = await supabase.rpc("decline_couple_invite", { p_invite: inviteId });
    if (error) return { error: error.message };
    await reload();
    return {};
  }, [reload]);

  return { items, unread, loading, markRead, markAllRead, remove, acceptInvite, declineInvite, reload };
}

/* ---------------- useOutgoingInvites ---------------- */

export function useOutgoingInvites() {
  const { user } = useAuth();
  const [items, setItems] = useState<InviteOut[]>([]);

  const reload = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const { data } = await supabase
      .from("couple_invites")
      .select("id,to_email,status,created_at,responded_at")
      .eq("from_user", user.id)
      .order("created_at", { ascending: false });
    setItems((data as InviteOut[] | null) ?? []);
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);

  const cancel = useCallback(async (id: string) => {
    await supabase.from("couple_invites").update({ status: "cancelled" }).eq("id", id);
    await reload();
  }, [reload]);

  return { items, cancel, reload };
}
