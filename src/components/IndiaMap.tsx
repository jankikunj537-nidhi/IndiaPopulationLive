import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath, scaleLinear } from "d3";
import { merge } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

export interface MapFeature {
  name: string;
  d: string;
  viewBox: string;
  baseFill: string;
  sqrtPop: number;
  cx: number;
  cy: number;
}

interface IndiaMapProps {
  selected: string;
  latest: string;
  onStateClick: (name: string) => void;
  onStateHover?: (name: string | null) => void;
  onFeaturesLoaded?: (features: MapFeature[]) => void;
  statePops: Record<string, number>;
  dark?: boolean;
}

// Sine-wave cubic-bezier path (period P divides evenly into width for seamless loop)
function wavePath(y: number, A: number, P: number, width: number): string {
  const cp = P * 0.265;
  let d = `M 0,${y.toFixed(1)}`;
  for (let x = 0; x < width; x += P) {
    d += ` C ${(x + cp).toFixed(1)},${(y - A).toFixed(1)} ${(x + P / 2 - cp).toFixed(1)},${(y - A).toFixed(1)} ${(x + P / 2).toFixed(1)},${y.toFixed(1)}`;
    d += ` C ${(x + P / 2 + cp).toFixed(1)},${(y + A).toFixed(1)} ${(x + P - cp).toFixed(1)},${(y + A).toFixed(1)} ${(x + P).toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

const TOPO_URL =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/india.json";

export default function IndiaMap({
  selected,
  latest,
  onStateClick,
  onStateHover,
  onFeaturesLoaded,
  statePops,
  dark,
}: IndiaMapProps) {
  // Store raw features (geometry + sqrtPop); colors applied at render time
  const [rawFeatures, setRawFeatures] = useState<MapFeature[]>([]);
  const [flashing, setFlashing] = useState("");
  const [flashKey, setFlashKey] = useState(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredNameRef = useRef<string | null>(null);

  // Stable ref so the fetch effect can call the latest callback without
  // listing it as a dependency (which would re-run the fetch).
  const onFeaturesLoadedRef = useRef(onFeaturesLoaded);
  onFeaturesLoadedRef.current = onFeaturesLoaded;

  useEffect(() => {
    let cancelled = false;
    fetch(TOPO_URL)
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (cancelled) return;

        const obj = topo.objects[
          Object.keys(topo.objects)[0]
        ] as GeometryCollection<{ st_nm?: string }>;

        const stateNames = Array.from(
          new Set(obj.geometries.map((g) => g.properties?.st_nm ?? ""))
        ).filter(Boolean);

        const geoms = stateNames.map((name) => ({
          name,
          geom: merge(
            topo as Parameters<typeof merge>[0],
            obj.geometries.filter((g) => g.properties?.st_nm === name)
          ),
        }));

        const fc: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: geoms.map(({ name, geom }) => ({
            type: "Feature" as const,
            properties: { name },
            geometry: geom,
          })),
        };

        const projection = geoMercator().fitExtent([[24, 18], [356, 422]], fc);
        const pathGen = geoPath(projection);

        const computed: MapFeature[] = geoms
          .map(({ name, geom }) => {
            const d = pathGen(geom as Parameters<typeof pathGen>[0]);
            if (!d) return null;
            const pop = statePops[name] ?? 0;
            const sqrtPop = Math.sqrt(pop);

            const b = pathGen.bounds(geom as Parameters<typeof pathGen>[0]);
            const bw = b[1][0] - b[0][0];
            const bh = b[1][1] - b[0][1];
            const pad = Math.max(3, Math.min(18, Math.max(bw, bh) * 0.1));
            const viewBox = `${b[0][0] - pad} ${b[0][1] - pad} ${bw + pad * 2} ${bh + pad * 2}`;

            // Centroid via bounding-box centre (good enough for labels)
            const cx = (b[0][0] + b[1][0]) / 2;
            const cy = (b[0][1] + b[1][1]) / 2;

            // baseFill placeholder; overwritten by coloredFeatures below
            return { name, d, viewBox, baseFill: "#E0E4EC", sqrtPop, cx, cy };
          })
          .filter((f): f is MapFeature => f !== null);

        setRawFeatures(computed);
        // Call directly here — never from a useEffect that depends on derived state
        onFeaturesLoadedRef.current?.(computed);
      })
      .catch(() => {});

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Color scale recomputed at render time so theme changes apply instantly
  const colorScale = useMemo(() => {
    const maxSqrt = Math.sqrt(Math.max(...Object.values(statePops), 1));
    return scaleLinear<string>()
      .domain([0, maxSqrt / 2, maxSqrt])
      .range(["#FFFFFF", "#8FA8C8", "#0065FF"]);
  }, [statePops]);

  // Apply current colors at render time — no setState, no loop
  const coloredFeatures = useMemo(
    () => rawFeatures.map((f) => ({
      ...f,
      baseFill: f.sqrtPop > 0 ? colorScale(f.sqrtPop) : "#E0E4EC",
    })),
    [rawFeatures, colorScale]
  );

  useEffect(() => {
    if (!latest) return;
    setFlashing(latest);
    setFlashKey((k) => k + 1);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashing(""), 700);
  }, [latest]);

  // Wave config: period=76 divides evenly into 380 → seamless 50% translateX loop
  const waveColor = dark ? "#ffffff" : "#000000";
  const waveBg = dark ? "#000000" : "#ffffff";

  // 18 waves, staggered vertically; viewBox 760×440 = 2× container width
  const waveRows = Array.from({ length: 18 }, (_, i) => {
    const y = 13 + i * 24;
    const A = 3 + (i % 4);
    const sw = i % 3 === 2 ? 1.2 : 0.65;
    const op = 0.18 + (i % 5) * 0.07;
    return { y, A, sw, op };
  });

  return (
    <div style={{ aspectRatio: "380 / 440", boxShadow: "rgba(0, 0, 0, 0.25) 6px 7px 25px 0px", position: "relative", overflow: "hidden" }}>
      {/* Layer 0 — animated water-wave background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: waveBg, pointerEvents: "none" }}>
        <svg
          viewBox="0 0 760 440"
          width="200%"
          height="100%"
          preserveAspectRatio="none"
          style={{ display: "block", animation: "waveFlow 14s linear infinite" }}
        >
          {waveRows.map(({ y, A, sw, op }, i) => (
            <path
              key={i}
              d={wavePath(y, A, 76, 760)}
              stroke={waveColor}
              strokeWidth={sw}
              fill="none"
              opacity={op}
            />
          ))}
        </svg>
      </div>

      {/* Layer 1 — 3D perspective container */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, perspective: "900px", perspectiveOrigin: "50% 35%" }}>
        {/* Tilted stage — map + overlay share this transform so +1 labels stay on-state */}
        <div style={{ position: "absolute", inset: 0, transform: "rotateX(16deg)", transformOrigin: "center 68%" }}>
          {coloredFeatures.length === 0 ? (
            <div
              className="flex h-full items-center justify-center font-mono text-[11px] tracking-widest"
              style={{ color: "#B0B3BA" }}
            >
              LOADING MAP…
            </div>
          ) : (
            <svg
              viewBox="0 0 380 440"
              width="100%"
              height="100%"
              style={{ display: "block" }}
              onMouseLeave={() => {
                hoveredNameRef.current = null;
                onStateHover?.(null);
              }}
            >
              <defs>
                <filter id="topFaceGlow" x="-4%" y="-4%" width="108%" height="108%">
                  <feDropShadow dx="0" dy="-1" stdDeviation="1.5"
                    floodColor={dark ? "rgba(96,172,255,0.25)" : "rgba(0,101,255,0.18)"} />
                </filter>
              </defs>

              {/* Extrusion layers — deepest first so top faces paint over them */}
              {([
                { dx: 1.8, dy: 9,   op: dark ? 0.75 : 0.60 },
                { dx: 1.0, dy: 5,   op: dark ? 0.55 : 0.42 },
                { dx: 0.4, dy: 2.2, op: dark ? 0.35 : 0.26 },
              ] as const).map(({ dx, dy, op }) =>
                coloredFeatures.map((f) => (
                  <path
                    key={`ext-${dy}-${f.name}`}
                    d={f.d}
                    fill={dark ? `rgba(0,0,0,${op})` : `rgba(0,18,55,${op})`}
                    stroke="none"
                    transform={`translate(${dx},${dy})`}
                    style={{ pointerEvents: "none" }}
                  />
                ))
              )}

              {/* Top faces — interactive */}
              <g filter="url(#topFaceGlow)">
                {coloredFeatures.map((f) => {
                  const isSelected = selected === f.name;
                  const isFlashing = flashing === f.name;
                  return (
                    <path
                      key={f.name}
                      d={f.d}
                      fill={isFlashing ? "#60ACFF" : f.baseFill}
                      stroke={isSelected ? "#0065FF" : (dark ? "#2C2C3A" : "#D1D8EE")}
                      strokeWidth={isSelected ? 2.5 : 0.6}
                      onClick={() => onStateClick(f.name)}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => {
                        hoveredNameRef.current = f.name;
                        onStateHover?.(f.name);
                      }}
                      onMouseLeave={() => {
                        hoveredNameRef.current = null;
                        onStateHover?.(null);
                      }}
                    />
                  );
                })}
              </g>
            </svg>
          )}

          {/* +1 overlay — inside the tilted stage so it follows the map in 3D space */}
          {flashing && (() => {
            const f = coloredFeatures.find((x) => x.name === flashing);
            if (!f) return null;
            return (
              <div
                key={flashKey}
                style={{
                  position: "absolute",
                  zIndex: 2,
                  left: `${(f.cx / 380) * 100}%`,
                  top: `${(f.cy / 440) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  animation: "birthPop 0.7s ease-out forwards",
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  color: dark ? "#ffffff" : "#0065FF",
                  textShadow: dark
                    ? "0 0 6px rgba(96,172,255,0.8)"
                    : "0 0 6px rgba(0,101,255,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                +1
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
