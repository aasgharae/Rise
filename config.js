// نسخه تست - منابع 100 برابر - بعد از تست به عدد اصلی برگردان
export const CONFIG = {
  seasonLength: 45,
  dayMs: 86400000,
  tickMs: 1000,
  storageBase: 6000000,
  storagePerKeep: 250000,
  worldW: 56,
  worldH: 36,
  castleW: 26,
  castleH: 18
};

export const START_RESOURCES = {
  food: 100000,
  wood: 80000,
  stone: 50000,
  iron: 30000,
  gold: 20000
};

export const RESMETA = {
  food: { name: 'غذا', icon: '🌾' },
  wood: { name: 'چوب', icon: '🪵' },
  stone: { name: 'سنگ', icon: '🪨' },
  iron: { name: 'آهن', icon: '⛓️' },
  gold: { name: 'طلا', icon: '🪙' }
};

export const TROOPS = {
  swordsman: { name: 'شمشیرزن', atk: 10, def: 8, hp: 60, unlock: 1, time: 30, cost: { food: 100, iron: 20 } },
  spearman: { name: 'نیزه‌دار', atk: 12, def: 12, hp: 70, unlock: 1, time: 35, cost: { food: 120, wood: 40 } },
  archer: { name: 'کماندار', atk: 18, def: 6, hp: 45, unlock: 2, time: 45, cost: { food: 150, wood: 80, gold: 10 } },
  cavalry: { name: 'سواره‌نظام', atk: 35, def: 20, hp: 140, unlock: 3, time: 90, cost: { food: 300, iron: 100, gold: 50 } },
  catapult: { name: 'منجنیق', atk: 80, def: 10, hp: 200, unlock: 4, time: 180, cost: { wood: 400, stone: 300, gold: 150 } }
};

export const BUILDINGS = {
  keep: { name: 'قلعه', max: 10, baseCost: { wood: 500, stone: 400, gold: 100 }, baseProd: 0 },
  farm: { name: 'مزرعه', max: 12, prod: 'food', baseProd: 24, baseCost: { wood: 120, stone: 60 } },
  lumber: { name: 'چوب‌بری', max: 12, prod: 'wood', baseProd: 18, baseCost: { wood: 100, stone: 80 } },
  quarry: { name: 'معدن سنگ', max: 10, prod: 'stone', baseProd: 14, baseCost: { wood: 150, stone: 50 } },
  ironmine: { name: 'معدن آهن', max: 10, prod: 'iron', baseProd: 10, baseCost: { wood: 200, stone: 150 } },
  goldmine: { name: 'معدن طلا', max: 10, prod: 'gold', baseProd: 6, baseCost: { wood: 300, stone: 250 } },
  barracks: { name: 'سربازخانه', max: 10, baseProd: 0, baseCost: { wood: 250, stone: 200, gold: 50 } },
  wall: { name: 'دیوار', max: 10, baseProd: 0, baseCost: { wood: 100, stone: 150 } }
};

export function buildingCost(type, nextLevel) {
  const def = BUILDINGS[type];
  if (!def) return {};
  const mult = Math.pow(1.65, nextLevel - 1) * nextLevel;
  const out = {};
  for (const k in def.baseCost) {
    out[k] = Math.ceil(def.baseCost[k] * mult);
  }
  if (nextLevel >= 5) out.gold = Math.ceil((out.gold || 50) + nextLevel * 20);
  return out;
}

export function buildingProd(type, level) {
  const def = BUILDINGS[type];
  if (!def || !def.baseProd) return 0;
  return Math.floor(def.baseProd * level * Math.pow(1.35, level - 1));
}

export const DEFAULT_TRIBES = [
  { id: 'red-clan', name: 'قبیله سرخ', color: '#e74c3c', x: 10, y: 8 },
  { id: 'golden', name: 'قبیله طلایی', color: '#f1c40f', x: 28, y: 5 },
  { id: 'mountain', name: 'قبیله کوهستان', color: '#8e9aaf', x: 45, y: 8 },
  { id: 'green-field', name: 'قبیله دشت سبز', color: '#2ecc71', x: 12, y: 28 },
  { id: 'river', name: 'قبیله رود', color: '#3498db', x: 44, y: 27 }
];

export const STARTER_CASTLE = [
  { id: 'keep-1', type: 'keep', x: 13, y: 8, level: 1 },
  { id: 'farm-1', type: 'farm', x: 8, y: 6, level: 1 },
  { id: 'farm-2', type: 'farm', x: 18, y: 6, level: 1 },
  { id: 'lumber-1', type: 'lumber', x: 6, y: 10, level: 1 },
  { id: 'lumber-2', type: 'lumber', x: 20, y: 10, level: 1 },
  { id: 'quarry-1', type: 'quarry', x: 9, y: 13, level: 1 },
  { id: 'iron-1', type: 'ironmine', x: 17, y: 13, level: 1 },
  { id: 'gold-1', type: 'goldmine', x: 13, y: 4, level: 1 },
  { id: 'bar-1', type: 'barracks', x: 5, y: 6, level: 1 },
  { id: 'bar-2', type: 'barracks', x: 21, y: 6, level: 1 },
  { id: 'bar-3', type: 'barracks', x: 13, y: 12, level: 1 },
  { id: 'wall-1', type: 'wall', x: 11, y: 6, level: 1 },
  { id: 'wall-2', type: 'wall', x: 15, y: 6, level: 1 },
  { id: 'wall-3', type: 'wall', x: 11, y: 10, level: 1 },
  { id: 'wall-4', type: 'wall', x: 15, y: 10, level: 1 }
];

export const STARTER_CASTLE_BUILDINGS = STARTER_CASTLE;