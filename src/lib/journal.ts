import { useEffect, useState } from "react";
import type { Photo } from "@/components/Polaroid";
import type { TimelineEntry } from "@/data/photos";
import { photos as seedPhotos, timeline as seedTimeline } from "@/data/photos";

const PHOTOS_KEY = "snf-photos-v1";
const TIMELINE_KEY = "snf-timeline-v1";

export type PhotoItem = Photo & { id: string };
export type TimelineItem = TimelineEntry & { id: string };

function withIds<T extends object>(arr: T[]): (T & { id: string })[] {
  return arr.map((x, i) => ({ ...x, id: `seed-${i}-${Math.random().toString(36).slice(2, 7)}` }));
}

function load<T extends { id: string }>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function usePhotos() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setItems(load<PhotoItem>(PHOTOS_KEY, withIds(seedPhotos)));
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("[photos] storage write failed", e);
    }
  }, [items, hydrated]);
  return { items, setItems, hydrated };
}

export function useTimeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setItems(load<TimelineItem>(TIMELINE_KEY, withIds(seedTimeline)));
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(TIMELINE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("[timeline] storage write failed", e);
    }
  }, [items, hydrated]);
  return { items, setItems, hydrated };
}

/** Downscale an image file and return a JPEG dataURL. */
export async function fileToDataUrl(file: File, max = 1200, quality = 0.85): Promise<string> {
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
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export function newId() {
  return (
    (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID()) ||
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}
