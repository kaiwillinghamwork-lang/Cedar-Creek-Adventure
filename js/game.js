/* ============================================================ */
/* game.js — a little top-down overworld for the home page.     */
/*   Walk around with arrow keys / WASD / the on-screen pad;    */
/*   step up to a building and press Enter / A to open its info  */
/*   (reuses openModal() + BUILDINGS from app.js / data.js).     */
/* ============================================================ */
(function(){
  const canvas = document.getElementById('gameCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const TILE = 16;
  const VIEW_W = canvas.width, VIEW_H = canvas.height;      // 352 x 224
  const MAP_W = 50, MAP_H = 29;
  const WORLD_W = MAP_W * TILE, WORLD_H = MAP_H * TILE;

  /* ---------- world (laid out to match the property site map) ---------- */
  const terrain = [], solid = [];   // terrain: 'g' grass, 'w' water, 'p' path, 'b' bridge
  for(let y=0;y<MAP_H;y++){ terrain[y]=[]; solid[y]=[]; for(let x=0;x<MAP_W;x++){ terrain[y][x]='g'; solid[y][x]=false; } }
  const inB=(i,j)=>i>=0&&j>=0&&i<MAP_W&&j<MAP_H;

  // rasterize a polyline across tiles (brush = extra radius in tiles)
  function tline(pts, brush, fn){
    for(let k=0;k<pts.length-1;k++){
      const [x0,y0]=pts[k], [x1,y1]=pts[k+1];
      const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2 || 1;
      for(let s=0;s<=steps;s++){
        const cx=Math.round(x0+(x1-x0)*s/steps), cy=Math.round(y0+(y1-y0)*s/steps);
        for(let bj=-brush;bj<=brush;bj++) for(let bi=-brush;bi<=brush;bi++) if(inB(cx+bi,cy+bj)) fn(cx+bi,cy+bj);
      }
    }
  }

  // East Fork Cedar Creek — a clean horizontal run, then a diagonal down-right
  tline([[0,7],[28,7],[49,22]], 0, (i,j)=>{ terrain[j][i]='w'; solid[j][i]=true; });
  // gravel roads: Cedar Creek Rd across the top, the center driveway, the west spur
  const pave=(i,j)=>{ if(terrain[j][i]!=='w'){ terrain[j][i]='p'; solid[j][i]=false; } };
  tline([[0,2],[32,2],[49,17]], 0, pave);            // main road
  tline([[18,2],[18,21],[28,24]], 0, pave);          // center driveway → owner's lodge
  tline([[2,13],[18,13]], 0, pave);                  // spur to the west buildings
  // bridge where the driveway crosses the creek
  [[17,7],[18,7],[19,7]].forEach(([i,j])=>{ terrain[j][i]='b'; solid[j][i]=false; });

  // buildings — key matches BUILDINGS in data.js (positions from the site map)
  const buildings = [
    { key:'outdoor',    name:'Creek-side Fire Pit', tx:2,  ty:10, tw:2, th:2, type:'fire' },
    { key:'bathhouse',  name:'Bathhouse',          tx:8,  ty:10, tw:3, th:2, roof:'#6d8aa6', wall:'#557390' },
    { key:'rv',         name:'RV & Tent Sites',    tx:1,  ty:14, tw:6, th:3, type:'camp' },
    { key:'cabins',     name:'The Cabins',         tx:8,  ty:14, tw:5, th:3, roof:'#7a8a3f', wall:'#5f6b33' },
    { key:'central',    name:'Central Lodge',      tx:20, ty:9,  tw:5, th:3, roof:'#8a5630', wall:'#6f4424' },
    { key:'processing', name:'Game Processing',    tx:20, ty:13, tw:5, th:2, roof:'#566069', wall:'#444e56' },
    { key:'storage',    name:'Storage Lot',        tx:21, ty:17, tw:4, th:2, roof:'#b09a6e', wall:'#8a784f' },
    { key:'owners',     name:"Owner's Lodge",      tx:28, ty:22, tw:5, th:3, roof:'#8a5630', wall:'#6f4424' },
  ];
  buildings.forEach(b => {
    for(let j=b.ty;j<b.ty+b.th;j++) for(let i=b.tx;i<b.tx+b.tw;i++) if(inB(i,j)){ solid[j][i]=true; if(terrain[j][i]==='p') terrain[j][i]='g'; }
    b.doorTx = b.tx + Math.floor(b.tw/2); b.doorTy = b.ty + b.th;     // door = tile just below
    if(inB(b.doorTx,b.doorTy)){ terrain[b.doorTy][b.doorTx]='p'; solid[b.doorTy][b.doorTx]=false; }
    b.cx = (b.tx + b.tw/2)*TILE; b.cy = (b.ty + b.th)*TILE + 6;
  });

  // simple, clear walkways: a straight gravel path from every door to the driveway
  buildings.forEach(b => {
    if(b.key==='owners') tline([[b.doorTx,b.doorTy],[28,b.doorTy],[28,24]], 0, pave);
    else tline([[b.doorTx,b.doorTy],[18,b.doorTy]], 0, pave);
  });

  // trees: standing timber up top & to the NE, leafy borders, light scatter
  const trees = [];
  function addTree(i,j){ if(inB(i,j) && terrain[j][i]==='g' && !solid[j][i]){ solid[j][i]=true; trees.push({x:i*TILE+TILE/2, y:j*TILE+TILE}); } }
  function nearDoor(i,j){ return buildings.some(b=>Math.abs(i-b.doorTx)<=1 && Math.abs(j-b.doorTy)<=1); }
  for(let j=0;j<MAP_H;j++) for(let i=0;i<MAP_W;i++){
    if(nearDoor(i,j)) continue;
    let timber = j<=1;                                          // tree line along the top
    if(!timber && j>=2 && j<=17){ const rx=32+(j-2)/15*17; if(i>rx+1) timber=true; }   // timber NE of the road
    if(timber) addTree(i,j);
  }
  for(let j=2;j<MAP_H;j++){ if(Math.random()<0.5) addTree(0,j); if(Math.random()<0.5) addTree(MAP_W-1,j); }    // sides
  for(let i=0;i<MAP_W;i++){ if(Math.random()<0.55) addTree(i,MAP_H-1); }                                       // bottom
  for(let j=8;j<MAP_H-1;j++) for(let i=1;i<MAP_W-1;i++){ if(Math.random()<0.03 && !nearDoor(i,j)) addTree(i,j); } // scatter

  // grass flowers (decoration)
  const flowers = [];
  for(let k=0;k<80;k++){ const i=(Math.random()*MAP_W)|0, j=(2+Math.random()*(MAP_H-3))|0; if(terrain[j]&&terrain[j][i]==='g'&&!solid[j][i]) flowers.push({x:i*TILE+(4+(Math.random()*8|0)), y:j*TILE+(6+(Math.random()*7|0)), c:Math.random()<0.5?'#e85d6a':'#f2c14e'}); }

  /* ---------- player (starts on the driveway, just south of the bridge) ---------- */
  const player = { x:18.5*TILE, y:8.5*TILE, speed:74, frame:0, anim:0, moving:false };

  /* ---------- NPCs: a guide outside each building ---------- */
  const NPC_LINES = {
    central:    "Welcome! This is the Central Lodge — kitchen, dining hall, and the pro-shop are all inside.",
    owners:     "That's the Owner's Lodge — wood-fired sauna, a creek-cold plunge, and the best views on the property.",
    cabins:     "These are the cabins — your own warm spot in the timber. Walk over to the lodge and coffee's already on.",
    bathhouse:  "Hot rainfall showers and heated floors in the bathhouse. Best way to warm up after a cold day out.",
    processing: "Game Processing & cold storage — we take your harvest from field to freezer right here, no two-hour drive.",
    storage:    "Storage lot — leave your boat, ATV, or RV up here for the season instead of towing it back and forth.",
    outdoor:    "The fire pit by the creek — string lights, Adirondack chairs, and where everybody ends up at night.",
    rv:         "RV pads and tent sites — roll in, light your fire ring, and the whole basecamp's a short walk away.",
  };
  const NPC_COLORS = ['#4a7a3a','#7a4a8a','#b5462e','#2c5a8a','#a06a2a','#3a7a7a','#8a5a2a','#5a5a8a'];
  const npcs = buildings.map((b,idx) => {
    let nx=b.doorTx+1, ny=b.doorTy;
    if(!(inB(nx,ny) && !solid[ny][nx])) nx=b.doorTx-1;            // stand just beside the door
    return { bkey:b.key, line:NPC_LINES[b.key]||`This is ${b.name}.`, x:nx*TILE+TILE/2, y:ny*TILE+TILE, color:NPC_COLORS[idx%NPC_COLORS.length], bob:Math.random()*6 };
  });

  /* ---------- wildlife ---------- */
  const birds = [];
  for(let k=0;k<5;k++) birds.push({ x:Math.random()*WORLD_W, y:6+Math.random()*70, sp:16+Math.random()*16, ph:Math.random()*6 });
  const critters = [];
  function addCritter(type,tx,ty){ critters.push({ type, x:tx*TILE, y:ty*TILE, hx:tx*TILE, hy:ty*TILE, t:Math.random()*2.5, dx:0, dy:0, frame:0, fa:0, moving:false }); }
  addCritter('deer',42,4); addCritter('deer',46,9); addCritter('deer',38,2);
  addCritter('rabbit',26,19); addCritter('rabbit',13,21); addCritter('rabbit',33,25); addCritter('rabbit',24,12);
  addCritter('duck',9,7); addCritter('duck',13,7); addCritter('duck',6,7);

  // speech bubble (created once, positioned over the canvas near an NPC)
  const stage = document.getElementById('gameStage');
  const bubble = document.createElement('div');
  bubble.className = 'game-bubble'; bubble.hidden = true;
  if(stage) stage.appendChild(bubble);
  let activeNpc = null;

  function isSolidPx(px,py){
    const i=(px/TILE)|0, j=(py/TILE)|0;
    if(i<0||j<0||i>=MAP_W||j>=MAP_H) return true;
    return solid[j][i];
  }
  function feetBlocked(x,y){
    return isSolidPx(x-4,y-2) || isSolidPx(x+4,y-2) || isSolidPx(x-4,y-7) || isSolidPx(x+4,y-7);
  }

  /* ---------- input ---------- */
  const held = { up:false, down:false, left:false, right:false };
  const KEYMAP = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right', W:'up', S:'down', A:'left', D:'right' };
  let active = false;    // canvas is on screen
  function modalOpen(){ const b=document.getElementById('backdrop'); return b && b.classList.contains('open'); }

  window.addEventListener('keydown', e => {
    if(!active || modalOpen()) return;
    if(KEYMAP[e.key]){ held[KEYMAP[e.key]]=true; e.preventDefault(); }
    else if(e.key==='Enter' || e.key===' '){ if(nearBuilding){ e.preventDefault(); enter(); } }
  });
  window.addEventListener('keyup', e => { if(KEYMAP[e.key]) held[KEYMAP[e.key]]=false; });

  // on-screen pad
  document.querySelectorAll('.game-pad .gp-btn').forEach(btn => {
    const d = btn.dataset.dir;
    const on = e => { e.preventDefault(); held[d]=true; };
    const off = e => { e.preventDefault(); held[d]=false; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
  });
  document.getElementById('gameA').addEventListener('click', () => { if(nearBuilding) enter(); });
  const promptEl = document.getElementById('gamePrompt');
  promptEl.addEventListener('click', () => { if(nearBuilding) enter(); });

  // click a building to open it
  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const wx = (e.clientX - r.left) * (VIEW_W / r.width) + cam.x;
    const wy = (e.clientY - r.top) * (VIEW_H / r.height) + cam.y;
    const ti = (wx/TILE)|0, tj = (wy/TILE)|0;
    const b = buildings.find(b => ti>=b.tx && ti<b.tx+b.tw && tj>=b.ty && tj<b.ty+b.th);
    if(b) openBuilding(b.key);
  });

  function openBuilding(key){ if(typeof openModal==='function') openModal(key); }
  let nearBuilding = null;
  function enter(){ if(nearBuilding) openBuilding(nearBuilding.key); }

  /* ---------- camera ---------- */
  const cam = { x:0, y:0 };
  function updateCam(){
    cam.x = Math.max(0, Math.min(WORLD_W - VIEW_W, Math.round(player.x - VIEW_W/2)));
    cam.y = Math.max(0, Math.min(WORLD_H - VIEW_H, Math.round(player.y - VIEW_H/2)));
  }

  /* ---------- update ---------- */
  function update(dt){
    let dx=0, dy=0;
    if(!modalOpen() && active){
      if(held.left) dx-=1; if(held.right) dx+=1;
      if(held.up) dy-=1; if(held.down) dy+=1;
    }
    player.moving = (dx||dy) ? true : false;
    if(dx&&dy){ dx*=0.7071; dy*=0.7071; }
    const step = player.speed*dt;
    if(dx){ const nx=player.x+dx*step; if(!feetBlocked(nx,player.y)) player.x=nx; }
    if(dy){ const ny=player.y+dy*step; if(!feetBlocked(player.x,ny)) player.y=ny; }
    player.x = Math.max(6, Math.min(WORLD_W-6, player.x));
    player.y = Math.max(10, Math.min(WORLD_H-2, player.y));

    if(player.moving){ player.anim+=dt; if(player.anim>0.16){ player.anim=0; player.frame^=1; } }
    else player.frame=0;

    updateAnimals(dt);

    // nearest building door (for Enter) + nearest NPC (for the speech bubble)
    nearBuilding = null; let best=22*22;
    for(const b of buildings){ const dx2=player.x-b.cx, dy2=player.y-b.cy, d=dx2*dx2+dy2*dy2; if(d<best){ best=d; nearBuilding=b; } }
    activeNpc = null; let bestN=26*26;
    for(const n of npcs){ const dx2=player.x-n.x, dy2=player.y-(n.y-4), d=dx2*dx2+dy2*dy2; if(d<bestN){ bestN=d; activeNpc=n; } }
    if(promptEl) promptEl.hidden = true;     // the NPC bubble replaces the old prompt
    positionBubble();
    updateCam();
  }

  function updateAnimals(dt){
    birds.forEach(b=>{ b.x+=b.sp*dt; b.ph+=dt*9; if(b.x>WORLD_W+12){ b.x=-12; b.y=6+Math.random()*70; } });
    critters.forEach(c=>{
      c.fa+=dt; if(c.fa>0.18){ c.fa=0; c.frame^=1; }
      if(c.type==='duck'){ c.bobp=(c.bobp||0)+dt*2; c.moving=false; return; }
      c.t-=dt;
      if(c.t<=0){ c.t=1+Math.random()*2.5; const a=Math.random()*6.283; if(Math.random()<0.4){ c.dx=0; c.dy=0; } else { c.dx=Math.cos(a); c.dy=Math.sin(a); } }
      const sp=(c.type==='rabbit'?28:15)*dt, nx=c.x+c.dx*sp, ny=c.y+c.dy*sp;
      if(Math.hypot(nx-c.hx,ny-c.hy)<54 && !isSolidPx(nx,ny+4) && nx>6 && ny>6 && nx<WORLD_W-6 && ny<WORLD_H-6){ c.x=nx; c.y=ny; c.moving=!!(c.dx||c.dy); }
      else { c.dx*=-1; c.dy*=-1; c.moving=false; }
    });
  }
  function positionBubble(){
    if(!bubble) return;
    if(activeNpc){
      bubble.innerHTML = `${activeNpc.line}<span class="bubble-go">▶ Press Enter to go inside</span>`;
      const scale = canvas.clientWidth / VIEW_W || 1;
      bubble.style.left = (canvas.offsetLeft + (activeNpc.x - cam.x)*scale) + 'px';
      bubble.style.top  = (canvas.offsetTop  + (activeNpc.y - 22 - cam.y)*scale) + 'px';
      bubble.hidden = false;
    } else bubble.hidden = true;
  }

  /* ---------- draw ---------- */
  let t=0;
  function draw(){
    ctx.clearRect(0,0,VIEW_W,VIEW_H);
    const x0=(cam.x/TILE)|0, y0=(cam.y/TILE)|0;
    const x1=Math.min(MAP_W,x0+VIEW_W/TILE+2), y1=Math.min(MAP_H,y0+VIEW_H/TILE+2);
    // terrain
    for(let j=y0;j<y1;j++) for(let i=x0;i<x1;i++){
      const sx=i*TILE-cam.x, sy=j*TILE-cam.y, tt=terrain[j][i];
      if(tt==='w'){ drawWater(sx,sy,i,j); }
      else if(tt==='p'){ ctx.fillStyle='#cdbb8e'; ctx.fillRect(sx,sy,TILE,TILE); ctx.fillStyle='rgba(120,95,60,.18)'; ctx.fillRect(sx+3,sy+9,2,2); ctx.fillRect(sx+10,sy+4,2,2); }
      else if(tt==='b'){ ctx.fillStyle='#a07c4e'; ctx.fillRect(sx,sy,TILE,TILE); ctx.fillStyle='#7a5a34'; ctx.fillRect(sx,sy,TILE,2); ctx.fillRect(sx,sy+7,TILE,2); ctx.fillRect(sx,sy+14,TILE,2); }
      else { ctx.fillStyle=((i+j)&1)?'#74b35a':'#6aa850'; ctx.fillRect(sx,sy,TILE,TILE); }
    }
    // flowers
    ctx.save();
    flowers.forEach(f=>{ const sx=f.x-cam.x, sy=f.y-cam.y; if(sx>-4&&sy>-4&&sx<VIEW_W&&sy<VIEW_H){ ctx.fillStyle=f.c; ctx.fillRect(sx,sy,2,2); } });
    ctx.restore();

    // depth-sorted objects: buildings, trees, NPCs, critters, player
    const objs = [];
    buildings.forEach(b=> objs.push({ y:(b.ty+b.th)*TILE, draw:()=>drawBuilding(b) }));
    trees.forEach(tr=> objs.push({ y:tr.y, draw:()=>drawTree(tr.x-cam.x, tr.y-cam.y) }));
    npcs.forEach(n=> objs.push({ y:n.y, draw:()=>drawNpc(n) }));
    critters.forEach(c=> objs.push({ y:c.y+8, draw:()=>drawCritter(c) }));
    objs.push({ y:player.y, draw:()=>drawPlayer(player.x-cam.x, player.y-cam.y, player.frame, player.moving) });
    objs.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    // birds fly above everything
    birds.forEach(b=> drawBird(b.x-cam.x, b.y-cam.y, b.ph));
  }

  function drawNpc(n){
    const cx=Math.round(n.x-cam.x), by=Math.round(n.y-cam.y);
    if(cx<-10||cx>VIEW_W+10||by<-22||by>VIEW_H+10) return;
    const bobY = Math.round(Math.sin(t*2+n.bob)*0.6);
    const x=cx-5, top=by-16+bobY;
    ctx.fillStyle='rgba(20,40,20,.25)'; ctx.fillRect(cx-4,by-2,9,3);
    ctx.fillStyle='#2b2a2a'; ctx.fillRect(x+2,top+13,3,3); ctx.fillRect(x+6,top+13,3,3);  // legs
    ctx.fillStyle=n.color; ctx.fillRect(x+1,top+8,9,6);                                    // shirt
    ctx.fillStyle='#f0c69a'; ctx.fillRect(x+3,top+4,5,5);                                  // face
    ctx.fillStyle='#2a2118'; ctx.fillRect(x+4,top+6,1,1); ctx.fillRect(x+6,top+6,1,1);
    ctx.fillStyle='#5a3a22'; ctx.fillRect(x+2,top+1,7,3);                                  // hair
    if(activeNpc!==n){ ctx.fillStyle='#fff'; ctx.fillRect(cx-1,top-4,3,2); ctx.fillStyle='#2c3e2c'; ctx.fillRect(cx,top-3,1,1); }  // "can talk" dot
  }
  function drawCritter(c){
    const x=Math.round(c.x-cam.x), y=Math.round(c.y-cam.y);
    if(x<-14||x>VIEW_W+14||y<-14||y>VIEW_H+14) return;
    if(c.type==='deer'){
      ctx.fillStyle='rgba(20,40,20,.22)'; ctx.fillRect(x-5,y-1,12,2);
      ctx.fillStyle='#8a5a32'; ctx.fillRect(x-5,y-9,11,6); ctx.fillRect(x+4,y-13,4,5);
      ctx.fillStyle='#6e4827'; ctx.fillRect(x+7,y-15,1,3); ctx.fillRect(x+5,y-15,1,3);
      ctx.fillStyle='#5a3a22'; const lb=c.frame?1:0;
      ctx.fillRect(x-4,y-3,2,3); ctx.fillRect(x+3,y-3,2,3-lb); ctx.fillRect(x-1,y-3,2,2+lb);
    } else if(c.type==='rabbit'){
      ctx.fillStyle='rgba(20,40,20,.2)'; ctx.fillRect(x-3,y-1,6,2);
      ctx.fillStyle='#b9b3a8'; ctx.fillRect(x-3,y-5,6,4); ctx.fillRect(x+1,y-7,2,3);
      ctx.fillStyle='#cfc9be'; ctx.fillRect(x+2,y-10,1,3); ctx.fillRect(x,y-10,1,3);
      ctx.fillStyle='#fff'; ctx.fillRect(x-3,y-4,2,2);
    } else { // duck floating on the creek
      const bob=Math.round(Math.sin(c.bobp||0));
      ctx.fillStyle='rgba(255,255,255,.45)'; ctx.fillRect(x-4,y-1,9,2);
      ctx.fillStyle='#f4f0e6'; ctx.fillRect(x-3,y-5+bob,7,4); ctx.fillRect(x+3,y-8+bob,3,3);
      ctx.fillStyle='#e0a02a'; ctx.fillRect(x+6,y-7+bob,2,1);
      ctx.fillStyle='#2a2118'; ctx.fillRect(x+4,y-7+bob,1,1);
    }
  }
  function drawBird(x,y,ph){
    if(x<-6||x>VIEW_W+6||y<-6||y>VIEW_H) return;
    ctx.fillStyle='#3a3a3a';
    if(Math.sin(ph)>0){ ctx.fillRect(x-3,y,2,1); ctx.fillRect(x+1,y,2,1); ctx.fillRect(x-1,y+1,2,1); }
    else { ctx.fillRect(x-3,y+1,2,1); ctx.fillRect(x+1,y+1,2,1); ctx.fillRect(x-1,y,2,1); }
  }

  function drawWater(sx,sy,i,j){
    ctx.fillStyle='#5aa0d8'; ctx.fillRect(sx,sy,TILE,TILE);
    ctx.fillStyle='#4a90c8'; ctx.fillRect(sx,sy+TILE-3,TILE,3);
    // gentle ripples
    const ph=Math.sin((t*1.6)+(i*0.6)+(j*0.9));
    ctx.fillStyle='rgba(190,225,250,.55)';
    if(ph>0.3) ctx.fillRect(sx+3+((ph*3)|0), sy+5, 6, 1);
    if(ph<-0.3) ctx.fillRect(sx+7, sy+10, 5, 1);
  }
  function drawTree(cx,bottom){
    if(cx<-12||cx>VIEW_W+12||bottom<-4||bottom>VIEW_H+28) return;
    // trunk
    ctx.fillStyle='#6b4a2a'; ctx.fillRect(cx-2, bottom-9, 4, 9);
    // canopy
    ctx.fillStyle='#2f6b34'; ctx.fillRect(cx-8, bottom-22, 16, 13);
    ctx.fillRect(cx-6, bottom-25, 12, 4);
    ctx.fillStyle='#3f8040'; ctx.fillRect(cx-6, bottom-21, 12, 8);
    ctx.fillStyle='#57a04e'; ctx.fillRect(cx-5, bottom-22, 5, 4);   // highlight
    ctx.fillStyle='rgba(20,50,25,.35)'; ctx.fillRect(cx-8, bottom-11, 16, 2);
  }
  function drawBuilding(b){
    const sx=b.tx*TILE-cam.x, sy=b.ty*TILE-cam.y, w=b.tw*TILE, h=b.th*TILE;
    if(sx>VIEW_W||sy>VIEW_H||sx+w<0||sy+h<0) return;
    // soft shadow
    ctx.fillStyle='rgba(20,40,20,.18)'; ctx.fillRect(sx+2, sy+h-2, w, 4);
    if(b.type==='fire'){ drawFirePit(sx,sy,w,h); return; }
    if(b.type==='camp'){ drawCamp(sx,sy,w,h); return; }
    const roofH=Math.round(h*0.46);
    // wall
    ctx.fillStyle=b.wall; ctx.fillRect(sx, sy+roofH, w, h-roofH);
    ctx.fillStyle='rgba(0,0,0,.14)'; ctx.fillRect(sx, sy+h-4, w, 4);
    // roof
    ctx.fillStyle=b.roof; ctx.beginPath();
    ctx.moveTo(sx-2, sy+roofH); ctx.lineTo(sx+7, sy); ctx.lineTo(sx+w-7, sy); ctx.lineTo(sx+w+2, sy+roofH); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.14)'; ctx.fillRect(sx+7, sy+1, w-14, 2);
    // door + windows
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(sx+w/2-4, sy+h-12, 8, 12);
    ctx.fillStyle='#f4e7a8';
    if(w>=56){ ctx.fillRect(sx+8, sy+roofH+5, 8, 7); ctx.fillRect(sx+w-16, sy+roofH+5, 8, 7); }
  }
  function drawFirePit(sx,sy,w,h){
    const cx=sx+w/2, cy=sy+h-6;
    ctx.fillStyle='#9a8f7a'; ctx.beginPath(); ctx.ellipse(cx,cy,w/2-2,h/3,0,0,7); ctx.fill();      // stone ring
    ctx.fillStyle='#5a5246'; ctx.beginPath(); ctx.ellipse(cx,cy,w/2-6,h/3-3,0,0,7); ctx.fill();
    ctx.fillStyle='#e8853c'; ctx.beginPath(); ctx.moveTo(cx,cy-12); ctx.lineTo(cx-5,cy); ctx.lineTo(cx+5,cy); ctx.closePath(); ctx.fill();  // flame
    ctx.fillStyle='#f5c542'; ctx.beginPath(); ctx.moveTo(cx,cy-7); ctx.lineTo(cx-3,cy); ctx.lineTo(cx+3,cy); ctx.closePath(); ctx.fill();
  }
  function drawCamp(sx,sy,w,h){
    // camper van
    ctx.fillStyle='#dfe6cf'; ctx.fillRect(sx, sy+h-16, 26, 12);
    ctx.fillStyle='#b6c19a'; ctx.fillRect(sx, sy+h-16, 26, 3);
    ctx.fillStyle='#7aa3c0'; ctx.fillRect(sx+18, sy+h-13, 6, 5);
    ctx.fillStyle='#333'; ctx.fillRect(sx+4, sy+h-5, 4, 4); ctx.fillRect(sx+17, sy+h-5, 4, 4);
    // tent
    ctx.fillStyle='#cf7d4a'; ctx.beginPath(); ctx.moveTo(sx+w-2, sy+h-4); ctx.lineTo(sx+w-14, sy+h-4); ctx.lineTo(sx+w-8, sy+h-16); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.moveTo(sx+w-8, sy+h-4); ctx.lineTo(sx+w-11, sy+h-4); ctx.lineTo(sx+w-8, sy+h-11); ctx.closePath(); ctx.fill();
  }
  function drawPlayer(cx,by,frame,moving){
    cx=Math.round(cx); by=Math.round(by);
    const x=cx-6, top=by-18;
    // shadow
    ctx.fillStyle='rgba(20,40,20,.25)'; ctx.fillRect(cx-5, by-2, 10, 3);
    // legs (walk bob)
    ctx.fillStyle='#2b3a4a';
    if(moving&&frame){ ctx.fillRect(x+2, top+14, 3, 4); ctx.fillRect(x+7, top+13, 3, 4); }
    else if(moving){ ctx.fillRect(x+2, top+13, 3, 4); ctx.fillRect(x+7, top+14, 3, 4); }
    else { ctx.fillRect(x+2, top+13, 3, 4); ctx.fillRect(x+7, top+13, 3, 4); }
    // body
    ctx.fillStyle='#2c3e6b'; ctx.fillRect(x+1, top+8, 10, 6);
    ctx.fillStyle='#24335a'; ctx.fillRect(x+1, top+12, 10, 2);
    // face
    ctx.fillStyle='#f0c69a'; ctx.fillRect(x+3, top+4, 6, 5);
    ctx.fillStyle='#2a2118'; ctx.fillRect(x+4, top+6, 1, 1); ctx.fillRect(x+7, top+6, 1, 1);  // eyes
    // cap
    ctx.fillStyle='#b5462e'; ctx.fillRect(x+2, top, 8, 3);
    ctx.fillStyle='#8f3622'; ctx.fillRect(x+2, top+2, 9, 2);   // brim
  }

  /* ---------- loop ---------- */
  let last=0;
  function loop(ts){
    const dt=Math.min(0.05, (ts-last)/1000 || 0); last=ts; t=ts/1000;
    update(dt); draw();
    requestAnimationFrame(loop);
  }
  updateCam();
  requestAnimationFrame(loop);

  // only capture keys / move while the game is on screen
  if('IntersectionObserver' in window){
    new IntersectionObserver(es=>{ active = es[0].isIntersecting; if(!active){ held.up=held.down=held.left=held.right=false; } }, {threshold:0.25}).observe(canvas);
  } else active = true;
})();
