import{START_RESOURCES,DEFAULT_TRIBES,STORAGE_BASE}from'./config.js';
export const SAVE_KEY='village_rise_v6';
export function freshState(){return{v:6,day:1,resources:{...START_RESOURCES},
buildings:[
{id:'keep-1',type:'keep',x:13,y:8,level:1},{id:'farm-1',type:'farm',x:8,y:6,level:1},
{id:'farm-2',type:'farm',x:18,y:6,level:1},{id:'lumber-1',type:'lumber',x:6,y:10,level:1},
{id:'lumber-2',type:'lumber',x:20,y:10,level:1},{id:'quarry-1',type:'quarry',x:9,y:13,level:1},
{id:'iron-1',type:'ironmine',x:17,y:13,level:1},{id:'gold-1',type:'goldmine',x:13,y:4,level:1},
{id:'bar-1',type:'barracks',x:5,y:6,level:1},{id:'bar-2',type:'barracks',x:21,y:6,level:1},
{id:'bar-3',type:'barracks',x:13,y:12,level:1},{id:'wall-1',type:'wall',x:12,y:7,level:1}],
troops:{swordsman:0,spearman:0,axeman:0,archer:0,cavalry:0,knight:0,ballista:0,catapult:0},
training:{'bar-1':[],'bar-2':[],'bar-3':[]},
tribes:JSON.parse(JSON.stringify(DEFAULT_TRIBES)),conquered:0};}
export function load(){try{const s=localStorage.getItem(SAVE_KEY);if(s){const o=JSON.parse(s);if(o.v===6)return o;}}catch(e){}const f=freshState();save(f);return f;}
export function save(s){try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch(e){}}
export function storageCap(s){const k=(s.buildings.find(b=>b.type==='keep')?.level||1);return STORAGE_BASE+k*1000000;}
export function troopCap(s){const k=(s.buildings.find(b=>b.type==='keep')?.level||1);const f=s.buildings.filter(b=>b.type==='farm').reduce((a,b)=>a+b.level,0);return 220+k*40+f*8;}