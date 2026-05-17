import { useCallback, useEffect, useState } from "react";
import { supabase, ownerForEmail, type Owner } from "@/integrations/supabase/client";
import type { Photo } from "@/components/Polaroid";
import type { TimelineEntry } from "@/data/photos";

export type PhotoItem = Photo & { id: string; owner?: Owner; sort_order?: number };
export type TimelineItem = TimelineEntry & { id: string; owner?: Owner; sort_order?: number };

const PHOTO_COLS =
  "id,owner,src,alt,caption,date,note,tilt,sort_order,created_at";
const TIMELINE_COLS =
  "id,owner,src,alt,caption,date,note,tilt,title,mood,story,sort_order,created_at";

/* ---------------- Photos ---------------- */

export function usePhotos() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("photos")
      .select(PHOTO_COLS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[photos] load", error);
      setItems([]);
    } else {
      setItems((data ?? []) as PhotoItem[]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const add = useCallback(async (data: Omit<PhotoItem, "id">) => {
    const { data: u } = await supabase.auth.getUser();
    const owner = ownerForEmail(u.user?.email) ?? "felix";
    const { error } = await supabase
      .from("photos")
      .insert({ ...data, owner, created_by: u.user?.id });
    if (error) console.warn("[photos] insert", error);
    await reload();
  }, [reload]);

  const update = useCallback(async (id: string, patch: Partial<PhotoItem>) => {
    const { id: _i, owner: _o, ...rest } = patch;
    const { error } = await supabase.from("photos").update(rest).eq("id", id);
    if (error) console.warn("[photos] update", error);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) console.warn("[photos] delete", error);
    await reload();
  }, [reload]);

  return { items, hydrated, add, update, remove, reload };
}

/* ---------------- Timeline ---------------- */

export function useTimeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("timeline")
      .select(TIMELINE_COLS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("[timeline] load", error);
      setItems([]);
    } else {
      setItems((data ?? []) as TimelineItem[]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const add = useCallback(async (data: Omit<TimelineItem, "id">) => {
    const { data: u } = await supabase.auth.getUser();
    const owner = ownerForEmail(u.user?.email) ?? "felix";
    const { error } = await supabase
      .from("timeline")
      .insert({ ...data, owner, created_by: u.user?.id });
    if (error) console.warn("[timeline] insert", error);
    await reload();
  }, [reload]);

  const update = useCallback(async (id: string, patch: Partial<TimelineItem>) => {
    const { id: _i, owner: _o, ...rest } = patch;
    const { error } = await supabase.from("timeline").update(rest).eq("id", id);
    if (error) console.warn("[timeline] update", error);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("timeline").delete().eq("id", id);
    if (error) console.warn("[timeline] delete", error);
    await reload();
  }, [reload]);

  return { items, hydrated, add, update, remove, reload };
}

/* ---------------- Image upload ---------------- */

/** Downscale a file and upload to the `journal` storage bucket. Returns the public URL. */
export async function uploadImage(file: File, max = 1600, quality = 0.85): Promise<string> {
  // Downscale via canvas
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("image load"));
    i.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob failed"))), "image/jpeg", quality),
  );

  const { data: u } = await supabase.auth.getUser();
  const folder = u.user?.id ?? "anon";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error } = await supabase.storage.from("journal").upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("journal").getPublicUrl(path);
  return data.publicUrl;
}

/* ---------------- Wishes ---------------- */

export type WishOwner = "sunny" | "felix";
export interface WishItem {
  id: string;
  owner: WishOwner;
  text: string;
  done: boolean;
  createdAt: number;
  completedAt?: number;
  completionNote?: string;
  completionPhoto?: string;
}

interface WishRow {
  id: string;
  owner: WishOwner;
  text: string;
  done: boolean;
  completed_at: string | null;
  completion_note: string | null;
  completion_photo: string | null;
  created_at: string;
}

const wishFromRow = (r: WishRow): WishItem => ({
  id: r.id,
  owner: r.owner,
  text: r.text,
  done: r.done,
  createdAt: new Date(r.created_at).getTime(),
  completedAt: r.completed_at ? new Date(r.completed_at).getTime() : undefined,
  completionNote: r.completion_note ?? undefined,
  completionPhoto: r.completion_photo ?? undefined,
});

export function useWishes() {
  const [items, setItems] = useState<WishItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("wishes")
      .select("id,owner,text,done,completed_at,completion_note,completion_photo,created_at")
      .order("created_at", { ascending: false });
    if (error) console.warn("[wishes] load", error);
    setItems(((data ?? []) as WishRow[]).map(wishFromRow));
    setHydrated(true);
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const add = useCallback(async (owner: WishOwner, text: string) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("wishes")
      .insert({ owner, text, done: false, created_by: u.user?.id });
    if (error) console.warn("[wishes] insert", error);
    await reload();
  }, [reload]);

  const update = useCallback(async (id: string, patch: Partial<WishItem>) => {
    const row: Record<string, unknown> = {};
    if (patch.text !== undefined) row.text = patch.text;
    if (patch.owner !== undefined) row.owner = patch.owner;
    if (patch.done !== undefined) row.done = patch.done;
    if (patch.completedAt !== undefined)
      row.completed_at = patch.completedAt ? new Date(patch.completedAt).toISOString() : null;
    if (patch.completionNote !== undefined) row.completion_note = patch.completionNote ?? null;
    if (patch.completionPhoto !== undefined) row.completion_photo = patch.completionPhoto ?? null;
    const { error } = await supabase.from("wishes").update(row).eq("id", id);
    if (error) console.warn("[wishes] update", error);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("wishes").delete().eq("id", id);
    if (error) console.warn("[wishes] delete", error);
    await reload();
  }, [reload]);

  return { items, hydrated, add, update, remove, reload };
}

/* ---------------- Gifts ---------------- */

export type GiftOwner = "sunny" | "felix";
export type GiftRecipient = "sunny" | "felix" | "both";
export interface GiftItem {
  id: string;
  owner: GiftOwner;
  recipient: GiftRecipient;
  title: string;
  note?: string;
  price?: string;
  tags: string[];
  given: boolean;
  givenAt?: number;
  createdAt: number;
}

interface GiftRow {
  id: string;
  owner: GiftOwner;
  recipient: GiftRecipient;
  title: string;
  note: string | null;
  price: string | null;
  tags: string[] | null;
  given: boolean;
  given_at: string | null;
  created_at: string;
}

const giftFromRow = (r: GiftRow): GiftItem => ({
  id: r.id,
  owner: r.owner,
  recipient: r.recipient,
  title: r.title,
  note: r.note ?? undefined,
  price: r.price ?? undefined,
  tags: r.tags ?? [],
  given: r.given,
  givenAt: r.given_at ? new Date(r.given_at).getTime() : undefined,
  createdAt: new Date(r.created_at).getTime(),
});

export type GiftInput = {
  owner: GiftOwner;
  recipient: GiftRecipient;
  title: string;
  note?: string;
  price?: string;
  tags: string[];
};

export function useGifts() {
  const [items, setItems] = useState<GiftItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("gifts")
      .select("id,owner,recipient,title,note,price,tags,given,given_at,created_at")
      .order("created_at", { ascending: false });
    if (error) console.warn("[gifts] load", error);
    setItems(((data ?? []) as GiftRow[]).map(giftFromRow));
    setHydrated(true);
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const add = useCallback(async (input: GiftInput) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("gifts").insert({
      owner: input.owner,
      recipient: input.recipient,
      title: input.title,
      note: input.note ?? null,
      price: input.price ?? null,
      tags: input.tags,
      given: false,
      created_by: u.user?.id,
    });
    if (error) console.warn("[gifts] insert", error);
    await reload();
  }, [reload]);

  const update = useCallback(async (id: string, patch: Partial<GiftItem>) => {
    const row: Record<string, unknown> = {};
    if (patch.owner !== undefined) row.owner = patch.owner;
    if (patch.recipient !== undefined) row.recipient = patch.recipient;
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.note !== undefined) row.note = patch.note ?? null;
    if (patch.price !== undefined) row.price = patch.price ?? null;
    if (patch.tags !== undefined) row.tags = patch.tags;
    if (patch.given !== undefined) row.given = patch.given;
    if (patch.givenAt !== undefined)
      row.given_at = patch.givenAt ? new Date(patch.givenAt).toISOString() : null;
    const { error } = await supabase.from("gifts").update(row).eq("id", id);
    if (error) console.warn("[gifts] update", error);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("gifts").delete().eq("id", id);
    if (error) console.warn("[gifts] delete", error);
    await reload();
  }, [reload]);

  return { items, hydrated, add, update, remove, reload };
}

export function newId() {
  return (
    (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID()) ||
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}
