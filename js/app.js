import { CONFIG, BUILDINGS } from "./config.js";
import { createInitialState, loadState, saveState, clearSavedState } from "./state.js";
import { MapRenderer } from "./renderer.js";

let state = loadState() || createInitialState();
const renderer = new MapRenderer(document.getElementById("gameCanvas"));
const $ = id => document.getElementById(id);
let toastTimer = null;

const RESOURCE_META = [
  ["food","🍖","غذا"], ["wood","🪵","چوب"], ["stone","🪨","سنگ"], ["gold","🪙","طلا"]
];

function toast(message) {
  const el=$("toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2200);
}

function render() {
  const isWorld=state.activeMap==="world";
  $("mapEyebrow").textContent=isWorld?"نقشه جهان":"قلمرو شخصی";
  $("mapTitle").textContent=isWorld?"جهان شناخته‌شده":"قلعه فرمانده";
  $("mapDescription").textContent=isWorld
    ?"در جهان فقط موقعیت و نشان قلعه‌ها دیده می‌شود؛ جزئیات داخلی سایر قلعه‌ها محرمانه است."
    :"این نقشه فقط متعلق به توست؛ ساختمان‌ها و اقتصاد قلعه را از اینجا مدیریت کن.";
  $("mapTag").textContent=isWorld?"WORLD MAP":"YOUR CASTLE";
  $("mapHint").textContent=isWorld?"قلعه خودت را برای ورود انتخاب کن؛ قلعه‌های دیگر فقط اطلاعات عمومی دارند":"ساختمان را از پنل انتخاب کن و روی خانه خالی بزن";
  $("enterCastleBtn").classList.toggle("hidden",!isWorld);
  $("backWorldBtn").classList.toggle("hidden",isWorld);
  $("castleTools").classList.toggle("hidden",isWorld);
  if (isWorld) renderer.drawWorld(state); else renderer.drawCastle(state);
  renderResources(); renderTribes(); renderSelection(); renderStats();
}

function renderResources() {
  $("resourceBar").innerHTML=RESOURCE_META.map(([key,icon,label])=>
    `<div class="resource" title="${label}"><span>${icon}</span><b>${Math.floor(state.resources[key])}</b></div>`
  ).join("");
}
function renderTribes() {
  $("tribeList").innerHTML=state.tribes.map(t=>
    `<div class="tribe-row"><span class="tribe-color" style="background:${t.color}"></span><span>${t.name}</span><small>قدرت ${t.power}</small></div>`
  ).join("");
}
function renderStats() {
  const military=state.player.power+state.castle.buildings.filter(b=>b.type==="barracks").length*40;
  $("seasonDay").textContent=`${state.seasonDay} / ${CONFIG.seasonLength}`;
  $("militaryPower").textContent=military.toLocaleString("fa-IR");
  $("mapCoordinates").textContent=state.selectedEntity
    ?`انتخاب: ${state.selectedEntity.name || "موقعیت"}`
    :`مختصات: ${state.activeMap==="world" ? `${state.player.x}, ${state.player.y}` : "قلعه شخصی"}`;
}
function renderSelection() {
  const el=$("selectionContent"), item=state.selectedEntity;
  if (!item) { el.className="empty-state"; el.textContent="برای دیدن اطلاعات یک قلعه، آن را روی نقشه انتخاب کن."; return; }
  el.className="";
  if (item.kind==="player") {
    el.innerHTML=`<div class="selection-title">♜ قلعه فرمانده بی‌نام</div><div class="selection-meta">مالک: تو<br>وضعیت: قلمرو شخصی<br>اطلاعات داخلی: در دسترس صاحب قلعه</div><span class="tribe-badge">✦ قلعه شما</span>`;
  } else {
    el.innerHTML=`<div class="selection-title">${item.name}</div><div class="selection-meta">قلمرو: ${item.territory}<br>قدرت اعلام‌شده: ${item.power}<br>ویژگی: ${item.reputation}<br>وضعیت: قبیله مستقل</div><span class="tribe-badge"><span class="tribe-color" style="background:${item.color}"></span> اطلاعات عمومی فقط</span>`;
  }
}
function setMap(map) { state.activeMap=map; state.selectedEntity=null; render(); persist(); }
function persist() {
  const ok=saveState(state);
  $("saveState").textContent=ok?"ذخیره محلی فعال":"خطا در ذخیره";
}

function handleWorldClick(point) {
  const targets=[{...state.player,kind:"player",name:"قلعه شما"},...state.tribes.map(t=>({...t,kind:"tribe"}))];
  let nearest=null, distance=Infinity;
  for (const target of targets) {
    const d=Math.hypot(target.x-point.x,target.y-point.y);
    if (d<distance) {distance=d;nearest=target;}
  }
  if (nearest && distance<2.2) {
    state.selectedEntity=nearest;
    renderSelection(); renderStats();
    if (nearest.kind==="player") toast("قلعه خودت انتخاب شد؛ می‌توانی وارد آن شوی.");
    else toast("اطلاعات عمومی قبیله نمایش داده شد؛ داخل قلعه قابل مشاهده نیست.");
  } else {
    state.selectedEntity={kind:"terrain",name:`زمین ${point.x}، ${point.y}`};
    renderSelection(); renderStats();
  }
}
function handleCastleClick(point) {
  if (point.x<0||point.y<0) return;
  const occupied=state.castle.buildings.some(b=>b.x===point.x&&b.y===point.y);
  if (occupied) { toast("این خانه قبلاً اشغال شده است."); return; }
  const type=state.selectedBuilding, definition=BUILDINGS[type];
  if (!definition) return;
  const missing=Object.entries(definition.cost).filter(([key,value])=>state.resources[key]<value);
  if (missing.length) { toast("منابع کافی برای ساخت این ساختمان نداری."); return; }
  for (const [key,value] of Object.entries(definition.cost)) state.resources[key]-=value;
  state.castle.buildings.push({id:`${type}-${Date.now()}`,type,x:point.x,y:point.y,level:1});
  toast(`${definition.name} ساخته شد.`);
  state.selectedEntity=null; render(); persist();
}

$("gameCanvas").addEventListener("click",event=>{
  const point=renderer.hitTest(event); if(!point) return;
  if(state.activeMap==="world") handleWorldClick(point); else handleCastleClick(point);
});
$("enterCastleBtn").addEventListener("click",()=>setMap("castle"));
$("backWorldBtn").addEventListener("click",()=>setMap("world"));
$("buildList").addEventListener("click",event=>{
  const button=event.target.closest("[data-building]"); if(!button) return;
  state.selectedBuilding=button.dataset.building;
  document.querySelectorAll(".build-option").forEach(el=>el.classList.toggle("active",el===button));
  const item=BUILDINGS[state.selectedBuilding];
  $("selectedTool").textContent=`ساخت انتخاب‌شده: ${item.name}`;
});
$("resetBtn").addEventListener("click",()=>{
  if(!confirm("تمام پیشرفت آفلاین پاک شود و بازی از ابتدا شروع شود؟")) return;
  clearSavedState(); state=createInitialState(); render(); persist(); toast("بازی از ابتدا آغاز شد.");
});

function simulateProduction() {
  for (const building of state.castle.buildings) {
    const output=BUILDINGS[building.type]?.production || {};
    for (const [resource,amount] of Object.entries(output)) state.resources[resource]+=amount;
  }
  state.seasonDay=Math.min(CONFIG.seasonLength,state.seasonDay+1);
  renderResources(); renderStats(); persist();
}
window.addEventListener("resize",()=>render());
render();
setInterval(simulateProduction,CONFIG.productionIntervalMs);
setInterval(persist,CONFIG.autosaveIntervalMs);
