export const CONFIG={seasonLength:45,dayMs:86400000,tickMs:1000};
export const START_RESOURCES={food:2500000,wood:1800000,stone:1200000,iron:500000,gold:400000};
export const STORAGE_BASE=5000000000;
export const BATCH_OPTIONS=[1,10,50,100];
export const TROOPS={
swordsman:{name:'شمشیرزن',icon:'🗡️',cost:{food:60,iron:20},time:20,power:12,unlock:1},
spearman:{name:'نیزه‌دار',icon:'🔱',cost:{food:50,wood:30},time:18,power:10,unlock:1},
axeman:{name:'تبرزن',icon:'🪓',cost:{food:80,wood:40},time:26,power:16,unlock:2},
archer:{name:'کماندار',icon:'🏹',cost:{food:70,wood:50},time:24,power:14,unlock:2},
cavalry:{name:'سواره',icon:'🐎',cost:{food:120,iron:40},time:40,power:28,unlock:3},
knight:{name:'شوالیه',icon:'🛡️',cost:{food:150,iron:80,gold:20},time:55,power:38,unlock:4},
ballista:{name:'بالیستا',icon:'🎯',cost:{wood:200,iron:120,gold:50},time:80,power:55,unlock:4},
catapult:{name:'منجنیق',icon:'💣',cost:{wood:250,stone:200,gold:80},time:110,power:80,unlock:5}};
export const BUILD_DEFS={
keep:{name:'قلعه',icon:'🏰',max:10},farm:{name:'مزرعه',icon:'🌾',max:10},
lumber:{name:'چوب‌بری',icon:'🪵',max:10},quarry:{name:'معدن سنگ',icon:'🪨',max:10},
ironmine:{name:'معدن آهن',icon:'⛓️',max:10},goldmine:{name:'معدن طلا',icon:'🪙',max:10},
barracks:{name:'سربازخانه',icon:'⚔️',max:5},wall:{name:'دیوار',icon:'🧱',max:12}};
export function buildingProd(t,l){if(t==='farm')return{food:30*l};if(t==='lumber')return{wood:24*l};if(t==='quarry')return{stone:18*l};if(t==='ironmine')return{iron:12*l};if(t==='goldmine')return{gold:8*l};return{};}
export function upgradeCost(t,l){const m=Math.pow(1.7,l);return{food:Math.floor(80*m),wood:Math.floor(70*m),stone:Math.floor(50*m),gold:Math.floor(10*m)};}
export const DEFAULT_TRIBES=[
{id:'red',name:'قبیله سرخ',x:10,y:8,power:120,loot:{food:500,gold:200},color:'#e5484d'},
{id:'golden',name:'طلایی‌ها',x:28,y:5,power:220,loot:{gold:600,iron:300},color:'#f5b301'},
{id:'mountain',name:'کوهستان',x:45,y:8,power:350,loot:{stone:800,iron:400},color:'#8b93a7'},
{id:'green',name:'دشت سبز',x:12,y:28,power:180,loot:{food:800,wood:500},color:'#46a758'},
{id:'river',name:'رودنشینان',x:44,y:27,power:300,loot:{food:600,gold:400},color:'#3e9bf0'}];
export const EXTRA_TRIBES=['wolf','falcon','dragon','panther','eagle','bear','fox','lion','snake','boar','crow','tiger'].map((k,i)=>({id:k+Date.now()+i,name:'قبیله '+k,x:5+Math.random()*46,y:5+Math.random()*26,power:200+i*60,color:'#777'}));