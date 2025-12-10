// GOLDEN ANGLE spacing used for distinct colors
const GOLDEN_ANGLE = 137.508;
let colorIndex = 0;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    const value = v / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export async function getNextColor(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const avg = await computeAverageColor(img);
  const luminance = getLuminance(avg.r, avg.g, avg.b);

  // 1. Generate hue using golden angle rotation
  const hue = (colorIndex * GOLDEN_ANGLE) % 360;
  colorIndex++;

  // 2. Adaptive saturation/lightness
  const saturation = 75; // fixed
  const lightness = luminance > 0.5 ? 35 : 70; // contrast against background

  // 3. Return final HEX color
  return hslToHex(hue, saturation, lightness);
}

// =========================
// Helpers (typed)
// =========================

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function computeAverageColor(img: HTMLImageElement): Promise<RGB> {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve({ r: 0, g: 0, b: 0 });
      return;
    }

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let r = 0,
      g = 0,
      b = 0;
    const total = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    resolve({
      r: r / total,
      g: g / total,
      b: b / total,
    });
  });
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const k = (n: number): number => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);

  const f = (n: number): number =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return (
    "#" +
    [f(0), f(8), f(4)]
      .map(x => Math.round(x * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}