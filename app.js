import {CONFIG,BUILDINGS,TROOPS,DEFAULT_TRIBES,EXTRA_TRIBES,BATCH_OPTIONS,buildingCost,buildingProd,resName} from "./config.js";
import {createInitialState,loadState,saveState,clearSave,seasonInfo,keepLevel,barracksLevel,barracksTotal,storageCap,calcRates,troopCap,troopCount} from "./state.js";
import {MapRenderer} from "./renderer.js";
import {armyPower,wallDefense,resolveBattle} from "./combat.js";
let state=loadState();if(!state)state=createInitialState();
try{const el=Date.now()-state.lastTick;if(el>5000){const h=Math.min(12,el/3600000);const r=calcRates(state);const cap=storageCap(state);for(const k in r)state.resources[k]=Math.min(cap,(state.resources[k]||0)+r[k]*h);}}catch(e){}
const $=id=>document.getElementById(id);
const renderer=new MapRenderer($("gameCanvas"));
let toastT=null;function toast(m){const e=$("toast");if(!e)return;e.textContent=m;e.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove("show"),2400);}
function fmt(n){return Math.floor(n||0).toLocaleString("fa-IR");}
function fmtTime(ms){const s=Math.max(0,Math.floor(ms/1000));const h=String(Math.floor(s/3600)).padStart(2,"0");const m=String(Math.floor(s%3600/60)).padStart(2,"0");const ss=String(s%60).padStart(2,"0");return h+":"+m+":"+ss;}
let attackSel={};
function persist(){const ok=saveState(state);const el=$("saveState");if(el)el.textContent=ok?"ذخیره محلی فعال ✓":"خطا در ذخیره";}
function rates(){return calcRates(state);}
function tick(){
const now=Date.now();const dt=Math.min(120,(now-(state.lastTick||now))/1000);state.lastTick=now;
const si=seasonInfo(state,now);state.seasonDayCache=si.day;if(si.finished){endSeason();return;}
const r=rates();const cap=storageCap(state);let upkeep=0;for(const k in state.troops)upkeep+=(TROOPS[k].upkeep||0)*(state.troops[k]||0);
state.resources.food=(state.resources.food||0)+(r.food||0)/3600*dt-upkeep/3600*dt;
state.resources.wood=(state.resources.wood||0)+(r.wood||0)/3600*dt;
state.resources.stone=(state.resources.stone||0)+(r.stone||0)/3600*dt;
state.resources.iron=(state.resources.iron||0)+(r.iron||0)/3600*dt;
state.resources.gold=(state.resources.gold||0)+(r.gold||0)/3600*dt;
for(const k in state.resources){if(state.resources[k]<0)state.resources[k]=0;if(state.resources[k]>cap)state.resources[k]=cap;}
if(state.queue&&state.queue.length){state.queue[0].left-=dt;while(state.queue.length&&state.queue[0].left<=0){const q=state.queue.shift();state.troops[q.id]=(state.troops[q.id]||0)+q.count;toast(TROOPS[q.id].name+" آماده شد ×"+q.count);}renderArmy();}
persist();renderTop();
}
function endSeason(){
const wins=state.stats.wins||0;alert("🏆 فصل ۴۵ روزه تمام شد!\nبردها: "+wins+"\nپاداش فصل داده شد.");
state.seasonStart=Date.now();state.tribes=JSON.parse(JSON.stringify(DEFAULT_TRIBES)).map(t=>({...t,maxPower:Math.round(t.power*1.12),power:Math.round(t.power*1.12),def:t.def+4,defeated:false}));
state.resources.food=(state.resources.food||0)+500+wins*120;state.resources.wood=(state.resources.wood||0)+400+wins*100;state.resources.stone=(state.resources.stone||0)+300+wins*90;state.resources.iron=(state.resources.iron||0)+120+wins*30;state.resources.gold=(state.resources.gold||0)+150+wins*60;
state.stats={wins:0,losses:0,loot:0};state.seasonDayCache=1;persist();renderAll();
}
function renderTop(){
const si=seasonInfo(state);state.seasonDayCache=si.day;
$("seasonDay").textContent="روز "+si.day.toLocaleString("fa-IR")+" / "+CONFIG.seasonLength;
$("seasonCountdown").textContent="روز بعد: "+fmtTime(si.nextIn)+" · مانده: "+si.left+" روز";
$("seasonProgress").style.width=(si.day/CONFIG.seasonLength*100)+"%";
const r=rates();const order=["food","wood","stone","iron","gold"];const icons={food:"🍖",wood:"🪵",stone:"🪨",iron:"⛓️",gold:"🪙"};const names={food:"غذا",wood:"چوب",stone:"سنگ",iron:"آهن",gold:"طلا"};
$("resourceBar").innerHTML=order.map(k=>'<div class="resource"><span class="ric">'+icons[k]+'</span><div><small>'+names[k]+' · +'+Math.round(r[k]||0)+'/h</small><b>'+fmt(state.resources[k])+'</b></div></div>').join("");
const ap=armyPower(state.troops)+Math.round(wallDefense(state)*0.6);
$("militaryPower").textContent=fmt(ap);$("troopCap").textContent=fmt(troopCount(state))+" / "+fmt(troopCap(state));
$("winLoss").textContent=(state.stats.wins||0).toLocaleString("fa-IR")+" / "+(state.stats.losses||0).toLocaleString("fa-IR");
$("defensePower").textContent=fmt(wallDefense(state));
$("playerLevel").textContent="قلعه سطح "+keepLevel(state).toLocaleString("fa-IR")+" · قدرت "+fmt(ap);
const h=new Date().getHours();$("dayNight").textContent=(h>=6&&h<18)?"☀️ روز":"🌙 شب";
}
function renderUpgrade(){
const selId=state.selectedCastleId;const b=state.castle.buildings.find(x=>x.id===selId);
if(!b||state.activeMap!=="castle"){if(state.activeMap!=="castle")$("upgradeContent").innerHTML='<div class="empty-state">وارد قلعه شو و روی یک ساختمان بزن. از لیست زیر هم می‌توانی ارتقا بدهی.</div>';else if(!b)$("upgradeContent").innerHTML='<div class="empty-state">روی یک ساختمان در قلعه بزن.</div>';return;}
const def=BUILDINGS[b.type];const max=def.max||10;
if(b.level>=max){$("upgradeContent").innerHTML='<div class="selection-title">'+def.icon+' '+def.name+' — سطح '+b.level.toLocaleString("fa-IR")+' 👑 MAX</div>';return;}
const cost=buildingCost(b.type,b.level);const prod=buildingProd(b.type,b.level);const prodN=buildingProd(b.type,b.level+1);
const cur=Object.keys(prod).length?Object.entries(prod).map(e=>resName(e[0])+": "+Math.round(e[1])+"/h").join("،"):(b.type==="wall"?"دفاع: "+(35*b.level):b.type==="barracks"?"بازکردن نیرو":"انبار");
const nxt=Object.keys(prodN).length?Object.entries(prodN).map(e=>Math.round(e[1])+"/h").join("،"):(b.type==="wall"?"دفاع: "+(35*(b.level+1)):"سطح "+(b.level+1));
const cs=Object.entries(cost).map(e=>e[1].toLocaleString("fa-IR")+" "+resName(e[0])).join(" · ");
$("upgradeContent").innerHTML='<div class="selection-title">'+def.icon+' '+def.name+' — '+b.level.toLocaleString("fa-IR")+' به '+(b.level+1).toLocaleString("fa-IR")+'</div><div class="selection-meta">'+def.desc+'<br>فعلی: '+cur+'<br>بعدی: '+nxt+'<br>هزینه: '+cs+'</div><div class="upgrade-btns"><button class="btn btn-primary" id="upBtn">ارتقا ⬆️</button></div>';
$("upBtn").onclick=()=>upgradeBuilding(b.id);
}
function upgradeBuilding(id){const b=state.castle.buildings.find(x=>x.id===id);if(!b){toast("ساختمان پیدا نشد");return;}const def=BUILDINGS[b.type];if(b.level>=(def.max||10)){toast("به حداکثر رسیده 👑");return;}const cost=buildingCost(b.type,b.level);for(const k in cost)if((state.resources[k]||0)<cost[k]){toast("منابع کافی نیست! "+resName(k)+" لازم: "+fmt(cost[k]));return;}for(const k in cost)state.resources[k]-=cost[k];b.level++;toast(def.name+" به سطح "+b.level+" رسید ✨");persist();renderAll();}
function renderBuildingList(){
const el=$("buildingList");el.innerHTML="";const sorted=[...state.castle.buildings].sort((a,b)=>a.type.localeCompare(b.type));
for(const b of sorted){const def=BUILDINGS[b.type];const maxed=b.level>=(def.max||10);const row=document.createElement("div");row.className="b-row";
row.innerHTML='<span class="bic">'+def.icon+'</span><span><b>'+def.name+' <small style="display:inline;color:#ffd97a">'+b.level+'★</small></b><small>'+def.desc+'</small></span>';
const btn=document.createElement("button");btn.className="btn btn-primary btn-small";btn.textContent=maxed?"MAX":"ارتقا";btn.disabled=maxed;btn.onclick=e=>{e.stopPropagation();state.selectedCastleId=b.id;upgradeBuilding(b.id);};row.appendChild(btn);
row.onclick=()=>{state.selectedCastleId=b.id;renderUpgrade();renderAll();};el.appendChild(row);}
}
function speedMult(){return 1+barracksTotal(state)*0.3;}
function renderArmy(){
const bl=barracksLevel(state);$("barracksLevel").textContent=bl?("سربازخانه "+bl+"★ · سرعت ×"+speedMult().toFixed(1)):"سربازخانه نداری";
const el=$("trainList");el.innerHTML="";
for(const id in TROOPS){const t=TROOPS[id];const locked=bl<t.unlock;
const row=document.createElement("div");row.className="t-row"+(locked?" locked":"");
const costStr=Object.entries(t.cost).map(e=>e[1]+" "+resName(e[0])).join(" · ");
row.innerHTML='<span class="bic">'+t.icon+'</span><span><b>'+t.name+'</b><small>'+t.desc+' · ⚔'+t.power+' · قفل لول '+t.unlock+'</small><small>'+costStr+' · ⏱'+t.time+'ثانیه</small><small>داری: '+(state.troops[id]||0).toLocaleString("fa-IR")+'</small></span>';
const wrap=document.createElement("div");wrap.className="batch-btns";
for(const n of BATCH_OPTIONS){const b=document.createElement("button");b.className="btn btn-small "+(n>=50?"btn-danger":"btn-secondary");b.textContent="+"+n;b.disabled=locked;b.onclick=()=>trainTroop(id,n);wrap.appendChild(b);}
row.appendChild(wrap);el.appendChild(row);}
const q=$("queueList");if(!state.queue.length)q.innerHTML='<div class="empty-state">صف آموزش خالی است. ۵۰تایی و ۱۰۰تایی بساز.</div>';
else q.innerHTML=state.queue.map((it,i)=>{const t=TROOPS[it.id];const pct=Math.max(0,Math.min(100,100*(1-it.left/it.total)));return '<div class="q-row"><span>'+t.icon+' '+t.name+' ×'+it.count+'</span><div class="prog"><i style="width:'+pct+'%"></i></div><small>'+Math.ceil(it.left)+'ثانیه</small></div>';}).join("");
const ov=$("troopOverview");ov.innerHTML=Object.keys(TROOPS).map(k=>'<span class="ov">'+TROOPS[k].icon+' '+(state.troops[k]||0)+'</span>').join("")+"<div><small>ظرفیت: "+troopCount(state)+"/"+troopCap(state)+"</small></div>";
}
function trainTroop(id,count){
const t=TROOPS[id];if(!t)return;if(barracksLevel(state)<t.unlock){toast("اول سربازخانه را به سطح "+t.unlock+" برسان");return;}
if(troopCount(state)+count>troopCap(state)){toast("ظرفیت ارتش پر است! مزرعه و قلعه را ارتقا بده");return;}
const need={};for(const k in t.cost)need[k]=t.cost[k]*count;
for(const k in need)if((state.resources[k]||0)<need[k]){toast("منابع کافی نیست برای ×"+count+"! "+resName(k)+" کم داری");return;}
if(state.queue.length>=5){toast("صف پر است (۵)");return;}
for(const k in need)state.resources[k]-=need[k];
const total=Math.ceil(t.time*Math.pow(count,0.75)/speedMult());
state.queue.push({id:id,count:count,left:total,total:total});
toast(t.name+" ×"+count+" در صف رفت");persist();renderAll();
}
function renderTribes(){
const el=$("tribeList");el.innerHTML=state.tribes.map(t=>'<div class="tribe-row'+(state.selectedEntity===t.id?" sel":"")+'" data-id="'+t.id+'"><span class="dot" style="background:'+t.color+'"></span><span><b>'+t.name+'</b><small>'+(t.defeated?"فتح شد 🏴":"⚔"+t.power+" · 🛡"+t.def)+'</small></span></div>').join("");
el.querySelectorAll(".tribe-row").forEach(r=>r.onclick=()=>{state.selectedEntity=r.dataset.id;renderAll();});
}
function renderSelection(){
const el=$("selectionContent");const t=state.tribes.find(x=>x.id===state.selectedEntity);
if(state.activeMap==="world"){if(!t){el.innerHTML="یک قلعه را روی نقشه انتخاب کن.";return;}
el.innerHTML='<div class="selection-title" style="border-color:'+t.color+'">'+t.name+'</div><div class="selection-meta">'+(t.territory||"")+" · "+(t.reputation||"")+'<br>قدرت: ⚔'+t.power+' · دفاع: 🛡'+t.def+'<br>'+(t.defeated?"این قبیله فتح شده و به‌زودی جایگزین می‌شود.":"برای حمله، پایین صفحه را ببین.")+'</div>';}
else{el.innerHTML="حالت قلعه: روی ساختمان بزن تا ارتقا بدهی.";}
}
function renderAttack(){
const box=$("attackContent");const t=state.tribes.find(x=>x.id===state.selectedEntity);
if(!t||state.activeMap!=="world"){if(state.activeMap!=="castle")box.innerHTML='<div class="empty-state">در نقشه جهان یک قبیله دشمن را انتخاب کن.</div>';else box.innerHTML='<div class="empty-state">برای حمله به جهان برگرد.</div>';$("attackTroops").innerHTML="";return;}
if(!(state.selectedEntity in attackSel)||!attackSel[state.selectedEntity]){const o={};for(const k in TROOPS)o[k]=state.troops[k]||0;attackSel[state.selectedEntity]=o;}
const sel=attackSel[state.selectedEntity];
box.innerHTML='<div class="selection-title">'+t.name+' <small>⚔'+t.power+' · 🛡'+t.def+'</small></div><div class="selection-meta">قدرت تو: '+armyPower(state.troops)+' + دیوار '+Math.round(wallDefense(state)*0.6)+'</div>';
$("attackTroops").innerHTML=Object.keys(TROOPS).map(k=>{const have=state.troops[k]||0;if(!have)return "";return '<label class="atk-pick"><span>'+TROOPS[k].icon+' '+TROOPS[k].name+' ('+have+')</span><input type="number" min="0" max="'+have+'" value="'+Math.min(have,sel[k]||0)+'" data-k="'+k+'"></label>';}).join("")+'<div class="atk-quick"><button class="btn btn-small btn-secondary" id="fillAll">همه</button><button class="btn btn-small btn-secondary" id="fill50">۵۰تایی</button><button class="btn btn-small btn-secondary" id="fill100">۱۰۰تایی</button></div>';
$("attackTroops").querySelectorAll("input").forEach(inp=>inp.onchange=()=>{const k=inp.dataset.k;sel[k]=Math.max(0,Math.min(state.troops[k]||0,parseInt(inp.value||0)));});
const fA=$("fillAll");if(fA)fA.onclick=()=>{for(const k in TROOPS)sel[k]=state.troops[k]||0;renderAttack();};
const f5=$("fill50");if(f5)f5.onclick=()=>{for(const k in TROOPS)sel[k]=Math.min(50,state.troops[k]||0);renderAttack();};
const f1=$("fill100");if(f1)f1.onclick=()=>{for(const k in TROOPS)sel[k]=Math.min(100,state.troops[k]||0);renderAttack();};
$("attackHint").textContent="تلفات واقعی است. برد جایزه طلا و منابع می‌دهد.";
}
function findFreeSpot(){
for(let i=0;i<90;i++){const x=4+Math.floor(Math.random()*48),y=4+Math.floor(Math.random()*28);
if(state.world[y][x]==="water")continue;let ok=true;
if(Math.hypot(x-state.player.x,y-state.player.y)<9)ok=false;
for(const t of state.tribes)if(Math.hypot(x-t.x,y-t.y)<7)ok=false;
if(ok)return{x:x,y:y};}
return{x:8+Math.floor(Math.random()*40),y:6+Math.floor(Math.random()*24)};
}
function spawnReplacement(oldTribe,idx){
const used=new Set(state.tribes.map(t=>t.id));const pool=EXTRA_TRIBES.filter(t=>!used.has(t.id+"-"+idx)&&!used.has(t.id));
const base=pool.length?pool[Math.floor(Math.random()*pool.length)]:EXTRA_TRIBES[Math.floor(Math.random()*EXTRA_TRIBES.length)];
const day=state.seasonDayCache||1;const wins=state.stats.wins||0;
const np=Math.round((oldTribe.power*1.35+90+day*7)*(1+wins*0.07));
const spot=findFreeSpot();const nid=base.id+"-"+Date.now()%100000;
state.tribes[idx]={id:nid,name:base.name,color:base.color,x:spot.x,y:spot.y,power:np,def:oldTribe.def+3,maxPower:np,defeated:false,territory:base.territory,reputation:base.reputation};
toast("⚠️ "+base.name+" در نقشه ظاهر شد! قدرت "+np);
}
function doAttack(){
const t=state.tribes.find(x=>x.id===state.selectedEntity);if(!t){toast("اول یک قبیله انتخاب کن");return;}
const sel=attackSel[t.id]||{};const army={};let sum=0;for(const k in TROOPS){army[k]=Math.max(0,Math.min(state.troops[k]||0,sel[k]||0));sum+=army[k];}
if(!sum){toast("هیچ نیرویی برای حمله انتخاب نشده");return;}
const res=resolveBattle(state,army,t);
for(const k in army)state.troops[k]=(state.troops[k]||0)-((army[k]||0)-(res.survivors[k]||0));
if(res.win){
const cap=storageCap(state);for(const k in res.loot)state.resources[k]=Math.min(cap,(state.resources[k]||0)+res.loot[k]);
state.stats.wins++;state.stats.loot+=res.loot.gold||0;state.player.xp+=res.xp;
const idx=state.tribes.findIndex(x=>x.id===t.id);
logBattle("✅ برد مقابل <b>"+t.name+"</b> · غنیمت 🪙"+res.loot.gold+" 🌾"+res.loot.food+" · تلفات "+res.lost);
toast("پیروزی! غنیمت گرفتی 🎉");
spawnReplacement(t,idx);state.selectedEntity=state.tribes[idx].id;
}else{state.stats.losses++;state.player.xp+=res.xp;t.power=Math.round(t.power*1.02);t.def+=1;logBattle("❌ باخت از <b>"+t.name+"</b> · قدرت دشمن "+res.def+" vs "+res.atk+" · تلفات "+res.lost);toast("شکست خوردی... ارتش را قوی‌تر کن");}
while(state.player.xp>=200){state.player.xp-=200;state.player.level++;}
persist();renderAll();
}
function logBattle(html){const el=$("battleLog");const d=document.createElement("div");d.className="log-row";d.innerHTML="<small>روز "+state.seasonDayCache+"</small> "+html;el.prepend(d);while(el.children.length>30)el.lastChild.remove();}
function renderAll(){renderTop();renderUpgrade();renderBuildingList();renderArmy();renderTribes();renderSelection();renderAttack();renderer.draw(state,state.selectedCastleId);}
function bind(){
$("enterCastleBtn").onclick=()=>{state.activeMap="castle";$("enterCastleBtn").classList.add("hidden");$("backWorldBtn").classList.remove("hidden");$("mapEyebrow").textContent="قلعه من";$("mapTitle").textContent="قلعه فرماندهی";$("mapDescription").textContent="روی ساختمان بزن تا ارتقا بدهی.";$("mapTag").textContent="CASTLE";renderAll();};
$("backWorldBtn").onclick=()=>{state.activeMap="world";$("backWorldBtn").classList.add("hidden");$("enterCastleBtn").classList.remove("hidden");$("mapEyebrow").textContent="نقشه جهان";$("mapTitle").textContent="جهان شناخته‌شده";$("mapDescription").textContent="قبیله هدف را انتخاب کن و با ارتش واقعی حمله کن.";$("mapTag").textContent="WORLD MAP";renderAll();};
$("attackBtn").onclick=doAttack;
$("resetBtn").onclick=()=>{if(!confirm("از نو شروع شود؟"))return;clearSave();state=createInitialState();attackSel={};persist();renderAll();};
$("clearLogBtn").onclick=()=>{$("battleLog").innerHTML="";};
const lg=$("logoutBtn");if(lg)lg.onclick=()=>{try{localStorage.removeItem("rise_user");}catch(e){}location.reload();};
$("gameCanvas").addEventListener("click",ev=>{
const p=renderer.toTile(ev);if(!p)return;
if(state.activeMap==="world"){let best=null,bd=99;for(const t of state.tribes){const d=Math.hypot(t.x-p.x,t.y-p.y);if(d<3&&d<bd){bd=d;best=t;}}
if(best){state.selectedEntity=best.id;toast(best.name+" انتخاب شد");}
else{const cp=$("mapCoordinates");if(cp)cp.textContent="مختصات: "+p.x+" ، "+p.y;}}
else{const b=state.castle.buildings.find(b=>b.x===p.x&&b.y===p.y);if(b){state.selectedCastleId=b.id;toast(BUILDINGS[b.type].name+" سطح "+b.level);renderUpgrade();renderer.draw(state,state.selectedCastleId);return;}}
renderAll();});
$("gameCanvas").addEventListener("mousemove",ev=>{const p=renderer.toTile(ev);if(!p)return;const cp=$("mapCoordinates");if(cp)cp.textContent="مختصات: "+p.x+" ، "+p.y;});
window.addEventListener("resize",()=>renderer.draw(state,state.selectedCastleId));
}
bind();renderAll();setInterval(tick,1000);
(function loop(){renderer.frame();try{renderer.draw(state,state.selectedCastleId);}catch(e){}requestAnimationFrame(loop);})();