import {CONFIG, DEFAULT_TRIBES, START_RESOURCES} from "./config.js";
import {buildingProd, TROOPS} from "./config.js";
const TROOP_IDS=Object.keys(TROOPS);
let KEY = "village_rise_v5";
const LEGACY_KEY = "village_rise_v4";
export function setSaveScope(username){
const id=encodeURIComponent(String(username||"default").trim().toLowerCase())||"default";
KEY="village_rise_v5_"+id;
}
const WW = 56, WH = 36, CW = 26, CH = 18;
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function makeWorld(){
const r=rng(74129);const t=[];
for(let y=0;y<WH;y++){const row=[];for(let x=0;x<WW;x++){const n=r();row.push(n<.09?"water":n<.22?"forest":n<.29?"hill":"grass");}t.push(row);}
for(let y=0;y<WH;y++){const rx=Math.floor(WW*.62+Math.sin(y/6)*2.5);if(rx>=0&&rx<WW)t[y][rx]="water";if(rx+1<WW&&r()<.5)t[y][rx+1]="water";}
return t;
}
function makeCastle(){
const t=[];
for(let y=0;y<CH;y++){const row=[];for(let x=0;x<CW;x++)row.push("grass");t.push(row);}
for(let y=5;y<=11;y++)for(let x=10;x<=16;x++)t[y][x]="plaza";
for(let x=0;x<CW;x++){if(t[8][x]==="grass")t[8][x]="path";if(t[4][x]==="grass"&&x>=10&&x<=16)t[4][x]="path";}
for(let y=0;y<CH;y++){if(t[y][13]==="grass")t[y][13]="path";}
t[14][3]="water";t[14][4]="water";t[15][3]="water";t[15][4]="water";
t[2][2]="forest";t[2][3]="forest";t[3][2]="forest";t[15][22]="forest";t[16][23]="forest";t[15][23]="forest";
t[2][22]="hill";t[3][23]="hill";t[14][21]="hill";
return t;
}
export function createInitialState(){
const now=Date.now();
return {
version:5,
seasonIndex:0,
seasonStart:now, lastTick:now, activeMap:"world",
resources:{...START_RESOURCES},
world:makeWorld(),
castle:{
terrain:makeCastle(),
buildings:[
{id:"keep-1", type:"keep", x:13, y:8, level:1},
{id:"farm-1", type:"farm", x:8, y:6, level:1},
{id:"farm-2", type:"farm", x:18, y:6, level:1},
{id:"lumber-1", type:"lumber", x:6, y:10, level:1},
{id:"lumber-2", type:"lumber", x:20, y:10, level:1},
{id:"quarry-1", type:"quarry", x:9, y:13, level:1},
{id:"iron-1", type:"ironmine", x:17, y:13, level:1},
{id:"gold-1", type:"goldmine", x:13, y:4, level:1},
{id:"bar-1", type:"barracks", x:5, y:6, level:1},
{id:"bar-2", type:"barracks", x:21, y:6, level:1},
{id:"bar-3", type:"barracks", x:13, y:12, level:1},
{id:"wall-1", type:"wall", x:11, y:7, level:1},
{id:"wall-2", type:"wall", x:15, y:7, level:1},
{id:"wall-3", type:"wall", x:11, y:10, level:1},
{id:"wall-4", type:"wall", x:15, y:10, level:1}
]
},
troops:{swordsman:6, spearman:4, archer:0, cavalry:0, catapult:0},
queue:[],
player:{name:"فرمانده بی‌نام", x:28, y:19, power:120, level:1, xp:0},
tribes:JSON.parse(JSON.stringify(DEFAULT_TRIBES)).map(t=>({...t, maxPower:t.power, defeated:false})),
battleLog:[], stats:{wins:0, losses:0, loot:0},
selectedEntity:null, selectedCastleId:"keep-1", seasonDayCache:1
};
}
export function loadState(){
try{
let raw=localStorage.getItem(KEY);
let legacy=false;
if(!raw){raw=localStorage.getItem(LEGACY_KEY);legacy=!!raw;}
if(!raw) return null;
const s=JSON.parse(raw);
if(!s || !s.world || !s.castle || !Array.isArray(s.castle.buildings)) return null;
s.version=5;
s.seasonIndex=Math.max(0,Number(s.seasonIndex)||0);
s.resources={food:0,wood:0,stone:0,iron:0,gold:0,...(s.resources||{})};
s.troops={swordsman:0,spearman:0,archer:0,cavalry:0,catapult:0,...(s.troops||{})};
s.queue=Array.isArray(s.queue)?s.queue.filter(q=>q && TROOP_IDS.includes(q.id) && Number.isFinite(q.left) && q.left>=0):[];
s.stats={wins:0,losses:0,loot:0,...(s.stats||{})};
s.player={name:"فرمانده بی‌نام",...s.player};
s.seasonStart=Number(s.seasonStart)||Date.now();
s.lastTick=Number(s.lastTick)||Date.now();
s.tribes=Array.isArray(s.tribes)?s.tribes.map(t=>{const base=DEFAULT_TRIBES.find(x=>x.id===t.id)||{};return {...base,...t,territory:t.territory||base.territory||"ناشناخته",reputation:t.reputation||base.reputation||"بی‌طرف"};}):JSON.parse(JSON.stringify(DEFAULT_TRIBES));
if(legacy){try{localStorage.setItem(KEY,JSON.stringify(s));localStorage.removeItem(LEGACY_KEY);}catch(e){}}
return s;
}catch(e){return null;}
}
export function saveState(s){
try{s.lastTick=Date.now();localStorage.setItem(KEY, JSON.stringify(s));return true;}
catch(e){return false;}
}
export function clearSave(){try{localStorage.removeItem(KEY);}catch(e){}}
export function seasonInfo(s, now){
now = now || Date.now();
const el = now - s.seasonStart;
const day = Math.min(CONFIG.seasonLength, Math.floor(el / CONFIG.dayMs) + 1);
const nextIn = CONFIG.dayMs - (el % CONFIG.dayMs);
return {day:day, total:CONFIG.seasonLength, nextIn:nextIn, left:CONFIG.seasonLength-day, finished: el >= CONFIG.seasonLength*CONFIG.dayMs};
}
export function keepLevel(s){
let m=1;
for(const b of s.castle.buildings) if(b.type==="keep") m=Math.max(m,b.level);
return m;
}
export function barracksLevel(s){
let m=0;
for(const b of s.castle.buildings) if(b.type==="barracks") m=Math.max(m,b.level);
return m;
}
export function storageCap(s){return CONFIG.storageBase + keepLevel(s)*CONFIG.storagePerKeep;}
export function calcRates(s){
const r={food:0, wood:0, stone:0, iron:0, gold:0};
for(const b of s.castle.buildings){
const p=buildingProd(b.type, b.level);
for(const k in p) r[k]=(r[k]||0)+p[k];
}
return r;
}
export function troopCap(s){
let farmLv=0;
for(const b of s.castle.buildings) if(b.type==="farm") farmLv+=b.level;
return 60 + keepLevel(s)*30 + farmLv*6 + Math.max(0,((s.player||{}).level||1)-1)*10;
}
export function troopCount(s){
let n=0;
for(const k in s.troops) n+= (s.troops[k]||0);
return n;
}
export function queuedTroopCount(s){return (s.queue||[]).reduce((n,q)=>n+Math.max(0,Number(q.count)||0),0);}
export function availableTroopCapacity(s){return Math.max(0,troopCap(s)-troopCount(s)-queuedTroopCount(s));}
export function advanceStateTime(s, seconds){
let dt=Math.max(0,Math.min(72*3600,Number(seconds)||0));
const rates=calcRates(s), cap=storageCap(s);
let upkeep=0;
for(const k in (s.troops||{})) upkeep+=(TROOPS[k]?.upkeep||0)*(s.troops[k]||0);
for(const k of Object.keys(rates)){
const net=(rates[k]||0)-(k==="food"?upkeep:0);
s.resources[k]=Math.max(0,Math.min(cap,(s.resources[k]||0)+net/3600*dt));
}
const completed=[];
let remaining=dt;
while(s.queue?.length && remaining>0){
const q=s.queue[0];
if(q.left>remaining){q.left-=remaining;remaining=0;break;}
remaining-=q.left;
s.queue.shift();
s.troops[q.id]=(s.troops[q.id]||0)+q.count;
completed.push(q);
}
return {completed,seconds:dt};
}
