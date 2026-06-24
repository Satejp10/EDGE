// ===== LEVEL REGISTRY =====
// The level catalog plus the "active level" pointer. Levels are plain JSON imported
// at build time (no fetch) — Vite bundles them, Node's test runner reads them via the
// `with { type: 'json' }` import attribute.
//
// Level schema (each *.json):
//   name    : string, display label
//   start   : [x, y]                       cube spawn
//   goal    : [x, y]                       win tile
//   cells   : [[x, y, height], ...]        static, SAFE checkpoints
//   fallers : [[x, y, height], ...]        collapse-after-step tiles
//   movers  : [{ path:[[x,y],...], h, mode:'pingpong'|'loop' }, ...]
//   prisms  : [[x, y], ...]                collectibles
//
// Consumers read the active level via getLevel() at call time (never baked at import);
// loadLevel() in main.js calls setLevel() then re-initializes world/cube/camera.
import level1 from './level1.json' with { type: 'json' };
import level2 from './level2.json' with { type: 'json' };
import level3 from './level3.json' with { type: 'json' };
import level4 from './level4.json' with { type: 'json' };

export const LEVELS = [level1, level2, level3, level4];

let active = LEVELS[0];

export const getLevel = () => active;
export const levelCount = () => LEVELS.length;
export function setLevel(i) { active = LEVELS[i]; return active; }

// Test/diagnostic helper: activate an arbitrary level object without registering it in
// the catalog. Used by unit tests to build a controlled world fixture (e.g. a single
// mover on otherwise empty ground), independent of any shipped level's contents.
export function setLevelData(obj) { active = obj; return active; }
