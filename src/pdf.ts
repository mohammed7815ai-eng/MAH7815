// "Save my plan": turns the results page into a real PDF file and hands it to the user.
// The page is drawn as an image (html2canvas), so Arabic and Kurdish text keep the browser's
// shaping and right-to-left layout exactly as on screen. window.print() is not used because it
// does nothing inside the Android app and depends on a "Save as PDF" printer elsewhere.
import { Capacitor } from '@capacitor/core';

const A4_W = 210; // mm
const A4_H = 297;
const MARGIN = 10;
const RENDER_WIDTH = 780; // CSS px: the plan is laid out at this width whatever the screen size

export type SaveResult = 'downloaded' | 'shared' | 'cancelled';

/** Places to break pages, in canvas pixels from the top: between whole blocks (cards, charts) first,
 *  and between lines of a card only when a block is too tall for the space left. */
function breakPoints(root: HTMLElement, scale: number): { major: number[]; minor: number[] } {
  const top = root.getBoundingClientRect().top;
  const ys = (sel: string) => {
    const set = new Set<number>();
    root.querySelectorAll(sel).forEach((b) => set.add(Math.round((b.getBoundingClientRect().bottom - top) * scale)));
    return [...set].sort((a, b) => a - b);
  };
  return { major: ys('.results > *'), minor: ys('.rec > *, .rec li, .charts > *, .charts > * > *') };
}

/** Cut a tall canvas into page-sized slices, preferring whole blocks, then lines, then a plain cut. */
export function paginate(total: number, pageHeight: number, breaks: { major: number[]; minor: number[] }): [number, number][] {
  const pages: [number, number][] = [];
  let y = 0;
  while (y < total) {
    let end = Math.min(y + pageHeight, total);
    if (end < total) {
      const within = (list: number[], from: number) => list.filter((b) => b > y + pageHeight * from && b <= end);
      const major = within(breaks.major, 0.6);
      const minor = within(breaks.minor, 0.5);
      if (major.length) end = major[major.length - 1];
      else if (minor.length) end = minor[minor.length - 1];
    }
    pages.push([y, end]);
    y = end;
  }
  return pages;
}

async function render(el: HTMLElement): Promise<{ canvas: HTMLCanvasElement; breaks: { major: number[]; minor: number[] } }> {
  const { default: html2canvas } = await import('html2canvas-pro');
  const scale = 2;
  let clone: HTMLElement | null = null;
  const canvas = await html2canvas(el, {
    scale,
    backgroundColor: '#ffffff',
    windowWidth: RENDER_WIDTH + 40,
    removeContainer: false,
    ignoreElements: (n) => n.classList?.contains('no-print') ?? false,
    onclone: (doc, c) => {
      doc.documentElement.classList.add('pdf-export');
      c.style.width = `${RENDER_WIDTH}px`;
      clone = c;
    },
  });
  const breaks = clone ? breakPoints(clone, scale) : { major: [], minor: [] };
  // removeContainer: false kept the cloned page so it could be measured; tidy it up now.
  (clone as HTMLElement | null)?.ownerDocument.defaultView?.frameElement?.remove();
  return { canvas, breaks };
}

export async function planPdf(el: HTMLElement, title: string): Promise<Blob> {
  const [{ canvas, breaks }, { jsPDF }] = await Promise.all([render(el), import('jspdf')]);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({ title, creator: 'Cancer Screening Guide' });
  const contentW = A4_W - 2 * MARGIN;
  const pxPerMm = canvas.width / contentW;
  const pageH = Math.floor((A4_H - 2 * MARGIN) * pxPerMm);
  const slice = document.createElement('canvas');
  slice.width = canvas.width;
  paginate(canvas.height, pageH, breaks).forEach(([y0, y1], i) => {
    slice.height = y1 - y0;
    const ctx = slice.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y0, canvas.width, y1 - y0, 0, 0, canvas.width, y1 - y0);
    if (i > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', MARGIN, MARGIN, contentW, (y1 - y0) / pxPerMm);
  });
  return pdf.output('blob');
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Save the PDF: a download on the web and Windows (Windows asks where to save it), the share sheet on Android. */
export async function deliverPdf(blob: Blob, fileName: string): Promise<SaveResult> {
  if (Capacitor.isNativePlatform()) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
    const { uri } = await Filesystem.writeFile({ path: fileName, data: await toBase64(blob), directory: Directory.Cache });
    try {
      await Share.share({ title: fileName, files: [uri] });
      return 'shared';
    } catch {
      return 'cancelled'; // the user closed the share sheet
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'downloaded';
}

export function pdfFileName(date = new Date()): string {
  const d = date.toISOString().slice(0, 10);
  return `screening-plan-${d}.pdf`;
}
