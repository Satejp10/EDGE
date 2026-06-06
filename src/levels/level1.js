// ===== LEVEL =====
// The one hardcoded level. This stays a JS literal for now; a JSON schema + loader
// is a later roadmap step.
//
//   cells   : static, SAFE checkpoints   [x, y, height]
//   fallers : collapse-after-step        [x, y, height]
//   movers  : { path:[[x,y],...], h, mode:'pingpong'|'loop' }
//   prisms  : collectibles               [x, y]

export const LEVEL = {
  start: [0, 1],
  goal: [7, 2],
  cells: [ [0, 1, 0], [4, 1, 0], [6, 2, 1], [7, 2, 1] ],
  fallers: [ [1, 1, 0], [2, 1, 0], [3, 1, 0] ],
  movers: [ { path: [[5, 1], [5, 2]], h: 0, mode: 'pingpong' } ],
  prisms: [ [2, 1], [6, 2] ],
};
