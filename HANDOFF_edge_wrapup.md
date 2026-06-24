# Handoff: EDGE — final wrap-up (conclude to a stable 5-level showcase build)

> Generated 2026-06-24 from a Claude.ai thread. Continues `HANDOFF_edge.md` (original
> rationale + decision log) and `PROGRESS_for_claude.md` (2026-06-24, current state).
> **This document is a hypothesis, not ground truth.** Verify every claim against the
> actual files. Run the Section 0 audit before doing any work.
>
> **Purpose of THIS handoff:** the project is being *concluded*. It supersedes the
> "What's next" list in `PROGRESS_for_claude.md` — that list is now out of date. We are
> NOT continuing open-ended development. The goal is a stable, portfolio-showcaseable
> 5-level build, then stop.

---

## 0. Read me first — MANDATORY AUDIT (Claude Code: do this before anything else)

Before you write, edit, plan, or scaffold a single line, perform this audit and report what you find. Do not skip it. Everything below this section was written by an agent that could not see the code — your first job is to confirm reality matches it.

1. **Read this entire handoff**, top to bottom.
2. **Read `CLAUDE.md` / `AGENTS.md`** if they exist. This handoff supplements them; where they conflict, the existing config wins. Do not restate their contents.
3. **Open every file listed in Section 3.** Actually read them — do not rely on the descriptions here. The descriptions may be stale or wrong.
4. **Verify the stack.** Check that the dependencies and versions in Section 3 are actually installed (inspect `package.json` / `requirements.txt` / lockfiles / etc.). Note any mismatch.
5. **Confirm the stated state is real.** Run the build and/or dev command from Section 3 and run the test suite and linter if they exist. Record pass/fail. If there is no test command, say so.
6. **Check git.** Run `git status`, current branch, and recent `git log`. Confirm they match what Section 3 claims.
7. **Treat every claim above as a hypothesis.** Flag every drift you find in the form: *"Doc says X; reality is Y."*
8. **Report, then stop.** Post a short audit summary — what matched, what drifted, what's missing, and any blockers — and then **wait for the user's go-ahead.** Do not silently start building. (Only proceed straight into the Section 4 task if the resume prompt explicitly told you to.)

---

## 1. What we're building

- **One sentence:** A faithful, browser-playable Canvas-2D recreation of the 2008 puzzle-platformer EDGE.
- **Description:** Already built and live at https://satejp10.github.io/EDGE/ — see `PROGRESS_for_claude.md` (2026-06-24) for the full current-state picture. This handoff covers only the closing stretch.
- **Definition of done (updated for the conclusion):** A stable **5-level** game, playable on desktop + mobile, with the tab-hidden timer bug fixed, suitable to embed in a portfolio. Once that's true, the project is **done** — no further features.

---

## 2. Why — motivation, reasoning, and constraints

- **Why now:** The owner has reached a natural finish line. The nostalgia/craft goal is satisfied and the level system (the last real engineering task) is complete. The project now needs to be *parked in a polished, stable state* and used as a portfolio piece — not grown further.
- **Why these specific tasks:** The two things that separate "stop here" from "looks unfinished" are (a) the real tab-hidden bug, which a recruiter will hit by switching tabs and coming back, and (b) one more level so the count reads as a complete small game rather than a tech demo. Everything else is gold-plating.
- **Hard constraints:** Unchanged from `CLAUDE.md` — Canvas 2D only (never WebGL/three.js), vanilla JS, no game engine, no new runtime deps without asking, build-time JSON levels (no runtime fetch), EDGE art only (never the portfolio's editorial/brutalist aesthetic), "dark mode" = UI chrome not game art.
- **Non-goals — explicitly out of scope (the temptations to resist):**
  - **Static/dynamic render split.** Premature optimization; 5 small Canvas-2D levels run fine. Adds risk, zero showcase value. **Do not do it.**
  - **Faithful recreations of actual EDGE stages.** Needs reference maps; explicitly a bigger job. The scope-creep door — keep it shut.
  - **TypeScript migration.** Pure churn on a project being concluded.
  - **Object pooling / profiling / perf work** generally.
  - **The GIF/screen-recording itself** — that's a manual step the owner will do later, after the capstone level exists. Not a coding task. CC's only job toward it is making the capstone level visually varied enough to make a good clip.

### Decision log (new decisions from this thread — these override `PROGRESS`'s "What's next")

| Decision | Reason | Alternatives rejected (and why) |
|---|---|---|
| Conclude at **5 levels** | Reads as a complete small game; clean stopping number | Open-ended "more levels" — no end condition, scope creep |
| Ship **one robustness PR**, then capstone level, then stop | Highest-leverage polish for a showcase; the rest is gilding | The full `PROGRESS` "What's next" (render split, faithful stages) — cut as gold-plating |
| **Cut** render split, faithful stages, TS, perf work | None add showcase value; all add risk/churn on a project being parked | Doing them "while we're here" — that's exactly the trap |
| Portfolio clip will be **muted autoplay mp4/webm**, not a real `.gif` | Smaller + smoother than a multi-MB gif on GitHub Pages | `.gif` — heavy, lower quality (decided later, manual) |
| Project **may be resumed someday** | The JSON loader + registry make adding levels cheap later — concluding now closes no doors | Treating "done" as permanent — unnecessary |

---

## 3. Current state — where the project is

- **Stage:** Feature-complete four-level game, live and tested. This is final wrap-up, not a build-out.
- **Authoritative current-state map:** `PROGRESS_for_claude.md` (2026-06-24) has the full file inventory, stack, module layout, and verified-working list. **Read it instead of re-deriving** — this section only notes what matters for the wrap-up. `CHANGELOG.md` has per-change detail.
- **Stack / how to run / module layout:** see `PROGRESS_for_claude.md` and `CLAUDE.md`. (In short: Vite + vanilla JS + Canvas 2D; `npm install` → `npm run dev`; `npm test` = `node:test`, 21 tests, no test deps.)

### The one known real bug (already flagged in `PROGRESS` "What's next" #2)

- While the tab is hidden, **the beat clock + timer keep running** (no `visibilitychange` pause). Come back to the tab and state is desynced. This is the bug the robustness PR fixes. Confirm it still reproduces during the audit.

### Known gotchas / dead ends (do not retry)

- **WebGL/three.js** — the original three.js version crashed on software/lowp GL contexts. This is why the renderer is hand-rolled Canvas 2D. Do not reintroduce it.
- Auto-advance currently loops **1 → 2 → 3 → 4 → 1**; the capstone work changes this to include 5.

---

## 4. Pick up here — next steps

> Working style reminder (from `CLAUDE.md`): plan before anything visual and get sign-off first; verify by *playing* (build + browser), not just compiling; small PRs; no new deps.

**Immediate task (do first): the robustness PR.**

- **What:** (1) Auto-pause the simulation on `visibilitychange` when the tab goes hidden, and resume cleanly when it returns — the beat clock and timer must NOT advance while hidden. (2) Add a top-level `unhandledrejection` handler (it's nearly free; bundle it here).
- **Acceptance criteria:**
  - Hide the tab (switch away) for ~10 s on the live build, return: the game is paused / the beat clock + timer did **not** advance, and there is no visual desync. Verify in-browser, not just by reading code.
  - An unhandled promise rejection is caught by the handler (don't let it surface raw to the console).
  - `npm test` still **21/21 green** (add a test if the pause logic is unit-testable without the DOM; don't force it if it isn't).
  - Non-visual change, so no style sign-off needed — but still verify by playing.

**Then: the 5th level (capstone) → makes it a 5-level game.**

- **What:** Author **one** new "capstone" level that *combines* 2–3 mechanics already taught individually (e.g. moving platform + collapsing fallers + a ±1 climb chain) into a satisfying finale. This is also intended to be the level the owner records for the portfolio clip, so favor visual variety.
- **Plan-first:** Because this is visual/level-design, **propose the layout to the owner first** (describe the mechanic mix + rough shape, or a quick sketch of the tile plan) and get sign-off **before** building. Do not author the level unprompted.
- **Acceptance criteria:**
  - New `levels/level5.json` (or matching convention) registered in `levels/registry.js`; auto-advance becomes **1 → 2 → 3 → 4 → 5 → 1**.
  - The level is **verified solvable** via a full playthrough to its goal in-browser.
  - Combines **≥ 2** mechanics.
  - Levels 1–4 still play identically; `npm test` still green (+ loader test for level 5 if applicable).

**Optional (cheap, owner's call): a "completed all 5" beat** shown after the level-5 win before the loop restarts. Nice closure; the clean loop is fine without it. Only do it if the owner wants it — confirm, don't assume.

**Then: STOP.** Once the above is merged and live, the project is concluded. Do not start anything from the cut list in Section 2.

- **Open questions still pending (don't assume — these are pre-existing, from `PROGRESS`):** expose flat-roll speed in the tuning panel? keep the amber tint on faller tiles? when to introduce TypeScript? when to flip to an open-source license? None of these block the wrap-up.

---

## 5. Working agreements & preferences

Already in `CLAUDE.md` — do not restate. The only points worth re-surfacing for this stretch: **plan-before-visual + sign-off** (applies to the capstone level), **verify by playing not compiling**, **no new dependencies**, and **resist the cut list** — the whole point of this handoff is to stop, not to keep building.

---

## 6. References (don't duplicate — link out)

- `CLAUDE.md` — repo-root bootstrap + conventions (authoritative for rules).
- `PROGRESS_for_claude.md` (2026-06-24) — current-state map, file inventory, verified-working list.
- `HANDOFF_edge.md` — original rationale + full decision log.
- `CHANGELOG.md` — per-change detail.
- Live build: https://satejp10.github.io/EDGE/

---

## Resume prompt — paste this into a fresh Claude Code session

```
Read HANDOFF_edge_wrapup.md in this repo in full, then CLAUDE.md and
PROGRESS_for_claude.md. Run the Section 0 audit — open the files those docs list,
verify the stack, run npm test and the build, check git status/branch/log — and
confirm the tab-hidden timer bug still reproduces. Report any drift between the docs
and reality as "Doc says X; reality is Y." Treat the docs as context to verify, not
fact. This project is being CONCLUDED: the only work is the Section 4 robustness PR,
then one capstone 5th level (plan it and get my sign-off before building), then stop —
do not touch the cut list in Section 2. Report your audit and wait for my go-ahead
before making any changes.
```

---

## Audit addendum (2026-06-24, Claude Code — verified against the code)

The Section 0 audit was run. Result: stack, tests (21/21), and build all confirmed; 4
levels present, no `visibilitychange`/`unhandledrejection` handlers. **One correction to
Section 3's "one known real bug":**

- **Doc says** the beat clock + timer *keep running* while the tab is hidden and the
  state *desyncs*. **Reality:** they **freeze**. `requestAnimationFrame` is suspended in
  background tabs, so the sim stops, and the fixed-timestep stepper already clamps the
  return hitch to 50 ms (`maxFrame = 0.05` in `engine/loop.js`) — so there is **no
  desync and no runaway timer**. The only genuine gap was UX: the game silently resumed
  on return instead of showing the PAUSE overlay.
- The robustness PR was therefore shipped as **polish, not a desync fix**:
  auto-pause-on-hidden (`visibilitychange` → `togglePause` in `main.js`) so the player
  returns to a paused frame, plus the `unhandledrejection` handler in `index.html`.

Everything else in this handoff stands. Next up per Section 4: the capstone 5th level
(plan-first, sign-off before building).
