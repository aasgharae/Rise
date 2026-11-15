import {CONFIG,DEFAULT_TRIBES} from "./config.js";
const KEY="village_rise_v2";
function rnd(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function terrain(cols,rows,seed){
const r=rnd(seed);const t=[];
for(let y=0;y<rows;y++){const row=[];for(let x=0;x<cols;x++){const n=r();row.push(n<.08?"water":n<.2?"forest":n<.27?"hill":"grass");}t.push(row);}
for(let y=0;y<rows;y++){const rx=Math.floor(cols*.64+Math.sin(y/7)*3);if(rx>=0&&rx<cols)t[y][rx]="water";}
return t;
}
export function createInitialState(){
const now=Date.now();
return {version:2,seasonStart:now,lastTick:now,activeMap:"world",resources:{food:180,wood:140,stone:110,gold:40},castle:{terrain:terrain(42,30,9217),buildings:[{id:"keep-0",type:"keep",x:20,y:14,level:1},{id:"farm-0",type:"farm",x:14,y:14,level:1},{id:"lumber-0",type:"lumber",x:26,y:14,level:1},{id:"bar-0",type:"barracks",x:20,y:10,level:1}]},troops:{swordsman:5,spearman:3,archer:0,cavalry:0,catapult:0},queue:[],player:{name:"فرمانده بی‌نام",x:50,y:31,power:120,xp:0,level:1},tribes:JSON.parse(JSON.stringify(DEFAULT_TRIBES)).map(t=>({...t,maxPower:t.power,lastAttack:0,defeated:false})),battleLog:[],stats:{wins:0,losses:0,loot:0},selectedBuilding:"farm",selectedEntity:null,selectedCastleBuilding:null};
}
export function loadState(){
try{const raw=localStorage.getItem(KEY);if(!raw)return null;const s=JSON.parse(raw);if(s.version!==2)return null;if(!s.castle?.terrain)s.castle.terrain=terrain(42,30,9217);return s;}catch{return null;}
}
export function saveState(s){try{s.lastTick=Date.now();localStorage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
export function clearSave(){localStorage.removeItem(KEY);}
export function seasonInfo(s,now=Date.now()){
const elapsed=now-s.seasonStart;const day=Math.min(CONFIG.seasonLength,Math.floor(elapsed/CONFIG.dayMs)+1);
const nextIn=CONFIG.dayMs-(elapsed%CONFIG.dayMs);const left=CONFIG.seasonLength-day;
const totalLeft=(CONFIG.seasonLength*CONFIG.dayMs)-elapsed;
return {day,total:CONFIG.seasonLength,nextIn,totalLeft,left,finished:elapsed>=CONFIG.seasonLength*CONFIG.dayMs};
}
export function keepLevel(s){return s.castle.buildings.find(b=>b.type==="keep")?.level||1;}
export function barracksLevel(s){return Math.max(...s.castle.buildings.filter(b=>b.type==="barracks").map(b=>b.level),0);}
export function storageCap(s){return CONFIG.storageBase+keepLevel(s)*CONFIG.storagePerKeep;}
export function prodRatesPerHour(s){
importRates(s);return importRates(s);
}
function importRates(s){
const {BUILDINGS}=globalThis.__BLD||{};
return calcRates(s);
}
import {BUILDINGS,buildingProd} from "./config.js";
function calcRates(s){
const r={food:0,wood:0,stone:0,gold:0};
for(const b of s.castle.buildings){const p=buildingProd(b.type,b.level);for(const k in p)r[k]+=p[k];}
return r;
}
export function troopCap(s){
let cap=30+keepLevel(s)*20;
for(const b of s.castle.buildings)if(b.type==="farm")cap+=b.level*8;
return cap;
}
export function troopCount(s){return Object.values(s.troops).reduce((a,b)=>a+b,0);}
export {calcRates};