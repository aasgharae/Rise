const TILE_COLORS = {
  grass: ["#526f43", "#5d7949"], forest: ["#294c35", "#31583b"],
  hill: ["#77745a", "#827d61"], water: ["#315d70", "#37677a"]
};

const BUILDING_STYLE = {
  keep: { color:"#d7c69a", icon:"🏰", size:1.7 },
  farm: { color:"#c8a64c", icon:"🌾", size:1.1 },
  lumber: { color:"#9a6c45", icon:"🪵", size:1.1 },
  quarry: { color:"#9ca4a0", icon:"⛏️", size:1.1 },
  barracks: { color:"#a65c4d", icon:"⚔️", size:1.2 },
  wall: { color:"#aaa99a", icon:"▰", size:.8 }
};

export class MapRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.lastLayout = null;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.width * (window.innerWidth < 620 ? 1 : .625) * dpr));
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.cssWidth = rect.width;
    this.cssHeight = this.canvas.height / dpr;
  }

  drawWorld(state) {
    const { ctx } = this;
    const cols = state.world[0].length, rows = state.world.length;
    const tile = Math.min(this.cssWidth / cols, this.cssHeight / rows);
    const offsetX = (this.cssWidth - cols * tile) / 2;
    const offsetY = (this.cssHeight - rows * tile) / 2;
    ctx.clearRect(0,0,this.cssWidth,this.cssHeight);
    this.drawTerrain(state.world, tile, offsetX, offsetY);
    this.drawWorldGrid(cols, rows, tile, offsetX, offsetY);
    // Territory rings are deliberately subtle; they do not reveal castle interiors.
    for (const tribe of state.tribes) this.drawTerritory(tribe, tile, offsetX, offsetY);
    this.drawCastleMarker(state.player.x, state.player.y, "قلعه شما", "#e4c879", tile, offsetX, offsetY, true);
    for (const tribe of state.tribes) this.drawCastleMarker(tribe.x, tribe.y, tribe.name, tribe.color, tile, offsetX, offsetY, false);
    this.lastLayout = { tile, offsetX, offsetY, cols, rows, mode:"world" };
  }

  drawCastle(state) {
    const { ctx } = this;
    const terrain = state.castle.terrain;
    const cols = terrain[0].length, rows = terrain.length;
    const tile = Math.min(this.cssWidth / cols, this.cssHeight / rows);
    const offsetX = (this.cssWidth - cols * tile) / 2;
    const offsetY = (this.cssHeight - rows * tile) / 2;
    ctx.clearRect(0,0,this.cssWidth,this.cssHeight);
    this.drawTerrain(terrain, tile, offsetX, offsetY);
    this.drawWorldGrid(cols, rows, tile, offsetX, offsetY);
    for (const building of state.castle.buildings) this.drawBuilding(building, tile, offsetX, offsetY);
    this.lastLayout = { tile, offsetX, offsetY, cols, rows, mode:"castle" };
  }

  drawTerrain(terrain, tile, ox, oy) {
    const {ctx} = this;
    for (let y=0; y<terrain.length; y++) for (let x=0; x<terrain[y].length; x++) {
      const palette = TILE_COLORS[terrain[y][x]] || TILE_COLORS.grass;
      const color = ((x*7+y*11)%3===0) ? palette[0] : palette[1];
      ctx.fillStyle = color;
      ctx.fillRect(ox+x*tile, oy+y*tile, tile+.5, tile+.5);
      if (terrain[y][x] === "forest" && tile > 9) {
        ctx.fillStyle = "#1c3d2b"; ctx.beginPath();
        ctx.arc(ox+(x+.5)*tile, oy+(y+.52)*tile, tile*.27, 0, Math.PI*2); ctx.fill();
      }
      if (terrain[y][x] === "water" && tile > 9) {
        ctx.strokeStyle = "rgba(170,220,230,.16)"; ctx.beginPath();
        ctx.moveTo(ox+x*tile,oy+(y+.5)*tile); ctx.lineTo(ox+(x+1)*tile,oy+(y+.5)*tile); ctx.stroke();
      }
    }
  }

  drawWorldGrid(cols, rows, tile, ox, oy) {
    if (tile < 7) return;
    const {ctx} = this; ctx.strokeStyle = "rgba(10,20,12,.12)"; ctx.lineWidth = .5;
    ctx.beginPath();
    for (let x=0; x<=cols; x++) { ctx.moveTo(ox+x*tile,oy); ctx.lineTo(ox+x*tile,oy+rows*tile); }
    for (let y=0; y<=rows; y++) { ctx.moveTo(ox,oy+y*tile); ctx.lineTo(ox+cols*tile,oy+y*tile); }
    ctx.stroke();
  }

  drawTerritory(tribe, tile, ox, oy) {
    const {ctx} = this; ctx.save();
    ctx.strokeStyle = tribe.color + "88"; ctx.fillStyle = tribe.color + "12";
    ctx.lineWidth = 1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.ellipse(ox+(tribe.x+.5)*tile,oy+(tribe.y+.5)*tile,tile*6,tile*4,0,0,Math.PI*2);
    ctx.fill(); ctx.stroke(); ctx.restore();
  }

  drawCastleMarker(x,y,label,color,tile,ox,oy,isPlayer) {
    const {ctx} = this; const px=ox+(x+.5)*tile, py=oy+(y+.5)*tile;
    const radius = Math.max(5, Math.min(14,tile*.75));
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 8;
    ctx.fillStyle = "#172019"; ctx.strokeStyle = color; ctx.lineWidth = isPlayer ? 3 : 2;
    ctx.beginPath(); ctx.arc(px,py,radius+3,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.font = `${Math.max(10,Math.min(19,tile*1.05))}px serif`;
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle="#fff";
    ctx.fillText("♜",px,py+1);
    if (tile > 7) {
      ctx.font = "bold 10px Tahoma"; ctx.lineWidth=3; ctx.strokeStyle="#142018";
      ctx.strokeText(label,px,py-radius-7); ctx.fillStyle="#f0eee2"; ctx.fillText(label,px,py-radius-7);
    }
    ctx.restore();
  }

  drawBuilding(building,tile,ox,oy) {
    const {ctx}=this, style=BUILDING_STYLE[building.type] || BUILDING_STYLE.farm;
    const px=ox+(building.x+.5)*tile, py=oy+(building.y+.5)*tile;
    const size=tile*.76*style.size;
    ctx.save(); ctx.fillStyle="rgba(0,0,0,.25)"; ctx.fillRect(px-size/2+2,py-size/2+3,size,size);
    ctx.fillStyle=style.color; ctx.fillRect(px-size/2,py-size/2,size,size);
    ctx.strokeStyle="#2b2b20"; ctx.lineWidth=1.5; ctx.strokeRect(px-size/2,py-size/2,size,size);
    ctx.font=`${Math.max(10,tile*.78)}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(style.icon,px,py+1); ctx.restore();
  }

  hitTest(event) {
    if (!this.lastLayout) return null;
    const rect=this.canvas.getBoundingClientRect(), p=this.lastLayout;
    const x=Math.floor((event.clientX-rect.left-p.offsetX)/p.tile);
    const y=Math.floor((event.clientY-rect.top-p.offsetY)/p.tile);
    if (x<0||y<0||x>=p.cols||y>=p.rows) return null;
    return {x,y};
  }
}
