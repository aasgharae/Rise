export const CONFIG = {
seasonLength: 45,
dayMs: 86400000,
tickMs: 1000,
autosaveMs: 12000,
storageBase: 6000,
storagePerKeep: 2500,
maxLevel: 10
};
export const RESMETA = {
food: {name:"غذا", icon:"🍖"},
wood: {name:"چوب", icon:"🪵"},
stone: {name:"سنگ", icon:"🪨"},
iron: {name:"آهن", icon:"⛓️"},
gold: {name:"طلا", icon:"🪙"}
};
export const BUILDINGS = {
keep: {name:"قلعه مرکزی", icon:"🏰", desc:"انبار و ظرفیت ارتش", cost:{wood:200,stone:200,gold:60}, costGrow:1.8, prod:{}, max:6},
farm: {name:"مزرعه", icon:"🌾", desc:"تولید خودکار غذا", cost:{wood:40,stone:20}, costGrow:1.5, prod:{food:34}, prodGrow:1.7, max:10},
lumber: {name:"چوب‌بری", icon:"🪵", desc:"تولید خودکار چوب", cost:{wood:30,stone:25}, costGrow:1.5, prod:{wood:30}, prodGrow:1.7, max:10},
quarry: {name:"معدن سنگ", icon:"⛏️", desc:"تولید خودکار سنگ", cost:{wood:45,stone:30}, costGrow:1.5, prod:{stone:22}, prodGrow:1.7, max:10},
ironmine: {name:"معدن آهن", icon:"⛓️", desc:"تولید خودکار آهن", cost:{wood:120,stone:140,gold:30}, costGrow:1.55, prod:{iron:14}, prodGrow:1.65, max:8},
goldmine: {name:"معدن طلا", icon:"🪙", desc:"تولید خودکار طلا", cost:{wood:140,stone:160}, costGrow:1.55, prod:{gold:14}, prodGrow:1.65, max:8},
barracks: {name:"سربازخانه", icon:"⚔️", desc:"ساخت نیرو و باز کردن قفل", cost:{wood:150,stone:130,gold:20}, costGrow:1.6, prod:{}, max:8},
wall: {name:"دیوار", icon:"🧱", desc:"دفاع +۳۵ هر لول", cost:{wood:20,stone:60}, costGrow:1.45, prod:{}, max:12, defense:35}
};
export const TROOPS = {
swordsman: {name:"شمشیرزن", icon:"⚔️", atk:10, def:8, hp:38, cost:{food:30,gold:8}, upkeep:0.4, power:10, unlock:1, time:6, desc:"متعادل و ارزان"},
spearman: {name:"نیزه‌دار", icon:"🛡️", atk:8, def:16, hp:52, cost:{food:35,gold:10}, upkeep:0.4, power:12, unlock:1, time:8, desc:"ضد سواره‌نظام"},
archer: {name:"کماندار", icon:"🏹", atk:16, def:6, hp:30, cost:{food:40,gold:18,wood:15}, upkeep:0.5, power:15, unlock:2, time:10, desc:"ضد نیزه‌دار"},
cavalry: {name:"سواره‌نظام", icon:"🐎", atk:25, def:13, hp:80, cost:{food:70,gold:40,iron:10}, upkeep:0.9, power:28, unlock:3, time:16, desc:"سریع و کوبنده"},
catapult: {name:"منجنیق", icon:"💥", atk:40, def:5, hp:66, cost:{wood:100,stone:80,gold:60,iron:25}, upkeep:1.2, power:46, unlock:4, time:26, desc:"نابودگر دیوار"}
};
export const DEFAULT_TRIBES = [
{id:"red-clan", name:"قبیله گرگ سرخ", color:"#d05a4f", x:10, y:8, territory:"شمال غرب", power:420, reputation:"تهاجمی", def:30},
{id:"golden", name:"شیرهای طلایی", color:"#d4ab45", x:28, y:5, territory:"مرکز شمالی", power:610, reputation:"تهاجمی", def:45},
{id:"mountain", name:"فرزندان کوهستان", color:"#a47bc5", x:45, y:8, territory:"شمال شرق", power:560, reputation:"دفاعی", def:60},
{id:"green-field", name:"اتحاد دشت سبز", color:"#72c06e", x:12, y:28, territory:"جنوب غرب", power:350, reputation:"تجاری", def:20},
{id:"river", name:"نگهبانان رود", color:"#4fb6cc", x:44, y:27, territory:"جنوب شرق", power:490, reputation:"متعادل", def:35}
];
export function buildingCost(type, curLevel){
const b = BUILDINGS[type];
if(!b) return {};
const m = Math.pow(b.costGrow, curLevel);
const o = {};
for(const k in b.cost) o[k] = Math.ceil(b.cost[k] * m);
return o;
}
export function buildingProd(type, level){
const b = BUILDINGS[type];
if(!b || !b.prod) return {};
const m = Math.pow(b.prodGrow || 1, level - 1);
const o = {};
for(const k in b.prod) o[k] = b.prod[k] * m;
return o;
}
export function resName(k){
return k==="wood"?"چوب":k==="stone"?"سنگ":k==="food"?"غذا":k==="iron"?"آهن":"طلا";
}