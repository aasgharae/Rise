const TILE={grass:["#4e7042","#5a7c48"],forest:["#26482f","#2f5a3a"],hill:["#7a765c","#8a8668"],water:["#2a5a6e","#357088"]};
const BSTYLE={keep:{c:"#dccb96",icon:"🏰",s:1.8},farm:{c:"#cfa64e",icon:"🌾",s:1.15},lumber:{c:"#9c6c42",icon:"🪵",s:1.15},quarry:{c:"#9aa5a1",icon:"⛏️",s:1.15},goldmine:{c:"#d4b84a",icon:"🪙",s:1.15},barracks:{c:"#b25a48",icon:"⚔️",s:1.3},wall:{c:"#b0afa0",icon:"🧱",s:.85}};
export class MapRenderer{
constructor(cv){this.cv=cv;this.ctx=cv.getContext("2d");this.t=0;this.layout=null;new ResizeObserver(()=>this.resize()).observe(cv);this.resize();}
resize(){const r=this.cv.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);this.cv.width=Math.max(1,Math.floor(r.width*dpr));this.cv.height=Math.max(1,Math.floor(r.width*(innerWidth<620?1:.62)*dpr));this.ctx.setTransform(dpr,0,0,dpr,0,0);this.w=r.width;this.h=this.cv.height/dpr;}
frame(){this.t+=0.03;}
drawWorld(s){const c=this.ctx;const cols=s.world?100:100;const world=s.worldGrid||s.world||[];const W=world[0]?.length||100,R=world.length||62;const tile=Math.min(this.w/W,this.h/R);const ox=(this.w-W*tile)/2,oy=(this.h-R*tile)/2;c.clearRect(0,0,this.w,this.h);
const g=c.createLinearGradient(0,0,0,this.h);g.addColorStop(0,"#0d1a12");g.addColorStop(1,"#080f0a");c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
this.terrain(world,tile,ox,oy,true);
if(tile>6){c.strokeStyle="rgba(0,0,0,.14)";c.lineWidth=.5;c.beginPath();for(let x=0;x<=W;x++){c.moveTo(ox+x*tile,oy);c.lineTo(ox+x*tile,oy+R*tile);}for(let y=0;y<=R;y++){c.moveTo(ox,oy+y*tile);c.lineTo(ox+W*tile,oy+y*tile);}c.stroke();}
for(const t of s.tribes){c.save();c.strokeStyle=t.color+"99";c.fillStyle=t.color+"14";c.lineWidth=1.6;c.setLineDash([6,5]);c.beginPath();c.ellipse(ox+(t.x+.5)*tile,oy+(t.y+.5)*tile,tile*6.5,tile*4.2,0,0,Math.PI*2);c.fill();c.stroke();c.restore();}
const pulse=3+Math.sin(this.t*2)*1.5;
this.marker(s.player.x,s.player.y,"قلعه شما","#f0d47e",tile,ox,oy,true,pulse);
for(const t of s.tribes){if(t.defeated){this.ruin(t.x,t.y,tile,ox,oy);}else this.marker(t.x,t.y,t.name,t.color,tile,ox,oy,false,pulse);}
this.layout={tile,ox,oy,cols:W,rows:R,mode:"world"};}
drawCastle(s,sel){const c=this.ctx;const ter=s.castle.terrain;const W=ter[0].length,R=ter.length;const tile=Math.min(this.w/W,this.h/R);const ox=(this.w-W*tile)/2,oy=(this.h-R*tile)/2;
const g=c.createLinearGradient(0,0,0,this.h);g.addColorStop(0,"#152219");g.addColorStop(1,"#0a120c");c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
this.terrain(ter,tile,ox,oy,false);
c.save();c.strokeStyle="rgba(226,189,109,.25)";c.lineWidth=1;c.setLineDash([4,4]);c.strokeRect(ox-2,oy-2,W*tile+4,R*tile+4);c.restore();
for(const b of s.castle.buildings)this.building(b,tile,ox,oy,sel&&sel.id===b.id);
this.layout={tile,ox,oy,cols:W,rows:R,mode:"castle"};}
terrain(ter,tile,ox,oy,isWorld){const c=this.ctx;
for(let y=0;y<ter.length;y++)for(let x=0;x<ter[y].length;x++){const k=ter[y][x];const pal=TILE[k]||TILE.grass;const col=((x*7+y*13)%3===0)?pal[0]:pal[1];c.fillStyle=col;c.fillRect(ox+x*tile,oy+y*tile,tile+.6,tile+.6);
if(k==="forest"&&tile>8){c.fillStyle="rgba(0,0,0,.25)";c.beginPath();c.ellipse(ox+(x+.5)*tile,oy+(y+.65)*tile,tile*.3,tile*.15,0,0,7);c.fill();c.fillStyle="#1d3f2a";c.beginPath();c.arc(ox+(x+.5)*tile,oy+(y+.45)*tile,tile*.26,0,7);c.fill();c.fillStyle="#2f6b42";c.beginPath();c.arc(ox+(x+.42)*tile,oy+(y+.38)*tile,tile*.12,0,7);c.fill();}
if(k==="hill"&&tile>8){c.fillStyle="rgba(255,255,255,.12)";c.beginPath();c.moveTo(ox+x*tile,oy+(y+1)*tile);c.lineTo(ox+(x+.5)*tile,oy+y*tile+2);c.lineTo(ox+(x+1)*tile,oy+(y+1)*tile);c.fill();}
if(k==="water"&&tile>6){const ph=Math.sin(this.t*2+x*.5+y*.3)*1.5;c.strokeStyle="rgba(180,230,240,.22)";c.lineWidth=1;c.beginPath();c.moveTo(ox+x*tile+2,oy+(y+.5)*tile+ph);c.lineTo(ox+(x+1)*tile-2,oy+(y+.5)*tile+ph);c.stroke();}}}
marker(x,y,label,color,tile,ox,oy,isP,pulse){const c=this.ctx;const px=ox+(x+.5)*tile,py=oy+(y+.5)*tile;const r=Math.max(6,Math.min(15,tile*.8));c.save();c.shadowColor=color;c.shadowBlur=12;
c.fillStyle="#101a13";c.strokeStyle=color;c.lineWidth=isP?3:2;c.beginPath();c.arc(px,py,r+3+pulse*.3,0,7);c.fill();c.stroke();c.shadowBlur=0;
c.fillStyle=isP?"#ffe9a8":"#fff";c.font=`${Math.max(11,Math.min(19,tile))}px serif`;c.textAlign="center";c.textBaseline="middle";c.fillText("♜",px,py+1);
if(tile>6.5){c.font="bold 10px Tahoma";c.lineWidth=3;c.strokeStyle="rgba(0,0,0,.8)";c.strokeText(label,px,py-r-9);c.fillStyle="#f2ecda";c.fillText(label,px,py-r-9);}c.restore();}
ruin(x,y,tile,ox,oy){const c=this.ctx;const px=ox+(x+.5)*tile,py=oy+(y+.5)*tile;c.save();c.globalAlpha=.7;c.font="18px serif";c.textAlign="center";c.fillText("🏴",px,py);c.font="bold 9px Tahoma";c.fillStyle="#9aa";c.fillText("فتح شده",px,py+14);c.restore();}
building(b,tile,ox,oy,selected){const c=this.ctx;const st=BSTYLE[b.type]||BSTYLE.farm;const px=ox+(b.x+.5)*tile,py=oy+(b.y+.5)*tile;const sz=tile*.82*st.s;c.save();
c.fillStyle="rgba(0,0,0,.35)";c.beginPath();c.ellipse(px,py+sz*.45,sz*.5,sz*.18,0,0,7);c.fill();
const gr=c.createLinearGradient(px-sz/2,py-sz/2,px+sz/2,py+sz/2);gr.addColorStop(0,st.c);gr.addColorStop(1,"#5a5340");c.fillStyle=gr;
const r=3;c.beginPath();c.roundRect(px-sz/2,py-sz/2,sz,sz,r);c.fill();
c.lineWidth=selected?3:1.4;c.strokeStyle=selected?"#ffd97a":"#23231c";c.stroke();
if(selected){c.strokeStyle="rgba(255,217,122,.7)";c.setLineDash([4,3]);c.beginPath();c.arc(px,py,sz*.85+Math.sin(this.t*3)*2,0,7);c.stroke();c.setLineDash([]);}
c.font=`${Math.max(10,tile*.75)}px serif`;c.textAlign="center";c.textBaseline="middle";c.fillText(st.icon,px,py);
c.fillStyle="#101510";c.font=`bold ${Math.max(8,Math.min(11,tile*.4))}px Tahoma`;const label=(b.level||1)+"★";c.fillStyle="rgba(0,0,0,.65)";c.fillRect(px-14,py+sz/2-4,28,12);c.fillStyle="#ffd97a";c.fillText(label,px,py+sz/2+2);
c.restore();}
hit(e){if(!this.layout)return null;const r=this.cv.getBoundingClientRect();const p=this.layout;const x=Math.floor((e.clientX-r.left-p.ox)/p.tile),y=Math.floor((e.clientY-r.top-p.oy)/p.tile);if(x<0||y<0||x>=p.cols||y>=p.rows)return null;return {x,y};}
}