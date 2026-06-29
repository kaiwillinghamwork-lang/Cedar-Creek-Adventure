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
  const MAP_W = 44, MAP_H = 28;
  const WORLD_W = MAP_W * TILE, WORLD_H = MAP_H * TILE;

  /* ---------- world data ---------- */
  const terrain = [];   // 'g' grass, 'w' water, 'p' path
  const solid = [];
  for(let y=0;y<MAP_H;y++){ terrain[y]=[]; solid[y]=[]; for(let x=0;x<MAP_W;x++){ terrain[y][x]='g'; solid[y][x]=false; } }

  function rect(x,y,w,h,fn){ for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++) if(i>=0&&j>=0&&i<MAP_W&&j<MAP_H) fn(i,j); }

  // creek across the top (rows 4-5), with a bridge gap at x=20-21
  rect(0,4,MAP_W,2,(i,j)=>{ terrain[j][i]='w'; solid[j][i]=true; });
  rect(20,4,2,2,(i,j)=>{ terrain[j][i]='p'; solid[j][i]=false; });   // bridge

  // a pond (the second-photo vibe)
  const pond = {x:33,y:10,w:6,h:4};
  rect(pond.x,pond.y,pond.w,pond.h,(i,j)=>{ terrain[j][i]='w'; solid[j][i]=true; });

  // buildings — key matches BUILDINGS in data.js
  const buildings = [
    { key:'bathhouse',  name:'Bathhouse',         tx:6,  ty:8,  tw:4, th:3, roof:'#6d8aa6', wall:'#557390' },
    { key:'outdoor',    name:'Creek-side Fire Pit', tx:2, ty:13, tw:3, th:2, type:'fire' },
    { key:'cabins',     name:'The Cabins',        tx:6,  ty:15, tw:5, th:3, roof:'#7a8a3f', wall:'#5f6b33' },
    { key:'rv',         name:'RV & Tent Sites',   tx:2,  ty:20, tw:4, th:2, type:'camp' },
    { key:'central',    name:'Central Lodge',     tx:18, ty:8,  tw:5, th:3, roof:'#8a5630', wall:'#6f4424' },
    { key:'processing', name:'Game Processing',   tx:18, ty:13, tw:5, th:3, roof:'#566069', wall:'#444e56' },
    { key:'storage',    name:'Storage Lot',       tx:19, ty:18, tw:4, th:2, roof:'#b09a6e', wall:'#8a784f' },
    { key:'owners',     name:"Owner's Lodge",     tx:30, ty:18, tw:5, th:3, roof:'#8a5630', wall:'#6f4424' },
  ];
  buildings.forEach(b => {
    rect(b.tx,b.ty,b.tw,b.th,(i,j)=>{ solid[j][i]=true; });
    b.doorTx = b.tx + Math.floor(b.tw/2);
    b.doorTy = b.ty + b.th;                       // tile just below
    if(b.doorTy<MAP_H){ terrain[b.doorTy][b.doorTx]='p'; solid[b.doorTy][b.doorTx]=false; }
    b.cx = (b.tx + b.tw/2)*TILE;
    b.cy = (b.ty + b.th)*TILE + 6;
  });

  // gravel paths between things (cosmetic)
  function path(x0,y0,x1,y1){
    if(x0===x1){ for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++) if(!solid[y][x0]) terrain[y][x0]='p'; }
    else { for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++) if(!solid[y0][x]) terrain[y0][x]='p'; }
  }
  path(21,6,21,25);
  buildings.forEach(b => { path(b.doorTx, b.doorTy, 21, b.doorTy); path(b.doorTx,b.doorTy,b.doorTx,b.doorTy); });

  // trees: dense timber up top + a leafy border + a little scatter
  const trees = [];
  function addTree(i,j){ if(i>=0&&j>=0&&i<MAP_W&&j<MAP_H && terrain[j][i]==='g' && !solid[j][i]){ solid[j][i]=true; trees.push({x:i*TILE+TILE/2, y:j*TILE+TILE}); } }
  for(let i=0;i<MAP_W;i++){ addTree(i,0); addTree(i,1); addTree(i,MAP_H-1); }   // top timber + bottom edge
  for(let j=0;j<MAP_H;j++){ addTree(0,j); addTree(MAP_W-1,j); }                  // side edges
  // scattered (deterministic-ish via simple pattern + a bit of random)
  for(let j=2;j<MAP_H-1;j++) for(let i=1;i<MAP_W-1;i++){
    if(terrain[j][i]==='g' && !solid[j][i] && Math.random()<0.05){
      // keep clear of building doors
      let near=false; buildings.forEach(b=>{ if(Math.abs(i-b.doorTx)<2 && Math.abs(j-b.doorTy)<2) near=true; });
      if(!near) addTree(i,j);
    }
  }

  // little grass flowers (decoration only)
  const flowers = [];
  for(let k=0;k<70;k++){
    const i=(Math.random()*MAP_W)|0, j=(2+Math.random()*(MAP_H-3))|0;
    if(terrain[j]&&terrain[j][i]==='g'&&!solid[j][i]) flowers.push({x:i*TILE+(4+(Math.random()*8|0)), y:j*TILE+(6+(Math.random()*7|0)), c:Math.random()<0.5?'#e85d6a':'#f2c14e'});
  }

  /* ---------- player ---------- */
  const player = { x:21.5*TILE, y:7.5*TILE, speed:74, frame:0, anim:0, moving:false };

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

    // nearest building door
    nearBuilding = null; let best=22*22;
    for(const b of buildings){ const ddx=player.x-b.cx, ddy=player.y-b.cy, d=ddx*ddx+ddy*ddy; if(d<best){ best=d; nearBuilding=b; } }
    if(promptEl){
      if(nearBuilding){ promptEl.hidden=false; promptEl.innerHTML = `▶ <b>${nearBuilding.name}</b> — press Enter`; }
      else promptEl.hidden=true;
    }
    updateCam();
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
      else { ctx.fillStyle=((i+j)&1)?'#74b35a':'#6aa850'; ctx.fillRect(sx,sy,TILE,TILE); }
    }
    // flowers
    ctx.save();
    flowers.forEach(f=>{ const sx=f.x-cam.x, sy=f.y-cam.y; if(sx>-4&&sy>-4&&sx<VIEW_W&&sy<VIEW_H){ ctx.fillStyle=f.c; ctx.fillRect(sx,sy,2,2); } });
    ctx.restore();

    // depth-sorted objects: buildings, trees, player
    const objs = [];
    buildings.forEach(b=> objs.push({ y:(b.ty+b.th)*TILE, draw:()=>drawBuilding(b) }));
    trees.forEach(tr=> objs.push({ y:tr.y, draw:()=>drawTree(tr.x-cam.x, tr.y-cam.y) }));
    objs.push({ y:player.y, draw:()=>drawPlayer(player.x-cam.x, player.y-cam.y, player.frame, player.moving) });
    objs.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
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
