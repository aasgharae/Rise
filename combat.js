import{TROOPS}from'./config.js';
export function armyPower(tr){let p=0;for(const k in tr)p+=(TROOPS[k]?.power||0)*(tr[k]||0);return p;}
export function resolveAttack(my,tribe,wallLvl){let atk=armyPower(my);let def=tribe.power+wallLvl*15;
if((my.catapult||0)>0)def*=0.65;else if((my.ballista||0)>0)def*=0.8;
if((my.knight||0)>0)atk*=1.12;const win=atk>def*1.02;
const loot=win?(tribe.loot||{gold:200}):{};return{win,atk:Math.floor(atk),def:Math.floor(def),loot};}