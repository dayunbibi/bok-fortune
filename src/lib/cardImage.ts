import type { Fortune } from "./fortune";

// "카드 저장": the result as a 1080x1350 picture (4:5, fits Instagram and Threads)
const W = 1080;
const H = 1350;
const INK = "#2B2320";
const JUA = '"Jua", sans-serif';
const BATANG = '"Gowun Batang", serif';
const DODUM = '"Gowun Dodum", sans-serif';
const STRIPES = ["#D8402F", "#F2C14E", "#6FA85A", "#4C7DB8", "#EE8FA6"];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// break text into lines that fit, keeping Korean words together like word-break: keep-all
function wrap(c: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (c.measureText(test).width <= max || !line) line = test;
    else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  return lines;
}

function box(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke = 0) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.lineWidth = stroke;
    c.strokeStyle = INK;
    c.stroke();
  }
}

function stars(c: CanvasRenderingContext2D, n: number, right: number, y: number, size: number) {
  c.font = `${size}px ${DODUM}`;
  c.textAlign = "right";
  c.fillStyle = "#E2D3B6";
  c.fillText("★".repeat(5 - n), right, y);
  const offWidth = c.measureText("★".repeat(5 - n)).width;
  c.fillStyle = "#E3A51A";
  c.fillText("★".repeat(n), right - offWidth, y);
  c.textAlign = "left";
}

export function stamp(c: CanvasRenderingContext2D, text: string, cx: number, cy: number, size: number) {
  c.save();
  c.translate(cx, cy);
  c.rotate((-8 * Math.PI) / 180);
  box(c, -size / 2, -size / 2, size, size, size * 0.15, "#D8402F", size * 0.045);
  c.fillStyle = "#FFF6E2";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `700 ${text.length > 1 ? size * 0.42 : size * 0.6}px ${BATANG}`;
  c.fillText(text, 0, size * 0.04);
  c.restore();
}

export async function makeCardImage(f: Fortune): Promise<Blob> {
  const allText = `${f.name}님의 2027 ${f.total.join(" ")} ${f.areas.map((a) => a.label + a.line).join(" ")} 행운의 음식 색 ${f.food} ${f.color.name} 복주머니 운세 정미년 붉은 양의 해 향수병 게임즈 나도 흔들러 가기 →`;
  await Promise.all([
    document.fonts.load(`40px ${JUA}`, allText),
    document.fonts.load(`700 50px ${BATANG}`, f.total.join("") + f.stamp),
    document.fonts.load(`27px ${DODUM}`, allText + "★"),
  ]).catch(() => {});
  const [cat, lamb] = await Promise.all([loadImage("/art/poip-hanbok.webp"), loadImage("/art/baby-lamb.webp")]);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  c.textBaseline = "alphabetic";

  // red background with the 색동 stripe on top
  c.fillStyle = "#D8402F";
  c.fillRect(0, 0, W, H);
  STRIPES.forEach((color, i) => {
    c.fillStyle = color;
    c.fillRect(0, i * 6, W, 6);
  });
  c.fillStyle = INK;
  c.fillRect(0, 30, W, 4);

  c.font = `34px ${JUA}`;
  c.fillStyle = "#FFE7A8";
  c.fillText("2027 정미년 · 붉은 양의 해", 64, 118);
  c.font = `28px ${DODUM}`;
  c.fillStyle = "#FFF6E2";
  c.textAlign = "right";
  c.fillText("향수병 게임즈", W - 64, 116);
  c.textAlign = "left";

  // big title with the sticker shadow
  c.font = `116px ${JUA}`;
  c.fillStyle = INK;
  c.fillText("복주머니 운세", 64, 252 + 7);
  c.fillStyle = "#FFF6E2";
  c.fillText("복주머니 운세", 64, 252);

  // the paper card, height depends on how long the lines are
  const x = 64;
  const w = W - 128;
  const pad = 48;
  const inner = w - pad * 2;
  const top = 300;

  c.font = `700 50px ${BATANG}`;
  const totalLines = f.total.flatMap((t) => wrap(c, t, inner - 40));
  c.font = `27px ${DODUM}`;
  const cellW = (inner - 18) / 2;
  const cellLines = f.areas.map((a) => wrap(c, a.line, cellW - 56).slice(0, 2));
  const rowH = [0, 1].map((r) => 24 + 46 + Math.max(cellLines[r * 2].length, cellLines[r * 2 + 1].length) * 38 + 22);

  const nameY = top + 44 + 40;
  const totalY = nameY + 36 + 50;
  const gridY = totalY + (totalLines.length - 1) * 70 + 46;
  const pillY = gridY + rowH[0] + 18 + rowH[1] + 28;
  const cardH = pillY + 66 + 44 - top;

  box(c, x, top, w, cardH, 32, "#FFF8E8", 5);
  stamp(c, f.stamp, x + w - 40 - 46, top + 36 + 46, 92);

  c.font = `42px ${JUA}`;
  c.fillStyle = "#C8352A";
  c.fillText(`${f.name}님의 2027`, x + pad, nameY);

  c.font = `700 50px ${BATANG}`;
  c.fillStyle = INK;
  totalLines.forEach((line, i) => c.fillText(line, x + pad, totalY + i * 70));

  f.areas.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = x + pad + col * (cellW + 18);
    const cy = gridY + (row ? rowH[0] + 18 : 0);
    box(c, cx, cy, cellW, rowH[row], 22, "#FBEFD6");
    c.font = `38px ${JUA}`;
    c.fillStyle = INK;
    c.fillText(a.label, cx + 28, cy + 24 + 36);
    stars(c, a.stars, cx + cellW - 28, cy + 24 + 34, 32);
    c.font = `27px ${DODUM}`;
    c.fillStyle = "#4A3F36";
    cellLines[i].forEach((line, j) => c.fillText(line, cx + 28, cy + 24 + 46 + 30 + j * 38));
  });

  // lucky food + color pills
  c.font = `28px ${DODUM}`;
  const foodLabelW = c.measureText("행운의 음식").width;
  const colorLabelW = c.measureText("행운의 색").width;
  c.font = `32px ${JUA}`;
  const foodW = 26 + foodLabelW + 12 + c.measureText(f.food).width + 26;
  const colorW = 26 + colorLabelW + 12 + 30 + 12 + c.measureText(f.color.name).width + 26;
  const px = x + pad;
  box(c, px, pillY, foodW, 66, 33, "#FFFDF7", 3);
  box(c, px + foodW + 18, pillY, colorW, 66, 33, "#FFFDF7", 3);
  c.font = `28px ${DODUM}`;
  c.fillStyle = INK;
  c.fillText("행운의 음식", px + 26, pillY + 43);
  c.fillText("행운의 색", px + foodW + 18 + 26, pillY + 43);
  c.font = `32px ${JUA}`;
  c.fillStyle = "#C8352A";
  c.fillText(f.food, px + 26 + foodLabelW + 12, pillY + 45);
  const dotX = px + foodW + 18 + 26 + colorLabelW + 12;
  c.beginPath();
  c.arc(dotX + 15, pillY + 33, 15, 0, Math.PI * 2);
  c.fillStyle = f.color.hex;
  c.fill();
  c.lineWidth = 3;
  c.strokeStyle = INK;
  c.stroke();
  c.fillStyle = INK;
  c.fillText(f.color.name, dotX + 42, pillY + 45);

  // footer
  c.font = `36px ${JUA}`;
  c.fillStyle = "#FFF6E2";
  c.fillText("나도 복주머니 흔들러 가기 →", 64, H - 60);
  const lambH = (150 * lamb.height) / lamb.width;
  c.drawImage(lamb, W - 250 - 150, H - 24 - lambH, 150, lambH);
  c.save();
  c.translate(W - 30 - 120, H + 30 - 144);
  c.rotate((-6 * Math.PI) / 180);
  const catH = (240 * cat.height) / cat.width;
  c.drawImage(cat, -120, 144 - catH, 240, catH);
  c.restore();

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
}
