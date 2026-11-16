import {CONFIG, BUILDINGS, TROOPS, DEFAULT_TRIBES, buildingCost, buildingProd, resName} from "./config.js";
import {createInitialState, loadState, saveState, clearSave, seasonInfo, keepLevel, barracksLevel, storageCap, calcRates, troopCap, troopCount, setSaveScope, availableTroopCapacity, advanceStateTime} from "./state.js";
import {MapRenderer} from "./renderer.js";
import {armyPower, wallDefense, resolveBattle} from "./combat.js";
function startGame(username){
setSaveScope(username);
let state = loadState();
if(!state) state = createInitialState();
state.player.name=username;
const $ = id => document.getElementById(id);
const renderer = new MapRenderer($("gameCanvas"));
$("logoutBtn").onclick=()=>location.reload();
let toastT = null;
function toast(m){const e=$("toast"); e.textContent=m; e.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>e.classList.remove("show"), 2400);}
function fmt(n){return Math.floor(n||0).toLocaleString("fa-IR");}
function fmtTime(ms){const s=Math.max(0,Math.floor(ms/1000));const h=String(Math.floor(s/3600)).padStart(2,"0");const m=String(Math.floor(s%3600/60)).padStart(2,"0");const ss=String(s%60).padStart(2,"0");return h+":"+m+":"+ss;}
function persist(){const ok=saveState(state); $("saveState").textContent = ok ? "ذخیره محلی فعال ✓" : "خطا در ذخیره";}
function rates(){return calcRates(state);}
function tick(){
const now=Date.now();
const dt=Math.max(0,(now-(state.lastTick||now))/1000);
if(dt>0){
 const result=advanceStateTime(state,dt);
 state.lastTick=now;
 if(result.completed.length) toast(result.completed.map(q=>TROOPS[q.id].name).join("، ")+" آماده شد");
}
rollSeasons(now);
state.seasonDayCache=seasonInfo(state,now).day;
persist(); renderTop(); renderArmy();
}
function rollSeasons(now=Date.now()){
const duration=CONFIG.seasonLength*CONFIG.dayMs;
let count=0;
while(now-state.seasonStart>=duration && count<1000){
 const wins=state.stats.wins||0;
 state.seasonStart+=duration; count++; state.seasonIndex=(state.seasonIndex||0)+1;
 const factor=Math.pow(1.12,Math.min(20,state.seasonIndex));
 state.tribes=JSON.parse(JSON.stringify(DEFAULT_TRIBES)).map(t=>({...t,maxPower:Math.round(t.power*factor),power:Math.round(t.power*factor),def:t.def+4*state.seasonIndex,defeated:false}));
 const cap=storageCap(state);
 for(const [k,v] of Object.entries({food:500+wins*120,wood:400+wins*100,stone:300+wins*90,iron:120+wins*30,gold:150+wins*60})) state.resources[k]=Math.min(cap,(state.resources[k]||0)+v);
 state.stats={wins:0,losses:0,loot:0};
}
if(count) toast("🏆 فصل تازه آغاز شد · "+count+" فصل بسته شد");
}
function renderTop(){
const si=seasonInfo(state);
state.seasonDayCache=si.day;
$("seasonDay").textContent="روز "+si.day.toLocaleString("fa-IR")+" / "+CONFIG.seasonLength;
$("seasonCountdown").textContent="روز بعد: "+fmtTime(si.nextIn)+" · مانده: "+si.left+" روز";
$("seasonProgress").style.width=(si.day/CONFIG.seasonLength*100)+"%";
const r=rates();
const order=["food","wood","stone","iron","gold"];
const icons={food:"🌾", wood:"🪵", stone:"🪨", iron:"⛓️", gold:"🪙"};
const names={food:"غذا", wood:"چوب", stone:"سنگ", iron:"آهن", gold:"طلا"};
let upkeep=0; for(const k in state.troops) upkeep+=(TROOPS[k].upkeep||0)*(state.troops[k]||0);
$("resourceBar").innerHTML=order.map(k=>{const net=(r[k]||0)-(k==="food"?upkeep:0);return '<div class="resource"><span class="ric"><img src="assets/icons/'+k+'.svg" alt=""></span><div><small>'+names[k]+' · '+(net>=0?"+":"")+Math.round(net)+'/h</small><b>'+fmt(state.resources[k])+'</b></div></div>';}).join("");
const ap=armyPower(state.troops);
$("militaryPower").textContent=fmt(ap);
$("troopCap").textContent=fmt(troopCount(state))+" / "+fmt(troopCap(state));
$("winLoss").textContent=(state.stats.wins||0).toLocaleString("fa-IR")+" / "+(state.stats.losses||0).toLocaleString("fa-IR");
$("defensePower").textContent=fmt(wallDefense(state));
$("playerLevel").textContent="فرمانده سطح "+(state.player.level||1).toLocaleString("fa-IR")+" · قدرت "+fmt(ap);
const h=new Date().getHours();
$("dayNight").textContent=(h>=6&&h<18)?"☀️ روز":"🌙 شب";
}
function renderUpgrade(){
const selId=state.selectedCastleId;
const b=state.castle.buildings.find(x=>x.id===selId);
if(!b || state.activeMap!=="castle"){
if(state.activeMap!=="castle"){$("upgradeContent").innerHTML='<div class="empty-state">وارد قلعه شو و روی یک ساختمان بزن. از لیست زیر هم می‌توانی ارتقا بدهی.</div>';}
else if(!b){$("upgradeContent").innerHTML='<div class="empty-state">روی یک ساختمان در قلعه بزن.</div>';}
return;
}
const def=BUILDINGS[b.type];
const max=def.max||10;
if(b.level>=max){
$("upgradeContent").innerHTML='<div class="selection-title">'+def.icon+' '+def.name+' — سطح '+b.level.toLocaleString("fa-IR")+' 👑 MAX</div><div class="selection-meta">'+def.desc+'</div>';
return;
}
const cost=buildingCost(b.type, b.level);
const prod=buildingProd(b.type, b.level);
const prodNext=buildingProd(b.type, b.level+1);
const prodStr=Object.keys(prod).length?Object.entries(prod).map(e=>resName(e[0])+": "+Math.round(e[1])+"/h").join("، "):(b.type==="wall"?"دفاع: "+(35*b.level):b.type==="barracks"?"سرعت آموزش و قفل نیرو":"انبار و ظرفیت");
const nextStr=Object.keys(prodNext).length?Object.entries(prodNext).map(e=>Math.round(e[1])+"/h").join("، "):(b.type==="wall"?"دفاع: "+(35*(b.level+1)):b.type==="barracks"?"سطح "+(b.level+1):"ارتقا انبار");
const costStr=Object.entries(cost).map(e=>e[1].toLocaleString("fa-IR")+" "+resName(e[0])).join(" · ");
$("upgradeContent").innerHTML='<div class="selection-title">'+def.icon+' '+def.name+' — سطح '+b.level.toLocaleString("fa-IR")+' به '+(b.level+1).toLocaleString("fa-IR")+'</div><div class="selection-meta">'+def.desc+'<br>فعلی: '+prodStr+'<br>بعدی: '+nextStr+'<br>هزینه: '+costStr+'</div><div class="upgrade-btns"><button class="btn btn-primary" id="upBtn">ارتقا ⬆️</button></div><div class="prog"><i style="width:'+(b.level/max*100)+'%"></i></div>';
$("upBtn").onclick=()=>upgradeBuilding(b.id);
}
function upgradeBuilding(id){
const b=state.castle.buildings.find(x=>x.id===id);
if(!b){toast("ساختمان پیدا نشد"); return;}
const def=BUILDINGS[b.type];
if(b.level>=(def.max||10)){toast("به حداکثر رسیده 👑"); return;}
const cost=buildingCost(b.type, b.level);
for(const k in cost){if((state.resources[k]||0)<cost[k]){toast("منابع کافی نیست! "+resName(k)+" لازم: "+fmt(cost[k])); return;}}
for(const k in cost) state.resources[k]-=cost[k];
b.level++;
toast(def.name+" به سطح "+b.level+" رسید ✨");
persist(); renderAll();
}
function renderBuildingList(){
const el=$("buildingList");
el.innerHTML="";
const sorted=[...state.castle.buildings].sort((a,b)=>a.type.localeCompare(b.type));
for(const b of sorted){
const def=BUILDINGS[b.type];
const maxed=b.level>=(def.max||10);
const row=document.createElement("div");
row.className="b-row";
row.innerHTML='<span class="bic"><img src="assets/icons/'+b.type+'.svg" alt=""></span><span><b>'+def.name+' <small style="display:inline;color:#ffd97a">'+b.level+'★</small></b><small>'+def.desc+'</small></span>';
const btn=document.createElement("button");
btn.className="btn btn-primary btn-small";
btn.textContent=maxed?"MAX":"ارتقا";
btn.disabled=maxed;
btn.onclick=(e)=>{e.stopPropagation(); state.selectedCastleId=b.id; upgradeBuilding(b.id);};
row.appendChild(btn);
row.onclick=()=>{state.selectedCastleId=b.id; renderUpgrade(); renderAll();};
el.appendChild(row);
}
}
function renderArmy(){
const bl=barracksLevel(state);
$("barracksLevel").textContent=bl?("سربازخانه سطح "+bl):"سربازخانه نداری!";
const tl=$("trainList");
tl.innerHTML="";
for(const k in TROOPS){
const t=TROOPS[k];
const locked=bl<t.unlock;
const costStr=Object.entries(t.cost).map(e=>e[1]+" "+resName(e[0])).join(" · ");
const row=document.createElement("div");
row.className="train-row";
row.innerHTML='<div class="ic"><img src="'+t.iconPath+'" alt=""></div><div><b>'+t.name+' '+(locked?("🔒 قفل (سربازخانه "+t.unlock+")"):("(قدرت "+t.power+")"))+'</b><small>'+t.desc+' · ⚔️'+t.atk+' 🛡️'+t.def+' ❤️'+t.hp+'</small><small>'+costStr+' · '+t.time+'ثانیه</small></div>';
const btn=document.createElement("button");
btn.className="btn btn-primary btn-small";
btn.textContent="ساخت";
btn.disabled=locked;
btn.onclick=()=>trainTroop(k);
row.appendChild(btn);
tl.appendChild(row);
}
$("queueList").textContent=(state.queue&&state.queue.length)?("در حال آموزش: "+state.queue.map(q=>TROOPS[q.id].name+" ×"+q.count+" ("+Math.ceil(q.left)+"ث)").join(" · ")):"صفی در آموزش نیست.";
$("troopOverview").innerHTML=Object.entries(state.troops).map(e=>'<span class="troop-chip"><img class="unit-icon tiny" src="'+TROOPS[e[0]].iconPath+'" alt=""> '+TROOPS[e[0]].name+': <b>'+e[1].toLocaleString("fa-IR")+'</b></span>').join("");
}
function trainTroop(id){
const t=TROOPS[id];
const bl=barracksLevel(state);
if(bl<t.unlock){toast("اول سربازخانه را به سطح "+t.unlock+" برسان!"); return;}
if(availableTroopCapacity(state)<=0){toast("ظرفیت ارتش پر است! مزرعه و قلعه را ارتقا بده."); return;}
for(const k in t.cost){if((state.resources[k]||0)<t.cost[k]){toast(resName(k)+" کافی نیست برای "+t.name); return;}}
for(const k in t.cost) state.resources[k]-=t.cost[k];
const speed=Math.max(0.4, 1-(bl-1)*0.15);
state.queue.push({id:id, count:1, left:Math.ceil(t.time*speed)});
toast(t.name+" به صف رفت");
persist(); renderArmy(); renderTop();
}
function renderTribes(){
$("tribeList").innerHTML=state.tribes.map(t=>'<div class="tribe-row"><span class="tribe-color" style="background:'+t.color+'"></span><span>'+t.name+' '+(t.defeated?"🏴":"")+'</span><small>قدرت '+fmt(t.power)+'</small><button class="btn btn-secondary btn-small" data-tribe="'+t.id+'" '+(t.defeated?"disabled":"")+'>'+(t.defeated?"فتح‌شده":"حمله")+'</button></div>').join("");
const btns=document.querySelectorAll("[data-tribe]");
btns.forEach(b=>{
b.onclick=()=>{
const tr=state.tribes.find(x=>x.id===b.getAttribute("data-tribe"));
if(state.activeMap!=="world") setMap("world");
state.selectedEntity={kind:"tribe", id:tr.id, name:tr.name, territory:tr.territory, power:tr.power, reputation:tr.reputation, color:tr.color, def:tr.def, defeated:tr.defeated};
renderAll();
};
});
}
function renderSelection(){
const el=$("selectionContent");
const it=state.selectedEntity;
if(!it){el.className="empty-state"; el.textContent = state.activeMap==="world" ? "یک قلعه را روی نقشه انتخاب کن." : "روی یک ساختمان بزن تا پنل ارتقا باز شود."; return;}
el.className="";
if(it.kind==="player") el.innerHTML='<div class="selection-title">♜ قلعه شما</div><div class="selection-meta">ارتش: '+fmt(troopCount(state))+' نیرو<br>دفاع دیوار: '+fmt(wallDefense(state))+'<br>وارد قلعه شو و ارتقا بده</div>';
else if(it.kind==="tribe") el.innerHTML='<div class="selection-title">'+it.name+' '+(it.defeated?"(فتح شده 🏴)":"")+'</div><div class="selection-meta">قلمرو: '+it.territory+'<br>قدرت: '+fmt(it.power)+'<br>ویژگی: '+(it.reputation||'بی‌طرف')+' · دفاع: '+it.def+'</div>';
else el.innerHTML='<div class="selection-title">'+(it.name||"زمین")+'</div>';
}
function renderAttack(){
const sel=state.selectedEntity;
if(!sel || sel.kind!=="tribe"){
$("attackBtn").disabled=true;
$("attackContent").innerHTML='<div class="empty-state">در نقشه جهان یک قبیله دشمن را انتخاب کن.</div>';
$("attackTroops").innerHTML=""; $("attackHint").textContent="";
return;
}
const tr=state.tribes.find(t=>t.id===sel.id);
if(!tr) return;
if(tr.defeated){$("attackContent").innerHTML='<div class="selection-title">🏴 این قبیله فتح شده</div><div class="selection-meta">تا شروع فصل بعد نمی‌توان دوباره به آن حمله کرد.</div>';$("attackTroops").innerHTML="";$("attackHint").textContent="";$("attackBtn").disabled=true;return;}
$("attackBtn").disabled=false;
$("attackContent").innerHTML='<div class="selection-title">🎯 هدف: '+tr.name+'</div><div class="selection-meta">قدرت '+fmt(tr.power)+' · دفاع '+tr.def+' · '+tr.reputation+'</div>';
$("attackTroops").innerHTML=Object.keys(TROOPS).map(k=>'<div class="atk-box"><b><img class="unit-icon" src="'+TROOPS[k].iconPath+'" alt=""></b><small>'+TROOPS[k].name+' ('+(state.troops[k]||0)+')</small><input type="number" min="0" max="'+(state.troops[k]||0)+'" value="0" id="atk-'+k+'"></div>').join("");
$("attackHint").textContent="قدرت ارتش تو: "+fmt(armyPower(state.troops))+" · دیوار: "+fmt(wallDefense(state))+" · دیوار فقط در دفاع قلعه اثر دارد";
}
function doAttack(){
const sel=state.selectedEntity;
if(!sel || sel.kind!=="tribe"){toast("اول یک قبیله انتخاب کن"); return;}
const tr=state.tribes.find(t=>t.id===sel.id);
if(!tr){toast("قبیله پیدا نشد"); return;}
if(tr.defeated){toast("این قبیله فتح شده و هدف حمله نیست"); return;}
const army={};
let total=0;
for(const k in TROOPS){
const inp=$("atk-"+k);
let v=parseInt(inp?inp.value:"0",10)||0;
if(v<0) v=0;
if(v>(state.troops[k]||0)){toast(TROOPS[k].name+" کافی نداری!"); return;}
army[k]=v; total+=v;
}
if(!total){toast("حداقل یک نیرو انتخاب کن!"); return;}
const res=resolveBattle(state, army, tr);
for(const k in army) state.troops[k]=(state.troops[k]||0)-(army[k]-(res.survivors[k]||0));
if(res.win){
tr.power=Math.max(40, Math.round(tr.power*0.55-60));
if(tr.power<190) tr.defeated=true;
for(const k in res.loot) state.resources[k]=Math.min(storageCap(state),(state.resources[k]||0)+res.loot[k]);
state.stats.wins++; state.stats.loot+=res.loot.gold; state.player.xp+=res.xp;
while((state.player.xp||0)>=(state.player.level||1)*300){state.player.level=(state.player.level||1)+1;toast("ارتقای فرمانده! سطح "+state.player.level);}
}else{
tr.power=Math.max(40, Math.round(tr.power*0.94));
state.stats.losses++;
}
state.selectedEntity={kind:"tribe", id:tr.id, name:tr.name, territory:tr.territory, power:tr.power, reputation:tr.reputation, color:tr.color, def:tr.def, defeated:tr.defeated};
state.battleLog.unshift({t:Date.now(), win:res.win, enemy:tr.name, atk:res.atk, def:res.def, loot:res.loot, lost:res.lost});
if(state.battleLog.length>20) state.battleLog.length=20;
persist(); renderAll(); showResult(res, tr);
}
function showResult(res, tr){
const icons={food:"🌾", wood:"🪵", stone:"🪨", iron:"⛓️", gold:"🪙"};
const lootStr=res.win?Object.entries(res.loot).map(e=>icons[e[0]]+" "+fmt(e[1])).join(" · "):"بدون غنیمت";
$("modalContent").innerHTML='<div><h2 style="margin:0 0 8px">'+(res.win?"🏆 پیروزی!":"💔 شکست...")+'</h2><p style="font-size:12px;line-height:2">نبرد با <b>'+tr.name+'</b><br>حمله تو: <b>'+fmt(res.atk)+'</b> (ضریب '+res.bonus+')<br>دفاع دشمن: <b>'+fmt(res.def)+'</b><br>تلفات تو: <b>'+fmt(res.lost)+'</b><br>غنیمت: <b>'+lootStr+'</b><br>تجربه: +'+fmt(res.xp)+'<br>'+(res.win&&tr.defeated?"🏴 این قبیله فتح شد!":"")+'</p><div class="upgrade-btns"><button class="btn btn-primary" id="okBtn">باشه!</button></div></div>';
$("modal").classList.remove("hidden");
$("okBtn").onclick=()=>$("modal").classList.add("hidden");
}
function renderLog(){
const el=$("battleLog");
if(!state.battleLog.length){el.innerHTML='<div class="empty-state">هنوز نبردی نداشتی.</div>'; return;}
el.innerHTML=state.battleLog.map(l=>'<div class="log-item '+(l.win?"":"lose")+'">'+(l.win?"✅":"❌")+" "+new Date(l.t).toLocaleString("fa-IR")+" — "+l.enemy+'<br>حمله '+fmt(l.atk)+' vs دفاع '+fmt(l.def)+' · تلفات '+fmt(l.lost)+(l.win?(' · 🪙'+fmt(l.loot.gold)):"")+'</div>').join("");
}
function setMap(m){state.activeMap=m; state.selectedEntity=null; persist(); renderAll();}
function handleWorldClick(p){
const targets=[{x:state.player.x, y:state.player.y, kind:"player", name:"قلعه شما"}];
for(const t of state.tribes) targets.push({x:t.x, y:t.y, kind:"tribe", id:t.id, name:t.name, territory:t.territory, power:t.power, reputation:t.reputation, color:t.color, def:t.def, defeated:t.defeated});
let best=null, bd=1e9;
for(const t of targets){const d=Math.hypot(t.x-p.x, t.y-p.y); if(d<bd){bd=d; best=t;}}
if(best && bd<3.2){state.selectedEntity=best; toast(best.kind==="player"?"قلعه خودت":"هدف: "+best.name);}
else state.selectedEntity={kind:"terrain", name:"زمین "+p.x+"، "+p.y};
renderAll(); persist();
}
function handleCastleClick(p){
const occ=state.castle.buildings.find(b=>b.x===p.x && b.y===p.y);
if(occ){
state.selectedCastleId=occ.id;
state.selectedEntity={kind:"castle", name:BUILDINGS[occ.type].name};
toast(BUILDINGS[occ.type].name+" سطح "+occ.level+" انتخاب شد");
renderAll(); persist();
}else{
toast("اینجا ساختمان نیست — از لیست ارتقا بده");
}
}
function renderAll(){
$("playerName").textContent=state.player.name||"فرمانده";
const isW=state.activeMap==="world";
$("mapEyebrow").textContent=isW?"نقشه جهان":"قلمرو شخصی";
$("mapTitle").textContent=isW?"جهان شناخته‌شده":"قلعه فرمانده";
$("mapDescription").textContent=isW?"قبیله دشمن را بزن و با ارتش واقعی حمله کن.":"همه ساختمان‌ها آماده‌اند — بزن و ارتقا بده تا تولید چند برابر شود.";
$("mapTag").textContent=isW?"WORLD MAP · 45-DAY SEASON":"YOUR CASTLE";
$("mapHint").textContent=isW?"قبیله دشمن را انتخاب کن":"روی ساختمان بزن";
$("enterCastleBtn").classList.toggle("hidden", !isW);
$("backWorldBtn").classList.toggle("hidden", isW);
if(isW) renderer.drawWorld(state);
else{
const sel=state.castle.buildings.find(b=>b.id===state.selectedCastleId);
renderer.drawCastle(state, sel?sel.id:null);
}
renderTop(); renderTribes(); renderSelection(); renderUpgrade(); renderBuildingList(); renderArmy(); renderAttack(); renderLog();
$("mapCoordinates").textContent=state.selectedEntity?("انتخاب: "+(state.selectedEntity.name||"موقعیت")):("مختصات: "+(isW?(state.player.x+"، "+state.player.y):"قلعه شخصی"));
}
$("gameCanvas").addEventListener("click", e=>{
const p=renderer.hitTest(e);
if(!p) return;
if(state.activeMap==="world") handleWorldClick(p);
else handleCastleClick(p);
});
$("enterCastleBtn").onclick=()=>setMap("castle");
$("backWorldBtn").onclick=()=>setMap("world");
$("attackBtn").onclick=doAttack;
$("clearLogBtn").onclick=()=>{state.battleLog=[]; persist(); renderLog();};
$("modalClose").onclick=()=>$("modal").classList.add("hidden");
$("resetBtn").onclick=()=>{
if(!confirm("همه پیشرفت پاک و فصل از اول شروع شود؟")) return;
clearSave(); state=createInitialState(); state.player.name=username; persist(); renderAll(); toast("بازی از اول شروع شد");
};
(function offline(){
const now=Date.now();
const away=Math.max(0,(now-(state.lastTick||now))/1000);
if(away>90){advanceStateTime(state,away);setTimeout(()=>toast("⏳ تولید خالص و صف آموزش در غیاب محاسبه شد (حداکثر ۷۲ ساعت)"),900);}
state.lastTick=now; rollSeasons(now);
})();
renderAll(); persist();
setInterval(tick, CONFIG.tickMs);
setInterval(()=>{renderer.frame(); if(state.activeMap==="world") renderer.drawWorld(state); else{const sel=state.castle.buildings.find(b=>b.id===state.selectedCastleId); renderer.drawCastle(state, sel?sel.id:null);} }, 500);

}
window.addEventListener("rise:authenticated", e=>startGame(e.detail.username));
