export class Renderer{constructor(cv){this.cv=cv;this.ctx=cv.getContext('2d');this.view='world';this.S=null;this.t=0;
this.worldImg=new Image();this.worldImg.src='assets/world.jpg';this.castleImg=new Image();this.castleImg.src='assets/castle.jpg';
let s=1234;const R=()=> (s=(s*16807)%2147483647)/2147483647;this.terr=[];
for(let i=0;i<56*36;i++){const x=i%56,y=(i/56)|0;let v=0;const d1=Math.hypot(x-10,y-8),d2=Math.hypot(x-44,y-27);
if(d1<5||d2<6)v=3;else if(d1<6.5||d2<7.5)v=4;else if(R()<0.12)v=1;else if(x>48&&y<6&&R()<0.5)v=2;this.terr.push(v);}}
setView(v){this.view=v;}setState(s){this.S=s;}
toTile(px,py){const r=this.cv.getBoundingClientRect();const W=this.view==='world'?56:26,H=this.view==='world'?36:18;return{x:Math.floor((px-r.left)/r.width*W),y:Math.floor((py-r.top)/r.height*H)};}
draw(){const c=this.ctx,W=this.cv.width=this.cv.clientWidth*2,H=this.cv.height=this.cv.clientHeight*2;this.t+=0.05;
if(this.view==='world')this.drawWorld(c,W,H);else this.drawCastle(c,W,H); }
drawWorld(c,W,H){const tw=W/56,th=H/36;
if(this.worldImg.complete&&this.worldImg.naturalWidth){c.drawImage(this.worldImg,0,0,W,H);}
else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2d6a4f');g.addColorStop(1,'#1b4332');c.fillStyle=g;c.fillRect(0,0,W,H);
for(let y=0;y<36;y++)for(let x=0;x<56;x++){const v=this.terr[y*56+x];
if(v===3){c.fillStyle='#2164c4';c.fillRect(x*tw,y*th,tw+1,th+1);c.fillStyle='rgba(255,255,255,.35)';const w=Math.sin(this.t+x*0.5)*2;c.fillRect(x*tw+4,y*th+th/2+w,tw-8,2);}
else if(v===4){c.fillStyle='#e9d8a6';c.fillRect(x*tw,y*th,tw+1,th+1);}
else if(v===1){c.fillStyle='#204d2e';c.beginPath();c.arc(x*tw+tw/2,y*th+th/2,tw*0.6,0,7);c.fill();c.fillStyle='#2d6a4f';c.beginPath();c.arc(x*tw+tw/2-2,y*th+th/2-2,tw*0.35,0,7);c.fill();}
else if(v===2){c.fillStyle='#6c757d';c.beginPath();c.moveTo(x*tw,y*th+th);c.lineTo(x*tw+tw/2,y*th);c.lineTo(x*tw+tw,y*th+th);c.fill();c.fillStyle='#fff';c.fillRect(x*tw+tw/2-2,y*th+2,4,4);}}}
if(!this.S)return;for(const t of this.S.tribes){const px=t.x/56*W,py=t.y/36*H;
c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(px,py+14,22,8,0,0,7);c.fill();
c.fillStyle=t.color;c.beginPath();c.arc(px,py,16,0,7);c.fill();c.fillStyle='#fff';c.font='20px serif';c.textAlign='center';c.fillText('🏰',px,py+7);
c.fillStyle='rgba(0,0,0,.65)';const label=t.name+' ⚔'+t.power;const w=c.measureText(label).width+16;c.fillRect(px-w/2,py+18,w,20);c.fillStyle='#ffd166';c.font='bold 14px sans-serif';c.fillText(label,px,py+32);}}
drawCastle(c,W,H){const tw=W/26,th=H/18;
if(this.castleImg.complete&&this.castleImg.naturalWidth){c.drawImage(this.castleImg,0,0,W,H);}
else{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#3a7d44');g.addColorStop(1,'#2b5d34');c.fillStyle=g;c.fillRect(0,0,W,H);
c.fillStyle='rgba(255,255,255,.04)';for(let i=0;i<250;i++){c.fillRect(Math.random()*W,Math.random()*H,3,3);}
c.fillStyle='#cbb891';c.fillRect(W/2-14,0,28,H);c.fillRect(0,H/2-12,W,24);}
if(!this.S)return;for(const b of this.S.buildings){const px=b.x/26*W,py=b.y/18*H;
c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(px,py+16,20,7,0,0,7);c.fill();
c.fillStyle=b.type==='keep'?'#5a3d2b':b.type==='barracks'?'#7f4f24':b.type==='wall'?'#868e96':'#936639';
c.beginPath();c.roundRect(px-18,py-14,36,32,6);c.fill();c.fillStyle='#ffd166';c.font='20px serif';c.textAlign='center';
const ic={keep:'🏰',farm:'🌾',lumber:'🪵',quarry:'🪨',ironmine:'⛓️',goldmine:'🪙',barracks:'⚔️',wall:'🧱'}[b.type]||'🏠';c.fillText(ic,px,py+8);
c.fillStyle='#fff';c.font='bold 11px sans-serif';c.fillText('Lv'+b.level,px,py+28);}}}