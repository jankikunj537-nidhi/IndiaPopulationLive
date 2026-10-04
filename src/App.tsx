import { useEffect, useMemo, useRef, useState } from "react";
import IndiaMap, { type MapFeature } from "./components/IndiaMap";

type StateData = { pop: number; mult: number };

const BASELINE = 1_493_119_816;
const YEARLY_CHANGE = 27_200_000;
const states: Record<string, StateData> = {
  "Andhra Pradesh":       { pop: 49.4,  mult: 0.9  },
  "Arunachal Pradesh":    { pop: 1.4,   mult: 1.1  },
  "Assam":                { pop: 31.2,  mult: 1.1  },
  "Bihar":                { pop: 103.8, mult: 1.3  },
  "Chhattisgarh":         { pop: 25.5,  mult: 1.3  },
  "Goa":                  { pop: 1.5,   mult: 1.0  },
  "Gujarat":              { pop: 60.4,  mult: 1.1  },
  "Haryana":              { pop: 25.4,  mult: 1.1  },
  "Himachal Pradesh":     { pop: 6.9,   mult: 0.9  },
  "Jharkhand":            { pop: 33.0,  mult: 1.3  },
  "Karnataka":            { pop: 61.1,  mult: 1.0  },
  "Kerala":               { pop: 33.4,  mult: 0.65 },
  "Madhya Pradesh":       { pop: 72.6,  mult: 1.3  },
  "Maharashtra":          { pop: 112.4, mult: 1.0  },
  "Manipur":              { pop: 2.7,   mult: 1.1  },
  "Meghalaya":            { pop: 3.0,   mult: 1.1  },
  "Mizoram":              { pop: 1.1,   mult: 1.0  },
  "Nagaland":             { pop: 2.0,   mult: 1.1  },
  "Odisha":               { pop: 41.9,  mult: 1.1  },
  "Punjab":               { pop: 27.7,  mult: 0.9  },
  "Rajasthan":            { pop: 68.6,  mult: 1.3  },
  "Sikkim":               { pop: 0.6,   mult: 1.0  },
  "Tamil Nadu":           { pop: 72.1,  mult: 0.65 },
  "Telangana":            { pop: 35.3,  mult: 1.0  },
  "Tripura":              { pop: 3.7,   mult: 1.0  },
  "Uttarakhand":          { pop: 10.1,  mult: 0.9  },
  "Uttar Pradesh":        { pop: 199.6, mult: 1.3  },
  "West Bengal":          { pop: 91.3,  mult: 0.9  },
  "Andaman and Nicobar Islands":              { pop: 0.4,   mult: 1.0  },
  "Chandigarh":           { pop: 1.1,   mult: 0.65 },
  "Dadra and Nagar Haveli and Daman and Diu": { pop: 0.6,   mult: 1.0  },
  "Delhi":                { pop: 16.8,  mult: 0.65 },
  "Jammu and Kashmir":    { pop: 12.3,  mult: 1.1  },
  "Ladakh":               { pop: 0.3,   mult: 1.0  },
  "Lakshadweep":          { pop: 0.06,  mult: 1.0  },
  "Puducherry":           { pop: 1.2,   mult: 0.9  },
};

const statePops: Record<string, number> = Object.fromEntries(
  Object.entries(states).map(([k, v]) => [k, v.pop])
);
const totalStatePopulation = Object.values(states).reduce((sum, s) => sum + s.pop, 0);
const totalWeight = Object.values(states).reduce((sum, s) => sum + s.pop * s.mult, 0);
const orderedStates = Object.keys(states).sort();

const STATE_BIRTH_RANK: Map<string, number> = new Map(
  Object.entries(states)
    .sort(([, a], [, b]) => b.pop * b.mult - a.pop * a.mult)
    .map(([name], i) => [name, i])
);
const N_STATES = Object.keys(states).length;
const maxBR = Math.max(...Object.values(states).map((s) => s.pop * s.mult));

function birthY(name: string): number {
  const rank = STATE_BIRTH_RANK.get(name) ?? N_STATES - 1;
  return 0.03 + (rank / (N_STATES - 1)) * 0.94;
}

const QUIZ_QUESTIONS = [
  {
    q: "Which state has India's largest projected population?",
    opts: ["Maharashtra", "Uttar Pradesh", "Bihar", "West Bengal"],
    ans: 1,
    fact: "UP alone accounts for ~12.8% of the national total — nearly 200 million people.",
  },
  {
    q: "Which state has the lowest growth multiplier in this model?",
    opts: ["Karnataka", "Assam", "Kerala", "Gujarat"],
    ans: 2,
    fact: "Kerala's 0.65× weight reflects its advanced demographic transition — the most complete in India.",
  },
  {
    q: "Which union territory has the smallest 2026 population?",
    opts: ["Chandigarh", "Ladakh", "Puducherry", "Lakshadweep"],
    ans: 3,
    fact: "Lakshadweep has ~64,000 residents — smaller than most Indian towns.",
  },
  {
    q: "Which state contributes most to India's projected birth count?",
    opts: ["Bihar", "Uttar Pradesh", "Rajasthan", "Maharashtra"],
    ans: 1,
    fact: "UP's 199.6M population × 1.3 growth weight gives the highest birth-rate contribution by far.",
  },
  {
    q: "Bihar's estimated 2026 population is closest to…",
    opts: ["104 million", "85 million", "125 million", "70 million"],
    ans: 0,
    fact: "Bihar has ~103.8 million people — more than Germany or Egypt.",
  },
  {
    q: "Which is the most populous state in northeast India?",
    opts: ["Manipur", "Tripura", "Assam", "Meghalaya"],
    ans: 2,
    fact: "Assam (~31M) is more than 10× larger than any other northeastern state.",
  },
  {
    q: "At this model's rate, how many people does India add per second?",
    opts: ["~0.44", "~0.86", "~1.40", "~2.10"],
    ans: 1,
    fact: "27.2M births/year ÷ 31,536,000 s/year ≈ 0.86 net additions per second.",
  },
  {
    q: "Which of these does NOT share the highest 1.3× growth weight?",
    opts: ["Bihar", "Gujarat", "Chhattisgarh", "Uttar Pradesh"],
    ans: 1,
    fact: "Gujarat carries a 1.1× weight. Bihar, Chhattisgarh, and UP all share the model's highest 1.3× rate.",
  },
  {
    q: "Which state is projected to have the second-largest population?",
    opts: ["Rajasthan", "Bihar", "Maharashtra", "Madhya Pradesh"],
    ans: 2,
    fact: "Maharashtra (~112M) ranks second — more than double the population of Rajasthan.",
  },
  {
    q: "Tamil Nadu and Kerala share which growth multiplier?",
    opts: ["1.3×", "1.1×", "1.0×", "0.65×"],
    ans: 3,
    fact: "Both Tamil Nadu and Kerala carry 0.65× — the lowest in the model — reflecting mature fertility transitions.",
  },
  {
    q: "Approximately what share of India's population lives in just three states — UP, Maharashtra, and Bihar?",
    opts: ["22%", "28%", "35%", "42%"],
    ans: 2,
    fact: "UP (~200M) + Maharashtra (~112M) + Bihar (~104M) ≈ 416M, which is roughly 28% of ~1.49 billion.",
  },
  {
    q: "Which state has the highest projected population density relative to its size in this model?",
    opts: ["Delhi", "Uttar Pradesh", "West Bengal", "Bihar"],
    ans: 0,
    fact: "Delhi packs ~16.8M people into just 1,484 km² — the highest density of any mapped region.",
  },
  {
    q: "Rajasthan is the largest state by area. Where does it rank by projected population?",
    opts: ["3rd", "5th", "7th", "9th"],
    ans: 1,
    fact: "Rajasthan (~68.6M) ranks 5th by population despite being India's largest state by land area.",
  },
  {
    q: "Which union territory shares the same 0.65× growth weight as Kerala and Tamil Nadu?",
    opts: ["Puducherry", "Chandigarh", "Delhi", "Ladakh"],
    ans: 2,
    fact: "Delhi carries 0.65×, reflecting its urban, educated demographic profile similar to the southern states.",
  },
  {
    q: "How many states and UTs in this model carry a 1.0× growth multiplier?",
    opts: ["4", "7", "10", "13"],
    ans: 2,
    fact: "Ten states/UTs carry exactly 1.0×: Goa, Karnataka, Maharashtra, Mizoram, Odisha, Sikkim, Telangana, Tripura, and two others.",
  },
  {
    q: "West Bengal's population is projected closest to…",
    opts: ["65 million", "78 million", "91 million", "105 million"],
    ans: 2,
    fact: "West Bengal has ~91.3M people — the fourth most populous state after UP, Maharashtra, and Bihar.",
  },
  {
    q: "Which of these states has a 0.9× growth weight, signalling a slowing birth rate?",
    opts: ["Jharkhand", "Punjab", "Assam", "Gujarat"],
    ans: 1,
    fact: "Punjab carries 0.9×, reflecting a more advanced fertility decline than the national average.",
  },
  {
    q: "Madhya Pradesh and Tamil Nadu have almost identical populations. Which is larger?",
    opts: ["Tamil Nadu (~72.1M)", "Madhya Pradesh (~72.6M)", "They are equal", "It changes yearly"],
    ans: 1,
    fact: "Madhya Pradesh (~72.6M) just edges out Tamil Nadu (~72.1M) in this model's projections.",
  },
  {
    q: "How does the model calculate the net annual change of 27.2 million?",
    opts: ["Census count", "Births minus deaths plus migration", "Satellite headcount", "UN fixed rate"],
    ans: 1,
    fact: "The 27.2M figure represents net additions (births − deaths + net migration), drawn from UN demographic estimates.",
  },
  {
    q: "Sikkim is India's least populous state. Its estimated population is closest to…",
    opts: ["600,000", "1.2 million", "2.5 million", "4 million"],
    ans: 0,
    fact: "Sikkim has only ~600,000 residents — fewer than many Indian cities and smaller than most urban districts.",
  },
];

function formatPopulation(value: number) {
  return Math.floor(value).toLocaleString("en-IN");
}

function Chakra() {
  return (
    <svg
      aria-hidden="true"
      className="size-11 shrink-0 animate-[spin_28s_linear_infinite]"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="7" fill="currentColor" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="50" y1="7" x2="50" y2="93" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 15} 50 50)`} />
      ))}
    </svg>
  );
}

/* ── Wanted design tokens ── */
const W = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  primary: "#0065FF",
  primaryBg: "#EBF1FF",
  primaryHover: "#0052CC",
  textPrimary: "#1A1A1A",
  textSecondary: "#767676",
  textMuted: "#B0B3BA",
  success: "#00B493",
  successBg: "#E6F7F3",
  danger: "#F04D51",
  dangerBg: "#FEF0F0",
  darkBg: "#111111",
  darkSurface: "#1C1C1E",
  darkBorder: "#2C2C2E",
  darkText: "#F5F5F5",
  darkMuted: "#8E8E93",
} as const;

export default function App() {
  const [dark, setDark] = useState(false);
  const [sound, setSound] = useState(false);
  const speed = 1;
  const [selected, setSelected] = useState("Uttar Pradesh");
  const [projected, setProjected] = useState(BASELINE);
  const [latest, setLatest] = useState("Uttar Pradesh");
  const [feed, setFeed] = useState<string[]>([]);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [featureMap, setFeatureMap] = useState<Map<string, MapFeature>>(new Map());
  const [xp, setXp] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChosen, setQuizChosen] = useState<number | null>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardTopPx, setCardTopPx] = useState(0);

  const selectedState = states[selected];
  const elapsed = useMemo(() => (projected - BASELINE) / YEARLY_CHANGE, [projected]);

  const panelState = hoveredState ?? selected;
  const panelData = states[panelState];
  const panelY = birthY(panelState);
  const panelFeature = featureMap.get(panelState);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const next = BASELINE + ((Date.now() - started) / 1000) * (YEARLY_CHANGE / 31_536_000) * speed;
      setProjected(next);
    }, 160);
    return () => window.clearInterval(timer);
  }, [speed]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const weighted = Math.random() * totalWeight;
      let tally = 0;
      const name =
        Object.keys(states).find((key) => {
          tally += states[key].pop * states[key].mult;
          return tally >= weighted;
        }) ?? "Uttar Pradesh";
      setLatest(name);
      setFeed((items) => [`Projection advanced · ${name}`, ...items].slice(0, 5));
      if (sound) navigator.vibrate?.(10);
    }, Math.max(520, 2400 / speed));
    return () => window.clearInterval(timer);
  }, [sound, speed]);

  const level = Math.floor(xp / 100) + 1;
  const levelXp = xp % 100;

  const selectState = (name: string) => setSelected(name);
  const handleQuizAnswer = (i: number) => {
    if (quizChosen !== null) return;
    const correct = i === QUIZ_QUESTIONS[quizIndex].ans;
    setQuizChosen(i);
    setXp((prev) => prev + (correct ? 25 : 5));
  };
  const nextQuestion = () => {
    setQuizIndex((prev) => prev + 1);
    setQuizChosen(null);
  };

  useEffect(() => {
    const container = panelContainerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;
    const cH = container.offsetHeight;
    const cardH = card.offsetHeight;
    const desired = panelY * cH - cardH / 2;
    setCardTopPx(Math.max(0, Math.min(cH - cardH, desired)));
  }, [panelY, panelState, panelFeature]);

  const handleHover = (name: string | null) => setHoveredState(name);
  const handleFeaturesLoaded = (feats: MapFeature[]) =>
    setFeatureMap(new Map(feats.map((f) => [f.name, f])));

  const d = dark;
  const surface = d ? W.darkSurface : W.surface;
  const bg = d ? W.darkBg : W.bg;
  const border = d ? W.darkBorder : W.border;
  const textPrimary = d ? W.darkText : W.textPrimary;
  const textSec = d ? W.darkMuted : W.textSecondary;
  const textMuted = d ? "#5A5A5E" : W.textMuted;

  void selectedState;
  void elapsed;
  void orderedStates;
  void feed;

  return (
    <main style={{ minHeight: "100%", background: bg, color: textPrimary, overflowX: "hidden" }}>
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-7 sm:py-7">

        {/* ── Header ── */}
        <header
          style={{ background: surface, borderColor: border }}
          className="relative flex flex-wrap items-center justify-between gap-5 overflow-hidden border rounded-xl px-5 py-4 sm:px-7 shadow-sm"
        >
          {/* Blue top accent line */}
          <div
            style={{ background: W.primary }}
            className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
          />
          <div className="flex items-center gap-4">
            <div style={{ color: W.primary }}><Chakra /></div>
            <div>
              <p
                style={{ color: W.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em" }}
                className="font-mono uppercase"
              >
                Estimate · Sept 2026
              </p>
              <h1 style={{ color: textPrimary }} className="text-xl font-bold tracking-tight sm:text-2xl mt-0.5">
                India population projection
              </h1>
              <p style={{ color: textSec }} className="mt-0.5 text-xs sm:text-sm">
                A rate-based national model, visualized continuously.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSound(!sound)}
              style={sound
                ? { background: W.primary, color: "#fff", borderColor: W.primary }
                : { background: "transparent", color: textSec, borderColor: border }
              }
              className="border rounded-lg px-3 py-2 font-mono text-xs transition-all duration-150 hover:border-[#0065FF] hover:text-[#0065FF]"
            >
              {sound ? "◉ HAPTIC ON" : "○ HAPTIC OFF"}
            </button>
            <button
              onClick={() => setDark(!dark)}
              style={{ background: "transparent", color: textSec, borderColor: border }}
              className="border rounded-lg px-3 py-2 font-mono text-xs transition-all duration-150 hover:border-[#0065FF] hover:text-[#0065FF]"
            >
              {dark ? "LIGHT" : "DARK"}
            </button>
          </div>
        </header>

        {/* ── Population counter ── */}
        <section
          style={{ background: surface, borderColor: border }}
          className="mt-4 overflow-hidden border rounded-xl shadow-sm"
        >
          <div style={{ background: W.primary }} className="h-0.5" />
          <div className="px-5 py-8 text-center sm:px-10 sm:py-10" style={{ background: W.primary }}>
            <p style={{ color: "#CBD5E1" }} className="font-mono text-[10px] font-semibold tracking-[0.22em] uppercase">
              Estimated population · September 2026 baseline
            </p>
            <div
              style={{ color: "#F1F5F9", fontVariantNumeric: "tabular-nums" }}
              className="mt-2 text-[clamp(1.5rem,8vw,6.5rem)] font-bold leading-none tracking-[-0.04em]"
            >
              {formatPopulation(projected)}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
              <span
                style={{ borderColor: W.success + "66", background: W.successBg, color: W.success }}
                className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 font-mono"
              >
                <span className="inline-block size-1.5 animate-pulse rounded-full" style={{ background: W.success }} />
                MODEL RUNNING
              </span>
              <span style={{ borderColor: "#ffffff", background: "#ffffff", color: textSec }} className="border rounded-full px-3 py-1.5 font-mono">
                +{(YEARLY_CHANGE / 31_536_000).toFixed(2)} net people / sec
              </span>
              <span style={{ borderColor: "#ffffff", background: "#ffffff", color: textSec }} className="border rounded-full px-3 py-1.5 font-mono">
                UN-derived rate model
              </span>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(330px,.75fr)]">

          {/* ── Map section ── */}
          <section
            style={{ background: surface, borderColor: border }}
            className="border rounded-xl shadow-sm p-4 sm:p-6"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p style={{ color: textMuted }} className="font-mono text-[10px] font-semibold tracking-[.2em] uppercase">Population distribution</p>
                <h2 style={{ color: textPrimary }} className="text-xl font-bold mt-0.5">States &amp; territories</h2>
              </div>
            </div>

            <div
              style={{ borderColor: border, background: d ? "#0A0A0C" : "#F0F4FF" }}
              className="relative border rounded-xl overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Map — full on mobile, 50% on sm+ */}
                <div className="w-full sm:w-1/2 min-w-0">
                  <IndiaMap
                    selected={selected}
                    latest={latest}
                    onStateClick={selectState}
                    onStateHover={handleHover}
                    onFeaturesLoaded={handleFeaturesLoaded}
                    statePops={statePops}
                    dark={dark}
                  />
                </div>

                {/* Sliding detail panel — 50% */}
                <div
                  ref={panelContainerRef}
                  style={{ borderColor: border }}
                  className="relative w-full sm:w-1/2 shrink-0 sm:overflow-hidden border-t sm:border-t-0 sm:border-l"
                >
                  {panelData && (
                    <div
                      ref={cardRef}
                      className="panel-card absolute left-0 right-0 sm:right-7 px-3"
                      style={{
                        top: `${cardTopPx}px`,
                        transition: "top 480ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      {/* Arrow — only on desktop where map is to the left */}
                      <div className="hidden sm:block" style={{ position: "absolute", left: 0, top: "50%", transform: "translateX(-100%) translateY(-50%)", width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: `10px solid ${border}` }} />
                      <div className="hidden sm:block" style={{ position: "absolute", left: 1, top: "50%", transform: "translateX(-100%) translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: `9px solid ${surface}` }} />

                      {/* Card */}
                      <div
                        style={{ background: surface, borderColor: border }}
                        className="rounded-xl border shadow-md overflow-hidden"
                      >
                        <div style={{ background: W.primary }} className="h-0.5" />

                        <div className="p-3">
                          <p style={{ color: textMuted }} className="font-mono text-[9px] tracking-widest uppercase">
                            {hoveredState ? "Hovering" : "Selected"}
                          </p>
                          <p style={{ color: W.primary }} className="mt-0.5 text-base font-bold leading-tight">
                            {panelState}
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                            {[
                              { label: "Population", value: (panelData.pop * 1_000_000).toLocaleString("en-IN"), accent: false },
                              { label: "Share", value: `${((panelData.pop / totalStatePopulation) * 100).toFixed(1)}%`, accent: false },
                              { label: "Growth wt.", value: `${panelData.mult.toFixed(2)}×`, accent: true },
                              { label: "Birth rank", value: `${(((panelData.pop * panelData.mult) / maxBR) * 100).toFixed(1)}%`, accent: false },
                            ].map(({ label, value, accent }) => (
                              <div key={label}>
                                <p style={{ color: textMuted }} className="font-mono text-[8px] tracking-wider uppercase">{label}</p>
                                <p
                                  style={{
                                    color: accent ? W.primary : textPrimary,
                                    letterSpacing: "0.1em",
                                    ...(label === "Population" ? { background: "#ffffff", border: "1px solid #000000", padding: "2px 4px", color: "#020617" } : {}),
                                  }}
                                  className="font-mono text-[11px] font-semibold tabular-nums"
                                >
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>

                          {latest === panelState && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="inline-block size-1.5 shrink-0 rounded-full animate-pulse" style={{ background: W.success }} />
                              <p style={{ color: W.success }} className="font-mono text-[8px] font-semibold">ACTIVE</p>
                            </div>
                          )}
                        </div>

                        {panelFeature && (
                          <div style={{ borderColor: border }} className="border-t">
                            <p style={{ color: textMuted }} className="px-3 pt-2 font-mono text-[8px] tracking-widest uppercase">Boundary</p>
                            <div className="relative mx-auto px-3 pb-3" style={{ maxHeight: 160 }}>
                              <svg
                                viewBox={panelFeature.viewBox}
                                width="100%"
                                style={{ display: "block", maxHeight: 140 }}
                                aria-label={`Shape of ${panelState}`}
                              >
                                <path
                                  d={panelFeature.d}
                                  fill={panelFeature.baseFill}
                                  fillOpacity={0.15}
                                  stroke="none"
                                  transform="translate(1,2)"
                                />
                                <path
                                  d={panelFeature.d}
                                  fill={panelFeature.baseFill}
                                  fillOpacity={0.8}
                                  stroke={W.primary}
                                  strokeWidth={1.5}
                                  strokeOpacity={latest === panelState ? 1 : 0.5}
                                  vectorEffect="non-scaling-stroke"
                                />
                                {latest === panelState && (
                                  <path
                                    d={panelFeature.d}
                                    fill="none"
                                    stroke={W.primary}
                                    strokeWidth={4}
                                    strokeOpacity={0.2}
                                    vectorEffect="non-scaling-stroke"
                                  />
                                )}
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Vertical density indicator — right rail ── */}
                  {panelData && (() => {
                    const vals = Object.values(statePops).filter(Boolean);
                    const maxPop = vals.length ? Math.max(...vals) : 1;
                    const curPop = statePops[panelState] ?? 0;
                    // densityPos: 0 = highest density (top), 1 = lowest (bottom)
                    const densityPos = 1 - curPop / maxPop;
                    const fmtM = (n: number) => `${(n / 1_000_000).toFixed(0)}M`;

                    return (
                      <div
                        className="hidden sm:flex flex-col items-center"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 28,
                          borderLeft: `1px solid ${border}`,
                          padding: "10px 0 8px",
                          pointerEvents: "none",
                        }}
                      >
                        {/* HIGH label */}
                        <span style={{ fontSize: 6, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.14em", color: W.primary }}>
                          HIGH
                        </span>

                        {/* Track + marker */}
                        <div style={{ flex: 1, position: "relative", display: "flex", justifyContent: "center", marginTop: 5, marginBottom: 5 }}>
                          {/* Gradient bar — blue at top (high), white at bottom (low) */}
                          <div
                            style={{
                              width: 6,
                              height: "100%",
                              borderRadius: 4,
                              background: "linear-gradient(to bottom, #0065FF 0%, #8FA8C8 50%, #FFFFFF 100%)",
                              border: `1px solid rgba(0,101,255,0.25)`,
                              boxShadow: "0 0 8px rgba(0,101,255,0.18)",
                            }}
                          />

                          {/* Tick + pop value at top */}
                          <div style={{ position: "absolute", top: 0, left: "calc(50% + 5px)", display: "flex", alignItems: "center", gap: 1, transform: "translateY(-50%)" }}>
                            <div style={{ width: 4, height: 1, background: textMuted, opacity: 0.5 }} />
                            <span style={{ fontSize: 5.5, fontFamily: "monospace", color: W.primary, whiteSpace: "nowrap" }}>{fmtM(maxPop)}</span>
                          </div>

                          {/* Tick + pop value at mid */}
                          <div style={{ position: "absolute", top: "50%", left: "calc(50% + 5px)", display: "flex", alignItems: "center", gap: 1, transform: "translateY(-50%)" }}>
                            <div style={{ width: 3, height: 1, background: textMuted, opacity: 0.35 }} />
                            <span style={{ fontSize: 5.5, fontFamily: "monospace", color: textMuted, whiteSpace: "nowrap" }}>{fmtM(maxPop / 2)}</span>
                          </div>

                          {/* Tick + pop value at bottom */}
                          <div style={{ position: "absolute", top: "100%", left: "calc(50% + 5px)", display: "flex", alignItems: "center", gap: 1, transform: "translateY(-50%)" }}>
                            <div style={{ width: 4, height: 1, background: textMuted, opacity: 0.5 }} />
                            <span style={{ fontSize: 5.5, fontFamily: "monospace", color: textMuted, whiteSpace: "nowrap" }}>0</span>
                          </div>

                          {/* Sliding marker — shows current state's density position */}
                          <div
                            style={{
                              position: "absolute",
                              top: `${densityPos * 100}%`,
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              transition: "top 480ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: W.primary,
                              border: `2px solid ${surface}`,
                              boxShadow: "0 0 6px rgba(0,101,255,0.6)",
                              zIndex: 2,
                            }}
                          />

                          {/* Population label next to marker */}
                          <div
                            style={{
                              position: "absolute",
                              top: `${densityPos * 100}%`,
                              right: "calc(50% + 9px)",
                              transform: "translateY(-50%)",
                              transition: "top 480ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                              pointerEvents: "none",
                            }}
                          >
                            <span style={{ fontSize: 5.5, fontFamily: "monospace", fontWeight: 700, color: W.primary, whiteSpace: "nowrap" }}>
                              {fmtM(curPop)}
                            </span>
                          </div>
                        </div>

                        {/* LOW label */}
                        <span style={{ fontSize: 6, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.14em", color: textMuted }}>
                          LOW
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Legend */}
              <div
                style={{ borderColor: border, color: textMuted }}
                className="flex items-center gap-3 border-t px-4 py-3 font-mono text-[10px]"
              >
                <span>Lower density</span>
                <div className="h-2 flex-1 rounded-full bg-[linear-gradient(90deg,#FFFFFF,#0065FF)]" style={{ maxWidth: "223px" }} />
                <span>Higher density</span>
              </div>
            </div>
          </section>

          {/* ── Quiz aside ── */}
          <aside
            style={{ background: "rgb(0, 0, 0)", borderColor: border }}
            className="border rounded-xl shadow-sm p-5 sm:p-6"
          >
            {/* XP bar */}
            <div style={{ borderColor: border }} className="mb-6 pb-5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p style={{ color: "#ffffff" }} className="font-mono text-[10px] font-semibold tracking-[.2em] uppercase">Janma Quiz</p>
                  <span
                    style={{ borderColor: W.primary + "55", background: W.primaryBg, color: W.primary }}
                    className="rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold"
                  >
                    LVL {level}
                  </span>
                </div>
                <span key={xp} style={{ color: W.primary, fontStyle: "italic" }} className="font-mono text-sm font-bold transition-all duration-300">{xp} XP</span>
              </div>
              <div style={{ background: d ? "#2C2C2E" : "#E5E7EB" }} className="mt-2.5 h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${levelXp}%`, background: `linear-gradient(90deg, ${W.success}, #fff 50%, ${W.primary})` }}
                />
              </div>
              <p style={{ color: "#ffffff" }} className="mt-1 font-mono text-[12px]">{levelXp}/100 · {100 - levelXp} XP to level {level + 1}</p>
            </div>

            {quizIndex >= QUIZ_QUESTIONS.length ? (
              <div className="py-8 text-center">
                <p style={{ color: textMuted }} className="font-mono text-[10px] tracking-widest uppercase">Quiz complete</p>
                <p style={{ color: W.primary }} className="mt-3 text-5xl font-bold">{xp}</p>
                <p style={{ color: textSec }} className="mt-1 font-mono text-xs">XP earned this session</p>
                <div style={{ borderColor: border, color: textSec }} className="mt-6 border-t pt-5 text-sm">
                  {xp >= 160
                    ? "Outstanding — demographic expert."
                    : xp >= 100
                    ? "Good work — solid understanding."
                    : "Keep exploring the map to learn more."}
                </div>
                <button
                  onClick={() => { setQuizIndex(0); setQuizChosen(null); }}
                  style={{ background: W.primary, color: "#fff" }}
                  className="mt-6 rounded-lg px-6 py-2.5 font-mono text-xs font-semibold transition hover:opacity-90"
                >
                  RESTART QUIZ →
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <span style={{ color: "#ffffff" }} className="font-mono text-[12px] tracking-widest">Q {quizIndex + 1} / {QUIZ_QUESTIONS.length}</span>
                  <div style={{ background: "rgba(255,255,255,0.3)" }} className="flex-1 h-px" />
                  <span style={{ color: "#ffffff" }} className="font-mono text-[12px] uppercase">Demographics</span>
                </div>

                <p style={{ color: "#ffffff" }} className="mb-5 text-base font-semibold leading-snug">
                  {QUIZ_QUESTIONS[quizIndex].q}
                </p>

                <div className="space-y-2">
                  {QUIZ_QUESTIONS[quizIndex].opts.map((opt, i) => {
                    const answered = quizChosen !== null;
                    const isCorrect = i === QUIZ_QUESTIONS[quizIndex].ans;
                    const isChosen = quizChosen === i;

                    let btnStyle: React.CSSProperties = {};
                    let btnClass = "w-full text-left border rounded-lg px-3 py-2.5 font-mono text-xs transition-all duration-150 ";

                    if (!answered) {
                      btnStyle = { borderColor: "rgba(255,255,255,0.4)", background: "transparent", color: "#ffffff" };
                      btnClass += "hover:border-white hover:bg-white/20 hover:text-white";
                    } else if (isCorrect) {
                      btnStyle = { borderColor: W.success + "99", background: W.successBg, color: W.success };
                    } else if (isChosen) {
                      btnStyle = { borderColor: W.danger + "99", background: W.dangerBg, color: W.danger };
                    } else {
                      btnStyle = { borderColor: border, background: "transparent", color: textMuted };
                    }

                    return (
                      <button
                        key={i}
                        disabled={answered}
                        onClick={() => handleQuizAnswer(i)}
                        style={btnStyle}
                        className={btnClass}
                      >
                        <span className="mr-2.5 opacity-40">{["A", "B", "C", "D"][i]}</span>
                        {opt}
                        {answered && isCorrect && <span className="float-right">✓</span>}
                        {answered && isChosen && !isCorrect && <span className="float-right">✗</span>}
                      </button>
                    );
                  })}
                </div>

                {quizChosen !== null && (
                  <div style={{ borderColor: border }} className="mt-5 border-t pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {quizChosen === QUIZ_QUESTIONS[quizIndex].ans ? (
                          <p style={{ color: "rgb(184, 255, 227)" }} className="font-mono text-xs font-bold">✓ Correct</p>
                        ) : (
                          <p style={{ color: W.danger }} className="font-mono text-xs font-bold">✗ Incorrect</p>
                        )}
                        <p style={{ color: "#ffffff" }} className="font-mono text-[10px] mt-0.5">
                          +{quizChosen === QUIZ_QUESTIONS[quizIndex].ans ? 25 : 5} XP earned
                        </p>
                      </div>
                      <button
                        onClick={nextQuestion}
                        style={{ background: W.primary, color: "#fff" }}
                        className="shrink-0 rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold transition hover:opacity-90"
                      >
                        {quizIndex === QUIZ_QUESTIONS.length - 1 ? "FINISH →" : "NEXT →"}
                      </button>
                    </div>
                    <p style={{ color: textSec }} className="mt-3 text-[11px] leading-relaxed">
                      {QUIZ_QUESTIONS[quizIndex].fact}
                    </p>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>

        <footer style={{ color: textMuted }} className="mx-auto max-w-4xl py-7 text-center text-xs leading-5">
          This display is an illustrative demographic projection. It begins from a reference population and applies a modelled net annual change continuously; a changing digit does not identify or report an individual birth.
        </footer>
      </div>
    </main>
  );
}
