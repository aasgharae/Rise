const TILE={grass:["#5a7d4a","#4d6f40"],forest:["#234a2e","#1d4028"],hill:["#8a8570","#7a7560"],water:["#2a6a85","#1f5470"],sand:["#d6c08a","#c7b078"],plaza:["#8f8a7c","#9d9888"],path:["#a68c5a","#b8986a"]};
const BSTYLE={keep:{c:"#e8d49a",icon:"🏰",s:1.9},farm:{c:"#d2a94e",icon:"🌾",s:1.25},lumber:{c:"#a57142",icon:"🪵",s:1.25},quarry:{c:"#9faba6",icon:"⛏️",s:1.25},ironmine:{c:"#7f93a8",icon:"⛓️",s:1.25},goldmine:{c:"#dbbd4d",icon:"🪙",s:1.25},barracks:{c:"#bd5a46",icon:"⚔️",s:1.35},wall:{c:"#b6b3a4",icon:"🧱",s:0.95}};
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
export class MapRenderer{
constructor(cv){this.cv=cv;this.ctx=cv.getContext("2d");this.t=0;this.layout=null;const s=this;if(window.ResizeObserver)new ResizeObserver(()=>s.resize()).observe(cv);window.addEventListener("resize",()=>s.resize());this.resize();}
resize(){const r=this.cv.getBoundingClientRect();const w=Math.max(200,r.width||800);const ratio=window.innerWidth<620?1:0.62;const h=w*ratio;const dpr=Math.min(window.devicePixelRatio||1,2);this.cv.width=Math.floor(w*dpr);this.cv.height=Math.floor(h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.w=w;this.h=h;}
frame(){this.t+=0.05;}
hash(x,y){return ((x*73+y*149)%7);}
toTile(ev){if(!this.layout)return null;const r=this.cv.getBoundingClientRect();const mx=ev.clientX-r.left,my=ev.clientY-r.top;const L=this.layout;const tx=Math.floor((mx-L.ox)/L.tile),ty=Math.floor((my-L.oy)/L.tile);if(tx<0||ty<0||tx>=L.cols||ty>=L.rows)return null;return{x:tx,y:ty};}
draw(s,selId){if(s.activeMap==="castle")this.drawCastle(s,selId);else this.drawWorld(s);}
isWater(world,x,y){if(x<0||y<0||y>=world.length||x>=world[0].length)return false;return world[y][x]==="water";}
drawWorld(s){
const c=this.ctx,world=s.world,W=world[0].length,R=world.length;
const tile=Math.min(this.w/W,this.h/R),ox=(this.w-W*tile)/2,oy=(this.h-R*tile)/2;
const g=c.createLinearGradient(0,0,0,this.h);g.addColorStop(0,"#101e15");g.addColorStop(1,"#070d09");c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
for(let y=0;y<R;y++)for(let x=0;x<W;x++){
let k=world[y][x];const px=ox+x*tile,py=oy+y*tile;
if(k==="grass"&&(this.isWater(world,x+1,y)||this.isWater(world,x-1,y)||this.isWater(world,x,y+1)||this.isWater(world,x,y-1)))k="sand";
const pal=TILE[k]||TILE.grass;c.fillStyle=(this.hash(x,y)%3===0)?pal[0]:pal[1];c.fillRect(px,py,tile+0.7,tile+0.7);
if(k==="forest"&&tile>9){c.fillStyle="rgba(0,0,0,.35)";c.beginPath();c.ellipse(px+tile/2,py+tile*0.75,tile*0.32,tile*0.12,0,0,7);c.fill();c.fillStyle="#173526";c.beginPath();c.arc(px+tile*0.35,py+tile*0.45,tile*0.26,0,7);c.fill();c.beginPath();c.arc(px+tile*0.65,py+tile*0.5,tile*0.22,0,7);c.fill();c.fillStyle="#3fa065";c.beginPath();c.arc(px+tile*0.3,py+tile*0.36,tile*0.1,0,7);c.fill();c.beginPath();c.arc(px+tile*0.6,py+tile*0.42,tile*0.08,0,7);c.fill();}
else if(k==="hill"&&tile>9){c.fillStyle="rgba(255,255,255,.16)";c.beginPath();c.moveTo(px+1,py+tile-1);c.lineTo(px+tile/2,py+2);c.lineTo(px+tile-1,py+tile-1);c.closePath();c.fill();c.fillStyle="#5d5a4d";c.beginPath();c.moveTo(px+tile*0.32,py+tile*0.55);c.lineTo(px+tile/2,py+2);c.lineTo(px+tile*0.68,py+tile*0.55);c.closePath();c.fill();c.fillStyle="#fff";c.beginPath();c.moveTo(px+tile*0.42,py+tile*0.32);c.lineTo(px+tile/2,py+2);c.lineTo(px+tile*0.58,py+tile*0.32);c.closePath();c.fill();}
else if(k==="water"&&tile>7){const ph=Math.sin(this.t*1.8+x*0.5+y*0.35)*tile*0.12;c.strokeStyle="rgba(190,235,245,.35)";c.lineWidth=1;c.beginPath();c.moveTo(px+2,py+tile/2+ph);c.quadraticCurveTo(px+tile/2,py+tile/2-ph,px+tile-2,py+tile/2+ph);c.stroke();c.fillStyle="rgba(255,255,255,.25)";c.fillRect(px+tile*0.7,py+tile*0.2+ph*0.3,1.6,1.6);}
else if(k==="grass"&&tile>13&&this.hash(x,y)===2){c.fillStyle="rgba(255,255,255,.12)";c.fillRect(px+tile*0.3,py+tile*0.3,2,2);c.fillStyle="rgba(255,180,220,.5)";c.beginPath();c.arc(px+tile*0.7,py+tile*0.6,1.4,0,7);c.fill();}
else if(k==="sand"){c.fillStyle="rgba(255,255,255,.15)";for(let i=0;i<3;i++)c.fillRect(px+((x*7+i*5)%Math.max(4,tile-3)),py+((y*5+i*7)%Math.max(4,tile-3)),1.5,1.5);}
}
if(tile>8){c.strokeStyle="rgba(0,0,0,.14)";c.lineWidth=0.6;c.beginPath();for(let x=0;x<=W;x++){c.moveTo(ox+x*tile,oy);c.lineTo(ox+x*tile,oy+R*tile);}for(let y=0;y<=R;y++){c.moveTo(ox,oy+y*tile);c.lineTo(ox+W*tile,oy+y*tile);}c.stroke();}
for(const t of s.tribes){if(t.defeated)continue;c.save();c.strokeStyle=t.color+"CC";c.fillStyle=t.color+"22";c.lineWidth=2;c.setLineDash([8,6]);c.lineDashOffset=-this.t*18;c.beginPath();c.ellipse(ox+(t.x+0.5)*tile,oy+(t.y+0.5)*tile,tile*4.4,tile*3,0,0,Math.PI*2);c.fill();c.stroke();c.restore();}
const pulse=2+Math.sin(this.t*2.2)*1.4;
this.castleMark(s.player.x,s.player.y,"قلعه شما","#f0d47e",tile,ox,oy,true,pulse);
for(const t of s.tribes){if(t.defeated)this.ruin(t.x,t.y,tile,ox,oy);else this.castleMark(t.x,t.y,t.name,t.color,tile,ox,oy,(s.selectedEntity===t.id),pulse,t.power);}
this.layout={tile:tile,ox:ox,oy:oy,cols:W,rows:R,mode:"world"};
}
castleMark(x,y,label,color,tile,ox,oy,sel,pulse,power){
const c=this.ctx,px=ox+(x+0.5)*tile,py=oy+(y+0.5)*tile;const r=Math.max(10,Math.min(19,tile*0.95));c.save();
if(sel){c.strokeStyle="rgba(255,217,122,.9)";c.lineWidth=2.5;c.beginPath();c.arc(px,py,r+7+pulse,0,7);c.stroke();}
c.shadowColor=color;c.shadowBlur=16;c.fillStyle="#111814";c.strokeStyle=color;c.lineWidth=sel?3:2;c.beginPath();c.arc(px,py,r+2,0,7);c.fill();c.stroke();c.shadowBlur=0;
c.fillStyle="#fff";c.font=Math.max(13,Math.min(21,tile))+"px serif";c.textAlign="center";c.textBaseline="middle";c.fillText("🏰",px,py+1);
c.font="bold 10px Tahoma";c.lineWidth=4;c.strokeStyle="rgba(0,0,0,.85)";c.strokeText(label,px,py-r-11);c.fillStyle="#f5eed6";c.fillText(label,px,py-r-11);
if(power){c.font="bold 9px Tahoma";const txt="⚔"+power;c.fillStyle="rgba(0,0,0,.75)";const w=c.measureText(txt).width+10;rr(c,px-w/2,py+r+2,w,14,7);c.fill();c.fillStyle="#ffd97a";c.fillText(txt,px,py+r+9);}
c.restore();
}
ruin(x,y,tile,ox,oy){const c=this.ctx,px=ox+(x+0.5)*tile,py=oy+(y+0.5)*tile;c.save();c.globalAlpha=0.9;c.font="20px serif";c.textAlign="center";c.fillText("🏴",px,py);c.font="bold 9px Tahoma";c.fillStyle="#9aa";c.fillText("فتح شد",px,py+15);c.restore();}
drawCastle(s,selId){
const c=this.ctx,ter=s.castle.terrain,W=ter[0].length,R=ter.length;
const tile=Math.min(this.w/W,this.h/R),ox=(this.w-W*tile)/2,oy=(this.h-R*tile)/2;
const g=c.createLinearGradient(0,0,0,this.h);g.addColorStop(0,"#18271c");g.addColorStop(1,"#0a120c");c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
for(let y=0;y<R;y++)for(let x=0;x<W;x++){const k=ter[y][x],pal=TILE[k]||TILE.grass;const px=ox+x*tile,py=oy+y*tile;c.fillStyle=(this.hash(x,y)%2===0)?pal[0]:pal[1];c.fillRect(px,py,tile+0.7,tile+0.7);
if(k==="plaza"){c.strokeStyle="rgba(0,0,0,.2)";c.lineWidth=1;c.strokeRect(px+1,py+1,tile-2,tile-2);c.fillStyle="rgba(255,255,255,.09)";c.fillRect(px+2,py+2,tile-4,2);}
else if(k==="path"){c.fillStyle="rgba(0,0,0,.14)";c.fillRect(px,py+tile*0.35,tile,tile*0.3);c.fillStyle="rgba(255,255,255,.12)";c.fillRect(px+tile*0.2,py+tile*0.42,2,2);c.fillRect(px+tile*0.6,py+tile*0.5,2,2);}
else if(k==="forest"){c.fillStyle="#173526";c.beginPath();c.arc(px+tile/2,py+tile*0.45,tile*0.3,0,7);c.fill();c.fillStyle="#3fa065";c.beginPath();c.arc(px+tile*0.42,py+tile*0.36,tile*0.11,0,7);c.fill();}
else if(k==="water"){const ph=Math.sin(this.t*2+x)*2;c.fillStyle="#2e6f8c";c.fillRect(px,py,tile+0.7,tile+0.7);c.strokeStyle="rgba(220,245,255,.4)";c.beginPath();c.moveTo(px+2,py+tile/2+ph);c.lineTo(px+tile-2,py+tile/2+ph);c.stroke();}
else if(k==="grass"&&this.hash(x,y)===1&&tile>18){c.fillStyle="rgba(255,180,220,.45)";c.beginPath();c.arc(px+tile*0.7,py+tile*0.3,1.6,0,7);c.fill();}}
c.save();c.strokeStyle="rgba(226,189,109,.45)";c.lineWidth=2;c.setLineDash([7,5]);rr(c,ox-4,oy-4,W*tile+8,R*tile+8,10);c.stroke();c.restore();
const sorted=[...s.castle.buildings].sort((a,b)=>a.y-b.y);for(const b of sorted)this.building(b,tile,ox,oy,selId===b.id);
this.layout={tile:tile,ox:ox,oy:oy,cols:W,rows:R,mode:"castle"};
}
building(b,tile,ox,oy,selected){
const c=this.ctx,st=BSTYLE[b.type]||BSTYLE.farm;const px=ox+(b.x+0.5)*tile,py=oy+(b.y+0.5)*tile;const sz=tile*0.86*st.s;c.save();
c.fillStyle="rgba(0,0,0,.4)";c.beginPath();c.ellipse(px,py+sz*0.44,sz*0.5,sz*0.16,0,0,7);c.fill();
const gr=c.createLinearGradient(px-sz/2,py-sz/2,px+sz/2,py+sz/2);gr.addColorStop(0,st.c);gr.addColorStop(1,"#4a4436");c.fillStyle=gr;rr(c,px-sz/2,py-sz/2,sz,sz,6);c.fill();
c.lineWidth=selected?3:1.5;c.strokeStyle=selected?"#ffd97a":"#22231b";rr(c,px-sz/2,py-sz/2,sz,sz,6);c.stroke();
if(selected){c.strokeStyle="rgba(255,217,122,.8)";c.setLineDash([5,4]);c.beginPath();c.arc(px,py,sz*0.8+Math.sin(this.t*3)*2,0,7);c.stroke();c.setLineDash([]);}
c.font=Math.max(14,tile*0.62)+"px serif";c.textAlign="center";c.textBaseline="middle";c.fillText(st.icon,px,py+1);
c.fillStyle="rgba(0,0,0,.75)";rr(c,px-16,py+sz/2-5,32,13,6);c.fill();c.fillStyle="#ffd97a";c.font="bold 10px Tahoma";c.fillText((b.level||1)+"★",px,py+sz/2+2);
if(b.type==="keep"){c.fillStyle="#fff";c.font="bold 9px Tahoma";c.fillText("قلعه",px,py-sz/2-8);}
c.restore();
}
}