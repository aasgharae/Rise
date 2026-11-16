import{CONFIG,TROOPS,BUILD_DEFS,BATCH_OPTIONS,EXTRA_TRIBES,buildingProd,upgradeCost}from'./config.js';
import{SAVE_KEY,freshState,load,save,storageCap,troopCap}from'./state.js';
import{armyPower,resolveAttack}from'./combat.js';import{Renderer}from'./renderer.js';
let S=load();const $=id=>document.getElementById(id);
const cv=$('cv'),R=new Renderer(cv);R.setState(S);
const toast=m=>{const t=$('toast');if(!t)return;t.textContent=m;clearTimeout(t._h);t._h=setTimeout(()=>t.textContent='',2200);};
function updTop(){const cap=storageCap(S);for(const k in S.resources)S.resources[k]=Math.min(S.resources[k],cap);
if($('res-food')){$('res-food').textContent='🌾 '+Math.floor(S.resources.food);$('res-wood').textContent='🪵 '+Math.floor(S.resources.wood);$('res-stone').textContent='🪨 '+Math.floor(S.resources.stone);$('res-iron').textContent='⛓️ '+Math.floor(S.resources.iron);$('res-gold').textContent='🪙 '+Math.floor(S.resources.gold);$('dayLabel').textContent='روز '+S.day+'/45 • ⚔'+armyPower(S.troops)+' • 👥'+Object.values(S.troops).reduce((a,b)=>a+b,0)+'/'+troopCap(S);}}
function canPay(c){for(const k in c)if((S.resources[k]||0)<c[k])return false;return true;}
function pay(c){for(const k in c)S.resources[k]-=c[k];}
window.pay2=(a)=>toast(a);
window.train=(barId,tid,count)=>{const T=TROOPS[tid];const cost={};for(const k in T.cost)cost[k]=T.cost[k]*count;
if(!canPay(cost))return toast('منابع کم است');if(Object.values(S.troops).reduce((a,b)=>a+b,0)+count>troopCap(S))return toast('سقف جمعیت');
const q=S.training[barId];if(q.length>=5)return toast('صف این سربازخانه پر است');
pay(cost);const lvl=(S.buildings.find(b=>b.id===barId)?.level||1);const total=T.time*Math.pow(count,0.75)/(1+lvl*0.3);
q.push({tid,count,left:total,total});save(S);renderSheet();toast(barId+': '+count+'× '+T.name);};
window.cancelQ=(barId,i)=>{const q=S.training[barId][i];if(!q)return;const T=TROOPS[q.tid];for(const k in T.cost)S.resources[k]+=Math.floor(T.cost[k]*q.count*0.7);S.training[barId].splice(i,1);save(S);renderSheet();};
window.upg=(id)=>{const b=S.buildings.find(x=>x.id===id);const c=upgradeCost(b.type,b.level);if(!canPay(c))return toast('منابع کم است');if(b.level>=BUILD_DEFS[b.type].max)return toast('ماکس');pay(c);b.level++;save(S);renderSheet();};
window.atk=(tid)=>{const tr=S.tribes.find(t=>t.id===tid);const wall=S.buildings.filter(b=>b.type==='wall').reduce((a,b)=>a+b.level,0);
const r=resolveAttack(S.troops,tr,wall);if(r.win){for(const k in r.loot)S.resources[k]=(S.resources[k]||0)+r.loot[k];
S.tribes=S.tribes.filter(t=>t.id!==tid);S.conquered++;
const pool=EXTRA_TRIBES.filter(e=>!S.tribes.find(t=>t.id===e.id));if(pool.length){const n=pool[0];n.power=Math.floor(tr.power*1.35+100);n.x=5+Math.random()*46;n.y=5+Math.random()*26;S.tribes.push(n);}
toast('پیروزی! +'+JSON.stringify(r.loot));}else toast('شکست… قدرت ما '+r.atk+' vs '+r.def);
save(S);R.setState(S);renderSheet();};
let cur='train';
function renderSheet(){const B=$('sheetBody');if(!B||$('sheet').hidden)return;if(cur==='train'){
B.innerHTML=Object.keys(S.training).map(barId=>{const lvl=S.buildings.find(b=>b.id===barId)?.level||1;
const qs=S.training[barId].map((q,i)=>'<div class="q">⏳ '+TROOPS[q.tid].name+' ×'+q.count+' - '+Math.ceil(q.left)+'ث <button onclick="cancelQ(\''+barId+'\','+i+')">لغو</button></div>').join('')||'<div class="q">صف خالی — موازی فعال</div>';
const btns=Object.keys(TROOPS).map(tid=>'<div class="card"><b>'+TROOPS[tid].icon+' '+TROOPS[tid].name+'</b> ⚔'+TROOPS[tid].power+'<div class="row">'+BATCH_OPTIONS.map(n=>'<button class="btn" onclick="train(\''+barId+'\',\''+tid+'\','+n+')">'+n+'تایی</button>').join('')+'</div></div>').join('');
return '<div class="card"><b>'+barId+' Lv'+lvl+'</b>'+qs+'</div>'+btns;}).join('');}
if(cur==='build'){B.innerHTML=S.buildings.map(b=>'<div class="card">🏠 '+BUILD_DEFS[b.type].name+' '+b.id+' Lv'+b.level+' <button class="btn" onclick="upg(\''+b.id+'\')">ارتقا</button><div class="q">'+JSON.stringify(upgradeCost(b.type,b.level))+'</div></div>').join('');}
if(cur==='attack'){B.innerHTML=S.tribes.map(t=>'<div class="card">🏰 '+t.name+' ⚔'+t.power+' <button class="btn" onclick="atk(\''+t.id+'\')">حمله</button></div>').join('')||'همه فتح شدند!';}
if(cur==='clan'){B.innerHTML='<div class="card">👑 فتوحات: '+S.conquered+'<br>⚔ قدرت ارتش: '+armyPower(S.troops)+'<br>👥 '+JSON.stringify(S.troops)+'</div>';}}
function openSheet(k){cur=k;$('sheet').hidden=false;$('sheetTitle').textContent={build:'ساخت و ارتقا',train:'سرباز — ۳ صف موازی',attack:'حمله',clan:'قبیله'}[k];renderSheet();}
document.querySelectorAll('#dock button').forEach(b=>b.onclick=()=>openSheet(b.dataset.act));
$('sheetClose').onclick=()=>$('sheet').hidden=true;
$('tabWorld').onclick=()=>{R.setView('world');$('tabWorld').classList.add('on');$('tabCastle').classList.remove('on');};
$('tabCastle').onclick=()=>{R.setView('castle');$('tabCastle').classList.add('on');$('tabWorld').classList.remove('on');};
$('btnContinue').onclick=()=>{$('splash').style.display='none';$('game').hidden=false;updTop();};
$('btnNew').onclick=()=>{localStorage.removeItem(SAVE_KEY);S=freshState();save(S);R.setState(S);$('splash').style.display='none';$('game').hidden=false;updTop();toast('بازی جدید با منابع ۱۰۰۰×');};
$('btnHelp').onclick=()=>{const h=$('helpBox');h.hidden=!h.hidden;};
setInterval(()=>{for(const b of S.buildings){const p=buildingProd(b.type,b.level);for(const k in p)S.resources[k]+=p[k]/60*20;}
for(const barId in S.training){const q=S.training[barId][0];if(q){q.left-=1;if(q.left<=0){S.troops[q.tid]+=q.count;S.training[barId].shift();toast('✅ '+q.count+'× '+TROOPS[q.tid].name);}}}
S.day=Math.min(45,1+Math.floor(Date.now()/1000/60));save(S);updTop();if(cur&&!$('sheet').hidden)renderSheet();},1000);
(function loop(){R.draw();requestAnimationFrame(loop);})();
updTop();