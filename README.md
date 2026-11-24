# 2027 복주머니 운세 🧧

A small New Year fortune web app from **향수병 게임즈** (homesick games) — Korean nostalgia games made by a student in Toronto.

Type your name, 포잎이 shakes the 복주머니 (lucky pouch), and a fortune slip pops out:
an overall line, 4 areas with stars (love, study/work, money, health), a lucky food and a lucky color.
You can save the result as a 1080×1350 card for Instagram/Threads or send the link to a friend.

## How it works

- No backend. The fortune is picked from `name + today's date` with a tiny seeded random
  (FNV-1a hash → mulberry32), so the same name gets the same result all day and a new one tomorrow.
- All text lives in `src/lib/fortune.ts`. Stars are always 3–5 so nobody gets a sad new year.
- The share card is drawn on a `<canvas>` (`src/lib/cardImage.ts`) and shared with the Web Share API,
  falling back to a download + an image preview you can long-press (in-app browsers often block downloads).
- Art is SVG from the design handoff (`public/art`).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4

## Run locally

```bash
npm install
npm run dev
```
