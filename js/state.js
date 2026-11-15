import { CONFIG, DEFAULT_TRIBES } from "./config.js";

const SAVE_KEY = "village_two_maps_v1";

export function createInitialState() {
  const world = makeTerrain(CONFIG.world.cols, CONFIG.world.rows, CONFIG.world.seed);
  const castle = makeTerrain(CONFIG.castle.cols, CONFIG.castle.rows, CONFIG.castle.seed);
  const center = { x: 50, y: 31 };
  const tribes = structuredCloneSafe(DEFAULT_TRIBES);
  return {
    version: 1,
    activeMap: "world",
    resources: { food: 120, wood: 100, stone: 80, gold: 25 },
    seasonDay: 1,
    player: { id: "local-player", name: "فرمانده بی‌نام", x: center.x, y: center.y, power: 120 },
    tribes,
    world,
    castle: {
      terrain: castle,
      buildings: [
        { id:"keep", type:"keep", x:20, y:14, level:1 },
        { id:"farm-start", type:"farm", x:14, y:14, level:1 },
        { id:"lumber-start", type:"lumber", x:25, y:14, level:1 }
      ]
    },
    selectedBuilding: "farm",
    selectedEntity: null,
    camera: { world:{x:0,y:0}, castle:{x:0,y:0} }
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeTerrain(cols, rows, seed) {
  let s = seed >>> 0;
  const random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const tiles = [];
  for (let y=0; y<rows; y++) {
    const row = [];
    for (let x=0; x<cols; x++) {
      const n = random();
      row.push(n < .08 ? "water" : n < .19 ? "forest" : n < .25 ? "hill" : "grass");
    }
    tiles.push(row);
  }
  // Create a broad river and keep the starting castle on open ground.
  for (let y=0; y<rows; y++) {
    const riverX = Math.floor(cols * .64 + Math.sin(y / 7) * 3);
    if (riverX >= 0 && riverX < cols) tiles[y][riverX] = "water";
  }
  return tiles;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !parsed.world || !parsed.castle?.terrain) return null;
    return parsed;
  } catch { return null; }
}

export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch { return false; }
}

export function clearSavedState() {
  localStorage.removeItem(SAVE_KEY);
}
