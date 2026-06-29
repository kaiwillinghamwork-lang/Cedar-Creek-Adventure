/* ============================================================ */
/* world.js — the game map as DATA (edit it in map-editor.html). */
/*   Terrain codes: '.' grass · 'w' water · 'p' path · 'b' bridge */
/*   · 't' tree. Buildings + player are placed by tile.          */
/*   getActiveMap() returns your saved map (localStorage) if any, */
/*   otherwise DEFAULT_MAP below.                                 */
/* ============================================================ */
const GAME_TILE = 16;
const BUILDING_DEFS = {
  "outdoor": {
    "name": "Creek-side Fire Pit",
    "tw": 2,
    "th": 2,
    "type": "fire"
  },
  "bathhouse": {
    "name": "Bathhouse",
    "tw": 3,
    "th": 2,
    "roof": "#6d8aa6",
    "wall": "#557390"
  },
  "rv": {
    "name": "RV & Tent Sites",
    "tw": 6,
    "th": 3,
    "type": "camp"
  },
  "cabins": {
    "name": "The Cabins",
    "tw": 5,
    "th": 3,
    "roof": "#7a8a3f",
    "wall": "#5f6b33"
  },
  "central": {
    "name": "Central Lodge",
    "tw": 5,
    "th": 3,
    "roof": "#8a5630",
    "wall": "#6f4424"
  },
  "processing": {
    "name": "Game Processing",
    "tw": 5,
    "th": 2,
    "roof": "#566069",
    "wall": "#444e56"
  },
  "storage": {
    "name": "Storage Lot",
    "tw": 4,
    "th": 2,
    "roof": "#b09a6e",
    "wall": "#8a784f"
  },
  "owners": {
    "name": "Owner's Lodge",
    "tw": 5,
    "th": 3,
    "roof": "#8a5630",
    "wall": "#6f4424"
  }
};
const DEFAULT_MAP = {
  w: 50, h: 29,
  player: { tx: 18, ty: 8 },
  buildings: [{"key":"outdoor","tx":2,"ty":10},{"key":"bathhouse","tx":8,"ty":10},{"key":"rv","tx":1,"ty":14},{"key":"cabins","tx":8,"ty":14},{"key":"central","tx":20,"ty":9},{"key":"processing","tx":20,"ty":13},{"key":"storage","tx":21,"ty":17},{"key":"owners","tx":28,"ty":22}],
  terrain: [
    "tttttttttttttttttttttttttttttttttttttttttttttttttt",
    "tttttttttttttttttttttttttttttttttttttttttttttttttt",
    "pppppppppppppppppppppppppppppppppptttttttttttttttt",
    "t.................p..............ppttttttttttttttt",
    "t.................p...............pptttttttttttttt",
    "..................p................ppttttttttttttt",
    "..................p.................pptttttttttttt",
    "wwwwwwwwwwwwwwwwwbbbwwwwwwwwww........pttttttttttt",
    "..................p..........ww........ptttttttttt",
    "t.................p............w.t......pttttttttt",
    "t.................p.........t...ww.......ppttttttt",
    "..................p..............ww.....t.pptttttt",
    "...pppppppppppppppppppp............ww...t..ppttttt",
    "..ppppppppppppppppp.................ww.t....pptttt",
    "..................p...................w.......pttt",
    "t...............t.ppppp................ww......ptt",
    "t.................p.....................ww......pt",
    "....ppppppppppppppp.......................ww.....p",
    "t.................p........................ww...tt",
    "t.................pppppp.....................w...t",
    "..................p......t..........t.........ww.t",
    "t...t.............ppp..................tt......wwt",
    "..........t....t....pppp.........................w",
    ".......................pppp.........t....t........",
    "...........................pp....t...t............",
    "...........t.....t..........ppp..........t...t...t",
    "..................................................",
    "t......................................t..........",
    "tt.tttt..ttt.tt..tt.....t..t.ttt.tttt.tt.t.ttttt.t"
  ]
};
function getActiveMap(){
  try { const s = localStorage.getItem('cc_map'); if(s) return JSON.parse(s); } catch(e){}
  return DEFAULT_MAP;
}
