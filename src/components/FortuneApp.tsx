"use client";

import { useEffect, useRef, useState } from "react";
import { daysToSeollal, drawFortune, today, type Fortune } from "@/lib/fortune";
import { makeCardImage } from "@/lib/cardImage";
import { copyText } from "@/lib/copy";

type Screen = "start" | "drawing" | "result";

const SHAKE_MS = 2800;
const NAME_MAX = 10;

// the designs are drawn on a 390px wide phone, so art positions are written in
// those pixels and turned into % here. That way it scales on smaller/bigger phones.
const px = (n: number, base = 390) => `${(n / base) * 100}%`;

export default function FortuneApp() {
  const [screen, setScreen] = useState<Screen>("start");
  const [name, setName] = useState("");
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [drewToday, setDrewToday] = useState(false);
  const [dday, setDday] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [card, setCard] = useState<string | null>(null); // fallback preview when saving isn't possible
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // remember the last name, and whether it was already drawn today
  useEffect(() => {
    setDday(daysToSeollal());
    try {
      const saved = JSON.parse(localStorage.getItem("bok-last") ?? "null");
      if (saved?.name) {
        setName(saved.name);
        setDrewToday(saved.date === today());
      }
    } catch {
      // storage blocked (private mode etc.), just start fresh
    }
  }, []);

  function flash(text: string) {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }

  function shake() {
    const n = name.trim();
    if (!n) {
      flash("이름을 먼저 알려주세요");
      return;
    }
    setFortune(drawFortune(n));
    try {
      localStorage.setItem("bok-last", JSON.stringify({ name: n, date: today() }));
    } catch {}
    setDrewToday(true);
    setScreen("drawing");
    window.scrollTo(0, 0);
    setTimeout(() => {
      setScreen("result");
      window.scrollTo(0, 0);
    }, SHAKE_MS);
  }

  async function saveCard() {
    if (!fortune) return;
    flash("카드를 만들고 있어요…");
    try {
      const blob = await makeCardImage(fortune);
      const file = new File([blob], `2027-bok-${fortune.name}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          setToast("");
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            setToast("");
            return;
          }
        }
      }
      // in-app browsers (Instagram, Threads) often ignore downloads, so show the picture too
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      setCard(url);
      setToast("");
    } catch {
      flash("카드를 못 만들었어요. 다시 해볼래요?");
    }
  }

  async function sendToFriend() {
    if (!fortune) return;
    const url = window.location.origin;
    const text = `2027 복주머니 운세 🧧 나는 ${fortune.golden ? "희귀 황금 복주머니" : fortune.grade} 나왔어! 올해의 키워드는 ${fortune.keyword}. 너도 흔들어봐`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "2027 복주머니 운세", text, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    if (await copyText(`${text} ${url}`)) flash("링크를 복사했어요! 친구한테 보내주세요");
    else flash(url);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-cream/60">
      <div className="saekdong h-[15px] shrink-0" />

      {screen === "start" && (
        <StartScreen name={name} setName={setName} onShake={shake} drewToday={drewToday} dday={dday} />
      )}
      {screen === "drawing" && fortune && <DrawingScreen name={fortune.name} />}
      {screen === "result" && fortune && (
        <ResultScreen
          f={fortune}
          onSave={saveCard}
          onSend={sendToFriend}
          onOther={() => {
            setName("");
            setScreen("start");
          }}
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom))] z-30 flex justify-center px-4" role="status">
          <div className="animate-rise rounded-full bg-ink px-5 py-3 text-[15px] text-on-red shadow-lg">{toast}</div>
        </div>
      )}

      {card && <CardPreview src={card} onClose={() => setCard(null)} />}
    </main>
  );
}

function StartScreen({
  name,
  setName,
  onShake,
  drewToday,
  dday,
}: {
  name: string;
  setName: (v: string) => void;
  onShake: () => void;
  drewToday: boolean;
  dday: number | null;
}) {
  return (
    <section className="flex flex-1 flex-col pb-[calc(20px+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between px-6 pt-3 text-[13px] text-muted">
        <a href="https://homesick-games.vercel.app" className="hover:text-red-title">
          향수병 게임즈
        </a>
        {dday !== null && dday >= 0 && <span>{dday === 0 ? "오늘은 설날!" : `설날까지 D-${dday}`}</span>}
      </div>

      <div className="flex flex-col items-center gap-0.5 pt-3.5">
        <div className="rounded-full border-[1.5px] border-gold-star bg-paper px-3 py-1 text-[13px] text-red-deep">
          정미년 · 붉은 양의 해
        </div>
        <div className="mt-2 font-jua text-[28px] leading-none text-gold-text">2027</div>
        <h1 className="font-jua text-[44px] leading-[1.1] text-red-title [text-shadow:0_3px_0_#2B2320]">복주머니 운세</h1>
      </div>

      <div className="relative mx-auto mt-1 aspect-[390/330] w-full max-w-[320px]">
        <div className="absolute aspect-square rounded-full bg-sun" style={{ left: px(60), top: px(24, 330), width: px(270) }} />
        <img src="/art/poip-hanbok.webp" alt="한복 입은 포잎이" className="absolute" style={{ left: px(84), top: px(4, 330), width: px(216) }} />
        <img
          src="/art/bokjumeoni-closed.svg"
          alt="복주머니"
          className="absolute rotate-[8deg]"
          style={{ right: px(18), bottom: px(4, 330), width: px(128) }}
        />
        <img src="/art/baby-lamb.webp" alt="아기 양" className="absolute bottom-0" style={{ left: px(-2), width: px(104) }} />
      </div>

      <form
        className="flex flex-col gap-2.5 px-7 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          onShake();
        }}
      >
        <label htmlFor="name" className="font-jua text-[17px]">
          누구의 복을 담을까요?
        </label>
        <input
          id="name"
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 알려주세요"
          autoComplete="off"
          className="h-14 rounded-2xl border-[2.5px] border-ink bg-field px-[18px] text-[18px] outline-none focus:border-red"
        />
        <button type="submit" className="btn mt-1 h-[58px] rounded-[18px] bg-red text-[23px] text-on-red">
          {drewToday ? "오늘의 복 다시 보기" : "복주머니 흔들기"}
        </button>
        <p className="text-center text-[13px] text-faint">하루에 한 번, 새 복이 담겨요</p>
      </form>
    </section>
  );
}

function DrawingScreen({ name }: { name: string }) {
  const [step, setStep] = useState(1);
  useEffect(() => {
    const a = setTimeout(() => setStep(2), 900);
    const b = setTimeout(() => setStep(3), 1800);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const H = 674; // height of the art area in the design
  return (
    <section className="flex flex-1 flex-col" aria-live="polite">
      <div className="flex flex-col items-center gap-1.5 pt-14">
        <div className="font-jua text-[40px] text-red-title [text-shadow:0_3px_0_#2B2320]">흔들흔들…</div>
        <div className="text-[17px] text-muted">{name}님의 복을 담는 중이에요</div>
      </div>

      <div className="relative aspect-[390/674] w-full overflow-hidden">
        <div className="absolute aspect-square rounded-full bg-sun" style={{ left: px(45), top: px(110, H), width: px(300) }} />

        {/* the slip pops out once the bag has been shaken a bit */}
        {step >= 2 && (
          <img
            src="/art/fortune-slip.svg"
            alt="운세 쪽지"
            className="absolute animate-pop"
            style={{ left: px(168), top: px(16, H), width: px(96) }}
          />
        )}
        <img
          src="/art/bokjumeoni-open.svg"
          alt="열린 복주머니"
          className="absolute origin-bottom animate-shake"
          style={{ left: px(72), top: px(150, H), width: px(230) }}
        />

        {/* shake lines on both sides */}
        {[
          { side: "left", near: 34, far: 14 },
          { side: "right", near: 34, far: 14 },
        ].map(({ side, near, far }) => (
          <div key={side} className="absolute inset-0 animate-wiggle">
            <div
              className="absolute border-[5px] border-ink"
              style={{
                [side]: px(near),
                top: px(250, H),
                width: px(34),
                height: px(90, H),
                ...(side === "left" ? { borderRight: "none", borderRadius: "60px 0 0 60px" } : { borderLeft: "none", borderRadius: "0 60px 60px 0" }),
              }}
            />
            <div
              className="absolute border-[5px] border-ink opacity-45"
              style={{
                [side]: px(far),
                top: px(230, H),
                width: px(34),
                height: px(130, H),
                ...(side === "left" ? { borderRight: "none", borderRadius: "80px 0 0 80px" } : { borderLeft: "none", borderRadius: "0 80px 80px 0" }),
              }}
            />
          </div>
        ))}

        <img src="/art/poip-hanbok.webp" alt="포잎이" className="absolute -rotate-[8deg]" style={{ left: px(-6), bottom: px(66, H), width: px(150) }} />
        <img src="/art/baby-lamb.webp" alt="아기 양" className="absolute" style={{ right: px(6), bottom: px(70, H), width: px(112) }} />
        <div className="absolute animate-blink font-jua text-[34px] text-red-title" style={{ right: px(40), bottom: px(178, H) }}>
          !
        </div>

        <div className="absolute inset-x-0 flex flex-col items-center gap-2.5" style={{ bottom: px(28, H) }}>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`size-2.5 rounded-full transition-colors ${i <= step ? "bg-red" : "bg-[#E8DCC4]"}`} />
            ))}
          </div>
          <div className="font-jua text-[17px]">{step < 2 ? "복주머니를 흔들고 있어요!" : step < 3 ? "쪽지가 튀어나오고 있어요!" : "두근두근, 펼쳐볼게요!"}</div>
        </div>
      </div>
    </section>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="text-[15px] tracking-[1px]" aria-label={`별 5개 중 ${n}개`}>
      <span className="text-gold-star">{"★".repeat(n)}</span>
      <span className="text-star-off">{"★".repeat(5 - n)}</span>
    </div>
  );
}

// the wooden roller at the top and bottom of the scroll
function Roller({ className = "", golden = false }: { className?: string; golden?: boolean }) {
  return (
    <div className={`relative z-10 -mx-1.5 flex h-6 items-center justify-between rounded-[14px] border-[2.5px] border-ink ${golden ? "bg-gold" : "bg-red-deep"} ${className}`}>
      <div className="-ml-3 size-5 rounded-full border-[2.5px] border-ink bg-gold" />
      <div className="-mr-3 size-5 rounded-full border-[2.5px] border-ink bg-gold" />
    </div>
  );
}

function ResultScreen({ f, onSave, onSend, onOther }: { f: Fortune; onSave: () => void; onSend: () => void; onOther: () => void }) {
  return (
    <section className="flex flex-1 flex-col pb-[calc(28px+env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-1 px-[90px] pt-[26px] text-center">
        <div className="text-[13px] text-red-deep">2027 정미년 · 붉은 양의 해</div>
        <h1 className={`font-jua leading-tight text-balance [overflow-wrap:anywhere] ${f.name.length > 3 ? "text-[23px]" : "text-[28px]"}`}>{f.name}님의 새해 운세</h1>
      </div>

      <div className="relative mx-[18px] mt-[18px] animate-unroll">
        <Roller golden={f.golden} />
        <div className={`mx-1.5 -mt-1.5 flex flex-col border-x-[2.5px] border-ink ${f.golden ? "bg-[#FFF0B7]" : "bg-paper"}`}>
          <div className={`mt-1.5 h-[15px] ${f.golden ? "bg-gold" : "saekdong"}`} />
          {f.golden && <div className="mx-4 mt-4 rounded-xl border-2 border-ink bg-gold py-2 text-center font-jua text-[19px]">✦ 희귀 황금 복주머니 ✦</div>}
          <div className="relative flex flex-col items-center gap-2.5 px-5 pt-5 pb-4">
            <div
              className={`absolute top-3 right-3.5 flex size-10 -rotate-[8deg] items-center justify-center rounded-[7px] border-2 border-ink bg-red font-batang font-bold text-on-red ${f.stamp.length > 1 ? "text-[15px]" : "text-[24px]"}`}
            >
              {f.stamp}
            </div>
            <div className="rounded-full bg-ink px-3 py-[3px] font-jua text-[14px] text-on-red">{f.grade} · 올해의 총운</div>
            <div className="font-jua text-[17px] text-red-title">올해의 키워드 · {f.keyword}</div>
            <p className="px-[18px] text-center font-batang text-[21px] leading-normal font-bold text-balance">
              {f.total[0]}
              <br />
              {f.total[1]}
            </p>
          </div>
          <div className="mx-4 border-t-2 border-dashed border-dash" />
          <div className="grid grid-cols-2 gap-2.5 p-4">
            {f.areas.map((a) => (
              <div key={a.key} className="flex flex-col gap-1 rounded-[14px] bg-tile p-3">
                <div className="font-jua text-[17px]">{a.label}</div>
                <Stars n={a.stars} />
                <p className="text-[13.5px] leading-[1.45] text-ink-soft text-pretty">{a.line}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 px-4 pb-3">
            <div className="flex flex-col gap-0.5 rounded-[14px] border-2 border-ink bg-field px-2.5 py-2">
              <div className="text-[11px] text-faint">행운의 음식</div>
              <div className="font-jua text-[17px] leading-tight text-red-title">{f.food}</div>
            </div>
            <div className="flex flex-col gap-0.5 rounded-[14px] border-2 border-ink bg-field px-2.5 py-2">
              <div className="text-[11px] text-faint">행운의 색</div>
              <div className="flex items-center gap-1.5 font-jua text-[17px] leading-tight">
                <span className="size-4 shrink-0 rounded-full border-2 border-ink" style={{ background: f.color.hex }} />
                {f.color.name}
              </div>
            </div>
            <div className="flex flex-col gap-0.5 rounded-[14px] border-2 border-ink bg-field px-2.5 py-2">
              <div className="text-[11px] text-faint">행운의 아이템</div>
              <div className="font-jua text-[17px] leading-tight text-red-title">{f.item}</div>
            </div>
          </div>
          <div className="mx-4 mb-3 flex items-baseline gap-2 rounded-[14px] border border-dash bg-tile px-3 py-2.5">
            <div className="shrink-0 font-jua text-[15px]">올해 조심할 것</div>
            <p className="text-[14px] text-ink-soft">{f.caution}</p>
          </div>
          <div className="mx-4 mb-4 flex items-center gap-2 rounded-[14px] border-2 border-ink bg-field p-3">
            <img src="/art/poip-hanbok.webp" alt="" className={`w-14 shrink-0 ${f.golden ? "rotate-[12deg]" : "-rotate-[8deg]"}`} />
            <div><div className="font-jua text-[17px] text-red-title">포잎이의 한마디</div><p className="text-[14px] leading-snug">{f.cheer}</p></div>
          </div>
          <p className="pb-3 text-center text-[11px] text-muted">향수병 게임즈 · bok-fortune.vercel.app</p>
        </div>
        <Roller className="-mt-1" golden={f.golden} />
        <img src="/art/poip-hanbok.webp" alt="" className="absolute -top-[74px] -right-3.5 w-[84px] rotate-[10deg]" />
      </div>

      <div className="flex flex-col gap-2.5 px-[22px] pt-[22px]">
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={onSave} className="btn h-[54px] rounded-2xl bg-red text-[18px] text-on-red">
            카드 저장
          </button>
          <button onClick={onSend} className="btn h-[54px] rounded-2xl bg-gold text-[18px]">
            친구한테 보내기
          </button>
        </div>
        <div className="flex h-[54px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#B5A68E] font-jua text-[17px] text-faint">
          다시 뽑기 <span className="font-dodum text-[13px]">· 내일 0시에 새 복이 담겨요</span>
        </div>
        <button onClick={onOther} className="mt-1 self-center text-[14px] text-muted underline underline-offset-4">
          다른 사람 운세도 보기
        </button>
      </div>
    </section>
  );
}

function CardPreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-ink/80 p-5" onClick={onClose}>
      <img src={src} alt="내 운세 카드" className="max-h-[70dvh] w-auto max-w-full rounded-2xl" onClick={(e) => e.stopPropagation()} />
      <p className="text-center text-[15px] text-on-red">저장이 안 됐다면 이미지를 꾹 눌러서 저장하세요</p>
      <button className="btn h-12 rounded-2xl bg-gold px-8 text-[17px]" onClick={onClose}>
        닫기
      </button>
    </div>
  );
}
