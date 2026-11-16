const TILE = {
grass:["#4f7343","#5b8149"],
forest:["#23452e","#2c5a39"],
hill:["#7d7a60","#8d8a6b"],
water:["#275a70","#36809a"],
plaza:["#8d8a7c","#9d9a8a"],
path:["#a08a58","#b09868"]
};
const BSTYLE = {
keep:{c:"#e3cf9a", icon:"🏰", file:"keep", s:1.9},
farm:{c:"#d0a94f", icon:"🌾", file:"farm", s:1.25},
lumber:{c:"#a06e42", icon:"🪵", file:"lumber", s:1.25},
quarry:{c:"#9aa5a1", icon:"⛏️", file:"quarry", s:1.25},
ironmine:{c:"#7d8fa3", icon:"⛓️", file:"ironmine", s:1.25},
goldmine:{c:"#d9bd4d", icon:"🪙", file:"goldmine", s:1.25},
barracks:{c:"#b85c48", icon:"⚔️", file:"barracks", s:1.35},
wall:{c:"#b3b2a4", icon:"🧱", file:"wall", s:0.95}
};
function rr(c,x,y,w,h,r){
c.beginPath();
c.moveTo(x+r,y);
c.arcTo(x+w,y,x+w,y+h,r);
c.arcTo(x+w,y+h,x,y+h,r);
c.arcTo(x,y+h,x,y,r);
c.arcTo(x,y,x+w,y,r);
c.closePath();
}
export class MapRenderer{
constructor(cv){
this.cv=cv; this.ctx=cv.getContext("2d"); this.t=0; this.layout=null; this.icons={};
for(const key of ["keep","farm","lumber","quarry","ironmine","goldmine","barracks","wall","castle","outpost"]){const im=new Image();im.onload=()=>{};im.src="assets/icons/"+key+".svg";this.icons[key]=im;}
const self=this;
if(window.ResizeObserver){new ResizeObserver(()=>self.resize()).observe(cv);}
window.addEventListener("resize", ()=>self.resize());
this.resize();
}
resize(){
const r=this.cv.getBoundingClientRect();
const w=Math.max(200, r.width || 800);
const ratio = window.innerWidth<620 ? 1 : 0.62;
const h=w*ratio;
const dpr=Math.min(window.devicePixelRatio||1, 2);
this.cv.width=Math.floor(w*dpr);
this.cv.height=Math.floor(h*dpr);
this.ctx.setTransform(dpr,0,0,dpr,0,0);
this.w=w; this.h=h;
}
frame(){this.t+=0.06;}
hash(x,y){return ((x*73+y*149)%7);}
hitTest(ev){return this.toTile(ev);}
toTile(ev){
if(!this.layout) return null;
const r=this.cv.getBoundingClientRect();
const mx=ev.clientX-r.left, my=ev.clientY-r.top;
const L=this.layout;
const tx=Math.floor((mx-L.ox)/L.tile), ty=Math.floor((my-L.oy)/L.tile);
if(tx<0||ty<0||tx>=L.cols||ty>=L.rows) return null;
return {x:tx, y:ty};
}
draw(s, selId){
if(s.activeMap==="castle") this.drawCastle(s, selId);
else this.drawWorld(s);
}
drawWorld(s){
const c=this.ctx;
const world=s.world;
const W=world[0].length, R=world.length;
const tile=Math.min(this.w/W, this.h/R);
const ox=(this.w-W*tile)/2, oy=(this.h-R*tile)/2;
const g=c.createLinearGradient(0,0,0,this.h);
g.addColorStop(0,"#0f1e14"); g.addColorStop(1,"#070d09");
c.fillStyle=g; c.fillRect(0,0,this.w,this.h);
for(let y=0;y<R;y++){
for(let x=0;x<W;x++){
const k=world[y][x];
const pal=TILE[k]||TILE.grass;
c.fillStyle = (this.hash(x,y)%3===0)?pal[0]:pal[1];
c.fillRect(ox+x*tile, oy+y*tile, tile+0.7, tile+0.7);
const px=ox+x*tile, py=oy+y*tile;
if(tile>8){
 c.strokeStyle="rgba(255,255,255,.055)"; c.lineWidth=.65;
 c.strokeRect(px+.6,py+.6,tile-1.2,tile-1.2);
 const seed=(x*17+y*31)%11;
 if(k==="grass" && seed<3){c.fillStyle="rgba(220,214,150,.22)";c.beginPath();c.arc(px+tile*(.22+seed*.18),py+tile*(.3+seed*.11),Math.max(1,tile*.035),0,Math.PI*2);c.fill();}
}
if(k==="forest" && tile>10){
c.fillStyle="rgba(0,0,0,.3)";
c.beginPath(); c.ellipse(px+tile/2, py+tile*0.72, tile*0.3, tile*0.13, 0, 0, 7); c.fill();
c.fillStyle="#1c3d29";
c.beginPath(); c.arc(px+tile/2, py+tile*0.45, tile*0.3, 0, 7); c.fill();
c.fillStyle="#35945a";
c.beginPath(); c.arc(px+tile*0.42, py+tile*0.36, tile*0.12, 0, 7); c.fill();
}else if(k==="hill" && tile>10){
c.fillStyle="rgba(255,255,255,.2)";
c.beginPath(); c.moveTo(px+1, py+tile-1); c.lineTo(px+tile/2, py+2); c.lineTo(px+tile-1, py+tile-1); c.closePath(); c.fill();
c.fillStyle="rgba(0,0,0,.12)";c.beginPath();c.moveTo(px+tile/2,py+2);c.lineTo(px+tile*.62,py+tile-1);c.lineTo(px+tile-1,py+tile-1);c.closePath();c.fill();
}else if(k==="water" && tile>8){
const ph=Math.sin(this.t*1.6 + x*0.5 + y*0.35)*tile*0.1;
c.strokeStyle="rgba(190,235,245,.3)"; c.lineWidth=1;
c.beginPath(); c.moveTo(px+2, py+tile/2+ph); c.quadraticCurveTo(px+tile/2, py+tile/2-ph, px+tile-2, py+tile/2+ph); c.stroke();
}
}
}
for(const t of s.tribes){
c.save();
c.strokeStyle=t.color+"AA"; c.fillStyle=t.color+"1E";
c.lineWidth=2; c.setLineDash([7,5]);
c.beginPath(); c.ellipse(ox+(t.x+0.5)*tile, oy+(t.y+0.5)*tile, tile*4.2, tile*2.9, 0, 0, Math.PI*2);
c.fill(); c.stroke(); c.restore();
}
const pulse=2+Math.sin(this.t*2)*1.2;
this.marker(s.player.x, s.player.y, "قلعه شما", "#f0d47e", tile, ox, oy, s.selectedEntity?.kind==="player", pulse);
for(const t of s.tribes){
if(t.defeated) this.ruin(t.x, t.y, tile, ox, oy);
else this.marker(t.x, t.y, t.name, t.color, tile, ox, oy, (s.selectedEntity?.kind==="tribe" && s.selectedEntity.id===t.id), pulse);
}
this.layout={tile:tile, ox:ox, oy:oy, cols:W, rows:R, mode:"world"};
}
drawCastle(s, selId){
const c=this.ctx;
const ter=s.castle.terrain;
const W=ter[0].length, R=ter.length;
const tile=Math.min(this.w/W, this.h/R);
const ox=(this.w-W*tile)/2, oy=(this.h-R*tile)/2;
const g=c.createLinearGradient(0,0,0,this.h);
g.addColorStop(0,"#16251b"); g.addColorStop(1,"#0a120c");
c.fillStyle=g; c.fillRect(0,0,this.w,this.h);
for(let y=0;y<R;y++){
for(let x=0;x<W;x++){
const k=ter[y][x];
const pal=TILE[k]||TILE.grass;
c.fillStyle=(this.hash(x,y)%2===0)?pal[0]:pal[1];
c.fillRect(ox+x*tile, oy+y*tile, tile+0.7, tile+0.7);
const px=ox+x*tile, py=oy+y*tile;
if(k==="plaza"){
c.strokeStyle="rgba(0,0,0,.18)"; c.lineWidth=1;
c.strokeRect(px+1, py+1, tile-2, tile-2);
}else if(k==="path"){
c.fillStyle="rgba(0,0,0,.1)";
c.fillRect(px, py+tile*0.35, tile, tile*0.3);
}else if(k==="forest"){
c.fillStyle="#1c3d29";
c.beginPath(); c.arc(px+tile/2, py+tile*0.45, tile*0.3, 0, 7); c.fill();
}
}
}
c.save();
c.strokeStyle="rgba(226,189,109,.4)"; c.lineWidth=2; c.setLineDash([6,5]);
rr(c, ox-4, oy-4, W*tile+8, R*tile+8, 10); c.stroke();
c.restore();
const sorted=[...s.castle.buildings].sort((a,b)=>a.y-b.y);
for(const b of sorted) this.building(b, tile, ox, oy, selId===b.id);
this.layout={tile:tile, ox:ox, oy:oy, cols:W, rows:R, mode:"castle"};
}
marker(x,y,label,color,tile,ox,oy,isSel,pulse){
const c=this.ctx;
const px=ox+(x+0.5)*tile, py=oy+(y+0.5)*tile;
const r=Math.max(8, Math.min(17, tile*0.85));
c.save();
if(isSel){
c.strokeStyle="rgba(255,217,122,.9)"; c.lineWidth=2;
c.beginPath(); c.arc(px, py, r+6+pulse, 0, 7); c.stroke();
}
c.shadowColor=color; c.shadowBlur=14;
c.fillStyle="#101a13"; c.strokeStyle=color; c.lineWidth=2;
c.beginPath(); c.arc(px, py, r+2, 0, 7); c.fill(); c.stroke();
c.shadowBlur=0;
const icon=this.icons[label==="قلعه شما"?"castle":"outpost"];
if(icon?.complete && icon.naturalWidth){c.drawImage(icon,px-r*.88,py-r*.88,r*1.76,r*1.76);}else{c.fillStyle="#fff";c.font=Math.max(12,Math.min(20,tile))+"px serif";c.textAlign="center";c.textBaseline="middle";c.fillText("♜",px,py+1);}
c.font="bold 10px Tahoma"; c.lineWidth=3; c.strokeStyle="rgba(0,0,0,.85)";
c.strokeText(label, px, py-r-10);
c.fillStyle="#f2ecda"; c.fillText(label, px, py-r-10);
c.restore();
}
ruin(x,y,tile,ox,oy){
const c=this.ctx;
const px=ox+(x+0.5)*tile, py=oy+(y+0.5)*tile;
c.save(); c.globalAlpha=0.85;
c.font="20px serif"; c.textAlign="center";
c.fillText("🏴", px, py);
c.font="bold 9px Tahoma"; c.fillStyle="#9aa";
c.fillText("فتح شده", px, py+15);
c.restore();
}
building(b,tile,ox,oy,selected){
const c=this.ctx;
const st=BSTYLE[b.type]||BSTYLE.farm;
const px=ox+(b.x+0.5)*tile, py=oy+(b.y+0.5)*tile;
const sz=tile*0.86*st.s;
c.save();
c.fillStyle="rgba(0,0,0,.38)";
c.beginPath(); c.ellipse(px, py+sz*0.44, sz*0.5, sz*0.16, 0, 0, 7); c.fill();
const gr=c.createLinearGradient(px-sz/2, py-sz/2, px+sz/2, py+sz/2);
gr.addColorStop(0, st.c); gr.addColorStop(1, "#4a4436");
c.fillStyle=gr;
rr(c, px-sz/2, py-sz/2, sz, sz, 5); c.fill();
c.lineWidth=selected?3:1.5;
c.strokeStyle=selected?"#ffd97a":"#22231b";
rr(c, px-sz/2, py-sz/2, sz, sz, 5); c.stroke();
if(selected){
c.strokeStyle="rgba(255,217,122,.75)"; c.setLineDash([5,4]);
c.beginPath(); c.arc(px, py, sz*0.8+Math.sin(this.t*3)*2, 0, 7); c.stroke();
c.setLineDash([]);
}
c.textAlign="center"; c.textBaseline="middle";
const icon=this.icons[st.file];
if(icon?.complete && icon.naturalWidth){const pad=sz*.14;c.drawImage(icon,px-sz/2+pad,py-sz/2+pad,sz-pad*2,sz-pad*2);}else{c.font=Math.max(13,tile*.62)+"px serif";c.fillText(st.icon,px,py+1);}
c.fillStyle="rgba(0,0,0,.72)";
const bw=30;
rr(c, px-bw/2, py+sz/2-5, bw, 13, 6); c.fill();
c.fillStyle="#ffd97a";
c.font="bold 10px Tahoma";
c.fillText((b.level||1)+"★", px, py+sz/2+2);
if(b.type==="keep"){
c.fillStyle="#fff";
c.font="bold 9px Tahoma";
c.fillText("قلعه", px, py-sz/2-8);
}
c.restore();
}
}