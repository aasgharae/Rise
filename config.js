// Rise offline prototype configuration
export const CONFIG = {
seasonLength: 45,
dayMs: 86400000,
tickMs: 1000,
storageBase: 600000000,
storagePerKeep: 250000000,
worldW: 56,
worldH: 36,
castleW: 26,
castleH: 18
};
export const START_RESOURCES = {
food: 100000000,
wood: 80000000,
stone: 50000000,
iron: 30000000,
gold: 20000000
};
export const RESMETA = {
food: { name: 'غذا', icon: '🌾' },
wood: { name: 'چوب', icon: '🪵' },
stone: { name: 'سنگ', icon: '🪨' },
iron: { name: 'آهن', icon: '⛓️' },
gold: { name: 'طلا', icon: '🪙' }
};
export function resName(k) {
return (RESMETA[k] && RESMETA[k].name) || k;
}
export const TROOPS = {
swordsman: { iconPath:'assets/icons/swordsman.svg', icon:'⚔️', desc:'نیروی متعادل برای نبرد نزدیک', name: 'شمشیرزن', atk: 10, def: 8, hp: 60, power: 12, upkeep: 1, unlock: 1, time: 30, cost: { food: 100, iron: 20 } },
spearman: { iconPath:'assets/icons/spearman.svg', icon:'🔱', desc:'مقاوم و مناسب مقابله با سواره‌نظام', name: 'نیزه‌دار', atk: 12, def: 12, hp: 70, power: 14, upkeep: 1, unlock: 1, time: 35, cost: { food: 120, wood: 40 } },
archer: { iconPath:'assets/icons/archer.svg', icon:'🏹', desc:'پشتیبانی دوربرد با قدرت حمله بالا', name: 'کماندار', atk: 18, def: 6, hp: 45, power: 20, upkeep: 2, unlock: 2, time: 45, cost: { food: 150, wood: 80, gold: 10 } },
cavalry: { iconPath:'assets/icons/cavalry.svg', icon:'🐎', desc:'نیروی سریع و سنگین', name: 'سواره‌نظام', atk: 35, def: 20, hp: 140, power: 48, upkeep: 4, unlock: 3, time: 90, cost: { food: 300, iron: 100, gold: 50 } },
catapult: { iconPath:'assets/icons/catapult.svg', icon:'🪨', desc:'ماشین محاصره؛ مؤثرتر علیه دفاع بالا', name: 'منجنیق', atk: 80, def: 10, hp: 200, power: 120, upkeep: 6, unlock: 4, time: 180, cost: { wood: 400, stone: 300, gold: 150 } }
};
export const BUILDINGS = {
keep: { name: 'قلعه', icon: '🏰', desc: 'مرکز فرماندهی، افزایش انبار', max: 10, baseCost: { wood: 500, stone: 400, gold: 100 }, baseProd: 0 },
farm: { name: 'مزرعه', icon: '🌾', desc: 'تولید غذا', max: 12, prod: 'food', baseProd: 24, baseCost: { wood: 120, stone: 60 } },
lumber: { name: 'چوب‌بری', icon: '🪵', desc: 'تولید چوب', max: 12, prod: 'wood', baseProd: 18, baseCost: { wood: 100, stone: 80 } },
quarry: { name: 'معدن سنگ', icon: '🪨', desc: 'تولید سنگ', max: 10, prod: 'stone', baseProd: 14, baseCost: { wood: 150, stone: 50 } },
ironmine: { name: 'معدن آهن', icon: '⛓️', desc: 'تولید آهن', max: 10, prod: 'iron', baseProd: 10, baseCost: { wood: 200, stone: 150 } },
goldmine: { name: 'معدن طلا', icon: '🪙', desc: 'تولید طلا', max: 10, prod: 'gold', baseProd: 6, baseCost: { wood: 300, stone: 250 } },
barracks: { name: 'سربازخانه', icon: '⚔️', desc: 'بازکردن نیروی جدید و آموزش سریع‌تر', max: 10, baseProd: 0, baseCost: { wood: 250, stone: 200, gold: 50 } },
wall: { name: 'دیوار', icon: '🧱', desc: 'دفاع شهر', max: 10, baseProd: 0, baseCost: { wood: 100, stone: 150 } }
};
export function buildingCost(type, curLevel) {
const def = BUILDINGS[type];
if (!def) return {};
const nextLevel = (curLevel || 0) + 1;
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
if (!def || !def.baseProd || !def.prod) return {};
const v = Math.floor(def.baseProd * level * Math.pow(1.35, level - 1));
const o = {};
o[def.prod] = v;
return o;
}
export const DEFAULT_TRIBES = [
{ id: 'red-clan', name: 'قبیله سرخ', color: '#e74c3c', x: 10, y: 8, power: 180, def: 20, territory:'دشت‌های جنوبی', reputation:'تهاجمی' },
{ id: 'golden', name: 'قبیله طلایی', color: '#f1c40f', x: 28, y: 5, power: 250, def: 25, territory:'فلات مرکزی', reputation:'ثروتمند' },
{ id: 'mountain', name: 'قبیله کوهستان', color: '#8e9aaf', x: 45, y: 8, power: 350, def: 32, territory:'کوهستان شمالی', reputation:'دفاعی' },
{ id: 'green-field', name: 'قبیله دشت سبز', color: '#2ecc71', x: 12, y: 28, power: 220, def: 22, territory:'دشت‌های غربی', reputation:'کشاورز' },
{ id: 'river', name: 'قبیله رود', color: '#3498db', x: 44, y: 27, power: 300, def: 28, territory:'کنار رود بزرگ', reputation:'بازرگان' }
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
{ id: 'wall-1', type: 'wall', x: 11, y: 7, level: 1 },
{ id: 'wall-2', type: 'wall', x: 15, y: 7, level: 1 },
{ id: 'wall-3', type: 'wall', x: 11, y: 10, level: 1 },
{ id: 'wall-4', type: 'wall', x: 15, y: 10, level: 1 }
];
export const STARTER_CASTLE_BUILDINGS = STARTER_CASTLE;