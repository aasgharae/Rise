import {CONFIG,BUILDINGS,TROOPS,DEFAULT_TRIBES,buildingCost,buildingProd} from "./config.js";
import {createInitialState,loadState,saveState,clearSave,seasonInfo,keepLevel,barracksLevel,storageCap,calcRates,troopCap,troopCount} from "./state.js";
import {MapRenderer} from "./renderer.js";
import {armyPower,wallDefense,resolveBattle} from "./combat.js";
let state=loadState()||createInitialState();
if(!state.worldGrid)state.worldGrid=makeWorld();
function makeWorld(){let s=74129>>>0;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};const t=[];for(let y=0;y<62;y++){const r=[];for(let x=0;x<100;x++){const n=rnd();r.push(n<.08?"water":n<.2?"forest":n<.27?"hill":"grass");}t.push(r);}for(let y=0;y<62;y++){const rx=Math.floor(100*.64+Math.sin(y/7)*3);if(rx>=0&&rx<100)t[y][rx]="water";}return t;}
state.world=state.worldGrid;
const $=id=>document.getElementById(id);
const renderer=new MapRenderer($("gameCanvas"));
let toastT=null;function toast(m){const e=$("toast");e.textContent=m;e.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove("show"),2400);}
function fmt(n){return Math.floor(n).toLocaleString("fa-IR");}
function fmtTime(ms){const s=Math.max(0,Math.floor(ms/1000));const h=String(Math.floor(s/3600)).padStart(2,"0"),m=String(Math.floor(s%3600/60)).padStart(2,"0"),ss=String(s%60).padStart(2,"0");return `${h}:${m}:${ss}`;}
function persist(ok=true){const r=saveState(state);$("saveState").textContent=r?"ذخیره محلی فعال ✓":"خطا در ذخیره";}
function rates(){return calcRates(state);}
function tick(){
const now=Date.now();const dt=Math.min(120,(now-(state.lastTick||now))/1000);state.lastTick=now;
const si=seasonInfo(state,now);state.seasonDayCache=si.day;
if(si.finished){endSeason();return;}
const r=rates();const cap=storageCap(state);
let upkeep=0;for(const k in state.troops)upkeep+=(TROOPS[k].upkeep||0)*(state.troops[k]||0);
const foodUse=upkeep/3600*dt;
for(const k in r){if(k==="food"){state.resources.food+=r.food/3600*dt-foodUse;}else state.resources[k]+=r[k]/3600*dt;}
for(const k in state.resources){if(state.resources[k]<0)state.resources[k]=0;if(state.resources[k]>cap)state.resources[k]=cap;}
if(state.resources.food<=0.5&&troopCount(state)>0){for(const k in state.troops)if(state.troops[k]>0&&Math.random()<0.002)state.troops[k]--;}
processQueue(dt);
if(Math.floor(now/1000)!==Math.floor((state._last||now)/1000)){state._last=now;}
persist();renderTop();
}
function processQueue(dt){
if(!state.queue.length)return;let changed=false;
state.queue[0].left-=dt;
while(state.queue.length&&state.queue[0].left<=0){const q=state.queue.shift();state.troops[q.id]=(state.troops[q.id]||0)+q.count;changed=true;toast(`${TROOPS[q.id].name} آماده شد (${q.count}×)`);}
if(changed)renderArmy();
}
function endSeason(){
const wins=state.stats.wins;const reward={food:500+wins*120,wood:400+wins*100,stone:300+wins*90,gold:150+wins*60};
alert(`🏆 فصل ۴۵ روزه تمام شد!\nبردها: ${wins}\nپاداش فصل به انبار اضافه شد. فصل جدید با قبایل قوی‌تر شروع شد.`);
state.seasonStart=Date.now();state.tribes=JSON.parse(JSON.stringify(DEFAULT_TRIBES)).map(t=>({...t,maxPower:Math.round(t.power*1.12),power:Math.round(t.power*1.12),def:t.def+4,lastAttack:0,defeated:false}));
for(const k in reward)state.resources[k]=(state.resources[k]||0)+reward[k];
state.stats={wins:0,losses:0,loot:0};state.seasonDayCache=1;persist();renderAll();
}
function renderTop(){
const si=seasonInfo(state);state.seasonDayCache=si.day;
$("seasonDay").textContent=`روز ${si.day.toLocaleString("fa-IR")} / ${CONFIG.seasonLength}`;
$("seasonCountdown").textContent=`روز بعد: ${fmtTime(si.nextIn)} · پایان فصل: ${si.left} روز`;
$("seasonProgress").style.width=(si.day/CONFIG.seasonLength*100)+"%";
const r=rates();
$("resourceBar").innerHTML=[["food","🍖","غذا"],["wood","🪵","چوب"],["stone","🪨","سنگ"],["gold","🪙","طلا"]].map(([k,ic,lb])=>`<div class="resource"><span>${ic}</span><div><small>${lb} · +${Math.round(r[k]||0)}/ساعت</small><b>${fmt(state.resources[k])}</b></div></div>`).join("");
const ap=armyPower(state.troops)+Math.round(wallDefense(state)*0.6);
$("militaryPower").textContent=fmt(ap);
$("troopCap").textContent=`${fmt(troopCount(state))} / ${fmt(troopCap(state))}`;
$("winLoss").textContent=`${state.stats.wins.toLocaleString("fa-IR")} / ${state.stats.losses.toLocaleString("fa-IR")}`;
$("defensePower").textContent=fmt(wallDefense(state));
$("playerLevel").textContent=`سطح ${state.player.level} · قدرت ${fmt(ap)} · XP ${fmt(state.player.xp)}`;
const h=new Date().getHours();$("dayNight").textContent=(h>=6&&h<18)?"☀️ روز":"🌙 شب";
}
function renderBuild(){
const bl=$("buildList");bl.innerHTML="";
for(const k in BUILDINGS){
if(k==="keep")continue;
const b=BUILDINGS[k];const count=state.castle.buildings.filter(x=>x.type===k).length;
const cost=buildingCost(k,1);const costStr=Object.entries(cost).map(([rk,v])=>`${v} ${rk==="wood"?"چوب":rk==="stone"?"سنگ":rk==="food"?"غذا":"طلا"}`).join(" · ");
const btn=document.createElement("button");btn.className="build-option"+(state.selectedBuilding===k?" active":"");btn.innerHTML=`<span>${b.icon}</span><span><b>${b.name} (${count}×)</b><small>${costStr}</small></span>`;
btn.onclick=()=>{state.selectedBuilding=k;document.querySelectorAll(".build-option").forEach(e=>e.classList.remove("active"));btn.classList.add("active");$("selectedTool").textContent=`ساخت انتخاب‌شده: ${b.name} — ${b.desc}`;};
bl.appendChild(btn);
}
$("selectedTool").textContent=`ساخت انتخاب‌شده: ${BUILDINGS[state.selectedBuilding]?.name||""} — ارتقا تولید را چند برابر می‌کند، نیازی به پر کردن قلعه نیست`;
}
function renderUpgrade(){
const card=$("upgradeCard");const sel=state.selectedCastleBuilding;
if(!sel||state.activeMap!=="castle"){card.classList.add("hidden");return;}
const b=state.castle.buildings.find(x=>x.id===sel.id);if(!b){card.classList.add("hidden");return;}
card.classList.remove("hidden");const max=BUILDINGS[b.type].max||10;
const nextCost=b.level>=max?null:buildingCost(b.type,b.level+1);
const prod=buildingProd(b.type,b.level);const prodNext=b.level>=max?null:buildingProd(b.type,b.level+1);
const prodStr=Object.entries(prod).map(([k,v])=>`${k==="food"?"غذا":k==="wood"?"چوب":k==="stone"?"سنگ":"طلا"}: ${Math.round(v)}/h`).join("، ")||"—";
const nextStr=prodNext?Object.entries(prodNext).map(([k,v])=>`${Math.round(v)}/h`).join("، "):"MAX";
$("upgradeContent").innerHTML=`<div class="selection-title">${BUILDINGS[b.type].icon} ${BUILDINGS[b.type].name} — سطح ${b.level.toLocaleString("fa-IR")}</div><div class="selection-meta">تولید فعلی: ${prodStr}<br>بعد از ارتقا: ${nextStr}<br>${b.type==="wall"?"دفاع: "+(28*b.level):""}${b.type==="barracks"?"باز کردن نیرو تا سربازخانه سطح "+b.level:""}</div>${nextCost?`<div class="muted">هزینه ارتقا: ${Object.entries(nextCost).map(([k,v])=>v+" "+(k==="wood"?"چوب":k==="stone"?"سنگ":k==="food"?"غذا":"طلا")).join(" · ")}</div><div class="upgrade-btns"><button class="btn btn-primary" id="upBtn">ارتقا به سطح ${(b.level+1).toLocaleString("fa-IR")}</button><button class="btn btn-quiet" id="sellBtn">تخریب</button></div><div class="prog"><i style="width:${b.level/max*100}%"></i></div>`:`<div class="muted">به حداکثر سطح رسیده 👑</div><div class="upgrade-btns"><button class="btn btn-quiet" id="sellBtn">تخریب</button></div>`}`;
if(nextCost)$("upBtn").onclick=()=>upgradeBuilding(b);
$("sellBtn").onclick=()=>{if(!confirm("این ساختمان تخریب شود؟"))return;state.castle.buildings=state.castle.buildings.filter(x=>x.id!==b.id);state.selectedCastleBuilding=null;persist();renderAll();toast("ساختمان تخریب شد");};
}
function upgradeBuilding(b){
const max=BUILDINGS[b.type].max;if(b.level>=max){toast("حداکثر سطح!");return;}
const c=buildingCost(b.type,b.level+1);
for(const k in c)if((state.resources[k]||0)<c[k]){toast("منابع کافی نیست!");return;}
for(const k in c)state.resources[k]-=c[k];
b.level++;if(b.type==="keep"){state.player.level=Math.min(10,b.level+1);}
toast(`${BUILDINGS[b.type].name} به سطح ${b.level} ارتقا یافت ✨`);persist();renderAll();
}
function renderArmy(){
const bl=barracksLevel(state);$("barracksLevel").textContent=bl?`سربازخانه سطح ${bl}`:"سربازخانه نداری!";
const tl=$("trainList");tl.innerHTML="";
for(const k in TROOPS){
const t=TROOPS[k];const locked=bl<t.unlock;
const costStr=Object.entries(t.cost).map(([rk,v])=>`${v} ${rk==="food"?"غذا":rk==="gold"?"طلا":rk==="wood"?"چوب":"سنگ"}`).join(" · ");
const row=document.createElement("div");row.className="train-row";
row.innerHTML=`<div class="ic">${t.icon}</div><div><b>${t.name} ${locked?`🔒 (سربازخانه ${t.unlock})`:`(قدرت ${t.power})`}</b><small>${t.desc} · حمله ${t.atk} · دفاع ${t.def} · جان ${t.hp}</small><small>${costStr} · ${t.time} ثانیه</small></div>`;
const btn=document.createElement("button");btn.className="btn btn-primary btn-small";btn.textContent="ساخت";btn.disabled=locked;
btn.onclick=()=>trainTroop(k);
row.appendChild(btn);tl.appendChild(row);
}
$("queueList").innerHTML=state.queue.length?("در حال آموزش: "+state.queue.map(q=>`${TROOPS[q.id].name} ×${q.count} (${Math.ceil(q.left)}ث)`).join(" · ")):"صفی در آموزش نیست. تولید با ارتقای سربازخانه سریع‌تر می‌شود.";
$("troopOverview").innerHTML=Object.entries(state.troops).map(([k,v])=>`<span class="troop-chip">${TROOPS[k].icon} ${TROOPS[k].name}: <b>${v.toLocaleString("fa-IR")}</b></span>`).join("");
}
function trainTroop(id){
const t=TROOPS[id];const bl=barracksLevel(state);
if(bl<t.unlock){toast("اول سربازخانه را ارتقا بده!");return;}
if(troopCount(state)>=troopCap(state)){toast("ظرفیت ارتش پر است! مزرعه و قلعه را ارتقا بده.");return;}
for(const k in t.cost)if((state.resources[k]||0)<t.cost[k]){toast("منابع کافی برای "+t.name+" نداری!");return;}
for(const k in t.cost)state.resources[k]-=t.cost[k];
const speed=Math.max(0.4,1-(bl-1)*0.15);
state.queue.push({id,count:1,left:Math.ceil(t.time*speed)});
toast(`${t.name} به صف آموزش رفت`);persist();renderArmy();renderTop();
}
function renderTribes(){
$("tribeList").innerHTML=state.tribes.map(t=>`<div class="tribe-row"><span class="tribe-color" style="background:${t.color}"></span><span>${t.name} ${t.defeated?"🏴":""}</span><small>قدرت ${fmt(t.power)}</small><button class="btn btn-secondary btn-small" data-tribe="${t.id}">حمله</button></div>`).join("");
document.querySelectorAll("[data-tribe]").forEach(b=>b.onclick=()=>{const tr=state.tribes.find(x=>x.id===b.dataset.tribe);state.selectedEntity={...tr,kind:"tribe"};if(state.activeMap!=="world")setMap("world");renderAll();});
}
function renderSelection(){
const el=$("selectionContent");const it=state.selectedEntity;
if(!it){el.className="empty-state";el.textContent=state.activeMap==="world"?"یک قلعه را روی نقشه انتخاب کن.":"روی زمین خالی بزن تا بسازی، روی ساختمان بزن تا ارتقا بدهی.";return;}
el.className="";
if(it.kind==="player")el.innerHTML=`<div class="selection-title">♜ قلعه شما</div><div class="selection-meta">ارتش: ${fmt(troopCount(state))} نیرو<br>دفاع دیوار: ${fmt(wallDefense(state))}<br>برای مدیریت وارد قلعه شو</div>`;
else if(it.kind==="tribe")el.innerHTML=`<div class="selection-title">${it.name} ${it.defeated?"(فتح شده)":""}</div><div class="selection-meta">قلمرو: ${it.territory}<br>قدرت: ${fmt(it.power)} (حداکثر ${fmt(it.maxPower)})<br>ویژگی: ${it.reputation} · دفاع: ${it.def}<br>${it.defeated?"این قبیله ضعیف شده و غنیمت خوبی می‌دهد!":"حمله با ارتش قوی + منجنیق برای دیوار"}</div>`;
else el.innerHTML=`<div class="selection-title">${it.name||"زمین"}</div><div class="selection-meta">مختصات ${it.x}، ${it.y}</div>`;
}
function renderAttack(){
const sel=state.selectedEntity;
if(!sel||sel.kind!=="tribe"){$("attackContent").innerHTML=`<div class="empty-state">در نقشه جهان یک قبیله دشمن را انتخاب کن تا پنل حمله باز شود.</div>`;$("attackTroops").innerHTML="";$("attackHint").textContent="";return;}
const tr=state.tribes.find(t=>t.id===sel.id);
$("attackContent").innerHTML=`<div class="selection-title">🎯 هدف: ${tr.name}</div><div class="selection-meta">قدرت دشمن ${fmt(tr.power)} · دفاع ${tr.def} · ${tr.reputation}</div>`;
$("attackTroops").innerHTML=Object.keys(TROOPS).map(k=>`<div class="atk-box"><b>${TROOPS[k].icon}</b><small>${TROOPS[k].name} (${state.troops[k]||0})</small><input type="number" min="0" max="${state.troops[k]||0}" value="0" id="atk-${k}"></div>`).join("");
const myP=armyPower(state.troops);
$("attackHint").textContent=`قدرت کل ارتش تو: ${fmt(myP)} · دیوار: ${fmt(wallDefense(state))} · نکته: نیزه‌دار ضد سواره، سواره ضد شمشیرزن، منجنیق ضد دیوار`;
}
function doAttack(){
const sel=state.selectedEntity;if(!sel||sel.kind!=="tribe"){toast("اول یک قبیله را انتخاب کن");return;}
const tr=state.tribes.find(t=>t.id===sel.id);if(!tr){toast("قبیله پیدا نشد");return;}
const army={};let total=0;for(const k in TROOPS){const v=parseInt($("atk-"+k)?.value||"0",10)||0;if(v<0){toast("عدد نامعتبر");return;}if(v>(state.troops[k]||0)){toast(`${TROOPS[k].name} کافی نداری!`);return;}army[k]=v;total+=v;}
if(!total){toast("حداقل یک نیرو انتخاب کن!");return;}
const res=resolveBattle(state,army,tr);
for(const k in army)state.troops[k]-=(army[k]- (res.survivors[k]||0));
tr.power=Math.max(40,Math.round(tr.power-(res.win?tr.power*0.45+80:tr.power*0.08)));
tr.maxPower=Math.max(tr.maxPower,tr.power);tr.lastAttack=Date.now();
if(res.win&&tr.power<180){tr.defeated=true;}
if(res.win){for(const k in res.loot)state.resources[k]=Math.min(storageCap(state),state.resources[k]+res.loot[k]);state.stats.wins++;state.stats.loot+=res.loot.gold;state.player.xp+=res.xp;}
else state.stats.losses++;
state.player.power=armyPower(state.troops);
state.battleLog.unshift({t:Date.now(),win:res.win,enemy:tr.name,atk:res.atk,def:res.def,loot:res.loot,lost:res.lost});
if(state.battleLog.length>20)state.battleLog.length=20;
persist();renderAll();showResult(res,tr,army);
}
function showResult(res,tr,army){
const lootStr=res.win?Object.entries(res.loot).map(([k,v])=>`${k==="food"?"🍖":k==="wood"?"🪵":k==="stone"?"🪨":"🪙"} ${fmt(v)}`).join(" · "):"بدون غنیمت";
$("modalContent").innerHTML=`<div class="battle-result"><h2>${res.win?"🏆 پیروزی!":"💔 شکست..."}</h2><p>نبرد با <b>${tr.name}</b><br>قدرت حمله تو: <b>${fmt(res.atk)}</b> (ضریب ${res.bonus})<br>قدرت دفاع دشمن: <b>${fmt(res.def)}</b><br>نیروهای از دست رفته: <b>${fmt(res.lost)}</b><br>غنیمت: <b>${lootStr}</b><br>تجربه: +${fmt(res.xp)}<br>${res.win&&tr.defeated?"🏴 این قبیله کاملا فتح شد!":""}</p><div class="loot-grid">${res.win?Object.entries(res.loot).map(([k,v])=>`<div>${k}: +${fmt(v)}</div>`).join(""):"<div>ارتش را قوی‌تر کن، ترکیب ضد (نیزه‌دار/منجنیق) ببر و دوباره حمله کن.</div>"}</div><div class="upgrade-btns"><button class="btn btn-primary" id="okBtn">باشه!</button></div></div>`;
$("modal").classList.remove("hidden");$("okBtn").onclick=()=>$("modal").classList.add("hidden");
}
function renderLog(){
const el=$("battleLog");
if(!state.battleLog.length){el.innerHTML=`<div class="empty-state">هنوز نبردی نداشتی. از نقشه جهان حمله کن!</div>`;return;}
el.innerHTML=state.battleLog.map(l=>`<div class="log-item ${l.win?"":"lose"}">${l.win?"✅":"❌"} ${new Date(l.t).toLocaleString("fa-IR")} — ${l.enemy}<br>حمله ${fmt(l.atk)} vs دفاع ${fmt(l.def)} · تلفات ${fmt(l.lost)}${l.win?` · غنیمت 🪙${fmt(l.loot.gold)}`:``}</div>`).join("");
}
function setMap(m){state.activeMap=m;state.selectedEntity=null;state.selectedCastleBuilding=null;persist();renderAll();}
function handleWorldClick(p){
const targets=[{...state.player,kind:"player",name:"قلعه شما"},...state.tribes.map(t=>({...t,kind:"tribe"}))];
let best=null,bd=1e9;for(const t of targets){const d=Math.hypot(t.x-p.x,t.y-p.y);if(d<bd){bd=d;best=t;}}
if(best&&bd<3){state.selectedEntity=best;toast(best.kind==="player"?"قلعه خودت — می‌توانی وارد شوی":"اطلاعات "+best.name);}else state.selectedEntity={kind:"terrain",name:`زمین ${p.x}، ${p.y}`,x:p.x,y:p.y};
renderAll();persist();
}
function handleCastleClick(p){
const occ=state.castle.buildings.find(b=>b.x===p.x&&b.y===p.y);
if(occ){state.selectedCastleBuilding={id:occ.id};renderUpgrade();renderAll();toast(`${BUILDINGS[occ.type].name} سطح ${occ.level} — پنل ارتقا باز شد`);return;}
const type=state.selectedBuilding;const def=BUILDINGS[type];
const sameCount=state.castle.buildings.filter(b=>b.type===type).length;
if(sameCount>=(def.max||6)){toast(`سقف ${def.name} (${def.max} عدد) پر شده — به‌جاش ارتقا بده!`);return;}
const cost=buildingCost(type,1);const mult=1+sameCount*0.25;for(const k in cost)cost[k]=Math.ceil(cost[k]*mult);
for(const k in cost)if((state.resources[k]||0)<cost[k]){toast("منابع کافی نیست!");return;}
for(const k in cost)state.resources[k]-=cost[k];
state.castle.buildings.push({id:`${type}-${Date.now()}`,type,x:p.x,y:p.y,level:1});
toast(`${def.name} ساخته شد 🎉`);persist();renderAll();
}
function renderAll(){
const isW=state.activeMap==="world";
$("mapEyebrow").textContent=isW?"نقشه جهان":"قلمرو شخصی";
$("mapTitle").textContent=isW?"جهان شناخته‌شده":"قلعه فرمانده";
$("mapDescription").textContent=isW?"فقط نشان قلعه‌ها دیده می‌شود؛ داخل قلعه دشمن مخفی است. قبیله را بزن و حمله کن.":"ساختمان بساز، ارتقا بده، نیرو بساز. تولید با ارتقا چند برابر می‌شود.";
$("mapTag").textContent=isW?"WORLD MAP · 45-DAY SEASON":"YOUR CASTLE";
$("mapHint").textContent=isW?"قبیله دشمن را انتخاب کن":"روی خانه خالی بزن، روی ساختمان بزن ارتقا";
$("enterCastleBtn").classList.toggle("hidden",!isW);$("backWorldBtn").classList.toggle("hidden",isW);
$("castleTools").classList.toggle("hidden",isW);$("armyCard").classList.toggle("hidden",false);
if(isW)renderer.drawWorld(state);else renderer.drawCastle(state,state.selectedCastleBuilding?state.castle.buildings.find(b=>b.id===state.selectedCastleBuilding.id):null);
renderTop();renderTribes();renderSelection();renderBuild();renderUpgrade();renderArmy();renderAttack();renderLog();
$("mapCoordinates").textContent=state.selectedEntity?`انتخاب: ${state.selectedEntity.name||"موقعیت"}`:`مختصات: ${isW?state.player.x+"، "+state.player.y:"قلعه شخصی"}`;
}
$("gameCanvas").addEventListener("click",e=>{const p=renderer.hitTest(e);if(!p)return;if(state.activeMap==="world")handleWorldClick(p);else handleCastleClick(p);});
$("enterCastleBtn").onclick=()=>setMap("castle");$("backWorldBtn").onclick=()=>setMap("world");
$("attackBtn").onclick=doAttack;$("clearLogBtn").onclick=()=>{state.battleLog=[];persist();renderLog();};
$("modalClose").onclick=()=>$("modal").classList.add("hidden");
$("resetBtn").onclick=()=>{if(!confirm("همه پیشرفت پاک و فصل از اول شروع شود؟"))return;clearSave();state=createInitialState();state.worldGrid=makeWorld();state.world=state.worldGrid;persist();renderAll();toast("بازی از اول شروع شد");};
addEventListener("resize",()=>renderAll());
(function offline(){
const now=Date.now();const away=Math.min(72*3600,(now-(state.lastTick||now))/1000);
if(away>60){const r=calcRates(state);const gain={food:r.food/3600*away,wood:r.wood/3600*away,stone:r.stone/3600*away,gold:r.gold/3600*away};const cap=storageCap(state);for(const k in gain)state.resources[k]=Math.min(cap,state.resources[k]+gain[k]);setTimeout(()=>toast(`⏳ در غیاب تو تولید شد: 🍖${fmt(gain.food)} 🪵${fmt(gain.wood)}`),800);}
})();
renderAll();persist();
setInterval(tick,CONFIG.tickMs);
setInterval(()=>{renderer.frame();if(state.activeMap==="world")renderer.drawWorld(state);else renderer.drawCastle(state,state.selectedCastleBuilding?state.castle.buildings.find(b=>b.id===state.selectedCastleBuilding.id):null);},400);
setInterval(renderTop,1000);