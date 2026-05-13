import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, FileDown, ImageDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { ScriptureVerse } from '@/lib/scriptureByMood';

interface Props {
  verse: ScriptureVerse;
  /** Optional theme/mood label saved alongside the verse (e.g. mood key). */
  theme?: string | null;
  /** Visual size; "sm" for inline cards, "md" for full panels. */
  size?: 'sm' | 'md';
  className?: string;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Render the verse onto a canvas with the sacred dark aesthetic. */
function renderVerseToCanvas(verse: ScriptureVerse): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background gradient (deep night → near-black)
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0c0a0e');
  bg.addColorStop(1, '#06050a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft gold radial halo
  const halo = ctx.createRadialGradient(W / 2, H / 2 - 60, 80, W / 2, H / 2 - 60, 700);
  halo.addColorStop(0, 'rgba(201, 168, 76, 0.20)');
  halo.addColorStop(1, 'rgba(201, 168, 76, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  // Gold border frame
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, W - 120, H - 120);

  // "ORA" wordmark
  ctx.fillStyle = 'rgba(201, 168, 76, 0.85)';
  ctx.font = '600 22px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ORA', W / 2, 140);
  ctx.font = '400 14px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(201, 168, 76, 0.55)';
  ctx.fillText('A WORD FOR YOU', W / 2, 168);

  // Verse text — wrap
  ctx.fillStyle = '#f3ead8';
  ctx.font = 'italic 500 52px "Cormorant Garamond", "Georgia", serif';
  ctx.textBaseline = 'middle';

  const maxWidth = W - 240;
  const words = verse.text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const lineHeight = 70;
  const totalH = lines.length * lineHeight;
  let y = H / 2 - totalH / 2;
  for (const l of lines) {
    ctx.fillText('“' + l + '”', W / 2, y);
    y += lineHeight;
  }

  // Reference
  ctx.fillStyle = 'rgba(201, 168, 76, 0.9)';
  ctx.font = '600 22px "Inter", system-ui, sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(verse.ref.toUpperCase(), W / 2, H - 180);

  // Footer
  ctx.fillStyle = 'rgba(243, 234, 216, 0.4)';
  ctx.font = '400 16px "Inter", system-ui, sans-serif';
  ctx.fillText('oradevotion.com', W / 2, H - 110);

  return canvas;
}

async function shareOrDownload(blob: Blob, filename: string, mime: string, title: string) {
  const file = new File([blob], filename, { type: mime });
  const navAny = navigator as any;
  if (navAny.canShare && navAny.canShare({ files: [file] })) {
    try {
      await navAny.share({ files: [file], title });
      return;
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      // fall through to download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function VerseActions({ verse, theme, size = 'md', className = '' }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<null | 'save' | 'pdf' | 'image'>(null);

  // Detect existing favorite
  useEffect(() => {
    if (!user) return;
    supabase
      .from('scripture_saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('reference', verse.ref)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, verse.ref]);

  async function handleSave() {
    if (!user) {
      toast.error('Sign in to save verses');
      return;
    }
    if (saved) {
      toast.message('Already in your favorites');
      return;
    }
    setBusy('save');
    const { error } = await supabase.from('scripture_saves').insert({
      user_id: user.id,
      reference: verse.ref,
      passage_text: verse.text,
      theme: theme ?? null,
    });
    setBusy(null);
    if (error) {
      toast.error('Could not save verse');
      return;
    }
    setSaved(true);
    toast.success('Saved to your favorites');
  }

  async function handlePdf() {
    setBusy('pdf');
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 210;
      // Background
      doc.setFillColor(12, 10, 14);
      doc.rect(0, 0, W, 297, 'F');
      // Frame
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, W - 30, 297 - 30);
      // Header
      doc.setTextColor(201, 168, 76);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('ORA', W / 2, 35, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('A WORD FOR YOU', W / 2, 42, { align: 'center' });
      // Verse
      doc.setTextColor(243, 234, 216);
      doc.setFont('times', 'italic');
      doc.setFontSize(22);
      const lines = doc.splitTextToSize('“' + verse.text + '”', W - 60);
      const lineH = 10;
      const startY = 297 / 2 - (lines.length * lineH) / 2;
      lines.forEach((l: string, i: number) => {
        doc.text(l, W / 2, startY + i * lineH, { align: 'center' });
      });
      // Reference
      doc.setTextColor(201, 168, 76);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(verse.ref.toUpperCase(), W / 2, 297 - 40, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 145, 130);
      doc.setFontSize(9);
      doc.text('oradevotion.com', W / 2, 297 - 25, { align: 'center' });

      const blob = doc.output('blob');
      await shareOrDownload(blob, `ora-verse-${slug(verse.ref)}.pdf`, 'application/pdf', verse.ref);
    } finally {
      setBusy(null);
    }
  }

  async function handleImage() {
    setBusy('image');
    try {
      const canvas = renderVerseToCanvas(verse);
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'));
      if (!blob) {
        toast.error('Could not generate image');
        return;
      }
      await shareOrDownload(blob, `ora-verse-${slug(verse.ref)}.png`, 'image/png', verse.ref);
    } finally {
      setBusy(null);
    }
  }

  const btnBase =
    size === 'sm'
      ? 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors'
      : 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors';
  const btnIdle = 'border-gold/30 text-gold/90 hover:border-gold hover:bg-gold/10';
  const btnSaved = 'border-gold bg-gold/15 text-gold';
  const iconCls = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`} aria-label="Verse actions">
      <button
        type="button"
        onClick={handleSave}
        disabled={busy === 'save'}
        className={`${btnBase} ${saved ? btnSaved : btnIdle}`}
        aria-pressed={saved}
      >
        {busy === 'save' ? (
          <Loader2 className={`${iconCls} animate-spin`} />
        ) : saved ? (
          <BookmarkCheck className={iconCls} />
        ) : (
          <Bookmark className={iconCls} />
        )}
        {saved ? 'Saved' : 'Save'}
      </button>
      <button
        type="button"
        onClick={handleImage}
        disabled={busy === 'image'}
        className={`${btnBase} ${btnIdle}`}
      >
        {busy === 'image' ? <Loader2 className={`${iconCls} animate-spin`} /> : <ImageDown className={iconCls} />}
        Image
      </button>
      <button
        type="button"
        onClick={handlePdf}
        disabled={busy === 'pdf'}
        className={`${btnBase} ${btnIdle}`}
      >
        {busy === 'pdf' ? <Loader2 className={`${iconCls} animate-spin`} /> : <FileDown className={iconCls} />}
        PDF
      </button>
    </div>
  );
}

export default VerseActions;
