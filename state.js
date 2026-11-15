import {CONFIG, DEFAULT_TRIBES} from "./config.js";
import {buildingProd} from "./config.js";
const KEY = "village_rise_v3";
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
version:3,
seasonStart:now, lastTick:now, activeMap:"world",
resources:{food:400, wood:350, stone:280, iron:60, gold:120},
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
const raw=localStorage.getItem(KEY);
if(!raw) return null;
const s=JSON.parse(raw);
if(!s || s.version!==3 || !s.world || !s.castle) return null;
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
return 60 + keepLevel(s)*30 + farmLv*6;
}
export function troopCount(s){
let n=0;
for(const k in s.troops) n+= (s.troops[k]||0);
return n;
}