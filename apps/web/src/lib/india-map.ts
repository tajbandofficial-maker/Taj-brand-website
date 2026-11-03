/**
 * Places service areas on /public/india-map.webp (1024 × 1024).
 * The map is close to equirectangular: calibrated on its extreme points
 * (Kutch, Arunachal, J&K, Kanyakumari) at ~30 px per degree.
 */
const SIZE = 1024;
const project = (lat: number, lng: number) => ({
  x: ((30.01 * lng - 1958) / SIZE) * 100,
  y: ((50 + (37.08 - lat) * 30.28) / SIZE) * 100,
});

/** Geography, not business content: [lat, lng] of cities an admin may list. */
const cities: Record<string, [number, number]> = {
  delhi: [28.61, 77.21],
  "new delhi": [28.61, 77.21],
  gurugram: [28.46, 77.03],
  gurgaon: [28.46, 77.03],
  noida: [28.54, 77.39],
  "greater noida": [28.47, 77.5],
  ghaziabad: [28.67, 77.45],
  faridabad: [28.41, 77.32],
  sonipat: [28.99, 77.02],
  panipat: [29.39, 76.97],
  meerut: [28.98, 77.71],
  haridwar: [29.95, 78.16],
  rishikesh: [30.09, 78.27],
  dehradun: [30.32, 78.03],
  mussoorie: [30.46, 78.07],
  nainital: [29.38, 79.46],
  chandigarh: [30.73, 76.78],
  mohali: [30.7, 76.72],
  ludhiana: [30.9, 75.86],
  amritsar: [31.63, 74.87],
  jalandhar: [31.33, 75.58],
  shimla: [31.1, 77.17],
  jammu: [32.73, 74.86],
  jaipur: [26.91, 75.79],
  udaipur: [24.59, 73.71],
  jodhpur: [26.24, 73.02],
  ajmer: [26.45, 74.64],
  pushkar: [26.49, 74.55],
  jaisalmer: [26.92, 70.91],
  agra: [27.18, 78.01],
  mathura: [27.49, 77.67],
  vrindavan: [27.58, 77.7],
  aligarh: [27.88, 78.08],
  bareilly: [28.37, 79.43],
  lucknow: [26.85, 80.95],
  kanpur: [26.45, 80.33],
  prayagraj: [25.44, 81.85],
  allahabad: [25.44, 81.85],
  varanasi: [25.32, 82.97],
  gorakhpur: [26.76, 83.37],
  patna: [25.59, 85.14],
  kolkata: [22.57, 88.36],
  ranchi: [23.34, 85.31],
  bhopal: [23.26, 77.41],
  indore: [22.72, 75.86],
  gwalior: [26.22, 78.18],
  jabalpur: [23.18, 79.99],
  raipur: [21.25, 81.63],
  nagpur: [21.15, 79.09],
  ahmedabad: [23.02, 72.57],
  vadodara: [22.31, 73.18],
  surat: [21.17, 72.83],
  mumbai: [19.08, 72.88],
  pune: [18.52, 73.86],
  nashik: [20.0, 73.79],
  goa: [15.5, 73.83],
  hyderabad: [17.39, 78.49],
  bengaluru: [12.97, 77.59],
  bangalore: [12.97, 77.59],
  chennai: [13.08, 80.27],
  kochi: [9.93, 76.27],
  bhubaneswar: [20.3, 85.82],
  guwahati: [26.14, 91.74],
};

export type MapPin = { name: string; x: number; y: number };

/** Smallest distance between two hearts, in % of the map's width. */
const MIN_GAP = 4.6;

/**
 * Nudges hearts that would overlap (e.g. Delhi, Gurugram and Noida are <1% apart)
 * until every pair is MIN_GAP apart, moving each as little as possible.
 * Deterministic, so server and client render the same positions.
 */
function spread(pins: MapPin[]): MapPin[] {
  const out = pins.map((p) => ({ ...p }));
  for (let pass = 0; pass < 80; pass++) {
    let moved = false;
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i]!;
        const b = out[j]!;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= MIN_GAP) continue;
        if (d < 1e-6) {
          // Same spot: split along a fixed per-pair angle (golden angle).
          dx = Math.cos(j * 2.39996);
          dy = Math.sin(j * 2.39996);
          d = 1;
        }
        const push = (MIN_GAP - d) / 2 + 0.01;
        const ux = dx / d;
        const uy = dy / d;
        a.x -= ux * push;
        a.y -= uy * push;
        b.x += ux * push;
        b.y += uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return out;
}

/**
 * One heart per service area, positioned in % of the map image.
 * Areas missing from the lookup get no heart (they're still listed as text).
 */
export function toMapPins(areas: string[]): MapPin[] {
  const pins = areas.flatMap((name) => {
    const at = cities[name.trim().toLowerCase()];
    return at ? [{ name, ...project(at[0], at[1]) }] : [];
  });
  return spread(pins);
}
