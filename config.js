export const CONFIG = {
seasonLength: 45,
dayMs: 86400000,
tickMs: 1000,
autosaveMs: 10000,
storageBase: 3000,
storagePerKeep: 1500,
maxBuildingLevel: 10,
};
export const BUILDINGS = {
farm: {name:"مزرعه",icon:"🌾",desc:"تولید خودکار غذا",cost:{wood:25,stone:10},prod:{food:22},costGrow:1.55,prodGrow:1.65,max:6},
lumber: {name:"چوب‌بری",icon:"🪵",desc:"تولید خودکار چوب",cost:{wood:20,stone:15},prod:{wood:18},costGrow:1.55,prodGrow:1.65,max:6},
quarry: {name:"معدن سنگ",icon:"⛏️",desc:"تولید خودکار سنگ",cost:{wood:25,stone:20},prod:{stone:14},costGrow:1.55,prodGrow:1.65,max:6},
goldmine: {name:"معدن طلا",icon:"🪙",desc:"تولید خودکار طلا",cost:{wood:70,stone:90,gold:15},prod:{gold:9},costGrow:1.6,prodGrow:1.6,max:4,needKeep:2},
barracks: {name:"سربازخانه",icon:"⚔️",desc:"ساخت و ارتقای نیرو",cost:{wood:90,stone:80},prod:{},costGrow:1.7,prodGrow:1,max:5},
wall: {name:"دیوار",icon:"🧱",desc:"دفاع +۲۵ هر لول",cost:{wood:12,stone:35},prod:{},costGrow:1.5,prodGrow:1,max:10,defense:28},
keep: {name:"قلعه مرکزی",icon:"🏰",desc:"انبار و ظرفیت",cost:{wood:120,stone:120,gold:30},prod:{},costGrow:1.9,prodGrow:1,max:5}
};
export const TROOPS = {
swordsman: {name:"شمشیرزن",icon:"⚔️",atk:10,def:8,hp:38,cost:{food:28,gold:9},upkeep:0.5,power:10,unlock:1,time:6,desc:"متعادل و ارزان",strongVs:["archer"]},
spearman: {name:"نیزه‌دار",icon:"🛡️",atk:8,def:16,hp:50,cost:{food:32,gold:11},upkeep:0.5,power:12,unlock:1,time:8,desc:"ضد سواره",strongVs:["cavalry"]},
archer: {name:"کماندار",icon:"🏹",atk:15,def:6,hp:30,cost:{food:36,gold:16,wood:12},upkeep:0.6,power:15,unlock:2,time:10,desc:"ضد نیزه‌دار",strongVs:["spearman","swordsman"]},
cavalry: {name:"سواره‌نظام",icon:"🐎",atk:24,def:13,hp:78,cost:{food:65,gold:38},upkeep:1.1,power:28,unlock:3,time:18,desc:"سریع و کوبنده",strongVs:["swordsman","archer"]},
catapult: {name:"منجنیق",icon:"💥",atk:38,def:5,hp:65,cost:{wood:90,stone:70,gold:55},upkeep:1.4,power:44,unlock:4,time:30,desc:"نابودگر دیوار",strongVs:["wall"]},
};
export const DEFAULT_TRIBES = [
{id:"red-clan",name:"قبیله گرگ سرخ",color:"#d05a4f",x:18,y:15,territory:"شمال غرب",power:420,reputation:"تهاجمی",def:30},
{id:"golden",name:"شیرهای طلایی",color:"#d4ab45",x:49,y:10,territory:"مرکز شمالی",power:610,reputation:"تهاجمی",def:45},
{id:"mountain",name:"فرزندان کوهستان",color:"#a47bc5",x:77,y:13,territory:"شمال شرق",power:560,reputation:"دفاعی",def:60},
{id:"green-field",name:"اتحاد دشت سبز",color:"#72c06e",x:21,y:48,territory:"جنوب غرب",power:350,reputation:"تجاری",def:20},
{id:"river",name:"نگهبانان رود",color:"#4fb6cc",x:78,y:46,territory:"جنوب شرق",power:490,reputation:"متعادل",def:35},
];
export function buildingCost(type,level){
const b=BUILDINGS[type];const m=Math.pow(b.costGrow,level-1);const o={};for(const k in b.cost)o[k]=Math.ceil(b.cost[k]*m);return o;
}
export function buildingProd(type,level){
const b=BUILDINGS[type];const m=Math.pow(b.prodGrow,level-1);const o={};for(const k in (b.prod||{}))o[k]=b.prod[k]*m;return o;
}