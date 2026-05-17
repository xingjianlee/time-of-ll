import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { fileToDataUrl } from "@/lib/journal";
import type { PhotoItem, TimelineItem } from "@/lib/journal";

type Kind = "photo" | "timeline";

interface Props {
  open: boolean;
  kind: Kind;
  initial?: Partial<PhotoItem & TimelineItem> | null;
  onClose: () => void;
  onSave: (data: Omit<PhotoItem, "id"> | Omit<TimelineItem, "id">) => void;
}

const empty = {
  src: "",
  alt: "",
  caption: "",
  date: "",
  note: "",
  tilt: 0,
  title: "",
  mood: "",
  story: "",
};

export function JournalEditor({ open, kind, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState({ ...empty });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm({ ...empty, ...(initial || {}) } as typeof empty);
    }
  }, [open, initial]);

  if (!open) return null;

  const upd = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pickFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await fileToDataUrl(file);
      upd("src", url);
    } catch (e) {
      console.warn("upload failed", e);
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!form.src || !form.caption) return;
    if (kind === "timeline" && !form.title) return;
    const base = {
      src: form.src,
      alt: form.alt || form.caption,
      caption: form.caption,
      date: form.date,
      note: form.note,
      tilt: Number(form.tilt) || 0,
    };
    if (kind === "photo") onSave(base);
    else
      onSave({
        ...base,
        title: form.title,
        mood: form.mood,
        story: form.story,
      });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-wine/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-cream p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 text-wine/60 hover:text-wine"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="font-display text-2xl text-wine">
            {initial?.src ? "编辑" : "新增"}
            {kind === "photo" ? " · 拍立得" : " · 时光轴"}
          </h3>

          {/* Image */}
          <div className="mt-5">
            <label className="text-xs uppercase tracking-widest text-wine/60">照片</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-2 relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-wine/30 bg-white/60 hover:border-rose"
            >
              {form.src ? (
                <img src={form.src} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-wine/50">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <ImagePlus className="h-6 w-6" />
                  )}
                  <span className="text-sm">点击上传图片</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {kind === "timeline" && (
              <Field label="标题" value={form.title} onChange={(v) => upd("title", v)} />
            )}
            <Field
              label={kind === "timeline" ? "地点 · 简短" : "地点 · 简短 (caption)"}
              value={form.caption}
              onChange={(v) => upd("caption", v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="日期 (e.g. 2024.05.20)"
                value={form.date}
                onChange={(v) => upd("date", v)}
              />
              {kind === "timeline" ? (
                <Field label="心情" value={form.mood} onChange={(v) => upd("mood", v)} />
              ) : (
                <Field
                  label="倾斜角 (-8 ~ 8)"
                  value={String(form.tilt)}
                  onChange={(v) => upd("tilt", Number(v) as never)}
                  type="number"
                />
              )}
            </div>
            {kind === "timeline" && (
              <Field
                label="倾斜角 (-8 ~ 8)"
                value={String(form.tilt)}
                onChange={(v) => upd("tilt", Number(v) as never)}
                type="number"
              />
            )}
            <Area
              label={kind === "timeline" ? "卡片背面 · 小记" : "背面感想"}
              value={form.note}
              onChange={(v) => upd("note", v)}
              rows={3}
            />
            {kind === "timeline" && (
              <Area
                label="故事正文"
                value={form.story}
                onChange={(v) => upd("story", v)}
                rows={5}
              />
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-wine/20 px-5 py-2 text-sm text-wine/70 hover:bg-white"
            >
              取消
            </button>
            <button
              onClick={submit}
              disabled={!form.src || !form.caption || (kind === "timeline" && !form.title)}
              className="rounded-full bg-rose px-5 py-2 text-sm text-cream shadow hover:bg-rose/90 disabled:opacity-40"
            >
              保存
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-wine/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-wine/15 bg-white/70 px-3 py-2 text-wine outline-none focus:border-rose"
      />
    </label>
  );
}
function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-wine/60">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 w-full resize-none rounded-lg border border-wine/15 bg-white/70 px-3 py-2 text-wine outline-none focus:border-rose"
      />
    </label>
  );
}
