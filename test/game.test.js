import test from 'node:test';
import assert from 'node:assert/strict';
import {CONFIG, START_RESOURCES} from '../config.js';
import {createInitialState, storageCap, troopCap, troopCount, availableTroopCapacity, advanceStateTime, setSaveScope, loadState, saveState} from '../state.js';
import {armyPower, wallDefense, resolveBattle} from '../combat.js';

const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
test('starting stock is 1,000x old prototype and fits the warehouse',()=>{
 assert.deepEqual(START_RESOURCES,{food:100000000,wood:80000000,stone:50000000,iron:30000000,gold:20000000});
 const s=createInitialState(); assert.ok(storageCap(s)>START_RESOURCES.food);
});
test('queued troops reserve capacity before training',()=>{
 const s=createInitialState(); const initial=availableTroopCapacity(s);
 s.queue.push({id:'swordsman',count:initial,left:40});
 assert.equal(availableTroopCapacity(s),0);
});
test('active and away time use the same net economy and training queue',()=>{
 const s=createInitialState(); s.resources.food=1000; s.resources.wood=1000;
 const beforeWood=s.resources.wood; s.queue=[{id:'swordsman',count:1,left:20}];
 const out=advanceStateTime(s,25);
 assert.equal(out.completed.length,1); assert.equal(s.troops.swordsman,7);
 assert.ok(s.resources.wood>beforeWood); assert.ok(Number.isFinite(s.resources.food));
});
test('wall contributes to defense, never to attack strength',()=>{
 const s=createInitialState(); const tr={power:10,def:0,defeated:false};
 const army={swordsman:2}; const old=Math.random; Math.random=()=>0.5;
 const battle=resolveBattle(s,army,tr); Math.random=old;
 assert.equal(battle.atk,Math.round(armyPower(army)*1.025));
 assert.ok(wallDefense(s)>0);
});
test('scoped save loads independently',()=>{
 setSaveScope('alis'); const a=createInitialState(); a.resources.gold=123456; assert.equal(saveState(a),true);
 assert.equal(loadState().resources.gold,123456);
 setSaveScope('other'); assert.equal(loadState(),null);
});

test('a decisive win causes fewer casualties than a narrow win',()=>{
 const s=createInitialState(); const army={swordsman:100}; const old=Math.random; Math.random=()=>0;
 const easy=resolveBattle(s,army,{power:100,def:0,defeated:false});
 const hard=resolveBattle(s,army,{power:800,def:0,defeated:false}); Math.random=old;
 assert.equal(easy.win,true); assert.equal(hard.win,true); assert.ok(easy.lost<hard.lost);
});
test('legacy save migrates once and cannot leak into a second account slot',()=>{
 const old=createInitialState(); old.version=4; old.lastTick=123456789;
 memory.set('village_rise_v4',JSON.stringify(old));
 setSaveScope('legacy-owner-test'); const migrated=loadState();
 assert.equal(migrated.version,5); assert.equal(migrated.lastTick,123456789); assert.equal(memory.has('village_rise_v4'),false);
 setSaveScope('different-owner-test'); assert.equal(loadState(),null);
});
