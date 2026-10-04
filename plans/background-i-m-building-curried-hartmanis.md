# Plan: Cherry Blossom × Bubblegum Pop Theme Swap

## Context

The user provided two reference palettes — **Cherry Blossom** (`#F2C7C7`, `#FFFFFF`, `#D5F3D8`, `#FFB7C5`) and **Bubblegum Pop** (`#FF69B4`, `#069494`, `#FFFFFF`, `#00F0FF`) — and wants the overall look of the India Population Estimator dashboard to adopt these colours. The current app is dark-navy with Indian tricolor accents (saffron `#ff9933`, green `#138808`, orange `#f97316`). The redesign replaces those with a light, vibrant palette while keeping the demographic content, layout, and interactivity untouched.

---

## Derived Theme Tokens

| Role | Old value | New value |
|---|---|---|
| Page background | `#080c18` (dark) / `#f4f1ea` (light) | `#FFF0F6` (light blush) — **set as default** |
| Section / header surface | `#10192d` | `#FFFFFF` |
| Map-area wrapper | `#091321` | `#FFF5F8` |
| Detail panel card | `#0b1d32` | `#FFFFFF` |
| Inner stat tile | `#0c1425` | `#FFEEF6` |
| Map bg gradient | `#020e1c → #031c33 → #010a14` | `#FFF0F6 → #E8F7F6 → #FFF5F8` |
| Primary accent (saffron) | `#ff9933` | `#FF69B4` |
| Gold text accent | `#ffad4e` / `#ffb35c` | `#FF69B4` |
| Secondary accent (green) | `#138808` / `#15803d` | `#069494` |
| High-density / stroke | `#f97316` | `#FF69B4` |
| Birth-event flash | `#6366f1` | `#00F0FF` |
| Map low-density fill | `#15803d` | `#069494` |
| Map mid fill | `#e8e8e8` | `#FFFFFF` |
| Map high-density fill | `#f97316` | `#FF69B4` |
| No-data state fill | `#1e3a5f` | `#F2C7C7` |
| Default state stroke | `#0f2a45` | `#FFD0DC` |
| Hover glow | `rgba(249,115,22,0.5)` | `rgba(255,105,180,0.5)` |
| Chakra icon | `text-[#60a5fa]` | `text-[#069494]` |
| Text primary | `text-slate-100` | `text-[#2d1020]` |
| Text secondary | `text-slate-300/400` | `text-[#7a3060]` / `text-[#b080a0]` |
| Borders strong | `border-slate-700` | `border-[#F2C7C7]` |
| Borders subtle | `border-slate-600` | `border-[#FFD0DC]` |
| Quiz correct | `emerald-*` | `#069494` / `#D5F3D8` |
| Quiz wrong | `rose-*` | `#FF69B4` / `#FFE8F2` |
| Legend gradient | `#15803d → #fff → #f97316` | `#069494 → #fff → #FF69B4` |
| Header tricolor strip | `#ff9933 → #fff → #138808` | `#FF69B4 → #fff → #069494` |
| XP progress bar | `#138808 → #fff → #ff9933` | `#D5F3D8 → #fff → #FF69B4` |
| Arrow (inner) | `#0b1d32` | `#FFFFFF` |
| Arrow (outer) | `rgba(71,85,105,0.45)` | `rgba(242,199,199,0.8)` |
| Button active (haptic) | `bg-[#ff9933] text-slate-950` | `bg-[#FF69B4] text-white` |
| Option bg | `bg-slate-900` | `bg-[#FFF0F6]` |

**Default mode:** flip `useState(true)` → `useState(false)` so the app opens in light/cherry mode. Dark toggle still works.

---

## Files to Modify

### `src/App.tsx`
1. `useState(true)` → `useState(false)` (dark default)
2. All `bg-[#...]` surfaces: map per token table above
3. All `border-slate-*` → `border-[#F2C7C7]` / `border-[#FFD0DC]`
4. All `text-slate-*` → new mauve text tokens
5. All `#ff9933` instances → `#FF69B4`
6. All `#138808` / `#15803d` → `#069494`
7. All `#ffad4e` / `#ffb35c` → `#FF69B4`
8. `text-[#60a5fa]` → `text-[#069494]`
9. `text-[#79b7ff]` → `text-[#069494]`
10. All `emerald-*` classes → teal equivalents (`border-[#069494]`, `bg-[#D5F3D8]/60`, `text-[#069494]`)
11. All `rose-*` classes → pink equivalents (`border-[#FF69B4]`, `bg-[#FFE8F2]`, `text-[#FF69B4]`)
12. Header gradient strip inline → `#FF69B4 → #fff → #069494`
13. XP bar gradient inline → `#D5F3D8,#fff 50%,#FF69B4`
14. Legend bar → `#069494,#ffffff,#FF69B4`
15. Arrow borders inline → new values
16. Mini-map SVG stroke `#f97316` → `#FF69B4`
17. Light-mode classes (`bg-[#f4f1ea]`, `border-stone-300`, `bg-white`) — these become the main light mode, keep them or collapse with the new default tokens
18. `bg-slate-900` on `<option>` → `bg-[#FFF0F6]`
19. `text-slate-950` on active button → `text-white`

### `src/components/IndiaMap.tsx`
1. Map background gradient: `#020e1c/#031c33/#010a14` → `#FFF0F6/#E8F7F6/#FFF5F8`
2. Color scale range: `["#15803d", "#e8e8e8", "#f97316"]` → `["#069494", "#FFFFFF", "#FF69B4"]`
3. No-data fill: `#1e3a5f` → `#F2C7C7`
4. Default stroke: `#0f2a45` → `#FFD0DC`
5. Selected stroke: `#f97316` → `#FF69B4`
6. Flash fill: `#6366f1` → `#00F0FF`
7. Hover glow drop-shadow: `rgba(249,115,22,0.5)` → `rgba(255,105,180,0.5)`
8. Loading text `text-slate-500` → `text-[#b080a0]`

### `src/index.css`
No color changes needed — only font and reset rules exist.

---

## Verification
1. `pnpm build` — should pass cleanly
2. Open preview — default view should be light blush/pink/teal, not dark navy
3. Click states on the map — map fills use teal→white→pink scale, selected stroke is hot pink
4. Birth-event flash on map — cyan `#00F0FF` pulse
5. Quiz card — correct answers highlight teal, wrong answers highlight pink
6. XP bar — pink/teal tricolor gradient fills smoothly
7. Toggle "DARK FIELD" — reverts to existing dark-navy look

---

# Plan: Integrate map_v2.html D3/TopoJSON Map into App.tsx (archived)

## Context

The current App.tsx renders India's states as hand-placed SVG `<rect>` elements clipped to an approximate outline path, covering only 21 states. The `map_v2.html` file contains a complete, geography-accurate D3+TopoJSON map with all 36 states/UTs, a tricolor population-density color scale, selection highlighting, and birth-event flash animation. The goal is to extract that map logic into a proper React component and wire it into the existing dashboard, replacing the rect cartogram with real geographic boundaries.

---

## Approach

### 1. Create `src/components/IndiaMap.tsx`

A React component that owns all D3 rendering logic inside a `useRef`-attached SVG container.

**Props:**
```typescript
interface IndiaMapProps {
  selected: string;         // canonical state name (TopoJSON names)
  latest: string;           // state that just had a projected birth event
  onStateClick: (name: string) => void;
  dark?: boolean;
}
```

**Implementation details:**

- **Mount effect** (runs once): fetch TopoJSON from `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/india.json`, build state-level polygons via `topojson.merge()`, create `d3.geoMercator().fitExtent()` projection, append `<svg viewBox="0 0 380 440">`, draw paths with fill from the tricolor scale, attach click handlers that call `onStateClick(stateName)`.
- **Selection effect** (watches `selected`): reset all paths to their density fill; set selected path stroke to `#f97316` (saffron, matching app's tricolor accent) at `strokeWidth 2.5`.
- **Flash effect** (watches `latest`): temporarily override latest path fill to `#6366f1` for 320ms, then restore. This replicates the map_v2.html birth-tick flash.
- **Color scale**: D3 linear on sqrt-population domain → `['#15803d', '#FFFFFF', '#f97316']` (tricolor: flag green → white → saffron). States absent from data fill `#1e3a5f` (dark navy, consistent with app's dark background).
- **Install D3 and TopoJSON**: `pnpm add d3 topojson-client` + types `@types/d3 @types/topojson-client`.

### 2. Update `src/App.tsx`

**a. Expand state data to all 36 states**

Replace the current 21-entry `states` object with the full 36-state/UT dataset from map_v2.html, using TopoJSON canonical names as keys (e.g., `"Jammu and Kashmir"` not `"Jammu & Kashmir"`). Keep `pop` in millions and `mult` from map_v2.html's data. Remove the `x/y/w/h` rect coordinates — they are no longer needed.

```typescript
const states: Record<string, { pop: number; mult: number }> = {
  "Uttar Pradesh":    { pop: 199.6, mult: 1.3 },
  "Maharashtra":      { pop: 112.4, mult: 1.0 },
  // ... all 36
};
```

**b. Fix births/year**

Change `YEARLY_CHANGE` from `13_800_000` to `27_200_000` — the value used in map_v2.html, closer to India's actual annual birth count (~26–27M).

**c. Swap map JSX**

Remove the entire `<svg>` block (clipPath, rects, outline paths) and replace with:
```jsx
<IndiaMap
  selected={selected}
  latest={latest}
  onStateClick={selectState}
  dark={dark}
/>
```

**d. Update dropdown**

The `<select>` dropdown currently lists 21 states. Update `orderedStates` to use the expanded 36-state keys, sorted alphabetically.

**e. State name display**

The aside panel's detail dl items reference `selected`. With canonical TopoJSON names these will render correctly; no changes needed to the panel logic.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/IndiaMap.tsx` | **New file** — D3/TopoJSON map component |
| `src/App.tsx` | Expand state data, fix YEARLY_CHANGE, swap map JSX, update dropdown |
| `package.json` / lockfile | Add `d3`, `topojson-client`, their `@types` packages |

---

## Key Reuse from map_v2.html

- **TopoJSON URL**: `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/india.json`
- **State name extraction**: `g.properties.st_nm` from district-level features
- **Merge logic**: `topojson.merge(topo, topo.objects.districts.geometries.filter(g => g.properties.st_nm === name))`
- **Projection**: `d3.geoMercator().fitExtent([[24,18],[356,422]], featureCollection)`
- **Color scale**: `d3.scaleLinear().domain([0, sqrtMid, sqrtMax]).range(['#15803d','#FFFFFF','#f97316'])`
- **slug/ID function**: `'st-' + name.replace(/[^a-z0-9]/gi,'').toLowerCase()` — used as `path.attr('id', slug(name))`
- **State population data** (raw integers from map_v2.html, converted to millions)

---

## Verification

1. Run `pnpm build` — should pass TypeScript with no errors
2. Open the preview: India should render as a real geographic silhouette (not rects)
3. All 36 states should be clickable and update the aside panel
4. The selected state should show a saffron/orange stroke
5. The latest birth state should briefly flash indigo then return to density color
6. The dropdown should list all 36 states
7. The population counter should tick faster (27.2M/yr vs old 13.8M/yr)
