import {TROOPS} from "./config.js";
export function armyPower(army){
let p=0;for(const k in army)p+=(TROOPS[k]?.power||0)*(army[k]||0);return Math.round(p);
}
export function wallDefense(state){
let d=0;for(const b of state.castle.buildings)if(b.type==="wall")d+=28*b.level;
const k=state.castle.buildings.find(b=>b.type==="keep");if(k)d+=k.level*15;return d;
}
export function resolveBattle(state,army,tribe){
const atkBase=armyPower(army);
let bonus=1;let detail=[];
for(const k in army){
if(!army[k])continue;
const strong=TROOPS[k].strongVs||[];
if(strong.includes("wall")&&(tribe.def||0)>30){bonus+=0.06*army[k]/Math.max(1,Object.values(army).reduce((a,b)=>a+b,0))*3;detail.push(TROOPS[k].name+" ضد دیوار");}
if(tribe.reputation==="تهاجمی"&&(k==="spearman"||k==="cavalry")){bonus+=0.02;}
}
if(army.cavalry&&army.archer)bonus+=0.05;
if(army.swordsman&&army.spearman)bonus+=0.04;
const wallB=wallDefense(state)*0.6;
const atk=Math.round((atkBase+wallB)*bonus*(0.88+Math.random()*0.28));
const growth=1+((state.seasonDayCache||1)/45)*0.5;
const def=Math.round(tribe.power*(tribe.defeated?0.4:1)*(0.85+Math.random()*0.3)*growth);
const win=atk>def;
const ratio=win?def/Math.max(1,atk):atk/Math.max(1,def);
let survivors={};let lost=0;
for(const k in army){
const c=army[k]||0;if(!c){survivors[k]=0;continue;}
const lossRate=win?(1-ratio)*0.35+0.05:(0.45+(1-ratio)*0.3);
const dead=Math.min(c,Math.floor(c*lossRate+Math.random()*2));
survivors[k]=c-dead;lost+=dead;
}
let loot={food:0,wood:0,stone:0,gold:0};
if(win){
const base=Math.round(tribe.power*0.22+60+Math.random()*80);
loot={food:Math.round(base*0.9),wood:Math.round(base*0.7),stone:Math.round(base*0.55),gold:Math.round(base*0.35+20)};
if(tribe.power<180){loot.gold+=120;loot.food+=200;}
}
const xp=win?Math.round(def/8+30):Math.round(atk/20+10);
return {win,atk,def,survivors,lost,loot,xp,bonus:Number(bonus.toFixed(2)),detail};
}