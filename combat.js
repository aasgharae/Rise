import {TROOPS} from "./config.js";
export function armyPower(army){
let p=0;
for(const k in army) p += (TROOPS[k] ? (TROOPS[k].power || 0) : 0) * (army[k]||0);
return Math.round(p);
}
export function wallDefense(state){
let d=0;
for(const b of state.castle.buildings){
if(b.type==="wall") d += 35*b.level;
}
const k = state.castle.buildings.find(b=>b.type==="keep");
if(k) d += k.level*18;
return d;
}
export function resolveBattle(state, army, tribe){
const atkBase = armyPower(army);
let bonus = 1;
const total = Math.max(1, Object.values(army).reduce((a,b)=>a+b,0));
if((army.catapult||0)>0 && (tribe.def||0)>=30) bonus += 0.22 * ((army.catapult||0)/total) * 3;
if((army.spearman||0)>0) bonus += 0.05;
if((army.cavalry||0)>0 && (army.archer||0)>0) bonus += 0.06;
if((army.swordsman||0)>0 && (army.spearman||0)>0) bonus += 0.04;
const atk = Math.round(atkBase * bonus * (0.9 + Math.random()*0.25));
const day = state.seasonDayCache || 1;
const growth = 1 + (day/45)*0.45;
const def = Math.round(tribe.power * (tribe.defeated?0.42:1) * (0.86+Math.random()*0.28) * growth);
const win = atk > def;
const ratio = win ? def/Math.max(1,atk) : atk/Math.max(1,def);
const survivors = {};
let lost = 0;
for(const k in army){
const c = army[k]||0;
if(!c){survivors[k]=0;continue;}
const lossRate = win ? 0.04+ratio*0.32 : 0.42+(1-ratio)*0.28;
const dead = Math.min(c, Math.floor(c*lossRate + Math.random()*2));
survivors[k]=c-dead; lost+=dead;
}
let loot={food:0, wood:0, stone:0, iron:0, gold:0};
if(win){
const base=Math.round(tribe.power*0.22+70+Math.random()*90);
loot={food:Math.round(base*0.9), wood:Math.round(base*0.7), stone:Math.round(base*0.55), iron:Math.round(base*0.2+8), gold:Math.round(base*0.35+25)};
if(!tribe.defeated && tribe.power<200){loot.gold+=40; loot.food+=80; loot.iron+=10;}
}
const xp = win ? Math.round(def/8+35) : Math.round(atk/22+12);
return {win:win, atk:atk, def:def, survivors:survivors, lost:lost, loot:loot, xp:xp, bonus:Number(bonus.toFixed(2))};
}