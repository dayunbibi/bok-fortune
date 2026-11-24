// All the fortune text lives here. A fortune is picked from the name + today's date,
// so the same person gets the same result all day and a new one tomorrow.

export type Area = { key: string; label: string; stars: number; line: string };

export type Fortune = {
  name: string;
  date: string; // YYYY-MM-DD (local)
  stamp: string; // 大吉 / 吉 / 中吉 / 小吉
  total: [string, string];
  areas: Area[];
  food: string;
  color: { name: string; hex: string };
};

const TOTAL: [string, string][] = [
  ["천천히 가도 결국 닿는 해.", "포근한 소식이 먼저 찾아와요."],
  ["작게 시작한 일이 크게 자라는 해.", "첫 삽은 겨울에 뜨세요."],
  ["웃을 일이 자꾸 생기는 해.", "주변에 사람이 모여들어요."],
  ["미뤄둔 꿈에 다시 불이 붙는 해.", "올해는 진짜 시작해도 돼요."],
  ["멀리 있는 사람과 가까워지는 해.", "보고 싶다는 말이 닿아요."],
  ["쉬어가도 괜찮은 해.", "쉬는 동안 복이 차곡차곡 쌓여요."],
  ["새로운 곳에서 자리를 잡는 해.", "낯선 길이 금방 익숙해져요."],
  ["노력한 만큼 돌아오는 해.", "가을쯤 큰 선물이 기다려요."],
  ["좋은 사람이 먼저 손 내미는 해.", "반가운 연락을 놓치지 마세요."],
  ["걱정했던 일이 싱겁게 풀리는 해.", "생각보다 다 잘 돼요."],
  ["나를 조금 더 아껴주는 해.", "그럴수록 일도 술술 풀려요."],
  ["따뜻한 밥 한 끼에 힘이 나는 해.", "든든하게 챙겨 먹으면 다 이겨요."],
  ["반짝이는 기회가 두 번 오는 해.", "두 번째를 꼭 잡으세요."],
  ["꾸준함이 빛을 보는 해.", "매일 조금씩이 결국 이겨요."],
  ["집 생각이 덜 나는 해.", "어디서든 마음 붙일 곳이 생겨요."],
  ["용기 낸 만큼 넓어지는 해.", "해보고 싶던 걸 해보세요."],
];

// lines per area, grouped by how many stars they go with
const AREAS: { key: string; label: string; lines: Record<3 | 4 | 5, string[]> }[] = [
  {
    key: "love",
    label: "연애",
    lines: {
      5: ["먼저 건넨 안부 한 줄이 인연이 돼요.", "봄바람처럼 설레는 일이 생겨요.", "오래 알던 사람이 새롭게 보여요."],
      4: ["작은 배려가 마음을 움직여요.", "솔직한 한마디가 거리를 좁혀요.", "웃는 얼굴에 좋은 사람이 다가와요."],
      3: ["서두르지 않아도 때가 와요.", "나부터 아끼면 좋은 인연이 와요.", "친구 같은 편안함이 제일이에요."],
    },
  },
  {
    key: "work",
    label: "공부·일",
    lines: {
      5: ["미뤄둔 그 일, 봄이 오면 술술 풀려요.", "노력한 결과가 눈에 보이는 해예요.", "원하던 자리에 한 발 가까워져요."],
      4: ["꾸준히 하면 여름쯤 빛을 봐요.", "도와주는 사람이 곁에 있어요.", "새로 배운 게 큰 무기가 돼요."],
      3: ["작은 목표부터 하나씩 깨보세요.", "막힐 땐 산책이 답이에요.", "천천히 가도 방향만 맞으면 돼요."],
    },
  },
  {
    key: "money",
    label: "돈",
    lines: {
      5: ["생각지 못한 용돈이 들어와요.", "모아둔 돈이 든든한 힘이 돼요.", "들어오는 문이 하나 더 열려요."],
      4: ["새는 돈을 막으면 금방 모여요.", "할인 운이 좋아요. 장바구니를 챙기세요.", "작게 모은 돈이 연말에 웃게 해요."],
      3: ["작은 지출은 아끼고, 맛있는 건 아끼지 마요.", "충동구매는 하루만 참아보세요.", "지갑은 얇아도 마음은 부자예요."],
    },
  },
  {
    key: "health",
    label: "건강",
    lines: {
      5: ["몸도 마음도 가뿐한 한 해예요.", "잘 자고 잘 먹는 복이 있어요.", "걷는 만큼 기운이 솟아요."],
      4: ["따뜻한 국물 한 그릇이 보약이에요.", "물 자주 마시면 반짝반짝해요.", "스트레칭 5분이 큰 힘이 돼요."],
      3: ["무리하지 말고 일찍 자요.", "목 따뜻하게, 감기 조심해요.", "핸드폰 내려놓고 눈 좀 쉬어요."],
    },
  },
];

const FOODS = ["붕어빵", "호떡", "떡국", "약과", "식혜", "군고구마", "떡볶이", "어묵", "계란빵", "김밥", "귤", "수정과"];

const COLORS = [
  { name: "다홍색", hex: "#E8513A" },
  { name: "금색", hex: "#F2C14E" },
  { name: "연두색", hex: "#9CCB5A" },
  { name: "하늘색", hex: "#7FB3E0" },
  { name: "분홍색", hex: "#EE8FA6" },
  { name: "쪽빛", hex: "#4C7DB8" },
  { name: "보라색", hex: "#9B7BC4" },
  { name: "크림색", hex: "#FFF1CF" },
];

// small string hash (FNV-1a) -> seed for a tiny random number generator (mulberry32)
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function today(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function drawFortune(name: string, date = today()): Fortune {
  const rand = seeded(hash(`${name.trim()}|${date}`));
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];

  // stars are 3-5 so nobody gets a sad new year
  const areas = AREAS.map((a) => {
    const stars = (3 + Math.floor(rand() * 3)) as 3 | 4 | 5;
    return { key: a.key, label: a.label, stars, line: pick(a.lines[stars]) };
  });
  const avg = areas.reduce((sum, a) => sum + a.stars, 0) / areas.length;
  const stamp = avg >= 4.5 ? "大吉" : avg >= 4 ? "吉" : avg >= 3.5 ? "中吉" : "小吉";

  return { name: name.trim(), date, stamp, total: pick(TOTAL), areas, food: pick(FOODS), color: pick(COLORS) };
}

// 설날 2027 = Feb 6
export function daysToSeollal(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const seollal = new Date(2027, 1, 6);
  return Math.round((seollal.getTime() - start.getTime()) / 86_400_000);
}
