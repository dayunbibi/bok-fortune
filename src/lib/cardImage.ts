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
  const allText = [f.name, f.grade, f.keyword, ...f.total, ...f.areas.map(a => a.label + a.line), f.food, f.color.name, f.item, f.caution, f.cheer, "복주머니 운세 향수병 게임즈 행운의 아이템 포잎이의 한마디 황금 복주머니"].join(" ");
  await Promise.all([
    document.fonts.load(`40px ${JUA}`, allText),
    document.fonts.load(`700 50px ${BATANG}`, f.total.join("") + f.stamp),
    document.fonts.load(`27px ${DODUM}`, allText + "★"),
  ]).catch(() => {});
  const [cat, lamb] = await Promise.all([loadImage("/art/poip-hanbok.webp"), loadImage("/art/baby-lamb.webp")]);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext("2d")!;
  c.textBaseline = "alphabetic";

  const accent = f.golden ? "#F2C14E" : "#D8402F";
  const headerInk = f.golden ? INK : "#FFF6E2";
  c.fillStyle = accent;
  c.fillRect(0, 0, W, H);
  STRIPES.forEach((color, i) => {
    c.fillStyle = color;
    c.fillRect(0, i * 6, W, 6);
  });
  c.fillStyle = INK; c.fillRect(0, 30, W, 4);

  c.font = `32px ${JUA}`; c.fillStyle = headerInk;
  c.fillText("2027 정미년 · 붉은 양의 해", 64, 83);
  c.textAlign = "right"; c.font = `28px ${DODUM}`;
  c.fillText("향수병 게임즈", W - 64, 83); c.textAlign = "left";
  c.font = `95px ${JUA}`; c.fillStyle = INK;
  c.fillText(f.golden ? "황금 복주머니" : "복주머니 운세", 64, 183 + 5, 952);
  c.fillStyle = "#FFFDF7";
  c.fillText(f.golden ? "황금 복주머니" : "복주머니 운세", 64, 183, 952);

  const x = 64, w = 952, pad = 36, inner = w - pad * 2;
  const left = x + pad;
  box(c, x, 217, w, 964, 32, f.golden ? "#FFF0B7" : "#FFF8E8", 5);
  stamp(c, f.stamp, x + w - 66, 280, 72);
  c.font = `42px ${JUA}`; c.fillStyle = "#C8352A";
  c.fillText(`${f.name}님의 새해 운세`, left, 282, inner - 100);
  c.font = `34px ${JUA}`; c.fillStyle = INK;
  c.fillText(`${f.grade} · 올해의 키워드: ${f.keyword}`, left, 341, inner);
  c.font = `700 43px ${BATANG}`;
  f.total.forEach((line, i) => c.fillText(line, left, 406 + i * 59, inner));
  c.strokeStyle = "#D9C8A8"; c.lineWidth = 3; c.setLineDash([8, 9]);
  c.beginPath(); c.moveTo(left, 486); c.lineTo(left + inner, 486); c.stroke(); c.setLineDash([]);

  const cellW = (inner - 18) / 2;
  f.areas.forEach((a, i) => {
    const cx = left + (i % 2) * (cellW + 18);
    const cy = 506 + Math.floor(i / 2) * 149;
    box(c, cx, cy, cellW, 134, 20, f.golden ? "#FFE39A" : "#FBEFD6");
    c.font = `34px ${JUA}`; c.fillStyle = INK;
    c.fillText(a.label, cx + 22, cy + 42);
    stars(c, a.stars, cx + cellW - 22, cy + 41, 28);
    c.font = `26px ${DODUM}`; c.fillStyle = "#4A3F36";
    wrap(c, a.line, cellW - 44).slice(0, 2).forEach((line,j) => c.fillText(line,cx+22,cy+80+j*32,cellW-44));
  });
  const luckW = (inner - 24) / 3;
  const lucks = [{label:"행운의 음식",value:f.food},{label:"행운의 색",value:f.color.name},{label:"행운의 아이템",value:f.item}];
  lucks.forEach((luck,i) => {
    const lx = left + i * (luckW + 12);
    box(c,lx,811,luckW,100,18,"#FFFDF7",3);
    c.font = `25px ${DODUM}`; c.fillStyle = "#6B5D4F";
    c.fillText(luck.label,lx+16,846,luckW-32);
    c.font = `34px ${JUA}`; c.fillStyle = "#C8352A";
    let offset = 16;
    if(i===1) {
      c.beginPath(); c.arc(lx+30,880,12,0,Math.PI*2); c.fillStyle=f.color.hex; c.fill();
      c.strokeStyle=INK; c.lineWidth=3; c.stroke(); c.fillStyle=INK; offset=56;
    }
    c.fillText(luck.value,lx+offset,891,luckW-offset-15);
  });

  box(c,left,925,inner,77,17,f.golden ? "#FFE39A" : "#FBEFD6");
  c.font = `29px ${JUA}`; c.fillStyle = INK;
  c.fillText("올해 조심할 것",left+22,973);
  c.font = `30px ${DODUM}`;
  c.fillText(f.caution,left+250,973,inner-272);

  box(c,left,1015,inner,130,20,"#FFFDF7",3);
  const catW = 100, catH = catW * cat.height / cat.width;
  c.drawImage(cat,left+16,1015+(130-catH)/2,catW,catH);
  c.font = `30px ${JUA}`; c.fillStyle = "#C8352A";
  c.fillText("포잎이의 한마디",left+136,1057);
  c.font = `29px ${DODUM}`; c.fillStyle = INK;
  wrap(c,f.cheer,inner-158).slice(0,2).forEach((line,i)=>c.fillText(line,left+136,1093+i*34,inner-158));

  c.fillStyle = headerInk; c.font = `35px ${JUA}`;
  c.fillText("나도 복주머니 흔들러 가기 →",64,1255);
  c.font = `26px ${DODUM}`; c.fillText("bok-fortune.vercel.app",64,1300);
  const lambW=116, lambH=lambW*lamb.height/lamb.width;
  c.drawImage(lamb,W-64-lambW,H-24-lambH,lambW,lambH);
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("toBlob failed")),"image/png"));
}
