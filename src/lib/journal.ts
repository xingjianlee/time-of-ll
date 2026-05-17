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

export function newId() {
  return (
    (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID()) ||
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}
